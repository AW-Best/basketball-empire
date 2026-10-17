import * as T from '../../vendor/three.module.min.js';
import {loadSkinnedPlayer} from '../skinned-player.js?v=12';
import {LAB} from './Constants.js';
import {createPairedMotion} from './motion.js';
const $=s=>document.querySelector(s),canvas=$('#scene'),status=$('#load-status'),buttons=[...document.querySelectorAll('button:not(#retry)')];
let renderer,home,pair,scene,camera,observer,raf,disposed=false,time=0,speed=.5,playing=false,last=0,lastRender=0,view='three',slowCount=0,slow=false,needsPaint=true;
const owned=new Set(),markers=[];const own=r=>(owned.add(r),r);
function fail(message){playing=false;status.textContent=message;status.hidden=false;buttons.forEach(b=>b.disabled=true);$('#timeline').disabled=true;$('#retry').hidden=false;}
$('#retry').onclick=()=>location.reload();
function stage(){
 scene=new T.Scene();scene.background=new T.Color(LAB.background);scene.add(new T.HemisphereLight('#ffffff','#b3bdc4',2.1));const key=new T.DirectionalLight('#ffffff',2.3);key.position.set(-2,6,5);scene.add(key);
 const material=(color,extra={})=>own(new T.MeshLambertMaterial({color,...extra}));
 const mesh=(geo,mat)=>{const m=new T.Mesh(own(geo),mat);scene.add(m);return m;};
 const floor=mesh(new T.PlaneGeometry(100,100),material(LAB.floor));floor.rotation.x=-Math.PI/2;floor.position.y=-.012;
 const grid=new T.GridHelper(16,32,LAB.line,LAB.line);grid.position.y=-.008;grid.material.transparent=true;grid.material.opacity=.38;scene.add(grid);owned.add(grid.geometry);owned.add(grid.material);
 const glass=material('#cfdae0',{transparent:true,opacity:.6}),rimMat=material('#b35b3f'),white=own(new T.LineBasicMaterial({color:'#ffffff'}));
 const box=(x,y,z,w,h,d,mat)=>{const m=mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);return m;};
 box(2.1,3.48,-.31,1.22,.80,.055,glass);
 const square=new T.Line(own(new T.BufferGeometry().setFromPoints([[1.85,3.17,-.27],[1.85,3.54,-.27],[2.35,3.54,-.27],[2.35,3.17,-.27],[1.85,3.17,-.27]].map(p=>new T.Vector3(...p)))),white);scene.add(square);
 const rim=mesh(new T.TorusGeometry(.31,.025,6,32),rimMat);rim.rotation.x=Math.PI/2;rim.position.set(...LAB.rim);
 const netPoints=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2,b=a+.28;netPoints.push(new T.Vector3(2.1+Math.cos(a)*.29,3.05,.35+Math.sin(a)*.29),new T.Vector3(2.1+Math.cos(b)*.19,2.62,.35+Math.sin(b)*.19));}scene.add(new T.LineSegments(own(new T.BufferGeometry().setFromPoints(netPoints)),white));
 scene.add(home.root,home.rival.root);
 const ball=mesh(new T.SphereGeometry(LAB.ballRadius,18,12),material('#cf7439'));ball.name='basketball';
 const seamGeo=own(new T.TorusGeometry(LAB.ballRadius,.003,4,32)),seamMat=material('#663d2b');for(let i=0;i<3;i++){const seam=new T.Mesh(seamGeo,seamMat);seam.rotation.set(i===0?Math.PI/2:0,i===1?Math.PI/2:0,i===2?.5:0);ball.add(seam);}
 for(const [side,target] of Object.entries(pair.support)){const ring=mesh(new T.RingGeometry(.07,.085,24),own(new T.MeshBasicMaterial({color:'#168c84',side:T.DoubleSide})));ring.rotation.x=-Math.PI/2;ring.position.copy(target);ring.position.y=.002;ring.visible=false;markers.push(ring);}
 // Small flat shoe contacts serve as positional reference, without a shadow-map pass.
 const shadowGeo=own(new T.CircleGeometry(.16,20)),shadowMat=own(new T.MeshBasicMaterial({color:'#60717c',transparent:true,opacity:.17,depthWrite:false}));const blobs=[];for(const actor of [home,home.rival])for(const side of ['r','l']){const m=new T.Mesh(shadowGeo,shadowMat);m.rotation.x=-Math.PI/2;m.position.y=.001;m.scale.set(1,1.6,1);scene.add(m);blobs.push({m,actor,side});}
 return {ball,blobs};
}
function fitCamera(){
 if(!camera)return;const rect=canvas.getBoundingClientRect();camera.aspect=rect.width/Math.max(1,rect.height);const min=new T.Vector3(...LAB.bounds.min),max=new T.Vector3(...LAB.bounds.max),center=min.clone().add(max).multiplyScalar(.5),back=new T.Vector3(...LAB.views[view]).normalize(),right=new T.Vector3(0,1,0).cross(back).normalize(),up=back.clone().cross(right).normalize(),tan=Math.tan(T.MathUtils.degToRad(LAB.cameraFov/2));let distance=0;
 for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z]){const p=new T.Vector3(x,y,z).sub(center),depth=p.dot(back);distance=Math.max(distance,depth+Math.abs(p.dot(right))/(tan*camera.aspect),depth+Math.abs(p.dot(up))/tan);}
 camera.position.copy(center).addScaledVector(back,distance*1.04);camera.lookAt(center);camera.updateProjectionMatrix();
 const d=Math.min(devicePixelRatio||1,LAB.maxDpr),shrink=Math.min(1,Math.sqrt(LAB.maxPixels/(rect.width*rect.height*d*d)));renderer.setSize(Math.max(1,Math.round(rect.width*d*shrink)),Math.max(1,Math.round(rect.height*d*shrink)),false);lastRender=0;needsPaint=true;
}
let art;
function paint(){needsPaint=false;pair.sample(time/LAB.duration);art.ball.position.copy(pair.ballAt(time/LAB.duration));art.ball.rotation.z=-time*4;for(const {m,actor,side} of art.blobs){const p=actor.rig['foot_'+side].getWorldPosition(new T.Vector3());m.position.x=p.x;m.position.z=p.z;m.visible=p.y<.25;}renderer.render(scene,camera);canvas.dataset.phase=LAB.phases.filter(p=>p.t<=time/LAB.duration).at(-1).label;}
function sync(){const phase=LAB.phases.filter(p=>p.t<=time/LAB.duration).at(-1);$('#phase').textContent=phase.label;$('#phase-note').textContent=phase.note;$('#time').textContent=`${time.toFixed(2)} / ${LAB.duration.toFixed(2)} s`;$('#timeline').value=Math.round(time/LAB.duration*1000);$('#play').textContent=playing?'Ⅱ 暂停':'▶ 播放';$('#play').setAttribute('aria-pressed',String(playing));}
function tick(now){if(disposed)return;raf=requestAnimationFrame(tick);if(document.hidden){last=0;return;}const delta=last?Math.min(100,now-last):0;last=now;if(playing){needsPaint=true;time=Math.min(LAB.duration,time+delta/1000*speed);if(time>=LAB.duration)playing=false;sync();}const interval=1000/(playing&&!slow?LAB.fps:LAB.slowFps);if((playing||needsPaint)&&now-lastRender>=interval-.7){const elapsed=lastRender?now-lastRender:0;if(playing&&elapsed>LAB.slowFrameMs){if(++slowCount>=LAB.slowFrames)slow=true;}else slowCount=Math.max(0,slowCount-1);lastRender=now;paint();}}
function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer?.disconnect();pair?.dispose();home?.dispose();owned.forEach(r=>r.dispose());renderer?.dispose();}
try{
 home=await loadSkinnedPlayer({timeout:20000});
 const originalOrange=new T.Color('#f18435'),studyOrange=new T.Color(LAB.jerseys.away);home.rival.root.traverse(o=>{const c=o.geometry?.attributes.color;if(!c)return;for(let i=0;i<c.count;i++)if(Math.abs(c.getX(i)-originalOrange.r)<1e-5&&Math.abs(c.getY(i)-originalOrange.g)<1e-5&&Math.abs(c.getZ(i)-originalOrange.b)<1e-5)c.setXYZ(i,studyOrange.r,studyOrange.g,studyOrange.b);c.needsUpdate=true;});$('.orange').style.background=LAB.jerseys.away;
 status.textContent='正在编排双人骨骼片段…';
 // Yield the loading label before the one-time fixed-bone animation bake.
 await new Promise(resolve=>requestAnimationFrame(resolve));pair=createPairedMotion(home);
 renderer=new T.WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:'low-power'});renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=false;
 camera=new T.PerspectiveCamera(LAB.cameraFov,1,.1,120);art=stage();observer=new ResizeObserver(fitCamera);observer.observe(canvas);fitCamera();playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;paint();sync();status.hidden=true;buttons.forEach(b=>b.disabled=false);$('#timeline').disabled=false;
 $('#play').onclick=()=>{if(time>=LAB.duration)time=0;playing=!playing;last=0;sync();};$('#replay').onclick=()=>{time=0;playing=true;last=0;sync();};
 $('#timeline').oninput=e=>{playing=false;time=Number(e.target.value)/1000*LAB.duration;sync();paint();};
 document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{speed=Number(b.dataset.speed);document.querySelectorAll('[data-speed]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
 document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{playing=false;time=Number(b.dataset.time)*LAB.duration;sync();paint();});
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));fitCamera();paint();});
 $('#swap').onclick=()=>{pair.setWinner(pair.winner==='home'?'away':'home');$('#attacker-label').textContent=pair.winner==='home'?'07 进攻':'07 防守';$('#defender-label').textContent=pair.winner==='home'?'23 防守':'23 进攻';paint();};
 $('#contacts').onchange=e=>{markers.forEach(m=>m.visible=e.target.checked);paint();};canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();dispose();fail('3D 上下文已中断，请重新加载演示。');},{once:true});
 document.addEventListener('visibilitychange',()=>{last=0;});window.addEventListener('pagehide',e=>{if(!e.persisted)dispose();});window.addEventListener('pageshow',()=>{last=0;needsPaint=true;});raf=requestAnimationFrame(tick);
}catch(error){dispose();fail(`演示未能加载：${error.message}。请点重新加载。`);console.error(error);}
