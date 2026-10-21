export function actionId(){return globalThis.crypto?.randomUUID?.()??`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;}
export class NetworkRoomStore{
 constructor({roomId,seat,token,fetcher=globalThis.fetch.bind(globalThis),now=Date.now,...initial}){
  Object.assign(this,{roomId,seat,token,fetcher,localNow:now});this.mode='network';this.offset=0;this.clockSample=null;this.lastRevision=-1;this.serverStamp=-Infinity;this.capabilities={moves:false,cinematic:false,charge:false};this.sync(initial,0);
 }
 sync(data,latency=0){
  const at=this.localNow(),revision=data.room?.revision,stamp=data.serverNow??this.serverStamp;
  if(Number.isFinite(revision)&&(revision<this.lastRevision||(revision===this.lastRevision&&stamp<this.serverStamp)))return;
  if(data.room)this.snapshotRoom=data.room;if(Number.isFinite(revision))this.lastRevision=revision;this.serverStamp=stamp;
  if(Number.isFinite(data.serverNow))this.offset=data.serverNow+latency-at;
  if(data.capabilities)this.capabilities={...this.capabilities,...data.capabilities};
  if(!Number.isFinite(data.gameNow))return;
  const paused=data.room?.phase==='paused',cinematic=!!data.room?.presentation;
  const visual=data.visualNow??data.gameNow,remaining=data.cinemaRemainingMs??0;
  this.clockSample={at,game:data.gameNow+(paused||cinematic?0:latency),visual:visual+(paused?0:latency),remaining:Math.max(0,remaining-(paused?0:latency)),visualEnd:visual+remaining,paused,cinematic};
 }
 now(){const s=this.clockSample;return s?s.game+(s.paused||s.cinematic?0:Math.max(0,this.localNow()-s.at)):this.localNow()+this.offset;}
 visualNow(){const s=this.clockSample;return s?.cinematic?Math.min(s.visualEnd,s.visual+(s.paused?0:Math.max(0,this.localNow()-s.at))):this.now();}
 cinemaRemaining(){const s=this.clockSample;return s?.cinematic?Math.max(0,s.remaining-(s.paused?0:Math.max(0,this.localNow()-s.at))):0;}
 async send(type,extra={}){
  const id=actionId(),tick=type==='TICK',url=`/api/bubble/rooms/${this.roomId}${tick?'':'/actions'}`;let last;
  for(let attempt=0;attempt<2;attempt++){
   const started=this.localNow();try{
    const response=await this.fetcher(url,{method:tick?'GET':'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${this.token}`},body:tick?undefined:JSON.stringify({type,id,roundId:extra.roundId,angle:extra.angle,move:extra.move,rematchVersion:extra.rematchVersion}),cache:'no-store',signal:AbortSignal.timeout(4000)});
    const data=await response.json();if(!response.ok){const error=new Error(data.error||'Connection interrupted');error.fatal=response.status===401||response.status===404;error.status=response.status;throw error;}
    this.sync(data,(this.localNow()-started)/2);return this.snapshotRoom??data.room;
   }catch(error){last=error;if(error.status&&error.status<500)break;}
  }throw last;
 }
}
