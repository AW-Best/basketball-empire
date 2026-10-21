import {focusCamera,applyFocus,focusPaw} from '../focus.mjs';
// Adapted from the user-owned dunk lab; see ../README.md.
import {sample,duration} from './motion.mjs';
import {createDraw} from '../draw.mjs';
export function createMoveScene(ctx){
let time=0,attackCount=4,own=true;
function label(s){return String(s).replace(/YOU \/[^/]+/,own?'你 / 进攻示意':'对手 / 进攻示意').replace(/RIVAL \/[^/]+/,own?'对手 / 防守示意':'你 / 防守示意');}
const {line,circle,ball,board:rawBoard,text:rawText}=createDraw(ctx);
let showPenalty=true,quiet=false,actionOnly=false;
const text=(s,...args)=>{if(quiet&&s!=='23')return;if(!showPenalty&&s.startsWith('PENALTY'))return;rawText(label(s),...args);};const board=(x,title,accent)=>{if(!actionOnly)rawBoard(x,label(title),accent);};
const orange='#ff8345',pink='#f69baa',cyan='#65dfd2';
function ellipse(x,y,rx,ry,fill,rotation=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,7);ctx.fillStyle=fill;ctx.fill()}
function yarn(x,y,r){circle(x,y,r,'#d084a7');ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();for(let i=-3;i<=3;i++){ctx.strokeStyle=i%2?'#f5b6cd':'#8e4a79';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x+i*5,y,r*.6,r*1.3,.65,0,7);ctx.stroke()}ctx.restore();line([[x+r-3,y+4],[x+r+8,y+13],[x+r+15,y+10]],pink,2)}
function player(t){ctx.save();ctx.translate(351,421);const arm=t<.6?0:t<1.8?Math.min(1,(t-.6)/.3):Math.max(0,1-(t-1.8));line([[-13,26],[-27,60],[-37,80]],'#c08660',16);line([[13,26],[30,57],[30,80]],'#d69d78',16);line([[-45,83],[-26,83]],'#eef4e9',10);line([[23,83],[42,83]],'#eef4e9',10);line([[18,-30],[44,-45-arm*25],[37,-57-arm*45]],'#d69d78',13);line([[-18,-30],[-40,-5],[-33,15]],'#bc7b56',13);ctx.fillStyle=orange;ctx.fillRect(-24,-40,48,58);ctx.fillStyle='#253b4d';ctx.fillRect(-24,18,48,18);text('23',0,0,24,'#13212a','center');circle(0,-63,18,'#d69d78');ellipse(0,-74,17,8,'#192630');if(t>=2.6&&t<3.6){text('?!',3,-110,25,pink,'center')}ctx.restore()}
function paw(s){if(s.t<.7||(!actionOnly&&s.t>=4.15))return;const pose=actionOnly?focusPaw(s.t*1000):s.paw;ctx.save();ctx.translate(pose.x,pose.y);ctx.shadowColor='#00000099';ctx.shadowBlur=22;
 // Huge foreleg stays connected to the screen edge. Palm reaches right to the ball.
 ctx.fillStyle='#e3b684';ctx.beginPath();ctx.moveTo(-240,-340);ctx.lineTo(-40,-340);ctx.lineTo(28,-50);ctx.quadraticCurveTo(78,20,-30,67);ctx.quadraticCurveTo(-124,70,-146,-46);ctx.closePath();ctx.fill();
 for(let i=0;i<4;i++)line([[-196+i*40,-230],[-170+i*37,-183]],'#c18a57',10);
 ellipse(-14,0,103,91,'#f5d7af',-.22);
 // Four distinct toe beans make the silhouette unmistakably feline.
 const toes=[[-37,-76,34,42], [23,-62,37,43], [66,-20,34,39], [56,37,34,37]];
 for(const [x,y,rx,ry] of toes){ellipse(x,y,rx,ry,'#f5d7af',-.3);ellipse(x+2,y+3,rx*.56,ry*.55,pink,-.3);ellipse(x-3,y-4,rx*.3,ry*.22,'#ffc7cb',-.3)}
 ellipse(-24,5,45,37,'#e894a3',-.25);ellipse(-31,-4,27,18,'#ffc0c7',-.25);
 line([[-96,-12],[-72,-23]],'#fff0d9',5);line([[-90,10],[-68,0]],'#fff0d9',5);
 ctx.restore()}
