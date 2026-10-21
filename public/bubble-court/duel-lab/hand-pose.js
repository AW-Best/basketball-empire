import {COMIC as C,HAND as H} from './Constants.js';

const clamp=t=>Math.max(0,Math.min(1,Number.isFinite(t)?t:0));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t)});
function channel(keys,t){let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1];return mix(a[1],b[1],smooth((t-a[0])/(b[0]-a[0])));}
export function handToWorld(point,rig){const c=Math.cos(rig.angle),s=Math.sin(rig.angle);return {x:rig.wrist.x+point.x*c-point.y*s,y:rig.wrist.y+point.x*s+point.y*c};}
export function handToLocal(point,rig){const x=point.x-rig.wrist.x,y=point.y-rig.wrist.y,c=Math.cos(rig.angle),s=Math.sin(rig.angle);return {x:x*c+y*s,y:-x*s+y*c};}

// Joint positions are local to one wrist pivot; world-space ring targets are
// transformed back into that frame, so curled fingers never slide off the rim.
export function sampleHandPose(progress,pose,reduced=false){
 const t=reduced?.65:clamp(progress),openProgress=smooth((t-H.openAt)/(H.openEnd-H.openAt));
 const forearmAngle=Math.atan2(pose.hand.x-pose.elbow.x,pose.elbow.y-pose.hand.y);
 const flex=channel([[0,-.12],[C.gatherEnd,-.18],[.32,-.12],[C.riseEnd,-.32],[C.gripStart,-.10],[C.impact,H.gripFlex],[H.openAt,H.gripFlex],[H.openEnd,-.05],[H.withdrawEnd,-.16],[1,-.16]],t);
 const angle=forearmAngle+Math.max(-H.maxFlex,Math.min(H.maxFlex,flex));
 const gripMix=smooth((t-C.gripStart)/(C.impact-C.gripStart)),ringClosure=smooth((t-C.impact)/(C.holdEnd-C.impact));
 const thumbTransfer=smooth((t-C.gripStart-.012)/(C.holdEnd-C.gripStart-.012));
 const curl=mix(.35,.9,ringClosure)*(1-openProgress);
 const rig={wrist:{...pose.hand},angle,forearmAngle,flex,curl,gripMix,ringClosure,thumbTransfer,openProgress,thumbOpposition:mix(.55,1,thumbTransfer)*(1-openProgress*.5),fingers:[]};
 const supportAngle=Math.atan2(pose.hand.y-pose.ball.y,pose.hand.x-pose.ball.x);
 const onBall=(a,radius=22)=>handToLocal({x:pose.ball.x+Math.cos(a)*radius,y:pose.ball.y+Math.sin(a)*radius},rig);
 for(let i=0;i<3;i++){
  const base={x:-6+i*6,y:-16-(i===1?2:0)},openTip={x:base.x+(i-1)*2,y:base.y-14+(i===2?2:0)};
  const x=pose.hand.x+H.fingerOffsets[i],dx=(x-pose.rim.x)/pose.rim.rx;
  const surface=pose.rim.y+pose.rim.ry*Math.sqrt(Math.max(0,1-dx*dx));
  const contact={x,y:surface+4};
  const ringTip=handToLocal({x,y:mix(surface-3,contact.y,ringClosure)},rig);
  const ringKnuckle=handToLocal({x:x-1,y:surface-3-i*.3},rig);
  const ringPad=handToLocal({x:x-1.2,y:surface-3.5},rig),ringControl=handToLocal({x:x+1.5,y:surface+1.2},rig);
  // Only a short arc at the near side is visible in front of the basketball.
  const a=supportAngle+.1+i*.32,carryTip=onBall(a),carryPad=onBall(a-.18),carryControl=onBall(a-.09,22.15),carryKnuckle=onBall(a-.34,24);
  const knuckle=blend(blend(carryKnuckle,ringKnuckle,gripMix),{x:base.x-1,y:base.y-8},openProgress);
  const tip=blend(blend(carryTip,ringTip,gripMix),openTip,openProgress);
  const openPad=blend(base,openTip,.6),openControl=blend(base,openTip,.82);
  const padStart=blend(blend(carryPad,ringPad,gripMix),openPad,openProgress);
  const padControl=blend(blend(carryControl,ringControl,gripMix),openControl,openProgress);
  rig.fingers.push({base,knuckle,tip,padStart,padControl,contact});
 }
 const thumbBase={x:7,y:-6},thumbOpen={x:21,y:-10};
 const carryThumb=onBall(supportAngle-.55),ringThumb=handToLocal({x:pose.rim.x-6,y:pose.rim.y-5},rig);
 const thumbTip=blend(blend(carryThumb,ringThumb,thumbTransfer),thumbOpen,openProgress);
 const thumbKnuckle=blend(onBall(supportAngle-.7,24),handToLocal({x:pose.rim.x-12,y:pose.rim.y-7},rig),thumbTransfer);
 rig.thumb={base:thumbBase,knuckle:blend(thumbKnuckle,{x:15,y:-8},openProgress),tip:thumbTip};
 return rig;
}
