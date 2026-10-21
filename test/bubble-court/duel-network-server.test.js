import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBubbleServer} from '../../src/bubble-duel-server.mjs';
async function fixture(t,online=false){let clock=1000;const server=createBubbleServer({now:()=>clock,online});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const base=`http://127.0.0.1:${server.address().port}`;const req=async(path,body,token,extra={})=>{const response=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:`Bearer ${token}`} :{}),...extra},body:body===undefined?undefined:JSON.stringify(body)});return {status:response.status,data:await response.json()};};return {req,setTime:n=>clock=n,base};}
test('two HTTP clients ready, attack, deduplicate and keep tokens private',async t=>{const f=await fixture(t),a=(await f.req('/api/bubble/rooms',{})).data,b=(await f.req(`/api/bubble/rooms/${a.roomId}/join`,{})).data;assert.match(a.roomId,/^[A-Z0-9]{6}$/);assert.equal(a.seat,'A');assert.equal(b.seat,'B');assert.equal(b.room.players.A.token,'occupied');assert.equal(b.room.players.B.token,b.token);const path=`/api/bubble/rooms/${a.roomId}`;const action=(p,type,id,roundId=0)=>f.req(path+'/actions',{type,id,roundId},p.token);await action(a,'READY','a');let r=await action(b,'READY','b');assert.equal(r.data.room.phase,'countdown');f.setTime(4000);r=await f.req(path,undefined,a.token);assert.equal(r.data.room.phase,'playing');await action(a,'CHARGE','charge',1);r=await action(a,'DUNK','dunk',1);assert.equal(r.data.room.players.B.incoming.length,1);r=await action(a,'DUNK','dunk',1);assert.equal(r.data.room.players.A.dunks,1);f.setTime(7801);r=await f.req(path,undefined,b.token);assert.equal(r.data.room.players.B.board.flat().filter(x=>x===-1).length,4);assert.equal((await action(a,'CHARGE','stale',0)).status,409);assert.equal((await f.req(path,undefined,'bad')).status,401);assert.equal((await f.req(path+'/join',{})).status,409);f.setTime(18001);r=await f.req(path,undefined,a.token);assert.equal(r.data.room.phase,'paused');assert.equal(r.data.room.pausedAt,14000);assert.equal((await f.req(path+'/join',{})).status,409);r=await f.req(path,undefined,b.token);assert.equal(r.data.room.phase,'playing');});
test('HTTP boundary validation, origin protection and static confinement',async t=>{const f=await fixture(t),a=(await f.req('/api/bubble/rooms',{roomId:'ROOM01'})).data;assert.equal((await f.req('/api/bubble/rooms',{},null,{Origin:'https://evil.example'})).status,403);assert.equal((await f.req('/api/bubble/rooms',{roomId:'bad'})).status,400);assert.equal((await f.req(`/api/bubble/rooms/${a.roomId}/actions`,{type:'BOGUS',id:'x',roundId:0},a.token)).status,400);assert.equal((await f.req(`/api/bubble/rooms/${a.roomId}/actions`,{type:'SHOOT',id:'x',roundId:0,angle:'bad'},a.token)).status,400);assert.equal((await f.req('/api/bubble/rooms',{padding:'x'.repeat(9000)})).status,413);for(const p of ['/.git/config','/.spike/dunk-3d-spectacle/NOTES.md','/%2e%2e%2fsrc/server.js'])assert.equal((await fetch(f.base+p)).status,404);assert.equal((await fetch(f.base+'/bubble-court/duel-lab/')).status,200);assert.ok(Array.isArray((await f.req('/api/bubble/info')).data.lanUrls));});

test('idle rooms expire and cannot grow past the room cap',async t=>{const f=await fixture(t);for(let i=0;i<64;i++)assert.equal((await f.req('/api/bubble/rooms',{roomId:`R${String(i).padStart(5,'0')}`})).status,200);assert.equal((await f.req('/api/bubble/rooms',{roomId:'EXCESS'})).status,503);f.setTime(1801001);assert.equal((await f.req('/api/bubble/rooms/R00000',undefined,'old')).status,404);assert.equal((await f.req('/api/bubble/rooms',{roomId:'NEW001'})).status,200);});

