import {BubbleDuelSession,ROOM_TTL,duelError} from '../src/bubble-duel-session.mjs';
import {bubbleJSON,bubbleFailure,handleBubbleSession,checkBubbleOrigin} from '../src/bubble-duel-http.mjs';
const RECORD='bubble-session-v1';
export class BubbleDuelRoom{
 constructor(ctx,env){this.ctx=ctx;this.env=env;this.session=null;this.queue=Promise.resolve();this.ready=ctx.blockConcurrencyWhile(async()=>{const record=await ctx.storage.get(RECORD);if(record)this.session=new BubbleDuelSession(record.room.roomId,{record});});}
 fetch(request){const run=this.queue.then(()=>this.handle(request));this.queue=run.catch(()=>{});return run;}
 async expire(){this.session=null;await this.ctx.storage.deleteAll();await this.ctx.storage.deleteAlarm();}
 alarm(){const run=this.queue.then(async()=>{await this.ready;if(!this.session)return;const expires=this.session.touched+ROOM_TTL;if(Date.now()>=expires)await this.expire();else await this.ctx.storage.setAlarm(expires);});this.queue=run.catch(()=>{});return run;}
 async handle(request){
  await this.ready;
  try{
   checkBubbleOrigin(request);const wall=Date.now();
   if(this.session&&wall-this.session.touched>=ROOM_TTL)await this.expire();
   const match=new URL(request.url).pathname.match(/^\/api\/bubble\/rooms\/([A-Z0-9]{6})\/internal-create$/);
   let response;
   if(match&&request.method==='POST'){
    if(this.session)throw duelError(409,'Room already exists');this.session=new BubbleDuelSession(match[1]);response=bubbleJSON(this.session.join(),201);
   }else response=await handleBubbleSession(request,this.session);
   if(this.session){await this.ctx.storage.put(RECORD,this.session.export());await this.ctx.storage.setAlarm(this.session.touched+ROOM_TTL);}
   return response;
  }catch(e){return bubbleFailure(e);}
 }
}
