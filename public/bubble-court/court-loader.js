import {events,Events} from './EventBus.js?v=9';
/** Keep gameplay available if WebGL2 is blocked, unsupported or lost mid-session. */
export async function createCourt(fallbackCanvas){
 let mode,paused=false,lastPlay=null,generation=0;const host=fallbackCanvas.parentElement,webgl=document.createElement('canvas');webgl.id='street-court';webgl.setAttribute('aria-label','3D street basketball court and dunk animation');host.insertBefore(webgl,fallbackCanvas);
 async function fallback(){const token=++generation;webgl.remove();const {CourtAnimation}=await import('./court.js?v=9');if(token!==generation)return;mode=new CourtAnimation(fallbackCanvas);fallbackCanvas.hidden=false;host.classList.remove('is-3d');host.dataset.renderer='2d';mode.setPaused?.(paused);if(lastPlay)mode.play(lastPlay);}
 try{const {StreetCourt}=await import('./court3d.js?v=9');mode=new StreetCourt(webgl,()=>{fallback().catch(()=>{host.dataset.renderer='unavailable';});});fallbackCanvas.hidden=true;host.classList.add('is-3d');host.dataset.renderer='3d';}catch{await fallback();}
 events.addEventListener(Events.DUNK_END,()=>{lastPlay=null;});host.setAttribute('aria-busy','false');
 return {complete(){lastPlay=null;},play(opts){lastPlay=opts;mode?.play(opts);},reset(){lastPlay=null;mode?.reset();},setPaused(value){paused=value;mode?.setPaused?.(value);}};
}
