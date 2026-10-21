import {COMIC as C,HAND as H} from './Constants.js';
import {sampleHandPose} from './hand-pose.js';
const clamp=t=>Math.max(0,Math.min(1,t)),mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
function point(keys,t){let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=smooth((t-a[0])/(b[0]-a[0]));return {x:mix(a[1],b[1],u),y:mix(a[2],b[2],u)};}
function rimAt(t){let dy=0;if(t>=C.gripStart&&t<C.impact)dy=4*smooth((t-C.gripStart)/(C.impact-C.gripStart));else if(t>=C.impact&&t<=C.holdEnd)dy=4;else if(t>C.holdEnd&&t<.96){const u=(t-C.holdEnd)/(.96-C.holdEnd);dy=4*Math.exp(-u*5)*Math.cos(u*Math.PI*4)*(1-smooth((u-.7)/.3));}return {...C.rim,y:C.rim.y+dy};}
export function netSection(p,progress){
 const u=clamp(progress),top=p.rim.y+2,y=top+(C.netLength+p.netStretch)*u;
 const base=mix(p.rim.rx,(38+p.netStretch*.35)/2,u);
 const distance=(y-p.ball.y)/(C.ballRadius*1.35),envelope=Math.max(0,1-distance*distance);
 const edge=smooth(u/.12)*smooth((1-u)/.12);
 const halfWidth=base+(p.netBulge||0)*Math.max(0,C.ballRadius+C.netClearance-base)*envelope*edge;
 return {y,left:p.rim.x-halfWidth,right:p.rim.x+halfWidth,halfWidth};
}
export function sampleDunk(progress,reduced=false){
 const t=clamp(progress),active=progress>=0&&progress<1;
 const phase=t<C.gatherEnd?'gather':t<C.riseEnd?'rise':t<C.impact?'slam':t<C.holdEnd?'impact':t<C.hangEnd?'hang':t<1?'recover':'idle';
 const rim=rimAt(t);let ball=point([[0,122,148],[C.gatherEnd,108,158],[.38,229,42],[C.riseEnd,242,39],[C.impact,242,92],[C.holdEnd,242,92],[.66,242,141],[.82,246,226],[1,260,290]],t);
 if(t>=C.riseEnd&&t<C.impact){const u=((t-C.riseEnd)/(C.impact-C.riseEnd))**2;ball={x:242,y:39+53*u};}
 let hand;
 if(t<C.riseEnd)hand=point([[0,110,166],[C.gatherEnd,96,176],[.38,215,61],[C.riseEnd,228,59],[C.impact,222,100]],t);
 else if(t<C.impact){const u=((t-C.riseEnd)/(C.impact-C.riseEnd))**2;hand={x:228-6*u,y:59+41*u};}
 else if(t<=H.openEnd)hand={x:rim.x-20,y:rim.y+8};
 else{const start=rimAt(H.openEnd),u=smooth((t-H.openEnd)/(H.withdrawEnd-H.openEnd));hand={x:mix(start.x-20,100,u),y:mix(start.y+8,230,u)};}
 const shoulder=point([[0,43,248],[C.gatherEnd,30,252],[.38,76,222],[C.impact,80,222],[C.holdEnd,80,222],[C.hangEnd,76,227],[H.openEnd,76,227],[1,16,300]],t);
 const elbow=point([[0,75,205],[C.gatherEnd,72,217],[.38,153,128],[C.riseEnd,169,124],[C.impact,174,145],[C.holdEnd,174,145],[C.hangEnd,167,152],[H.openEnd,167,152],[H.withdrawEnd,51,267],[1,51,267]],t);
 let netStretch=0;if(t>C.holdEnd&&t<1){if(t<=C.netPeak)netStretch=C.netStretch*Math.sin((t-C.holdEnd)/(C.netPeak-C.holdEnd)*Math.PI/2);else{const u=(t-C.netPeak)/(1-C.netPeak);netStretch=C.netStretch*Math.exp(-u*6)*Math.cos(u*Math.PI*3)*(1-smooth((u-.7)/.3));}}
 const netBulge=t>C.holdEnd?smooth((t-C.holdEnd)/.035)*(1-smooth((t-.69)/.12)):0;
 const hit=t>=C.impact?Math.exp(-(t-C.impact)*12):0,shake=t>C.holdEnd?Math.sin((t-C.holdEnd)*160)*Math.exp(-(t-C.holdEnd)*18)*2.5:0;
 const zoom=1+C.cameraPush*smooth((t-.3)/.2)*(1-smooth((t-.72)/.28));
 const attackOpacity=active?smooth((t-.49)/.06)*(1-smooth((t-.88)/.12)):0;
 const pose={active,phase,ball,hand,shoulder,elbow,rim,netStretch,netBulge,released:t>=C.impact,gripping:t>=C.impact&&t<C.hangEnd,ballOpacity:1-smooth((t-.75)/.1),armOpacity:1-smooth((t-.9)/.1),speedLines:t>.16&&t<C.impact?Math.sin((t-.16)/(C.impact-.16)*Math.PI):0,impact:hit*(1-smooth((t-.7)/.12)),camera:{zoom,x:shake,y:Math.abs(shake)*.3},attackOpacity,textScale:t<C.holdEnd?mix(1.3,1,smooth((t-C.impact)/.04)):1,sendProgress:smooth((t-H.openAt)/(1-H.openAt))};
 if(reduced){const quietRim={...C.rim};Object.assign(pose,{phase:active?'impact':'idle',ball:{x:quietRim.x,y:quietRim.y+12},hand:{x:quietRim.x-20,y:quietRim.y+8},shoulder:{x:80,y:222},elbow:{x:174,y:145},rim:quietRim,netStretch:8,netBulge:active?.5:0,released:true,gripping:true,ballOpacity:1,armOpacity:1,speedLines:0,impact:0,camera:{zoom:1,x:0,y:0},attackOpacity:active?1:0,textScale:1,sendProgress:.6});}
 if(reduced&&!active)pose.netStretch=0;
 pose.handRig=sampleHandPose(t,pose,reduced);
 return pose;
}
