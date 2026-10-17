import {STREET} from './Constants.js?v=12';
// Authored joint poses in metres: gather → rise → rim → hang → recovery.
const keys=[
 [0,-1.7,1.0,-1.12,1.28,-1.92,.1,-1.42,.1],
 [.12,-1.35,.80,-.77,1.12,-1.65,.1,-.93,.1],
 [.32,-.20,1.65,.48,2.85,-.65,.72,.02,.48],
 [.46,.83,1.95,1.57,3.42,.34,1.15,1.02,.88],
 [.60,1.42,1.72,2.1,3.05,1.0,.88,1.66,.70],
 [.72,1.45,1.55,2.1,3.05,1.13,.57,1.83,.52],
 [.89,1.4,.83,1.88,1.45,1.10,.1,1.82,.1],
 [1,1.38,1.0,1.92,1.35,1.10,.1,1.78,.1]
];
export function streetPose(value){const t=Math.max(0,Math.min(1,value));let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=(t-a[0])/(b[0]-a[0]),v=u*u*(3-2*u),k=a.map((n,j)=>n+(b[j]-n)*v),point=(x,y,z=0)=>({x,y,z});const hip=point(k[1],k[2]),shoulder=point(hip.x-.06,hip.y+.67),hand=point(k[3],k[4],.35),foot=point(k[5],k[6],.18),foot2=point(k[7],k[8],-.18);
 return {hip,shoulder,head:point(shoulder.x,shoulder.y+.35),hand,elbow:point(shoulder.x+(hand.x-shoulder.x)*.46,shoulder.y+(hand.y-shoulder.y)*.5,.38),backElbow:point(shoulder.x-.35,shoulder.y-.10,-.22),backHand:point(shoulder.x-.53,shoulder.y-.28,-.08),foot,foot2,knee:point(hip.x+(foot.x-hip.x)*.5-.15,hip.y+(foot.y-hip.y)*.48,.22),knee2:point(hip.x+(foot2.x-hip.x)*.5+.17,hip.y+(foot2.y-hip.y)*.5,-.22),ball:t<=STREET.impact?{...hand}:point(2.1,3.05-Math.pow((t-.6)/.4,1.2)*2.7,.35)};
}
export function renderBudget(width,height,dpr=1){const ratio=Math.min(STREET.maxDpr,Math.max(1,dpr)),scale=Math.min(1,Math.sqrt(STREET.maxPixels/(Math.max(1,width)*Math.max(1,height)*ratio*ratio)));return {width:Math.max(1,Math.floor(width*ratio*scale)),height:Math.max(1,Math.floor(height*ratio*scale)),ratio:ratio*scale};}
export function renderInterval({active=false,slow=false,hidden=false}={}){return hidden?Infinity:1000/(active?(slow?STREET.slowFps:STREET.activeFps):STREET.idleFps);}
export class DunkClock{
 constructor(duration=STREET.duration){this.duration=duration;this.reset();}
 reset(){this.elapsed=0;this.active=false;this.impacted=false;this.preview=false;}
 play(preview=false){this.reset();this.active=true;this.preview=preview;}
 advance(ms,{paused=false}={}){let impact=false,done=false;if(this.active&&!paused){this.elapsed+=Math.max(0,ms);if(!this.impacted&&this.elapsed>=this.duration*STREET.impactTime){this.impacted=true;impact=true;}if(this.elapsed>=this.duration){this.active=false;done=true;}}return {t:Math.min(1,this.elapsed/this.duration),impact,done,preview:this.preview};}
}