function renderFrame(){const s=sample(time),t=s.t;ctx.setTransform(ctx.canvas.width/1120,0,0,ctx.canvas.height/580,0,0);ctx.clearRect(0,0,1120,580);ctx.fillStyle='#101d29';ctx.fillRect(0,0,1120,580);ctx.save();if(t>=2.75&&t<3.03){const u=(t-2.75)/.28;ctx.translate(Math.sin(u*33)*7*(1-u),Math.cos(u*28)*3*(1-u))}applyFocus(ctx,actionOnly?focusCamera('cat',time*1000):s.camera);
 for(let i=0;i<70;i++)circle((i*157)%1120,(i*73)%510,1,i%3?'#90b3c433':'#f6d8b644');line([[0,514],[1120,514]],'#4e6474',1);for(let i=-5;i<15;i++)line([[560+i*60,514],[560+i*150,580]],'#263e4e',1);
 board(56,'YOU / 猫咪助攻',orange);ctx.save();if(t>=4.5&&t<4.95)ctx.translate(Math.sin(t*80)*6*(1-(t-4.5)/.45),0);board(762,'RIVAL / 请签收猫咪的球',cyan);if(s.obstacles&&attackCount>0){yarn(884,296,20);text('×'+attackCount+' 毛线障碍',884,349,18,pink,'center')}ctx.restore();
 player(t);
 if(t>1.4&&t<2.6){text('锁 定 目 标',540,177,15,pink,'center');ctx.strokeStyle='#f69baa88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(520,240,30,0,7);ctx.stroke();line([[480,240],[493,240]],pink,2);line([[547,240],[560,240]],pink,2)}
 paw(s);
 if(t>=2.82&&t<4.5){for(let i=16;i>0;i--){const prev=sample(Math.max(2.82,t-i*.024)).ball;ellipse(prev.x,prev.y,19*(1-i/18),11*(1-i/18),`rgba(255,153,93,${.6-i*.032})`)}for(let i=0;i<4;i++)line([[s.ball.x-80-i*18,s.ball.y-35+i*22],[s.ball.x-30,s.ball.y-35+i*22]],'#ffd4a588',2)}
 if(t<4.5){ctx.save();ctx.translate(s.ball.x,s.ball.y);if(t>=2.75&&t<2.85)ctx.scale(.65,1.35);ball(0,0,17);ctx.restore()}
 if(t>=2.75&&t<3.18){const u=(t-2.75)/.43;ctx.save();ctx.globalAlpha=1-u;text('啪！',572,142,64,pink,'center');for(let i=0;i<12;i++){const a=i*Math.PI/6;line([[520+Math.cos(a)*(30+u*20),240+Math.sin(a)*(30+u*20)],[520+Math.cos(a)*(55+u*70),240+Math.sin(a)*(55+u*70)]],i%2?pink:'#fff0d8',4)}ctx.restore()}
 if(t>=4.5&&t<5.3){const u=(t-4.5)/.8;ctx.save();ctx.globalAlpha=1-u;ctx.strokeStyle=pink;ctx.lineWidth=3;ctx.beginPath();ctx.arc(884,296,25+u*110,0,7);ctx.stroke();for(let i=0;i<18;i++){const a=i*2.4;circle(884+Math.cos(a)*u*115,296+Math.sin(a)*u*100,3,i%2?pink:orange)}text('喵？是你先动的球。',558,388,22,pink,'center');ctx.restore()}
 ctx.restore();text('SMALL BALL. BIG CAT ENERGY.',560,35,13,'#a8b9c5','center');if(!actionOnly){text('ENERGY / '+(t===0?'MAX':'RELEASED'),56,546,12,orange);text('PENALTY / '+(s.obstacles*attackCount),762,546,12,cyan);}text(s.phase.toUpperCase(),560,551,14,pink,'center');}
return {render(ms,options={}){showPenalty=options.showPenalty!==false;quiet=options.quiet===true;actionOnly=options.actionOnly===true;time=Math.max(0,Math.min(duration,ms/1000));attackCount=Math.max(0,Math.min(4,options.count??4));own=options.own!==false;renderFrame();}};
}
