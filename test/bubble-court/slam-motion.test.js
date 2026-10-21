import {test} from 'node:test';import assert from 'node:assert/strict';import {pose} from '../../public/bubble-court/duel-lab/slam/motion.mjs';
test('ordered lift slam and continuous through',()=>{assert.ok(pose(480).ball.y<pose(0).ball.y);assert.ok(pose(770).ball.y>pose(600).ball.y);assert.ok(pose(830).ball.y>pose(800).ball.y);assert.ok(pose(1020).ball.y>pose(830).ball.y);});
test('four attacks leave only after impact and arrive sequentially',()=>{assert.equal(pose(800).attacks.filter(a=>a.active).length,0);assert.equal(pose(1200).attacks.length,4);assert.equal(pose(1500).arrived,4);assert.equal(pose(-10).time,0);assert.equal(pose(2000).time,1500);});
import {hands,netPoint} from '../../public/bubble-court/duel-lab/slam/motion.mjs';
test('hand contacts and release have no switches or jumps',()=>{for(let t=1;t<=1500;t++){for(const side of ['L','R']){const a=hands(t-1)[side],b=hands(t)[side];assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<2,`hand jump ${t}`);assert.ok(Math.abs(a.roll-b.roll)<2);}}assert.ok(hands(1180).L.open>hands(950).L.open);});
test('net anchored at rim, expands around ball and settles',()=>{const a=netPoint(0,0,0),b=netPoint(960,0,0);assert.deepEqual(a,b);assert.ok(netPoint(960,0,.65).radius>netPoint(0,0,.65).radius);assert.ok(Math.abs(netPoint(1500,0,1).y-netPoint(0,0,1).y)<3);});
import {bodyRise} from '../../public/bubble-court/duel-lab/slam/motion.mjs';
test('higher jump peaks near lift and stays elevated through rim contact',()=>{assert.equal(bodyRise(0),0);assert.ok(bodyRise(540)>=75);assert.ok(bodyRise(800)>=60);assert.equal(bodyRise(1450),0);for(let t=1;t<=1500;t++)assert.ok(Math.abs(bodyRise(t)-bodyRise(t-1))<1);});
import {elbowPose} from '../../public/bubble-court/duel-lab/slam/motion.mjs';
test('overhead windup and raised elbow create downward slam',()=>{assert.ok(pose(540).ball.y<=110);for(const side of ['L','R'])assert.ok(elbowPose(920,side).y<hands(920)[side].y);for(let t=1;t<1500;t++)assert.ok(Math.abs(elbowPose(t,'L').y-elbowPose(t-1,'L').y)<2);});

test('ball reaches rim from above and continues through',()=>{assert.ok(pose(805).ball.y<=180);assert.ok(pose(960).ball.y>205);});
test('palms carry ball downward through rim before releasing',()=>{for(const t of [760,805,860,880,900]){const p=pose(t);for(const h of Object.values(hands(t))){assert.ok(h.y<p.ball.y-8,`palm stays above ball ${t}`);assert.ok(Math.hypot(h.x-p.ball.x,h.y-p.ball.y)<38,`contact ${t}`);}}assert.ok(pose(950).ball.y>205);assert.ok(hands(880).L.y>hands(805).L.y);});

test('windup is behind head and ball never pauses through rim',()=>{assert.ok(pose(540).ball.x<125);for(let t=760;t<1030;t++)assert.ok(pose(t+1).ball.y>pose(t).ball.y);assert.ok(elbowPose(540,'L').y<hands(540).L.y-20);});
import {landingPose} from '../../public/bubble-court/duel-lab/slam/motion.mjs';
test('release folds arms down to sides and landing absorbs then recovers',()=>{assert.ok(hands(1500).L.x<130);assert.ok(hands(1500).R.x<210);assert.ok(hands(1500).L.y>275);assert.ok(elbowPose(1350,'L').y>elbowPose(1100,'L').y);assert.ok(landingPose(1360).squash>.06);assert.equal(landingPose(1500).squash,0);assert.equal(landingPose(1500).tilt,0);});
test('both hands firmly grip during backswing and carry',()=>{for(const t of [300,480,540,760,920]){const h=hands(t);assert.ok(h.L.curl>=.8);assert.equal(h.L.open,0);assert.ok(h.L.roll>90);assert.ok(h.R.roll< -90);}assert.ok(hands(1180).L.open>0);});

test('reference pose has high elbows and a short two-hand rim hold',()=>{assert.ok(pose(540).ball.y>=95);for(const side of ['L','R'])assert.ok(elbowPose(540,side).y<75);for(const t of [1050,1090,1120]){assert.equal(hands(t).L.y,207);assert.equal(hands(t).R.y,207);assert.equal(hands(t).L.open,0);}assert.ok(pose(1090).ball.y>300);});
test('ear-side elbows and staggered grips avoid a roof above the head',()=>{const l=elbowPose(540,'L'),r=elbowPose(540,'R');assert.ok(l.x>=120&&l.x<=140);assert.ok(r.x>=150&&r.x<=172);assert.ok(r.x-l.x>=20);assert.ok(hands(540).R.y>hands(540).L.y+5);});
test('swing reaches above hoop before descending through center with continuous speed',()=>{assert.ok(pose(740).ball.x>235);assert.ok(pose(740).ball.y<110);assert.ok(Math.abs(pose(880).ball.x-274)<1);assert.ok(Math.abs(pose(880).ball.y-205)<1);for(const t of [740,880]){const a=pose(t-1).ball,b=pose(t).ball,d=pose(t+1).ball;assert.ok(Math.abs((d.y-b.y)-(b.y-a.y))<.05);}});
