import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as motion from '../../public/bubble-court/duel-lab/comic-motion.js';
import {ComicCourt} from '../../public/bubble-court/duel-lab/comic.js';
import {HAND,COMIC} from '../../public/bubble-court/duel-lab/Constants.js';

const sample=t=>{assert.equal(typeof motion.sampleDunk,'function','comic dunk needs a deterministic motion sampler');return motion.sampleDunk(t);};
test('the in-round dunk has anticipation, lift, slam, impact, hang and recovery inside 1500ms',()=>{
 const phases=[.05,.25,.49,.54,.65,.9].map(t=>sample(t).phase);
 assert.deepEqual(phases,['gather','rise','slam','impact','hang','recover']);assert.equal(sample(1).active,false);
});
test('ball drives through rim center at 800ms and releases into the net rather than carrying with the retreating arm',()=>{
 const hit=sample(800/1500),after=sample(.66);assert.ok(Math.abs(hit.ball.x-hit.rim.x)<1);assert.ok(Math.abs(hit.ball.y-hit.rim.y)<1);
 assert.ok(after.ball.y>after.rim.y+25);assert.ok(Math.abs(after.ball.x-after.rim.x)<2);assert.equal(after.released,true);assert.ok(after.hand.y<after.ball.y-20);
});
test('the storyboard starts its accelerating wrist slam at 600ms and still hits at 800ms',()=>{
 assert.equal(sample(610/1500).phase,'slam');
 const a=sample(600/1500),b=sample(650/1500),c=sample(750/1500),d=sample(790/1500);
 assert.ok(b.ball.y>a.ball.y);assert.ok(d.ball.y-c.ball.y>b.ball.y-a.ball.y,'late downward travel is faster than early travel');
});
test('the passing ball opens a local net pocket which returns to its rest width',()=>{
 assert.equal(typeof motion.netSection,'function');const p=sample(.65),u=(p.ball.y-p.rim.y-2)/(35+p.netStretch);
 assert.ok(p.netBulge>.5);const middle=motion.netSection(p,u),rest=motion.netSection({...p,netBulge:0},u);
 assert.ok(middle.halfWidth>rest.halfWidth+1);assert.ok(middle.halfWidth>=27);
 assert.equal(sample(.4).netBulge,0);assert.equal(sample(1).netBulge,0);assert.equal(motion.sampleDunk(1,true).netBulge,0);
 assert.equal(motion.netSection(p,0).halfWidth,motion.netSection({...p,netBulge:0},0).halfWidth);
});
test('60ms visual hit stop keeps contact stable without extending the game event duration',()=>{
 const a=sample(.54),b=sample(.565);assert.deepEqual(a.ball,b.ball);assert.deepEqual(a.hand,b.hand);assert.equal(a.phase,'impact');assert.equal(sample(1).active,false);
});
test('hanging hand remains attached to the moving rim while the released ball falls independently',()=>{
 const offsets=[.59,.65,.71].map(t=>{const p=sample(t);return [p.hand.x-p.rim.x,p.hand.y-p.rim.y];});
 for(const [x,y] of offsets){assert.ok(Math.abs(x+20)<.01);assert.ok(Math.abs(y-8)<.01);}
 assert.ok(sample(.71).ball.y>sample(.59).ball.y);
});
test('net stretches only after entry and settles smoothly by the end',()=>{
 for(const t of [.1,.4,.49,.53])assert.equal(sample(t).netStretch,0);
 assert.ok(sample(.65).netStretch>15);assert.ok(Math.abs(sample(.98).netStretch)<.3);assert.equal(sample(1).netStretch,0);
});
test('all motion channels are finite, continuous and reversible when scrubbing',()=>{
 for(let i=0;i<=1000;i++){
  const a=sample(i/1000),b=sample(Math.min(1,(i+1)/1000));
  for(const item of ['ball','hand','elbow','shoulder','rim'])for(const axis of ['x','y']){assert.ok(Number.isFinite(a[item][axis]));assert.ok(Math.abs(a[item][axis]-b[item][axis])<9,`${item}.${axis} jumps at ${i}`);}
 }
 assert.deepEqual(sample(.3),sample(.3));assert.deepEqual(sample(-1).ball,sample(0).ball);assert.equal(sample(2).active,false);
});
test('reduced motion keeps the attack readable without shaking, zooming or arm sweeps',()=>{
 assert.equal(typeof motion.sampleDunk,'function');for(const t of [.1,.5,.7]){const p=motion.sampleDunk(t,true);assert.equal(p.camera.zoom,1);assert.equal(p.camera.x,0);assert.equal(p.camera.y,0);assert.equal(p.speedLines,0);assert.equal(p.textScale,1);assert.ok(p.attackOpacity>0);}
});
test('reset/idle reduced-motion frame has an unstretched net',()=>{
 assert.equal(typeof motion.sampleDunk,'function');assert.equal(motion.sampleDunk(-1,true).netStretch,0);assert.equal(motion.sampleDunk(1,true).netStretch,0);
});

