import {projectFocusPoint} from './moves/focus.mjs';
import {getAttackTiming} from './attack-timing.mjs';
export {getAttackTiming} from './attack-timing.mjs';
export {focusCamera,projectFocusPoint} from './moves/focus.mjs';
import {sample as catPose} from './moves/cat/motion.mjs';
import {sample as holePose} from './moves/blackhole/motion.mjs';
import {ATTACK_POSES,SPECTACLE,STUDIO} from '../duel-lab/Constants.js';
// Native time domains remain available to the historical demos and LAN mode.
// DEMO01 retimes the battle edits independently of the historical full clips.
export const MOVES=Object.freeze([
 {id:'classic',name:'双手重扣',glyph:'01',accent:'#77e9c4',durationMs:1500,impactMs:800,summary:'脑后蓄力 · 翻腕砸筐'},
 {id:'windmill',name:'风车扣篮',glyph:'↻',accent:'#ff9756',durationMs:6000,impactMs:4400,summary:'持球回环 · 跨场飞击'},
 {id:'blackhole',name:'黑洞暴扣',glyph:'◉',accent:'#bd9aff',durationMs:8000,impactMs:6200,summary:'空间穿越 · 陨石坠落'},
 {id:'cat',name:'巨猫拍球',glyph:'ฅ',accent:'#f69baa',durationMs:7000,impactMs:4500,summary:'巨爪蓄力 · 肉垫重拍'}
].map(m=>Object.freeze({...m,windupMs:3000,energy:100,garbage:4})));
export const getMove=id=>MOVES.find(m=>m.id===id)??MOVES[0];
export function openMovePicker(room,seat,now){const p=room?.players[seat];return room?.phase==='playing'&&!room.presentation&&p?.energy>=100&&!p.flight&&now>=p.dunkUntil?{roundId:room.roundId}:null;}
export function chooseMove(ticket,id,room,seat,now){return ticket&&ticket.roundId===room.roundId&&MOVES.some(m=>m.id===id)&&openMovePicker(room,seat,now)?{move:id,roundId:ticket.roundId}:null;}

const SLOW=Object.freeze({classic:{from:600,to:1000,speed:.4},windmill:{from:1900,to:2600,speed:.45},blackhole:{from:5000,to:5550,speed:.4},cat:{from:2600,to:3050,speed:.45}});
function presentationTime(ms,slow){return ms<=slow.from?ms:ms<=slow.to?slow.from+(ms-slow.from)/slow.speed:ms+(slow.to-slow.from)*(1/slow.speed-1);}
export function getPresentationMove(id){const m=getMove(id),slow=SLOW[m.id];const warpedDurationMs=presentationTime(m.durationMs,slow);return {...m,sourceDurationMs:m.durationMs,sourceImpactMs:m.impactMs,slow,warpedDurationMs,durationMs:SPECTACLE.clipMs,impactMs:presentationTime(m.impactMs,slow)*SPECTACLE.clipMs/warpedDurationMs};}
export function sourceTime(id,elapsed){const m=getPresentationMove(id),s=m.slow,ms=Math.max(0,Math.min(m.durationMs,elapsed))*m.warpedDurationMs/m.durationMs,end=presentationTime(s.to,s);if(elapsed>=m.durationMs)return m.sourceDurationMs;return ms<=s.from?ms:ms<=end?s.from+(ms-s.from)*s.speed:ms-(s.to-s.from)*(1/s.speed-1);}

// Each special completes its release and hit before holding; legacy clips keep their native clock.
export const getCinematicDuration=id=>getAttackTiming(id).clipMs;
export function attackSourceTime(id,elapsed){
 const move=getMove(id),p=ATTACK_POSES[move.id],t=Math.max(0,elapsed),timing=getAttackTiming(move.id);
 if(timing.sourceAnchors){let prev=timing.sourceAnchors[0];for(const next of timing.sourceAnchors.slice(1)){if(t<=next[0])return prev[1]+(next[1]-prev[1])*(t-prev[0])/(next[0]-prev[0]);prev=next;}return prev[1];}
 if(t<=SPECTACLE.contactMs)return p.contact*t/SPECTACLE.contactMs;
 if(move.id==='classic')return p.contact+(p.hold-p.contact)*Math.min(1,(t-SPECTACLE.contactMs)/(STUDIO.classic.sourceEnd-SPECTACLE.contactMs));
 if(t<=SPECTACLE.releaseImpactMs)return p.contact+(move.impactMs-p.contact)*(t-SPECTACLE.contactMs)/(SPECTACLE.releaseImpactMs-SPECTACLE.contactMs);
 return move.impactMs+(p.hold-move.impactMs)*Math.min(1,(t-SPECTACLE.releaseImpactMs)/(SPECTACLE.releaseEndMs-SPECTACLE.releaseImpactMs));
}
export function attackOrigin(id,width,height,{actionOnly=false}={}){if(actionOnly&&getMove(id).id!=='classic'){const p=ATTACK_POSES[getMove(id).id];return projectFocusPoint(getMove(id).id,p.contact,p,width,height);}const key=getMove(id).id,p=ATTACK_POSES[key];let x=p.x,y=p.y-(p.top??0);const camera=key==='blackhole'?holePose(p.contact/1000).camera:key==='cat'?catPose(p.contact/1000).camera:null;if(camera){x=560+(p.x-camera.x)*camera.zoom;y=290+(p.y-camera.y)*camera.zoom;}const scale=Math.min(width/p.width,height/p.height);return {x:(width-p.width*scale)/2+x*scale,y:(height-p.height*scale)/2+y*scale};}
