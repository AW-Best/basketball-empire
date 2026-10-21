import {neighbors} from '../engine.js';
import {COMBAT,RULES} from '../duel-lab/Constants.js';
export function syncAttack(event,room,seat){
 const target=event.seat===seat?(seat==='A'?'B':'A'):seat;
 if(!event.attackId)return event;
 const resumes=room.events.filter(e=>e.type==='resume'&&e.id>(event.resumeId??event.id??0)&&e.at>=event.at),pausedMs=resumes.reduce((n,e)=>n+(e.pausedMs??0),0),resumeId=Math.max(event.resumeId??event.id??0,...resumes.map(e=>e.id));
 const active=room.presentation?.attacks.find(a=>a.attackId===event.attackId);
 const packet=room.players[target].incoming.find(a=>a.id===event.attackId),landed=room.events.find(e=>e.type==='garbage'&&e.attackId===event.attackId),initialCount=event.initialCount??event.count,count=packet?.count??active?.count??landed?.count??0;
 return {...event,initialCount,count,resumeId,blocked:initialCount>0&&count===0,at:packet?.displayed?packet.sourceAt:packet?packet.dueAt-(event.warningMs??(RULES.attackWindupMs+(event.impactMs??COMBAT.impactAt))):active?active.sourceAt:event.at+pausedMs};
}
export function dunkCue(event,now,own=false,name='Rival'){
 const age=now-event.at,stage=age<0?'waiting':age<RULES.attackWindupMs?'warning':age<RULES.attackWindupMs+(event.durationMs??RULES.dunkMs)?'slam':'done';
 const message=event.blocked?(own?'Your rival blocked this attack':'You blocked the whole attack'):event.count===0?(own?'Bottom row cleared. No extra junk sent':'Rival cleared their row. No incoming junk'):(own?`Dunk incoming for ${name}!`:`${name} is sending you a Dunk!`);
 return {stage,number:Math.max(1,Math.ceil((RULES.attackWindupMs-age)/1000)),progress:Math.max(0,Math.min(1,age/RULES.attackWindupMs)),message};
}
export function attackCopy(event,own){
 const count=event.count??4;
 return {direction:own?'YOU → RIVAL':'RIVAL → YOU',title:count?(own?'DUNK!':'INCOMING!'):event.blocked?(own?'BLOCKED!':'BLOCK!'):(own?'ROW CLEAR!':'RIVAL CLEAR!'),detail:count?(own?`Row cleared! Sending ${count} junk to rival`:`${count} junk incoming · Pop 3 to block 1`):event.blocked?(own?'Rival blocked the attack · Your row is cleared':'All blocked · No incoming junk'):(own?'Queue full · Your bottom row is cleared':'Rival cleared their row · No extra junk')};
}
export function hazardHint(gray,pending,displayed=0){if(displayed)return `${displayed} junk waiting for your bubble to land`;return pending?`Rival junk pending: ${pending} · Pop 3 at once to block 1`:gray?`Rival junk ×${gray} · Match 3 beside it to break it`:'Match 3 → Charge → DUNK';}
export function hazardTargets(board){
 const out=new Map();board.forEach((line,r)=>line.forEach((v,c)=>{if(v!==-1)return;for(const [row,col]of neighbors(r,c))if(board[row][col]!==null&&board[row][col]>=0)out.set(`${row}:${col}`,{row,col});}));return [...out.values()];
}
export class CombatFeedback {
 constructor(seat){this.seat=seat;this.reset();}
 reset(){this.event=null;this.last=null;}
 play(event){
  if(this.last&&(event.roundId<this.last.roundId||(event.roundId===this.last.roundId&&event.id<=this.last.id)))return false;
  let copy;if(event.type==='dunk')copy={...attackCopy(event,event.seat===this.seat),kind:event.seat===this.seat?'attack':'incoming'};
  if(event.seat===this.seat){
   if(event.type==='block')copy={title:'BLOCK!',detail:`Blocked ${event.count} incoming junk`,kind:'block'};
   if(event.type==='garbage')copy={title:'',detail:`Junk +${event.count} · Match beside it to break it`,kind:'incoming'};
   if(event.type==='pop'&&event.normal>0)copy={title:event.gray?'CRACK!':event.normal>=6?'BIG CLEAR!':`${event.normal} POP!`,detail:`+${event.normal*RULES.pointsPerBall} pts · +${event.energy} energy${event.gray?` · ${event.gray} junk broken`:''}`,kind:event.gray?'block':'clear'};
  }
  if(!copy)return false;this.last={id:event.id,roundId:event.roundId};this.event={...event,...copy};return true;
 }
 sample(now,reduced=false){const e=this.event,age=e?now-e.at:Infinity;return {placement:'hud',active:e?.type!=='garbage'&&age>=0&&age<COMBAT.noticeMs,age,motion:!reduced,title:e?.title??'',detail:e?.detail??'',kind:e?.kind??'clear'};}
}
