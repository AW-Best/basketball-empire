import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as framing from '../../public/bubble-court/duel/moves.mjs';
import {ATTACK_POSES} from '../../public/bubble-court/duel-lab/Constants.js';
const ids=['windmill','blackhole','cat'];
for(const id of ids)test(`${id} action closeup removes both demo boards and energy bars, while legacy preview keeps them`,async()=>{
 const {createMoveScene}=await import(`../../public/bubble-court/duel/moves/${id}/scene.mjs`);let boards=0,bars=0;
 const gradient={addColorStop(){}};const ctx=new Proxy({canvas:{width:1120,height:580}}, {get(o,k){if(k in o)return o[k];if(k==='fillRect')return (x,y,w,h)=>{if(w===244&&h===356)boards++;if(x===56&&y>=554&&h<=4)bars++;};if(k.startsWith('create'))return ()=>gradient;return ()=>{};},set(o,k,v){o[k]=v;return true;}});
 const scene=createMoveScene(ctx);for(const ms of [0,1000,2500,3500,4500,6200])scene.render(ms,{actionOnly:true,count:0,quiet:true});assert.equal(boards,0,'no duplicate bubble boards');assert.equal(bars,0,'no fake charge bars');scene.render(0);assert.equal(boards,2,'legacy lab still has its two previews');
});
test('after impact the closeup still contains an action silhouette rather than empty space',async()=>{
 const {focusPaw}=await import('../../public/bubble-court/duel/moves/focus.mjs');assert.equal(typeof focusPaw,'function');
 const wind=framing.focusCamera('windmill',5000);for(const point of [{x:387,y:357},{x:404,y:508},{x:420,y:157}]){const p=framing.projectFocusPoint('windmill',5000,point,440,440*580/1120);assert.ok(p.y>=0&&p.y<=440*580/1120,'windmill ending lost the athlete/rim');}
 assert.ok(wind.x<500,'windmill camera returns to landing athlete');
 const paw=focusPaw(5000);for(const point of [{x:paw.x-117,y:paw.y-118},{x:paw.x+103,y:paw.y+91}]){const p=framing.projectFocusPoint('cat',5000,point,440,440*580/1120);assert.ok(p.x>=0&&p.x<=440&&p.y>=0&&p.y<=440*580/1120,'cat ending lost its paw');}
});
test('closeup follows the full ball flight with margin, continuous camera and shared contact projection',async()=>{
 assert.equal(typeof framing.focusCamera,'function');assert.equal(typeof framing.projectFocusPoint,'function');
 const flights={windmill:[2600,4400],blackhole:[5200,6200],cat:[2820,4500]};
 for(const id of ids){const {sample}=await import(`../../public/bubble-court/duel/moves/${id}/motion.mjs`);const [from,to]=flights[id];for(let ms=from;ms<=to;ms+=10){const ball=sample(ms/1000).ball;for(const width of [390,440]){const p=framing.projectFocusPoint(id,ms,ball,width,width*580/1120),camera=framing.focusCamera(id,ms),margin=19*camera.zoom*width/1120;assert.ok(p.x>=margin&&p.x<=width-margin,`${id} ball x clipped at ${ms}`);assert.ok(p.y>=margin&&p.y<=width*580/1120-margin,`${id} ball y clipped at ${ms}`);}}
  let prev=framing.focusCamera(id,0);for(let t=1;t<=ATTACK_POSES[id].hold;t++){const c=framing.focusCamera(id,t);assert.ok(Math.abs(c.x-prev.x)<3&&Math.abs(c.y-prev.y)<3&&Math.abs(c.zoom-prev.zoom)<.03,`${id} camera jumps at ${t}`);prev=c;}
  const pose=ATTACK_POSES[id],projected=framing.projectFocusPoint(id,pose.contact,{x:pose.x,y:pose.y},390,260);assert.deepEqual(framing.attackOrigin(id,390,260,{actionOnly:true}),projected);
 }
});
