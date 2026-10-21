import {createSlamScene} from '../duel-lab/slam/scene.mjs';
import {PreviewClock} from './clock.mjs';
const params=new URLSearchParams(location.search),session=params.get('session'),id='classic';
let origin=null;try{const url=new URL(params.get('parentOrigin'));const loop=new Set(['localhost','127.0.0.1','[::1]']);if(['http:','https:'].includes(url.protocol)&&(url.hostname===location.hostname||(loop.has(url.hostname)&&loop.has(location.hostname))))origin=url.origin;}catch{}
const scene=createSlamScene(document.querySelector('#scene')),clock=new PreviewClock(),reduced=matchMedia('(prefers-reduced-motion: reduce)');scene.setOwn(true);scene.setAttackCount(4);scene.setActive(false);scene.render(1500);
const send=data=>{if(origin&&session&&parent!==window)parent.postMessage({channel:'bubble-court',id,session,...data},origin);};
window.addEventListener('message',e=>{const d=e.data;if(e.origin!==origin||e.source!==parent||!session||d?.channel!=='bubble-court'||d.id!==id||d.session!==session)return;if(d.type==='start'){clock.speed(d.speed);clock.start();}if(d.type==='pause')clock.pause(d.paused===true);if(d.type==='speed')clock.speed(d.speed);});
let lastSent=-Infinity,lastRendered=1500;
function frame(now){const done=clock.step(now);if(clock.phase!=='idle'){scene.setActive(clock.phase==='playing'||clock.phase==='paused');const pose=reduced.matches?1090:clock.time*1000;if(pose!==lastRendered){scene.render(pose);lastRendered=pose;}if(now-lastSent>80||done){lastSent=now;send({type:'progress',time:clock.time,duration:1.5,status:clock.phase==='finished'?'双手重扣完成':clock.phase==='paused'?'已暂停':'脑后蓄力 → 翻腕下扣 → 贯网落地'});}if(done){send({type:'complete'});return;}}requestAnimationFrame(frame);}
document.addEventListener('visibilitychange',()=>{clock.last=null;});
if(origin&&session&&parent!==window){send({type:'ready'});requestAnimationFrame(frame);}else document.querySelector('#message').hidden=false;
