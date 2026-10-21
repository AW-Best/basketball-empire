import {getMove,getPresentationMove,getCinematicDuration,getAttackTiming} from '../duel/moves.mjs';
import {initialBoard,neighbors,clearBottomRow} from '../engine.js';
import {traceAim} from '../motion.js';
import {RULES as R,BOARD as G,VISUAL} from './Constants.js';

const seats=['A','B'];
const other=seat=>seat==='A'?'B':'A';
const key=(r,c)=>r*R.cols+c;
export const position=(r,c)=>({x:45+c*36+(r%2)*18,y:G.top+r*G.step});
const player=()=>({token:null,ready:false,lastSeen:0,board:initialBoard(),energy:0,score:0,shots:0,cleared:0,dunks:0,flight:null,incoming:[],pressure:0,dunkUntil:0,overflow:false});
export function createRoom(roomId,{pressureMs=R.pressureMs,moveSelection=false,cinematic=false}={}){return {schema:1,roomId,pressureMs,moveSelection,cinematic,presentation:null,rematch:null,rematchVersion:0,rematchDeclinedBy:null,revision:0,roundId:0,phase:'lobby',players:{A:player(),B:player()},countdownAt:null,startedAt:null,nextPressureAt:null,pausedAt:null,resumePhase:null,winner:null,events:[],eventSeq:0,processed:[]};}
export function currentColor(p,offset=0){return [3,0,1,2,1,3,0,2,3,1,2,0][(p.shots+offset)%12];}
function connected(board,seeds,color){const out=[],seen=new Set(),todo=[...seeds];while(todo.length){const [r,c]=todo.pop(),k=key(r,c);if(seen.has(k)||board[r][c]===null||(color!==undefined&&board[r][c]!==color))continue;seen.add(k);out.push([r,c]);todo.push(...neighbors(r,c));}return out;}
export function resolvePop(board,row,col,color){
 board[row][col]=color;const group=connected(board,[[row,col]],color);
 if(group.length<3)return {normal:0,gray:0,energy:0,score:0,cells:[]};
 const removed=new Map(group.map(([r,c])=>[key(r,c),{row:r,col:c,color:board[r][c]}]));
 for(const [r,c] of group)for(const [a,b] of neighbors(r,c))if(board[a][b]===-1)removed.set(key(a,b),{row:a,col:b,color:-1});
 for(const cell of removed.values())board[cell.row][cell.col]=null;
 const anchored=new Set(connected(board,board[0].map((_,c)=>[0,c])).map(([r,c])=>key(r,c)));
 board.forEach((line,r)=>line.forEach((v,c)=>{if(v!==null&&!anchored.has(key(r,c))){removed.set(key(r,c),{row:r,col:c,color:v});board[r][c]=null;}}));
 const cells=[...removed.values()],normal=cells.filter(c=>c.color!==-1).length,gray=cells.length-normal;
 return {normal,gray,energy:normal*R.energyPerBall,score:normal*R.pointsPerBall,cells};
}
export function planShot(board,angle){
 const balls=[];board.forEach((line,r)=>line.forEach((v,c)=>{if(v!==null)balls.push({...position(r,c),row:r,col:c});}));
 const path=traceAim({x:G.width/2,y:G.launcher,vx:Math.sin(angle),vy:-Math.cos(angle),left:G.radius,right:G.width-G.radius,ceiling:G.top,balls,radius:G.radius});
 const end=path.at(-1);let candidates;
 if(end.hit){const hit=[...balls].sort((a,b)=>Math.hypot(a.x-end.x,a.y-end.y)-Math.hypot(b.x-end.x,b.y-end.y))[0];candidates=neighbors(hit.row,hit.col);}else candidates=Array.from({length:R.cols},(_,c)=>[0,c]);
 candidates=candidates.filter(([r,c])=>board[r][c]===null).sort((a,b)=>{const x=position(...a),y=position(...b);return Math.hypot(x.x-end.x,x.y-end.y)-Math.hypot(y.x-end.x,y.y-end.y);});
 const length=path.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-path[i].x,p.y-path[i].y),0);
 return {path,cell:candidates[0]??null,duration:Math.max(120,length/G.speed*1000)};
}
export function addGarbage(board,count,seed){
 const added=[],wasEmpty=board.flat().every(v=>v===null);
 let frontier=[];
 for(let i=0;i<count;i++){
  frontier=frontier.filter(([r,c])=>board[r][c]===null);
  if(!frontier.length)board.forEach((line,r)=>line.forEach((v,c)=>{if(v===null&&(wasEmpty?r===0:neighbors(r,c).some(([a,b])=>board[a][b]!==null)))frontier.push([r,c]);}));
  const choices=frontier;
  // Fill the current frontier across columns before making another layer.
  const used=new Set(added.map(c=>c.col));
  choices.sort((a,b)=>Number(used.has(a[1]))-Number(used.has(b[1]))||b[0]-a[0]||((a[1]-seed+8)%8)-((b[1]-seed+8)%8));
  if(!choices.length)return {added,overflow:true};const [row,col]=choices[0];board[row][col]=-1;added.push({row,col,color:-1});
 }
 return {added,overflow:false};
}
function event(room,type,seat,at,detail={}){room.events.push({id:++room.eventSeq,type,seat,at,roundId:room.roundId,...detail});room.events=room.events.slice(-VISUAL.events);}
function dangerCells(p){return p.board.flatMap((line,row)=>line.flatMap((color,col)=>color!==null&&position(row,col).y+G.radius>=G.danger?[{row,col,color}]:[]));}
function danger(p){return dangerCells(p).length>0;}
function blockPending(room,seat,normal,at){
 const p=room.players[seat];let credit=Math.floor(normal/R.blockPerNormal),count=0;
 for(const packet of p.incoming){if(packet.displayed)continue;const n=Math.min(credit,packet.count);packet.count-=n;credit-=n;count+=n;if(!credit)break;}
 p.incoming=p.incoming.filter(packet=>packet.count>0);
 if(count)event(room,'block',seat,at,{count});
}
function assess(room,at){if(room.phase!=='playing')return;const failed=seats.filter(s=>danger(room.players[s]));if(!failed.length)return;const failedCells=Object.fromEntries(failed.map(s=>[s,dangerCells(room.players[s])]));room.phase='finished';room.winner=failed.length===2?'draw':other(failed[0]);for(const p of Object.values(room.players)){p.ready=false;p.flight=null;p.incoming=[];p.pressure=0;}event(room,'result',room.winner,at,{reason:'danger-line',losers:failed,failedCells});}
function applyPending(room,seat,at){
 const p=room.players[seat];if(p.flight)return;
 // Stable order: shot pop/drop -> ordinary pressure -> incoming garbage -> danger.
 while(p.pressure>0){p.pressure--;if(p.board.at(-1).some(v=>v!==null))p.overflow=true;p.board.pop();p.board.unshift(Array.from({length:R.cols},(_,c)=>(Math.floor(c/2)+Math.floor((at-room.startedAt)/(room.pressureMs??R.pressureMs)))%4));event(room,'pressure',seat,at);}
 const ready=p.incoming.filter(a=>a.dueAt<=at&&(!room.cinematic||a.displayed));p.incoming=p.incoming.filter(a=>!ready.includes(a));
 for(const a of ready){const out=addGarbage(p.board,a.count,a.seed);p.overflow ||= out.overflow;event(room,'garbage',seat,at,{cells:out.added,count:a.count,attackId:a.id});}
}
function beginCinematic(room,at){
 if(!room.cinematic||room.phase!=='playing')return;
 const attacks=[];for(const target of seats){const p=room.players[target],ready=p.incoming.filter(a=>!a.displayed&&a.dueAt<=at);p.incoming=p.incoming.filter(a=>!ready.includes(a));for(const packet of ready){const source=room.events.find(e=>e.type==='dunk'&&e.attackId===packet.id);attacks.push({...packet,attackId:packet.id,target,seat:other(target),eventId:source?.id,sourceAt:source?.at??at-R.attackWindupMs});}}
 if(!attacks.length)return;
 room.presentation={id:`${room.roundId}:cinema:${room.eventSeq+1}`,gameAt:at,durationMs:Math.max(...attacks.map(a=>getCinematicDuration(a.move))),attacks};event(room,'cinema-start',null,at,{cinemaId:room.presentation.id});
}
function advance(room,now){
 if(room.presentation)return;
 if(room.phase==='countdown'&&now>=room.countdownAt){room.phase='playing';room.startedAt=room.countdownAt;room.nextPressureAt=room.startedAt+(room.pressureMs??R.pressureMs);event(room,'start',null,room.startedAt);}
 if(room.phase!=='playing')return;assess(room,now);if(room.phase!=='playing')return;
 // A shared absolute timeline keeps hidden-page animation from owning game rules.
 for(let n=0;n<256&&room.phase==='playing';n++){
  const times=[room.nextPressureAt];for(const p of Object.values(room.players)){if(p.flight)times.push(p.flight.endAt);times.push(...p.incoming.filter(a=>!p.flight||(room.cinematic&&!a.displayed)).map(a=>a.dueAt));}
  const at=Math.min(...times);if(at>now)break;
  for(const seat of seats){const p=room.players[seat],f=p.flight;if(f&&f.endAt<=at){p.flight=null;if(!f.cell){event(room,'shot-blocked',seat,at);continue;}const out=resolvePop(p.board,...f.cell,f.color);p.energy=Math.min(R.energyMax,p.energy+out.energy);p.score+=out.score;p.cleared+=out.normal;event(room,'pop',seat,at,{...out});blockPending(room,seat,out.normal,at);}}
  if(room.nextPressureAt<=at){for(const p of Object.values(room.players))p.pressure++;room.nextPressureAt+=room.pressureMs??R.pressureMs;}
  for(const seat of seats)applyPending(room,seat,at);assess(room,at);beginCinematic(room,at);if(room.presentation)break;
 }
}
function pause(room,now){room.resumePhase=room.phase;room.phase='paused';room.pausedAt=now;event(room,'pause',null,now);}
function resume(room,now){const elapsed=now-room.pausedAt;room.phase=room.resumePhase;room.resumePhase=null;room.pausedAt=null;
 for(const k of ['countdownAt','startedAt','nextPressureAt'])if(room[k]!==null)room[k]+=elapsed;
 for(const p of Object.values(room.players)){if(p.flight){p.flight.startAt+=elapsed;p.flight.endAt+=elapsed;}p.dunkUntil+=elapsed;for(const a of p.incoming)a.dueAt+=elapsed;}
 event(room,'resume',null,now,{pausedMs:elapsed});
}
function startRound(room,now){room.roundId++;room.phase='countdown';room.countdownAt=now+R.countdownMs;room.startedAt=null;room.nextPressureAt=null;room.winner=null;room.presentation=null;room.rematch=null;room.rematchVersion=0;room.rematchDeclinedBy=null;room.events=[];for(const seat of seats){const old=room.players[seat];room.players[seat]={...player(),token:old.token,lastSeen:old.lastSeen,ready:true};}}
export function reduceRoom(source,action,now){
 const {seat,token,type,id}=action;if(!seats.includes(seat)||!token||!id||!Number.isFinite(now))return source;
 const original=source.players[seat];
 if(type==='JOIN'){if((original.token&&original.token!==token&&now-original.lastSeen<=R.presenceMs)||source.players[other(seat)].token===token)return source;}
 else if(original.token!==token||action.roundId!==source.roundId)return source;
 if(source.processed.includes(id))return source;
 const room=structuredClone(source),p=room.players[seat];
 // A browser may suspend BOTH pages: freeze at the actual presence expiry,
 // before refreshing the waking player's heartbeat, rather than at wakeup.
 if(['playing','countdown'].includes(room.phase)){
  const expiredAt=Math.min(...seats.map(s=>room.players[s].lastSeen+R.presenceMs));
  if(now>expiredAt){advance(room,expiredAt);if(['playing','countdown'].includes(room.phase))pause(room,expiredAt);}
 }
 if(type==='JOIN'){p.token=token;p.lastSeen=now;}
 if(type==='TICK'&&now-p.lastSeen>=R.heartbeatMs)p.lastSeen=now;
 if(room.phase==='paused'){if(seats.every(s=>now-room.players[s].lastSeen<R.presenceMs))resume(room,now);}
 advance(room,now);
 if(type==='READY'&&['lobby','finished'].includes(room.phase)){
  p.ready=true;if(seats.every(s=>room.players[s].token&&room.players[s].ready))startRound(room,now);
 }
 if(room.phase==='finished'&&action.rematchVersion===(room.rematchVersion??0)&&seats.every(s=>room.players[s].token)){
  if(type==='REMATCH'){
   if(!room.rematch){room.rematch={from:seat};room.rematchVersion=(room.rematchVersion??0)+1;room.rematchDeclinedBy=null;}
   else if(room.rematch.from!==seat)startRound(room,now);
  }
  if(type==='CANCEL_REMATCH'&&room.rematch){room.rematchDeclinedBy=room.rematch.from===seat?null:seat;room.rematch=null;room.rematchVersion=(room.rematchVersion??0)+1;}
 }
 if(room.phase==='playing'&&type==='END_CINEMA'&&room.presentation&&room.presentation.id===action.cinemaId){
  const presentation=room.presentation;room.presentation=null;for(const attack of presentation.attacks){const target=room.players[attack.target];if(target.flight){target.incoming.push({...attack,id:attack.attackId,dueAt:now,displayed:true});continue;}const out=addGarbage(target.board,attack.count,attack.seed);target.overflow ||= out.overflow;event(room,'garbage',attack.target,now,{cells:out.added,count:attack.count,attackId:attack.attackId});}event(room,'cinema-end',null,now,{cinemaId:presentation.id,attackIds:presentation.attacks.map(a=>a.attackId)});assess(room,now);
 }
 if(room.phase==='playing'&&!room.presentation){
  if(type==='CHARGE')p.energy=R.energyMax;
  if(type==='SHOOT'&&!p.flight&&Number.isFinite(action.angle)&&Math.abs(action.angle)<=G.angleLimit){const plan=planShot(p.board,action.angle);if(!plan.cell)event(room,'shot-blocked',seat,now);else{p.flight={...plan,color:currentColor(p),startAt:now,endAt:now+plan.duration};p.shots++;event(room,'shot',seat,now);}}
  if(type==='DUNK'&&!p.flight&&p.energy>=R.energyMax&&now>=p.dunkUntil){const move=(room.cinematic?getPresentationMove:getMove)(room.moveSelection?action.move:'classic');p.energy=0;p.dunks++;p.dunkUntil=now+move.windupMs+(room.cinematic?0:move.durationMs);const cells=clearBottomRow(p.board),target=room.players[other(seat)],pending=target.incoming.reduce((n,a)=>n+a.count,0),count=Math.max(0,Math.min(R.garbage,R.pendingMax-pending));const attackId=`${room.roundId}:${id}`;if(count)target.incoming.push({id:attackId,count,move:move.id,dueAt:now+move.windupMs+(room.cinematic?0:move.impactMs),seed:p.dunks%8});event(room,'dunk',seat,now,{cells,count,attackId,move:move.id,durationMs:room.cinematic?getCinematicDuration(move.id):move.durationMs,clipDurationMs:move.durationMs,cinematicFx:room.cinematic,impactMs:room.cinematic?getAttackTiming(move.id).contactMs:move.impactMs,slowdown:room.cinematic,warningMs:move.windupMs+(room.cinematic?0:move.impactMs)});}
 }
 // Preserve no-op identity; tick polling does not cause constant storage writes.
 if(JSON.stringify(room)===JSON.stringify(source))return source;
 if(type!=='TICK'&&type!=='JOIN')room.processed=[...room.processed,id].slice(-256);
 room.revision=source.revision+1;return room;
}
