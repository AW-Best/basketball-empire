import {RoomStore} from './room.js';
import {currentColor,planShot,position} from './model.js';
import {RULES as R,BOARD as G,PALETTE as P,VISUAL} from './Constants.js';
import {ComicCourt} from './comic.js';

const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const roomId=(params.get('room')||crypto.randomUUID().slice(0,6)).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,16)||'COURT';
const seat=params.get('seat')==='B'?'B':'A',rival=seat==='A'?'B':'A';
history.replaceState(null,'',`?room=${encodeURIComponent(roomId)}&seat=${seat}`);
$('room-name').textContent=roomId;$('seat-name').textContent=seat;
$('open-rival').href=`?room=${encodeURIComponent(roomId)}&seat=${rival}`;
$('open-rival').textContent=`打开 ${rival} 对手页 ↗`;
$('new-room').href=`?room=${crypto.randomUUID().slice(0,6)}&seat=A`;
const boardCanvas=$('board'),ctx=boardCanvas.getContext('2d'),mini=$('rival-board'),miniCtx=mini.getContext('2d'),court=new ComicCourt($('court'));
let state=null,store,channel,revision=-1,round=-1,eventSeq=0,angle=0,pointer=null,gestureRound=null,scale=1,offsetX=0,offsetY=0,particles=[],lastMessageAt=0,polling=false,sending=false,blocked=false,stopped=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function fail(error){$('error').hidden=false;$('error').textContent=error.message||String(error);blocked=true;update();}
function toast(text){$('toast').textContent=text;lastMessageAt=Date.now();}
function consume(next){
 if(next.revision<=revision)return;revision=next.revision;state=next;
 if(round!==state.roundId){round=state.roundId;eventSeq=state.eventSeq;pointer=null;particles=[];court.reset();}
 for(const event of state.events.filter(e=>e.id>eventSeq)){
  eventSeq=Math.max(eventSeq,event.id);if(Date.now()-event.at>2200)continue;
  if(event.type==='dunk'){court.play(event,event.seat===seat);toast(event.seat===seat?`DUNK！清底排 · 发送 ${event.count} 个干扰球`:`对手 DUNK！待落 ${event.count} 个干扰球`);}
  if(event.type==='shot-blocked'&&event.seat===seat)toast('这个角度没有落点，换个方向 · 不消耗球');
  if(event.type==='block'&&event.seat===seat)toast(`BLOCK！抵消 ${event.count} 个干扰球`);
  if(event.type==='pop'&&event.seat===seat&&event.normal>0){burst(event.cells,event.at);toast(`消除 ${event.normal} · +${event.energy} 能量${event.gray?` · 击碎 ${event.gray} 灰球`:''}`);}
  if(event.type==='garbage'&&event.seat===seat){burst(event.cells,event.at,true);toast(`干扰落入 +${event.count} · 消掉相邻普通球可击碎`);}
  if(event.type==='dunk'&&event.seat===seat)burst(event.cells,event.at);
  if(event.type==='pressure')toast('压力上升！双方新增一排');
 }
 update();
}
async function send(type,extra={}){
 if(blocked||!store)return;
 try{const result=await store.send(type,{roundId:state?.roundId,...extra});consume(result);return result;}catch(e){fail(e);}
}
function update(){
 if(!state)return;const p=state.players[seat],q=state.players[rival],now=Date.now(),playing=state.phase==='playing',mine=p.token===store.token;
 if(!mine){blocked=true;$('error').hidden=false;$('error').textContent=`${seat} 已被另一个页面占用。请回到原页面，或点“另开一个房间”。`;}
 const ready=playing&&p.energy>=100&&!p.flight&&now>=p.dunkUntil&&!blocked;
 $('score').textContent=p.score;$('energy-number').textContent=`${p.energy} / 100`;$('energy-fill').style.width=`${p.energy}%`;
 document.querySelector('.energy-track').setAttribute('aria-valuenow',String(p.energy));
 $('energy-label').textContent=p.energy>=100?'DUNK READY!':'DUNK 能量';$('energy-hint').textContent=p.energy>=100?'清底排 + 对手灰球 ×4':'消除普通泡泡 +16';
 $('dunk').disabled=!ready;$('dunk').classList.toggle('ready',ready);$('dunk').querySelector('small').textContent=p.flight?'球落定后可出击':now<p.dunkUntil?'扣篮进行中':p.energy>=100?'清底排 · 发 4 灰球':'蓄满能量后出击';
 $('test-charge').disabled=!playing||blocked||p.energy>=100;$('test-charge').title='仅本地试玩，直接填满自己的能量条';
 $('rival-label').textContent=q.token?`对手 ${rival} · ${q.ready?'已准备':'已加入'}`:'对手等待加入';$('rival-score').textContent=`${q.score} 分`;$('rival-energy').textContent=`⚡ ${q.energy}`;
 const gray=p.board.flat().filter(v=>v===-1).length,normal=p.board.flat().filter(v=>v!==null&&v!==-1).length;
 $('bubble-count').textContent=`普通 ${normal} · 灰球 ${gray}`;
 $('court-subtitle').textContent=`本局 DUNK ${p.dunks} 次 · 触底才结算`;
 const incoming=p.incoming.reduce((sum,a)=>sum+a.count,0);$('incoming').classList.toggle('active',incoming>0);$('incoming').textContent=incoming?`对手 DUNK！干扰 +${incoming}${p.flight?' · 落球后加入':''}`:'';
 $('connection').innerHTML='<i></i>';$('connection').append(document.createTextNode(state.phase==='playing'?`你 ${seat} vs ${rival} · 实时对战`:state.phase==='paused'?'对手页面离线 · 已暂停':state.phase==='finished'?'本局结束':state.phase==='countdown'?'双方就绪 · 即将开战':q.token?'双方已入房 · 等待准备':'等待对手加入'));
 $('overlay').hidden=playing;$('ready').hidden=!['lobby','finished'].includes(state.phase);$('ready').disabled=p.ready||blocked;
 if(state.phase==='lobby'){$('overlay-kicker').textContent='LOCAL DUEL';$('overlay-title').innerHTML='两个球场，<br>一记狠的。';$('overlay-text').textContent=`同一浏览器打开 ${rival} 对手页。\n双方准备后同时开打。`;$('ready').textContent=p.ready?'已准备 · 等待对手':'准备开战 ↗';}
 if(state.phase==='countdown'){$('overlay-kicker').textContent='BOTH PLAYERS READY';$('overlay-title').textContent=String(Math.max(1,Math.ceil((state.countdownAt-now)/1000)));$('overlay-text').textContent='消除蓄能，DUNK 出击！';}
 if(state.phase==='paused'){$('overlay-kicker').textContent='MATCH PAUSED';$('overlay-title').textContent='等队友回来。';$('overlay-text').textContent='请重新打开或刷新对手页。\n双方回到房间后自动继续，计时冻结。';}
 if(state.phase==='finished'){const won=state.winner===seat,draw=state.winner==='draw';$('overlay-kicker').textContent='MATCH COMPLETE';$('overlay-title').textContent=draw?'DRAW!':won?'YOU WIN!':'RUN IT BACK.';$('overlay-text').textContent=draw?'双方同时触底 · 平局':won?`对手泡泡碰到底线。你本局 DUNK ${p.dunks} 次。`:`你的泡泡碰到底线。本局 DUNK ${p.dunks} 次。`;$('ready').textContent=p.ready?'已准备 · 等待重赛':'准备再战 ↗';}
 boardCanvas.dataset.phase=state.phase;boardCanvas.dataset.energy=p.energy;boardCanvas.dataset.gray=gray;boardCanvas.dataset.shots=p.shots;boardCanvas.dataset.round=state.roundId;boardCanvas.dataset.revision=state.revision;
}
function burst(cells,at,gray=false){if(reduced.matches)return;for(const cell of cells.slice(0,VISUAL.particles)){const p=position(cell.row,cell.col);particles.push({...p,color:gray?P.gray:cell.color===-1?P.gray:P.balls[cell.color],at,vx:(Math.random()-.5)*110,vy:-30-Math.random()*60});}particles=particles.slice(-VISUAL.particles);}
function ball(c,x,y,color,r=G.radius){c.save();const gray=color===-1,fill=gray?P.gray:P.balls[color];const g=c.createRadialGradient(x-r*.35,y-r*.4,1,x,y,r);g.addColorStop(0,gray?'#d6dedc':'#f1ffea');g.addColorStop(.28,fill);g.addColorStop(1,gray?'#485b65':'#174252');c.fillStyle=g;c.strokeStyle=gray?'#c0cbc4':fill;c.lineWidth=1.5;c.beginPath();c.arc(x,y,r*.91,0,7);c.fill();c.stroke();c.strokeStyle=gray?'#3c515a':'#133a4880';c.lineWidth=1.4;c.beginPath();if(gray){c.moveTo(x-r*.3,y-r*.3);c.lineTo(x+r*.3,y+r*.3);c.moveTo(x+r*.3,y-r*.3);c.lineTo(x-r*.3,y+r*.3);}else{c.arc(x-r*.7,y,r*1.05,-.8,.8);c.moveTo(x-r*.8,y);c.quadraticCurveTo(x,y+r*.3,x+r*.8,y);}c.stroke();c.restore();}
function resizeBoard(){const w=boardCanvas.clientWidth,h=boardCanvas.clientHeight,d=Math.min(devicePixelRatio||1,G.maxDpr),width=Math.round(w*d),height=Math.round(h*d);if(boardCanvas.width!==width||boardCanvas.height!==height){boardCanvas.width=width;boardCanvas.height=height;}scale=Math.min(w/G.width,h/G.height);offsetX=(w-G.width*scale)/2;offsetY=(h-G.height*scale)/2;ctx.setTransform(d*scale,0,0,d*scale,d*offsetX,d*offsetY);ctx.clearRect(-offsetX/scale,-offsetY/scale,w/scale,h/scale);}
function flightPosition(f,now){const u=Math.max(0,Math.min(1,(now-f.startAt)/(f.endAt-f.startAt)));const parts=f.path.slice(1).map((p,i)=>Math.hypot(p.x-f.path[i].x,p.y-f.path[i].y));let remaining=parts.reduce((a,b)=>a+b,0)*u;for(let i=0;i<parts.length;i++){if(remaining<=parts[i]){const a=f.path[i],b=f.path[i+1],k=parts[i]?remaining/parts[i]:0;return {x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};}remaining-=parts[i];}return f.path.at(-1);}
function draw(now){
 if(stopped)return;requestAnimationFrame(()=>draw(Date.now()));if(!state||document.hidden)return;
 resizeBoard();const p=state.players[seat],q=state.players[rival];
 ctx.strokeStyle='#47677644';ctx.lineWidth=1;for(let x=27;x<350;x+=36){ctx.beginPath();ctx.moveTo(x,24);ctx.lineTo(x,382);ctx.stroke();}
 ctx.setLineDash([6,6]);ctx.strokeStyle='#ef946e';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(14,G.danger);ctx.lineTo(346,G.danger);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#e2a58b';ctx.font='8px sans-serif';ctx.fillText('DANGER / 碰线即输',16,G.danger-8);
 p.board.forEach((line,r)=>line.forEach((v,c)=>{if(v!==null){const pos=position(r,c);ball(ctx,pos.x,pos.y,v);}}));
 if(state.phase==='playing'&&!p.flight){const path=planShot(p.board,angle).path;ctx.lineWidth=2;ctx.strokeStyle=pointer!==null?'#fff1cc':'#73d7cb99';ctx.setLineDash([3,7]);ctx.beginPath();path.forEach((point,i)=>i?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.stroke();ctx.setLineDash([]);for(const point of path.filter(p=>p.bounce)){ctx.fillStyle=P.orange;ctx.beginPath();ctx.arc(point.x,point.y,4,0,7);ctx.fill();}ctx.save();ctx.translate(180,G.launcher);ctx.rotate(angle);ctx.fillStyle=P.paper;ctx.beginPath();ctx.moveTo(0,-53);ctx.lineTo(-7,-40);ctx.lineTo(-2,-40);ctx.lineTo(-2,-25);ctx.lineTo(2,-25);ctx.lineTo(2,-40);ctx.lineTo(7,-40);ctx.closePath();ctx.fill();ctx.restore();}
 ctx.strokeStyle='#52887e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(180,G.launcher,25,0,7);ctx.stroke();ball(ctx,180,G.launcher,currentColor(p));ball(ctx,278,G.launcher+1,currentColor(p,1),12);ctx.font='8px sans-serif';ctx.fillStyle='#9bbaac';ctx.fillText('NEXT',266,G.launcher+24);
 if(p.flight){const v=flightPosition(p.flight,state.phase==='paused'?state.pausedAt:now);ball(ctx,v.x,v.y,p.flight.color);}
 particles=particles.filter(v=>now-v.at<VISUAL.particleMs);for(const v of particles){const t=(now-v.at)/1000;ctx.globalAlpha=Math.max(0,1-t/.55);ctx.fillStyle=v.color;ctx.beginPath();ctx.arc(v.x+v.vx*t,v.y+v.vy*t+220*t*t,4,0,7);ctx.fill();}ctx.globalAlpha=1;
 miniCtx.setTransform(88/G.width,0,0,118/G.height,0,0);miniCtx.clearRect(0,0,G.width,G.height);q.board.forEach((line,r)=>line.forEach((v,c)=>{if(v!==null){const pos=position(r,c);ball(miniCtx,pos.x,pos.y,v);}}));miniCtx.strokeStyle='#e49876';miniCtx.beginPath();miniCtx.moveTo(12,G.danger);miniCtx.lineTo(348,G.danger);miniCtx.stroke();
 const active=court.draw(state.phase==='paused'?state.pausedAt:now);document.querySelector('.court').classList.toggle('playing',active);
 $('court-title').textContent=active?(court.moment.own?'YOUR DUNK!':'RIVAL DUNK!'):'MAKE YOUR\nMOVE.';$('court-kicker').textContent=active?(court.moment.own?'你发起扣篮 · 对手灰球 +4':'对手扣篮 · 你的灰球 +4'):'STREET COURT / 01';
 if(state.phase==='countdown')$('overlay-title').textContent=String(Math.max(1,Math.ceil((state.countdownAt-now)/1000)));
 $('pressure-count').textContent=state.phase==='playing'?`下排压力 ${Math.max(0,Math.ceil((state.nextPressureAt-now)/1000))}s`:'每 20 秒加一排';
 if(now-lastMessageAt>4500)$('toast').textContent=p.energy>=100?'DUNK 就绪 · 清底排，给对手加 4 灰球':'点按发射 · 按住拖动瞄准';
 // Ready state changes at the end of a spectacle even with no storage event.
 const canDunk=state.phase==='playing'&&p.energy>=100&&!p.flight&&now>=p.dunkUntil&&!blocked;
 $('dunk').disabled=!canDunk;$('dunk').classList.toggle('ready',canDunk);
}
function point(e){const rect=boardCanvas.getBoundingClientRect();return {x:(e.clientX-rect.left-offsetX)/scale,y:(e.clientY-rect.top-offsetY)/scale};}
const canShoot=()=>state?.phase==='playing'&&!state.players[seat].flight&&!blocked&&!sending&&!$('guide').open;
function aim(p){angle=Math.max(-G.angleLimit,Math.min(G.angleLimit,Math.atan2(p.x-180,Math.max(30,G.launcher-p.y))));}
boardCanvas.addEventListener('pointerdown',e=>{if(!canShoot()||!e.isPrimary||e.button!==0||pointer!==null)return;const p=point(e);if(p.y<24||p.y>G.launcher-G.radius||p.x<0||p.x>G.width)return;pointer=e.pointerId;gestureRound=state.roundId;aim(p);boardCanvas.setPointerCapture(e.pointerId);});
boardCanvas.addEventListener('pointermove',e=>{if(e.pointerId===pointer)aim(point(e));});
boardCanvas.addEventListener('pointerup',async e=>{if(e.pointerId!==pointer)return;pointer=null;const p=point(e);if(p.x<0||p.x>G.width||p.y<24||p.y>G.launcher-G.radius||!canShoot()||gestureRound!==state.roundId)return;aim(p);sending=true;await send('SHOOT',{angle});sending=false;});
for(const name of ['pointercancel','lostpointercapture'])boardCanvas.addEventListener(name,()=>pointer=null);
boardCanvas.addEventListener('keydown',async e=>{if(!canShoot())return;if(['ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')angle=Math.max(-G.angleLimit,angle-.04);if(e.key==='ArrowRight')angle=Math.min(G.angleLimit,angle+.04);if(e.key===' '){sending=true;await send('SHOOT',{angle});sending=false;}});
$('ready').addEventListener('click',()=>send('READY'));$('dunk').addEventListener('click',()=>send('DUNK'));$('test-charge').addEventListener('click',()=>send('CHARGE'));
$('help').addEventListener('click',()=>{pointer=null;$('guide').showModal();});$('close-help').addEventListener('click',()=>$('guide').close());
async function poll(){if(polling||blocked||stopped)return;polling=true;await send('TICK');polling=false;}
try{
 const key=`hoopire-local-seat:${roomId}:${seat}`;let token=sessionStorage.getItem(key);if(!token){token=crypto.randomUUID();sessionStorage.setItem(key,token);}
 channel=new BroadcastChannel(`hoopire-local-duel:${roomId}`);
 store=new RoomStore({roomId,seat,token,notify:()=>channel.postMessage('changed')});
 channel.onmessage=()=>{try{consume(store.read());}catch(e){fail(e);}};
 window.addEventListener('storage',e=>{if(e.key===store.key){try{consume(store.read());}catch(err){fail(err);}}});
 await send('JOIN');
 const timer=setInterval(poll,R.tickMs);
 document.addEventListener('visibilitychange',()=>{pointer=null;if(!document.hidden)send('JOIN');});
 window.addEventListener('pagehide',e=>{pointer=null;if(!e.persisted){stopped=true;clearInterval(timer);channel.close();}});
 window.addEventListener('pageshow',e=>{if(e.persisted){pointer=null;send('JOIN');}});
 draw(Date.now());
}catch(e){fail(e);}
