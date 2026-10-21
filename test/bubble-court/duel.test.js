import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as model from '../../public/bubble-court/duel-lab/model.js';
import * as transport from '../../public/bubble-court/duel-lab/room.js';

const empty=()=>Array.from({length:12},()=>Array(8).fill(null));
const keepPresent=s=>{for(const now of [8000,13000,18000,22000]){s.act('A','TICK',{},now);s.act('B','TICK',{},now);}};
function setup(){
 assert.equal(typeof model.createRoom,'function','local duel room must exist');
 let room=model.createRoom('TEST');
 const act=(seat,type,extra={},now=0)=>{room=model.reduceRoom(room,{type,seat,token:seat==='A'?'alpha':'beta',roundId:room.roundId,id:`${seat}-${type}-${act.seq++}`,...extra},now);return room;};act.seq=0;
 act('A','JOIN');act('B','JOIN');act('A','READY');act('B','READY');act('A','TICK',{},3000);
 return {get room(){return room;},act};
}
test('both players must ready before a synchronized countdown, then identical boards and independent ball sequences',()=>{
 assert.equal(typeof model.createRoom,'function');let r=model.createRoom('R');
 r=model.reduceRoom(r,{type:'JOIN',seat:'A',token:'a',id:'1'},0);
 r=model.reduceRoom(r,{type:'READY',seat:'A',token:'a',id:'2',roundId:0},0);assert.equal(r.phase,'lobby');
 const s=setup();assert.equal(s.room.phase,'playing');assert.deepEqual(s.room.players.A.board,s.room.players.B.board);
 assert.equal(model.currentColor(s.room.players.A),model.currentColor(s.room.players.B));
 s.act('A','SHOOT',{angle:0},3001);assert.equal(s.room.players.A.shots,1);assert.equal(s.room.players.B.shots,0);
});
test('3 normal balls pop, adjacent gray breaks, unsupported gray drops, only normal balls score and charge',()=>{
 assert.equal(typeof model.resolvePop,'function');const b=empty();b[0][0]=0;b[1][0]=0;b[1][1]=-1;b[2][0]=2;b[3][0]=-1;
 const result=model.resolvePop(b,0,1,0);assert.equal(result.normal,4);assert.equal(result.gray,2);assert.equal(result.energy,64);assert.equal(result.score,40);assert.ok(b.flat().every(v=>v===null));
});
test('two matching balls do not clear or damage adjacent gray',()=>{
 assert.equal(typeof model.resolvePop,'function');const b=empty();b[0][0]=1;b[1][0]=-1;
 assert.equal(model.resolvePop(b,0,1,1).normal,0);assert.equal(b[1][0],-1);
});
test('DUNK consumes one bar, clears only own bottom row without rewards, queues exactly four gray bubbles',()=>{
 const s=setup();s.act('A','CHARGE',{},3001);const before=s.room.players.A.board.map(r=>[...r]);
 s.act('A','DUNK',{id:'dunk-once'},3002);assert.equal(s.room.players.A.energy,0);assert.equal(s.room.players.A.score,0);
 assert.ok(s.room.players.A.board[4].every(v=>v===null));assert.deepEqual(s.room.players.A.board.slice(0,4),before.slice(0,4));
 assert.equal(s.room.players.B.incoming.length,1);assert.equal(s.room.players.B.incoming[0].count,4);
 s.act('A','DUNK',{id:'dunk-once'},3003);assert.equal(s.room.players.B.incoming.length,1);
});
test('undercharged and in-flight DUNK cannot send an attack',()=>{
 const s=setup();s.act('A','DUNK',{},3001);assert.equal(s.room.players.B.incoming.length,0);
 s.act('A','CHARGE',{},3002);s.act('A','SHOOT',{angle:0},3003);s.act('A','DUNK',{},3004);
 assert.equal(s.room.players.A.energy,100);assert.equal(s.room.players.B.incoming.length,0);
});
test('attacks warn for 3800ms and apply once at idle, never inside a flying shot',()=>{
 const s=setup();s.act('A','CHARGE',{},3001);s.act('A','DUNK',{},3002);
 s.act('B','TICK',{},6801);assert.equal(s.room.players.B.board.flat().filter(v=>v===-1).length,0);
 s.act('B','TICK',{},6802);assert.equal(s.room.players.B.board.flat().filter(v=>v===-1).length,4);
 s.act('B','TICK',{},6900);assert.equal(s.room.players.B.board.flat().filter(v=>v===-1).length,4);
 const t=setup();t.act('A','CHARGE',{},3001);t.act('A','DUNK',{},3002);t.act('B','SHOOT',{angle:1.2},6750);
 const flight=t.room.players.B.flight;assert.ok(flight);t.act('B','TICK',{},6802);assert.equal(t.room.players.B.incoming.length,1);
 t.act('B','TICK',{},flight.endAt+1);assert.equal(t.room.players.B.incoming.length,0);assert.equal(t.room.players.B.board.flat().filter(v=>v===-1).length,3);assert.equal(t.room.events.find(e=>e.type==='block').count,1);
});
test('four gray bubbles occupy distinct attached empty cells without overwriting board colors',()=>{
 assert.equal(typeof model.addGarbage,'function');const b=empty();b[0][3]=1;const result=model.addGarbage(b,4,0);
 assert.equal(result.overflow,false);assert.equal(b[0][3],1);assert.equal(b.flat().filter(v=>v===-1).length,4);
});
test('one attack spreads across the existing frontier instead of growing a four-row staircase',()=>{
 assert.equal(typeof model.addGarbage,'function');const b=model.createRoom('SPREAD').players.A.board;
 const out=model.addGarbage(b,4,1);assert.deepEqual(out.added.map(c=>c.row),[5,5,5,5]);assert.equal(new Set(out.added.map(c=>c.col)).size,4);
});
test('empty board accepts gray at the ceiling, while a full board reports overflow',()=>{
 assert.equal(typeof model.addGarbage,'function');const b=empty();assert.equal(model.addGarbage(b,4,1).overflow,false);assert.equal(b[0].filter(v=>v===-1).length,4);
 assert.equal(model.addGarbage(Array.from({length:12},()=>Array(8).fill(0)),4,0).overflow,true);
});
test('same-tick pressure danger produces a draw and finished rooms reject gameplay',()=>{
 const s=setup();keepPresent(s);for(const p of Object.values(s.room.players)){p.board=Array.from({length:12},(_,r)=>Array(8).fill(r<11?0:null));}
 s.act('A','TICK',{},23000);assert.equal(s.room.phase,'finished');assert.equal(s.room.winner,'draw');
 const before=JSON.stringify(s.room.players);s.act('A','CHARGE',{},23001);s.act('A','SHOOT',{angle:0},23002);assert.equal(JSON.stringify(s.room.players),before);
});
test('20-second pressure stays queued during a shot and applies immediately after its resolution',()=>{
 const s=setup();keepPresent(s);s.act('A','SHOOT',{angle:1.2},22990);const f=s.room.players.A.flight;
 s.act('B','TICK',{},23000);assert.equal(s.room.players.A.pressure,1);assert.equal(s.room.players.B.pressure,0);
 s.act('B','TICK',{},f.endAt+1);assert.equal(s.room.players.A.pressure,0);
});
test('identity, stale round actions and duplicate messages cannot mutate another player',()=>{
 const s=setup();const rev=s.room.revision;s.act('A','CHARGE',{token:'beta'},3001);assert.equal(s.room.revision,rev);
 s.act('A','CHARGE',{roundId:999},3002);assert.equal(s.room.players.A.energy,0);
 s.act('A','JOIN',{token:'beta'},3003);assert.equal(s.room.players.A.token,'alpha');
});
test('refresh rejoins the same seat and one token cannot occupy both seats',()=>{
 const s=setup();s.act('B','JOIN',{token:'alpha'},3001);assert.equal(s.room.players.B.token,'beta');
 s.act('A','JOIN',{},3002);assert.equal(s.room.players.A.token,'alpha');assert.equal(s.room.phase,'playing');
});
test('both rematch votes reset score, attacks and round, old actions stay stale',()=>{
 const s=setup();s.room.phase='finished';s.room.winner='A';for(const p of Object.values(s.room.players))p.ready=false;s.act('A','READY',{},4000);assert.equal(s.room.phase,'finished');
 s.act('B','READY',{},4001);assert.equal(s.room.phase,'countdown');assert.equal(s.room.roundId,2);
 assert.equal(s.room.players.A.energy,0);assert.equal(s.room.players.B.incoming.length,0);
 s.act('A','DUNK',{roundId:1},4002);assert.equal(s.room.players.B.incoming.length,0);
});
test('expired presence pauses deadlines, rejoin resumes without accumulated pressure',()=>{
 const s=setup();s.act('A','TICK',{},14001);assert.equal(s.room.phase,'paused');const deadline=s.room.nextPressureAt;
 s.act('A','JOIN',{},60000);s.act('B','JOIN',{},60001);assert.equal(s.room.phase,'playing');assert.equal(s.room.players.A.pressure,0);
 assert.ok(s.room.nextPressureAt>deadline+40000);assert.ok(s.room.nextPressureAt>60001);
});
test('both tabs sleeping for a minute freeze at the original lost-presence deadline, not wakeup time',()=>{
 const s=setup(),board=structuredClone(s.room.players.A.board),deadline=s.room.nextPressureAt;
 s.act('A','JOIN',{},60000);assert.equal(s.room.phase,'paused');assert.equal(s.room.pausedAt,10000);
 s.act('B','JOIN',{},60001);assert.equal(s.room.phase,'playing');assert.deepEqual(s.room.players.A.board,board);
 assert.equal(s.room.nextPressureAt,deadline+50001);assert.equal(s.room.winner,null);
});
test('a newly opened opponent page may reclaim an expired seat, preserving the paused round',()=>{
 const s=setup();s.act('A','TICK',{},14001);s.act('B','JOIN',{token:'replacement'},14002);
 assert.equal(s.room.players.B.token,'replacement');assert.equal(s.room.phase,'playing');assert.equal(s.room.roundId,1);
 s.act('B','JOIN',{},14003);assert.equal(s.room.players.B.token,'replacement');
});
test('no-op ticks do not write revisions; invalid angles cannot produce a flight',()=>{
 const s=setup();const rev=s.room.revision;s.act('A','TICK',{},3001);assert.equal(s.room.revision,rev);
 s.act('A','SHOOT',{angle:NaN},3002);assert.equal(s.room.players.A.flight,null);
});
test('aimed path bounces and advances a ball to the matching landing cell',()=>{
 assert.equal(typeof model.planShot,'function');const b=model.createRoom('X').players.A.board;
 const plan=model.planShot(b,1.2);assert.ok(plan.path.some(p=>p.bounce));assert.ok(plan.duration>0);assert.ok(plan.cell);
 const [r,c]=plan.cell;assert.equal(b[r][c],null);
});
test('two clients serialize simultaneous attacks through one room lock without lost updates',async()=>{
 assert.equal(typeof transport.RoomStore,'function');const map=new Map();let tail=Promise.resolve();
 const locks={request(_name,fn){const result=tail.then(fn);tail=result.catch(()=>{});return result;}};
 const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};let now=0;
 const make=(seat,token)=>new transport.RoomStore({roomId:'SYNC',seat,token,storage,locks,now:()=>now,notify:()=>{}});
 const a=make('A','a'),b=make('B','b');await Promise.all([a.send('JOIN'),b.send('JOIN')]);await Promise.all([a.send('READY'),b.send('READY')]);
 now=3000;await a.send('TICK');await Promise.all([a.send('CHARGE'),b.send('CHARGE')]);
 await Promise.all([a.send('DUNK'),b.send('DUNK')]);const state=a.read();assert.equal(state.players.A.energy,0);assert.equal(state.players.B.energy,0);
 assert.equal(state.players.A.incoming[0].count,4);assert.equal(state.players.B.incoming[0].count,4);
 now=6801;await Promise.all([a.send('TICK'),b.send('TICK')]);assert.equal(a.read().players.A.board.flat().filter(v=>v===-1).length,4);assert.equal(b.read().players.B.board.flat().filter(v=>v===-1).length,4);
});
test('storage write errors do not notify clients that an attack succeeded',async()=>{
 assert.equal(typeof transport.RoomStore,'function');let notified=0;
 const store=new transport.RoomStore({roomId:'FAIL',seat:'A',token:'a',storage:{getItem:()=>null,setItem:()=>{throw Error('disk full');}},locks:{request:async(_n,fn)=>fn()},notify:()=>notified++,now:()=>0});
 await assert.rejects(()=>store.send('JOIN'),/disk full/);assert.equal(notified,0);
});
