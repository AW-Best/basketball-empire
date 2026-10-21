import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as motion from '../../public/bubble-court/duel-lab/animation/player-motion.js';

const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const pose=t=>{assert.equal(typeof motion.samplePlayer,'function','standalone player motion sampler must exist');return motion.samplePlayer(t);};
test('complete player moves through gather, jump, dunk, hang, landing and planted finish',()=>{
 assert.deepEqual([.08,.30,.49,.59,.87,1].map(t=>pose(t).phase),['gather','jump','dunk','hang','land','idle']);
 const p=pose(.5);for(const k of ['head','hip','shoulderFront','shoulderBack','handFront','handBack','footFront','footBack','ball','rim'])assert.ok(p[k]);
});
test('all four limbs keep fixed segment lengths and IK targets remain reachable for every frame',()=>{
 for(let i=0;i<=1000;i++){const p=pose(i/1000);for(const limb of Object.values(p.limbs)){
  assert.ok(Math.abs(dist(limb.start,limb.joint)-limb.upper)<1e-6);assert.ok(Math.abs(dist(limb.joint,limb.end)-limb.lower)<1e-6);assert.ok(limb.error<.01,`unreachable ${limb.name} at ${i}: ${limb.error}`);
 }}
});
test('held ball stays at the actual shooting hand and releases without teleporting',()=>{
 for(let i=0;i<500;i++){const p=pose(i/1000);assert.equal(p.released,false);assert.ok(dist(p.ball,p.handFront)>=10&&dist(p.ball,p.handFront)<=17);}
 const a=pose(.5-1e-6),b=pose(.5+1e-6);assert.ok(dist(a.ball,b.ball)<.01);assert.equal(b.released,true);
 assert.ok(pose(.63).ball.y>pose(.54).ball.y);
});
test('player is airborne at rim contact and grabbing hand follows the rim during hang',()=>{
 for(const t of [.5,.56,.62]){const p=pose(t);assert.ok(p.footFront.y+p.shoeSole<p.ground-8);assert.ok(p.footBack.y+p.shoeSole<p.ground-8);assert.ok(dist(p.handFront,{x:p.rim.x-14,y:p.rim.y+5})<.01);}
});
test('shoe soles land above the floor, remain planted during compression and finish',()=>{
 for(let i=0;i<=1000;i++){const p=pose(i/1000);assert.ok(p.footFront.y+p.shoeSole<=p.ground+.001);assert.ok(p.footBack.y+p.shoeSole<=p.ground+.001);}
 const a=pose(.88),b=pose(1);assert.equal(a.footFront.y+a.shoeSole,a.ground);assert.equal(a.footBack.y+a.shoeSole,a.ground);assert.deepEqual(a.footFront,b.footFront);assert.deepEqual(a.footBack,b.footBack);assert.ok(a.hip.y>b.hip.y+10);
});
test('joint sampling is continuous and reversible, with head/ball/feet inside the preview',()=>{
 for(let i=0;i<1000;i++){const a=pose(i/1000),b=pose((i+1)/1000);for(const name of ['head','hip','handFront','handBack','footFront','footBack','ball']){assert.ok(Number.isFinite(a[name].x)&&Number.isFinite(a[name].y));assert.ok(dist(a[name],b[name])<8,`${name} jumps at ${i}`);}
 assert.ok(a.head.y-12>=0);assert.ok(a.footFront.x>=10&&a.footFront.x<=390);}
 assert.deepEqual(pose(.35),pose(.35));
});
test('reduced motion uses stable readable poses without camera sweeps',()=>{
 assert.equal(typeof motion.samplePlayer,'function');const a=motion.samplePlayer(.2,true),b=motion.samplePlayer(.3,true);assert.deepEqual(a,b);assert.equal(a.camera.zoom,1);assert.equal(a.camera.x,0);
});
test('standalone player renderer and motion do not import multiplayer or shared hand renderer',async()=>{
 for(const name of ['player-motion.js','player-court.js']){const source=await readFile(new URL(`../../public/bubble-court/duel-lab/animation/${name}`,import.meta.url),'utf8');assert.doesNotMatch(source,/from\s+['"](?:\.\.\/|.*(?:model|room|comic|EventBus))/);}
});

test('standalone renderer loads as a browser module',async()=>{const {PlayerCourt}=await import('../../public/bubble-court/duel-lab/animation/player-court.js');assert.equal(typeof PlayerCourt,'function');});
test('basketball passes behind front net and open rim while gripping fingers stay above rim',async()=>{
 const {PlayerCourt}=await import('../../public/bubble-court/duel-lab/animation/player-court.js');const calls=[];
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const court=new PlayerCourt({getContext:()=>ctx,clientWidth:400,clientHeight:320});
 for(const key of ['net','rimArc','ball']){const original=court[key];assert.equal(typeof original,'function',`${key} must be layered explicitly`);court[key]=function(...args){calls.push(key==='ball'?'ball':`${key}:${args[1]?'front':'back'}`);return original.apply(this,args);};}
 court.draw(1180);assert.deepEqual(calls,['net:back','rimArc:back','ball','net:front','rimArc:front']);
});
