import {duelError} from './bubble-duel-session.mjs';
export const bubbleJSON=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export function checkBubbleOrigin(request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw duelError(403,'Origin not allowed');}
export async function readBubbleBody(request){
 if(Number(request.headers.get('content-length'))>8192)throw duelError(413,'Request too large');
 const reader=request.body?.getReader(),chunks=[];let length=0;
 if(reader)for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>8192){await reader.cancel();throw duelError(413,'Request too large');}chunks.push(value);}
 const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}
 try{const v=JSON.parse(new TextDecoder().decode(bytes)||'{}');if(!v||Array.isArray(v)||typeof v!=='object')throw Error();return v;}catch{throw duelError(400,'Invalid JSON');}
}
export const bubbleToken=request=>request.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];
export function randomBubbleCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(crypto.getRandomValues(new Uint8Array(6)),v=>alphabet[v%alphabet.length]).join('');}
export const bubbleFailure=e=>bubbleJSON({error:e.status?e.message:'Match service error'},e.status||500);
/** Dispatch one existing session. Creation is owned by the Node map / DO. */
export async function handleBubbleSession(request,session,{now=Date.now}={}){
 checkBubbleOrigin(request);if(!session)throw duelError(404,'Room not found or expired');
 const operation=new URL(request.url).pathname.match(/^\/api\/bubble\/rooms\/[A-Z0-9]{6}(?:\/(join|actions))?$/);
 if(!operation)throw duelError(404,'Endpoint not found');
 const wall=now();
 if(!operation[1]&&request.method==='GET')return bubbleJSON(session.snapshot(bubbleToken(request),wall));
 if(operation[1]==='join'&&request.method==='POST'){const input=await readBubbleBody(request);if(input.token!==undefined&&typeof input.token!=='string')throw duelError(400,'Invalid identity');return bubbleJSON(session.join(input.token,wall));}
 if(operation[1]==='actions'&&request.method==='POST')return bubbleJSON(session.action(bubbleToken(request),await readBubbleBody(request),wall));
 throw duelError(405,'Method not allowed');
}
export async function routeBubbleWorker(request,env){
 try{
  checkBubbleOrigin(request);const url=new URL(request.url),route=url.pathname;
  if(route==='/api/bubble/info'&&request.method==='GET')return bubbleJSON({online:true,urls:[],pressureMs:35000,serverNow:Date.now()});
  if(route==='/api/bubble/rooms'&&request.method==='POST'){
   const input=await readBubbleBody(request);if(Object.keys(input).some(k=>k!=='token')||(input.token!==undefined&&typeof input.token!=='string'))throw duelError(400,'New rooms do not accept a room code or client configuration');
   if(!env.BUBBLE_CREATE_LIMITER)throw duelError(503,'Room creation is temporarily unavailable');
   const quota=await env.BUBBLE_CREATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unavailable'});
   if(!quota.success)throw duelError(429,'Too many rooms created. Try again later');
   for(let i=0;i<10;i++){const code=randomBubbleCode(),stub=env.BUBBLE_ROOMS.get(env.BUBBLE_ROOMS.idFromName(code));const response=await stub.fetch(new Request(`${url.origin}/api/bubble/rooms/${code}/internal-create`,{method:'POST'}));if(response.status!==409)return response;}
   throw duelError(503,'Could not generate a new room code');
  }
  const match=route.match(/^\/api\/bubble\/rooms\/([A-Z0-9]{6})(?:\/(join|actions))?$/);
  if(match)return env.BUBBLE_ROOMS.get(env.BUBBLE_ROOMS.idFromName(match[1])).fetch(request);
  throw duelError(404,'Endpoint not found');
 }catch(e){return bubbleFailure(e);}
}
