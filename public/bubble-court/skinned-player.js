import * as T from '../vendor/three.module.min.js';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';

const UP=new T.Vector3(0,1,0),X=new T.Vector3(1,0,0),Z=new T.Vector3(0,0,1);
const point=(x,y,z)=>new T.Vector3(x,y,z);
const ease=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
function travel(keys,t){let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],prev=keys[Math.max(0,i-1)],next=keys[Math.min(keys.length-1,i+2)],d=b[0]-a[0],u=Math.max(0,Math.min(1,(t-a[0])/d)),m0=i===0?0:(b[1]-prev[1])/(b[0]-prev[0]),m1=i===keys.length-2?0:(next[1]-a[1])/(next[0]-a[0]);return (2*u*u*u-3*u*u+1)*a[1]+(u*u*u-2*u*u+u)*d*m0+(-2*u*u*u+3*u*u)*b[1]+(u*u*u-u*u)*d*m1;}
function curve(keys,t){let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=ease((t-a[0])/(b[0]-a[0]));return a[1]+(b[1]-a[1])*u;}
const rootX=[[0,-1.9],[.09,-1.18],[.19,-.25],[.26,.35],[.34,.55],[.48,1.28],[.60,1.62],[.72,1.65],[.86,1.62],[1,1.67]];
const hipY=[[0,1.0],[.09,.88],[.19,.90],[.26,.87],[.34,.76],[.39,1.05],[.48,1.83],[.55,2.06],[.6,2.0],[.69,1.78],[.79,1.26],[.86,.88],[.90,.77],[1,1.01]];
const gripOffset=point(0,.136,0),gripOrientation=new T.Quaternion().setFromAxisAngle(Z,-Math.atan2(.08,.11));

/** World-space fixed-length two-bone IK. Only quaternion channels are changed. */
function setWorldQuaternion(bone,q){const parent=bone.parent.getWorldQuaternion(new T.Quaternion()).invert();bone.quaternion.copy(parent.multiply(q));bone.updateMatrixWorld(true);}
function aimBone(bone,child,target){const from=bone.getWorldPosition(new T.Vector3()),now=child.getWorldPosition(new T.Vector3()).sub(from).normalize(),wanted=target.clone().sub(from).normalize();const delta=new T.Quaternion().setFromUnitVectors(now,wanted);setWorldQuaternion(bone,delta.multiply(bone.getWorldQuaternion(new T.Quaternion())));}
function solveChain(a,b,c,target,pole){const start=a.getWorldPosition(new T.Vector3()),mid=b.getWorldPosition(new T.Vector3()),end=c.getWorldPosition(new T.Vector3()),l1=start.distanceTo(mid),l2=mid.distanceTo(end);const direction=target.clone().sub(start),distance=Math.max(Math.abs(l1-l2)+.001,Math.min(l1+l2-.001,direction.length()));direction.normalize();const bend=pole.clone().sub(direction.clone().multiplyScalar(pole.dot(direction))).normalize(),along=(l1*l1-l2*l2+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,l1*l1-along*along));const elbow=start.clone().addScaledVector(direction,along).addScaledVector(bend,height),goal=start.clone().addScaledVector(direction,distance);aimBone(a,b,elbow);aimBone(b,c,goal);}

function footTargets(t,x,y){
 const airRight=point(x-.42,y-.86,.14),airLeft=point(x+.11,y-.66,-.14);
 let right;
 if(t<=.07)right=point(-1.72,.1,.14);
 else if(t<.22){const u=(t-.07)/.15;right=point(-1.72+2.07*ease(u),.1+Math.sin(Math.PI*u)*.38,.14);}
 else if(t<=.36)right=point(.35,.1,.14);
 else if(t<.44)right=point(.35,.1,.14).lerp(airRight,ease((t-.36)/.08));
 else if(t<.77)right=airRight;
 else if(t<.84)right=airRight.lerp(point(1.48,.1,.14),ease((t-.77)/.07));
 else right=point(1.48,.1,.14);
 let left;
 if(t<.09){const u=t/.09;left=point(-2.05+1.33*ease(u),.1+Math.sin(Math.PI*u)*.35,-.14);}
 else if(t<=.19)left=point(-.72,.1,-.14);
 else if(t<.40){const u=ease((t-.19)/.21);left=point(-.72,.1,-.14).lerp(airLeft,u);left.y+=Math.sin(Math.PI*u)*.20;}
 else if(t<.79)left=airLeft;
 else if(t<.87)left=airLeft.lerp(point(1.94,.1,-.14),ease((t-.79)/.08));
 else left=point(1.94,.1,-.14);
 return {right,left};
}
function handTarget(t,x,y){const keys=[
 [0,x+.35,y+.28],[.22,x+.40,y+.34],[.34,x+.33,y+.38],[.44,x-.12,y+1.00],[.52,x+.10,y+1.05],[.60,2.02,2.94],[.67,2.02,2.94],[.74,x+.34,y+.75],[.86,x+.42,y+.35],[1,x+.35,y+.28]
 ];let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=ease((t-a[0])/(b[0]-a[0]));return point(a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,.35);}

