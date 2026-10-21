import {CLOSEUP as F} from '../../duel-lab/Constants.js';
import {sample as windmill} from './windmill/motion.mjs';
import {sample as cat} from './cat/motion.mjs';
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
export function focusCamera(id,ms){
 const config=F[id];if(!config)return {x:F.width/2,y:F.height/2,zoom:1};
 const anchors=config.anchors,t=Math.max(0,ms),last=anchors.at(-1);
 if(config.followAt!==undefined&&t>=config.followAt){const ball=(id==='cat'?cat:windmill)(t/1000).ball,camera={x:ball.x+config.offset.x,y:ball.y+config.offset.y,zoom:last[3]},wide=config.wide??camera,v=smooth((t-(config.wideAt??config.impactAt))/(config.impactAt-(config.wideAt??config.impactAt)+.0001)),u=smooth((t-(config.recoverAt??config.impactAt))/(config.settleAt-(config.recoverAt??config.impactAt)));const frame={x:camera.x+(wide.x-camera.x)*v,y:camera.y+(wide.y-camera.y)*v,zoom:camera.zoom+(wide.zoom-camera.zoom)*v};return {x:frame.x+(config.settle.x-frame.x)*u,y:frame.y+(config.settle.y-frame.y)*u,zoom:frame.zoom+(config.settle.zoom-frame.zoom)*u};}
 let a=anchors[0],b=a;for(const point of anchors){if(point[0]<=t)a=point;else{b=point;break;}b=a;}
 const u=a===b?0:smooth((t-a[0])/(b[0]-a[0]));return {x:a[1]+(b[1]-a[1])*u,y:a[2]+(b[2]-a[2])*u,zoom:a[3]+(b[3]-a[3])*u};
}
// The battle edit keeps the paw in a raised recovery pose after its follow-through.
export function focusPaw(ms){const p=F.cat.paw,original=cat(ms/1000).paw;if(ms<=p.from)return original;const start=cat(p.from/1000).paw,u=smooth((ms-p.from)/(p.to-p.from));return {x:start.x+(p.x-start.x)*u,y:start.y+(p.y-start.y)*u};}
export function applyFocus(ctx,camera){ctx.translate(F.width/2,F.height/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);}
export function projectFocusPoint(id,ms,point,width,height){
 const c=focusCamera(id,ms),scale=Math.min(width/F.width,height/F.height);
 return {x:(width-F.width*scale)/2+(F.width/2+(point.x-c.x)*c.zoom)*scale,y:(height-F.height*scale)/2+(F.height/2+(point.y-c.y)*c.zoom)*scale};
}
