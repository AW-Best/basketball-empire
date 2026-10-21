import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleDunk} from '../../public/bubble-court/duel-lab/comic-motion.js';
import * as hand from '../../public/bubble-court/duel-lab/hand-pose.js';
const pose=t=>{const p=sampleDunk(t);assert.ok(p.handRig,'DUNK must expose an articulated hand pose');return p;};
test('wrist follows the forearm with limited flex while rolling from support to grip',()=>{
 const lift=pose(.4).handRig,grip=pose(.6).handRig;
 assert.ok(lift.flex<-.2);assert.ok(grip.flex>0);assert.ok(grip.angle>lift.angle);
 for(let i=0;i<1000;i++){const p=pose(i/1000),rig=p.handRig;const axis=Math.atan2(p.hand.x-p.elbow.x,p.elbow.y-p.hand.y);assert.ok(Math.abs(rig.angle-axis)<=.38);}
});
test('all three curled finger tips stay attached to the front rim as it rebounds',()=>{
 assert.equal(typeof hand.handToWorld,'function');
 for(const t of [.59,.65,.71]){const p=pose(t),rig=p.handRig;assert.equal(rig.fingers.length,3);
  for(const finger of rig.fingers){const tip=hand.handToWorld(finger.tip,rig);assert.ok(Math.hypot(tip.x-finger.contact.x,tip.y-finger.contact.y)<.01);assert.ok(tip.y>p.rim.y);}
 }
});
test('fingers close after palm contact, completing their grip at 860ms instead of snapping at 800ms',()=>{
 const touch=pose(800/1500).handRig,closing=pose(830/1500).handRig,closed=pose(860/1500).handRig;
 assert.equal(touch.ringClosure,0);assert.ok(closing.ringClosure>.1&&closing.ringClosure<.9);assert.equal(closed.ringClosure,1);
 assert.ok(closing.thumbTransfer<closing.gripMix,'thumb follows the fingertips rather than releasing first');
});
test('visible finger pads remain short and round throughout ball-to-rim transfer',()=>{
 for(let i=0;i<=1000;i++){const rig=pose(i/1000).handRig;for(const f of rig.fingers){
  assert.ok(f.padStart&&f.padControl,'distal pad is distinct from the palm-connected finger root');
  assert.ok(Math.hypot(f.tip.x-f.padStart.x,f.tip.y-f.padStart.y)<=10.5,'front fingers must not become long claws');
  assert.ok(Math.hypot(f.base.x-f.knuckle.x,f.base.y-f.knuckle.y)+Math.hypot(f.knuckle.x-f.tip.x,f.knuckle.y-f.tip.y)<42);
 }}
});
test('thumb sits on the opposite/back side of the rim rather than alongside the fingers',()=>{
 const p=pose(.65),rig=p.handRig,thumb=hand.handToWorld(rig.thumb.tip,rig);
 assert.ok(thumb.y<p.rim.y);assert.ok(rig.fingers.every(f=>hand.handToWorld(f.tip,rig).y>p.rim.y));
});
test('fingers open before the wrist and forearm withdraw, without a one-frame disappearance',()=>{
 const a=pose(1.15/1.5),b=pose(.80),c=pose(.89);
 assert.equal(a.handRig.openProgress,0);assert.ok(b.handRig.openProgress>.25);assert.ok(b.handRig.openProgress<1);
 assert.ok(Math.abs(b.hand.x-b.rim.x+20)<.01);assert.ok(Math.abs(b.hand.y-b.rim.y-8)<.01);
 assert.equal(c.handRig.openProgress,1);assert.ok(c.hand.y>c.rim.y+12);assert.equal(b.handRig.fingers.length,3);
});
test('fingers keep carrying the ball until the final approach instead of reaching for the rim early',()=>{
 for(const t of [.4,.45,.49]){const p=pose(t);assert.equal(p.handRig.gripMix,0);
  for(const f of p.handRig.fingers){for(const point of [f.tip,f.padStart]){assert.ok(point);const world=hand.handToWorld(point,p.handRig);assert.ok(Math.abs(Math.hypot(world.x-p.ball.x,world.y-p.ball.y)-22)<.01);}}
 }
});
test('hand rotation and all finger joints remain finite and continuous across capture and release',()=>{
 for(let i=0;i<1000;i++){const a=pose(i/1000).handRig,b=pose((i+1)/1000).handRig;
  assert.ok(Number.isFinite(a.angle));assert.ok(Math.abs(a.angle-b.angle)<.06);
  for(let f=0;f<3;f++)for(const joint of ['base','knuckle','tip']){const x=hand.handToWorld(a.fingers[f][joint],a),y=hand.handToWorld(b.fingers[f][joint],b);assert.ok(Number.isFinite(x.x)&&Number.isFinite(x.y));assert.ok(Math.hypot(x.x-y.x,x.y-y.y)<9);}
 }
});
test('hand local/world transforms round-trip around the actual wrist pivot',()=>{
 assert.equal(typeof hand.handToLocal,'function');const rig=pose(.6).handRig,point={x:23,y:-17};
 const out=hand.handToLocal(hand.handToWorld(point,rig),rig);assert.ok(Math.abs(out.x-point.x)<1e-8);assert.ok(Math.abs(out.y-point.y)<1e-8);
 assert.deepEqual(hand.handToWorld({x:0,y:0},rig),rig.wrist);
});
test('reduced-motion hand is fixed in the same grip throughout the effect',()=>{
 const a=sampleDunk(.2,true),b=sampleDunk(.8,true);assert.ok(a.handRig);assert.deepEqual(a.handRig,b.handRig);
});
test('hand changes preserve the ball, ring and contact hold timing',()=>{
 for(const t of [.54,.565]){const p=pose(t);assert.deepEqual(p.ball,{x:242,y:92});assert.equal(p.rim.y,92);assert.equal(p.phase,'impact');}
 const p=pose(.66);assert.deepEqual(p.ball,{x:242,y:141});assert.equal(sampleDunk(1).active,false);
});
