import * as T from '../../vendor/three.module.min.js';
import {LAB} from './Constants.js';
const V=(x,y,z)=>new T.Vector3(x,y,z),Y=V(0,1,0),Z=V(0,0,1);
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
/** Shape-preserving Hermite keys: continuous velocity without sliding a held contact. */
export function key(keys,t){
 if(t<=keys[0][0])return keys[0][1];if(t>=keys.at(-1)[0])return keys.at(-1)[1];
 let i=0;while(t>keys[i+1][0])i++;const [ta,a]=keys[i],[tb,b]=keys[i+1],dt=tb-ta,u=(t-ta)/dt;
 const slope=j=>{if(j===0||j===keys.length-1)return 0;const p=keys[j-1],c=keys[j],n=keys[j+1],h0=c[0]-p[0],h1=n[0]-c[0],d0=(c[1]-p[1])/h0,d1=(n[1]-c[1])/h1;if(d0*d1<=0)return 0;const w0=2*h1+h0,w1=h1+2*h0;return (w0+w1)/(w0/d0+w1/d1);};
 return (2*u*u*u-3*u*u+1)*a+(u*u*u-2*u*u+u)*dt*slope(i)+(-2*u*u*u+3*u*u)*b+(u*u*u-u*u)*dt*slope(i+1);
}
const vectorKey=(keys,t)=>V(...[1,2,3].map(axis=>key(keys.map(k=>[k[0],k[axis]]),t)));
function worldQ(bone,q){bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));bone.updateMatrixWorld(true);}
function turn(bone,axis,angle){worldQ(bone,new T.Quaternion().setFromAxisAngle(axis,angle).multiply(bone.getWorldQuaternion(new T.Quaternion())));}
function aim(bone,child,target){const p=bone.getWorldPosition(V()),d=child.getWorldPosition(V()).sub(p).normalize(),want=target.clone().sub(p).normalize();worldQ(bone,new T.Quaternion().setFromUnitVectors(d,want).multiply(bone.getWorldQuaternion(new T.Quaternion())));}
/** Fixed-length analytic IK. Joint offsets and scales never change. */
function chain(a,b,c,target,pole){
 const start=a.getWorldPosition(V()),mid=b.getWorldPosition(V()),end=c.getWorldPosition(V()),l0=start.distanceTo(mid),l1=mid.distanceTo(end),d=target.clone().sub(start),dist=Math.max(Math.abs(l0-l1)+.001,Math.min(l0+l1-.002,d.length()));d.normalize();
 const bend=pole.clone().addScaledVector(d,-pole.dot(d));if(bend.lengthSq()<1e-8)bend.copy(V(0,0,1)).addScaledVector(d,-d.z);bend.normalize();const along=(l0*l0-l1*l1+dist*dist)/(2*dist),height=Math.sqrt(Math.max(0,l0*l0-along*along));aim(a,b,start.clone().addScaledVector(d,along).addScaledVector(bend,height));aim(b,c,start.clone().addScaledVector(d,dist));
}
function placeHip(actor,target){actor.root.updateMatrixWorld(true);actor.root.position.add(target.clone().sub(actor.rig.pelvis.getWorldPosition(V())));actor.root.updateMatrixWorld(true);}
function foot(actor,side,target,rest,yaw,knee){chain(actor.rig['thigh_'+side],actor.rig['calf_'+side],actor.rig['foot_'+side],target,knee);worldQ(actor.rig['foot_'+side],new T.Quaternion().setFromAxisAngle(Y,yaw).multiply(rest[side]));}
function arm(actor,side,target,pole){chain(actor.rig['upperarm_'+side],actor.rig['lowerarm_'+side],actor.rig['hand_'+side],target,pole);}
function palmQ(side){const forward=V(.98,0,side==='r'?-.20:.20).normalize(),normal=Y.clone(),right=forward.clone().cross(normal);return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(right,forward,normal));}
function contactHand(actor,side,palm){const q=palmQ(side),wrist=palm.clone().sub(V(...LAB.palm).multiply(actor.rig['hand_'+side].getWorldScale(V())).applyQuaternion(q));arm(actor,side,wrist,V(1,.05,side==='r'?-.35:.35));worldQ(actor.rig['hand_'+side],q);}
const hipKeys=[[0,1.37,.99,1.04],[.22,1.39,.94,1.02],[.30,1.41,.84,1.00],[.40,1.50,1.32,.92],[.46,1.64,1.48,.96],[.51,1.77,1.24,1.02],[.56,1.88,1.02,1.09],[.60,2.02,.87,1.15],[.65,2.20,.96,1.23],[.71,2.46,.85,1.28],[.77,2.69,.63,1.31],[.82,2.83,.40,1.31],[.87,2.92,.265,1.31],[.92,2.94,.215,1.31],[1,2.94,.215,1.31]];
const rightFeet=[[0,1.23,.115,.88],[.30,1.23,.115,.88],[.35,1.34,.28,.86],[.43,1.56,.58,.86],[.47,1.70,.58,.87],[.55,1.80,.115,.94],[.60,1.80,.115,.94],[.64,2.13,.30,1.00],[.68,2.58,.115,1.02],[.76,2.58,.115,1.02],[.88,2.56,.115,1.00],[1,2.56,.115,1.00]];
const leftFeet=[[0,1.54,.115,1.20],[.31,1.54,.115,1.20],[.37,1.50,.37,1.18],[.44,1.51,.65,1.20],[.49,1.71,.49,1.27],[.58,2.17,.115,1.34],[.70,2.17,.115,1.34],[.76,2.18,.20,1.48],[.80,2.18,.115,1.62],[1,2.18,.115,1.62]];
const leanKeys=[[0,.05],[.30,.16],[.42,.02],[.49,-.22],[.55,-.25],[.59,.10],[.65,-.04],[.71,-.20],[.77,-.36],[.82,-.70],[.87,-1.02],[.92,-1.08],[1,-1.08]];
const sourceKeys=[[0,0],[.12,.22],[.25,.44],[.38,.53],[.46,.6],[.50,.62],[.55,.67],[.65,.75],[.72,.83],[1,.83]];
const support={r:V(3.43,LAB.palmHeight,1.01),l:V(3.43,LAB.palmHeight,1.61)};
function neutralInfo(actor){actor.neutral();return {feet:Object.fromEntries(['r','l'].map(s=>[s,actor.rig['foot_'+s].getWorldQuaternion(new T.Quaternion())])),rest:actor.bones.map(b=>b.quaternion.clone())};}
function defend(actor,info,t){
 actor.neutral();const hip=vectorKey(hipKeys,t),yaw=-Math.PI/2+key([[0,0],[.48,-.06],[.65,.08],[.78,-.04],[1,0]],t),lean=key(leanKeys,t);actor.root.quaternion.setFromAxisAngle(Y,yaw);placeHip(actor,hip);
 // Pelvis, spine and gaze articulate independently; the scene root never tips over.
 for(const [name,weight] of [['pelvis',.20],['spine_01',.35],['spine_02',.30],['spine_03',.15]])turn(actor.rig[name],Z,lean*weight);
 turn(actor.rig.neck_01,Z,-lean*.22);turn(actor.rig.Head,Y,key([[0,0],[.43,-.12],[.55,.08],[1,0]],t));
 const sit=ease((t-.73)/.13),knee=V(-1+sit*.55,sit,0);foot(actor,'r',vectorKey(rightFeet,t),info.feet,yaw,knee);foot(actor,'l',vectorKey(leftFeet,t),info.feet,yaw,knee);
 const reach=ease((t-.26)/.15)*(1-ease((t-.47)/.12)),balance=ease((t-.51)/.09)*(1-ease((t-.76)/.09)),brace=ease((t-.75)/(LAB.supportEnd-.75));
 for(const [side,sign] of [['r',-1],['l',1]]){
  const free=V(hip.x-.30+brace*.45,hip.y+.32+reach*.64-brace*.20,hip.z+sign*(.26+balance*.21));
  if(side==='r'){free.x+=reach*.35;free.z-=reach*.10;}
  const hand=free.lerp(support[side],brace);contactHand(actor,side,hand);
 }
 actor.root.updateMatrixWorld(true);
}
function attack(actor,info,t){
 const source=key(sourceKeys,t);actor.sample(source);const feet=Object.fromEntries(['r','l'].map(s=>[s,actor.rig['foot_'+s].getWorldPosition(V())])),hip=actor.rig.pelvis.getWorldPosition(V());
 const settle=ease((t-.73)/.20),compression=key([[0,0],[.57,0],[.65,.12],[.72,.05],[.88,0],[1,0]],t);hip.y-=compression;hip.y+=(1.065-hip.y)*settle;placeHip(actor,hip);
 // The imported full-body motion supplies the approach; planted ankles absorb the landing.
 for(const side of ['r','l']){const f=feet[side];if(t>.59)f.y=Math.max(LAB.ankleHeight,f.y);chain(actor.rig['thigh_'+side],actor.rig['calf_'+side],actor.rig['foot_'+side],f,V(1,0,.06));if(t>.66)worldQ(actor.rig['foot_'+side],new T.Quaternion().setFromAxisAngle(Y,Math.PI/2).multiply(info.feet[side]));}
 if(t>=.72){
  for(const name of ['spine_01','spine_02','spine_03','neck_01','Head']){const i=actor.bones.indexOf(actor.rig[name]);actor.rig[name].quaternion.slerp(info.rest[i],settle*.75);}
  actor.root.updateMatrixWorld(true);
  for(const [side,sign] of [['r',1],['l',-1]]){const hand=actor.rig['hand_'+side].getWorldPosition(V()),relaxed=V(hip.x+.06,hip.y+.12,hip.z+sign*.29);arm(actor,side,hand.lerp(relaxed,settle),V(-.5,0,sign));}
 }
 // Keep wrist orientation/rim correction from the existing free adapted clip in flight.
 actor.root.updateMatrixWorld(true);
}
function bake(actor,author){
 const times=[],positions=[],orientations=[],values=actor.bones.map(()=>[]);
 for(let i=0;i<LAB.samples;i++){const t=i/(LAB.samples-1);author(t);times.push(t*LAB.duration);positions.push(...actor.root.position.toArray());orientations.push(...actor.root.quaternion.toArray());actor.bones.forEach((b,j)=>values[j].push(...b.quaternion.toArray()));}
 actor.mixer.stopAllAction();actor.neutral();
 return new T.AnimationClip('Hoopire_PairedStudy',LAB.duration,[new T.VectorKeyframeTrack('AthleteRoot.position',times,positions),new T.QuaternionKeyframeTrack('AthleteRoot.quaternion',times,orientations),...actor.bones.map((b,i)=>new T.QuaternionKeyframeTrack(`${b.name}.quaternion`,times,values[i]))]);
}
export function createPairedMotion(home){
 const away=home.rival;if(!away)throw new Error('Two independent athletes are required');
 const info=neutralInfo(home),other=neutralInfo(away);
 const dunkClip=bake(home,t=>attack(home,info,t)),reactClip=bake(away,t=>defend(away,other,t));
 const mixers=[home,away].map(actor=>new T.AnimationMixer(actor.root)),actions=mixers.map(mixer=>[mixer.clipAction(dunkClip),mixer.clipAction(reactClip)]);for(const pair of actions)for(const action of pair){action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;}
 let winner='home';
 function sample(t){t=clamp(t);[home,away].forEach((actor,i)=>{mixers[i].stopAllAction();const index=(winner==='home'?i:1-i);actions[i][index].reset().play();mixers[i].setTime(t*LAB.duration);actor.root.updateMatrixWorld(true);});}
 sample(.47);const release=home.getGrip();sample(0);
 function ballAt(t){
  const attacker=winner==='home'?home:away;if(t<=.47)return attacker.getGrip();
  if(t<.60){const u=clamp((t-.47)/.13);return release.clone().add(V(.18*u,-(release.y-.15)*u*u,.08*u));}
  if(t<.707){const u=(t-.60)/.107;return V(release.x+.18+.27*u,.15+4*.56*u*(1-u),release.z+.08+.07*u);}
  if(t<.76){const u=(t-.707)/.053;return V(release.x+.45+.18*u,.15+4*.15*u*(1-u),release.z+.15+.05*u);}
  const u=ease((t-.76)/.24);return V(release.x+.63+.32*u,.15,release.z+.20+.04*u);
 }

 return {sample,ballAt,support,dunkClip,reactClip,setWinner(value){winner=value==='away'?'away':'home';},get winner(){return winner;},dispose(){mixers.forEach((m,i)=>{m.stopAllAction();m.uncacheRoot([home,away][i].root);});}};
}
