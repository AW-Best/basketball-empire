import {ENDING} from '../duel-lab/Constants.js';
const clamp=value=>Math.max(0,Math.min(1,value));
// UI wall time only. The result is already final; this never changes game state.
export class ResultPresentation {
 constructor(seat){this.seat=seat;this.reset();}
 reset(){this.key=null;this.roundId=null;this.startedAt=null;this.winner=null;}
 observe(room,wallNow){
  if(this.roundId!==room.roundId){this.reset();this.roundId=room.roundId;}
  if(room.phase!=='finished')return;
  const key=`${room.roundId}:${room.winner}`;if(this.key===key)return;
  this.key=key;this.winner=room.winner;this.startedAt=wallNow;
 }
 sample(wallNow,reduced=false){
  if(this.startedAt===null)return {active:false,reveal:false,desaturate:0,dim:0,opacity:0};
  const age=Math.max(0,wallNow-this.startedAt),fade=reduced?(age>=ENDING.reducedMs?1:0):clamp((age-ENDING.holdMs)/ENDING.fadeMs),reveal=age>=(reduced?ENDING.reducedMs:ENDING.revealMs),won=this.winner===this.seat,draw=this.winner==='draw';
  return {active:true,age,reveal,desaturate:fade,dim:fade*ENDING.dim,opacity:reveal?(reduced?1:clamp((age-ENDING.revealMs)/ENDING.revealFadeMs)):0,title:draw?'Draw':won?'Victory':'Defeat',kicker:draw?'DRAW':won?'YOU WIN':'RUN IT BACK',button:'Play Again',kind:draw?'draw':won?'win':'loss'};
 }
}
