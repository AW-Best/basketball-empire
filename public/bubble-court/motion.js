// Wall reflection and first-contact geometry for the player's aiming guide.
export function traceAim({x,y,vx,vy,left,right,ceiling,balls,radius}){
 const len=Math.hypot(vx,vy);if(!len||vy>=0)return [{x,y}];vx/=len;vy/=len;const out=[{x,y}];
 for(let i=0;i<12;i++){
  const wall=vx>0?(right-x)/vx:vx<0?(left-x)/vx:Infinity,roof=(ceiling-y)/vy;let distance=Math.min(wall,roof),hit=false;
  for(const b of balls){const dx=x-b.x,dy=y-b.y,projection=dx*vx+dy*vy,disc=projection*projection-(dx*dx+dy*dy-(radius*1.87)**2);if(disc<0)continue;const t=-projection-Math.sqrt(disc);if(t>=0&&t<distance){distance=t;hit=true;}}
  x+=vx*distance;y+=vy*distance;out.push({x,y,...(hit?{hit:true}:wall<roof?{bounce:true}:{})});if(hit||roof<=wall)break;vx=-vx;
 }
 return out;
}
const keys=[
 [0,142,190,179,165,139,224,163,224,151,207,161,207],
 [.12,155,201,185,176,143,224,178,224,145,213,174,214],
 [.32,210,151,244,104,178,196,218,207,187,174,218,179],
 [.50,259,137,307,108,228,185,263,191,226,158,265,168],
 [.60,268,153,307,132,240,198,282,196,239,176,277,179],
 [.70,270,171,307,132,250,211,291,209,252,191,287,192],
 [.87,282,199,305,184,267,224,304,224,268,211,301,212],
 [1,280,190,308,178,266,224,300,224,267,208,297,208]
];
export function dunkPose(t){t=Math.max(0,Math.min(1,t));let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=(t-a[0])/(b[0]-a[0]),s=u*u*(3-2*u),v=a.map((n,j)=>n+(b[j]-n)*s),hip={x:v[1],y:v[2]},hand={x:v[3],y:v[4]},foot={x:v[5],y:v[6]};return {hip,hand,foot,foot2:{x:v[7],y:v[8]},knee:{x:v[9],y:v[10]},knee2:{x:v[11],y:v[12]},ball:t<=.6?{...hand}:{x:307+(t-.6)*24,y:132+Math.min(1,(t-.6)/.4)**1.4*102},released:t>.6};}
