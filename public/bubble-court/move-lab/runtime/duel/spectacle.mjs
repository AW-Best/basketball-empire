import {SPECTACLE as F,STUDIO} from '../duel-lab/Constants.js';
import {getAttackTiming} from './attack-timing.mjs';
const clamp=n=>Math.max(0,Math.min(1,n));
// Pure shared timing: the reducer owns ball creation; these are only visual carriers.
export function sampleSpectacle(elapsed,contactMs,{count=4,own=false,move='classic',from={x:180,y:240},impactFrom=from,to=[{x:180,y:400}],reduced=false}={}){
 const timing=getAttackTiming(move),special=Boolean(timing.impactBurstMs),profile=STUDIO[special?'special':'classic'],age=elapsed-contactMs,n=Math.max(0,Math.min(F.maxBalls,Math.floor(count))),stage=age<0?'clip':elapsed>=timing.clipMs?'done':elapsed<(special?contactMs+timing.launchDelayMs:profile.transferAt)?'burst':elapsed<(special?contactMs+timing.launchDelayMs+timing.flightMs:profile.transferEnd)?'flight':n&&timing.impactBurstMs&&elapsed<timing.releaseImpactMs+timing.impactBurstMs?'impact':'hold',p=clamp(age/F.burstMs),u=clamp((age-timing.launchDelayMs)/timing.flightMs),accent=F.colors[move]??F.colors.classic;
 const out={stage,from,own,count:n,accent,progress:stage==='burst'?p:u,bolts:[],sparks:[],balls:[],impacts:[],flash:0,shake:0,ring:0,landingGlow:0,alpha:1,reduced};
 if(stage==='clip'||stage==='done')return out;
 if(age<F.burstMs){
  out.ring=reduced?42:24+94*p;out.alpha=reduced?1:1-p*.8;
  if(!reduced){out.flash=F.flashAlpha*Math.sin(Math.PI*p);out.shake=F.shakePx*Math.sin(p*Math.PI*2)*(1-p);
   out.bolts=Array.from({length:F.bolts},(_,i)=>{const a=i*Math.PI*2/F.bolts-.8,r=48+p*66;return [from,{x:from.x+Math.cos(a-.2)*r*.5,y:from.y+Math.sin(a-.2)*r*.5},{x:from.x+Math.cos(a+.12)*r*.64,y:from.y+Math.sin(a+.12)*r*.64},{x:from.x+Math.cos(a)*r,y:from.y+Math.sin(a)*r}];});
   out.sparks=Array.from({length:F.sparks},(_,i)=>{const a=i*2.39996,r=32+p*(55+(i%3)*14);return {x:from.x+Math.cos(a)*r,y:from.y+Math.sin(a)*r,length:5+(i%3)*3,angle:a};});
  }
 }
 const {transferAt,transferEnd}=profile;
 // The native source ball owns the first flight. Carriers split only after it hits.
 if(elapsed>=transferAt&&(stage==='flight'||stage==='impact'||stage==='hold')){
  if(elapsed>=transferEnd&&n>0&&!reduced)out.landingGlow=1-clamp((elapsed-transferEnd)/STUDIO.receiptGlowMs);
  const targets=Array.isArray(to)?to:[to],v=1-(1-clamp((elapsed-transferAt)/(transferEnd-transferAt)))**2,start=special?impactFrom:from;
  out.balls=Array.from({length:n},(_,i)=>{const end=targets[i%targets.length]??start,arc=(own?-1:1)*Math.sin(Math.PI*v)*(28+i*10);return {x:start.x+(end.x-start.x)*v+Math.sin(Math.PI*v)*(i-(n-1)/2)*20,y:start.y+(end.y-start.y)*v+arc,r:10+Math.sin(Math.PI*v)*3,index:i,trail:reduced?0:1-v};});
  if(reduced)out.balls=out.balls.map((ball,i)=>({...ball,...(targets[i%targets.length]??from),trail:0}));
  if(elapsed>=transferEnd&&!reduced){const progress=clamp((elapsed-transferEnd)/STUDIO.receiptFadeMs);out.impacts=out.balls.map(b=>({x:b.x,y:b.y,r:12+progress*16,alpha:1-progress,sparks:[]}));}
 }
 return out;
}
export function drawSpectacle(ctx,s){
 if(s.stage==='clip'||s.stage==='done')return;
 const {x,y}=s.from;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 if(s.ring){
  const g=ctx.createRadialGradient(x,y,0,x,y,Math.max(1,s.ring*1.4));g.addColorStop(0,s.accent+'90');g.addColorStop(.35,s.accent+'38');g.addColorStop(1,s.accent+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,s.ring*1.4,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=s.alpha;ctx.strokeStyle=s.accent;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,s.ring,s.ring*.65,-.15,0,7);ctx.stroke();
  for(const points of s.bolts){for(const [width,color]of [[7,F.ink],[3,s.accent],[1,F.light]]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}}
  ctx.strokeStyle=F.light;ctx.lineWidth=2;for(const p of s.sparks){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(p.angle)*p.length,p.y+Math.sin(p.angle)*p.length);ctx.stroke();}
 }
 for(const hit of s.impacts){ctx.globalAlpha=hit.alpha;const glow=ctx.createRadialGradient(hit.x,hit.y,0,hit.x,hit.y,hit.r);glow.addColorStop(0,s.accent+'55');glow.addColorStop(1,s.accent+'00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(hit.x,hit.y,hit.r,0,7);ctx.fill();ctx.strokeStyle=s.accent;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(hit.x,hit.y,hit.r,hit.r*.65,-.15,0,7);ctx.stroke();ctx.strokeStyle=F.light;ctx.lineWidth=2;for(const spark of hit.sparks){ctx.beginPath();ctx.moveTo(spark.x,spark.y);ctx.lineTo(spark.x+Math.cos(spark.angle)*9,spark.y+Math.sin(spark.angle)*9);ctx.stroke();}}
 for(const b of s.balls){ctx.globalAlpha=1;if(s.landingGlow){ctx.globalAlpha=s.landingGlow;ctx.strokeStyle=s.accent;ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,b.r+6+(1-s.landingGlow)*18,0,7);ctx.stroke();ctx.globalAlpha=1;}if(b.trail){ctx.strokeStyle=s.accent+'75';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+(s.own?-8:8),b.y+(s.own?20:-20));ctx.stroke();}ctx.fillStyle=F.steel;ctx.strokeStyle=s.accent;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();ctx.stroke();ctx.strokeStyle=F.light;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(b.x+2,b.y-6);ctx.lineTo(b.x-3,b.y+1);ctx.lineTo(b.x+2,b.y);ctx.lineTo(b.x-1,b.y+6);ctx.stroke();}
 ctx.restore();
}
// One canvas per presentation host. Caller shares its existing RAF; no timer here.
export class AttackSpectacle {
 constructor(host,{zIndex=43}={}){this.host=host;this.canvas=document.createElement('canvas');this.canvas.className='attack-spectacle';this.canvas.setAttribute('aria-hidden','true');Object.assign(this.canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:String(zIndex)});host.append(this.canvas);this.ctx=this.canvas.getContext('2d');this.key=null;}
 clear(){if(this.key!==null){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.key=null;}this.canvas.dataset.phase='idle';}
 render(elapsed,contactMs,options={}){const s=sampleSpectacle(elapsed,contactMs,options);if(s.stage==='clip'||s.stage==='done'){this.clear();return s;}
  const w=this.host.clientWidth,h=this.host.clientHeight,d=Math.min(devicePixelRatio||1,F.maxDpr),width=Math.round(w*d),height=Math.round(h*d),key=`${s.stage==='hold'&&!s.landingGlow&&!s.impacts.some(hit=>hit.alpha>0)?'hold':Math.floor(elapsed/1000*F.fps)}:${options.count}:${width}:${height}`;if(this.key===key)return s;
  if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}this.key=key;this.canvas.dataset.phase=s.stage;this.ctx.setTransform(d,0,0,d,0,0);this.ctx.clearRect(0,0,w,h);if(s.flash){this.ctx.fillStyle=`rgba(255,232,187,${s.flash})`;this.ctx.fillRect(0,0,w,h);}s.labelX=w/2;drawSpectacle(this.ctx,s);return s;
 }
}
