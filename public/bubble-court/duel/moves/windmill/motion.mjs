export const duration=6;
export function sample(time){
 const t=Math.max(0,Math.min(duration,time));
 const phase=t<.7?'gather':t<1.9?'windmill':t<2.6?'dunk':t<4.4?'flight':t<5.2?'impact':'finish';
 const u=Math.max(0,Math.min(1,(t-2.6)/1.8));
 return {t,phase,obstacles:t>=4.4?1:0,ball:{x:420+447*u,y:240+56*u-230*Math.sin(Math.PI*u)}};
}
export function gatherHand(progress,x,y){const u=Math.max(0,Math.min(1,progress));return {x:x+32*(1-u)+(8+68*Math.cos(Math.PI*.45))*u,y:y+7*(1-u)+(-35+68*Math.sin(Math.PI*.45))*u}}
