import {createRoom,reduceRoom} from './model.js';

// Broadcasts are notifications only. Every read-modify-write holds the same
// origin-wide Web Lock, including heartbeat, tick, join and test actions.
export class RoomStore{
 constructor({roomId,seat,token,storage=localStorage,locks=navigator.locks,now=Date.now,notify=()=>{}}){
  if(!locks?.request)throw Error('此浏览器不支持双页房间锁。请用新版 Chrome / Safari 并从 localhost 打开。');
  Object.assign(this,{roomId,seat,token,storage,locks,now,notify});this.key=`hoopire-local-duel-v1:${roomId}`;
 }
 read(){const raw=this.storage.getItem(this.key);return raw?JSON.parse(raw):createRoom(this.roomId);}
 async send(type,extra={}){
  const id=globalThis.crypto?.randomUUID?.()??`${this.token}:${this.now()}:${Math.random()}`;
  return this.locks.request(this.key,()=>{
   const before=this.read(),after=reduceRoom(before,{...extra,type,id,seat:this.seat,token:this.token,roundId:extra.roundId??before.roundId},this.now());
   if(after!==before){this.storage.setItem(this.key,JSON.stringify(after));this.notify({revision:after.revision});}
   return after;
  });
 }
}
