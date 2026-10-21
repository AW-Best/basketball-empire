import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MOVES,getMove,getPresentationMove,getCinematicDuration,getAttackTiming,sourceTime} from '../../public/bubble-court/duel/moves.mjs';
import {MockRoomStore} from '../../public/bubble-court/duel/mock.mjs';
import {sampleSpectacle} from '../../public/bubble-court/duel/spectacle.mjs';

test('battle timings keep the classic compact and slow the three special explosions, with historical clips unchanged',()=>{
 for(const {id} of MOVES){const clip=getPresentationMove(id);assert.equal(clip.durationMs,3000,id);assert.equal(clip.windupMs,3000,id);assert.equal(getCinematicDuration(id),id==='classic'?3000:4000,id);assert.equal(clip.energy,100);assert.equal(clip.garbage,4);}
 // Historical/LAN clips are still sampled in their original time domain.
 assert.deepEqual(MOVES.map(m=>m.durationMs),[1500,6000,8000,7000]);
});
test('retiming preserves the full ordered source animation and a readable focal beat',()=>{
 for(const {id} of MOVES){const m=getPresentationMove(id);assert.equal(sourceTime(id,-50),0);assert.equal(sourceTime(id,3000),getMove(id).durationMs);assert.equal(sourceTime(id,4000),getMove(id).durationMs);assert.ok(Math.abs(sourceTime(id,m.impactMs)-m.sourceImpactMs)<1e-8);let prev=-1;for(let t=0;t<=3000;t+=5){const next=sourceTime(id,t);assert.ok(next>=prev&&next-prev<50,`${id}: jump at ${t}`);prev=next;}
  let focusMs=0;for(let t=0;t<3000;t+=5){const n=sourceTime(id,t);if(n>=m.slow.from&&n<m.slow.to)focusMs+=5;}assert.ok(focusMs>=350&&focusMs<=1450,`${id}: unreadable focus ${focusMs}ms`);
 }
});
for(const {id} of MOVES)test(`${id}: 3s defense then configured action, burst, flight, one landing and resumed shots`,async()=>{
 let now=0;const store=new MockRoomStore({now:()=>now});await store.send('READY');now=3000;await store.send('TICK');await store.send('PREVIEW_RIVAL',{move:id});
 now=5999;let room=await store.send('TICK');assert.equal(room.presentation,null);assert.equal(room.players.A.incoming[0].count,4);
 now=6000;room=await store.send('TICK');const timing=getAttackTiming(id),end=6000+timing.clipMs;assert.equal(room.presentation.durationMs,timing.clipMs);const p=structuredClone(room.players),pressure=room.nextPressureAt;
 for(const [elapsed,stage] of [[timing.contactMs-1,'clip'],[timing.contactMs,'burst'],[timing.contactMs+99,'burst'],[timing.contactMs+100,'flight'],[timing.releaseImpactMs-1,'flight'],[timing.releaseImpactMs,timing.impactBurstMs?'impact':'hold'],[timing.clipMs-1,'hold']]){now=6000+elapsed;room=await store.send('TICK');assert.ok(room.presentation);assert.equal(sampleSpectacle(elapsed,timing.contactMs,{count:4,move:id}).stage,stage);assert.equal(store.now(),6000);assert.deepEqual(room.players,p);assert.equal(room.nextPressureAt,pressure);}
 now=end;room=await store.send('TICK');assert.equal(room.presentation,null);assert.equal(room.phase,'playing');assert.equal(room.players.A.board.flat().filter(v=>v===-1).length,4);assert.equal(room.events.filter(e=>e.type==='garbage').length,1);await store.send('TICK');assert.equal(store.snapshot().events.filter(e=>e.type==='garbage').length,1);await store.send('SHOOT',{angle:-1});assert.equal(store.snapshot().players.A.shots,1);
});
