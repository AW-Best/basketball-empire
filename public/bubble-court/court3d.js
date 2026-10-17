import * as T from '../vendor/three.module.min.js';
import {buildStreetScene} from './street-scene.js?v=12';
import {renderBudget,renderInterval,DunkClock} from './street-motion.js?v=12';
import {dunkTime} from './effects.js?v=12';
import {STREET,COURT_CAMERA as CAMERA} from './Constants.js?v=12';
import {emit,Events} from './EventBus.js?v=12';

export function createCourtCamera(aspect=2){const camera=new T.PerspectiveCamera(CAMERA.fov,aspect,.1,45);camera.position.set(...CAMERA.position);camera.lookAt(...CAMERA.target);camera.updateMatrixWorld();return camera;}
export class StreetCourt{
 constructor(canvas,onLoss,player){
  this.canvas=canvas;this.clock=new DunkClock();this.paused=false;this.last=0;this.lastRender=0;this.slowCount=0;this.slow=false;this.disposed=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const context=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'low-power'});if(!context)throw new Error('WebGL2 unavailable');
  this.renderer=new T.WebGLRenderer({canvas,context,antialias:false,alpha:false,powerPreference:'low-power'});this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;this.renderer.shadowMap.enabled=false;
  this.art=buildStreetScene(player);this.camera=createCourtCamera();this.base=this.camera.position.clone();
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(this.disposed)return;this.dispose();onLoss();},{once:true});
  this.visibility=()=>{this.last=0;};document.addEventListener('visibilitychange',this.visibility);this.tick=this.tick.bind(this);this.raf=requestAnimationFrame(this.tick);canvas.dataset.renderer='webgl';
 }
 resize(){const rect=this.canvas.getBoundingClientRect(),budget=renderBudget(rect.width,rect.height,devicePixelRatio||1);this.renderer.setSize(budget.width,budget.height,false);this.camera.aspect=rect.width/Math.max(1,rect.height);this.camera.updateProjectionMatrix();this.lastRender=0;}
 play(options={}){if(this.clock.active)return false;this.playback={...options,preview:Boolean(options.preview)};this.art.setDuel(options);this.clock.play(this.playback.preview);this.last=performance.now();return true;}
 reset(){this.clock.reset();this.playback={};this.art.setDuel();this.art.pose(0);this.lastRender=0;}
 setPaused(paused){this.paused=paused;this.last=performance.now();}
 tick(now){if(this.disposed)return;this.raf=requestAnimationFrame(this.tick);if(document.hidden||this.paused){this.last=now;return;}const delta=this.last?Math.min(now-this.last,100):0;this.last=now;const wasActive=this.clock.active;const state=this.clock.advance(delta);const playback={...this.playback,preview:state.preview};if(state.impact)emit(Events.IMPACT,playback);if(state.done)queueMicrotask(()=>emit(Events.DUNK_END,playback));
  if(now-this.lastRender<renderInterval({active:wasActive,slow:this.slow})-.75)return;
  const elapsed=this.lastRender?now-this.lastRender:0;this.lastRender=now;if(wasActive&&!this.slow&&elapsed>STREET.slowFrameMs){if(++this.slowCount>=STREET.slowFrames){this.slow=true;this.resize();}}else if(wasActive)this.slowCount=Math.max(0,this.slowCount-1);
  let t=state.t;if(this.reduced&&this.clock.active)t=(state.impact||this.clock.impacted)? .72:0;else t=dunkTime(t,this.reduced);this.art.pose(t,now/1000);
  this.camera.position.copy(this.base);this.camera.lookAt(...CAMERA.target);if(wasActive&&!this.reduced){const push=Math.sin(state.t*Math.PI)*CAMERA.push;this.camera.position.z-=push;this.camera.position.x-=push*.7;this.camera.lookAt(CAMERA.target[0]+push*.4,CAMERA.target[1]+push*.05,CAMERA.target[2]);}
  if(wasActive&&!this.reduced&&t>=.6&&t<.68){const shock=(1-(t-.6)/.08)*Math.sin((t-.6)*180);this.camera.position.x+=shock*.035;this.camera.position.y+=shock*.018;}
  this.renderer.render(this.art.scene,this.camera);this.canvas.dataset.phase=this.clock.active?(t<.22?'approach':t<.36?'gather':t<.55?'rise':t<.66?'impact':t<.84?'land':'recover'):'idle';
 }
 dispose(){if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.raf);this.observer.disconnect();document.removeEventListener('visibilitychange',this.visibility);this.art.dispose();this.renderer.dispose();}
}
