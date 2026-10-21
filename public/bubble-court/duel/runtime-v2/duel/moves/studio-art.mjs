import {sample as windmill,gatherHand} from './windmill/motion.mjs';
import {sample as blackhole} from './blackhole/motion.mjs';
import {sample as cat} from './cat/motion.mjs';
import {focusCamera,focusPaw,applyFocus} from './focus.mjs';
import {STUDIO} from '../../duel-lab/Constants.js';
const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{const t=clamp(n);return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
const ink='#102c37',skin='#cf9064',light='#efba89',cream='#fff1cc';
const accents={windmill:'#ffb45f',blackhole:'#c7a2ff',cat:'#ffb2c6'};
export const impactPoint=id=>id==='windmill'?{x:867,y:296}:{x:884,y:296};
export function transferTargets(width,height){const gap=Math.max(28,Math.min(38,width*.085)),start=width*.74-gap*1.5;return Array.from({length:4},(_,i)=>({x:start+i*gap,y:height*.83}));}
export function solveArm(shoulder,target,upper=66,lower=64,bend=1){
 const dx=target.x-shoulder.x,dy=target.y-shoulder.y,raw=Math.hypot(dx,dy),d=Math.max(Math.abs(upper-lower)+.00001,Math.min(upper+lower-.00001,raw)),angle=raw>.00001?Math.atan2(dy,dx):-Math.PI/2;
 const along=(upper*upper-lower*lower+d*d)/(2*d),off=Math.sqrt(Math.max(0,upper*upper-along*along)),c=Math.cos(angle),s=Math.sin(angle);
 return {elbow:{x:shoulder.x+along*c-off*s*bend,y:shoulder.y+along*s+off*c*bend},wrist:{x:shoulder.x+d*c,y:shoulder.y+d*s}};
}
const world=(p,q)=>({x:p.x+(q.x*Math.cos(p.rotation)-q.y*Math.sin(p.rotation))*p.scale,y:p.y+(q.x*Math.sin(p.rotation)+q.y*Math.cos(p.rotation))*p.scale});
const local=(p,q)=>{const x=(q.x-p.x)/(p.scale||1),y=(q.y-p.y)/(p.scale||1);return {x:x*Math.cos(p.rotation)+y*Math.sin(p.rotation),y:-x*Math.sin(p.rotation)+y*Math.cos(p.rotation)};};
export function athletePose(id,ms){
 const t=Math.max(0,ms/1000);let p={x:351,y:394,scale:1,rotation:0},ball,holding=false,hand,far;
 if(id==='windmill'){
  const lift=t<.7?-Math.sin(t/.7*Math.PI)*12:t<1.9?Math.sin((t-.7)/1.2*Math.PI/2)*166:t<2.3?166:t<3?166*(1-(t-2.3)/.7):0;
  p.x=t<.7?337:t<1.9?337+50*(t-.7)/1.2:387;p.y=394-lift;
  const shoulder={x:p.x+8,y:p.y-35},a=Math.PI*.45+Math.PI*2;
  if(t<.7)ball=gatherHand(t/.7,p.x,p.y);
  else if(t<1.9){const r=Math.PI*.45+(t-.7)/1.2*Math.PI*2;ball={x:shoulder.x+68*Math.cos(r),y:shoulder.y+68*Math.sin(r)};}
  else if(t<2.2){const u=smooth((t-1.9)/.3);ball={x:mix(shoulder.x+68*Math.cos(a),420,u),y:mix(shoulder.y+68*Math.sin(a),224,u)};}
  else if(t<2.6)ball={x:420,y:224+16*(t-2.2)/.4};else ball=windmill(t).ball;
  holding=t<2.6;hand=holding?{x:ball.x-8,y:ball.y+15}:{x:p.x+46,y:p.y-8};far={x:-57,y:-17};
 }else if(id==='blackhole'){
  const s=blackhole(t);p={...s.player,y:s.player.y+10*s.player.scale,scale:s.player.scale*.78};ball=t<5.2?world(s.player,s.hand):s.ball;holding=t<5.2;
  hand=holding?{x:ball.x+8*p.scale,y:ball.y+15*p.scale}:world(p,s.hand);
  far=t>=5.2&&t<5.9?local(p,{x:852,y:s.rimY+5}):holding?local(p,{x:ball.x-16*p.scale,y:ball.y+10*p.scale}):{x:-45,y:8};
 }else{
  ball=cat(t).ball;holding=t<.6;const u=t<.6?0:t<1.8?smooth((t-.6)/.3):1-smooth(t-1.8);
  hand=holding?{x:ball.x-5,y:ball.y+12}:{x:p.x+38,y:p.y-50-u*40};far={x:-45,y:8};
 }
 const contact=hand,front=local(p,hand),arms={front:solveArm({x:25,y:-53},front,66,64,-1),back:solveArm({x:-25,y:-53},far,62,60,1)};
 return {id,t,...p,ball,holding,contact,radius:25,arms,head:world(p,{x:0,y:-95}),feet:world(p,{x:6,y:118})};
}
function line(ctx,points,color,width=3){ctx.beginPath();for(let i=0;i<points.length;i++){const p=points[i];i?ctx.lineTo(p.x??p[0],p.y??p[1]):ctx.moveTo(p.x??p[0],p.y??p[1]);}ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
function oval(ctx,x,y,rx,ry,fill,stroke=null,width=3,rotation=0){ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rotation,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function polygon(ctx,points,fill,stroke=ink,width=4){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();}}
function limb(ctx,points,width,fill){line(ctx,points,ink,width+7);line(ctx,points,fill,width);line(ctx,points.map(p=>({x:(p.x??p[0])-3,y:(p.y??p[1])-2})),light,Math.max(2,width*.23));}
function hand(ctx,wrist,elbow,grip=false){
 ctx.save();ctx.translate(wrist.x,wrist.y);ctx.rotate(Math.atan2(wrist.y-elbow.y,wrist.x-elbow.x)+Math.PI/2);
 oval(ctx,0,-5,12,17,skin,ink,3,-.08);
 for(let i=0;i<4;i++){const x=-8+i*5,y=-17+(i===0||i===3?3:0);line(ctx,[[x,-5],[x,y],[x+(grip?3:1),y-(grip?2:8)]],ink,7);line(ctx,[[x,-5],[x,y],[x+(grip?3:1),y-(grip?2:8)]],light,4);}
 line(ctx,[[-10,-1],[-15,-10],[-10,-16]],skin,7);ctx.restore();
}
function arm(ctx,shoulder,pose,grip){limb(ctx,[shoulder,pose.elbow],24,skin);limb(ctx,[pose.elbow,pose.wrist],19,skin);hand(ctx,pose.wrist,pose.elbow,grip);}
function shoe(ctx,x,y,flip=1){ctx.save();ctx.translate(x,y);ctx.scale(flip,1);polygon(ctx,[[-11,-10],[8,-10],[15,-3],[30,2],[29,10],[-14,10]],cream);line(ctx,[[-12,8],[28,8]],'#31bca5',4);line(ctx,[[5,-5],[14,-1]],ink,2);ctx.restore();}
export function drawAthlete(ctx,p,accent){
 if(p.scale<.002)return;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.scale(p.scale,p.scale);
 const knee=Math.sin(Math.PI*clamp((p.id==='windmill'?394-p.y:416-p.y)/180))*20;
 limb(ctx,[[-16,35],[-32-knee*.4,72],[-39,105-knee*.3]],24,'#b67554');shoe(ctx,-39,108-knee*.3,-1);
 limb(ctx,[[18,35],[42+knee*.5,66-knee],[26,106-knee*.5]],25,skin);shoe(ctx,26,108-knee*.5);
 arm(ctx,{x:-25,y:-53},p.arms.back,p.holding);
 const jersey=ctx.createLinearGradient(-35,0,35,0);jersey.addColorStop(0,'#158f80');jersey.addColorStop(.55,'#36cbb0');jersey.addColorStop(1,'#137c73');
 polygon(ctx,[[-28,-58],[-12,-66],[14,-65],[32,-54],[28,12],[-31,12]],jersey);
 line(ctx,[[-24,-57],[-12,-48],[0,-44],[15,-51],[24,-59]],cream,4);
 polygon(ctx,[[-31,10],[29,10],[39,42],[6,57],[-1,42],[-29,50],[-43,34]],'#173a46');line(ctx,[[-25,22],[22,22]],'#476b6a',2);
 ctx.fillStyle=cream;ctx.font="900 29px 'Arial',sans-serif";ctx.textAlign='center';ctx.fillText('01',0,-1);
 limb(ctx,[[0,-60],[0,-76]],15,skin);
 const face=ctx.createLinearGradient(-22,-104,22,-87);face.addColorStop(0,light);face.addColorStop(1,skin);
 oval(ctx,0,-95,23,27,face,ink,4);oval(ctx,22,-94,5,8,skin,ink,2);
 polygon(ctx,[[-24,-104],[-23,-119],[-12,-128],[7,-126],[24,-116],[23,-100],[14,-108],[-5,-105]],'#152c35',null);
 line(ctx,[[-18,-108],[18,-113]],accent,5);line(ctx,[[7,-96],[12,-96]],ink,2);line(ctx,[[11,-90],[15,-88]],'#9c5b48',2);
 arm(ctx,{x:25,y:-53},p.arms.front,p.holding);ctx.restore();
}
export function drawBall(ctx,x,y,r=25,rotation=0,accent='#ffaf56'){
 ctx.save();ctx.translate(x,y);ctx.rotate(rotation);const g=ctx.createRadialGradient(-r*.35,-r*.45,1,0,0,r);g.addColorStop(0,'#ffe3a0');g.addColorStop(.34,accent);g.addColorStop(1,'#bd562d');oval(ctx,0,0,r,r,g,ink,3);
 ctx.save();ctx.beginPath();ctx.arc(0,0,r-1,0,7);ctx.clip();line(ctx,[[-r,0],[r,0]],'#633c31',2);line(ctx,[[0,-r],[0,r]],'#633c31',2);ctx.strokeStyle='#633c31';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-r*.95,0,r*.8,r*1.25,0,0,7);ctx.ellipse(r*.95,0,r*.8,r*1.25,0,0,7);ctx.stroke();ctx.restore();oval(ctx,-r*.35,-r*.45,r*.2,r*.1,'#fff3c177');ctx.restore();
}
function court(ctx,accent){
 const g=ctx.createLinearGradient(0,0,0,580);g.addColorStop(0,'#193a40');g.addColorStop(.6,'#224943');g.addColorStop(1,'#123339');ctx.fillStyle=g;ctx.fillRect(0,0,1120,580);
 ctx.fillStyle='#0d2d35';for(let i=0;i<12;i++){const h=45+(i*43)%80;ctx.fillRect(i*103-20,150-h,80,h+100);}
 for(let i=-5;i<25;i++){line(ctx,[[i*70,155],[i*70+350,505]],'#9cbb9e12',1);line(ctx,[[i*70,155],[i*70-350,505]],'#9cbb9e12',1);}
 line(ctx,[[0,503],[1120,503]],'#77967d',2);polygon(ctx,[[0,504],[1120,504],[1120,580],[0,580]],'#30584c',null);
 oval(ctx,390,518,178,29,null,'#a7b79855',2);line(ctx,[[0,563],[1120,563]],'#b8bea144',2);
 ctx.fillStyle=accent+'12';ctx.fillRect(0,0,8,580);
}
function hoop(ctx,x,y,stretch=0,front=false){
 if(!front){line(ctx,[[x+84,513],[x+84,y-83]],'#425f64',11);line(ctx,[[x+80,y-83],[x+80,513]],'#7a9593',3);polygon(ctx,[[x+36,y-90],[x+105,y-90],[x+105,y-14],[x+36,y-14]],'#a5c6bf22','#bed5c6',3);ctx.strokeStyle='#e3e4c5';ctx.lineWidth=3;ctx.strokeRect(x+45,y-50,40,27);line(ctx,[[x+42,y-2],[x+70,y-2]],'#859d91',5);ctx.strokeStyle='#8b492d';ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(x,y,44,11,0,Math.PI,Math.PI*2);ctx.stroke();return;}
 const length=52+stretch;for(let i=0;i<9;i++){const u=i/8,top=x-42+u*84,bottom=x-26+u*52;line(ctx,[[top,y+4],[bottom,y+length]],'#e5e4c299',1.5);if(i<8)line(ctx,[[top,y+4],[bottom+6.5,y+length]],'#e5e4c277',1);}
 for(let i=1;i<=3;i++)oval(ctx,x,y+length*i/3,42-16*i/3,4,null,'#cddbc095',1.5);
 ctx.strokeStyle='#ffad57';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(x,y,44,11,0,0,Math.PI);ctx.stroke();ctx.strokeStyle='#ffe1a1';ctx.lineWidth=2;ctx.stroke();
}
function portal(ctx,x,y,r,open,t){if(open<=.001)return;ctx.save();ctx.translate(x,y);ctx.scale(open,open*.62);const g=ctx.createRadialGradient(0,0,r*.4,0,0,r*1.35);g.addColorStop(0,'#0a1023');g.addColorStop(.65,'#201843');g.addColorStop(.75,'#d7b3ff');g.addColorStop(.82,'#8551cd99');g.addColorStop(1,'#8551cd00');oval(ctx,0,0,r*1.35,r*1.35,g);for(let k=0;k<4;k++){ctx.strokeStyle=k%2?'#f2d9ff':'#ad80f7';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,r*(.8+k*.07),r*(.8+k*.07),t+k,k*.9,k*.9+2.4);ctx.stroke();}ctx.restore();}
function paw(ctx,s){if(s.t<.7)return;const p=focusPaw(s.t*1000),compress=1-.14*Math.sin(Math.PI*clamp((s.t-2.7)/.25));ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,compress);
 const fur=ctx.createLinearGradient(-150,-200,70,50);fur.addColorStop(0,'#b8754e');fur.addColorStop(.55,'#e8b97e');fur.addColorStop(1,'#ffe0ad');
 polygon(ctx,[[-230,-380],[-70,-380],[15,-85],[35,30],[-100,55],[-150,-110]],fur,ink,7);
 for(let i=0;i<3;i++)line(ctx,[[-170+i*35,-200],[-130+i*30,-165]],'#a96b45',13);
 oval(ctx,-15,0,103,86,fur,ink,6,-.18);
 for(const [x,y,rx,ry] of [[-45,-72,34,39],[12,-77,35,43],[63,-40,33,40],[66,18,31,35]]){oval(ctx,x,y,rx,ry,fur,ink,4,-.23);oval(ctx,x+1,y+6,rx*.57,ry*.53,'#dd8797',null,0,-.23);oval(ctx,x-4,y,rx*.25,ry*.17,'#ffd0cb');}
 oval(ctx,-21,11,45,35,'#d47f8d',ink,2,-.22);oval(ctx,-29,2,24,15,'#f4b4b5');line(ctx,[[-88,-4],[-67,-16]],'#fff1c8',4);ctx.restore();
}
export function impactState(id,ms){const at=id==='windmill'?4400:id==='cat'?4500:6200,u=clamp((ms-at)/STUDIO.sourceBurstMs);return {active:ms>=at&&u<1,u,alpha:1-u};}
function impact(ctx,id,t){const state=impactState(id,t*1000),u=state.u;if(!state.active)return;const c=impactPoint(id),accent=accents[id];ctx.save();ctx.globalAlpha=state.alpha;
 oval(ctx,c.x,c.y,35+u*100,18+u*55,accent+'18',accent,4);
 const star=[];for(let i=0;i<20;i++){const a=i*Math.PI/10,r=(i%2?17:35)+u*(i%2?15:60);star.push([c.x+Math.cos(a)*r,c.y+Math.sin(a)*r*.72]);}polygon(ctx,star,accent+'99',cream,2);
 oval(ctx,c.x,c.y,14+u*20,8+u*12,cream);
 for(let i=0;i<10;i++){const a=i*2.399,r=30+u*(75+i%3*14),x=c.x+Math.cos(a)*r,y=c.y+Math.sin(a)*r;
  if(id==='blackhole')polygon(ctx,[[x-5,y-8],[x+6,y-2],[x+3,y+12],[x-5,y+5]],accent,null);
  else if(id==='cat'){oval(ctx,x,y,4,3,accent);for(let k=0;k<3;k++)oval(ctx,x-4+k*4,y-5,1.8,2,cream);}
  else line(ctx,[[x,y],[x+Math.cos(a)*15,y+Math.sin(a)*15]],i%2?accent:cream,4);
 }ctx.restore();
}
// One pure draw pass. All movement comes from the source timeline; no resource loaders/RAF.
export function drawStudioFrame(ctx,id,ms){
 const p=athletePose(id,ms),t=p.t,s=id==='blackhole'?blackhole(t):id==='cat'?cat(t):windmill(t),accent=accents[id],at=id==='windmill'?4.4:id==='cat'?4.5:6.2;
 ctx.setTransform(ctx.canvas.width/1120,0,0,ctx.canvas.height/580,0,0);ctx.clearRect(0,0,1120,580);ctx.fillStyle='#123339';ctx.fillRect(0,0,1120,580);ctx.save();applyFocus(ctx,focusCamera(id,ms));court(ctx,accent);
 oval(ctx,p.x,512,45,8,'#071d2380');
 if(id==='blackhole'){portal(ctx,500,222,90,s.leftPortal,t);portal(ctx,875,106,80,s.rightPortal,t);}
 const hx=id==='windmill'?420:884,hy=id==='windmill'?240:id==='blackhole'?s.rimY:215;
 if(id!=='cat')hoop(ctx,hx,hy,0,false);
 if(id==='windmill'&&t>=.7&&t<1.9){ctx.strokeStyle=accent+'80';ctx.lineWidth=9;ctx.beginPath();ctx.arc(p.x+8,p.y-35,68,Math.PI*.45,Math.PI*.45+(t-.7)/1.2*Math.PI*2);ctx.stroke();}
 drawAthlete(ctx,p,accent);
 if(id==='cat')paw(ctx,s);
 if(t<at){
  if(!p.holding){for(let j=5;j>0;j--){const prev=athletePose(id,Math.max(0,ms-j*18));ctx.globalAlpha=(6-j)*.045;drawBall(ctx,prev.ball.x,prev.ball.y,25*(1-j*.08),t,accent);}ctx.globalAlpha=1;}
  drawBall(ctx,p.ball.x,p.ball.y,25,t*2,accent);
  // A gripping finger wraps over the ball rather than vanishing behind it.
  if(p.holding&&p.scale>.02){const wrist=p.contact;line(ctx,[[wrist.x-6,wrist.y],[wrist.x-13,wrist.y-10],[wrist.x-8,wrist.y-16]],light,5*p.scale);}
 }
 if(id!=='cat'){const hit=id==='windmill'?2.2:5.2,stretch=t>=hit&&t<hit+.55?Math.sin((t-hit)/.55*Math.PI)*26:0;hoop(ctx,hx,hy,stretch,true);}
 impact(ctx,id,t);ctx.restore();
}
