import * as T from '../vendor/three.module.min.js';
import {streetPose} from './street-motion.js?v=9';
import {STREET} from './Constants.js?v=9';

/** Original procedural art: shared low-poly primitives, no downloaded character assets. */
export function buildStreetScene(){
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
 // Athlete rig. Shared primitive geometries keep the skinned-looking limbs lightweight.
 const athlete=new T.Group();athlete.name='athlete';scene.add(athlete);
 const torso=mesh(torsoGeometry,mat(STREET.palette.jersey),athlete),shorts=block(0,0,0,.53,.30,.37,STREET.palette.shorts,athlete),head=orb(0,0,0,.20,.24,.20,STREET.palette.skin,athlete),hair=orb(0,0,0,.205,.11,.205,'#18232e',athlete);
 const face=new T.Group();athlete.add(face);for(const x of [-.075,.075]){orb(x,.015,.181,.035,.022,.016,'#f9ebce',face);orb(x+.008,.015,.195,.014,.016,.008,'#101d28',face);}const brow=block(0,.065,.19,.21,.023,.025,'#24252b',face);block(.015,-.077,.193,.08,.015,.015,'#673a30',face);orb(.02,-.015,.205,.033,.04,.035,STREET.palette.skin,face);
 const neck=orb(0,0,0,.115,.14,.115,STREET.palette.skin,athlete);
 const number=sign('07',0,0,.27,.38,.13,'#edffff',athlete);
 const limbs=[];function limb(a,b,radius,color){const part=mesh(cylinder,mat(color),athlete);limbs.push({a,b,radius,part});return part;}
 // Joint spheres live separately so segment scaling never stretches their radius.
 limb('hip','knee',.14,STREET.palette.shorts);limb('knee','foot',.095,STREET.palette.skin);limb('hip','knee2',.14,STREET.palette.shorts);limb('knee2','foot2',.095,STREET.palette.skin);limb('shoulder','elbow',.10,STREET.palette.skin);limb('elbow','hand',.085,STREET.palette.skin);limb('shoulder','backElbow',.10,STREET.palette.skin);limb('backElbow','backHand',.085,STREET.palette.skin);
 // Rounded joints use a few unscaled mesh nodes.
 const joints=['knee','knee2','hand','backHand','elbow','backElbow'].map(name=>({name,node:orb(0,0,0,.10,.10,.10,STREET.palette.skin,athlete)}));
 const shoe=block(0,0,0,.37,.16,.27,'#d8f2ed',athlete),shoe2=block(0,0,0,.37,.16,.27,'#d8f2ed',athlete);
 const ball=orb(0,0,0,.18,.18,.18,'#f79138');ball.name='basketball';const seamGeo=new T.TorusGeometry(1,.035,4,24);resources.add(seamGeo);for(let i=0;i<3;i++){const seam=mesh(seamGeo,mat('#653c25'),ball);seam.rotation.set(i===0?Math.PI/2:0,i===1?Math.PI/2:0,i===2?.5:0);}
 // Soft blob shadow, no realtime shadow map passes.
 const shadowGeo=new T.CircleGeometry(1,24);resources.add(shadowGeo);const shadowMat=new T.MeshBasicMaterial({color:'#030d19',transparent:true,opacity:.3,depthWrite:false});resources.add(shadowMat);const shadow=mesh(shadowGeo,shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.y=.04;
 const up=new T.Vector3(0,1,0),from=new T.Vector3(),to=new T.Vector3(),direction=new T.Vector3();
 function pose(t,idle=0){const p=streetPose(t);if(t===0){p.ball.y+=Math.sin(idle*4)*.04;p.hand.y=p.ball.y;}
  for(const {a,b,radius,part}of limbs){from.set(p[a].x,p[a].y,p[a].z);to.set(p[b].x,p[b].y,p[b].z);direction.subVectors(to,from);const length=direction.length();part.position.copy(from).add(to).multiplyScalar(.5);part.scale.set(radius,length,radius);part.quaternion.setFromUnitVectors(up,direction.normalize());}
  torso.position.set(p.hip.x-.025,p.hip.y+.35,0);torso.rotation.z=-(p.shoulder.x-p.hip.x)*.8;shorts.position.set(p.hip.x,p.hip.y-.05,0);head.position.copy(p.head);hair.position.set(p.head.x,p.head.y+.17,p.head.z);neck.position.set(p.shoulder.x,p.shoulder.y+.1,0);face.position.copy(p.head);brow.rotation.z=t>.3&&t<.8?-.08:0;
  if(number)number.position.set(p.hip.x-.025,p.hip.y+.4,.258);
  joints.forEach(({name,node})=>node.position.copy(p[name]));shoe.position.copy(p.foot);shoe.position.x+=.07;shoe2.position.copy(p.foot2);shoe2.position.x+=.07;ball.position.copy(p.ball);ball.rotation.z=-t*8;shadow.position.x=p.hip.x;shadow.scale.setScalar(Math.max(.25,.55-(p.hip.y-1)*.2));
  const impact=t>=.6&&t<.8?Math.sin((t-.6)/.2*Math.PI):0;net.scale.y=1+impact*.3;rim.position.y=3.05-impact*.025;
 }
 // Batch the skyline, windows and architecture by material into a few draw calls.
 for(const [color,transforms] of staticBoxes){const group=new T.InstancedMesh(box,mat(color),transforms.length);transforms.forEach((matrix,i)=>group.setMatrixAt(i,matrix));group.instanceMatrix.needsUpdate=true;group.computeBoundingSphere();scene.add(group);resources.add(group);}
 pose(0);
 return {scene,ball,athlete,pose,dispose(){for(const r of resources)r.dispose();scene.clear();}};
}
