import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {NetworkRoomStore} from '../../public/bubble-court/duel/network.mjs';
const base=new URL('../../public/bubble-court/duel/',import.meta.url);
test('online selection is sent on the authenticated action and retained through transport retry',async()=>{
 const sent=[];let attempt=0;const store=new NetworkRoomStore({roomId:'AB12CD',seat:'A',token:'private-token',now:()=>1000,fetcher:async(url,init)=>{sent.push({url,headers:init.headers,input:JSON.parse(init.body)});if(attempt++===0)throw Error('retry');return {ok:true,json:async()=>({room:{revision:1},serverNow:1000})};}});
 await store.send('DUNK',{roundId:3,move:'blackhole',durationMs:1,count:99});
 assert.equal(sent[0].input.move,'blackhole');assert.equal(sent[1].input.id,sent[0].input.id);assert.equal(sent[0].headers.Authorization,'Bearer private-token');assert.equal(sent[0].input.durationMs,undefined);assert.equal(sent[0].input.count,undefined);
});
test('server game and visual clocks stay separate through a cutscene, pause and recovery',async()=>{
 let local=1000;let response={room:{revision:2,phase:'playing',presentation:{durationMs:4000}},serverNow:10000,gameNow:6000,visualNow:7100,cinemaRemainingMs:2900,capabilities:{moves:true,cinematic:true,charge:false}};
 const store=new NetworkRoomStore({roomId:'AB12CD',seat:'A',token:'a',now:()=>local,fetcher:async()=>({ok:true,json:async()=>response})});
 await store.send('TICK');assert.equal(store.now(),6000);assert.equal(store.visualNow(),7100);local=1500;assert.equal(store.now(),6000);assert.equal(store.visualNow(),7600);assert.equal(store.cinemaRemaining(),2400);
 response={...response,room:{revision:3,phase:'paused',presentation:{durationMs:4000}},gameNow:6000,visualNow:7600,cinemaRemainingMs:2400};await store.send('TICK');local=2500;assert.equal(store.now(),6000);assert.equal(store.visualNow(),7600);assert.equal(store.cinemaRemaining(),2400);
 response={...response,room:{revision:4,phase:'playing',presentation:null},gameNow:6000,visualNow:6000,cinemaRemainingMs:0};await store.send('TICK');local=2600;assert.equal(store.now(),6100);assert.equal(store.visualNow(),6100);assert.equal(store.capabilities.charge,false);
});
test('initial authoritative snapshot gives the correct clock before the first poll',()=>{
 let at=2000;const store=new NetworkRoomStore({roomId:'AB12CD',seat:'A',token:'a',now:()=>at,room:{phase:'playing',presentation:{durationMs:3000}},serverNow:20000,gameNow:8000,visualNow:8800,cinemaRemainingMs:2200});
 at=2100;assert.equal(store.now(),8000);assert.equal(store.visualNow(),8900);
});
test('online cinematic rendering uses a pinned approved runtime, independent of mutable move-lab experiments',async()=>{
 const source=await readFile(new URL('game.mjs',base),'utf8');assert.match(source,/runtime-v2\/duel\/move-court\.mjs/);assert.match(source,/runtime-v2\/duel\/spectacle\.mjs/);assert.doesNotMatch(source,/from\s+['"][^'"]*move-lab/);
 const expected=new URL('../move-lab/runtime/',base),pinned=new URL('runtime-v2/',base);for(const path of ['duel/moves/studio-art.mjs','duel/moves/focus.mjs','duel-lab/slam/scene.mjs','duel/moves/windmill/scene.mjs','duel/moves/blackhole/scene.mjs','duel/moves/cat/scene.mjs'])assert.equal(await readFile(new URL(path,pinned),'utf8'),await readFile(new URL(path,expected),'utf8'),path);
 const runtime=await readFile(new URL('runtime-v2/duel/move-court.mjs',base),'utf8');assert.doesNotMatch(runtime,/requestAnimationFrame|setInterval/,'caller owns the animation clock');
});
test('second and later Dunks advance on the accumulated visual timeline rather than clamping to the frozen game clock',async()=>{
 let local=0;const packet={room:{revision:8,phase:'playing',presentation:{durationMs:4000,visualAt:20000}},serverNow:1000,gameNow:9000,visualNow:21000,cinemaRemainingMs:3000};
 const store=new NetworkRoomStore({roomId:'AB12CD',seat:'A',token:'a',now:()=>local,fetcher:async()=>({ok:true,json:async()=>packet})});await store.send('TICK');assert.equal(store.visualNow(),21000);local=2500;assert.equal(store.visualNow(),23500);local=4000;assert.equal(store.visualNow(),24000);assert.equal(store.now(),9000);assert.equal(store.cinemaRemaining(),0);
});
test('late older responses cannot overwrite the current presentation clock or same-revision offline state',async()=>{
 let local=0;let packet={room:{revision:5,phase:'playing',presentation:{durationMs:4000,visualAt:12000}},serverNow:15000,gameNow:8000,visualNow:13000,cinemaRemainingMs:3000};const store=new NetworkRoomStore({roomId:'AB12CD',seat:'A',token:'a',now:()=>local,fetcher:async()=>({ok:true,json:async()=>packet})});await store.send('TICK');
 packet={...packet,room:{revision:4,phase:'playing',presentation:null},serverNow:14000,gameNow:7900,visualNow:7900,cinemaRemainingMs:0};const stale=await store.send('TICK');assert.equal(stale.revision,5);assert.equal(store.visualNow(),13000);
 packet={...packet,room:{revision:5,phase:'paused',presentation:{durationMs:4000,visualAt:12000}},serverNow:15100,gameNow:8000,visualNow:13100,cinemaRemainingMs:2900};const paused=await store.send('TICK');assert.equal(paused.phase,'paused');local=500;assert.equal(store.visualNow(),13100);
});

test('rematch transport carries the observed consent version to reject stale invitations',async()=>{
 let body;const store=new NetworkRoomStore({roomId:'AB12CD',seat:'A',token:'a',fetcher:async(_url,init)=>{body=JSON.parse(init.body);return {ok:true,json:async()=>({room:{revision:1},serverNow:1000})};}});
 await store.send('REMATCH',{roundId:2,rematchVersion:7});assert.equal(body.rematchVersion,7);
});
