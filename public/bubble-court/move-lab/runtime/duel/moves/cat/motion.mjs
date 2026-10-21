export const duration=7;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{const u=clamp(x);return u*u*(3-2*u)},mix=(a,b,u)=>a+(b-a)*u;
export function sample(time){
 const t=Math.max(0,Math.min(duration,time));
 const phase=t<.6?'ready':t<1.8?'toss':t<2.6?'windup':t<2.95?'slap':t<4.5?'flight':t<5.4?'impact':'finish';
 let ball={x:388,y:364};
 if(t>=.6&&t<1.8){const u=ease((t-.6)/1.2);ball={x:mix(388,520,u),y:mix(364,240,u)-65*Math.sin(u*Math.PI)}}
 else if(t>=1.8&&t<2.75)ball={x:520,y:240};
 else if(t>=2.75){const u=clamp((t-2.82)/1.68);ball={x:mix(520,884,u),y:mix(240,296,u)-75*Math.sin(Math.PI*u)}}
 let paw={x:260,y:-240};
 if(t>=.7&&t<1.8){const u=ease((t-.7)/1.1);paw={x:mix(260,300,u),y:mix(-240,185,u)}}
 else if(t>=1.8&&t<2.6){const u=ease((t-1.8)/.8);paw={x:mix(300,270,u),y:mix(185,140,u)}}
 else if(t>=2.6&&t<2.75){const u=((t-2.6)/.15)**2;paw={x:mix(270,430,u),y:mix(140,240,u)}}
 else if(t>=2.75&&t<2.82)paw={x:430,y:240};
 else if(t>=2.82&&t<2.95){const u=ease((t-2.82)/.13);paw={x:mix(430,560,u),y:mix(240,270,u)}}
 else if(t>=2.95){const u=ease((t-2.95)/1.2);paw={x:mix(560,300,u),y:mix(270,-240,u)}}
 const focus=t<2.55?ease((t-2)/.55):t<2.95?1:1-ease((t-2.95)/.75);
 const follow=30*Math.sin(Math.PI*clamp((t-2.95)/.75));
 return {t,phase,ball,paw,obstacles:t>=4.5?1:0,camera:{zoom:1+1.05*focus,x:mix(560,470,focus)+follow,y:mix(290,240,focus)}};
}
