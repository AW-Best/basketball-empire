import {PreviewClock} from './clock.mjs';
import {MoveCourt} from './runtime/duel/move-court.mjs';
import {MOVES,getMove,getAttackTiming,getCinematicDuration} from './runtime/duel/moves.mjs';
import {AttackSpectacle,sampleSpectacle} from './runtime/duel/spectacle.mjs';
import {MOTION_LAB as CONFIG,STUDIO} from './runtime/duel-lab/Constants.js';
import {MovePlaylist} from './playlist.mjs';
import {impactPoint,transferTargets} from './runtime/duel/moves/studio-art.mjs';
import {projectFocusPoint} from './runtime/duel/moves/focus.mjs';

const $=id=>document.getElementById(id),stage=$('stage'),court=new MoveCourt($('scene')),fx=new AttackSpectacle(stage,{zIndex:4});
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),params=new URLSearchParams(location.search);
let selected=MOVES.some(m=>m.id===params.get('move'))?params.get('move'):CONFIG.defaultMove;
const clock=new PreviewClock(getCinematicDuration(selected));
const playlist=new MovePlaylist(MOVES.map(m=>m.id));
let sequence=0,raf=null,lastPaint=-Infinity;
stage.style.setProperty('--target-x',`${CONFIG.target.x*100}%`);stage.style.setProperty('--target-y',`${CONFIG.target.y*100}%`);

function cancelFrame(){if(raf!==null)cancelAnimationFrame(raf);raf=null;}
function keyPoints(){const t=getAttackTiming(selected);return [
 ['start','起势',0],['contact','接触',t.contactMs],['flight','出球',t.contactMs+250],['transfer','传出',STUDIO[selected==='classic'?'classic':'special'].transferAt],
 ['impact',t.impactBurstMs?'爆破慢放':'干扰到达',t.releaseImpactMs+(t.impactBurstMs??0)*.35],['settle','收势',t.releaseEndMs]
 ];}
function rebuildKeys(){
  $('keyframes').replaceChildren();for(const [key,label,at]of keyPoints()){const button=document.createElement('button');button.type='button';button.dataset.key=key;button.textContent=label;button.title=`${(at/1000).toFixed(2)} 秒`;button.onclick=()=>{stopPlaylist();pause();clock.seek(at,performance.now());paint(true);};$('keyframes').append(button);}
}
function paint(force=false){
 const t=getAttackTiming(selected),elapsed=clock.time,count=$('show-fx').checked?CONFIG.count:0;
 if(force){court.frameKey=null;court.sourceKey=null;}
 court.moment.count=count;court.draw(Math.min(elapsed,t.clipMs-.01));
 const origin=court.origin(),rect=stage.getBoundingClientRect(),targets=transferTargets(rect.width,rect.height),canvasRect=court.canvas.getBoundingClientRect(),projected=projectFocusPoint(selected,getMove(selected).impactMs,impactPoint(selected),canvasRect.width,canvasRect.height);
 const options={move:selected,count,own:true,from:{x:origin.x-rect.left,y:origin.y-rect.top},impactFrom:{x:canvasRect.left-rect.left+projected.x,y:canvasRect.top-rect.top+projected.y},to:targets,reduced:reduced.matches};
 for(const [i,node]of [...$('target').querySelectorAll('i')].entries()){node.style.left=`${targets[i].x}px`;node.style.top=`${targets[i].y}px`;}
 const sample=$('show-fx').checked?fx.render(elapsed,t.contactMs,options):(fx.clear(),sampleSpectacle(elapsed,t.contactMs,options));
 const phase=elapsed>=t.clipMs?'完成':sample.stage==='clip'?'起势 / 蓄力':sample.stage==='burst'?(elapsed>t.contactMs+320?'贯网 / 松手':'接触 · 闪电'):sample.stage==='flight'?'原球飞行':sample.stage==='impact'?'命中 · 慢爆与干扰传出':elapsed<t.releaseEndMs?'收势':'短暂停留';
 if($('phase').textContent!==phase)$('phase').textContent=phase;
 stage.dataset.move=selected;stage.dataset.playing=String(clock.playing);stage.dataset.phase=sample.stage;stage.dataset.time=String(Math.round(elapsed));
 $('timeline').value=String(elapsed);$('timeline').max=String(t.clipMs);$('timeline').setAttribute('aria-valuetext',`${(elapsed/1000).toFixed(2)}秒，共${t.clipMs/1000}秒`);
 $('time').value=`${(elapsed/1000).toFixed(2)} / ${(t.clipMs/1000).toFixed(2)} 秒`;
 $('play').textContent=clock.playing?'Ⅱ 暂停':elapsed>=t.clipMs?'▶ 再播放':'▶ 播放';
 $('play-state').textContent=reduced.matches?'减少动态效果 · 可拖动检查':clock.playing?'播放中':elapsed>=t.clipMs?'播放完成 · 可重播':'已暂停 · 可拖动检查';
 $('target').hidden=!$('show-fx').checked;
 $('playlist').textContent=playlist.active?'■ 停止连播':'▶ 四招连播';$('playlist').setAttribute('aria-pressed',String(playlist.active));
 for(const button of document.querySelectorAll('[data-speed]'))button.setAttribute('aria-pressed',String(Number(button.dataset.speed)===clock.speed));
}
function frame(now){raf=null;clock.step(now);if(now-lastPaint>=1000/CONFIG.fps||!clock.playing){lastPaint=now;paint();}if(!clock.playing&&playlist.active){const next=playlist.advance($('loop').checked);if(next){selectMove(next,true,false);return;}paint();}if(clock.playing)raf=requestAnimationFrame(frame);}
function play(){if(reduced.matches)return;clock.play(performance.now());paint();if(raf===null)raf=requestAnimationFrame(frame);}
function pause(){cancelFrame();clock.pause(performance.now());paint();}
function stopPlaylist(){playlist.stop();clock.loop=$('loop').checked&&!reduced.matches;}
function selectMove(id,autoplay=true,manual=true){
 if(manual)stopPlaylist();
 cancelFrame();selected=getMove(id).id;const t=getAttackTiming(selected);clock.reset(t.clipMs);lastPaint=-Infinity;fx.clear();court.reset();court.play({id:++sequence,roundId:1,at:0,move:selected,durationMs:t.clipMs,impactMs:t.contactMs,cinematicFx:true,count:CONFIG.count},true);
 $('move-name').textContent=getMove(selected).name;$('move-number').textContent=String(MOVES.findIndex(m=>m.id===selected)+1).padStart(2,'0');
 stage.style.setProperty('--move-accent',getMove(selected).accent);
 $('stage-note').textContent=t.impactBurstMs?'完整动作 → 命中慢爆 → 四颗干扰传出':'脑后蓄力 → 翻腕砸筐 → 干扰传出';
 for(const button of document.querySelectorAll('[data-move]'))button.setAttribute('aria-pressed',String(button.dataset.move===selected));
 const url=new URL(location.href);url.search='';url.searchParams.set('move',selected);history.replaceState(null,'',url);rebuildKeys();
 if(reduced.matches)clock.seek(t.contactMs,performance.now());paint(true);if(autoplay&&!reduced.matches)play();
}

