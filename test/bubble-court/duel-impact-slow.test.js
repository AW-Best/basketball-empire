import {test} from 'node:test';import assert from 'node:assert/strict';
import {attackSourceTime,getAttackTiming,getCinematicDuration,getMove} from '../../public/bubble-court/duel/moves.mjs';
import {sampleSpectacle} from '../../public/bubble-court/duel/spectacle.mjs';
import {MockRoomStore} from '../../public/bubble-court/duel/mock.mjs';
for(const id of ['windmill','blackhole','cat']){
 test(`${id} slows the final explosion to 200 source milliseconds over 900 real milliseconds`,()=>{
  const timing=getAttackTiming(id),impact=getMove(id).impactMs;assert.equal(getCinematicDuration(id),4000);assert.equal(timing.contactMs,1000);assert.equal(timing.releaseImpactMs,2200);assert.equal(timing.impactBurstMs,900);
  assert.equal(attackSourceTime(id,2200),impact);assert.equal(attackSourceTime(id,3100)-impact,200);assert.ok(attackSourceTime(id,2600)>impact&&attackSourceTime(id,2600)<impact+200,'slow motion progresses, not freeze');assert.equal(attackSourceTime(id,3500),attackSourceTime(id,3999));
  for(const [at,phase]of [[999,'clip'],[1000,'burst'],[1100,'flight'],[2199,'flight'],[2200,'impact'],[3099,'impact'],[3100,'hold'],[3999,'hold'],[4000,'done']])assert.equal(sampleSpectacle(at,1000,{move:id,count:4}).stage,phase,at);
  const early=sampleSpectacle(2300,1000,{move:id}),late=sampleSpectacle(2900,1000,{move:id});assert.ok(early.impacts.length>0&&early.impacts.length<=4);assert.ok(late.impacts[0].r>early.impacts[0].r);assert.ok(early.impacts.flatMap(p=>p.sparks).length<=12);
  assert.equal(sampleSpectacle(2400,1000,{move:id,count:0}).impacts.length,0);const reduced=sampleSpectacle(2400,1000,{move:id,reduced:true});assert.equal(reduced.impacts.length,0);assert.equal(reduced.flash,0);assert.equal(reduced.shake,0);
 });
 test(`${id} keeps the full explosion before one real landing and resumed play`,async()=>{
  let now=0;const store=new MockRoomStore({now:()=>now});await store.send('READY');now=3000;await store.send('TICK');await store.send('PREVIEW_RIVAL',{move:id});now=6000;let room=await store.send('TICK');assert.equal(room.presentation.durationMs,4000);const players=structuredClone(room.players);for(now=8200;now<10000;now+=100){room=await store.send('TICK');assert.ok(room.presentation);assert.deepEqual(room.players,players);assert.equal(store.now(),6000);}now=10000;room=await store.send('TICK');assert.equal(room.presentation,null);assert.equal(room.phase,'playing');assert.equal(room.players.A.board.flat().filter(v=>v===-1).length,4);await store.send('TICK');assert.equal(store.snapshot().events.filter(e=>e.type==='garbage').length,1);
 });
}
test('classic keeps its existing three-second strike and flight without the special explosion pass',()=>{assert.equal(getCinematicDuration('classic'),3000);assert.equal(attackSourceTime('classic',1120),960);assert.equal(sampleSpectacle(2200,1000,{move:'classic'}).stage,'hold');});
