import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

let canvas = document.querySelector('#dice-webgl');
const tray = canvas?.closest('.dice-tray');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const GRAVITY = -5.8;
const FLOOR_Y = -0.82;
const DIE_HALF_EXTENT = 0.71;

const PIP_LAYOUTS = {
  1: [[0, 0]],
  2: [[-1, 1], [1, -1]],
  3: [[-1, 1], [0, 0], [1, -1]],
  4: [[-1, 1], [1, 1], [-1, -1], [1, -1]],
  5: [[-1, 1], [1, 1], [0, 0], [-1, -1], [1, -1]],
  6: [[-1, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [1, -1]],
};

const FACE_LAYOUT = [
  { value: 1, normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], rotation: [0, 0, 0] },
  { value: 6, normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0], rotation: [0, Math.PI, 0] },
  { value: 3, normal: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0], rotation: [0, Math.PI / 2, 0] },
  { value: 4, normal: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], rotation: [0, -Math.PI / 2, 0] },
  { value: 2, normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1], rotation: [-Math.PI / 2, 0, 0] },
  { value: 5, normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1], rotation: [Math.PI / 2, 0, 0] },
];

const TOP_ROTATIONS = {
  1: new THREE.Euler(-Math.PI / 2, 0, 0),
  2: new THREE.Euler(0, 0, 0),
  3: new THREE.Euler(0, 0, Math.PI / 2),
  4: new THREE.Euler(0, 0, -Math.PI / 2),
  5: new THREE.Euler(Math.PI, 0, 0),
  6: new THREE.Euler(Math.PI / 2, 0, 0),
};

let renderer;
let scene;
let camera;
let dice = [];
let animationFrame;
let resolveActiveRoll;

function createRoundedDie() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(1.42, 1.42, 1.42, 8, 0.26),
    new THREE.MeshStandardMaterial({ color: 0xf2efe5, roughness: 0.46, metalness: 0.01 }),
  );
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const pipWellGeometry = new THREE.CircleGeometry(0.119, 28);
  const pipWellMaterial = new THREE.MeshBasicMaterial({ color: 0x55534d, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
  const pipGeometry = new THREE.CircleGeometry(0.091, 28);
  const pipMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.82, side: THREE.DoubleSide });
  const half = 0.713;
  const spacing = 0.285;
  FACE_LAYOUT.forEach((face) => {
    PIP_LAYOUTS[face.value].forEach(([column, row]) => {
      const positionOnFace = (offset) => [
        face.normal[0] * offset + face.u[0] * column * spacing + face.v[0] * row * spacing,
        face.normal[1] * offset + face.u[1] * column * spacing + face.v[1] * row * spacing,
        face.normal[2] * offset + face.u[2] * column * spacing + face.v[2] * row * spacing,
      ];
      const pipWell = new THREE.Mesh(pipWellGeometry, pipWellMaterial);
      pipWell.position.set(...positionOnFace(half));
      pipWell.rotation.set(...face.rotation);
      pipWell.renderOrder = 1;
      group.add(pipWell);
      const pip = new THREE.Mesh(pipGeometry, pipMaterial);
      pip.position.set(...positionOnFace(half + 0.003));
      pip.rotation.set(...face.rotation);
      pip.renderOrder = 2;
      group.add(pip);
    });
  });
  return group;
}

function finalQuaternion(value, yaw = 0) {
  const target = new THREE.Quaternion().setFromEuler(TOP_ROTATIONS[value] || TOP_ROTATIONS[1]);
  const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  return turn.multiply(target);
}

function responsiveDiceScale() {
  if (window.innerWidth <= 720) return 0.41;
  if (window.innerWidth <= 1024) return 0.5;
  return 0.6;
}

function restingY() {
  return FLOOR_Y + (DIE_HALF_EXTENT * responsiveDiceScale());
}

function cubeSupportHeight(quaternion) {
  const halfExtent = DIE_HALF_EXTENT * responsiveDiceScale();
  const axes = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
  ];
  return axes.reduce((height, axis) => {
    axis.applyQuaternion(quaternion);
    return height + (Math.abs(axis.y) * halfExtent);
  }, 0);
}