function fixture(reduced=false){
 const original=globalThis.matchMedia,ratio=globalThis.devicePixelRatio;globalThis.matchMedia=()=>({matches:reduced});globalThis.devicePixelRatio=1;
 const ops=[];const gradient={addColorStop(){}};const context=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:()=>({width:20})},{get(target,name){return name in target?target[name]:(...args)=>ops.push([name,...args,{fillStyle:target.fillStyle,strokeStyle:target.strokeStyle,lineWidth:target.lineWidth}]);},set(target,name,v){target[name]=v;return true;}});
 const canvas={clientWidth:390,clientHeight:165,width:0,height:0,dataset:{},getContext:()=>context};
 const court=new ComicCourt(canvas);return {court,canvas,ops,restore:()=>{globalThis.matchMedia=original;globalThis.devicePixelRatio=ratio;}};
}
test('renderer uses the shared sampler, rejects old/duplicate events and reset removes the active spectacle',()=>{
 const f=fixture();try{
  assert.equal(f.court.play({id:2,roundId:1,at:1000},true),true);
  assert.equal(f.court.play({id:2,roundId:1,at:2000},false),false);
  assert.equal(f.court.play({id:1,roundId:1,at:2000},false),false);
  assert.equal(f.court.draw(1800),true);assert.equal(f.canvas.dataset.phase,'impact');assert.equal(f.canvas.dataset.owner,'self');
  assert.equal(f.court.draw(2600),false);f.court.reset();assert.equal(f.court.draw(1200),false);assert.equal(f.canvas.dataset.phase,'idle');
  assert.equal(f.court.play({id:1,roundId:2,at:2000},false),true);assert.equal(f.court.draw(2800),true);assert.equal(f.canvas.dataset.owner,'rival');
 }finally{f.restore();}
});
test('renderer draws the rear net, ball, front net and front rim in the intended occlusion order',()=>{
 const f=fixture();try{
  f.court.play({id:1,at:0},true);f.court.draw(990);
  const rear=f.ops.findIndex(op=>op[0]==='stroke'&&op.at(-1).strokeStyle==='#a9c8a466');
  const ball=f.ops.findIndex(op=>op[0]==='ellipse'&&op[1]===0&&op[2]===0&&op[3]===23);
  const front=f.ops.findIndex(op=>op[0]==='stroke'&&op.at(-1).strokeStyle==='#fff1ccc9');
  const rim=f.ops.findIndex(op=>op[0]==='stroke'&&op.at(-1).lineWidth===10&&op.at(-1).strokeStyle===COMIC.palette.shadow);
  const fingers=f.ops.findIndex(op=>op[0]==='stroke'&&op.at(-1).lineWidth===HAND.fingerWidth&&op.at(-1).strokeStyle===HAND.skin);
  assert.ok(rear>=0&&rear<ball&&ball<front&&front<rim&&rim<fingers,'ball and grabbing fingers must remain visible between the right net/rim layers');
 }finally{f.restore();}
});
test('warm palm and rear thumb sit behind the ball while skin-colored fingers wrap in front',()=>{
 const f=fixture();try{
  f.court.play({id:1,at:0},true);f.court.draw(990);
  const palm=f.ops.findIndex(op=>op[0]==='fill'&&op.at(-1).fillStyle===HAND.skin);
  const ball=f.ops.findIndex(op=>op[0]==='ellipse'&&op[1]===0&&op[2]===0&&op[3]===23);
  assert.ok(palm>=0&&palm<ball,'palm needs a readable skin silhouette behind the ball');
  const angle=motion.sampleDunk(.66).handRig.angle;
  assert.ok(f.ops.some(op=>op[0]==='rotate'&&Math.abs(op[1]-angle)<1e-8),'palm and fingers share the wrist rotation');
 }finally{f.restore();}
});
test('front layer paints short distal pads instead of long strokes from the finger roots',()=>{
 const f=fixture();try{
  f.court.play({id:1,at:0},true);f.court.draw(990);
  const rig=motion.sampleDunk(.66).handRig;
  for(const finger of rig.fingers){assert.ok(f.ops.some(op=>op[0]==='moveTo'&&Math.abs(op[1]-finger.padStart.x)<1e-8&&Math.abs(op[2]-finger.padStart.y)<1e-8),'front pad must start near the rim surface');}
 }finally{f.restore();}
});
