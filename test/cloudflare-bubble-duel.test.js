import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker,{BubbleDuelRoom} from '../cloudflare/worker.mjs';
function context(){const values=new Map();let alarm=null;return {storage:{async get(k){return structuredClone(values.get(k));},async put(k,v){await Promise.resolve();values.set(k,structuredClone(v));},async delete(k){values.delete(k);},async deleteAll(){values.clear();},async setAlarm(at){alarm=at;},async getAlarm(){return alarm;},async deleteAlarm(){alarm=null;}},blockConcurrencyWhile(fn){return fn();}};}
function fixture(){const objects=new Map();const ctxs=new Map();return {objects,ctxs,env:{BUBBLE_CREATE_LIMITER:{async limit(){return {success:true};}},BUBBLE_ROOMS:{idFromName:x=>x,get(id){if(!objects.has(id)){const ctx=context();ctxs.set(id,ctx);objects.set(id,new BubbleDuelRoom(ctx,{}));}return objects.get(id);}},ASSETS:{fetch:()=>new Response('asset')}}};}
const request=(path,method='GET',data,token,origin)=>new Request('https://hoopire.com'+path,{method,headers:{...(token?{authorization:'Bearer '+token}:{}),...(origin?{origin}:{}),'content-type':'application/json'},...(data===undefined?{}:{body:JSON.stringify(data)})});
test('worker routes independent bubble rooms, protects secrets and never exposes cheat',async()=>{const {env}=fixture();const info=await worker.fetch(request('/api/bubble/info'),env);assert.equal((await info.json()).online,true);const created=await worker.fetch(request('/api/bubble/rooms','POST',{}),env);assert.equal(created.status,201);const a=await created.json();assert.match(a.roomId,/^[A-Z0-9]{6}$/);const base='/api/bubble/rooms/'+a.roomId;const b=await(await worker.fetch(request(base+'/join','POST',{}),env)).json();assert.equal(b.seat,'B');assert.equal(b.room.players.A.token,'occupied');assert.equal((await worker.fetch(request(base+'/join','POST',{}),env)).status,409);assert.equal((await worker.fetch(request(base+'/actions','POST',{type:'CHARGE',id:'x',roundId:0},a.token),env)).status,400);assert.equal((await worker.fetch(request(base+'/actions','POST',{type:'READY',id:'x',roundId:0},a.token,'https://evil.test'),env)).status,403);assert.equal((await worker.fetch(request('/api/bubble/rooms/ZZZZZZ/join','POST',{}),env)).status,404);assert.equal((await worker.fetch(request(base+'/internal-create','POST',{}),env)).status,404);});
test('DO reload persists tokens, serializes concurrent seat joins and snapshots',async()=>{const ctx=context();let room=new BubbleDuelRoom(ctx,{});const base='/api/bubble/rooms/ABC123';const first=await room.fetch(request(base+'/internal-create','POST',{}));assert.equal(first.status,201);const a=await first.json();room=new BubbleDuelRoom(ctx,{});const joined=await Promise.all([room.fetch(request(base+'/join','POST',{})),room.fetch(request(base+'/join','POST',{}))]);assert.deepEqual(joined.map(r=>r.status).sort(),[200,409]);const snapshots=await Promise.all(Array.from({length:8},()=>room.fetch(request(base,'GET',undefined,a.token))));assert.ok(snapshots.every(r=>r.status===200));const snap=await snapshots[0].json();assert.equal(snap.room.players.B.token,'occupied');assert.equal(typeof snap.gameNow,'number');assert.equal(snap.capabilities.charge,false);});
test('all bubble mutations bound body bytes and reject invalid room creation flags',async()=>{const {env}=fixture();assert.equal((await worker.fetch(request('/api/bubble/rooms','POST',{x:'x'.repeat(8192)}),env)).status,413);assert.equal((await worker.fetch(request('/api/bubble/rooms','POST',{roomId:'ABC123'}),env)).status,400);});

test('anonymous creation quota uses connecting IP and never consumes quota for room reads',async()=>{
 const f=fixture(),keys=[];f.env.BUBBLE_CREATE_LIMITER={async limit({key}){keys.push(key);return {success:keys.length<=1};}};
 const create=()=>new Request('https://hoopire.com/api/bubble/rooms',{method:'POST',headers:{'CF-Connecting-IP':'203.0.113.7'},body:'{}'});
 const first=await worker.fetch(create(),f.env),a=await first.json();assert.equal(first.status,201);
 assert.equal((await worker.fetch(create(),f.env)).status,429);assert.deepEqual(keys,['203.0.113.7','203.0.113.7']);
 assert.equal((await worker.fetch(request('/api/bubble/rooms/'+a.roomId,'GET',undefined,a.token),f.env)).status,200);assert.equal(keys.length,2);
});
test('DO alarm survives reload, extends on activity and reclaims abandoned records',async()=>{
 const original=Date.now;let wall=1000;Date.now=()=>wall;
 try{
  const ctx=context();let room=new BubbleDuelRoom(ctx,{});const base='/api/bubble/rooms/ABC123';
  const a=await(await room.fetch(request(base+'/internal-create','POST',{}))).json();assert.equal(await ctx.storage.getAlarm(),wall+1800000);
  wall+=60000;await room.fetch(request(base,'GET',undefined,a.token));const extended=wall+1800000;assert.equal(await ctx.storage.getAlarm(),extended);
  room=new BubbleDuelRoom(ctx,{});wall=1801000;await room.alarm();assert.equal((await room.fetch(request(base,'GET',undefined,a.token))).status,200);
  wall=Date.now()+1800001;await room.alarm();assert.equal((await room.fetch(request(base,'GET',undefined,a.token))).status,404);assert.equal(await ctx.storage.get('bubble-session-v1'),undefined);
 }finally{Date.now=original;}
});
