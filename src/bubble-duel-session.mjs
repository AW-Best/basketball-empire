import {createRoom,reduceRoom} from '../public/bubble-court/duel-lab/model.js';
import {MOVES} from '../public/bubble-court/duel/moves.mjs';
const SEATS=['A','B'],PRESENCE=10000;
export const ROOM_TTL=30*60*1000;
export const duelError=(status,message)=>Object.assign(new Error(message),{status});
const tokenValue=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,'0')).join('');
/** Wall presence is independent of the game clock. Both visual and game clocks
 * freeze offline; only the visual clock runs while a server-owned clip plays. */
export class BubbleDuelSession{
 constructor(roomId,{now=Date.now,allowCharge=false,record=null}={}){
  this.now=now;this.allowCharge=allowCharge;
  if(record){Object.assign(this,structuredClone(record));return;}
  const wall=now();Object.assign(this,{room:createRoom(roomId,{cinematic:true,moveSelection:true,pressureMs:35000}),wallAt:wall,gameNow:wall,visualNow:wall,presences:{A:null,B:null},cinemaVisualAt:null,offline:false,touched:wall,seq:0,seenRound:0,seen:[]});
 }
 export(){const {room,wallAt,gameNow,visualNow,presences,cinemaVisualAt,offline,touched,seq,seenRound,seen}=this;return structuredClone({room,wallAt,gameNow,visualNow,presences,cinemaVisualAt,offline,touched,seq,seenRound,seen});}
 seat(token){const seat=SEATS.find(s=>token&&this.room.players[s].token===token);if(!seat)throw duelError(401,'Invalid seat identity');return seat;}
 reduce(action,at=this.gameNow){
  // Presence is owned here, never by reducer timestamps on the frozen game clock.
  const room=structuredClone(this.room);for(const s of SEATS)room.players[s].lastSeen=at;
  this.room=reduceRoom(room,{...action,roundId:action.roundId??room.roundId},at);
 }
 system(type,extra={}){const seat=SEATS.find(s=>this.room.players[s].token);if(seat)this.reduce({type,seat,token:this.room.players[seat].token,id:`server:${++this.seq}`,...extra});}
 advance(wall){
  wall=Math.max(this.wallAt,wall);
  for(let n=0;n<32&&this.wallAt<wall;n++){
   const active=['countdown','playing'].includes(this.room.phase),expiry=active?Math.min(...SEATS.map(s=>(this.presences[s]??-Infinity)+PRESENCE)):Infinity;
   if(this.offline||expiry<=this.wallAt){this.offline=active;this.wallAt=wall;break;}
   const until=Math.min(wall,expiry),delta=until-this.wallAt;
   if(this.room.presentation){
    this.cinemaVisualAt??=this.visualNow;
    const remaining=Math.max(0,this.room.presentation.durationMs-(this.visualNow-this.cinemaVisualAt)),step=Math.min(delta,remaining);
    this.visualNow+=step;this.wallAt+=step;
    if(step>=remaining){const cinemaId=this.room.presentation.id;this.system('END_CINEMA',{cinemaId});this.cinemaVisualAt=null;}
   }else{
    const start=this.gameNow;this.system('TICK',{id:`server:tick:${++this.seq}`});
    this.reduce({type:'TICK',seat:'A',token:this.room.players.A.token,id:`server:advance:${++this.seq}`},start+delta);
    const actual=this.room.presentation?Math.max(0,this.room.presentation.gameAt-start):delta;
    this.gameNow=start+actual;this.visualNow+=actual;this.wallAt+=actual;
    if(this.room.presentation)this.cinemaVisualAt=this.visualNow;
   }
  }
  // Empty lobbies have no authorized seat yet, but their clocks still advance.
  if(this.wallAt<wall){this.visualNow+=wall-this.wallAt;this.gameNow+=wall-this.wallAt;this.wallAt=wall;}
 }
 heartbeat(seat,wall){this.presences[seat]=wall;this.touched=wall;if(this.offline&&SEATS.every(s=>this.presences[s]!==null&&wall-this.presences[s]<PRESENCE))this.offline=false;}
 join(token,wall=this.now()){
  this.advance(wall);let seat=SEATS.find(s=>token&&this.room.players[s].token===token);
  if(!seat){seat=SEATS.find(s=>!this.room.players[s].token);if(!seat)throw duelError(409,'Room is full');if(!['lobby','finished'].includes(this.room.phase))throw duelError(409,'Match in progress');token=tokenValue();this.reduce({type:'JOIN',seat,token,id:`server:join:${++this.seq}`});}
  this.heartbeat(seat,wall);return {...this.view(seat,wall),token};
 }
 snapshot(token,wall=this.now()){const seat=this.seat(token);this.advance(wall);this.heartbeat(seat,wall);return this.view(seat,wall);}
 action(token,input,wall=this.now()){
  const seat=this.seat(token),allowed=['READY','REMATCH','CANCEL_REMATCH','SHOOT','DUNK','TICK',...(this.allowCharge?['CHARGE']:[])];
  if(!input||!allowed.includes(input.type)||typeof input.id!=='string'||!input.id.length||input.id.length>96||!Number.isSafeInteger(input.roundId)||input.roundId<0)throw duelError(400,'Invalid action');
  if(input.type==='SHOOT'&&(!Number.isFinite(input.angle)||Math.abs(input.angle)>1.25))throw duelError(400,'Invalid angle');
  if(input.type==='DUNK'&&input.move!==undefined&&!MOVES.some(m=>m.id===input.move))throw duelError(400,'Invalid move');
  this.advance(wall);
  // A simultaneous click or lost-response retry joins the round already started.
  // Never interpret an old rematch as a request to restart a later finished game.
  if(input.type==='REMATCH'&&input.roundId===this.room.roundId-1&&['countdown','playing'].includes(this.room.phase)){
   this.heartbeat(seat,wall);return this.view(seat,wall);
  }
  if(input.roundId!==this.room.roundId)throw duelError(409,'Round has changed');this.heartbeat(seat,wall);
  if(this.seenRound!==this.room.roundId){this.seenRound=this.room.roundId;this.seen=[];}
  const identity=`${seat}:${input.id}`;
  if(this.seen.includes(identity))return this.view(seat,wall);
  if(input.type==='READY'&&this.room.phase==='finished')throw duelError(409,'Use Play Again to invite your rival. Both must agree');
  if(['REMATCH','CANCEL_REMATCH'].includes(input.type)){
   if(this.room.phase!=='finished')throw duelError(409,'This match has not ended');
   if(!Number.isSafeInteger(input.rematchVersion)||input.rematchVersion<0)throw duelError(409,'Refresh the page before inviting a rematch');
   if(input.rematchVersion!==(this.room.rematchVersion??0))throw duelError(409,'Rematch invite changed. Try the current button');
   if(input.type==='CANCEL_REMATCH'&&!this.room.rematch)throw duelError(409,'No rematch invite is pending');
  }
  if(input.type==='REMATCH'){
   if(SEATS.some(s=>!this.room.players[s].token||this.presences[s]===null||wall-this.presences[s]>=PRESENCE))throw duelError(409,'Rival is offline. Wait for them before a rematch');
  }
  if(this.seen.length>=4096)throw duelError(429,'Too many actions this round');
  if(!this.offline){this.seen.push(identity);this.reduce({type:input.type,seat,token,id:identity,roundId:input.roundId,angle:input.angle,move:input.move,rematchVersion:input.rematchVersion});}

  return this.view(seat,wall);
 }
 view(seat,wall){
  const room=structuredClone(this.room);for(const s of SEATS){room.players[s].lastSeen=this.presences[s]??0;if(s!==seat&&room.players[s].token)room.players[s].token='occupied';}
  if(this.offline){room.resumePhase=room.phase;room.phase='paused';room.pausedAt=this.gameNow;}
  const cinemaRemainingMs=room.presentation?Math.max(0,room.presentation.durationMs-(this.visualNow-this.cinemaVisualAt)):0;
  if(room.presentation)room.presentation.visualAt=this.cinemaVisualAt;
  return {roomId:room.roomId,seat,room,serverNow:wall,gameNow:this.gameNow,visualNow:this.visualNow,cinemaRemainingMs,capabilities:{moves:true,cinematic:true,charge:this.allowCharge}};
 }
}
