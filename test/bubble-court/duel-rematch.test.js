import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BubbleDuelSession} from '../../src/bubble-duel-session.mjs';
const ui=await import('../../public/bubble-court/duel/rematch.mjs').catch(()=>({}));
function finishedMatch(){
 let wall=1000,sequence=0;
 const session=new BubbleDuelSession('SAME01',{now:()=>wall});
 const a=session.join().token,b=session.join().token;
 session.action(a,{type:'READY',id:'a-ready',roundId:0});session.action(b,{type:'READY',id:'b-ready',roundId:0});
 wall=4000;session.snapshot(a);session.snapshot(b);session.room.phase='finished';session.room.winner='B';
 for(const p of Object.values(session.room.players))Object.assign(p,{ready:false,score:240,energy:80,shots:12,dunks:2,incoming:[],pressure:2,overflow:true,dunkUntil:8000});
 const act=(token,type='REMATCH',extra={})=>session.action(token,{type,id:`consent-${++sequence}`,roundId:session.room.roundId,rematchVersion:session.room.rematchVersion??0,...extra});
 return {session,a,b,act,setWall:at=>{wall=at;}};
}
for(const seat of ['A','B'])test(`${seat} invites without resetting the finished match or granting the other player's consent`,()=>{
 const f=finishedMatch(),s=f.session,before=structuredClone(s.room.players);f.act(seat==='A'?f.a:f.b);
 assert.equal(s.room.phase,'finished');assert.equal(s.room.roundId,1);assert.equal(s.room.winner,'B');assert.deepEqual(s.room.players,before);assert.equal(s.room.rematch.from,seat);assert.equal(s.room.rematchVersion,1);
});
test('only the opposite player accepting starts the next round in the same room',()=>{
 const f=finishedMatch(),s=f.session;f.act(f.a);f.act(f.a);assert.equal(s.room.phase,'finished');
 const response=f.act(f.b);assert.equal(response.room.phase,'countdown');assert.equal(response.room.roundId,2);assert.equal(response.room.roomId,'SAME01');assert.equal(response.room.countdownAt-response.gameNow,3000);
 assert.equal(s.room.players.A.token,f.a);assert.equal(s.room.players.B.token,f.b);assert.equal(s.room.winner,null);assert.equal(s.room.rematch,null);
 for(const p of Object.values(s.room.players)){assert.equal(p.score,0);assert.equal(p.energy,0);assert.equal(p.shots,0);assert.equal(p.dunks,0);assert.equal(p.pressure,0);assert.equal(p.overflow,false);assert.equal(p.dunkUntil,0);assert.deepEqual(p.incoming,[]);assert.equal(p.flight,null);assert.equal(p.board.flat().filter(v=>v!==null).length,40);}
 f.setWall(7000);assert.equal(s.snapshot(f.a).room.phase,'playing');assert.equal(s.snapshot(f.b).room.phase,'playing');
});
test('decline keeps both final boards and invalidates delayed accepts and invite retries',()=>{
 const f=finishedMatch(),s=f.session,before=structuredClone(s.room.players),invite={type:'REMATCH',id:'original',roundId:1,rematchVersion:0};
 s.action(f.a,invite);const version=s.room.rematchVersion;f.act(f.b,'CANCEL_REMATCH');assert.equal(s.room.phase,'finished');assert.equal(s.room.rematch,null);assert.equal(s.room.rematchDeclinedBy,'B');assert.deepEqual(s.room.players,before);
 assert.throws(()=>f.act(f.b,'REMATCH',{rematchVersion:version}),e=>e.status===409);s.action(f.a,invite);assert.equal(s.room.rematch,null);
 f.act(f.b);assert.equal(s.room.rematch.from,'B');f.act(f.a);assert.equal(s.room.roundId,2);
});
test('sender can cancel an invitation without erasing the result',()=>{
 const f=finishedMatch();f.act(f.a);f.act(f.a,'CANCEL_REMATCH');assert.equal(f.session.room.rematch,null);assert.equal(f.session.room.phase,'finished');assert.equal(f.session.room.rematchDeclinedBy,null);assert.equal(f.session.room.winner,'B');
});
test('simultaneous offers require an explicit updated acceptance and accepting retries never start two rounds',()=>{
 const f=finishedMatch(),s=f.session;f.act(f.a,'REMATCH',{rematchVersion:0});assert.throws(()=>f.act(f.b,'REMATCH',{rematchVersion:0}),e=>e.status===409);assert.equal(s.room.phase,'finished');
 const acceptance={type:'REMATCH',id:'accept',roundId:1,rematchVersion:1};s.action(f.b,acceptance);assert.equal(s.action(f.b,acceptance).room.roundId,2);
 assert.throws(()=>f.act(f.a,'SHOOT',{roundId:1,angle:0}),/Round/);assert.throws(()=>f.act(f.a),e=>e.status===409);
});
test('accepting requires both online and preserves invitation while the sender is away',()=>{
 const f=finishedMatch(),s=f.session;f.act(f.a);f.setWall(15001);assert.throws(()=>f.act(f.b),e=>e.status===409&&/offline/.test(e.message));assert.equal(s.room.phase,'finished');assert.equal(s.room.rematch.from,'A');
 s.join(f.a);f.act(f.b);assert.equal(s.room.phase,'countdown');
});
test('READY cannot bypass consent and persisted invitations still require the other player',()=>{
 const f=finishedMatch(),s=f.session;assert.throws(()=>f.act(f.a,'READY'),e=>e.status===409);f.act(f.a);
 const restored=new BubbleDuelSession('SAME01',{record:s.export(),now:()=>4000});restored.action(f.a,{type:'REMATCH',id:'own-repeat',roundId:1,rematchVersion:1});assert.equal(restored.room.phase,'finished');restored.action(f.b,{type:'REMATCH',id:'accept-restored',roundId:1,rematchVersion:1});assert.equal(restored.room.roundId,2);
});
test('result controls distinguish invitation, acceptance, decline and solo replay',()=>{
 assert.equal(typeof ui.rematchControls,'function');const f=finishedMatch();
 let a=ui.rematchControls(f.session.room,'A');assert.equal(a.label,'Play Again');assert.equal(a.action,'REMATCH');assert.equal(a.version,0);
 f.act(f.a);a=ui.rematchControls(f.session.room,'A');const b=ui.rematchControls(f.session.room,'B');assert.equal(a.label,'Waiting for Rival');assert.equal(a.disabled,true);assert.equal(a.secondary,'Cancel Invite');assert.equal(b.label,'Accept Rematch');assert.equal(b.secondary,'Not Now');
 f.act(f.b,'CANCEL_REMATCH');assert.match(ui.rematchControls(f.session.room,'A').message,/declined/);
 const solo=ui.rematchControls(f.session.room,'A',{solo:true});assert.equal(solo.label,'Play Again');assert.equal(solo.action,'READY');assert.equal(solo.disabled,false);assert.equal(solo.secondary,null);
});
