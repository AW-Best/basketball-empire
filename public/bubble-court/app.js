import {AimControl} from './controls.js?v=11';
import {BubbleEffects} from './effects.js?v=11';
import {events,Events,emit} from './EventBus.js?v=11';
import {traceAim,bubbleRadius} from './motion.js?v=11';
import {createCourt} from './court-loader.js?v=11';
import {StreetSession} from './session.js?v=11';
import {STREET} from './Constants.js?v=11';
import {initialBoard,neighbors,resolveShot,activateDunk,clearBottomRow,touchesLaunch} from './engine.js?v=11';
const $=s=>document.querySelector(s),canvas=$('#board'),ctx=canvas.getContext('2d');
const visualEffects=new BubbleEffects(canvas);
events.addEventListener(Events.POP,e=>{visualEffects.pop(e.detail);if(!visualEffects.reduced)document.querySelector('.energy').animate([{filter:'brightness(1)'},{filter:'brightness(1.8)'},{filter:'brightness(1)'}],{duration:500});});
events.addEventListener(Events.ROW_CLEAR,e=>visualEffects.pop({...e.detail,dropped:[],gained:0,dunk:true}));
events.addEventListener(Events.RESET,()=>visualEffects.clear());
const courtAnimation=await createCourt(document.querySelector('#court-animation'));
events.addEventListener(Events.DUNK,e=>{previewActive=Boolean(e.detail.preview);courtAnimation.play(e.detail);update();});
events.addEventListener(Events.IMPACT,e=>{tone(120);if(!e.detail.preview){clearDunkRow();}if(!e.detail.preview)document.querySelector('#score').animate([{transform:'scale(1)'},{transform:'scale(1.35)',color:'#ffc26d'},{transform:'scale(1)'}],{duration:400});});
const aiming=new AimControl();
const fineAim=document.querySelector('#fine-aim');
let coarsePointer=null;
const colors=['#29c7ff','#ff993b','#ae65f1','#35d5bc'];
let gameOver=false,previewActive=false,pendingDunk=false,helpOpen=false,session=new StreetSession(),returnFocus=null;
let board,energy=0,score=0,current=0,next=1,shot=null,last=0,locked=false,muted=true,audio,best=0,w=0,h=0,r=0,step=0,top=0,launch=0,toastTimer,dunkTimer,bestShots=0;
try{best=Number(localStorage.getItem('hoopire-best')||0);bestShots=Number(localStorage.getItem('hoopire-bubble-best-shots')||0);}catch{}
function resize(){const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);r=bubbleRadius(w,h);step=r*1.74;top=34+r;launch=h-42;}
function pos(row,col){return {x:(w-18*r)/2+r*1.5+col*r*2+(row%2)*r,y:top+row*step};}
function message(t){$('#toast').textContent=t;$('#toast').style.opacity='1';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.opacity='.35',2200);}
function tone(freq=500){if(muted)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=freq;g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.13);o.start();o.stop(audio.currentTime+.14);}catch{}}
function available(){const a=[...new Set(board.flat().filter(x=>x!==null))];return a[Math.floor(Math.random()*a.length)]??0;}
function update(){
 const busy=Boolean(shot)||locked||gameOver||helpOpen,empty=session.shots>=session.shotLimit;
 aiming.setBusy(busy||empty);$('#shoot').disabled=busy||empty;$('#precision-toggle').disabled=busy;$('#help').disabled=Boolean(shot)||locked||gameOver;
 $('#shoot small').textContent=shot?'BALL IN PLAY':empty?'NO SHOTS LEFT':'TAP TO FIRE ↗';fineAim.setAttribute('aria-disabled',String(busy||empty));
 $('#score').textContent=String(score).padStart(2,'0');$('#best').textContent=bestShots?String(bestShots).padStart(2,'0'):'—';$('#dunks').textContent=`${session.dunks} / ${session.target} DUNKS`;
 $('#shots-left').textContent=empty?'LAST CHANCE · DUNK!':`${session.shotLimit-session.shots} SHOTS LEFT`;
 $('#streak-label').textContent=session.streak>=2?`${session.streak}× STREAK`:'MAKE YOUR RUN';
 document.querySelectorAll('.dunk-progress i').forEach((dot,i)=>dot.classList.toggle('done',i<session.dunks));$('.dunk-progress').setAttribute('aria-label',`${session.dunks} of ${session.target} dunks`);
 $('#energy-number').textContent=`${energy} / 100`;$('#energy-fill').style.width=energy+'%';$('#preview-dunk').disabled=busy||previewActive;$('#dunk').disabled=busy||previewActive||energy<100;$('#dunk small').textContent=energy>=100?'SLAM · CLEAR BOTTOM ROW':'CHARGE TO 100';
 $('#hint').textContent=energy>=100?'Ready! Dunk clears the lowest row.':'Match 3+ to charge your dunk';
 $('#next').style.background=`radial-gradient(circle at 30% 25%,#fff,${colors[next]} 35%,#102442)`;
}
function cancelAim(){if(coarsePointer!==null){aiming.cancelGesture(coarsePointer);try{canvas.releasePointerCapture(coarsePointer);}catch{}}coarsePointer=null;aiming.pointer=null;fineAim.classList.remove('adjusting');}
function reset(){
 pendingDunk=false;previewActive=false;gameOver=false;session=new StreetSession();if($('#game-over').open)$('#game-over').close();emit(Events.RESET);clearTimeout(dunkTimer);board=initialBoard();energy=score=0;shot=null;aiming.reset();cancelAim();syncAim();locked=false;$('.court').classList.remove('dunking');courtAnimation.reset();$('#court-callout').textContent='OWN THE NIGHT.';$('#combo').textContent='LET’S BALL';current=available();next=available();update();message('3 dunks. 30 shots. Own the court.');
}
function showResult(){
 if(gameOver)return;gameOver=true;pendingDunk=false;shot=null;cancelAim();clearTimeout(dunkTimer);locked=false;$('.court').classList.remove('dunking');const result=session.summary(),won=result.status==='won';
 $('#game-over').classList.toggle('victory',won);$('#game-over-title').textContent=won?'COURT CONQUERED!':'RUN IT BACK.';$('#result-kicker').textContent=won?'SUNSET COURT · VICTORY':'SUNSET COURT · SESSION OVER';$('#result-symbol').textContent=won?'♛':'↻';
 $('#result-reason').textContent=won?'Three slams. This court is yours.':result.reason==='shots'?'Out of shots. Your next run starts here.':'Bubbles reached the red danger line.';
 $('#result-stars').textContent=won?'★'.repeat(result.stars)+'☆'.repeat(3-result.stars):'';$('#result-stars').setAttribute('aria-label',`${result.stars} of 3 stars`);
 $('#result-dunks').textContent=`${result.dunks} / ${result.target}`;$('#result-shots').textContent=result.shots;$('#result-cleared').textContent=result.cleared;$('#result-streak').textContent=`${result.bestStreak}×`;
 $('#result-tip').textContent=won?(result.stars===3?'3 STAR RUN · Can you beat your shot count?':'Next goal: 3 stars in 12 shots.'):(result.reason==='danger'?'Tip: save a dunk to clear your lowest row.':'Tip: target matching groups and drop loose clusters.');
 $('#share-status').textContent='';$('#play-again').textContent=won?(result.stars===3?'BEAT YOUR RUN ↗':'CHASE 3 STARS ↗'):'TRY AGAIN ↗';
 if(won)try{const previous=Number(localStorage.getItem('hoopire-bubble-best-shots')||999);if(result.shots<previous){bestShots=result.shots;localStorage.setItem('hoopire-bubble-best-shots',result.shots);$('#result-tip').textContent=`PERSONAL BEST · ${result.shots} SHOTS`;}}catch{}
 update();$('#game-over').showModal();$('#play-again').focus();
}
function assess(danger=false){const status=session.evaluate({energy,danger,busy:Boolean(shot)||locked});if(status!=='playing'&&!locked)showResult();return status;}
function endGame(){session.evaluate({energy,danger:true});locked=false;showResult();}
$('#play-again').addEventListener('click',reset);$('#game-over').addEventListener('cancel',e=>e.preventDefault());
function openGuide(){if(shot||locked||gameOver||helpOpen)return;returnFocus=document.activeElement;helpOpen=true;cancelAim();courtAnimation.setPaused(true);update();$('#guide').showModal();}
$('#help').addEventListener('click',openGuide);$('#guide-start').addEventListener('click',()=>$('#guide').close());
$('#guide').addEventListener('close',()=>{helpOpen=false;courtAnimation.setPaused(false);try{localStorage.setItem('hoopire-bubble-guide-v1','seen');}catch{}last=0;update();if(returnFocus instanceof HTMLElement)returnFocus.focus();});
$('#copy-result').addEventListener('click',async()=>{const q=session.summary(),text=`Hoopire Sunset Court: ${q.dunks}/${q.target} dunks in ${q.shots} shots. Can you beat my run? https://hoopire.com/bubble-court/`;try{await navigator.clipboard.writeText(text);$('#share-status').textContent='Copied! Paste into your chat to challenge a friend.';}catch{$('#share-status').textContent='Share this link: hoopire.com/bubble-court/';}});
function settle(hit){let candidates=[];if(hit)candidates=neighbors(...hit);else candidates=Array.from({length:8},(_,c)=>[0,c]);candidates=candidates.filter(([a,b])=>board[a][b]===null);candidates.sort((a,b)=>Math.hypot(pos(...a).x-shot.x,pos(...a).y-shot.y)-Math.hypot(pos(...b).x-shot.x,pos(...b).y-shot.y));if(!candidates.length){endGame();return;}const [a,b]=candidates[0],c=shot.color;shot=null;const before=board.map(row=>[...row]);const out=resolveShot(board,a,b,c,energy);const gained=out.energy-energy;energy=out.energy;session.resolve(out.popped.length+out.dropped.length);if(out.popped.length){emit(Events.POP,{cells:out.popped.map(([a,b])=>({...pos(a,b),color:colors[c]})),dropped:out.dropped.map(([a,b])=>({...pos(a,b),color:colors[before[a][b]]})),color:colors[c],gained});$('#combo').textContent=`${session.streak>=2?session.streak+'× STREAK · ':''}${out.popped.length+out.dropped.length} POPPED!`;message(energy>=100?'POWER READY! Tap DUNK!':`+${(out.popped.length+out.dropped.length)*16} ENERGY${out.dropped.length?' · DROP BONUS':''}`);tone(650+out.popped.length*50);}else{$('#combo').textContent='FIND YOUR ANGLE';tone(200);}if(board.flat().every(x=>x===null)){board=initialBoard();message('BOARD CLEARED! New wave · energy kept');}else if(touchesLaunch(board,top,step,r,launch-r*2)){endGame();return;}current=board.flat().includes(next)?next:available();next=available();assess();update();}
function ball(x,y,c,size=r){const g=ctx.createRadialGradient(x-size*.3,y-size*.4,1,x,y,size);g.addColorStop(0,'#e8fcff');g.addColorStop(.28,colors[c]);g.addColorStop(1,'#102941');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,size*.92,0,Math.PI*2);ctx.fill();ctx.strokeStyle=colors[c];ctx.lineWidth=1.4;ctx.stroke();ctx.strokeStyle='#08243a88';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x-size*.7,y,size*1.1,-.8,.8);ctx.stroke();}
function syncAim(){const degrees=aiming.angle*180/Math.PI;$('#aim-angle').value=`${degrees>0?'+':''}${degrees.toFixed(1)}°`;fineAim.setAttribute('aria-valuenow',degrees.toFixed(1));fineAim.setAttribute('aria-valuetext',`${degrees.toFixed(1)} degrees`);fineAim.style.setProperty('--ruler-shift',`${-degrees*2}px`);}
function pointerPoint(e){const rect=canvas.getBoundingClientRect();return {x:e.clientX-rect.left,y:e.clientY-rect.top};}
function launchShot(direction){if(!direction||gameOver||shot||locked||helpOpen||!session.shoot())return;coarsePointer=null;fineAim.classList.remove('adjusting');shot={x:w/2,y:launch,...direction,color:current};tone(250);update();}
canvas.addEventListener('pointerdown',e=>{if(gameOver||helpOpen||locked||shot||session.shots>=session.shotLimit||coarsePointer!==null||!e.isPrimary||e.button!==0)return;const p=pointerPoint(e);if(p.y>launch-r||p.y<26)return;coarsePointer=e.pointerId;aiming.beginGesture(e.pointerId,p.x,p.y,w/2,launch);canvas.setPointerCapture(e.pointerId);syncAim();});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==coarsePointer)return;const p=pointerPoint(e);aiming.moveGesture(e.pointerId,p.x,p.y,w/2,launch);syncAim();});
canvas.addEventListener('pointerup',e=>{if(e.pointerId!==coarsePointer)return;const p=pointerPoint(e);coarsePointer=null;if(p.x<0||p.x>w||p.y<26||p.y>launch-r){aiming.cancelGesture(e.pointerId);return;}aiming.moveGesture(e.pointerId,p.x,p.y,w/2,launch);syncAim();launchShot(aiming.endGesture(e.pointerId));});
function cancelCoarse(e){if(e.pointerId===coarsePointer){aiming.cancelGesture(e.pointerId);coarsePointer=null;}}
canvas.addEventListener('pointercancel',cancelCoarse);canvas.addEventListener('lostpointercapture',cancelCoarse);
$('#precision-toggle').addEventListener('click',()=>{if(shot||locked||gameOver||helpOpen)return;aiming.cancelGesture(coarsePointer);coarsePointer=null;aiming.precise=!aiming.precise;$('#precision-panel').hidden=!aiming.precise;$('#precision-toggle').setAttribute('aria-expanded',String(aiming.precise));$('#precision-toggle').textContent=aiming.precise?'返回快捷 / Quick mode':'精准模式 / Fine aim';$('#control-help').textContent=aiming.precise?'AIM → FINE-TUNE → SHOOT':'TAP TO SHOOT · HOLD TO AIM';message(aiming.precise?'Aim, slide ruler, tap SHOOT':'Tap to shoot · hold & drag to aim');});
fineAim.addEventListener('pointerdown',e=>{if(gameOver||helpOpen||locked||shot||session.shots>=session.shotLimit||!e.isPrimary)return;e.preventDefault();aiming.beginFine(e.pointerId,e.clientX);if(aiming.pointer===e.pointerId){fineAim.setPointerCapture(e.pointerId);fineAim.classList.add('adjusting');}});
fineAim.addEventListener('pointermove',e=>{aiming.moveFine(e.pointerId,e.clientX);syncAim();});
function endFine(e){aiming.endFine(e.pointerId);if(aiming.pointer===null)fineAim.classList.remove('adjusting');}
fineAim.addEventListener('pointerup',endFine);fineAim.addEventListener('pointercancel',endFine);fineAim.addEventListener('lostpointercapture',endFine);
fineAim.addEventListener('keydown',e=>{const delta={ArrowLeft:-.5,ArrowRight:.5,ArrowDown:-.5,ArrowUp:.5,PageDown:-3,PageUp:3}[e.key];if(delta!==undefined){e.preventDefault();aiming.nudge(delta*Math.PI/180);syncAim();}else if(e.key==='Home'&&!shot){e.preventDefault();aiming.nudge(-aiming.angle);syncAim();}});
$('#shoot').addEventListener('click',()=>{if(!gameOver&&!shot)launchShot(aiming.fire());});
function clearDunkRow(){
 if(!locked||gameOver||!pendingDunk)return;pendingDunk=false;
 const removed=clearBottomRow(board);session.dunk(removed.length);session.evaluate({energy,busy:true});
 if(removed.length){emit(Events.ROW_CLEAR,{cells:removed.map(p=>({...pos(p.row,p.col),color:colors[p.color]})),color:'#ffc26d'});$('#combo').textContent=`${removed.length} CLEARED BY DUNK!`;message(`SLAM! Bottom row cleared · ${removed.length} bubbles`);}
 if(board.flat().every(v=>v===null)){board=initialBoard();message('SLAM! Board cleared · new wave');}
 current=board.flat().includes(current)?current:available();next=board.flat().includes(next)?next:available();update();
}
$('#dunk').addEventListener('click',()=>{if(gameOver||helpOpen||locked||previewActive)return;const s=activateDunk({energy,score,shot,locked,gameOver});if(!s.fired)return;energy=s.energy;score=s.score;best=Math.max(best,score);try{localStorage.setItem('hoopire-best',best);}catch{}locked=true;pendingDunk=true;$('.court').classList.add('dunking');emit(Events.DUNK,{preview:false});$('#court-callout').textContent='SLAM DUNK! +2';message('Watch the rim · bottom row clears on impact!');tone(260);update();armDunkFallback();});
function finishDunk(){if(!locked)return;courtAnimation.complete();clearTimeout(dunkTimer);clearDunkRow();locked=false;$('.court').classList.remove('dunking');$('#court-callout').textContent='OWN THE NIGHT.';assess();update();}
function armDunkFallback(){clearTimeout(dunkTimer);dunkTimer=setTimeout(()=>{if(document.hidden){armDunkFallback();return;}finishDunk();},STREET.duration+1400);}
events.addEventListener(Events.DUNK_END,e=>{if(e.detail.preview){previewActive=false;update();}else finishDunk();});
$('#preview-dunk').addEventListener('click',()=>{if(!gameOver&&!helpOpen&&!locked&&!shot&&!previewActive)emit(Events.DUNK,{preview:true});});
$('#sound').addEventListener('click',()=>{muted=!muted;$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound').textContent=muted?'♪':'♫';tone();});$('#reset').addEventListener('click',reset);
function frame(time){if(document.hidden||helpOpen){last=0;requestAnimationFrame(frame);return;}const dt=Math.min((time-last)/1000||.016,.025);last=time;ctx.clearRect(0,0,w,h);if(shot){for(let k=0;k<4&&shot;k++){shot.x+=shot.vx*dt/4;shot.y+=shot.vy*dt/4;if(shot.x<r){shot.x=r;shot.vx=Math.abs(shot.vx);}if(shot.x>w-r){shot.x=w-r;shot.vx=-Math.abs(shot.vx);}let hit=null;for(let a=0;a<12&&!hit;a++)for(let b=0;b<8;b++)if(board[a][b]!==null){const p=pos(a,b);if(Math.hypot(p.x-shot.x,p.y-shot.y)<r*1.87){hit=[a,b];break;}}if(hit||shot.y<=top)settle(hit);}}
ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#ff785dcc';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(8,launch-r*2);ctx.lineTo(w-8,launch-r*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fa9b85';ctx.font='8px sans-serif';ctx.textAlign='left';ctx.fillText('DANGER · KEEP CLEAR',10,launch-r*2-7);ctx.restore();
board.forEach((row,a)=>row.forEach((c,b)=>{if(c!==null){const p=pos(a,b);ball(p.x,p.y,c);}}));
if(!shot&&!gameOver&&session.shots<session.shotLimit&&!locked){
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
document.addEventListener('visibilitychange',()=>{last=0;cancelAim();});
$('#preview-dunk').disabled=false;
new ResizeObserver(resize).observe(canvas);reset();resize();requestAnimationFrame(frame);
try{if(localStorage.getItem('hoopire-bubble-guide-v1')!=='seen')openGuide();}catch{openGuide();}
