import {AimControl} from './controls.js';
import {BubbleEffects} from './effects.js';
import {events,Events,emit} from './EventBus.js';
import {traceAim} from './motion.js';
import {CourtAnimation} from './court.js';
import {initialBoard,neighbors,resolveShot,spendEnergy,touchesLaunch} from './engine.js';
const $=s=>document.querySelector(s),canvas=$('#board'),ctx=canvas.getContext('2d');
const visualEffects=new BubbleEffects(canvas);
events.addEventListener(Events.POP,e=>{visualEffects.pop(e.detail);if(!visualEffects.reduced)document.querySelector('.energy').animate([{filter:'brightness(1)'},{filter:'brightness(1.8)'},{filter:'brightness(1)'}],{duration:500});});
events.addEventListener(Events.RESET,()=>visualEffects.clear());
const courtAnimation=new CourtAnimation(document.querySelector('#court-animation'));
events.addEventListener(Events.DUNK,e=>courtAnimation.play(e.detail));
events.addEventListener(Events.IMPACT,e=>{tone(120);if(!e.detail.preview)document.querySelector('#score').animate([{transform:'scale(1)'},{transform:'scale(1.35)',color:'#ffc26d'},{transform:'scale(1)'}],{duration:400});});
const aiming=new AimControl();
const fineAim=document.querySelector('#fine-aim');
let coarsePointer=null;
const colors=['#29c7ff','#ff993b','#ae65f1','#35d5bc'];
let gameOver=false;
let board,energy=0,score=0,current=0,next=1,shot=null,last=0,locked=false,muted=true,audio,best=0,w=0,h=0,r=0,step=0,top=0,launch=0,toastTimer,dunkTimer;
try{best=Number(localStorage.getItem('hoopire-best')||0);}catch{}
function resize(){const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);r=w/18;step=r*1.74;top=34+r;launch=h-42;}
function pos(row,col){return {x:r*1.5+col*r*2+(row%2)*r,y:top+row*step};}
function message(t){$('#toast').textContent=t;$('#toast').style.opacity='1';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.opacity='.35',2200);}
function tone(freq=500){if(muted)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=freq;g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.13);o.start();o.stop(audio.currentTime+.14);}catch{}}
function available(){const a=[...new Set(board.flat().filter(x=>x!==null))];return a[Math.floor(Math.random()*a.length)]??0;}
function update(){aiming.setBusy(Boolean(shot)||gameOver);$('#shoot').disabled=Boolean(shot)||gameOver;$('#shoot small').textContent=shot?'BALL IN PLAY':'TAP TO FIRE ↗';fineAim.setAttribute('aria-disabled',String(Boolean(shot)||gameOver));  $('#score').textContent=String(score).padStart(2,'0');$('#best').textContent=String(best).padStart(2,'0');$('#dunks').textContent=`${score/2} DUNKS`;$('#energy-number').textContent=`${energy} / 100`;$('#energy-fill').style.width=energy+'%';$('#dunk').disabled=gameOver||energy<100||locked;$('#dunk small').textContent=energy>=100?'TAP TO SLAM':'CHARGE TO 100';$('#hint').textContent=energy>=100?'Full power. Make it count!':'Match 3+ to charge your dunk';$('#next').style.background=`radial-gradient(circle at 30% 25%,#fff,${colors[next]} 35%,#102442)`;}
function reset(){gameOver=false;$('#game-over').hidden=true;emit(Events.RESET);clearTimeout(dunkTimer);board=initialBoard();energy=score=0;shot=null;aiming.reset();coarsePointer=null;syncAim();locked=false;$('.court').classList.remove('dunking');courtAnimation.reset();$('#court-callout').textContent='OWN THE NIGHT.';current=available();next=available();update();message('Tap target → fine-tune below → SHOOT');}
function endGame(){gameOver=true;shot=null;coarsePointer=null;aiming.pointer=null;clearTimeout(dunkTimer);locked=false;$('.court').classList.remove('dunking');courtAnimation.reset();$('#final-score').textContent=score;$('#game-over').hidden=false;message('Game over · bubbles reached the launch zone');update();$('#play-again').focus();}
$('#play-again').addEventListener('click',reset);
function settle(hit){let candidates=[];if(hit)candidates=neighbors(...hit);else candidates=Array.from({length:8},(_,c)=>[0,c]);candidates=candidates.filter(([a,b])=>board[a][b]===null);candidates.sort((a,b)=>Math.hypot(pos(...a).x-shot.x,pos(...a).y-shot.y)-Math.hypot(pos(...b).x-shot.x,pos(...b).y-shot.y));if(!candidates.length){endGame();return;}const [a,b]=candidates[0],c=shot.color;shot=null;const out=resolveShot(board,a,b,c,energy);const gained=out.energy-energy;energy=out.energy;if(out.popped.length){emit(Events.POP,{cells:out.popped.map(([a,b])=>pos(a,b)),dropped:out.dropped.map(([a,b])=>pos(a,b)),color:colors[c],gained});$('#combo').textContent=`${out.popped.length+out.dropped.length} POPPED!`;message(energy>=100?'POWER READY! Tap DUNK!':`+${(out.popped.length+out.dropped.length)*16} ENERGY${out.dropped.length?' · DROP BONUS':''}`);tone(650+out.popped.length*50);}else{$('#combo').textContent='FIND YOUR ANGLE';tone(200);}if(board.flat().every(x=>x===null)){board=initialBoard();message('BOARD CLEARED! New wave · energy kept');}else if(touchesLaunch(board,top,step,r,launch-r*2)){endGame();return;}current=board.flat().includes(next)?next:available();next=available();update();}
function ball(x,y,c,size=r){const g=ctx.createRadialGradient(x-size*.3,y-size*.4,1,x,y,size);g.addColorStop(0,'#e8fcff');g.addColorStop(.28,colors[c]);g.addColorStop(1,'#102941');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,size*.92,0,Math.PI*2);ctx.fill();ctx.strokeStyle=colors[c];ctx.lineWidth=1.4;ctx.stroke();ctx.strokeStyle='#08243a88';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x-size*.7,y,size*1.1,-.8,.8);ctx.stroke();}
function syncAim(){const degrees=aiming.angle*180/Math.PI;$('#aim-angle').value=`${degrees>0?'+':''}${degrees.toFixed(1)}°`;fineAim.setAttribute('aria-valuenow',degrees.toFixed(1));fineAim.setAttribute('aria-valuetext',`${degrees.toFixed(1)} degrees`);fineAim.style.setProperty('--ruler-shift',`${-degrees*2}px`);}
function aimAtPointer(e){const rect=canvas.getBoundingClientRect();aiming.aimAt(e.clientX-rect.left,e.clientY-rect.top,w/2,launch);syncAim();}
canvas.addEventListener('pointerdown',e=>{if(gameOver||shot||coarsePointer!==null||!e.isPrimary)return;coarsePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);aimAtPointer(e);});
canvas.addEventListener('pointermove',e=>{if(e.pointerId===coarsePointer)aimAtPointer(e);});
function endCoarse(e){if(e.pointerId===coarsePointer)coarsePointer=null;}
canvas.addEventListener('pointerup',endCoarse);canvas.addEventListener('pointercancel',endCoarse);canvas.addEventListener('lostpointercapture',endCoarse);
fineAim.addEventListener('pointerdown',e=>{if(gameOver||shot||!e.isPrimary)return;e.preventDefault();aiming.beginFine(e.pointerId,e.clientX);if(aiming.pointer===e.pointerId){fineAim.setPointerCapture(e.pointerId);fineAim.classList.add('adjusting');}});
fineAim.addEventListener('pointermove',e=>{aiming.moveFine(e.pointerId,e.clientX);syncAim();});
function endFine(e){aiming.endFine(e.pointerId);if(aiming.pointer===null)fineAim.classList.remove('adjusting');}
fineAim.addEventListener('pointerup',endFine);fineAim.addEventListener('pointercancel',endFine);fineAim.addEventListener('lostpointercapture',endFine);
fineAim.addEventListener('keydown',e=>{const delta={ArrowLeft:-.5,ArrowRight:.5,ArrowDown:-.5,ArrowUp:.5,PageDown:-3,PageUp:3}[e.key];if(delta!==undefined){e.preventDefault();aiming.nudge(delta*Math.PI/180);syncAim();}else if(e.key==='Home'&&!shot){e.preventDefault();aiming.nudge(-aiming.angle);syncAim();}});
$('#shoot').addEventListener('click',()=>{if(gameOver||shot)return;const direction=aiming.fire();if(!direction)return;coarsePointer=null;fineAim.classList.remove('adjusting');shot={x:w/2,y:launch,...direction,color:current};tone(250);update();});
$('#dunk').addEventListener('click',()=>{if(gameOver||locked)return;const s=spendEnergy(energy,score);if(!s.fired)return;energy=s.energy;score=s.score;best=Math.max(best,score);try{localStorage.setItem('hoopire-best',best);}catch{}locked=true;$('.court').classList.add('dunking');emit(Events.DUNK,{preview:false});$('#court-callout').textContent='SLAM DUNK! +2';message('BOOM! Keep popping to charge again.');tone(260);update();dunkTimer=setTimeout(()=>{locked=false;$('.court').classList.remove('dunking');$('#court-callout').textContent='OWN THE NIGHT.';update();},2300);});
$('#preview-dunk').addEventListener('click',()=>{if(!gameOver&&!locked)emit(Events.DUNK,{preview:true});});
$('#sound').addEventListener('click',()=>{muted=!muted;$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound').textContent=muted?'♪':'♫';tone();});$('#reset').addEventListener('click',reset);
function frame(time){const dt=Math.min((time-last)/1000||.016,.025);last=time;ctx.clearRect(0,0,w,h);if(shot){for(let k=0;k<4&&shot;k++){shot.x+=shot.vx*dt/4;shot.y+=shot.vy*dt/4;if(shot.x<r){shot.x=r;shot.vx=Math.abs(shot.vx);}if(shot.x>w-r){shot.x=w-r;shot.vx=-Math.abs(shot.vx);}let hit=null;for(let a=0;a<12&&!hit;a++)for(let b=0;b<8;b++)if(board[a][b]!==null){const p=pos(a,b);if(Math.hypot(p.x-shot.x,p.y-shot.y)<r*1.87){hit=[a,b];break;}}if(hit||shot.y<=top)settle(hit);}}
ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#ff785dcc';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(8,launch-r*2);ctx.lineTo(w-8,launch-r*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fa9b85';ctx.font='8px sans-serif';ctx.textAlign='left';ctx.fillText('DANGER · KEEP CLEAR',10,launch-r*2-7);ctx.restore();
board.forEach((row,a)=>row.forEach((c,b)=>{if(c!==null){const p=pos(a,b);ball(p.x,p.y,c);}}));
if(!shot&&!gameOver){
 const dir=aiming.direction,balls=[];board.forEach((row,a)=>row.forEach((c,b)=>{if(c!==null)balls.push(pos(a,b));}));
 const path=traceAim({x:w/2,y:launch,...dir,left:r,right:w-r,ceiling:top,balls,radius:r});
 ctx.save();ctx.lineWidth=2;ctx.strokeStyle=coarsePointer!==null||aiming.pointer!==null?'#91f4ffcc':'#65d7ee99';ctx.setLineDash([3,7]);ctx.lineDashOffset=-time/70;ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);
 for(const p of path.filter(p=>p.bounce)){ctx.fillStyle='#ffb74d';ctx.beginPath();ctx.arc(p.x,p.y,5,0,7);ctx.fill();}
 const end=path.at(-1);ctx.strokeStyle='#a8f7ff88';ctx.beginPath();ctx.arc(end.x,end.y,r*.9,0,7);ctx.stroke();
 const angle=Math.atan2(dir.vy,dir.vx);ctx.translate(w/2,launch);ctx.rotate(angle);ctx.shadowColor='#58eaff';ctx.shadowBlur=10;ctx.fillStyle='#d0fbff';ctx.beginPath();ctx.moveTo(r+35,0);ctx.lineTo(r+18,-9);ctx.lineTo(r+18,-3);ctx.lineTo(r+4,-3);ctx.lineTo(r+4,3);ctx.lineTo(r+18,3);ctx.lineTo(r+18,9);ctx.closePath();ctx.fill();ctx.restore();
}
ctx.strokeStyle='#3190b7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(w/2,launch,r+7,0,Math.PI*2);ctx.stroke();ball(w/2,launch,current);if(shot){if(!visualEffects.reduced){ctx.save();for(let i=4;i>0;i--){ctx.globalAlpha=.08*(5-i);ball(shot.x-shot.vx/680*i*7,shot.y-shot.vy/680*i*7,shot.color,r*(1-i*.13));}ctx.restore();}ball(shot.x,shot.y,shot.color);}
visualEffects.draw(dt,r);
ctx.globalAlpha=1;requestAnimationFrame(frame);}
new ResizeObserver(resize).observe(canvas);reset();resize();requestAnimationFrame(frame);