function orientedSupportRadius(quaternion, direction) {
  const halfExtent = DIE_HALF_EXTENT * responsiveDiceScale();
  const axes = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
  ];
  return axes.reduce((radius, axis) => {
    axis.applyQuaternion(quaternion);
    return radius + (Math.abs(axis.dot(direction)) * halfExtent);
  }, 0);
}

function seededVariation(seed) {
  const raw = Math.sin(seed * 12.9898) * 43758.5453;
  return ((raw - Math.floor(raw)) * 2) - 1;
}

function createContactShadow() {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 32),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = FLOOR_Y + 0.008;
  shadow.renderOrder = 1;
  return shadow;
}

function updateContactShadow(die, height) {
  const shadow = die.userData.contactShadow;
  if (!shadow) return;
  const airHeight = Math.max(0, height - restingY());
  const proximity = 1 - THREE.MathUtils.clamp(airHeight / 1.15, 0, 1);
  shadow.position.x = die.position.x;
  shadow.position.z = die.position.z;
  shadow.material.opacity = 0.07 + (proximity * 0.21);
  shadow.scale.setScalar((0.72 + (airHeight * 0.48)) * responsiveDiceScale());
}

function createRigidBody(index, quaternion, variation = 0) {
  const floorY = restingY();
  const body = {
    position: new THREE.Vector3(index ? 0.76 : -0.76, floorY + (index ? 0.62 : 0.48), index ? -0.04 : 0.04),
    velocity: new THREE.Vector3(index ? -1.12 : 1.28, index ? 1.55 : 1.35, index ? 0.09 : -0.08),
    angularVelocity: new THREE.Vector3(index ? -8.2 : 7.4, index ? 6.8 : -7.6, index ? -5.7 : 6.1),
    quaternion: quaternion.clone(),
  };
  body.velocity.x *= 1 + (variation * 0.08);
  body.velocity.y *= 1 - (variation * 0.06);
  body.velocity.z += variation * 0.14;
  body.angularVelocity.multiplyScalar(1 + (variation * 0.12));
  return body;
}

function integrateRigidBody(body, delta, floorY) {
  body.velocity.y += GRAVITY * delta;
  body.position.addScaledVector(body.velocity, delta);
  const angularSpeed = body.angularVelocity.length();
  if (angularSpeed > 0.001) {
    const rotation = new THREE.Quaternion().setFromAxisAngle(
      body.angularVelocity.clone().normalize(),
      angularSpeed * delta,
    );
    body.quaternion.premultiply(rotation).normalize();
  }
  const contactY = FLOOR_Y + cubeSupportHeight(body.quaternion);
  if (body.position.y <= contactY) {
    body.position.y = contactY;
    if (body.velocity.y < -0.18) body.velocity.y *= -0.34;
    else body.velocity.y = 0;
    body.velocity.x *= Math.pow(0.18, delta);
    body.velocity.z *= Math.pow(0.18, delta);
    body.angularVelocity.multiplyScalar(Math.pow(0.13, delta));
  }
}

function resolveDiceCollision(bodies) {
  const offset = bodies[1].position.clone().sub(bodies[0].position);
  offset.y = 0;
  const distance = offset.length();
  if (!distance) return;
  const normal = offset.multiplyScalar(1 / distance);
  const firstRadius = orientedSupportRadius(bodies[0].quaternion, normal);
  const secondRadius = orientedSupportRadius(bodies[1].quaternion, normal);
  const minimumDistance = firstRadius + secondRadius;
  if (distance >= minimumDistance) return;
  const overlap = minimumDistance - distance;
  bodies[0].position.addScaledVector(normal, -overlap / 2);
  bodies[1].position.addScaledVector(normal, overlap / 2);
  const relativeSpeed = bodies[1].velocity.clone().sub(bodies[0].velocity).dot(normal);
  if (relativeSpeed >= 0) return;
  const impulse = -(1.34 * relativeSpeed) / 2;
  bodies[0].velocity.addScaledVector(normal, -impulse);
  bodies[1].velocity.addScaledVector(normal, impulse);
  bodies[0].angularVelocity.z -= impulse * 1.8;
  bodies[1].angularVelocity.z += impulse * 1.8;
}

