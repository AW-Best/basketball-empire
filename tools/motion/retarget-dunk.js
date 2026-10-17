import * as T from '../../public/vendor/three.module.min.js';
const V=(x,y,z)=>new T.Vector3(x,y,z),UP=V(0,1,0),Z=V(0,0,1),smooth=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
const mapping={pelvis:'root',spine_01:'lowerback',spine_02:'upperback',spine_03:'thorax',neck_01:'lowerneck',Head:'head',clavicle_r:'rclavicle',upperarm_r:'rhumerus',lowerarm_r:'rradius',hand_r:'rwrist',clavicle_l:'lclavicle',upperarm_l:'lhumerus',lowerarm_l:'lradius',hand_l:'lwrist',thigh_r:'rfemur',calf_r:'rtibia',foot_r:'rfoot',thigh_l:'lfemur',calf_l:'ltibia',foot_l:'lfoot'};
const worldQ=b=>b.getWorldQuaternion(new T.Quaternion()),position=b=>b.getWorldPosition(new T.Vector3());
function setWorld(b,q){b.quaternion.copy(worldQ(b.parent).invert().multiply(q));b.updateMatrixWorld(true);}
function aim(a,b,target){const start=position(a),delta=new T.Quaternion().setFromUnitVectors(position(b).sub(start).normalize(),target.clone().sub(start).normalize());setWorld(a,delta.multiply(worldQ(a)));}
function ik(a,b,c,target,pole){const start=position(a),l1=start.distanceTo(position(b)),l2=position(b).distanceTo(position(c)),d=target.clone().sub(start),r=Math.max(Math.abs(l1-l2)+.001,Math.min(l1+l2-.001,d.length()));d.normalize();const bend=pole.clone().addScaledVector(d,-pole.dot(d)).normalize(),along=(l1*l1-l2*l2+r*r)/(2*r),height=Math.sqrt(Math.max(0,l1*l1-along*along));aim(a,b,start.clone().addScaledVector(d,along).addScaledVector(bend,height));aim(b,c,start.clone().addScaledVector(d,r));}
/** Offline retarget of CMU's full-body layup with rim-contact edits and a short return jog. */
export function bakeDunk(model,source){
 const root=new T.Group();root.name='AthleteRoot';model.scale.setScalar(1.12);root.add(model);root.updateMatrixWorld(true);const rig={},bones=[];model.traverse(b=>{if(b.isBone){rig[b.name]=b;bones.push(b);}});
 const rests=new Map(bones.map(b=>[b.name,{local:b.quaternion.clone(),world:worldQ(b)}])),restHip=position(rig.pelvis).y,first=source.sampleFrame(210),contact=source.sampleFrame(410),heightScale=restHip/first.root.position.y,grip=V(0,.136,0),gripQ=new T.Quaternion().setFromAxisAngle(Z,-Math.atan2(.08,.11));
 const phaseFrame=t=>t<=.6?210+(410-210)*t/.6:410+(530-410)*(t-.6)/.22;
 const stage=p=>V(1.62+(p.z-contact.root.position.z)*.92,p.y*heightScale,.12-(p.x-first.root.position.x)*heightScale);
 const start=stage(first.root.position);start.y-=restHip;
 let landing=null;
 function pose(t){for(const b of bones)b.quaternion.copy(rests.get(b.name).local);const returning=t>.82;let frame=returning?280+(t-.82)/.18*72:phaseFrame(t);const p=source.sampleFrame(frame),heading=new T.Quaternion().setFromAxisAngle(UP,returning?-Math.PI/2:Math.PI/2),base=stage(p.root.position),boost=returning?0:.30*Math.sin(Math.PI*smooth((t-.38)/.39));
  root.position.copy(base);root.position.y+=boost-restHip;root.quaternion.identity();root.updateMatrixWorld(true);
  for(const b of bones){const src=mapping[b.name];if(src&&p[src])setWorld(b,heading.clone().multiply(returning&&b.name==='pelvis'?new T.Quaternion():p[src].quaternion).multiply(rests.get(b.name).world));}
  if(returning){const u=smooth((t-.82)/.18),end=stage(source.sampleFrame(530).root.position);root.position.copy(end).lerp(start,u);root.position.y=end.y-restHip+(start.y-(end.y-restHip))*u;const running=smooth((t-.82)/.035)*(1-smooth((t-.96)/.04));root.position.y-=.14*running;root.position.y+=Math.sin(u*Math.PI*8)*.012*running;root.updateMatrixWorld(true);}
  // Place ankles from captured joints; contact correction does not change bind offsets.
  if(!returning){for(const side of['r','l']){const ankle=p[side+'tibia'].end,target=stage(ankle);target.y=Math.max(.097,target.y+boost);const pole=heading.clone();const kneeDirection=p[side+'femur'].end.clone().sub(p[side+'femur'].position).applyQuaternion(heading);kneeDirection.y=0;if(kneeDirection.lengthSq()<.01)kneeDirection.set(1,0,0);ik(rig['thigh_'+side],rig['calf_'+side],rig['foot_'+side],target,kneeDirection.normalize());}}
  const contactWeight=smooth((t-.39)/.15)*(1-smooth((t-.64)/.10));if(contactWeight>0&&!returning){const desired=position(rig.hand_r).lerp(V(2.02,2.94,.35),contactWeight);ik(rig.upperarm_r,rig.lowerarm_r,rig.hand_r,desired,V(-.3,0,1));setWorld(rig.hand_r,worldQ(rig.hand_r).slerp(gripQ,contactWeight));}
  for(const b of bones)if(/^(index|middle|ring|pinky)_0[123]_r$/.test(b.name))b.quaternion.multiply(new T.Quaternion().setFromAxisAngle(V(1,0,0),t<.61?.48:.14));
  root.updateMatrixWorld(true);
  if(!returning&&Math.abs(t-.82)<.0001)landing={p:root.position.clone(),q:new Map(bones.map(b=>[b.name,b.quaternion.clone()]))};
 }
 // First/last and the first return pose are explicitly blended to avoid world-space snaps.
 pose(0);const initial=new Map(bones.map(b=>[b.name,b.quaternion.clone()]));pose(.82);const endPose=landing;
 function author(t){pose(t);if(t>.82){const entering=1-smooth((t-.82)/.035),exiting=smooth((t-.96)/.04);for(const b of bones){if(entering>0)b.quaternion.slerp(endPose.q.get(b.name),entering);if(exiting>0)b.quaternion.slerp(initial.get(b.name),exiting);}if(t===1)root.position.copy(start);root.updateMatrixWorld(true);
   if(t>.82&&t<1){const end=stage(source.sampleFrame(530).root.position),distance=end.x-root.position.x,cycleLength=1.8;for(const[side,offset]of[['r',0],['l',.5]]){const cycle=distance/cycleLength+offset,k=Math.floor(cycle),f=cycle-k,plant=end.x-.45+offset*cycleLength-k*cycleLength,swing=smooth((f-.5)/.5),target=V(plant-cycleLength*swing,.097+Math.sin(swing*Math.PI)*.24,end.z+(start.z-end.z)*Math.max(0,Math.min(1,(k-offset+swing)*cycleLength/(end.x-start.x)))+(side==='r'?.14:-.14));const weight=smooth((t-.82)/.035)*(1-smooth((t-.94)/.06));target.copy(position(rig['foot_'+side]).lerp(target,weight));ik(rig['thigh_'+side],rig['calf_'+side],rig['foot_'+side],target,V(-1,0,0));setWorld(rig['foot_'+side],worldQ(rig['foot_'+side]).slerp(new T.Quaternion().setFromAxisAngle(UP,-Math.PI/2).multiply(rests.get('foot_'+side).world),weight));}root.updateMatrixWorld(true);}
  }}
 const count=241,times=[],positions=[],values=bones.map(()=>[]);for(let i=0;i<count;i++){const t=i/(count-1);author(t);times.push(t);positions.push(...root.position.toArray());bones.forEach((b,j)=>values[j].push(...b.quaternion.toArray()));}
 const tracks=[new T.VectorKeyframeTrack('AthleteRoot.position',times,positions),...bones.map((b,i)=>new T.QuaternionKeyframeTrack(`${b.name}.quaternion`,times,values[i]))],clip=new T.AnimationClip('Hoopire_CMU_Layup_Dunk',1,tracks),mixer=new T.AnimationMixer(root),action=mixer.clipAction(clip);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;
 function sample(t){action.reset().play();mixer.setTime(Math.max(0,Math.min(1,t)));root.updateMatrixWorld(true);}
 sample(0);return{clip,root,rig,sample,metadata:{source:'CMU 124_06 Basketball Lay Up',sourceFps:120,sourceFrames:[210,530],impact:.6,description:'Full-body layup mocap retargeted to Quaternius; adapted rim reach, jump height, ankle contacts and return jog.'}};
}