test('HTTP natural scoring supports two Dunks and continued shots without results',async t=>{
 const {planShot,resolvePop,currentColor}=await import('../../public/bubble-court/duel-lab/model.js');
 const f=await fixture(t),a=(await f.req('/api/bubble/rooms',{})).data,b=(await f.req(`/api/bubble/rooms/${a.roomId}/join`,{})).data,path=`/api/bubble/rooms/${a.roomId}`;
 let seq=0,now=1000,room=b.room;const act=async(p,type,extra={})=>{const r=await f.req(path+'/actions',{type,id:`cycle-${++seq}`,roundId:room.roundId,...extra},p.token);assert.equal(r.status,200);room=r.data.room;return room;};
 await act(a,'READY');await act(b,'READY');now=4000;f.setTime(now);room=(await f.req(path,undefined,a.token)).data.room;const round=room.roundId;let dunks=0;
 for(let i=0;i<30&&dunks<2;i++){
  room=(await f.req(path,undefined,b.token)).data.room;const player=room.players.A;
  if(player.energy===100){now=Math.max(now,player.dunkUntil);f.setTime(now);const before=player.dunks;await act(a,'DUNK');assert.equal(room.players.A.dunks,before+1);dunks++;assert.equal(room.phase,'playing');assert.equal(room.winner,null);now=Math.max(now+1501,player.dunkUntil+1);f.setTime(now);room=(await f.req(path,undefined,a.token)).data.room;continue;}
  let best={score:-1};for(let n=-60;n<=60;n++){const angle=n*.02,plan=planShot(player.board,angle);if(!plan.cell)continue;const out=resolvePop(structuredClone(player.board),...plan.cell,currentColor(player)),score=out.energy-plan.cell[0]*.01;if(score>best.score)best={score,angle};}
  await act(a,'SHOOT',{angle:best.angle});assert.ok(room.players.A.flight);now=room.players.A.flight.endAt+1;f.setTime(now);room=(await f.req(path,undefined,a.token)).data.room;
 }
 assert.equal(dunks,2);assert.equal(room.players.A.dunks,2);assert.equal(room.roundId,round);assert.equal(room.phase,'playing');assert.equal(room.winner,null);assert.ok(room.players.A.score>=200);assert.equal(room.events.filter(e=>e.type==='result').length,0);
 await act(b,'SHOOT',{angle:0});assert.ok(room.players.B.flight);assert.equal(room.phase,'playing');
});


test('default online HTTP uses four moves, random creation and blocks client authority',async t=>{
 const f=await fixture(t,true),a=await f.req('/api/bubble/rooms',{});assert.equal(a.status,201);
 const path=`/api/bubble/rooms/${a.data.roomId}`,b=await f.req(path+'/join',{});assert.equal(b.status,200);
 assert.equal((await f.req('/api/bubble/info')).data.online,true);assert.equal(a.data.capabilities.charge,false);
 assert.equal((await f.req('/api/bubble/rooms',{roomId:'ABC123'})).status,400);
 assert.equal((await f.req(path+'/actions',{type:'CHARGE',id:'c',roundId:0},a.data.token)).status,400);
 assert.equal((await f.req(path+'/actions',{type:'END_CINEMA',id:'e',roundId:0},a.data.token)).status,400);
 await f.req(path+'/actions',{type:'READY',id:'a',roundId:0},a.data.token);await f.req(path+'/actions',{type:'READY',id:'b',roundId:0},b.data.token);
 f.setTime(4000);const playing=await f.req(path,undefined,a.data.token);assert.equal(playing.data.room.phase,'playing');assert.equal(playing.data.room.cinematic,true);assert.equal(playing.data.room.pressureMs,35000);assert.equal(playing.data.gameNow,4000);
});
