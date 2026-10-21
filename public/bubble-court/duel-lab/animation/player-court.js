import {PLAYER} from './player-config.js';
import {samplePlayer} from './player-motion.js';
const ink='#142f38',skin='#d99b69';
export class PlayerCourt{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.reduced={matches:false};this.moment=null;this.own=true;}
 reset(){this.moment=null;}
 play(event,own=true){this.moment=event;this.own=own;}
 path(points,fill,stroke=ink,width=2){const c=this.ctx;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}}
 line(points,color,width=2){const c=this.ctx;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
 ellipse(x,y,rx,ry,color,stroke=null,width=2){const c=this.ctx;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 segment(a,b,width,color){this.line([a,b],ink,width+3);this.line([a,b],color,width);}
 ball(p){const c=this.ctx;this.ellipse(p.x,p.y,12,12,'#ef813c',ink,2);c.save();c.beginPath();c.arc(p.x,p.y,11,0,Math.PI*2);c.clip();this.line([{x:p.x-13,y:p.y+2},{x:p.x+13,y:p.y-2}],ink,1.2);c.strokeStyle=ink;c.lineWidth=1.2;for(const offset of [-10,10]){c.beginPath();c.ellipse(p.x+offset,p.y,11,15,0,0,Math.PI*2);c.stroke();}this.ellipse(p.x-4,p.y-5,3,2,'#ffc176');c.restore();}
 shoe(p){const c=this.ctx;c.save();c.translate(p.x,p.y);this.path([{x:-7,y:-3},{x:3,y:-3},{x:7,y:1},{x:17,y:3},{x:18,y:8},{x:-8,y:8}], '#f7e6bd');this.line([{x:-7,y:7},{x:17,y:7}],'#e38c45',3);this.line([{x:2,y:1},{x:6,y:3}],'#5a7169',1.5);c.restore();}
 leg(l,back){this.segment(l.start,l.joint,15,back?'#ac7657':skin);this.segment(l.joint,l.end,10,back?'#b18060':'#e3ad7c');const a={x:l.joint.x+(l.end.x-l.joint.x)*.60,y:l.joint.y+(l.end.y-l.joint.y)*.60};this.segment(a,l.end,11,back?'#c8c5a6':'#f1e7ca');this.shoe(l.end);}
 arm(l,back){this.segment(l.start,l.joint,12,back?'#b67c59':skin);this.segment(l.joint,l.end,9,back?'#bc845f':'#e8ad76');this.ellipse(l.end.x,l.end.y,5.5,5,back?'#bc845f':'#e8ad76',ink,1.4);}
 background(p){const c=this.ctx;const sky=c.createLinearGradient(0,0,0,290);sky.addColorStop(0,'#b7c6a9');sky.addColorStop(.75,'#e1d5ae');c.fillStyle=sky;c.fillRect(0,0,400,320);this.ellipse(73,67,28,28,'#edd9a6');
 c.fillStyle='#7b9a8d';for(const [x,y,w] of [[0,86,32],[34,106,26],[65,91,39],[110,117,24],[148,99,34],[191,117,34],[239,88,41],[291,112,44],[352,93,48]])c.fillRect(x,y,w,161-y);
 c.fillStyle='#698b80';c.fillRect(0,159,400,74);c.save();c.beginPath();c.rect(0,163,400,70);c.clip();for(let x=-100;x<500;x+=17){this.line([{x,y:163},{x:x+74,y:233}],'#9bb4a0',.7);this.line([{x,y:163},{x:x-74,y:233}],'#9bb4a0',.7);}c.restore();this.line([{x:0,y:160},{x:400,y:160}],ink,2);for(const x of [16,197,385])this.line([{x,y:158},{x,y:235}], '#3d655e',3);
 c.fillStyle='#c8b793';c.fillRect(0,233,400,87);this.line([{x:0,y:285},{x:400,y:285}],'#8c9a7f',1);this.line([{x:36,y:320},{x:137,y:244},{x:378,y:244}],'#eee4bd',2);c.beginPath();c.ellipse(295,282,63,18,0,0,Math.PI*2);c.strokeStyle='#eee4bd';c.lineWidth=2;c.stroke();c.fillStyle='#426a60';c.font='italic 900 20px sans-serif';c.fillText('HOOPIRE',29,204);c.font='700 6px sans-serif';c.fillText('THE COURT IS YOURS',30,216);
 this.line([{x:359,y:280},{x:359,y:45},{x:348,y:45}], '#355751',9);this.line([{x:359,y:280},{x:359,y:45}], '#789389',3);this.path([{x:327,y:32},{x:377,y:42},{x:377,y:88},{x:327,y:78}], '#e3e2c7',ink,2.5);this.path([{x:337,y:51},{x:362,y:56},{x:362,y:78},{x:337,y:73}],null,'#d2784b',2);this.line([{x:348,y:87},{x:348,y:98},{x:319,y:p.rim.y}], '#33574f',4);
 }
 net(p,front=false){const {x,y}=p.rim;const depth=32+9*Math.sin(Math.PI*Math.max(0,Math.min(1,(p.t-.5)/.2)));const tint=front?'#f4ecd2':'#adc3ad',offset=front?3:-2;
 for(let i=0;i<7;i++){const u=i/6;this.line([{x:x-22+44*u,y:y+offset},{x:x-12+24*u,y:y+depth}],tint,front?1.2:.9);}
 for(let j=1;j<=3;j++){const q=j/3;this.line([{x:x-22+10*q,y:y+depth*q+offset*(1-q)},{x:x+22-10*q,y:y+depth*q+offset*(1-q)}],tint,front?1.2:.9);}}
 rimArc(p,front=false){const c=this.ctx;c.beginPath();c.ellipse(p.rim.x,p.rim.y,24,5,0,front?0:Math.PI,front?Math.PI:2*Math.PI);c.strokeStyle=ink;c.lineWidth=5;c.stroke();c.strokeStyle=front?'#ef9d50':'#bb663a';c.lineWidth=3;c.stroke();}

 draw(ms){const canvas=this.canvas,c=this.ctx,dpr=Math.min(globalThis.devicePixelRatio||1,1.5),w=canvas.clientWidth||400,height=canvas.clientHeight||320;const bw=Math.round(w*dpr),bh=Math.round(height*dpr);if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}c.setTransform(bw/PLAYER.width,0,0,bh/PLAYER.height,0,0);c.clearRect(0,0,400,320);const p=samplePlayer(ms/PLAYER.duration,this.reduced.matches);this.background(p);
 const air=Math.max(0,285-p.footFront.y-9);this.ellipse(p.hip.x+4,289,22-air*.1,4,'#294c4140');this.net(p,false);this.rimArc(p,false);
 const jersey=this.own?'#28776e':'#d16b38',light=this.own?'#72baa2':'#f0a45c',h=p.hip;
 this.leg(p.limbs.legBack,true);this.arm(p.limbs.armBack,true);this.leg(p.limbs.legFront,false);
 // A broad jersey and asymmetrical shorts give the figure volume without 3D assets.
 this.path([{x:h.x-12,y:h.y-51},{x:h.x+13,y:h.y-51},{x:h.x+21,y:h.y-9},{x:h.x+14,y:h.y+5},{x:h.x-19,y:h.y+4},{x:h.x-17,y:h.y-17}],jersey,ink,2.4);
 this.path([{x:h.x-12,y:h.y-47},{x:h.x-7,y:h.y-42},{x:h.x+5,y:h.y-42},{x:h.x+11,y:h.y-49}],null,'#f1ddaf',3);
 this.path([{x:h.x-17,y:h.y-32},{x:h.x-13,y:h.y-8},{x:h.x-7,y:h.y-8},{x:h.x-10,y:h.y-35}],light,null);
 c.fillStyle='#f7e4b9';c.font='italic 900 18px sans-serif';c.fillText('07',h.x-8,h.y-14);
 this.path([{x:h.x-18,y:h.y-3},{x:h.x+18,y:h.y-3},{x:h.x+23,y:h.y+18},{x:h.x+7,y:h.y+23},{x:h.x+1,y:h.y+7},{x:h.x-3,y:h.y+23},{x:h.x-22,y:h.y+19}], '#213e49',ink,2);this.line([{x:h.x-20,y:h.y+16},{x:h.x-5,y:h.y+19}], '#eedcaf',2);this.line([{x:h.x+9,y:h.y+19},{x:h.x+21,y:h.y+15}], '#eedcaf',2);
 this.segment({x:p.head.x,y:p.head.y+8},{x:p.head.x,y:p.head.y+20},9,skin);
 this.arm(p.limbs.armFront,false);
 // Face points toward the basket; compact hair, nose and jaw keep it readable on phones.
 const head=p.head;this.path([{x:head.x-11,y:head.y-8},{x:head.x+6,y:head.y-10},{x:head.x+11,y:head.y-3},{x:head.x+11,y:head.y+1},{x:head.x+15,y:head.y+5},{x:head.x+10,y:head.y+7},{x:head.x+8,y:head.y+13},{x:head.x-3,y:head.y+14},{x:head.x-11,y:head.y+6}],skin,ink,1.8);this.path([{x:head.x-12,y:head.y+3},{x:head.x-13,y:head.y-8},{x:head.x-7,y:head.y-14},{x:head.x+6,y:head.y-13},{x:head.x+11,y:head.y-8},{x:head.x+3,y:head.y-5},{x:head.x-5,y:head.y-5},{x:head.x-6,y:head.y+4}],ink);this.ellipse(head.x+7,head.y+1,1.2,1.2,ink);this.line([{x:head.x+5,y:head.y+9},{x:head.x+9,y:head.y+9}], '#845438',1);
 this.ball(p.ball);
 // One rounded finger group at this scale avoids a claw-like silhouette.
 if(!p.released){this.line([{x:p.handFront.x-2,y:p.handFront.y+1},{x:p.handFront.x+3,y:p.handFront.y-3},{x:p.handFront.x+7,y:p.handFront.y-2}], '#efb783',4);}
 this.net(p,true);this.rimArc(p,true);
 if(p.t>=.5&&p.t<.69){this.ellipse(p.handFront.x,p.handFront.y-2,5,5,skin,ink,1.3);this.line([{x:p.handFront.x-3,y:p.handFront.y-4},{x:p.handFront.x+4,y:p.handFront.y-4}], '#edb584',3);}
 if(p.t>.83&&p.t<.95&&!this.reduced.matches){const a=Math.sin((p.t-.83)/.12*Math.PI);c.globalAlpha=a*.45;for(const x of [-16,9,22])this.ellipse(p.footFront.x+x,287,6,2,'#f5e6be');c.globalAlpha=1;}
 c.fillStyle='#284a42';c.font='700 7px sans-serif';c.fillText('07 / ROOKIE',18,305);c.textAlign='right';c.fillText('PLAYER STUDY · 02 SEC',382,305);c.textAlign='left';return ms<PLAYER.duration;
 }
}