/** Genuine continuous CC0 skin; original dunk is baked to quaternion tracks on its real skeleton. */
export function createSkinnedPlayer(model){
 const root=new T.Group();root.name='AthleteRoot';model.scale.setScalar(1.12);root.add(model);root.updateMatrixWorld(true);
 const bones=[],rig={};model.traverse(n=>{if(n.isBone){bones.push(n);rig[n.name]=n;}});if(!rig.hand_r||!rig.foot_r)throw new Error('Unsupported humanoid rig');
 const owned=new Set(),skeletons=new Set();const skin=new T.Color('#a76b49'),jersey=new T.Color('#0899b4'),navy=new T.Color('#102d48'),white=new T.Color('#e7e9d9'),trim=new T.Color('#ffb758');
 model.traverse(o=>{if(!o.isMesh)return;if(o.isSkinnedMesh)skeletons.add(o.skeleton);o.frustumCulled=false;owned.add(o.geometry);if(o.material)owned.add(o.material);
  const material=new T.MeshStandardMaterial({color:o.name==='Eyebrows'?'#1b2027':o.name==='Eyes'?'#f0e8d7':'#ffffff',roughness:.82,metalness:0,side:T.FrontSide});owned.add(material);o.material=material;
  if(o.name==='SuperHero_Male'){const position=o.geometry.attributes.position,colors=new Float32Array(position.count*3);for(let i=0;i<position.count;i++){const x=position.getX(i),y=position.getY(i);let c=skin;if(y<.12)c=navy;else if(y<.23)c=white;else if(y>.67&&y<1.00)c=navy;else if(y>=1.00&&y<1.48&&Math.abs(x)<.285)c=Math.abs(x)>.235?trim:jersey;colors.set(c.toArray(),i*3);}o.geometry.setAttribute('color',new T.BufferAttribute(colors,3));material.vertexColors=true;}
 });
 function attach(node,bone,position){root.add(node);node.position.copy(position);node.updateMatrixWorld(true);bone.attach(node);}
 function accessory(geometry,color,bone,position){const material=new T.MeshStandardMaterial({color,roughness:.85});owned.add(geometry);owned.add(material);const node=new T.Mesh(geometry,material);attach(node,bone,position);return node;}
 const head=rig.Head.getWorldPosition(new T.Vector3());accessory(new T.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI*.55),'#17212a',rig.Head,head.clone().add(point(0,.16,-.015))).scale.multiply(point(.123,.10,.13));
 for(const side of ['r','l']){const foot=rig['foot_'+side],pos=foot.getWorldPosition(new T.Vector3());accessory(new RoundedBoxGeometry(.19,.12,.34,2,.035),'#e4e8de',foot,pos.clone().add(point(0,-.035,.075)));accessory(new RoundedBoxGeometry(.20,.03,.35,1,.012),'#153a50',foot,pos.clone().add(point(0,-.081,.075)));accessory(new T.BoxGeometry(.201,.027,.13),'#ffad49',foot,pos.clone().add(point(0,-.025,.075)));}
 for(const x of [-.035,.035])accessory(new T.SphereGeometry(.014,8,6),'#12212c',rig.Head,point(x,1.904,.093));
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#fff4d8';c.font='900 84px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('07',64,68);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;owned.add(texture);const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});owned.add(material);const geometry=new T.PlaneGeometry(.22,.22);owned.add(geometry);attach(new T.Mesh(geometry,material),rig.spine_03,point(0,1.49,.174));
 }
 root.updateMatrixWorld(true);
 const rests=bones.map(b=>({bone:b,q:b.quaternion.clone()})),footOrientation={r:rig.foot_r.getWorldQuaternion(new T.Quaternion()),l:rig.foot_l.getWorldQuaternion(new T.Quaternion())},restHip=rig.pelvis.getWorldPosition(new T.Vector3()).y;
 const worldDelta=(bone,axis,angle)=>{const q=bone.getWorldQuaternion(new T.Quaternion());setWorldQuaternion(bone,new T.Quaternion().setFromAxisAngle(axis,angle).multiply(q));};
 function author(t){rests.forEach(r=>r.bone.quaternion.copy(r.q));const x=travel(rootX,t),y=curve(hipY,t),yaw=Math.PI/2+curve([[0,-.12],[.34,-.17],[.48,-.30],[.60,.06],[1,0]],t);root.position.set(x,y-restHip,0);root.quaternion.setFromAxisAngle(UP,yaw);root.updateMatrixWorld(true);
  const lean=curve([[0,-.08],[.22,-.16],[.34,-.22],[.48,.04],[.6,-.08],[.85,-.18],[1,-.03]],t);worldDelta(rig.pelvis,Z,lean);worldDelta(rig.spine_03,UP,curve([[0,0],[.34,-.18],[.48,-.35],[.6,.12],[1,0]],t));
  const feet=footTargets(t,x,y);solveChain(rig.thigh_r,rig.calf_r,rig.foot_r,feet.right,point(1,0,0));solveChain(rig.thigh_l,rig.calf_l,rig.foot_l,feet.left,point(1,0,0));
  for(const side of ['r','l']){const q=new T.Quaternion().setFromAxisAngle(UP,yaw).multiply(footOrientation[side]);if(t>.37&&t<.8)q.premultiply(new T.Quaternion().setFromAxisAngle(Z,-Math.sin((t-.37)/.43*Math.PI)*.20));setWorldQuaternion(rig['foot_'+side],q);}
  solveChain(rig.upperarm_r,rig.lowerarm_r,rig.hand_r,handTarget(t,x,y),point(-.5,0,1));setWorldQuaternion(rig.hand_r,gripOrientation);
  let left=t<.34?point(x+.28,y+.36,-.02):point(x-.35,y+.15,-.22);if(t>.8)left=point(x+.18,y+.23,-.22);solveChain(rig.upperarm_l,rig.lowerarm_l,rig.hand_l,left,point(-.5,0,-1));
  for(const bone of bones){if(/^(index|middle|ring|pinky)_0[123]_r$/.test(bone.name))bone.quaternion.multiply(new T.Quaternion().setFromAxisAngle(X,t<.62?.48:.15));}
  root.updateMatrixWorld(true);
 }
 const samples=121,times=[],positions=[],orientations=[],values=bones.map(()=>[]);for(let i=0;i<samples;i++){const t=i/(samples-1);author(t);times.push(t);positions.push(...root.position.toArray());orientations.push(...root.quaternion.toArray());bones.forEach((b,j)=>values[j].push(...b.quaternion.toArray()));}
 const tracks=[new T.VectorKeyframeTrack('AthleteRoot.position',times,positions),new T.QuaternionKeyframeTrack('AthleteRoot.quaternion',times,orientations),...bones.map((b,i)=>new T.QuaternionKeyframeTrack(`${b.name}.quaternion`,times,values[i]))];
 const clip=new T.AnimationClip('Hoopire_SingleHandDunk',1,tracks),mixer=new T.AnimationMixer(root),action=mixer.clipAction(clip);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;
 function sample(t){action.reset().play();mixer.setTime(Math.max(0,Math.min(1,t)));root.updateMatrixWorld(true);}
 const getGrip=()=>rig.hand_r.localToWorld(gripOffset.clone());sample(.6);const release=getGrip();sample(0);
 function ballAt(t){if(t<=.6)return getGrip();const u=Math.min(1,(t-.6)/.4),fall=ease(u);return release.clone().add(point(.38*fall,-2.85*fall,.18*fall));}
 return {root,bones,rig,clip,mixer,sample,getGrip,ballAt,dispose(){mixer.stopAllAction();mixer.uncacheRoot(root);for(const skeleton of skeletons)skeleton.dispose();for(const r of owned)r.dispose();root.removeFromParent();}};
}
export async function loadSkinnedPlayer({timeout=10000,fetcher=fetch}={}){
 const controller=new AbortController();let timer;
 const expired=new Promise((_resolve,reject)=>{timer=setTimeout(()=>{const error=new DOMException('Player model load timed out','TimeoutError');controller.abort(error);reject(error);},timeout);});
 const work=(async()=>{const {GLTFLoader}=await import('../vendor/loaders/GLTFLoader.js');if(controller.signal.aborted)throw controller.signal.reason;const url=new URL('./assets/player-base.glb',import.meta.url);const response=await fetcher(url.href,{signal:controller.signal});if(!response.ok)throw new Error('Player model unavailable');const bytes=await response.arrayBuffer(),gltf=await new GLTFLoader().parseAsync(bytes,new URL('./assets/',import.meta.url).href);if(controller.signal.aborted)throw controller.signal.reason;return createSkinnedPlayer(gltf.scene);})();
 try{return await Promise.race([work,expired]);}finally{clearTimeout(timer);}
}