function resize() {
  if (!renderer || !canvas) return;
  const width = Math.max(1, canvas.clientWidth);
  const height = Math.max(1, canvas.clientHeight);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  dice.forEach((die) => {
    die.scale.setScalar(responsiveDiceScale());
    updateContactShadow(die, die.position.y);
  });
  renderer.render(scene, camera);
}

function setValues(values = [1, 1]) {
  dice.forEach((die, index) => {
    die.position.set(index ? 0.72 : -0.72, restingY(), index ? -0.06 : 0.06);
    die.quaternion.copy(finalQuaternion(values[index], index ? 0.23 : -0.23));
    die.scale.setScalar(responsiveDiceScale());
    updateContactShadow(die, die.position.y);
  });
  renderer?.render(scene, camera);
}

function roll(finalValues = [1, 1]) {
  if (!renderer || !dice.length || prefersReducedMotion.matches) {
    setValues(finalValues);
    return Promise.resolve();
  }
  cancelAnimationFrame(animationFrame);
  resolveActiveRoll?.();
  const settleTimes = [1040, 1180];
  const duration = Math.max(...settleTimes);
  const startedAt = performance.now();
  const targets = finalValues.map((value, index) => finalQuaternion(value, index ? 0.23 : -0.23));
  const variationSeed = finalValues[0] * 17 + finalValues[1] * 31;
  const bodies = dice.map((die, index) => {
    const variation = seededVariation(variationSeed + (index * 13));
    return createRigidBody(index, die.quaternion, variation);
  });
  let previousFrame = startedAt;

  return new Promise((resolve) => {
    resolveActiveRoll = resolve;
    const animate = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const delta = Math.min(0.032, Math.max(0.001, (now - previousFrame) / 1000));
      previousFrame = now;
      bodies.forEach((body) => integrateRigidBody(body, delta, restingY()));
      resolveDiceCollision(bodies);
      dice.forEach((die, index) => {
        const dieProgress = Math.min(1, (now - startedAt) / settleTimes[index]);
        const settleBlend = THREE.MathUtils.smoothstep(dieProgress, 0.82, 1);
        const correctionRate = 1 - Math.exp(-delta * 18 * settleBlend);
        die.position.copy(bodies[index].position);
        die.position.x = THREE.MathUtils.lerp(die.position.x, index ? 0.72 : -0.72, settleBlend);
        die.position.y = THREE.MathUtils.lerp(die.position.y, restingY(), settleBlend);
        die.position.z = THREE.MathUtils.lerp(die.position.z, index ? -0.06 : 0.06, settleBlend);
        bodies[index].quaternion.slerp(targets[index], correctionRate);
        bodies[index].angularVelocity.multiplyScalar(1 - (correctionRate * 0.65));
        die.quaternion.copy(bodies[index].quaternion);
        die.scale.setScalar(responsiveDiceScale());
        updateContactShadow(die, die.position.y);
      });
      renderer.render(scene, camera);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      setValues(finalValues);
      resolveActiveRoll = null;
      resolve();
    };
    animationFrame = requestAnimationFrame(animate);
  });
}

function initialize() {
  if (!canvas) return false;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.domElement.id = 'dice-webgl';
    renderer.domElement.className = 'dice-webgl';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    canvas.replaceWith(renderer.domElement);
    canvas = renderer.domElement;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 5.1, 10.8);
    camera.lookAt(0, 0.05, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x13243a, 2.4));
    const keyLight = new THREE.DirectionalLight(0xfff3d4, 5.2);
    keyLight.position.set(-3, 7, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x58d8ff, 2.1);
    rimLight.position.set(5, 2, -4);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 3.8),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.36 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y;
    floor.receiveShadow = true;
    scene.add(floor);

    dice = [createRoundedDie(), createRoundedDie()];
    dice.forEach((die) => {
      const contactShadow = createContactShadow();
      die.userData.contactShadow = contactShadow;
      scene.add(contactShadow);
      scene.add(die);
    });
    resize();
    setValues([1, 1]);
    tray?.classList.add('is-webgl-ready');
    window.addEventListener('resize', resize, { passive: true });
    return true;
  } catch (error) {
    console.warn('WebGL dice unavailable; using CSS dice.', error);
    return false;
  }
}

const isReady = initialize();
window.Dice3D = { isReady: () => isReady, setValues, roll, resize };
