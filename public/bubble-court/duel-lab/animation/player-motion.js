import {PLAYER} from './player-config.js';
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,t)=>a+(b-a)*t;
function track(keys,t){let i=1;while(i<keys.length-1&&t>keys[i][0])i++;const a=keys[i-1],b=keys[i],u=smooth((t-a[0])/(b[0]-a[0]));return {x:mix(a[1],b[1],u),y:mix(a[2],b[2],u)};}
function limb(name,start,target,upper,lower,pole=-1){const dx=target.x-start.x,dy=target.y-start.y,d=Math.hypot(dx,dy),r=Math.max(Math.abs(upper-lower)+.0001,Math.min(upper+lower-.0001,d)),ux=dx/d,uy=dy/d,a=(upper*upper-lower*lower+r*r)/(2*r),h=Math.sqrt(Math.max(0,upper*upper-a*a));return {name,start,joint:{x:start.x+ux*a-uy*h*pole,y:start.y+uy*a+ux*h*pole},end:{x:start.x+ux*r,y:start.y+uy*r},upper,lower,error:Math.abs(d-r)};}
export function samplePlayer(progress,reduced=false){
 let t=clamp(progress);if(reduced)t=t<.45?.12:t<.85?.60:1;
 const hip=track([[0,100,217],[.12,110,236],[.21,130,224],[.38,223,178],[.44,242,176],[.5,250,184],[.53,250,184],[.63,254,201],[.67,256,207],[.78,273,218],[.82,279,226],[.88,282,238],[1,282,217]],t);
 const shoulderFront={x:hip.x+12,y:hip.y-48},shoulderBack={x:hip.x-10,y:hip.y-48};
 const rim={x:300,y:100+3*smooth((t-.47)/.03)*(1-smooth((t-.53)/.18))};
 let hand=track([[0,129,199],[.12,140,204],[.21,154,177],[.38,248,88],[.44,278,79],[.48,286,89],[.5,286,108]],Math.min(t,.5));
 if(t>=.5&&t<=.67)hand={x:rim.x-14,y:rim.y+5};
 if(t>.67){const u=smooth((t-.67)/.13);hand={x:mix(286,hip.x+30,u),y:mix(105,hip.y-15,u)};}
 const back=track([[0,120,200],[.12,130,205],[.21,142,179],[.28,133,173],[.38,186,163],[.5,213,169],[.67,226,190],[.88,254,217],[1,254,196]],t);
 const frontFoot=track([[0,120,276],[.12,120,276],[.21,142,276],[.38,238,231],[.5,271,243],[.63,277,261],[.67,281,266],[.82,298,276],[1,298,276]],t);
 const backFoot=track([[0,88,276],[.12,88,276],[.21,104,269],[.38,186,226],[.5,223,230],[.63,226,247],[.67,228,252],[.82,272,268],[.86,272,276],[1,272,276]],t);
 const limbs={armFront:limb('armFront',shoulderFront,hand,30,29),armBack:limb('armBack',shoulderBack,back,29,27),legFront:limb('legFront',{x:hip.x+8,y:hip.y},frontFoot,34,34),legBack:limb('legBack',{x:hip.x-8,y:hip.y},backFoot,34,34)};
 const handFront=limbs.armFront.end,handBack=limbs.armBack.end;
 const offset=smooth((t-.44)/.06);let ball={x:handFront.x+mix(8,14,offset),y:handFront.y+mix(-9,-5,offset)};
 if(t>=.5){const hit=.53+Math.sqrt(170/1700),fall=Math.max(0,t-.53);let y=103+1700*fall*fall;if(t>=hit)y=273-17*Math.sin(Math.PI*clamp((t-hit)/.15));ball={x:300+20*smooth((t-.53)/.45),y};}
 return {phase:t===1?'idle':t<.2?'gather':t<.46?'jump':t<.53?'dunk':t<.7?'hang':t<.82?'fall':'land',t,hip,head:{x:hip.x+2,y:hip.y-70},shoulderFront,shoulderBack,handFront,handBack,footFront:limbs.legFront.end,footBack:limbs.legBack.end,limbs,ball,rim,released:t>=.5,ground:PLAYER.ground,shoeSole:PLAYER.shoeSole,camera:{zoom:reduced?1:1+.025*Math.sin(Math.PI*clamp((t-.35)/.4)),x:0}};
}
