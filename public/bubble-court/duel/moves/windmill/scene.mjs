import {focusCamera,applyFocus} from '../focus.mjs';
// Adapted from the user-owned dunk lab; see ../README.md.
import {sample,duration,gatherHand} from './motion.mjs';
export function createMoveScene(ctx){
let time=0,attackCount=4,own=true;
function label(s){return String(s).replace(/YOU \/[^/]+/,own?'你 / 进攻示意':'对手 / 进攻示意').replace(/RIVAL \/[^/]+/,own?'对手 / 防守示意':'你 / 防守示意');}
const orange='#ff8345',cyan='#65dfd2';
function line(points,color,width=3){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
let showPenalty=true,quiet=false,actionOnly=false;
function text(s,x,y,size,color='#dbe9ec',align='left'){if(quiet&&s!=='23')return;if(!showPenalty&&s.startsWith('PENALTY'))return;s=label(s);ctx.fillStyle=color;ctx.font=`700 ${size}px 'Avenir Next','PingFang SC',sans-serif`;ctx.textAlign=align;ctx.fillText(s,x,y)}
function ball(x,y,r=16){ctx.save();ctx.shadowColor=orange;ctx.shadowBlur=22;circle(x,y,r,orange);ctx.shadowBlur=0;ctx.strokeStyle='#7e351e';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.bezierCurveTo(x+r*.7,y-r*.2,x-r*.7,y+r*.2,x,y+r);ctx.stroke();ctx.restore()}
function board(x,title,accent){if(actionOnly)return;ctx.fillStyle='#101f2c';ctx.fillRect(x,110,244,356);ctx.strokeStyle='#304554';ctx.lineWidth=1;ctx.strokeRect(x,110,244,356);text(title,x,87,14,accent);const colors=['#5bc6c3','#ebbd61','#b883cc','#db6f72'];for(let row=0;row<5;row++)for(let col=0;col<(row%2?6:7);col++){let bx=x+20+col*34+(row%2?17:0),by=132+row*30;circle(bx,by,14,colors[(row*3+col*7)%4]);circle(bx-4,by-5,4,'#ffffff40')};line([[x+122,447],[x+122,360]],'#70858b55',2);circle(x+122,447,18,accent);text('●  ●  ●',x+122,498,12,accent,'center')}
function renderFrame(){const s=sample(time),t=s.t;ctx.setTransform(ctx.canvas.width/1120,0,0,ctx.canvas.height/580,0,0);ctx.clearRect(0,0,1120,580);const bg=ctx.createLinearGradient(0,0,0,580);bg.addColorStop(0,'#122432');bg.addColorStop(1,'#0a121c');ctx.fillStyle=bg;ctx.fillRect(0,0,1120,580);ctx.save();if(actionOnly)applyFocus(ctx,focusCamera('windmill',time*1000));
 for(let i=0;i<40;i++){circle((i*137)%1120,35+(i*71)%360,1,'#a4d8d322')}
 line([[0,512],[1120,512]],'#52616a',1);for(let i=-5;i<15;i++)line([[560+i*65,512],[560+i*145,580]],'#273743',1);ctx.strokeStyle='#293e49';ctx.beginPath();ctx.ellipse(350,512,180,28,0,0,7);ctx.stroke();
 board(56,'YOU / 进攻方',orange);ctx.save();if(t>=4.4&&t<4.85)ctx.translate(Math.sin(t*90)*5*(1-(t-4.4)/.45),0);board(762,'RIVAL / 对方棋盘',cyan);
 if(s.obstacles&&attackCount>0){circle(867,296,17,'#8f9ea9');line([[865,282],[860,293],[871,299],[866,310]],'#26343f',3);text('×'+attackCount+' 障碍泡泡',884,343,17,cyan,'center')};ctx.restore();
 if(!actionOnly){text('ENERGY MAX',56,545,12,orange);ctx.fillStyle=orange;ctx.fillRect(56,554,244*(t===0?1:Math.max(0,1-t/.7)),4);text('PENALTY  /  '+(s.obstacles*attackCount),762,545,12,cyan);}
 // Backboard, rim and net.
 line([[465,510],[465,172]],'#7e929d',8);ctx.fillStyle='#bcd8df12';ctx.fillRect(408,157,77,76);ctx.strokeStyle='#a8c5cd';ctx.lineWidth=3;ctx.strokeRect(408,157,77,76);ctx.strokeRect(424,192,37,27);
 for(let i=0;i<5;i++)line([[397+i*11,241],[406+i*7,279],[442-i*9,241]],'#b3c8cf70',1.5);
 const lift=t<.7?-Math.sin(t/.7*Math.PI)*12:t<1.9?Math.sin((t-.7)/1.2*Math.PI/2)*166:t<2.3?166:t<3?166*(1-(t-2.3)/.7):0;
 const px=t<.7?337:t<1.9?337+50*(t-.7)/1.2:387,py=420-lift;
 ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(px,510,50-lift*.15,9,0,0,7);ctx.fill();ctx.restore();
 const shoulder={x:px+8,y:py-35};let hand;
 if(t<.7)hand=gatherHand(t/.7,px,py);else if(t<1.9){const a=Math.PI*.45+(t-.7)/1.2*Math.PI*2;hand={x:shoulder.x+68*Math.cos(a),y:shoulder.y+68*Math.sin(a)}}else if(t<2.2){const u=(t-1.9)/.3;const a=Math.PI*.45+Math.PI*2;hand={x:(shoulder.x+68*Math.cos(a))*(1-u)+420*u,y:(shoulder.y+68*Math.sin(a))*(1-u)+224*u}}else if(t<2.6)hand={x:420,y:224};else hand={x:px+45,y:py-10};
 // Athletic silhouette with jersey and articulated limbs.
 line([[px-13,py+28],[px-28,py+62],[px-39,py+86]],'#b77755',17);line([[px+12,py+28],[px+35,py+57],[px+17,py+87]],'#c78c65',17);line([[px-44,py+88],[px-24,py+88]],'#e8f2e9',10);line([[px+12,py+88],[px+33,py+88]],'#e8f2e9',10);
 line([[px-12,py-31],[px-40,py-6],[px-49,py-30]],'#ad704f',13);
 line([[shoulder.x,shoulder.y],[(shoulder.x+hand.x)/2+12,(shoulder.y+hand.y)/2],[hand.x,hand.y]],'#d09570',15);
 ctx.fillStyle=orange;ctx.beginPath();ctx.moveTo(px-23,py-40);ctx.lineTo(px+22,py-40);ctx.lineTo(px+25,py+15);ctx.lineTo(px-25,py+15);ctx.closePath();ctx.fill();ctx.fillStyle='#203644';ctx.fillRect(px-25,py+15,50,20);text('23',px,py-3,25,'#17232d','center');circle(px,py-63,18,'#cf936e');ctx.fillStyle='#16232a';ctx.beginPath();ctx.arc(px,py-69,18,Math.PI,Math.PI*2);ctx.fill();line([[px-15,py-64],[px+14,py-64]],orange,4);
 if(t>=.7&&t<1.9){ctx.strokeStyle='#ff834560';ctx.lineWidth=5;ctx.beginPath();ctx.arc(shoulder.x,shoulder.y,68,Math.PI*.45,Math.PI*.45+(t-.7)/1.2*Math.PI*2);ctx.stroke()}
 line([[394,240],[449,240]],orange,6);
 if(t<2.2)ball(hand.x,hand.y);else if(t<2.6)ball(420,224+16*(t-2.2)/.4);else if(t<4.4){for(let j=9;j>0;j--){const previous=sample(Math.max(2.6,t-j*.025));circle(previous.ball.x,previous.ball.y,16*(1-j/11),`rgba(255,131,69,${.4-j*.035})`)}ball(s.ball.x,s.ball.y)}
 if(t>=2.2&&t<2.65){text('BOOM!',478,262,34,orange);ctx.strokeStyle=orange;ctx.lineWidth=3;ctx.beginPath();ctx.arc(420,240,30+(t-2.2)*160,0,7);ctx.stroke()}
 if(t>=4.4&&t<5.2){const p=(t-4.4)/.8;ctx.save();ctx.globalAlpha=1-p;ctx.strokeStyle=cyan;ctx.lineWidth=4;ctx.beginPath();ctx.arc(867,296,22+p*110,0,7);ctx.stroke();for(let i=0;i<14;i++){const a=i/14*Math.PI*2;circle(867+Math.cos(a)*(25+p*95),296+Math.sin(a)*(25+p*95),3,orange)}ctx.restore()}
 ctx.restore();text('FULL CIRCLE. FULL IMPACT.',560,39,12,'#718d9c','center');text(t===0?'READY TO FLY':s.phase==='finish'?'THAT’S A WINDMILL.':s.phase.toUpperCase(),560,559,16,t===0?'#6c8290':orange,'center');
}
return {render(ms,options={}){showPenalty=options.showPenalty!==false;quiet=options.quiet===true;actionOnly=options.actionOnly===true;time=Math.max(0,Math.min(duration,ms/1000));attackCount=Math.max(0,Math.min(4,options.count??4));own=options.own!==false;renderFrame();}};
}
