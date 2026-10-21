import http from 'node:http';
import {BubbleDuelSession,ROOM_TTL} from './bubble-duel-session.mjs';
import {bubbleJSON,handleBubbleSession,randomBubbleCode} from './bubble-duel-http.mjs';
import {randomBytes,randomUUID} from 'node:crypto';
import {networkInterfaces} from 'node:os';
import {readFile,realpath,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createRoom,reduceRoom} from '../public/bubble-court/duel-lab/model.js';
const PUBLIC=path.resolve(fileURLToPath(new URL('../public/',import.meta.url)));
const TTL=30*60*1000,ALLOWED=new Set(['READY','SHOOT','DUNK','CHARGE','TICK','JOIN']);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.glb':'model/gltf-binary','.jpg':'image/jpeg','.woff2':'font/woff2'};
const error=(status,message)=>Object.assign(new Error(message),{status});
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
async function body(req){
 if(Number(req.headers['content-length'])>8192){req.resume();throw error(413,'Request too large');}
 const bytes=await new Promise((resolve,reject)=>{let length=0,chunks=[],done=false;req.on('data',chunk=>{if(done)return;length+=chunk.length;if(length>8192){done=true;chunks=[];reject(error(413,'Request too large'));return;}chunks.push(chunk);});req.on('end',()=>{if(!done){done=true;resolve(Buffer.concat(chunks));}});req.on('error',()=>{if(!done){done=true;reject(error(400,'Request interrupted'));}});});
 try{const value=JSON.parse(bytes.toString()||'{}');if(!value||Array.isArray(value)||typeof value!=='object')throw Error();return value;}catch{throw error(400,'Invalid JSON');}
}
export function createBubbleServer({now=Date.now,online=true,allowCharge=false}={}){
 const rooms=new Map(),rates=new Map(),onlineRooms=new Map();
 async function onlineRequest(req,url,at){
  for(const [code,session] of onlineRooms)if(at-session.touched>ROOM_TTL)onlineRooms.delete(code);
  const port=server.address().port,urls=[...new Set(Object.values(networkInterfaces()).flat().filter(n=>n&&n.family==='IPv4'&&!n.internal).map(n=>`http://${n.address}:${port}`))];
  if(url.pathname==='/api/bubble/info'&&req.method==='GET')return bubbleJSON({online:true,urls,lanUrls:urls,pressureMs:35000,serverNow:at});
  const input=req.method==='POST'?await body(req):undefined;
  if(url.pathname==='/api/bubble/rooms'&&req.method==='POST'){
   if(Object.keys(input).some(k=>k!=='token')||(input.token!==undefined&&typeof input.token!=='string'))throw error(400,'New rooms do not accept a room code or client configuration');
   if(onlineRooms.size>=64)throw error(503,'Local rooms are full');let code;do{code=randomBubbleCode();}while(onlineRooms.has(code));
   const session=new BubbleDuelSession(code,{now,allowCharge});onlineRooms.set(code,session);return bubbleJSON(session.join(undefined,at),201);
  }
  const match=url.pathname.match(/^\/api\/bubble\/rooms\/([A-Z0-9]{6})(?:\/(join|actions))?$/);if(!match)throw error(404,'Endpoint not found');
  const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value);
  // The adapter already bounded and parsed the Node stream; construct one Fetch request.
  headers.delete('content-length');const request=new Request(`http://${req.headers.host}${url.pathname}`,{method:req.method,headers,...(input===undefined?{}:{body:JSON.stringify(input)})});
  return handleBubbleSession(request,onlineRooms.get(match[1]),{now:()=>at});
 }
 function trim(at){for(const [code,item]of rooms)if(at-item.touched>TTL)rooms.delete(code);for(const [ip,rate]of rates)if(at-rate.at>60000)rates.delete(ip);}
 function heartbeat(item,seat,token,at){item.room=reduceRoom(item.room,{type:'TICK',seat,token,id:randomUUID(),roundId:item.room.roundId},at);item.touched=at;}
 function snapshot(item,seat,at){const room=structuredClone(item.room);for(const s of ['A','B'])if(s!==seat&&room.players[s].token)room.players[s].token='occupied';return {roomId:room.roomId,seat,room,serverNow:at};}
 function join(item,token,at){let seat=['A','B'].find(s=>token&&item.room.players[s].token===token);if(!seat){if(!['lobby','finished'].includes(item.room.phase))throw error(409,'Match in progress. Only existing players can reconnect');seat=['A','B'].find(s=>!item.room.players[s].token);if(!seat)throw error(409,'Room is full');token=randomBytes(24).toString('hex');}item.room=reduceRoom(item.room,{type:'JOIN',seat,token,id:randomUUID(),roundId:item.room.roundId},at);item.touched=at;return {...snapshot(item,seat,at),token};}
 const server=http.createServer(async(req,res)=>{try{
  const at=now();trim(at);const ip=req.socket.remoteAddress||'',rate=rates.get(ip);if(!rate||at-rate.at>1000)rates.set(ip,{at,count:1});else if(++rate.count>160)throw error(429,'Too many requests');
  const url=new URL(req.url,'http://localhost'),route=url.pathname;
  if(req.method==='POST'&&req.headers.origin){let origin;try{origin=new URL(req.headers.origin);}catch{throw error(403,'Origin not allowed');}if(origin.host!==req.headers.host||!['http:','https:'].includes(origin.protocol))throw error(403,'Origin not allowed');}
  if(online&&route.startsWith('/api/bubble/')){const response=await onlineRequest(req,url,at);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;}
  if(route==='/api/bubble/info'&&req.method==='GET'){const port=server.address().port,addresses=Object.values(networkInterfaces()).flat().filter(n=>n&&n.family==='IPv4'&&!n.internal).map(n=>`http://${n.address}:${port}`);return json(res,200,{urls:[...new Set(addresses)],lanUrls:[...new Set(addresses)],serverNow:at});}
  if(route==='/api/bubble/rooms'&&req.method==='POST'){const input=await body(req);let code=input.roomId;if(code!==undefined&&(typeof code!=='string'||!/^[A-Z0-9]{6}$/.test(code)))throw error(400,'Room codes must be 6 uppercase letters or digits');if(!code){do{code=randomBytes(5).toString('hex').slice(0,6).toUpperCase();}while(rooms.has(code));}let item=rooms.get(code);if(!item){if(rooms.size>=64)throw error(503,'Local rooms are full');item={room:createRoom(code),touched:at};rooms.set(code,item);}return json(res,200,join(item,input.token,at));}
  const match=route.match(/^\/api\/bubble\/rooms\/([A-Z0-9]{6})(\/join|\/actions)?$/);if(match){const item=rooms.get(match[1]);if(!item)throw error(404,'Room not found or expired');if(match[2]==='/join'&&req.method==='POST'){const input=await body(req);return json(res,200,join(item,input.token,at));}
   const token=req.headers.authorization?.match(/^Bearer ([a-zA-Z0-9-]+)$/)?.[1],seat=['A','B'].find(s=>token&&item.room.players[s].token===token);if(!seat)throw error(401,'Invalid seat identity');
   if(!match[2]&&req.method==='GET'){heartbeat(item,seat,token,at);return json(res,200,snapshot(item,seat,at));}
   if(match[2]==='/actions'&&req.method==='POST'){const input=await body(req);if(!ALLOWED.has(input.type)||typeof input.id!=='string'||!input.id.length||input.id.length>96||!Number.isSafeInteger(input.roundId)||input.roundId<0)throw error(400,'Invalid action');if(input.type==='SHOOT'&&(!Number.isFinite(input.angle)||Math.abs(input.angle)>1.25))throw error(400,'Invalid angle');if(input.roundId!==item.room.roundId)throw error(409,'Round has changed');heartbeat(item,seat,token,at);item.room=reduceRoom(item.room,{type:input.type,id:`${seat}:${input.id}`,roundId:input.roundId,angle:input.angle,seat,token},at);return json(res,200,snapshot(item,seat,at));}
   throw error(405,'Method not allowed');
  }
  if(route.startsWith('/api/'))throw error(404,'Endpoint not found');if(!['GET','HEAD'].includes(req.method))throw error(405,'Method not allowed');
  let decoded;try{decoded=decodeURIComponent(route);}catch{throw error(404,'File not found');}if(decoded.includes('\\')||decoded.split('/').some(s=>s.startsWith('.')||s==='..')||decoded.includes('\0'))throw error(404,'File not found');let file=path.resolve(PUBLIC,'.'+decoded);if(!file.startsWith(PUBLIC+path.sep)&&file!==PUBLIC)throw error(404,'File not found');try{if((await stat(file)).isDirectory())file=path.join(file,'index.html');const actual=await realpath(file);if(!actual.startsWith(PUBLIC+path.sep))throw Error();const bytes=await readFile(actual);res.writeHead(200,{'Content-Type':mime[path.extname(actual)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes);}catch{throw error(404,'File not found');}
 }catch(e){if(!res.headersSent)json(res,e.status||500,{error:e.status?e.message:'Local service error'});else res.end();}});
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||8780),host=process.env.HOST||'0.0.0.0';createBubbleServer().listen(port,host,()=>console.log(`Bubble duel local server: http://localhost:${port}/bubble-court/duel/`));}
