import {PlayerCourt} from './player-court.js';
import {PLAYER} from './player-config.js';
const R={dunkMs:PLAYER.duration};
import {samplePlayer} from './player-motion.js';
const $=id=>document.getElementById(id),court=new PlayerCourt($('court')),systemReduced=matchMedia('(prefers-reduced-motion: reduce)');
const labels={gather:'屈膝蓄势 · 双手持球',jump:'起跳 · 举球上篮',dunk:'扣篮 · 压球入筐',hang:'抓筐 · 身体自然下垂',fall:'松手 · 准备落地',land:'落地 · 屈膝缓冲',idle:'站稳 · 动作结束'};
let raf=0,generation=0,serial=0,own=true,progress=0,rate=1,playing=false,start=0;
$('quiet').checked=systemReduced.matches;
function render(ms){progress=Math.max(0,Math.min(R.dunkMs,ms));court.reduced={matches:$('quiet').checked};court.draw(progress);const p=samplePlayer(progress/R.dunkMs,$('quiet').checked);$('phase').textContent=labels[p.phase];$('time').value=`${Math.round(progress)} / ${R.dunkMs} ms`;$('timeline').value=Math.round(progress);$('source').textContent=own?'TEAL / 07':'ORANGE / 07';$('attack-note').textContent='完整队员 · 独立动作预览';}
function stop(){cancelAnimationFrame(raf);generation++;playing=false;}
function stage(){court.reset();court.play({id:++serial,roundId:0,at:0},own);}
function play(speed=1){stop();stage();rate=speed;playing=true;start=performance.now();const token=generation;render(0);const frame=now=>{if(token!==generation)return;render((now-start)*rate);if(progress<R.dunkMs){raf=requestAnimationFrame(frame);}else playing=false;};raf=requestAnimationFrame(frame);}
$('replay').addEventListener('click',()=>play());$('slow').addEventListener('click',()=>play(.5));
$('role').addEventListener('click',()=>{own=!own;$('role').textContent=own?'换橙色球衣':'换青绿球衣';play();});
$('timeline').addEventListener('input',e=>{stop();if(!court.moment)stage();render(Number(e.target.value));});
document.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',()=>{stop();if(!court.moment)stage();render(Number(button.dataset.time));}));
$('quiet').addEventListener('change',()=>{stop();stage();render(900);});
systemReduced.addEventListener('change',()=>{$('quiet').checked=systemReduced.matches;stop();stage();render(900);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();render(progress);} });
window.addEventListener('pagehide',()=>{stop();court.reset();});window.addEventListener('pageshow',e=>{if(e.persisted){stage();render(900);}});
new ResizeObserver(()=>render(progress)).observe($('court'));
play();
