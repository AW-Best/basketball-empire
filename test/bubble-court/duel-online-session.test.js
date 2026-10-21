import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BubbleDuelSession} from '../../src/bubble-duel-session.mjs';
function fixture(){let wall=1000;const s=new BubbleDuelSession('ABC123',{now:()=>wall,allowCharge:true});const a=s.join().token,b=s.join().token;let seq=0;const action=(token,type,rest={})=>s.action(token,{type,id:String(++seq),roundId:s.room.roundId,...rest});action(a,'READY');action(b,'READY');wall+=3000;s.snapshot(a);s.snapshot(b);return {s,a,b,action,tick(ms){wall+=ms;s.snapshot(a);return s.snapshot(b);},wall:()=>wall};}
test('online session uses cinematic moves and privacy, rejects cheat and stale identity',()=>{const {s,a,b}=fixture();assert.equal(s.room.pressureMs,35000);assert.equal(s.room.cinematic,true);assert.equal(s.snapshot(a).room.players.B.token,'occupied');assert.throws(()=>s.action('bad',{type:'TICK',id:'x',roundId:1}),/identity/);assert.throws(()=>s.action(a,{type:'END_CINEMA',id:'x',roundId:1}),/action/);assert.throws(()=>s.action(a,{type:'DUNK',id:'x',roundId:0,move:'classic'}),/Round/);assert.throws(()=>s.join(),/full/);assert.equal(s.join(b).seat,'B');});
test('warning permits shooting; server ends cinema once and resumes a second dunk',()=>{const f=fixture();f.action(f.a,'CHARGE');const dunk={type:'DUNK',id:'d',roundId:1,move:'classic'};f.s.action(f.a,dunk);f.s.action(f.a,dunk);assert.equal(f.s.room.players.B.incoming.length,1);f.action(f.b,'SHOOT',{angle:0});assert.ok(f.s.room.players.B.flight);f.tick(3000);assert.ok(f.s.room.presentation);const g=f.s.gameNow;f.tick(1000);assert.equal(f.s.gameNow,g);f.tick(4000);assert.equal(f.s.room.presentation,null);assert.equal(f.s.room.events.filter(e=>e.type==='cinema-end').length,1);f.action(f.a,'CHARGE');f.action(f.a,'DUNK',{move:'cat'});f.tick(3000);assert.ok(f.s.room.presentation);});
test('wall expiry freezes gameplay and cinema; serialized record resumes without clock drift',()=>{const f=fixture();f.action(f.a,'CHARGE');f.action(f.a,'DUNK',{move:'windmill'});f.tick(3000);const p=f.s.room.presentation;assert.ok(p);const before=f.s.visualNow;f.s.presences.B=f.wall()-8500;f.s.advance(f.wall()+2000);assert.equal(f.s.room.presentation.id,p.id);const frozen=f.s.gameNow;const copy=new BubbleDuelSession('ABC123',{record:f.s.export(),now:f.wall,allowCharge:true});assert.equal(copy.gameNow,frozen);assert.equal(copy.view('A',copy.wallAt).room.phase,'paused');assert.equal(copy.visualNow,f.s.visualNow);assert.ok(copy.visualNow-before<=10000);});
test('four special moves always send four gray balls and invalid move is rejected',()=>{for(const move of ['classic','windmill','blackhole','cat']){const f=fixture();f.action(f.a,'CHARGE');f.action(f.a,'DUNK',{move});assert.equal(f.s.room.players.B.incoming[0].count,4);}const f=fixture();assert.throws(()=>f.action(f.a,'DUNK',{move:'oops'}),/move/);});
test('production session never accepts client charge',()=>{const s=new BubbleDuelSession('ABC123'),a=s.join().token;assert.throws(()=>s.action(a,{type:'CHARGE',id:'x',roundId:0}),/action/);});

test('natural clears earn two real Dunks, game clock freezes for each full clip then gameplay continues',async()=>{
 const {planShot,resolvePop,currentColor}=await import('../../public/bubble-court/duel-lab/model.js');
 const f=fixture();f.s.allowCharge=false;let dunks=0;
 for(let i=0;i<40&&dunks<2;i++){
  const player=f.s.room.players.A;
  if(player.energy>=100){f.action(f.a,'DUNK',{move:dunks?'cat':'classic'});dunks++;f.tick(3000);assert.ok(f.s.room.presentation);const before=f.s.gameNow,duration=f.s.room.presentation.durationMs;f.tick(duration+1);assert.equal(f.s.room.presentation,null);assert.equal(f.s.gameNow,before+1);assert.equal(f.s.room.phase,'playing');continue;}
  let best={score:-Infinity};for(let n=-60;n<=60;n++){const angle=n*.02,plan=planShot(player.board,angle);if(!plan.cell)continue;const out=resolvePop(structuredClone(player.board),...plan.cell,currentColor(player)),score=out.energy-plan.cell[0]*.01;if(score>best.score)best={score,angle};}
  f.action(f.a,'SHOOT',{angle:best.angle});assert.ok(f.s.room.players.A.flight);f.tick(Math.ceil(f.s.room.players.A.flight.endAt-f.s.gameNow)+1);
 }
 assert.equal(dunks,2);assert.equal(f.s.room.events.filter(e=>e.type==='cinema-end').length,2);assert.equal(f.s.room.phase,'playing');f.action(f.b,'SHOOT',{angle:0});assert.ok(f.s.room.players.B.flight);
});
test('presence expiry uses real wall even though game clock is frozen; reconnect does not advance game or clip',()=>{
 const f=fixture();f.action(f.a,'CHARGE');f.action(f.a,'DUNK',{move:'cat'});f.tick(3000);
 const startWall=f.wall();f.s.presences.B=startWall-9000;
 const paused=f.s.snapshot(f.a,startWall+2000),game=paused.gameNow,visual=paused.visualNow;
 assert.equal(paused.room.phase,'paused');assert.equal(visual,startWall+1000);const remaining=paused.cinemaRemainingMs;
 assert.equal(f.s.snapshot(f.a,startWall+5000).visualNow,visual);
 const resumed=f.s.snapshot(f.b,startWall+5000);assert.equal(resumed.room.phase,'playing');assert.equal(resumed.gameNow,game);assert.equal(resumed.cinemaRemainingMs,remaining);
 const ended=f.s.snapshot(f.a,startWall+5000+remaining);assert.equal(ended.room.presentation,null);assert.equal(ended.gameNow,game);assert.equal(f.s.room.events.filter(e=>e.type==='cinema-end').length,1);
});
test('an old action stays idempotent beyond the reducer recent-history window',()=>{
 const f=fixture();f.action(f.a,'CHARGE');const attack={type:'DUNK',id:'original',roundId:1,move:'classic'};f.s.action(f.a,attack);f.tick(7001);
 f.action(f.a,'CHARGE');f.s.room.processed=Array.from({length:256},(_,i)=>`later:${i}`);const before=f.s.room.players.A.dunks;
 f.s.action(f.a,attack);assert.equal(f.s.room.players.A.dunks,before);assert.equal(f.s.room.players.A.energy,100);
});
