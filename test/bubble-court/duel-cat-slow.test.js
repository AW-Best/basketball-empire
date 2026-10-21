import {test} from 'node:test';import assert from 'node:assert/strict';
import * as moves from '../../public/bubble-court/duel/moves.mjs';
import {sampleSpectacle} from '../../public/bubble-court/duel/spectacle.mjs';
import {MockRoomStore} from '../../public/bubble-court/duel/mock.mjs';
test('cat reserves its extra time for final impact rather than a long windup',()=>{
 assert.equal(moves.getCinematicDuration('cat'),4000);assert.equal(moves.getCinematicDuration('classic'),3000);for(const id of ['windmill','blackhole'])assert.equal(moves.getCinematicDuration(id),4000);
 for(const [at,source]of [[0,0],[1000,2750],[1300,2950],[1600,4100],[2200,4500],[3100,4700],[3500,5000],[3999,5000]])assert.equal(moves.attackSourceTime('cat',at),source);
 assert.equal(typeof moves.getAttackTiming,'function');assert.equal(moves.getAttackTiming('cat').contactMs,1000);
 let prev=0;for(let t=1;t<=4000;t++){const n=moves.attackSourceTime('cat',t);assert.ok(n>=prev&&n-prev<8);prev=n;}
});
test('cat lightning, flight and final slow explosion share the same timeline',()=>{
 for(const [at,phase]of [[999,'clip'],[1000,'burst'],[1099,'burst'],[1100,'flight'],[2199,'flight'],[2200,'impact'],[3099,'impact'],[3100,'hold'],[3999,'hold'],[4000,'done']])assert.equal(sampleSpectacle(at,1000,{move:'cat',count:4}).stage,phase,at);
 assert.ok(sampleSpectacle(1150,1000,{move:'cat'}).bolts.length>0);assert.equal(sampleSpectacle(2900,1000,{move:'cat',count:0}).balls.length,0);
});
test('slower cat keeps the match paused until four seconds and resolves interference only once',async()=>{
 let now=0;const store=new MockRoomStore({now:()=>now});await store.send('READY');now=3000;await store.send('TICK');let room=await store.send('PREVIEW_RIVAL',{move:'cat'});assert.equal(room.events.findLast(e=>e.type==='dunk').impactMs,1000);
 now=6000;room=await store.send('TICK');assert.equal(room.presentation.durationMs,4000);const players=structuredClone(room.players);
 for(now=6000;now<10000;now+=100){room=await store.send('TICK');assert.ok(room.presentation);assert.deepEqual(room.players,players);assert.equal(store.now(),6000);}
 now=10000;room=await store.send('TICK');assert.equal(room.presentation,null);assert.equal(room.phase,'playing');assert.equal(room.players.A.board.flat().filter(v=>v===-1).length,4);await store.send('TICK');assert.equal(store.snapshot().events.filter(e=>e.type==='garbage').length,1);await store.send('SHOOT',{angle:-1});assert.equal(store.snapshot().players.A.shots,1);
});
