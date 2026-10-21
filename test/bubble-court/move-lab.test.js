import {test} from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const api=await import('../../public/bubble-court/move-lab/clock.mjs').catch(()=>({}));
test('standalone clock pauses without accumulating background time, resumes and finishes',()=>{
 assert.equal(typeof api.PreviewClock,'function');const c=new api.PreviewClock(4000);c.play(0);c.step(500);assert.equal(c.time,500);c.pause(700);assert.equal(c.time,700);c.step(9000);assert.equal(c.time,700);c.play(10000);c.step(11000);assert.equal(c.time,1700);c.step(14000);assert.equal(c.time,4000);assert.equal(c.playing,false);c.play(15000);assert.equal(c.time,0);
});
test('seek, speed and looping share one elapsed timeline and reset safely on move change',()=>{
 assert.equal(typeof api.PreviewClock,'function');const c=new api.PreviewClock(4000);c.play(0);c.setSpeed(.5,1000);assert.equal(c.time,1000);c.step(2000);assert.equal(c.time,1500);c.seek(500,2000);c.step(2400);assert.equal(c.time,700);c.pause(2400);c.seek(-50,2400);assert.equal(c.time,0);c.seek(9000,2400);assert.equal(c.time,4000);c.loop=true;c.play(3000);c.step(12000);assert.equal(c.time,500);assert.equal(c.playing,true);c.reset(3000);assert.equal(c.time,0);assert.equal(c.duration,3000);assert.equal(c.playing,false);c.setSpeed(100,12000);assert.equal(c.speed,.5);assert.throws(()=>new api.PreviewClock(0));
});
test('preview entry is independent of rooms, gameplay and browser storage throughout its import graph',async()=>{
 const root=new URL('../../public/bubble-court/move-lab/',import.meta.url),seen=new Set();
 async function walk(url){if(seen.has(url.href))return;seen.add(url.href);assert.ok(url.pathname.startsWith(root.pathname),'preview must stay isolated from mutable game sources');assert.doesNotMatch(url.pathname,/\/(?:game|model|mock|network|lobby|engine)\.(?:m?js)$/);const source=await readFile(url,'utf8');assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|WebSocket|BroadcastChannel)\s*\(|localStorage|sessionStorage/);for(const m of source.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g))if(m[1].startsWith('.'))await walk(new URL(m[1],url));}
 await walk(new URL('app.mjs',root));for(const id of ['windmill','blackhole','cat'])await walk(new URL(`runtime/duel/moves/${id}/scene.mjs`,root));assert.ok(seen.size>5,'uses actual isolated renderers');const html=await readFile(new URL('index.html',root),'utf8');for(const id of ['move-options','play','replay','timeline','keyframes','show-fx','loop'])assert.match(html,new RegExp(`id="${id}"`));assert.doesNotMatch(html,/iframe|id="board"|id="dunk"|room=/);
});
