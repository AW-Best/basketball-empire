import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

let canvas = document.querySelector('#dice-webgl');
const tray = canvas?.closest('.dice-tray');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
    new RoundedBoxGeometry(1.52, 1.52, 1.52, 6, 0.23),
    new THREE.MeshStandardMaterial({ color: 0xf5f2e9, roughness: 0.34, metalness: 0.02 }),
  );
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const pipGeometry = new THREE.CircleGeometry(0.105, 24);
  const pipMaterial = new THREE.MeshStandardMaterial({ color: 0x111319, roughness: 0.68, side: THREE.DoubleSide });
  const half = 0.767;
  const spacing = 0.31;
  FACE_LAYOUT.forEach((face) => {
    PIP_LAYOUTS[face.value].forEach(([column, row]) => {
      const pip = new THREE.Mesh(pipGeometry, pipMaterial);
      pip.position.set(
        face.normal[0] * half + face.u[0] * column * spacing + face.v[0] * row * spacing,
        face.normal[1] * half + face.u[1] * column * spacing + face.v[1] * row * spacing,
        face.normal[2] * half + face.u[2] * column * spacing + face.v[2] * row * spacing,
      );
      pip.rotation.set(...face.rotation);
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

function resize() {
  if (!renderer || !canvas) return;
  const width = Math.max(1, canvas.clientWidth);
  const height = Math.max(1, canvas.clientHeight);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function setValues(values = [1, 1]) {
  dice.forEach((die, index) => {
    die.position.set(index ? 1.02 : -1.02, -0.03, index ? -0.08 : 0.08);
    die.quaternion.copy(finalQuaternion(values[index], index ? 0.23 : -0.23));
    die.scale.setScalar(1);
  });
  renderer?.render(scene, camera);
}

function easeOutQuint(value) {
  return 1 - ((1 - value) ** 5);
}

function roll(finalValues = [1, 1]) {
  if (!renderer || !dice.length || prefersReducedMotion.matches) {
    setValues(finalValues);
    return Promise.resolve();
  }
  cancelAnimationFrame(animationFrame);
  resolveActiveRoll?.();
  const duration = 1120;
  const startedAt = performance.now();
  const starts = dice.map((die) => die.quaternion.clone());
  const targets = finalValues.map((value, index) => finalQuaternion(value, index ? 0.23 : -0.23));
  const spins = [
    new THREE.Vector3(4.1 * Math.PI, 5.2 * Math.PI, 3.2 * Math.PI),
    new THREE.Vector3(-4.8 * Math.PI, 4.4 * Math.PI, -3.6 * Math.PI),
  ];

  return new Promise((resolve) => {
    resolveActiveRoll = resolve;
    const animate = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeOutQuint(progress);
      dice.forEach((die, index) => {
        const flight = Math.sin(Math.PI * Math.min(1, progress * 1.18));
        const rebound = progress > 0.72 ? Math.sin((progress - 0.72) * Math.PI * 7) * (1 - progress) * 0.28 : 0;
        const travel = (index ? -0.16 : 0.16) * Math.sin(Math.PI * progress);
        die.position.set(index ? 1.02 + travel : -1.02 + travel, -0.03 + flight * 0.58 + Math.abs(rebound), index ? -0.08 : 0.08);
        const tumble = new THREE.Quaternion().setFromEuler(new THREE.Euler(
          spins[index].x * (1 - eased),
          spins[index].y * (1 - eased),
          spins[index].z * (1 - eased),
        ));
        die.quaternion.copy(starts[index]).multiply(tumble).slerp(targets[index], eased);
        const squash = 1 - Math.max(0, rebound) * 0.08;
        die.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
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
    camera.position.set(0, 4.8, 9.6);
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
    floor.position.y = -0.82;
    floor.receiveShadow = true;
    scene.add(floor);

    dice = [createRoundedDie(), createRoundedDie()];
    dice.forEach((die) => scene.add(die));
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
