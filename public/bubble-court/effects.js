import {FX} from './Constants.js';
export function popFeedback({popped,dropped,gained,reduced=false}){return {label:dropped?'DROP BONUS':popped>=6?'BIG CLEAR!':'NICE SHOT!',amount:`+${gained} ENERGY`,particles:reduced?0:Math.min(FX.particleLimit,(popped+dropped)*6)};}
export function energyPoint(a,b,t){const u=1-Math.pow(1-Math.max(0,Math.min(1,t)),3);return {x:a.x+(b.x-a.x)*u+Math.sin(Math.PI*u)*22,y:a.y+(b.y-a.y)*u};}
export function dunkTime(t,reduced=false){if(reduced)return t;if(t<FX.impactStart)return t/FX.impactStart*.6;if(t<FX.impactEnd)return .6;return .6+(t-FX.impactEnd)/(1-FX.impactEnd)*.4;}
export class BubbleEffects{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.falling=[];this.items=[];this.rings=[];this.motes=[];this.labels=[];this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
 clear(){this.falling=[];this.items=[];this.rings=[];this.motes=[];this.labels=[];}
 pop({cells,dropped,color,gained}){this.falling.push(...dropped.slice(0,FX.fallLimit).map(p=>({...p,age:0,color})));this.falling=this.falling.slice(-FX.fallLimit);const f=popFeedback({popped:cells.length,dropped:dropped.length,gained,reduced:this.reduced}),all=[...cells,...dropped],center=all.reduce((a,p)=>({x:a.x+p.x/all.length,y:a.y+p.y/all.length}),{x:0,y:0});
  for(let i=0;i<f.particles;i++){const p=all[i%all.length],angle=i*2.39996;this.items.push({...p,vx:Math.cos(angle)*(45+i%5*22),vy:Math.sin(angle)*100,age:0,color});}this.items=this.items.slice(-FX.particleLimit);
  if(!this.reduced){this.rings.push(...cells.slice(0,FX.ringLimit).map(p=>({...p,age:0,color})));this.rings=this.rings.slice(-FX.ringLimit);this.motes.push(...all.slice(0,6).map((p,i)=>({...p,age:-i*.045,color:FX.cyan})));this.motes=this.motes.slice(-FX.moteLimit);}
  this.labels=[{...center,age:0,label:f.label,amount:f.amount}];return f;
 }
 draw(dt,r){const c=this.ctx,rect=this.canvas.getBoundingClientRect(),target=document.querySelector('.track').getBoundingClientRect(),destination={x:target.x+target.width*.65-rect.x,y:rect.height-5};
  this.items=this.items.filter(p=>(p.age+=dt)<FX.burstSeconds);for(const p of this.items){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=140*dt;c.globalAlpha=1-p.age/FX.burstSeconds;c.fillStyle=p.color;c.save();c.translate(p.x,p.y);c.rotate(p.age*7);c.fillRect(-2,-2,4,4);c.restore();}
  this.falling=this.falling.filter(p=>(p.age+=dt)<.7);if(!this.reduced)for(const p of this.falling){const y=p.y+220*p.age*p.age;c.globalAlpha=1-p.age/.7;c.fillStyle=p.color;c.beginPath();c.arc(p.x,y,r*(1-p.age*.5),0,7);c.fill();c.strokeStyle='#e5fbff';c.lineWidth=1;c.stroke();}
  this.rings=this.rings.filter(p=>(p.age+=dt)<.35);for(const p of this.rings){c.globalAlpha=1-p.age/.35;c.strokeStyle=p.color;c.lineWidth=2.5;c.beginPath();c.arc(p.x,p.y,r*(.6+p.age*3),0,7);c.stroke();}
  this.motes=this.motes.filter(p=>(p.age+=dt)<FX.moteSeconds);for(const p of this.motes){if(p.age<0)continue;const q=energyPoint(p,destination,p.age/FX.moteSeconds);c.globalAlpha=.9;c.fillStyle=FX.cyan;c.shadowColor=FX.cyan;c.shadowBlur=8;c.beginPath();c.arc(q.x,q.y,3.5,0,7);c.fill();}c.shadowBlur=0;
  this.labels=this.labels.filter(p=>(p.age+=dt)<FX.floatSeconds);for(const p of this.labels){c.globalAlpha=Math.min(1,(FX.floatSeconds-p.age)*3);c.textAlign='center';const x=Math.max(90,Math.min(rect.width-90,p.x)),y=Math.max(150,p.y)-Math.min(35,p.age*35);c.font='italic 900 22px sans-serif';c.strokeStyle='#061526';c.lineWidth=5;c.strokeText(p.label,x,y);c.fillStyle=FX.gold;c.fillText(p.label,x,y);c.font='bold 12px sans-serif';c.fillStyle=FX.cyan;c.fillText(p.amount,x,y+20);}c.globalAlpha=1;
 }
}
