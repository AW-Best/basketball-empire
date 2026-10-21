import {focusCamera,applyFocus} from '../focus.mjs';
// Adapted from the user-owned dunk lab; see ../README.md.
import {sample,duration} from './motion.mjs';
import {createDraw} from '../draw.mjs';
export function createMoveScene(ctx){
let time=0,attackCount=4,own=true;
function label(s){return String(s).replace(/YOU \/[^/]+/,own?'你 / 进攻示意':'对手 / 进攻示意').replace(/RIVAL \/[^/]+/,own?'对手 / 防守示意':'你 / 防守示意');}
const {line,circle,ball,board:rawBoard,text:rawText}=createDraw(ctx);
let showPenalty=true,quiet=false,actionOnly=false;
const text=(s,...args)=>{if(quiet&&s!=='23')return;if(!showPenalty&&s.startsWith('PENALTY'))return;rawText(label(s),...args);};const board=(x,title,accent)=>{if(!actionOnly)rawBoard(x,label(title),accent);};
const orange='#ff8345',purple='#bf95ff',cyan='#65dfd2';
function portal(x,y,r,open,t,flat=false){if(open<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(open,open*(flat?.36:1));const glow=ctx.createRadialGradient(0,0,r*.2,0,0,r*1.5);glow.addColorStop(0,'#000');glow.addColorStop(.62,'#07020e');glow.addColorStop(.72,'#d0a0ff');glow.addColorStop(.8,'#8a4fff80');glow.addColorStop(1,'#8a4fff00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,r*1.5,0,7);ctx.fill();for(let k=0;k<5;k++){ctx.save();ctx.rotate(t*(k%2?1:-1)+k);ctx.strokeStyle=k%2?'#d4b2ff':'#ffb170';ctx.lineWidth=k===0?4:1.5;ctx.beginPath();ctx.ellipse(0,0,r*(1+k*.07),r*(.55+k*.1),k*.35,.2,5.5);ctx.stroke();ctx.restore()}circle(0,0,r*.62,'#020109');for(let i=0;i<24;i++){const a=i*2.399+t*.6,rad=r*(.7+(i%7)*.09);circle(Math.cos(a)*rad,Math.sin(a)*rad,1.5,i%3?purple:orange)}ctx.restore()}
function athlete(s){const p=s.player;if(p.scale<=0)return;ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale,p.scale);ctx.rotate(p.rotation);ctx.shadowColor=purple;ctx.shadowBlur=14;
 line([[-13,25],[-30,59],[-42,79]],'#b77755',16);line([[13,25],[35,49],[27,79]],'#d09570',16);line([[-48,81],[-29,81]],'#ecf7f3',9);line([[21,81],[41,81]],'#ecf7f3',9);
 line([[-17,-30],[-42,-12],[-54,-37]],'#b77755',13);line([[16,-35],[s.hand.x<0?35:28,(s.hand.y-35)/2],[s.hand.x,s.hand.y]],'#d09570',14);
 ctx.fillStyle=orange;ctx.beginPath();ctx.moveTo(-23,-41);ctx.lineTo(23,-41);ctx.lineTo(26,16);ctx.lineTo(-26,16);ctx.closePath();ctx.fill();ctx.fillStyle='#233748';ctx.fillRect(-26,16,52,18);text('23',0,-1,25,'#13202b','center');circle(0,-64,18,'#d09570');ctx.fillStyle='#14202a';ctx.beginPath();ctx.arc(0,-70,18,Math.PI,Math.PI*2);ctx.fill();line([[-15,-65],[14,-65]],purple,4);
 if(s.t<5.2)ball(s.hand.x,s.hand.y);ctx.restore()}
function renderFrame(){const s=sample(time),t=s.t;ctx.setTransform(ctx.canvas.width/1120,0,0,ctx.canvas.height/580,0,0);ctx.clearRect(0,0,1120,580);ctx.save();if(t>=5.16&&t<5.4)ctx.translate(Math.sin((t-5.16)*110)*6*(1-(t-5.16)/.24),Math.sin((t-5.16)*80)*3);const g=ctx.createLinearGradient(0,0,1120,580);g.addColorStop(0,'#171d31');g.addColorStop(.5,'#080c19');g.addColorStop(1,'#132631');ctx.fillStyle=g;ctx.fillRect(0,0,1120,580);applyFocus(ctx,actionOnly?focusCamera('blackhole',time*1000):s.camera);
 for(let i=0;i<110;i++){const x=(i*137.9)%1120,y=(i*73.2)%520;circle(x,y,i%5===0?1.5:.65,i%3?'#8a94bd55':'#dbbdff88')}
 for(let i=-8;i<16;i++)line([[560+i*60,514],[560+i*150,580]],'#443d6038',1);line([[0,514],[1120,514]],'#4f4769',1);
 board(56,'YOU / 时空进攻方',orange);
 ctx.save();if(t>=6.2&&t<6.7)ctx.translate(Math.sin(t*85)*7*(1-(t-6.2)/.5),0);board(762,'RIVAL / 对方棋盘',cyan);
 if(s.obstacles&&attackCount>0){ctx.save();ctx.shadowBlur=20;ctx.shadowColor=orange;circle(884,296,19,'#655b77');line([[881,280],[877,292],[888,299],[883,313]],orange,3);circle(891,287,3,'#a38bb2');ctx.restore();text('×'+attackCount+' 陨石障碍',884,349,18,orange,'center')};ctx.restore();
 text('SPACE HAS NO DEFENSE.',560,35,13,'#af9cc7','center');
 // Rift is above the rival board; the entrance is centered in the left court.
 portal(500,222,86,s.leftPortal,t);portal(875,106,78,s.rightPortal,t,true);
 if(t>0&&t<3.4){text('入口 / EVENT HORIZON',500,352,12,purple,'center');for(let i=0;i<32;i++){const a=i*2.4+t*2,r=94+((i*23-t*80)%110+110)%110;line([[500+Math.cos(a)*r,222+Math.sin(a)*r],[500+Math.cos(a)*(r+10),222+Math.sin(a)*(r+10)]],'#bd92ff55',1.3)}}
 if(t>=2.8&&t<3.4){const u=(t-2.8)/.6;ctx.save();ctx.globalAlpha=Math.sin(u*Math.PI);for(let i=0;i<18;i++){const x=540+i*18;line([[x,205-i*5],[x+30,200-i*5]],purple,2)}text('空间穿越中',665,297,20,purple,'center');ctx.restore()}
 if(s.player.scale>0){ctx.save();ctx.globalAlpha=.3;ctx.beginPath();ctx.ellipse(s.player.x,510,45*s.player.scale,7,0,0,7);ctx.fillStyle='#000';ctx.fill();ctx.restore()}
 // Persistent backboard and rear rim, visible before emergence.
 if(t>=2.8){ctx.save();ctx.globalAlpha=Math.min(1,(t-2.8)/.35);ctx.fillStyle='#16232ed9';ctx.fillRect(921,128,68,105);ctx.strokeStyle='#c6d5df';ctx.lineWidth=4;ctx.strokeRect(921,128,68,105);ctx.strokeRect(930,177,37,36);line([[920,210],[936,210]],'#9caeb9',6);ctx.strokeStyle=orange;ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(884,s.rimY,43,12,0,Math.PI,Math.PI*2);ctx.stroke();ctx.restore()}
 athlete(s);
 // Front rim overlays the body to make emerging from the portal legible.
 if(t>=1.8&&t<2.8){ctx.save();ctx.translate(500,222);ctx.strokeStyle=purple;ctx.shadowBlur=20;ctx.shadowColor=purple;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,68,0,Math.PI);ctx.stroke();ctx.restore()}
 // Ball passes behind the front rim and the stretching net.
 if(t>=5.2&&t<6.2){for(let i=12;i>0;i--){const b=sample(Math.max(5.2,t-i*.015)).ball;circle(b.x,b.y,17*(1-i/14),`rgba(193,128,255,${.5-i*.035})`)}ball(s.ball.x,s.ball.y,18);if(t>=5.55){ctx.strokeStyle=purple;ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.ball.x,s.ball.y,24,0,7);ctx.stroke()}}
 if(t>=2.8){ctx.save();ctx.globalAlpha=Math.min(1,(t-2.8)/.35);const stretch=t>=5.2&&t<5.55?Math.sin((t-5.2)/.35*Math.PI)*19:0;
 for(let i=0;i<7;i++){const x=844+i*13.3,bx=856+i*9;line([[x,s.rimY+3],[bx,252+stretch]],'#edf6f2aa',1.6)}
 for(let i=1;i<4;i++){const u=i/3;line([[844+12*u,s.rimY+u*(252+stretch-s.rimY)],[924-14*u,s.rimY+u*(252+stretch-s.rimY)]],'#edf6f299',1.3)}
 ctx.strokeStyle=orange;ctx.lineWidth=7;ctx.shadowColor=orange;ctx.shadowBlur=t>=5&&t<5.9?18:5;ctx.beginPath();ctx.ellipse(884,s.rimY,43,12,0,0,Math.PI);ctx.stroke();ctx.restore()}
 if(t>=4.65&&t<5){text('蓄 势',728,162,25,orange,'center');line([[797,103],[817,128]],'#ff8345aa',3)}
 if(t>=5.16&&t<5.46){const u=(t-5.16)/.3;ctx.save();ctx.globalAlpha=1-u;ctx.fillStyle='#ffffff';ctx.fillRect(828,190,112,36);ctx.strokeStyle=orange;ctx.lineWidth=4;ctx.beginPath();ctx.arc(884,215,35+u*95,0,7);ctx.stroke();text('SLAM!',717,246,42,orange,'center');for(let i=0;i<12;i++){const a=i*Math.PI/6;line([[884+Math.cos(a)*(45+u*30),215+Math.sin(a)*(25+u*20)],[884+Math.cos(a)*(65+u*65),215+Math.sin(a)*(45+u*40)]],orange,3)}ctx.restore()}
 if(t>=6.2&&t<7.15){const u=(t-6.2)/.95;ctx.save();ctx.globalAlpha=1-u;for(let k=0;k<2;k++){ctx.strokeStyle=k?purple:orange;ctx.lineWidth=4-k;ctx.beginPath();ctx.ellipse(884,296,25+u*(125+k*25),(25+u*(125+k*25))*.65,0,0,7);ctx.stroke()}for(let i=0;i<24;i++){const a=i*2.4;circle(884+Math.cos(a)*(25+u*130),296+Math.sin(a)*(25+u*105),3,i%2?orange:purple)}text('COSMIC SLAM!',681,390,30,orange,'center');ctx.restore()}
 ctx.restore();if(!actionOnly){text('ENERGY / '+(t===0?'MAX':'RELEASED'),56,546,12,orange);ctx.fillStyle=t===0?orange:'#37404d';ctx.fillRect(56,555,244,3);text('PENALTY / '+(s.obstacles*attackCount),762,546,12,cyan);}text(t===0?'READY TO BEND SPACE':s.phase.toUpperCase(),560,552,13,purple,'center');if(s.camera.zoom>1.01){text('DUNK CAM / '+s.camera.zoom.toFixed(2)+'×',32,35,12,purple);line([[24,54],[24,20],[58,20]],purple,2);line([[1062,20],[1096,20],[1096,54]],purple,2)}

}
return {render(ms,options={}){showPenalty=options.showPenalty!==false;quiet=options.quiet===true;actionOnly=options.actionOnly===true;time=Math.max(0,Math.min(duration,ms/1000));attackCount=Math.max(0,Math.min(4,options.count??4));own=options.own!==false;renderFrame();}};
}
