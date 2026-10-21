import {SlamPlayback} from '../duel-lab/slam/playback.mjs';
import {createSlamScene} from '../duel-lab/slam/scene.mjs';
import {getMove,sourceTime,attackSourceTime,attackOrigin} from './moves.mjs';
export class MovePlayback extends SlamPlayback {
 reset(){super.reset();this.frameKey=null;this.sourceKey=null;}
 play(event,own){const accepted=super.play(event,own);if(accepted)this.frameKey=null;return accepted;}
 sample(now){const m=this.moment,duration=m?.durationMs??1500,ms=m?now-m.at:duration;return {active:!!m&&ms>=0&&ms<duration,ms:Math.max(0,Math.min(duration,ms))};}
 frame(now,reduced=false,visible=true){const p=this.sample(now),m=this.moment;if(!p.active||!visible)return {...p,render:false};const ms=reduced?(m.impactMs??800)+100:Math.floor(p.ms/1000*30)*1000/30,key=`${ms}:${m.count}:${m.own}`;const render=key!==this.frameKey;this.frameKey=key;return {...p,ms,render};}
}
export class MoveCourt extends MovePlayback {
 constructor(host){
  super();this.host=host;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
  this.classicHost=document.createElement('div');this.classicHost.className='classic-move';host.replaceChildren(this.classicHost);
  this.scene=createSlamScene(this.classicHost,{live:true});this.canvas=document.createElement('canvas');this.canvas.className='move-canvas';this.canvas.hidden=true;host.append(this.canvas);this.ctx=this.canvas.getContext('2d');this.scenes=new Map();this.failed=new Set();
  // Small local modules only; no iframe, CDN, model download or private RAF.
  this.ready=Promise.allSettled(['windmill','blackhole','cat'].map(id=>import(`./moves/${id}/scene.mjs`).then(mod=>{this.scenes.set(id,mod.createMoveScene(this.ctx));this.frameKey=null;this.sourceKey=null;}).catch(()=>{this.failed.add(id);})));
 }
 origin(){const node=this.canvas.hidden?this.classicHost:this.canvas,rect=node.getBoundingClientRect(),p=attackOrigin(this.moment?.move,rect.width,rect.height,{actionOnly:!!this.moment?.cinematicFx});return {x:rect.left+p.x,y:rect.top+p.y};}
 draw(now,{visible=true}={}){
  const p=this.frame(now,this.reduced.matches,visible),m=this.moment,move=getMove(m?.move),custom=p.active&&move.id!=='classic'&&this.scenes.has(move.id);
  this.host.dataset.phase=p.active?'playing':'idle';this.host.dataset.move=p.active?move.id:'none';this.host.dataset.owner=p.active?(m.own?'self':'rival'):'none';
  this.host.dataset.fallback=String(p.active&&move.id!=='classic'&&!custom);this.canvas.hidden=!custom;this.classicHost.hidden=custom;
  if(!p.active)return false;
  if(!visible)return true;
  const sourceMs=m.cinematicFx?attackSourceTime(move.id,this.reduced.matches?Infinity:p.ms):m.slowdown?sourceTime(move.id,p.ms):p.ms;
  const sourceKey=`${move.id}:${sourceMs}:${m.count}:${m.own}:${this.canvas.width}:${this.host.clientWidth}`;p.render=p.render&&this.sourceKey!==sourceKey;this.sourceKey=sourceKey;
  if(custom){const width=Math.max(1,Math.round(this.host.clientWidth*Math.min(devicePixelRatio||1,1.5))),height=Math.round(width*580/1120);if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;p.render=true;}if(p.render)this.scenes.get(move.id).render(sourceMs,{count:m.cinematicFx?0:m.count,own:m.own,showPenalty:!m.cinematicFx,quiet:m.cinematicFx,actionOnly:m.cinematicFx});}
  else if(p.render){this.scene.setQuiet?.(m.cinematicFx);this.scene.setOwn(m.own);this.scene.setAttackCount(m.cinematicFx?0:m.count);this.scene.setActive(!m.cinematicFx);this.scene.render(move.id==='classic'?sourceMs:sourceMs/move.durationMs*1500);}
  return true;
 }
}
