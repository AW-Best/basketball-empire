// Offline Acclaim ASF/AMC reader. Coordinates in metres, rotations in source world axes.
import * as T from '../../public/vendor/three.module.min.js';
const radians=Math.PI/180;
const rotation=values=>new T.Quaternion().setFromEuler(new T.Euler(...values.map(n=>n*radians),'ZYX'));
export function parseAcclaim(asf,amc){
 const definitions={root:{name:'root',direction:new T.Vector3(),length:0,axis:[0,0,0],dof:[]}},hierarchy={};let section='',bone=null,unit=.45;
 for(const raw of asf.split(/\r?\n/)){const line=raw.trim(),[key,...values]=line.split(/\s+/);if(!line||line.startsWith('#'))continue;if(key.startsWith(':')){section=key;continue;}
  if(section===':units'&&key==='length')unit=Number(values[0]);
  if(section===':bonedata'){if(key==='begin')bone={dof:[]};else if(key==='end'){definitions[bone.name]=bone;bone=null;}else if(bone){if(key==='name')bone.name=values[0];if(key==='direction')bone.direction=new T.Vector3(...values.map(Number));if(key==='length')bone.length=Number(values[0]);if(key==='axis')bone.axis=values.slice(0,3).map(Number);if(key==='dof')bone.dof=values;}}
  if(section===':hierarchy'&&key!=='begin'&&key!=='end')hierarchy[key]=values;
 }
 const scale=.0254/unit,frames=[];let frame=null,previous={};for(const raw of amc.split(/\r?\n/)){const line=raw.trim();if(!line||line.startsWith('#')||line.startsWith(':'))continue;if(/^\d+$/.test(line)){frame={...previous};frames.push(frame);previous=frame;}else{const[name,...values]=line.split(/\s+/);if(!frame)throw new Error('AMC channel before frame');frame[name]=values.map(Number);}}
 if(!frames.length)throw new Error('Empty motion');
 function sampleFrame(index){const values=frames[Math.max(0,Math.min(frames.length-1,Math.round(index)))],result={},v=values.root??[0,0,0,0,0,0],rootPosition=new T.Vector3(...v.slice(0,3)).multiplyScalar(scale),rootQ=rotation(v.slice(3));result.root={position:rootPosition,end:rootPosition.clone(),quaternion:rootQ};
  function walk(parent){for(const name of hierarchy[parent]??[]){const d=definitions[name];if(!d)throw new Error('Unknown ASF bone '+name);const axes=rotation(d.axis),angles=[0,0,0],channels=values[name]??[];d.dof.forEach((channel,i)=>{const axis='xyz'.indexOf(channel[1]);if(axis>=0)angles[axis]=channels[i]??0;});const local=axes.clone().multiply(rotation(angles)).multiply(axes.clone().invert()),quaternion=result[parent].quaternion.clone().multiply(local),position=result[parent].end.clone(),end=d.direction.clone().multiplyScalar(d.length*scale).applyQuaternion(quaternion).add(position);result[name]={position,end,quaternion};walk(name);}}
  walk('root');return result;
 }
 return {frames,fps:120,scale,definitions,hierarchy,sampleFrame};
}
