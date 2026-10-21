import {RULES as R,PALETTE as P,COMIC as C,HAND as H} from './Constants.js';
import {sampleDunk,netSection} from './comic-motion.js';

const poly=(c,points,fill,stroke=null,width=1)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}};
function ellipse(c,x,y,rx,ry,fill,stroke=null,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function backdrop(c){
 c.fillStyle=C.palette.sky;c.fillRect(0,0,C.width,C.height);
 poly(c,[[0,146],[400,104],[400,180],[0,180]],C.palette.floor);
 c.strokeStyle='#87a18b30';c.lineWidth=.7;for(let x=-80;x<410;x+=24){c.beginPath();c.moveTo(x,0);c.lineTo(x+125,125);c.moveTo(x+125,0);c.lineTo(x,125);c.stroke();}
 poly(c,[[0,145],[400,103],[400,111],[0,152]],'#0b2c3555');
 c.strokeStyle='#a9c79766';c.lineWidth=1.2;c.beginPath();c.moveTo(16,180);c.lineTo(241,128);c.lineTo(377,164);c.stroke();c.beginPath();c.ellipse(188,166,51,13,-.2,0,7);c.stroke();
 c.fillStyle='#d4daa817';for(let y=8;y<180;y+=12)for(let x=(y%24?6:0);x<300;x+=12){c.beginPath();c.arc(x,y,.85,0,7);c.fill();}
 poly(c,[[277,0],[283,0],[283,180],[277,180]],'#143940');
}
function backboard(c,rim){
 const dy=(rim.y-C.rim.y)*.16;c.save();c.translate(0,dy);
 poly(c,[[219,11],[292,17],[292,72],[219,66]],'#08242f',C.palette.shadow,7);
 poly(c,[[220,12],[290,18],[290,69],[220,64]],'#456b64',P.paper,2.5);
 poly(c,[[239,36],[274,39],[274,65],[239,62]],'#294d49',P.paper,2);
 poly(c,[[225,17],[255,20],[225,52]],'#b8d7b820');
 c.strokeStyle=P.ink;c.lineWidth=9;c.beginPath();c.moveTo(272,68);c.lineTo(272,82);c.lineTo(254,rim.y);c.stroke();c.strokeStyle=P.orange;c.lineWidth=4;c.stroke();c.restore();
}
function net(c,p,front){
 c.save();c.strokeStyle=front?'#fff1ccc9':'#a9c8a466';c.lineWidth=front?1.25:.9;c.lineJoin='round';
 const sections=[0,.16,.33,.5,.67,.84,1].map(u=>netSection(p,u));
 const strand=(fraction,slant=0)=>{c.beginPath();sections.forEach((s,k)=>{const u=k/(sections.length-1),x=s.left+(s.right-s.left)*(fraction+slant*u),y=s.y+(front?3:-2)*(1-u);if(k)c.lineTo(x,y);else c.moveTo(x,y);});c.stroke();};
 for(let i=0;i<=8;i++)strand(i/8);
 for(const u of [.25,.5,.75,1]){const s=netSection(p,u);c.beginPath();c.moveTo(s.left,s.y);c.quadraticCurveTo(p.rim.x,s.y+(front?4:-3),s.right,s.y);c.stroke();}
 if(front)for(let i=0;i<8;i++)strand(i/8,1/8);
 c.restore();
}
function arm(c,p,team){
 const {shoulder:s,elbow:e,hand:h}=p;c.save();c.globalAlpha=p.armOpacity;c.lineCap='round';c.lineJoin='round';
 c.strokeStyle=C.palette.shadow;c.lineWidth=41;c.beginPath();c.moveTo(s.x,s.y);c.quadraticCurveTo(s.x+12,s.y-31,e.x,e.y+5);c.stroke();
 c.strokeStyle=team;c.lineWidth=32;c.stroke();
 const length=Math.hypot(h.x-e.x,h.y-e.y)||1,ux=(h.x-e.x)/length,uy=(h.y-e.y)/length,nx=-uy,ny=ux,wx=h.x-ux*10,wy=h.y-uy*10;
 // The sleeve tapers to a narrow, exposed wrist instead of a rigid black rod.
 c.beginPath();c.moveTo(e.x+nx*14,e.y+ny*14);c.quadraticCurveTo((e.x+wx)/2+nx*12,(e.y+wy)/2+ny*12,wx+nx*7,wy+ny*7);c.lineTo(wx-nx*7,wy-ny*7);c.quadraticCurveTo((e.x+wx)/2-nx*9,(e.y+wy)/2-ny*9,e.x-nx*14,e.y-ny*14);c.closePath();c.fillStyle=H.sleeve;c.fill();c.strokeStyle=H.ink;c.lineWidth=3;c.stroke();
 c.strokeStyle='#709b9766';c.lineWidth=2.4;c.beginPath();c.moveTo(e.x+nx*9,e.y+ny*9);c.lineTo(wx+nx*4,wy+ny*4);c.stroke();
 c.strokeStyle=P.paper;c.lineWidth=3.5;c.beginPath();c.moveTo(e.x+nx*13-ux*4,e.y+ny*13-uy*4);c.lineTo(e.x-nx*13-ux*4,e.y-ny*13-uy*4);c.stroke();
 c.strokeStyle=H.ink;c.lineWidth=17;c.beginPath();c.moveTo(wx,wy);c.lineTo(h.x,h.y+1);c.stroke();c.strokeStyle=H.skin;c.lineWidth=12;c.stroke();
 const rig=p.handRig;c.save();c.translate(rig.wrist.x,rig.wrist.y);c.rotate(rig.angle);
 // Rear thumb opposes the front fingers; the thumb-index notch stays open.
 const thumb=rig.thumb;c.beginPath();c.moveTo(thumb.base.x,thumb.base.y);c.quadraticCurveTo(thumb.knuckle.x,thumb.knuckle.y,thumb.tip.x,thumb.tip.y);c.strokeStyle=H.ink;c.lineWidth=8.5;c.stroke();c.strokeStyle=H.shadow;c.lineWidth=5.5;c.stroke();
 c.beginPath();c.moveTo(-8,6);c.bezierCurveTo(-11,-2,-12,-11,-8,-16);c.quadraticCurveTo(-2,-21,5,-18);c.lineTo(9,-13);c.lineTo(11,-7);c.quadraticCurveTo(14,-5,13,-1);c.lineTo(8,6);c.closePath();c.fillStyle=H.skin;c.fill();c.strokeStyle=H.ink;c.lineWidth=2;c.stroke();
 // Finger roots join the palm behind the ball/rim, without three dark tubes.
 for(const f of rig.fingers){c.beginPath();c.moveTo(f.base.x,f.base.y);c.quadraticCurveTo(f.knuckle.x,f.knuckle.y,f.padStart.x,f.padStart.y);c.strokeStyle=H.skin;c.lineWidth=H.fingerWidth+1;c.stroke();}
 c.beginPath();c.moveTo(-7,2);c.quadraticCurveTo(-10,-9,-5,-14);c.strokeStyle=H.light;c.lineWidth=2.2;c.stroke();
 c.beginPath();c.moveTo(5,-11);c.quadraticCurveTo(1,-6,6,-2);c.strokeStyle=H.shadow;c.lineWidth=1.4;c.stroke();
 c.restore();c.restore();
}
function basketball(c,p){
 if(p.ballOpacity<=0)return;c.save();c.globalAlpha=p.ballOpacity;c.translate(p.ball.x,p.ball.y);
 const squash=p.phase==='impact'?.92:1;c.scale(1+(1-squash)*.4,squash);const r=C.ballRadius;
 const fill=c.createLinearGradient(-r,-r,r,r);fill.addColorStop(0,'#ffd572');fill.addColorStop(.42,'#ff9e42');fill.addColorStop(1,'#dc612c');
 ellipse(c,2,2,r+2,r+2,'#08242f');ellipse(c,0,0,r,r,fill,C.palette.shadow,3);
 c.save();c.beginPath();c.arc(0,0,r-1,0,7);c.clip();c.rotate(p.released?.25:-.15);
 c.strokeStyle='#6d3327';c.lineWidth=2.2;c.beginPath();c.moveTo(-r-2,0);c.bezierCurveTo(-4,7,10,-5,r+2,0);c.moveTo(-3,-r-2);c.bezierCurveTo(11,-9,-9,10,1,r+2);c.moveTo(-r,-r*.7);c.bezierCurveTo(-4,-r*.6,-4,r*.6,r,r*.7);c.moveTo(r,-r*.7);c.bezierCurveTo(4,-r*.6,4,r*.6,-r,r*.7);c.stroke();c.restore();
 c.strokeStyle='#fff1bc';c.lineWidth=3.5;c.lineCap='round';c.beginPath();c.arc(-1,-1,r*.68,3.45,4.35);c.stroke();
 c.restore();
}
function rim(c,p,front){
 c.save();c.strokeStyle=C.palette.shadow;c.lineWidth=front?10:7;c.beginPath();c.ellipse(p.rim.x,p.rim.y,p.rim.rx,p.rim.ry,0,front?0:Math.PI,front?Math.PI:Math.PI*2);c.stroke();c.strokeStyle=front?'#ff9c45':'#d67334';c.lineWidth=front?5:4;c.stroke();
 if(front){c.strokeStyle='#ffd58a';c.lineWidth=1.7;c.beginPath();c.ellipse(p.rim.x,p.rim.y-1,p.rim.rx-2,p.rim.ry,0,.15,Math.PI-.15);c.stroke();}c.restore();
}
function fingers(c,p){
 const rig=p.handRig;c.save();c.globalAlpha=p.armOpacity;c.lineCap='round';c.lineJoin='round';c.translate(rig.wrist.x,rig.wrist.y);c.rotate(rig.angle);
 for(const f of rig.fingers){
  c.beginPath();c.moveTo(f.padStart.x,f.padStart.y);c.quadraticCurveTo(f.padControl.x,f.padControl.y,f.tip.x,f.tip.y);c.strokeStyle=H.ink;c.lineWidth=H.fingerOutline;c.stroke();c.strokeStyle=H.skin;c.lineWidth=H.fingerWidth;c.stroke();
  const mid={x:(f.padStart.x+f.tip.x)/2,y:(f.padStart.y+f.tip.y)/2};
  c.beginPath();c.moveTo(mid.x-1.4,mid.y-.2);c.lineTo(mid.x+.8,mid.y+.2);c.strokeStyle=H.shadow;c.lineWidth=.9;c.stroke();
 }
 c.restore();
}
function spectacle(c,p,team){
 if(p.speedLines>0){c.save();c.globalAlpha=p.speedLines*.75;c.strokeStyle='#ffe16e';c.lineCap='square';for(let i=0;i<C.speedLines;i++){const x=60+i*24,y=175-i*12;c.lineWidth=i%3?1.5:4;c.beginPath();c.moveTo(x,y);c.lineTo(x-31,y+36);c.stroke();}c.restore();}
 if(p.impact>0){c.save();c.globalAlpha=p.impact;for(let i=0;i<C.fragments;i++){const a=i/C.fragments*Math.PI*2;c.strokeStyle=i%2?P.paper:C.palette.yellow;c.lineWidth=i%2?2:5;c.beginPath();c.moveTo(p.rim.x+Math.cos(a)*44,p.rim.y+Math.sin(a)*29);c.lineTo(p.rim.x+Math.cos(a)*64,p.rim.y+Math.sin(a)*49);c.stroke();}c.restore();}
 if(p.attackOpacity<=0)return;c.save();c.globalAlpha=p.attackOpacity;c.translate(105,142);c.rotate(-.1);c.scale(p.textScale*.82,p.textScale*.82);
 poly(c,[[-75,-28],[-52,-31],[-47,-40],[-29,-33],[51,-38],[57,-24],[79,-20],[65,0],[75,20],[40,19],[22,30],[-5,23],[-66,28],[-61,8],[-80,2]],C.palette.yellow,C.palette.shadow,4);
 c.fillStyle=C.palette.shadow;c.font='italic 950 42px sans-serif';c.textAlign='center';c.fillText('SLAM!',0,9);c.restore();
 c.save();c.globalAlpha=p.attackOpacity;c.translate(175+p.sendProgress*100,157-p.sendProgress*24);c.rotate(-.08);poly(c,[[-24,-12],[29,-12],[25,10],[-28,10]],team,C.palette.shadow,2);c.fillStyle=C.palette.shadow;c.font='900 14px sans-serif';c.textAlign='center';c.fillText('+4 →',0,4);c.restore();
}

// No internal RAF or rule callbacks: callers own the absolute clock and lifecycle.
export class ComicCourt{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.moment=null;this.lastEvent=null;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');}
 play(event,own){const identity={round:event.roundId??0,id:event.id??0};if(this.lastEvent&&(identity.round<this.lastEvent.round||(identity.round===this.lastEvent.round&&identity.id<=this.lastEvent.id)))return false;this.lastEvent=identity;this.moment={...event,own};return true;}
 reset(){this.moment=null;this.lastEvent=null;this.canvas.dataset.phase='idle';this.canvas.dataset.owner='none';}
 draw(now){
  const {canvas,ctx:c}=this,w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(globalThis.devicePixelRatio||1,C.maxDpr);
  if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
  c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.save();
  const scale=Math.min(w/C.width,h/C.height);c.translate((w-C.width*scale)/2,(h-C.height*scale)/2);c.scale(scale,scale);
  const progress=this.moment?(now-this.moment.at)/R.dunkMs:-1,p=sampleDunk(progress,this.reduced.matches),active=p.active,team=this.moment?.own?P.teal:P.orange;
  if(active){c.translate(C.rim.x,C.rim.y);c.scale(p.camera.zoom,p.camera.zoom);c.translate(-C.rim.x+p.camera.x,-C.rim.y+p.camera.y);}
  backdrop(c);backboard(c,p.rim);net(c,p,false);rim(c,p,false);
  if(active)arm(c,p,team);if(active)basketball(c,p);net(c,p,true);rim(c,p,true);if(active)fingers(c,p);if(active)spectacle(c,p,team);
  c.restore();canvas.dataset.phase=active?p.phase:'idle';canvas.dataset.owner=active?(this.moment.own?'self':'rival'):'none';canvas.dataset.layers='rear-net ball front-net front-rim fingers';return active;
 }
}
