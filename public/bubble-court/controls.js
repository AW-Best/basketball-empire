const LIMIT=1.25,SPEED=680,FINE_RADIANS_PER_PIXEL=.0025;
export class AimControl{
 constructor(){this.reset();}
 reset(){this.angle=0;this.busy=false;this.pointer=null;this.lastX=0;}
 setBusy(value){this.busy=value;}
 nudge(delta){if(!this.busy)this.angle=Math.max(-LIMIT,Math.min(LIMIT,this.angle+delta));}
 aimAt(x,y,originX,originY){if(this.busy)return;this.angle=Math.max(-LIMIT,Math.min(LIMIT,Math.atan2(x-originX,Math.max(30,originY-y))));}
 beginFine(id,x){if(this.busy||this.pointer!==null)return;this.pointer=id;this.lastX=x;}
 moveFine(id,x){if(id!==this.pointer||this.busy)return;this.nudge((x-this.lastX)*FINE_RADIANS_PER_PIXEL);this.lastX=x;}
 endFine(id){if(id===this.pointer)this.pointer=null;}
 get direction(){return {vx:Math.sin(this.angle)*SPEED,vy:-Math.cos(this.angle)*SPEED};}
 fire(){if(this.busy)return null;this.busy=true;this.pointer=null;return this.direction;}
}
