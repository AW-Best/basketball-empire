export const duration=8;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{const u=clamp(x);return u*u*(3-2*u)};
const mix=(a,b,u)=>a+(b-a)*u;
export function sample(time){
 const t=Math.max(0,Math.min(duration,time));
 const phase=t<.8?'charge':t<1.8?'jump':t<2.8?'swallow':t<3.4?'transit':t<4.5?'emerge':t<5?'windup':t<5.2?'dunk':t<5.9?'hang':t<6.2?'meteor':t<7.1?'impact':'finish';
 let player={x:356,y:416,scale:1,rotation:0};
 if(t<.8)player.y+=12*Math.sin(t/.8*Math.PI);
 else if(t<1.8){const u=ease((t-.8));player.x=mix(356,477,u);player.y=mix(416,240,u)}
 else if(t<2.8){const u=ease(t-1.8);player={x:mix(477,500,u),y:mix(240,222,u),scale:1-u,rotation:u*4.6}}
 else if(t<3.4)player={x:500,y:222,scale:0,rotation:0};
 else if(t<4.5){const u=ease((t-3.4)/1.1);player={x:mix(875,870,u),y:mix(106,200,u),scale:u,rotation:(1-u)*-.7}}
 else if(t<5)player={x:870,y:200,scale:1,rotation:0};
 else if(t<5.2){const u=clamp((t-5)/.2);player={x:870,y:mix(200,310,u*u),scale:1,rotation:0}}
 const rimY=215+(t>=5.2&&t<5.9?12*Math.sin((t-5.2)/.7*Math.PI):0);
 let hand={x:14,y:-94};
 if(t>=4.5&&t<5){const u=ease((t-4.5)/.15);hand={x:mix(14,-32,u),y:mix(-94,-105,u)}}
 else if(t>=5&&t<5.2){const u=clamp((t-5)/.2);hand={x:mix(-32,14,u*u),y:mix(-105,-95,u*u)}}
 else if(t>=5.2)hand={x:14,y:-95};
 if(t>=5.2){
 const u=clamp((t-5.2)/.7),a=.48*Math.sin(u*Math.PI*2)*Math.sin(u*Math.PI);
 const hang={x:884-14*Math.cos(a)-95*Math.sin(a),y:rimY-14*Math.sin(a)+95*Math.cos(a),scale:1,rotation:a};
 if(t<5.9)player=hang;
 else{const v=ease((t-5.9)/.7);player={x:mix(870,1030,v),y:mix(310,422,v),scale:1,rotation:0};hand={x:mix(14,40,v),y:mix(-95,-10,v)}}
 }
 let ball={x:player.x+hand.x*player.scale,y:player.y+hand.y*player.scale};
 if(t>=5.2){const u=clamp((t-5.2));ball={x:884,y:u<=.35?mix(215,260,u/.35):mix(260,296,((u-.35)/.65)**2)}}
 const focus=t<4.65?ease((t-4.05)/.6):t<5.8?1:1-ease((t-5.8)/.4);
 const camera={zoom:1+.65*focus,x:mix(560,884,focus),y:mix(290,mix(240,280,ease((t-5)/.2)),focus)};
 return {t,phase,camera,rimY,player,hand,ball,obstacles:t>=6.2?1:0,leftPortal:t<3.4?ease(t/.8):1-ease((t-3.4)/.6),rightPortal:t<3?0:t<5.3?ease((t-3)/.5):1-ease((t-5.3)/.7)};
}
