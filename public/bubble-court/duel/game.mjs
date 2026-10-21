import {AttackSpectacle} from './runtime-v2/duel/spectacle.mjs';
import {ResultPresentation} from './ending.mjs';
import {rematchControls} from './rematch.mjs';
import {MOVES,getMove,getPresentationMove,openMovePicker,chooseMove} from './moves.mjs';
import {getAttackTiming,getCinematicDuration,projectFocusPoint} from './runtime-v2/duel/moves.mjs';
import {impactPoint} from './runtime-v2/duel/moves/studio-art.mjs';
import {MoveCourt} from './runtime-v2/duel/move-court.mjs';
import {NetworkRoomStore,actionId} from './network.mjs';
import {currentColor,planShot,position,addGarbage} from '../duel-lab/model.js';
import {RULES as R,BOARD as G,PALETTE as P,VISUAL,COMBAT,SPECTACLE} from '../duel-lab/Constants.js';
import {SlamCourt} from '../duel-lab/slam/scene.mjs';
import {CombatFeedback,attackCopy,hazardHint,hazardTargets,dunkCue,syncAttack} from './feedback.mjs';

export async function startGame(networkStore,initial){

const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const roomId=(params.get('room')||actionId().slice(0,6)).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,16)||'COURT';
const seat=networkStore.seat,rival=seat==='A'?'B':'A';
const solo=networkStore.mode==='mock';
const fourMoves=solo||initial.moveSelection===true;
const canPractice=solo||networkStore.capabilities?.charge===true;
if(!solo){document.body.dataset.mode='online';document.querySelector('.local-tag').textContent='ONLINE · 1v1';document.title='Hoopire · Bubble Court Duel';}
$('test-charge').hidden=!canPractice;
history.replaceState(null,'',`?room=${encodeURIComponent(roomId)}&seat=${seat}`);
$('room-name').textContent=roomId;$('seat-name').textContent=seat;
$('open-rival').href='#invite';
$('open-rival').textContent='Invite Rival ↗';
$('new-room').href='./';
if(solo){
 document.body.dataset.mode='mock';$('test-receive').hidden=false;$('test-failure').hidden=false;$('attack-queue').hidden=false;$('attack-queue').style.visibility='hidden';document.title='Hoopire · Solo Practice DEMO01';
 document.querySelector('.local-tag').textContent='SOLO · CHILL';$('open-rival').hidden=true;
 $('new-room').textContent='Back to Lobby';
 const step=$('guide').querySelector('li');step.querySelector('b').textContent='Play solo, anytime.';step.querySelector('span').textContent='DEMO01 is your own practice match. The bot pops, charges and sends Dunks back. No second phone needed.';
 $('guide').querySelectorAll('li')[4].querySelector('span').textContent='A new row every 35 seconds keeps things relaxed. Only touching the danger line ends the match. Tap Play Again to restart.';
 $('guide').querySelector('p').textContent='Try Charge +100 to preview a move, Receive Dunk to defend, or Try Defeat to see the result. The bot earns energy by popping bubbles and takes a break after each Dunk.';
}
const boardCanvas=$('board'),ctx=boardCanvas.getContext('2d'),mini=$('rival-board'),miniCtx=mini.getContext('2d'),court=fourMoves?new MoveCourt($('court')):new SlamCourt($('court'));
if(fourMoves)await court.ready;
const store=networkStore;
const ending=new ResultPresentation(seat);
const spectacle=new AttackSpectacle(document.querySelector('.game'));
const combat=new CombatFeedback(seat),courtPanel=document.querySelector('.court'),notice=$('combat-notice');
let targets=[],hazardCueUntil=0,noticeEvent=null;
document.querySelector('.court-slot').style.height=`${COMBAT.compactHeight}px`;
courtPanel.style.setProperty('--spectacle-height',`${COMBAT.spectacleHeight}px`);
let netOffline=false,pickerTicket=null,choosing=false,collapsed=false,cinemaId=null,rematchNotice=null,rematchBusy=false;
let state=null,revision=-1,round=-1,eventSeq=0,angle=0,pointer=null,gestureRound=null,scale=1,offsetX=0,offsetY=0,particles=[],lastMessageAt=0,polling=false,sending=false,blocked=false,stopped=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function fail(error){$('error').hidden=false;$('error').textContent=error.message||String(error);blocked=true;update();}
function toast(text){$('toast').textContent=text;lastMessageAt=store.now();}
function consume(next){
 if(next.revision<revision)return;if((state?.rematchVersion??0)!==(next.rematchVersion??0))rematchNotice=null;revision=next.revision;state=next;ending.observe(state,Date.now());
 if(round!==state.roundId){round=state.roundId;eventSeq=state.eventSeq;pointer=null;particles=[];court.reset();combat.reset();hazardCueUntil=0;pickerTicket=null;rematchNotice=null;$('move-picker').close();}
 for(const event of state.events.filter(e=>e.id>eventSeq)){
  eventSeq=Math.max(eventSeq,event.id);const clock=state.phase==='paused'?state.pausedAt:store.now(),timed=event.type==='dunk'?syncAttack(event,state,seat):event;if(clock-timed.at>(event.type==='dunk'?R.attackWindupMs+(timed.durationMs??R.dunkMs):2200))continue;
  combat.play(event);
  if(event.type==='dunk'){collapsed=false;$('court').setAttribute('aria-label',`${getMove(timed.move).name} animation`);court.play({...timed,rawAt:timed.at,at:timed.at+R.attackWindupMs},event.seat===seat);toast(dunkCue(timed,clock,event.seat===seat,solo?'Bot':`Player ${rival}`).message);}
  if(event.type==='block'&&event.seat===seat)toast(`BLOCK! Cancelled ${event.count} incoming junk`);
  if(event.type==='shot-blocked'&&event.seat===seat)toast('No landing spot. Aim elsewhere · Bubble saved');
  if(event.type==='pop'&&event.seat===seat&&event.normal>0){burst(event.cells,event.at);toast(`${event.normal} popped · +${event.energy} energy${event.gray?` · ${event.gray} junk broken`:''}`);}
  if(event.type==='garbage'&&event.seat===seat){hazardCueUntil=event.at+4500;burst(event.cells,event.at,true);toast(`Rival sent ${event.count} junk · Match 3 beside it to break it`);}
  if(event.type==='dunk'&&event.seat===seat)burst(event.cells,event.at);
  if(event.type==='pressure')toast('Pressure up! A new row for both players');
 }
 if(state.presentation&&state.presentation.id!==cinemaId){
  cinemaId=state.presentation.id;collapsed=false;pointer=null;pickerTicket=null;$('move-picker').close();$('guide').close();
  const attack=state.presentation.attacks.find(a=>a.target===seat)??state.presentation.attacks[0],move=getPresentationMove(attack.move);
  court.reset();court.play({id:attack.eventId??state.eventSeq,roundId:state.roundId,type:'dunk',seat:attack.seat,attackId:attack.attackId,move:move.id,slowdown:true,count:attack.count,initialCount:attack.count,durationMs:state.presentation.durationMs,clipDurationMs:move.durationMs,cinematicFx:true,impactMs:getAttackTiming(move.id).contactMs,warningMs:3000,rawAt:attack.sourceAt,at:state.presentation.visualAt??state.presentation.gameAt},attack.seat===seat);
 }
 if(!state.presentation&&cinemaId){cinemaId=null;court.reset();collapsed=false;}
 if(court.moment&&!state.presentation){const m=court.moment,synced=syncAttack({...m,at:m.rawAt},state,seat);Object.assign(m,synced,{rawAt:synced.at,at:synced.at+R.attackWindupMs});}if(state.phase==='finished'){particles=[];court.reset();combat.reset();pickerTicket=null;pointer=null;$('move-picker').close();$('guide').close();}
 targets=hazardTargets(state.players[seat].board);update();
}
async function send(type,extra={}){
 if(blocked||!store||(state?.presentation&&type!=='TICK')||(['READY','REMATCH','CANCEL_REMATCH'].includes(type)&&state?.phase==='finished'&&!ending.sample(Date.now(),reduced.matches).reveal))return;
 try{const result=await store.send(type,{roundId:state?.roundId,...extra});netOffline=false;consume(result);update();return result;}catch(e){if(e.fatal)fail(e);else if(['REMATCH','CANCEL_REMATCH'].includes(type)&&e.status===409){rematchNotice=e.message;netOffline=false;update();}else{netOffline=true;$('connection').textContent='Disconnected · Reconnecting';$('dunk').disabled=true;$('toast').textContent='Resume when connected';}}
}
function update(){
 if(!state)return;const p=state.players[seat],q=state.players[rival],now=store.now(),playing=state.phase==='playing',mine=p.token===store.token;
 if(!mine){blocked=true;$('error').hidden=false;$('error').textContent=`Seat ${seat} is open in another tab. Return to that tab or choose Back to Lobby.`;}
 const ready=!state.presentation&&!choosing&&playing&&p.energy>=100&&!p.flight&&now>=p.dunkUntil&&!blocked;
 $('score').textContent=p.score;$('energy-number').textContent=`${p.energy} / 100`;$('energy-fill').style.width=`${p.energy}%`;
 document.querySelector('.energy-track').setAttribute('aria-valuenow',String(p.energy));
 $('energy-label').textContent=p.energy>=100?'DUNK READY!':'DUNK ENERGY';$('energy-hint').textContent=p.energy>=100?(fourMoves?'Pick a move · Up to 4 junk':'Clear bottom row + up to 4 junk'):'Normal +16 · Junk gives no energy';
 $('dunk').disabled=!ready;$('dunk').classList.toggle('ready',ready);$('dunk').querySelector('small').textContent=state.presentation?'Dunk playing · Match paused':p.flight?'Wait for your bubble to land':now<p.dunkUntil?(p.dunkUntil-now>R.dunkMs?'Winding up':'Dunk in progress'):p.energy>=100?(fourMoves?'Pick 1 of 4 moves':'Clear row · Up to 4 junk'):'Charge to attack';
 $('test-failure').disabled=!solo||!playing||!!state.presentation||!!p.flight||blocked;
 $('test-receive').disabled=!solo||!playing||!!state.presentation||!!q.flight||now<q.dunkUntil;
 $('test-charge').disabled=!!state.presentation||!playing||blocked||p.energy>=100;$('test-charge').title='Practice only: fill your energy bar';
 $('rival-label').textContent=q.token?`Rival ${rival} · ${q.ready?'Ready':'Joined'}`:'Waiting for rival';$('rival-score').textContent=`${q.score} pts`;$('rival-energy').textContent=`⚡ ${q.energy}`;
 if(solo)$('rival-label').textContent='Practice rival · BOT';
 const gray=p.board.flat().filter(v=>v===-1).length,normal=p.board.flat().filter(v=>v!==null&&v!==-1).length;
 $('bubble-count').textContent=`${normal} normal · ${gray} junk`;
 $('court-subtitle').textContent=`Your Dunks ${p.dunks} · Rival ${q.dunks}`;
 const incoming=p.incoming.reduce((sum,a)=>sum+a.count,0);$('incoming').classList.toggle('active',incoming>0);const displayed=p.incoming.filter(a=>a.displayed).reduce((sum,a)=>sum+a.count,0);$('incoming').textContent=displayed?`${displayed} junk waiting for your bubble to land`:incoming?`RIVAL → YOU · ${incoming}/${R.pendingMax} pending · Pop 3 to block 1${p.flight?' · Waiting for landing':''}`:'';
 $('hazard-hint').textContent=hazardHint(gray,incoming,displayed);$('hazard-hint').classList.toggle('danger',gray>0||incoming>0);
 $('connection').innerHTML='<i></i>';$('connection').append(document.createTextNode(state.phase==='playing'?`You ${seat} vs ${rival} · LIVE`:state.phase==='paused'?'Rival disconnected · Paused':state.phase==='finished'?'Match over':state.phase==='countdown'?'Both ready · Get set':q.token?'Both joined · Tap Ready':'Waiting for rival'));
 if(solo)$('connection').textContent=state.phase==='playing'?'You vs Bot · Practice':state.phase==='lobby'?'Bot ready · Your move':state.phase==='countdown'?'Practice · Get set':state.phase==='finished'?'Match over · Play Again':'Practice paused';
 $('overlay').hidden=playing;$('ready').hidden=!['lobby','finished'].includes(state.phase);$('ready').disabled=p.ready||blocked;
 if(state.phase==='lobby'){$('overlay-kicker').textContent='ONLINE DUEL';$('overlay-title').innerHTML='Two courts.<br>One big Dunk.';$('overlay-text').textContent=`Room ${roomId}. Share the code or invite link.\nBoth players tap Ready to start.`;$('ready').textContent=p.ready?'Ready · Waiting for Rival':'Ready ↗';}
 if(solo&&state.phase==='lobby'){$('overlay-kicker').textContent='SOLO / DEMO01';$('overlay-title').innerHTML='Solo court.<br>Big moves.';$('overlay-text').textContent='The bot is ready to pop, charge and Dunk back.\nKeep playing after each Dunk. Only the danger line ends the match.';$('ready').textContent='Start Practice ↗';}
 if(state.phase==='countdown'){$('overlay-kicker').textContent='BOTH PLAYERS READY';$('overlay-title').textContent=String(Math.max(1,Math.ceil((state.countdownAt-now)/1000)));$('overlay-text').textContent='Pop. Charge. DUNK!';}
 if(state.phase==='paused'){$('overlay-kicker').textContent='MATCH PAUSED';$('overlay-title').textContent='Waiting to reconnect';$('overlay-text').textContent='Ask your rival to return to the game.\nThe match clock stays paused until they reconnect.';}
 if(state.phase==='finished'){const won=state.winner===seat,draw=state.winner==='draw';const result=draw?'Both reached the danger line · Draw':won?`Your rival reached the danger line. Your Dunks: ${p.dunks}.`:`You reached the danger line. Your Dunks: ${p.dunks}.`;$('overlay-text').textContent=result+(solo?'':`\n${rematchNotice||rematchControls(state,seat).message}`);}
 renderEnding();
 if($('move-picker').open&&!openMovePicker(state,seat,now)){$('move-picker').close();pickerTicket=null;}
 $('help').disabled=!!state.presentation||state.phase==='finished';boardCanvas.setAttribute('aria-disabled',String(!!state.presentation));boardCanvas.dataset.cinema=state.presentation?'playing':'none';
 boardCanvas.dataset.phase=state.phase;boardCanvas.dataset.energy=p.energy;boardCanvas.dataset.gray=gray;boardCanvas.dataset.shots=p.shots;boardCanvas.dataset.round=state.roundId;boardCanvas.dataset.revision=state.revision;
}
function renderEnding(){
 const sample=ending.sample(Date.now(),reduced.matches),finished=state?.phase==='finished',wrap=document.querySelector('.board-wrap'),overlay=$('overlay');
 wrap.classList.toggle('result-ending',finished);wrap.style.setProperty('--ending-gray',finished?sample.desaturate:0);wrap.style.setProperty('--ending-dim',finished?sample.dim:0);overlay.classList.toggle('result-reveal',finished);
 if(!finished){overlay.style.removeProperty('--result-opacity');$('rematch-cancel').hidden=true;return;}
 const controls=rematchControls(state,seat,{solo});
 overlay.hidden=!sample.reveal;overlay.style.setProperty('--result-opacity',sample.opacity);overlay.dataset.result=sample.kind;$('overlay-kicker').textContent=sample.kicker;$('overlay-title').textContent=sample.title;$('ready').textContent=rematchBusy?'Sending…':controls.label;$('ready').disabled=!sample.reveal||controls.disabled||rematchBusy||blocked||netOffline;
 $('rematch-cancel').hidden=!sample.reveal||!controls.secondary;$('rematch-cancel').textContent=controls.secondary??'';$('rematch-cancel').disabled=rematchBusy||blocked||netOffline;
}
async function requestRematch(cancel=false){
 if(rematchBusy||state?.phase!=='finished')return;const controls=rematchControls(state,seat,{solo});
 if(cancel?!controls.secondary:controls.disabled)return;
 rematchBusy=true;rematchNotice=null;renderEnding();
 try{await send(cancel?'CANCEL_REMATCH':controls.action,{rematchVersion:controls.version});}finally{rematchBusy=false;renderEnding();}
}
function burst(cells,at,gray=false){if(reduced.matches)return;for(const cell of cells.slice(0,VISUAL.particles)){const p=position(cell.row,cell.col);particles.push({...p,color:gray?P.gray:cell.color===-1?P.gray:P.balls[cell.color],at,vx:(Math.random()-.5)*110,vy:-30-Math.random()*60});}particles=particles.slice(-VISUAL.particles);}
function ball(c,x,y,color,r=G.radius){c.save();const gray=color===-1,fill=gray?P.gray:P.balls[color];const g=c.createRadialGradient(x-r*.35,y-r*.4,1,x,y,r);g.addColorStop(0,gray?'#d6dedc':'#f1ffea');g.addColorStop(.28,fill);g.addColorStop(1,gray?'#485b65':'#174252');c.fillStyle=g;c.strokeStyle=gray?COMBAT.hazardOutline:fill;c.lineWidth=gray?2.4:1.5;c.beginPath();c.arc(x,y,r*.91,0,7);c.fill();c.stroke();c.strokeStyle=gray?'#3c515a':'#133a4880';c.lineWidth=1.4;c.beginPath();if(gray){c.strokeStyle=COMBAT.hazardLight;c.lineWidth=1.5;c.moveTo(x-r*.7,y-r*.4);c.lineTo(x-r*.3,y-r*.2);c.lineTo(x-r*.5,y+r*.1);c.moveTo(x+r*.4,y+r*.25);c.lineTo(x+r*.65,y+r*.5);c.stroke();c.fillStyle=COMBAT.hazardOutline;c.beginPath();c.moveTo(x,y-r*.6);c.lineTo(x-r*.3,y+r*.08);c.lineTo(x,y+r*.03);c.lineTo(x-r*.06,y+r*.6);c.lineTo(x+r*.35,y-r*.15);c.lineTo(x+r*.07,y-r*.1);c.closePath();c.fill();c.beginPath();}else{c.arc(x-r*.7,y,r*1.05,-.8,.8);c.moveTo(x-r*.8,y);c.quadraticCurveTo(x,y+r*.3,x+r*.8,y);}c.stroke();c.restore();}
function resizeBoard(){const w=boardCanvas.clientWidth,h=boardCanvas.clientHeight,d=Math.min(devicePixelRatio||1,G.maxDpr),width=Math.round(w*d),height=Math.round(h*d);if(boardCanvas.width!==width||boardCanvas.height!==height){boardCanvas.width=width;boardCanvas.height=height;}scale=Math.min(w/G.width,h/G.height);offsetX=(w-G.width*scale)/2;offsetY=(h-G.height*scale)/2;ctx.setTransform(d*scale,0,0,d*scale,d*offsetX,d*offsetY);ctx.clearRect(-offsetX/scale,-offsetY/scale,w/scale,h/scale);}
function flightPosition(f,now){const u=Math.max(0,Math.min(1,(now-f.startAt)/(f.endAt-f.startAt)));const parts=f.path.slice(1).map((p,i)=>Math.hypot(p.x-f.path[i].x,p.y-f.path[i].y));let remaining=parts.reduce((a,b)=>a+b,0)*u;for(let i=0;i<parts.length;i++){if(remaining<=parts[i]){const a=f.path[i],b=f.path[i+1],k=parts[i]?remaining/parts[i]:0;return {x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};}remaining-=parts[i];}return f.path.at(-1);}
function draw(now){
 if(stopped)return;requestAnimationFrame(()=>draw(store.now()));if(!state||document.hidden)return;
 renderEnding();resizeBoard();const p=state.players[seat],q=state.players[rival];
 ctx.strokeStyle='#47677644';ctx.lineWidth=1;for(let x=27;x<350;x+=36){ctx.beginPath();ctx.moveTo(x,24);ctx.lineTo(x,382);ctx.stroke();}
 ctx.setLineDash([6,6]);ctx.strokeStyle='#ef946e';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(14,G.danger);ctx.lineTo(346,G.danger);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#e2a58b';ctx.font='8px sans-serif';ctx.fillText('DANGER LINE',16,G.danger-8);
 p.board.forEach((line,r)=>line.forEach((v,c)=>{if(v!==null){const pos=position(r,c);ball(ctx,pos.x,pos.y,v);}}));
 if(now<hazardCueUntil){ctx.setLineDash([3,4]);ctx.lineWidth=1.4;ctx.strokeStyle=COMBAT.hazardOutline;for(const cell of targets){const pos=position(cell.row,cell.col);ctx.beginPath();ctx.arc(pos.x,pos.y,G.radius+3,0,7);ctx.stroke();}ctx.setLineDash([]);}
 if(state.phase==='playing'&&!p.flight){const path=planShot(p.board,angle).path;ctx.lineWidth=2;ctx.strokeStyle=pointer!==null?'#fff1cc':'#73d7cb99';ctx.setLineDash([3,7]);ctx.beginPath();path.forEach((point,i)=>i?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.stroke();ctx.setLineDash([]);for(const point of path.filter(p=>p.bounce)){ctx.fillStyle=P.orange;ctx.beginPath();ctx.arc(point.x,point.y,4,0,7);ctx.fill();}ctx.save();ctx.translate(180,G.launcher);ctx.rotate(angle);ctx.fillStyle=P.paper;ctx.beginPath();ctx.moveTo(0,-53);ctx.lineTo(-7,-40);ctx.lineTo(-2,-40);ctx.lineTo(-2,-25);ctx.lineTo(2,-25);ctx.lineTo(2,-40);ctx.lineTo(7,-40);ctx.closePath();ctx.fill();ctx.restore();}
 ctx.strokeStyle='#52887e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(180,G.launcher,25,0,7);ctx.stroke();ball(ctx,180,G.launcher,currentColor(p));ball(ctx,278,G.launcher+1,currentColor(p,1),12);ctx.font='8px sans-serif';ctx.fillStyle='#9bbaac';ctx.fillText('NEXT',266,G.launcher+24);
 if(p.flight){const v=flightPosition(p.flight,state.phase==='paused'?state.pausedAt:now);ball(ctx,v.x,v.y,p.flight.color);}
 particles=particles.filter(v=>now-v.at<VISUAL.particleMs);for(const v of particles){const t=(now-v.at)/1000;ctx.globalAlpha=Math.max(0,1-t/.55);ctx.fillStyle=v.color;ctx.beginPath();ctx.arc(v.x+v.vx*t,v.y+v.vy*t+220*t*t,4,0,7);ctx.fill();}ctx.globalAlpha=1;
 miniCtx.setTransform(88/G.width,0,0,118/G.height,0,0);miniCtx.clearRect(0,0,G.width,G.height);q.board.forEach((line,r)=>line.forEach((v,c)=>{if(v!==null){const pos=position(r,c);ball(miniCtx,pos.x,pos.y,v);}}));miniCtx.strokeStyle='#e49876';miniCtx.beginPath();miniCtx.moveTo(12,G.danger);miniCtx.lineTo(348,G.danger);miniCtx.stroke();
 const incomingCinema=!!state.presentation?.attacks.some(a=>a.target===seat),cinematic=!!state.presentation;
 const visualNow=state.presentation?(store.visualNow?.()??now):state.phase==='paused'?state.pausedAt:now,sceneNow=cinematic&&court.moment?Math.min(visualNow,court.moment.at+court.moment.durationMs-.01):visualNow,active=court.draw(sceneNow,{visible:!collapsed});
 document.querySelector('.game').classList.toggle('incoming-cinema',incomingCinema);courtPanel.classList.toggle('receiving',incomingCinema);$('cinema-shade').hidden=!incomingCinema;$('cinema-status').hidden=!cinematic;
 let tailStage='clip';
 if(cinematic&&court.moment){
  const m=court.moment,game=document.querySelector('.game').getBoundingClientRect(),rect=courtPanel.getBoundingClientRect(),attack=state.presentation.attacks.find(a=>a.target===seat)??state.presentation.attacks[0],target=state.players[attack.target],own=attack.seat===seat;
  const origin=court.origin(),from={x:origin.x-game.left,y:origin.y-game.top};let to;
  if(own){const box=document.querySelector('.rival').getBoundingClientRect();to=Array.from({length:attack.count},(_,i)=>({x:box.left-game.left+box.width*(.14+.72*i/Math.max(1,attack.count-1)),y:box.top-game.top+box.height*.65}));}
  else if(target.flight){const box=boardCanvas.getBoundingClientRect();to=Array.from({length:attack.count},(_,i)=>({x:game.width*.5+(i-(attack.count-1)/2)*28,y:box.top-game.top+48}));}
  else{const box=boardCanvas.getBoundingClientRect(),forecast=addGarbage(structuredClone(target.board),attack.count,attack.seed);to=forecast.added.map(c=>{const v=position(c.row,c.col);return {x:box.left-game.left+offsetX+v.x*scale,y:box.top-game.top+offsetY+v.y*scale};});}
  let impactFrom=from;if(fourMoves&&m.move!=='classic'){const box=court.canvas.getBoundingClientRect(),point=projectFocusPoint(m.move,getMove(m.move).impactMs,impactPoint(m.move),box.width,box.height);impactFrom={x:box.left-game.left+point.x,y:box.top-game.top+point.y};}
  const tailStart=getAttackTiming(m.move).contactMs;
  tailStage=spectacle.render(visualNow-m.at,tailStart,{count:m.count,move:m.move,own,from,impactFrom,to,reduced:reduced.matches}).stage;
  const cue=tailStage==='burst'?'SLAM!':tailStage==='flight'?(m.count?`${own?'YOU → RIVAL':'RIVAL → YOU'} · Junk ×${m.count}`:'Attack blocked'):tailStage==='impact'?`${own?'YOU → RIVAL':'RIVAL → YOU'} · IMPACT · Slow motion`:tailStage==='hold'?(m.count?`${own?'YOU → RIVAL':'RIVAL → YOU'} · ${target.flight?'Waiting for landing':'Pending'} ×${m.count}`:'Attack blocked'):incomingCinema?'Incoming Dunk':'Attacking rival';
  $('cinema-status').textContent=`${cue} · Paused · ${Math.max(.1,(store.cinemaRemaining?.()??0)/1000).toFixed(1)}s to resume`;
 }else spectacle.clear();
 document.querySelector('.game').classList.toggle('fx-flight',tailStage==='flight');
 document.querySelector('.game').classList.toggle('fx-hold',tailStage==='impact'||tailStage==='hold');
 const fade=cinematic&&court.moment?Math.max(0,Math.min(1,(visualNow-court.moment.at-(state.presentation.durationMs-SPECTACLE.fadeMs))/SPECTACLE.fadeMs)):0;courtPanel.style.setProperty('--sequence-opacity',String(1-fade));$('cinema-shade').style.opacity=String(1-fade);

courtPanel.classList.toggle('playing',active&&!collapsed);
 if(fourMoves){courtPanel.classList.toggle('in-round-move',active&&!collapsed);$('collapse-move').hidden=!active||incomingCinema;$('collapse-move').textContent=collapsed?'Expand ⌄':'Collapse ⌃';$('collapse-move').setAttribute('aria-label',collapsed?'Expand Dunk animation':'Collapse Dunk animation');}
 const moment=court.moment,elapsed=moment?visualNow-moment.at:Infinity,impactAt=moment?.impactMs??COMBAT.impactAt,hit=reduced.matches?0:elapsed>=impactAt&&elapsed<impactAt+COMBAT.impactMs?Math.sin((elapsed-impactAt)/COMBAT.impactMs*Math.PI):0;
 courtPanel.style.setProperty('--hit',hit);courtPanel.dataset.attack=moment?.own?'self':'rival';
 const cue=moment?dunkCue({...moment,at:moment.rawAt},visualNow,moment.own,solo?'Bot':`Player ${rival}`):null,preparing=cue?.stage==='warning';courtPanel.classList.toggle('preparing',preparing);$('attack-warning').hidden=!preparing;
 if(preparing){$('attack-countdown').textContent=cue.number;$('attack-warning-text').textContent=cue.message;$('attack-warning-detail').textContent=moment.count?`${moment.own?'Rival can pop to block':'Pop to block'} · Pending ${moment.count}`:moment.blocked?'Blocked · No incoming junk':'Queue full · Bottom row cleared';$('attack-warning-progress').style.width=`${cue.progress*100}%`;}
 if(active){const copy=attackCopy(moment,moment.own);$('slam-direction').textContent=copy.direction;$('slam-title').textContent=fourMoves?getMove(moment.move).name:copy.title;$('slam-detail').textContent=fourMoves&&$('court').dataset.fallback==='true'?'Basic Dunk shown · Attack power unchanged':cinematic?`${incomingCinema?'RIVAL → YOU':'YOU → RIVAL'} · ${moment.count} junk · Match paused`:copy.detail;}
 if(solo){const lines=[];for(const target of [rival,seat])for(const packet of state.players[target].incoming){const incoming=target===seat;lines.push(`${incoming?'RIVAL → YOU':'YOU → RIVAL'} · ${getMove(packet.move).name} ×${packet.count} · ${packet.displayed?'After landing':`${Math.max(0,Math.ceil((packet.dueAt-now)/1000))}s`}`);}$('attack-queue').style.visibility=lines.length?'visible':'hidden';const text=lines.join(' ｜ ');$('attack-queue').title=text;if($('attack-queue').textContent!==text)$('attack-queue').textContent=text;}
 const feedback=combat.sample(now,reduced.matches);notice.hidden=cinematic||!feedback.active||state.phase!=='playing'||combat.event?.type==='dunk';
 if(feedback.active){if(noticeEvent!==combat.event){noticeEvent=combat.event;notice.className=`notice-${feedback.kind}`;notice.querySelector('strong').textContent=feedback.title;notice.querySelector('span').textContent=feedback.detail;}notice.style.opacity=String(Math.min(1,(COMBAT.noticeMs-feedback.age)/200));}

 $('court-title').textContent=active?(court.moment.own?'YOUR DUNK!':'RIVAL DUNK!'):'MAKE YOUR\nMOVE.';$('court-kicker').textContent=active?(court.moment.own?'YOUR ATTACK':'RIVAL ATTACK'):'STREET DUEL';
 if(state.phase==='playing'&&moment&&visualNow>=moment.rawAt&&visualNow-moment.rawAt<R.attackWindupMs+(moment.durationMs??R.dunkMs)){const copy=attackCopy(moment,moment.own);$('connection').textContent=`${copy.direction} · ${moment.count?`${elapsed<0?(moment.own?'Sending soon':'Incoming soon'):(moment.own?'Sending':'Incoming')} ${moment.count} junk bubbles`:'Bottom row cleared'}`;$('connection').dataset.attack=moment.own?'self':'rival';}else $('connection').dataset.attack='none';
 if(state.phase==='countdown')$('overlay-title').textContent=String(Math.max(1,Math.ceil((state.countdownAt-now)/1000)));
 $('pressure-count').textContent=state.presentation?'Dunk playing · Pressure paused':state.phase==='playing'?`New row in ${Math.max(0,Math.ceil((state.nextPressureAt-now)/1000))}s`:`New row every ${(state.pressureMs??R.pressureMs)/1000}s`;
 if(netOffline){$('connection').textContent='Disconnected · Reconnecting';$('toast').textContent='Waiting to reconnect';}else if(now-lastMessageAt>4500)$('toast').textContent=p.energy>=100?'DUNK ready · Clear your row and send up to 4 junk':'Tap to shoot · Drag to aim';
 // Ready state changes at the end of a spectacle even with no storage event.
 const canDunk=!state.presentation&&!choosing&&state.phase==='playing'&&p.energy>=100&&!p.flight&&now>=p.dunkUntil&&!blocked;
 $('dunk').disabled=!canDunk||netOffline;$('dunk').classList.toggle('ready',canDunk);
}
function point(e){const rect=boardCanvas.getBoundingClientRect();return {x:(e.clientX-rect.left-offsetX)/scale,y:(e.clientY-rect.top-offsetY)/scale};}
const canShoot=()=>!state?.presentation&&!netOffline&&state?.phase==='playing'&&!state.players[seat].flight&&!blocked&&!sending&&!$('guide').open&&!$('move-picker').open;
function aim(p){angle=Math.max(-G.angleLimit,Math.min(G.angleLimit,Math.atan2(p.x-180,Math.max(30,G.launcher-p.y))));}
boardCanvas.addEventListener('pointerdown',e=>{if(!canShoot()||!e.isPrimary||e.button!==0||pointer!==null)return;const p=point(e);if(p.y<24||p.y>G.launcher-G.radius||p.x<0||p.x>G.width)return;pointer=e.pointerId;gestureRound=state.roundId;aim(p);boardCanvas.setPointerCapture(e.pointerId);});
boardCanvas.addEventListener('pointermove',e=>{if(e.pointerId===pointer)aim(point(e));});
boardCanvas.addEventListener('pointerup',async e=>{if(e.pointerId!==pointer)return;pointer=null;const p=point(e);if(p.x<0||p.x>G.width||p.y<24||p.y>G.launcher-G.radius||!canShoot()||gestureRound!==state.roundId)return;aim(p);sending=true;await send('SHOOT',{angle});sending=false;});
for(const name of ['pointercancel','lostpointercapture'])boardCanvas.addEventListener(name,()=>pointer=null);
boardCanvas.addEventListener('keydown',async e=>{if(!canShoot())return;if(['ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')angle=Math.max(-G.angleLimit,angle-.04);if(e.key==='ArrowRight')angle=Math.min(G.angleLimit,angle+.04);if(e.key===' '){sending=true;await send('SHOOT',{angle});sending=false;}});
$('ready').addEventListener('click',()=>state?.phase==='finished'?requestRematch():send('READY'));
$('rematch-cancel').addEventListener('click',()=>requestRematch(true));
if(fourMoves){for(const rawMove of MOVES){const move=getPresentationMove(rawMove.id);const button=document.createElement('button');button.type='button';button.dataset.move=move.id;button.style.setProperty('--move-accent',move.accent);const glyph=document.createElement('i');glyph.textContent=move.glyph;const title=document.createElement('b');title.textContent=move.name;const note=document.createElement('span');note.textContent=`${move.summary} · ${(getCinematicDuration(move.id)/1000).toFixed(1)}s animation`;const count=document.createElement('small');count.textContent='Up to 4 junk · Pop to defend during warning';button.append(glyph,title,note,count);button.addEventListener('click',async()=>{if(choosing||netOffline)return;const choice=chooseMove(pickerTicket,move.id,state,seat,store.now());if(!choice)return;choosing=true;pickerTicket=null;$('move-picker').close();update();try{await send('DUNK',choice);}finally{choosing=false;update();}});$('move-options').append(button);}
 $('guide').querySelectorAll('li')[2].querySelector('span').textContent='At 100 energy, tap DUNK and choose a move. Every move clears your bottom row and sends up to 4 junk. Your rival has 3 seconds to defend. Both boards pause for the animation, then play resumes. Cancel keeps your energy.';
 $('guide').querySelectorAll('li')[3].querySelector('span').textContent='Cracked grey bubbles are junk. Match 3 normal bubbles beside them to break them, or detach them to make them drop. During the warning, each group of 3 normal bubbles cleared in one shot blocks 1 incoming junk. Groups do not carry over. Up to 8 junk can be pending. Junk gives no energy.';
}
$('dunk').addEventListener('click',()=>{if(!fourMoves){send('DUNK');return;}if(choosing||netOffline)return;pickerTicket=openMovePicker(state,seat,store.now());if(pickerTicket){pointer=null;$('move-picker').showModal();}});
$('cancel-move').addEventListener('click',()=>{pickerTicket=null;$('move-picker').close();});$('move-picker').addEventListener('cancel',()=>pickerTicket=null);$('collapse-move').addEventListener('click',()=>{if(!state?.presentation?.attacks.some(a=>a.target===seat))collapsed=!collapsed;});$('test-charge').addEventListener('click',()=>{if(canPractice)send('CHARGE');});
$('test-failure').addEventListener('click',()=>send('PREVIEW_FAILURE'));
$('test-receive').addEventListener('click',()=>send('PREVIEW_RIVAL',{move:'windmill'}));
$('help').addEventListener('click',()=>{pointer=null;$('guide').showModal();});$('close-help').addEventListener('click',()=>$('guide').close());
async function poll(){if(polling||blocked||stopped)return;polling=true;await send('TICK');polling=false;}
try{
 consume(initial);const timer=setInterval(poll,250);
 document.addEventListener('visibilitychange',()=>{pointer=null;if(!document.hidden)poll();});
 window.addEventListener('pagehide',e=>{pointer=null;if(!e.persisted){stopped=true;clearInterval(timer);}});
 window.addEventListener('pageshow',e=>{if(e.persisted){pointer=null;poll();}});
 draw(store.now());
}catch(e){fail(e);}
}