try{
 await court.ready;
 for(const [i,move]of MOVES.entries()){
  const button=document.createElement('button');button.type='button';button.dataset.move=move.id;button.setAttribute('aria-pressed','false');
  const number=document.createElement('i');number.textContent=String(i+1).padStart(2,'0');const name=document.createElement('b');name.textContent=move.name;const note=document.createElement('span');note.textContent=`${getCinematicDuration(move.id)/1000}秒 · ${getAttackTiming(move.id).impactBurstMs?'末端爆破慢放':'双手重扣'}`;
  button.append(number,name,note);button.disabled=court.failed.has(move.id);button.onclick=()=>selectMove(move.id);$('move-options').append(button);
 }
 $('play').disabled=false;$('replay').disabled=false;$('lab').setAttribute('aria-busy','false');
 $('play').onclick=()=>clock.playing?pause():play();
 $('replay').onclick=()=>selectMove(selected);
 $('playlist').onclick=()=>{if(playlist.active){stopPlaylist();pause();}else if(!reduced.matches){const first=playlist.start();clock.loop=false;selectMove(first,true,false);}};
 $('timeline').oninput=()=>{const time=Number($('timeline').value);stopPlaylist();pause();clock.seek(time,performance.now());paint(true);};
 for(const button of document.querySelectorAll('[data-speed]'))button.onclick=()=>{clock.setSpeed(Number(button.dataset.speed),performance.now());paint();};
 $('show-fx').onchange=()=>{fx.clear();paint(true);};
 $('loop').onchange=()=>{if(reduced.matches)$('loop').checked=false;clock.loop=!playlist.active&&$('loop').checked;};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopPlaylist();pause();$('play-state').textContent='已暂停：页面进入后台，返回后点播放继续';}});
 reduced.addEventListener('change',()=>{stopPlaylist();pause();if(reduced.matches){clock.loop=false;$('loop').checked=false;clock.seek(getAttackTiming(selected).contactMs,performance.now());}paint(true);});
 window.addEventListener('resize',()=>paint(true));window.addEventListener('pagehide',()=>{pause();});
 selectMove(selected);
}catch(error){cancelFrame();$('phase').textContent='动作加载失败';$('play-state').textContent=error.message||'请刷新重试';$('lab').setAttribute('aria-busy','false');}
