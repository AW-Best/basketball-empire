import * as T from '../vendor/three.module.min.js';
import {STREET} from './Constants.js?v=10';

/** Original procedural art: shared low-poly primitives, no downloaded character assets. */
export function buildStreetScene(player){
 if(!player)throw new Error('Skinned athlete must load before scene creation');
 const scene=new T.Scene();scene.background=new T.Color(STREET.palette.sky);scene.fog=new T.Fog(STREET.palette.fog,13,29);
 const resources=new Set(),materials=new Map(),staticBoxes=new Map();
 const mat=(color,extra={})=>{const key=color+JSON.stringify(extra);if(!materials.has(key)){const m=new T.MeshLambertMaterial({color,...extra});materials.set(key,m);resources.add(m);}return materials.get(key);};
 const box=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,12,8),cylinder=new T.CylinderGeometry(1,1,1,10),torsoGeometry=new T.CylinderGeometry(.29,.23,.65,8);[box,sphere,cylinder,torsoGeometry].forEach(g=>resources.add(g));
 const mesh=(geo,material,parent=scene)=>{const m=new T.Mesh(geo,material);parent.add(m);return m;};
 const block=(x,y,z,w,h,d,color,parent=scene)=>{const m=parent===scene?new T.Object3D():mesh(box,mat(color),parent);m.position.set(x,y,z);m.scale.set(w,h,d);if(parent===scene){m.updateMatrix();if(!staticBoxes.has(color))staticBoxes.set(color,[]);staticBoxes.get(color).push(m.matrix.clone());}return m;};
 const orb=(x,y,z,rx,ry,rz,color,parent=scene)=>{const m=mesh(sphere,mat(color),parent);m.position.set(x,y,z);m.scale.set(rx,ry,rz);return m;};
 const lines=(points,color,opacity=1,parent=scene)=>{const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),m=new T.LineBasicMaterial({color,transparent:opacity<1,opacity});resources.add(g);resources.add(m);const l=new T.LineSegments(g,m);parent.add(l);return l;};
 const segmentPoints=(points)=>points.slice(1).flatMap((p,i)=>[points[i],p]);
 scene.add(new T.HemisphereLight('#c2dfff','#46322b',2.4));const sun=new T.DirectionalLight('#ffbc83',3);sun.position.set(-4,7,5);scene.add(sun);const blue=new T.DirectionalLight('#60d7ff',1.6);blue.position.set(5,3,-4);scene.add(blue);
 block(0,-.1,0,13,.2,10,STREET.palette.floor);block(1,.006,0,4.8,.012,4.2,STREET.palette.paint);
 const courtLines=[[-1.4,.025,-2.1],[-1.4,.025,2.1],[3.4,.025,2.1],[3.4,.025,-2.1],[-1.4,.025,-2.1]];
 lines(segmentPoints(courtLines),'#e6dac3',.7);const arc=[];for(let i=0;i<=44;i++){const a=-Math.PI/2+i/44*Math.PI;arc.push([-1.4-Math.cos(a)*2.3,.026,Math.sin(a)*2.3]);}lines(segmentPoints(arc),'#cddbd3',.7);
 const circle=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI*2;circle.push([-1.4+Math.cos(a)*.8,.028,Math.sin(a)*.8]);}lines(segmentPoints(circle),'#e8d4b3',.65);
 // Dusk skyline, brick wall, chain-link enclosure and floodlights.
 for(let i=0;i<14;i++){const x=-10+i*1.5,h=2.6+(i*7%5)*.55;block(x,h/2-1,-7,1.3,h,1.2,i%2?'#27314c':'#31364d');for(let j=0;j<3;j++)block(x-.36+j*.36,h*.52,-6.38,.11,.26,.015,j%2?'#c79166':'#727d8d');}
 block(0,.6,-3.2,13,1.2,.25,'#39414e');const fence=[];
 for(let i=0;i<=30;i++){const x=-6.6+i*.44;fence.push([x,1.25,-3.05],[Math.min(6.6,x+1.3),3.25,-3.05],[x,3.25,-3.05],[Math.min(6.6,x+1.3),1.25,-3.05]);}lines(fence,'#75818a',.35);
 for(const x of [-5,-2,1,4,6])block(x,1.9,-3.1,.055,2.8,.055,'#171f31');
 for(const x of [-4.8,4.8]){block(x,2.25,-2.7,.09,4.5,.09,'#152735');block(x,4.5,-2.7,.78,.16,.20,'#e4d5a6');block(x,4.5,-2.58,.65,.09,.02,'#fff1b6');}
 // Painted mural and jersey number are tiny local canvas textures, not font/model downloads.
 const sign=(text,x,y,z,w,h,color,parent=scene)=>{if(typeof document==='undefined')return null;const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');c.clearRect(0,0,512,128);c.fillStyle=color;c.font='italic 900 80px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,70);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;resources.add(tex);const m=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide});resources.add(m);const geo=new T.PlaneGeometry(w,h);resources.add(geo);const p=mesh(geo,m,parent);p.position.set(x,y,z);return p;};
 sign('HOOPIRE',-2.4,.63,-3.045,3.6,.9,'#5ee7e8');sign('OWN THE NIGHT',2,.65,-3.04,3,.48,'#eebc7c');
 // Physical hoop: support, padded post, glass, rim and a tapered line net.
 block(2.1,1.85,-.68,.13,3.7,.13,'#172d3c');block(2.1,.7,-.68,.35,1.4,.35,'#123d51');block(2.1,3.55,-.35,1.3,.88,.07,'#91adbb');block(2.1,3.55,-.30,1.14,.72,.035,'#b8d4db');
 lines(segmentPoints([[1.86,3.17,-.27],[1.86,3.57,-.27],[2.34,3.57,-.27],[2.34,3.17,-.27],[1.86,3.17,-.27]]),'#faf2da');
 const ringGeo=new T.TorusGeometry(.31,.032,6,30);resources.add(ringGeo);const rim=mesh(ringGeo,mat('#ff8139'));rim.name='rim';rim.rotation.x=Math.PI/2;rim.position.set(2.1,3.05,.35);
 const net=new T.Group();net.name='net';net.position.set(2.1,3.05,.35);scene.add(net);const netPoints=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2,b=a+.32;netPoints.push([Math.cos(a)*.29,0,Math.sin(a)*.29],[Math.cos(b)*.19,-.47,Math.sin(b)*.19]);}for(const y of [-.16,-.31,-.46]){const radius=.29+y*.2;for(let i=0;i<20;i++){const a=i/20*Math.PI*2,b=(i+1)/20*Math.PI*2;netPoints.push([Math.cos(a)*radius,y,Math.sin(a)*radius],[Math.cos(b)*radius,y,Math.sin(b)*radius]);}}lines(netPoints,'#f4eee2',.82,net);
 // Coherent skinned character, animated exclusively by its quaternion clip.
 const athlete=new T.Group();athlete.name='athlete';athlete.add(player.root);scene.add(athlete);
 const ball=orb(0,0,0,.13,.13,.13,'#f79138');ball.name='basketball';const seamGeo=new T.TorusGeometry(1,.035,4,24);resources.add(seamGeo);for(let i=0;i<3;i++){const seam=mesh(seamGeo,mat('#653c25'),ball);seam.rotation.set(i===0?Math.PI/2:0,i===1?Math.PI/2:0,i===2?.5:0);}
 // Soft blob shadow, no realtime shadow map passes.
 const shadowGeo=new T.CircleGeometry(1,24);resources.add(shadowGeo);const shadowMat=new T.MeshBasicMaterial({color:'#030d19',transparent:true,opacity:.3,depthWrite:false});resources.add(shadowMat);const shadow=mesh(shadowGeo,shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.y=.04;
 function pose(t){player.sample(t);const hip=player.rig.pelvis.getWorldPosition(new T.Vector3());ball.position.copy(player.ballAt(t));ball.rotation.z=-t*8;shadow.position.x=hip.x;shadow.position.z=hip.z;shadow.scale.setScalar(Math.max(.25,.55-(hip.y-1)*.2));
  const impact=t>=.6&&t<.8?Math.sin((t-.6)/.2*Math.PI):0;net.scale.y=1+impact*.3;rim.position.y=3.05-impact*.025;
 }
 // Batch the skyline, windows and architecture by material into a few draw calls.
 for(const [color,transforms] of staticBoxes){const group=new T.InstancedMesh(box,mat(color),transforms.length);transforms.forEach((matrix,i)=>group.setMatrixAt(i,matrix));group.instanceMatrix.needsUpdate=true;group.computeBoundingSphere();scene.add(group);resources.add(group);}
 pose(0);
 return {scene,ball,athlete,pose,dispose(){player.dispose();for(const r of resources)r.dispose();scene.clear();}};
}
