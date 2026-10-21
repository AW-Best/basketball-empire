import {test} from 'node:test';
import assert from 'node:assert/strict';
const base='../../public/bubble-court/move-lab/';
const art=await import(base+'runtime/duel/moves/studio-art.mjs').catch(()=>({}));
const camera=await import(base+'runtime/duel/moves/focus.mjs');
const fx=await import(base+'runtime/duel/spectacle.mjs');
const queue=await import(base+'playlist.mjs').catch(()=>({}));
const near=(a,b,e=.001)=>assert.ok(Math.abs(a-b)<e,`${a} ≠ ${b}`);
test('IK keeps actual bone lengths for reachable, far, coincident and near-zero wrist targets',()=>{
 assert.equal(typeof art.solveArm,'function');
 for(const target of [{x:40,y:-40},{x:900,y:400},{x:0,y:0},{x:.0000001,y:0}]){
  const arm=art.solveArm({x:0,y:0},target,66,64,1);
  for(const p of [arm.elbow,arm.wrist])assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
  near(Math.hypot(arm.elbow.x,arm.elbow.y),66,.01);
  near(Math.hypot(arm.wrist.x-arm.elbow.x,arm.wrist.y-arm.elbow.y),64,.01);
  assert.ok(Math.hypot(arm.wrist.x,arm.wrist.y)<=130.001);
 }
});
test('held ball, contact wrist and source release stay continuous across windmill and portal dunk',()=>{
 assert.equal(typeof art.athletePose,'function');
 for(const [id,points] of [['windmill',[699,700,1899,1900,2199,2200,2599,2600]],['blackhole',[4499,4500,4999,5000,5199,5200]]]){
  for(const ms of points){const p=art.athletePose(id,ms),next=art.athletePose(id,ms+1);assert.ok(Math.hypot(p.ball.x-next.ball.x,p.ball.y-next.ball.y)<5,`${id} ball jump ${ms}`);
   if(p.holding){assert.ok(Math.hypot(p.contact.x-p.ball.x,p.contact.y-p.ball.y)<=p.radius+1,`${id} palm must touch ball`);}
  }
 }
});
test('post-impact camera contains both actor silhouette and native impact across narrow and wide stage',()=>{
 assert.equal(typeof art.athletePose,'function');
 for(const [id,ms] of [['windmill',4400],['blackhole',6200],['cat',4500]])for(const [w,h] of [[1038,453],[356,267]]){
  const pose=art.athletePose(id,ms),points=id==='cat'?[{x:camera.focusPaw(ms).x-110,y:camera.focusPaw(ms).y-115},{x:camera.focusPaw(ms).x+105,y:camera.focusPaw(ms).y+90}]:[pose.head,pose.feet];
  points.push(art.impactPoint(id));
  for(const point of points){const p=camera.projectFocusPoint(id,ms,point,w,h);assert.ok(p.x>=5&&p.x<=w-5&&p.y>=5&&p.y<=h-5,`${id}: ${JSON.stringify(p)} outside ${w}x${h}`);}
 }
});
test('special attacks use only source ball during native flight, then send four separated carriers from impact',()=>{
 assert.equal(typeof art.transferTargets,'function');
 const targets=art.transferTargets(356,267);assert.equal(targets.length,4);
 for(const p of targets)assert.ok(p.x>13&&p.x<343&&p.y>13&&p.y<254);
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)assert.ok(Math.hypot(targets[i].x-targets[j].x,targets[i].y-targets[j].y)>=26);
 for(const move of ['windmill','blackhole','cat']){
  const options={move,from:{x:60,y:60},impactFrom:{x:220,y:130},to:targets};
  assert.equal(fx.sampleSpectacle(1500,1000,options).balls.length,0,'no duplicate source/FX balls');
  const launch=fx.sampleSpectacle(2350,1000,options);assert.equal(launch.balls.length,4);near(launch.balls[0].x,220);near(launch.balls[0].y,130);
  const end=fx.sampleSpectacle(3100,1000,options);for(let i=0;i<4;i++){near(end.balls[i].x,targets[i].x);near(end.balls[i].y,targets[i].y);}
  const reduced=fx.sampleSpectacle(2450,1000,{...options,reduced:true});assert.equal(reduced.flash,0);assert.equal(reduced.bolts.length,0);assert.equal(reduced.sparks.length,0);
 }
});
test('playlist runs four different moves once, supports whole-list looping and cancels on manual control',()=>{
 assert.equal(typeof queue.MovePlaylist,'function');const q=new queue.MovePlaylist(['classic','windmill','blackhole','cat']);
 assert.equal(q.start(),'classic');assert.equal(q.advance(false),'windmill');assert.equal(q.advance(false),'blackhole');assert.equal(q.advance(false),'cat');assert.equal(q.advance(false),null);assert.equal(q.active,false);
 q.start('cat');assert.equal(q.advance(true),'classic');q.stop();assert.equal(q.advance(true),null);assert.equal(q.active,false);
});
test('shared drawing is finite and bounded across full clips, with no timers, DOM or extra ball after impact',()=>{
 assert.equal(typeof art.drawStudioFrame,'function');
 let calls=0;const grad={addColorStop(){}};const ctx=new Proxy({canvas:{width:1120,height:580}},{get(o,k){if(k in o)return o[k];return (...args)=>{calls++;for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v),`finite ${String(k)}`);if(String(k).includes('Gradient'))return grad;};},set(o,k,v){o[k]=v;return true;}});
 for(const id of ['windmill','blackhole','cat'])for(let ms=0;ms<=8000;ms+=100){const before=calls;art.drawStudioFrame(ctx,id,ms);assert.ok(calls-before<2200,`${id} draw budget`);}
});
test('receipt rings keep drawing through fade and cache only after their animation ends',()=>{
 const saved=globalThis.devicePixelRatio;globalThis.devicePixelRatio=1;
 try{
  const grad={addColorStop(){}};let clears=0;const ctx=new Proxy({setTransform(){},clearRect(){clears++;}},{get(o,k){return o[k]??((...args)=>String(k).includes('Gradient')?grad:undefined);},set(o,k,v){o[k]=v;return true;}});
  const player=Object.create(fx.AttackSpectacle.prototype);Object.assign(player,{host:{clientWidth:356,clientHeight:267},canvas:{width:356,height:267,dataset:{}},ctx,key:null});
  const options={move:'cat',count:4,to:art.transferTargets(356,267)};
  player.render(3100,1000,options);const first=clears;player.render(3300,1000,options);assert.ok(clears>first,'ring fade must repaint after hold starts');
  player.render(3500,1000,options);const settled=clears;player.render(3700,1000,options);assert.equal(clears,settled,'settled picture should be cached');
 }finally{if(saved===undefined)delete globalThis.devicePixelRatio;else globalThis.devicePixelRatio=saved;}
});
test('native impact completes its burst before the final source hold instead of freezing a half explosion',()=>{
 assert.equal(typeof art.impactState,'function');for(const [id,hit,hold]of [['windmill',4400,5000],['blackhole',6200,6600],['cat',4500,5000]]){
  assert.equal(art.impactState(id,hit-1).active,false);assert.equal(art.impactState(id,hit).active,true);assert.ok(art.impactState(id,hit+100).alpha>0);assert.equal(art.impactState(id,hold).active,false);
 }
});
test('classic completes ball clearance, wrist withdrawal and landing instead of holding the ball in the net',async()=>{
 const {attackSourceTime,getAttackTiming}=await import(base+'runtime/duel/moves.mjs');
 const {pose}=await import(base+'runtime/duel-lab/slam/motion.mjs');
 const finish=attackSourceTime('classic',2600);assert.equal(finish,1500);assert.equal(pose(finish).time,1500);assert.ok(attackSourceTime('classic',1500)>1100);assert.ok(attackSourceTime('classic',1600)>1140);
 const options={move:'classic',to:art.transferTargets(356,267)};assert.equal(fx.sampleSpectacle(1300,1000,options).balls.length,0);assert.equal(fx.sampleSpectacle(1600,1000,options).balls.length,4);assert.equal(getAttackTiming('classic').releaseImpactMs,2200);
});

test('portal grip stays above the face with a visible brow in the windup',()=>{
 for(const ms of [0,4500,4900]){const p=art.athletePose('blackhole',ms);assert.ok(p.ball.y+p.radius<p.head.y,`ball covers face at ${ms}`);}
});
test('receipt glow starts after arrival, leaving flying carriers individually readable',()=>{
 const options={move:'windmill',count:4,to:art.transferTargets(356,267)};
 assert.equal(fx.sampleSpectacle(2700,1000,options).landingGlow,0);
 assert.equal(fx.sampleSpectacle(3100,1000,options).landingGlow,1);
 assert.equal(fx.sampleSpectacle(3500,1000,options).landingGlow,0);
});
test('portal windup camera keeps the entire raised ball visible before downward acceleration',()=>{
 for(const ms of [4500,4700,4900,5000,5100])for(const [w,h]of [[1038,323],[356,267]]){
  const p=art.athletePose('blackhole',ms),top=camera.projectFocusPoint('blackhole',ms,{x:p.ball.x,y:p.ball.y-p.radius},w,h);assert.ok(top.y>=3,`raised ball cropped at source ${ms}: ${top.y}`);
 }
});
