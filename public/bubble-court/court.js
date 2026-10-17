import {events,Events,emit} from './EventBus.js?v=8';
import {dunkTime} from './effects.js?v=8';
import {FX} from './Constants.js?v=8';
import {dunkPose} from './motion.js';
/** A joint-based 2D player. Every limb is interpolated; the ball follows the hand until rim contact. */
export class CourtAnimation{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.start=0;this.rest=0;this.active=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;new ResizeObserver(()=>this.resize()).observe(canvas);this.resize();this.tick=this.tick.bind(this);requestAnimationFrame(this.tick);}
 resize(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.max(1,r.width*d);this.canvas.height=Math.max(1,r.height*d);}
 play({preview=false}={}){this.preview=preview;this.impacted=false;this.start=performance.now();this.active=true;}
 reset(){this.active=false;this.rest=0;}
 line(points,color,width){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
 ellipse(x,y,rx,ry,color){const c=this.ctx;c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 tick(now){const c=this.ctx,W=this.canvas.width,H=this.canvas.height;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.scale(W/390,H/240);
 let t=this.active?Math.min(1,(now-this.start)/FX.dunkDuration):this.rest;if(t>=1){this.active=false;this.rest=1;}if(this.reduced&&this.active)t=.74;
 const visualT=dunkTime(t,this.reduced);
 const p=dunkPose(visualT),hip=p.hip,shoulder={x:hip.x-5,y:hip.y-34},head={x:shoulder.x-1,y:shoulder.y-15},impact=visualT>=.59&&visualT<.8,shake=impact&&!this.reduced?Math.sin((visualT-.59)*120)*2*(1-(visualT-.59)/.21):0;
 const phase=visualT;
 if(this.active&&phase>=.6&&!this.impacted){this.impacted=true;emit(Events.IMPACT,{preview:this.preview});}
 c.save();if(this.active&&!this.reduced&&impact)c.translate(shake*.8,shake*.5);
 // Court spectators react as the ball passes through the hoop.
 for(let i=0;i<13;i++){const x=18+i*28,y=207+(i%3)*2,lift=impact?Math.sin(i+phase*30)*3:0;this.ellipse(x,y-14+lift,3.6,4,'#10233ce6');this.line([{x,y:y-9+lift},{x:x+1,y:y+3}],'#172e48',6);this.line([{x:x-6,y:y-5-(impact?8:0)},{x,y:y-9+lift},{x:x+7,y:y-4-(impact?9:0)}],'#17314d',2);}
 // Ascending trails are behind the player and never cover the bubble board.
 if(this.active&&!this.reduced&&phase>.18&&phase<.65){for(let i=1;i<5;i++){const trail=dunkPose(dunkTime(Math.max(0,t-i*.018)));c.globalAlpha=.12*(1-i/5);this.line([{x:trail.hip.x,y:trail.hip.y},{x:trail.hip.x-5,y:trail.hip.y-34}],FX.cyan,24);}c.globalAlpha=1;}
 if(this.active&&!this.reduced&&phase>.12&&phase<.3){for(let i=0;i<8;i++){const a=i/8*Math.PI;this.ellipse(155+Math.cos(a)*(phase-.12)*140,225-Math.sin(a)*(phase-.12)*35,3,1.5,'#d8af7377');}}
 // Shadow contracts in flight, then expands as the player returns to the pavement.
 this.ellipse(hip.x,227,Math.max(13,24-(190-hip.y)*.15),4,'#020c2088');
 // Backboard support and glass, with a subtle impact vibration.
 this.line([{x:358,y:222},{x:358,y:95},{x:331,y:100}],'#13283b',7);c.fillStyle='#c7edf33b';c.strokeStyle='#d2f6ffbb';c.lineWidth=2;c.beginPath();c.moveTo(283,92);c.lineTo(336,84);c.lineTo(336,128);c.lineTo(283,136);c.closePath();c.fill();c.stroke();c.strokeStyle='#effaff';c.strokeRect(298,108,24,20);
 // Far leg first, then near leg; outlined limbs create a coherent silhouette.
 const drawLeg=(k,f,near)=>{this.line([hip,k,f],'#08162a',15);this.line([hip,k],near?'#197dcc':'#115c9e',11);this.line([k,{x:f.x,y:f.y-4}],near?'#bf805b':'#945d43',7);this.line([{x:f.x-5,y:f.y-1},{x:f.x+9,y:f.y-1}],'#d5f5ff',7);this.line([{x:f.x-5,y:f.y+2},{x:f.x+9,y:f.y+2}],'#193a50',2);};drawLeg(p.knee2,p.foot2,false);
 const reach=this.active?Math.sin(phase*Math.PI)*16:0,backHand={x:shoulder.x-22-reach,y:shoulder.y+17-reach},backElbow={x:shoulder.x-22-reach*.5,y:shoulder.y-1};this.line([shoulder,backElbow,backHand],'#102034',12);this.line([shoulder,backElbow,backHand],'#a86e4c',8);
 drawLeg(p.knee,p.foot,true);
 // Jersey and shorts follow the torso, with shoulders and a tapered waist.
 const g=c.createLinearGradient(hip.x-20,0,hip.x+12,0);g.addColorStop(0,'#094b8a');g.addColorStop(.5,'#32b7e8');g.addColorStop(1,'#0f72b6');c.fillStyle=g;c.strokeStyle='#091f37';c.lineWidth=2;c.beginPath();c.moveTo(shoulder.x-12,shoulder.y);c.lineTo(shoulder.x+11,shoulder.y);c.lineTo(hip.x+12,hip.y);c.lineTo(hip.x-14,hip.y);c.closePath();c.fill();c.stroke();this.line([{x:shoulder.x-8,y:shoulder.y+5},{x:hip.x-10,y:hip.y-4}],'#adf2ff',2);c.fillStyle='#e1fbff';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText('07',hip.x-3,hip.y-11);
 this.ellipse(head.x,head.y,9,11,'#c68c63');this.ellipse(head.x+8,head.y+1,2,3,'#bd7d55');c.fillStyle='#101b2a';c.beginPath();c.arc(head.x,head.y-4,10,Math.PI,Math.PI*2);c.lineTo(head.x+8,head.y-2);c.lineTo(head.x-9,head.y-1);c.fill();c.fillStyle='#162636';c.fillRect(head.x+4,head.y-1,2,1.6);
 const elbow={x:shoulder.x+(p.hand.x-shoulder.x)*.55+5,y:shoulder.y+(p.hand.y-shoulder.y)*.5+6};this.line([shoulder,elbow,p.hand],'#101e30',13);this.line([shoulder,elbow,p.hand],'#c58a62',9);this.ellipse(p.hand.x,p.hand.y,5,4,'#d29b71');
 // Ball is physically attached to the hand until release, then falls through the hoop.
 if(phase<.96){const b=p.ball,gr=c.createRadialGradient(b.x-3,b.y-4,1,b.x,b.y,10);gr.addColorStop(0,'#ffc56b');gr.addColorStop(1,'#dd681d');this.ellipse(b.x,b.y,10,10,gr);c.save();c.beginPath();c.arc(b.x,b.y,10,0,Math.PI*2);c.clip();this.line([{x:b.x-10,y:b.y-2},{x:b.x+10,y:b.y+2}],'#713510',1);c.strokeStyle='#713510';c.lineWidth=1;c.beginPath();c.ellipse(b.x,b.y,4,11,-.4,0,7);c.stroke();c.restore();}
 // Net sits in front of the falling ball. It stretches at the instant of the dunk.
 const stretch=impact?Math.sin((phase-.59)/.21*Math.PI)*8:0;for(let i=0;i<6;i++){this.line([{x:290+i*6,y:135+shake},{x:295+i*4,y:154+stretch}], '#eefaffaa',.8);}this.line([{x:292,y:143+stretch*.4},{x:320,y:143+stretch*.4}],'#effaff99',1);this.line([{x:295,y:153+stretch},{x:315,y:153+stretch}],'#effaffaa',1);c.strokeStyle='#ff8c39';c.lineWidth=3;c.beginPath();c.ellipse(307,132+shake,19,4,0,0,7);c.stroke();
 if(impact){c.strokeStyle=`rgba(95,231,255,${1-(phase-.59)/.21})`;c.lineWidth=2;c.beginPath();c.ellipse(307,132,25+(phase-.59)*160,8+(phase-.59)*50,0,0,7);c.stroke();}
 if(phase>.62&&phase<.95){c.fillStyle='#ffe2a2';c.font='italic 900 22px sans-serif';c.textAlign='left';c.fillText('SLAM DUNK!',24,164);c.font='bold 11px sans-serif';c.fillStyle=FX.cyan;c.fillText('OWN THE RIM',25,181);}
 // Landing dust expands outward and fades, emphasizing weight after hang time.
 if(this.active&&!this.reduced&&phase>.85){const u=(phase-.85)/.15;c.globalAlpha=1-u;for(let i=0;i<10;i++)this.ellipse(281+(i-5)*u*11,225-(i%3)*Math.sin(u*Math.PI)*5,4+u*5,1.5,'#b7c9d477');c.globalAlpha=1;}
 c.restore();requestAnimationFrame(this.tick);}
}
