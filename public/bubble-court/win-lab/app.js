import {WIN as C} from './Constants.js';
const $=id=>document.getElementById(id),clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
const nodes=Object.fromEntries(['moment','action','impact-rays','arm-outline','forearm','sleeve-outline','sleeve','sleeve-trim','arm-highlight','palm','trail','basketball','fingers','net-outline','net','front-rim','slam','win'].map(id=>[id,$(id)]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let raf=0,generation=0,playing=false;
// All channels sample the same absolute progress, including the intentional impact hold.
function point(keys,t){if(t<=keys[0][0])return keys[0].slice(1);if(t>=keys.at(-1)[0])return keys.at(-1).slice(1);let i=0;while(t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=smooth((t-a[0])/(b[0]-a[0]));return [mix(a[1],b[1],u),mix(a[2],b[2],u)];}
const attr=(name,key,value)=>nodes[name].setAttribute(key,value),opacity=(name,value)=>attr(name,'opacity',clamp(value).toFixed(3));
function netPath(stretch){const top=C.rim.y+3,bottom=top+C.netBase+stretch,width=52+stretch*.20,left=C.rim.x-width/2,right=C.rim.x+width/2;let path='';for(let i=0;i<=10;i++){const x=249+i*8.6,end=left+i*width/10;path+=`M${x} ${top}Q${mix(x,end,.55)} ${mix(top,bottom,.55)} ${end} ${bottom}`;}for(const u of [.30,.62,1]){const y=mix(top,bottom,u),l=mix(249,left,u),r=mix(335,right,u);path+=`M${l} ${y}Q292 ${y+6} ${r} ${y}`;}for(let i=0;i<9;i++){const x=253+i*8.5,end=left+(i+1)*width/10;path+=`M${x} ${top+3}L${end} ${bottom}`;}return path;}
function render(t,quiet=false){
 const [bx,by]=point(C.ball,t),[ex,ey]=point(C.elbow,t),[wx,wy]=t<=C.release?[bx-24,by+10]:point(C.wrist,t);
 const arm=`M-38 455Q12 372 ${ex} ${ey}Q${ex+30} ${ey-9} ${wx} ${wy}`,sleeve=`M-38 455Q10 373 ${ex} ${ey}`;
 attr('arm-outline','d',arm);attr('forearm','d',arm);attr('sleeve-outline','d',sleeve);attr('sleeve','d',sleeve);
 attr('sleeve-trim','d',`M${ex-21} ${ey-14}Q${ex-4} ${ey+9} ${ex+19} ${ey+17}`);attr('arm-highlight','d',`M${ex+10} ${ey-3}Q${ex+37} ${ey-10} ${wx-7} ${wy+2}`);
 attr('palm','transform',`translate(${wx} ${wy})`);attr('fingers','transform',`translate(${bx} ${by})`);opacity('fingers',t<=C.release?1:1-smooth((t-C.release)/.035));
 const squash=t>=C.impact&&t<=C.release? .88:1;attr('basketball','transform',`translate(${bx} ${by}) scale(${1+(1-squash)*.5} ${squash})`);opacity('basketball',1-smooth((t-.64)/.12));
 attr('trail','transform',`translate(${bx} ${by})`);opacity('trail',t>.31&&t<C.impact?Math.sin((t-.31)/(C.impact-.31)*Math.PI)*.8:0);
 let stretch=0;if(t>C.release){const u=clamp((t-C.release)/.31);stretch=C.netStretch*Math.sin(Math.PI*u)*Math.exp(-u*.7);}const path=netPath(stretch);attr('net','d',path);attr('net-outline','d',path);
 const shake=!quiet&&t>C.release&&t<.63?Math.sin((t-C.release)*150)*(1-(t-C.release)/(.63-C.release))*3:0;attr('action','transform',`translate(${shake} ${Math.abs(shake)*.45})`);
 const ray=t>=C.impact?1-smooth((t-.52)/.24):0;opacity('impact-rays',quiet?0:ray);
 const slamIn=smooth((t-.46)/.07),slamScale=t<.54?mix(.6,1.18,slamIn):t<.64?mix(1.18,1,smooth((t-.54)/.1)):1;opacity('slam',slamIn);attr('slam','transform',`translate(86 122) rotate(-8) scale(${quiet?1:slamScale}) translate(-86 -122)`);
 const enter=smooth((t-.64)/.17),winScale=t<.81?mix(.7,1.08,enter):mix(1.08,1,smooth((t-.81)/.13));opacity('win',enter);attr('win','transform',`translate(195 384) rotate(-4) scale(${quiet?1:winScale}) translate(-195 -384)`);
 nodes.moment.dataset.phase=t<C.impact?'wind-up':t<C.release?'impact':t<.64?'net':'victory';nodes.moment.dataset.progress=t.toFixed(3);
}
function settle(message='胜利演出 · 1.5 秒'){cancelAnimationFrame(raf);++generation;playing=false;render(1,true);$('status').textContent=message;}
function play(rate=1){cancelAnimationFrame(raf);const token=++generation;if(reduced.matches||document.hidden){settle('胜利画面 · 已减少动态效果');return;}playing=true;let start=null;render(0);$('status').textContent=rate===1?'扣篮中…':'半速播放 · 看清进筐那一下';
 const frame=now=>{if(token!==generation)return;start??=now;const t=clamp((now-start)/(C.duration/rate));render(t);if(t<1)raf=requestAnimationFrame(frame);else{playing=false;$('status').textContent=rate===1?'胜利演出 · 1.5 秒':'慢放结束 · 正常速度为 1.5 秒';}};raf=requestAnimationFrame(frame);
}
$('replay').addEventListener('click',()=>play(1));$('slow').addEventListener('click',()=>play(.5));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)settle();});reduced.addEventListener('change',()=>{if(reduced.matches)settle('胜利画面 · 已减少动态效果');});window.addEventListener('pagehide',()=>settle());
render(0);play();
