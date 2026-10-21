import {MatchClock} from './match-clock.mjs';
import {MOVES} from './moves.mjs';
import {PRACTICE} from '../duel-lab/Constants.js';
import {createRoom,reduceRoom,currentColor,planShot,resolvePop} from '../duel-lab/model.js';

// A practice opponent uses the same shots, scoring, attacks and loss rules as a person.
// Each store owns its room; DEMO01 never claims a seat on the LAN server.
export class MockRoomStore {
 constructor({now=Date.now}={}){
  this.mode='mock';this.roomId='DEMO01';this.seat='A';this.token='practice-human';
  this.localNow=now;this.clock=new MatchClock(now());this.sequence=0;this.botRound=0;this.nextBotAt=Infinity;
  this.room=createRoom(this.roomId,{pressureMs:PRACTICE.pressureMs,moveSelection:true,cinematic:true});
  this.act('A','JOIN');this.act('B','JOIN');this.act('B','READY');
 }
 now(){return this.clock.now(this.localNow());}
 visualNow(){return this.clock.visualNow(this.localNow());}
 cinemaRemaining(){return this.clock.cinematic?Math.max(0,this.clock.cinematic.endWall-this.localNow()):0;}
 snapshot(){return structuredClone(this.room);}
 act(seat,type,extra={}){
  this.room=reduceRoom(this.room,{seat,token:seat==='A'?this.token:'practice-bot',type,id:`practice-${++this.sequence}`,roundId:this.room.roundId,...extra},this.now());
 }
 async send(type,extra={}){
  const wall=this.localNow();this.clock.advance(wall);
  if(this.clock.done(wall)){this.act('A','END_CINEMA',{cinemaId:this.room.presentation?.id});this.clock.end(wall);this.nextBotAt=this.now()+PRACTICE.recoveryMs;}
  // Refresh both presences; the reducer freezes a long background gap before resuming.
  this.act('A','TICK');this.act('B','TICK');
  if(!this.room.presentation&&['READY','SHOOT','DUNK','CHARGE'].includes(type))this.act('A',type,extra);
  if(type==='PREVIEW_RIVAL'&&this.room.phase==='playing'&&!this.room.presentation&&!this.room.players.B.flight&&this.now()>=this.room.players.B.dunkUntil){this.act('B','CHARGE');this.act('B','DUNK',{move:extra.move??'windmill'});this.nextBotAt=this.now()+PRACTICE.recoveryMs;}
  // Local QA control: advance ordinary row pressure to hit the actual danger line.
  if(type==='PREVIEW_FAILURE'&&this.room.phase==='playing'&&!this.room.presentation&&!this.room.players.A.flight){this.room.players.A.pressure+=12;this.room.nextPressureAt=this.now();this.act('A','TICK');}
  if(['lobby','finished'].includes(this.room.phase)&&!this.room.players.B.ready)this.act('B','READY');
  if(this.botRound!==this.room.roundId){this.botRound=this.room.roundId;this.nextBotAt=this.room.countdownAt+PRACTICE.openingMs;}
  if(this.room.presentation&&!this.clock.cinematic)this.clock.begin(this.room.presentation.gameAt,this.room.presentation.durationMs,wall);
  const bot=this.room.players.B,at=this.now();
  if(type==='TICK'&&this.room.phase==='playing'&&!this.room.presentation&&!bot.flight&&at>=this.nextBotAt){
   if(bot.energy>=100&&at>=bot.dunkUntil){this.act('B','DUNK',{move:MOVES[bot.dunks%MOVES.length].id});this.nextBotAt=at+PRACTICE.recoveryMs;}
   else {const angle=chooseAim(bot);if(angle!==null)this.act('B','SHOOT',{angle});this.nextBotAt=at+PRACTICE.shotMs;}
  }
  return this.snapshot();
 }
}

function chooseAim(player){
 let best=null,score=-Infinity;
 // 31 candidates, once per turn: bounded work for phones, no search tree.
 for(let i=-15;i<=15;i++){
  const angle=i*.08,plan=planShot(player.board,angle);if(!plan.cell)continue;
  const pop=resolvePop(structuredClone(player.board),...plan.cell,currentColor(player));
  const value=pop.normal*10+pop.gray*6-plan.cell[0]*.1;
  if(value>score){score=value;best=angle;}
 }
 return best;
}
