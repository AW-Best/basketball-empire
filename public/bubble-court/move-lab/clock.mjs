export class PreviewClock {
 constructor(duration){this.speed=1;this.loop=false;this.reset(duration);}
 reset(duration){if(!Number.isFinite(duration)||duration<=0)throw new RangeError('Invalid preview duration');this.duration=duration;this.time=0;this.playing=false;this.last=null;}
 step(now){if(!this.playing)return this.time;const delta=Math.max(0,now-this.last);this.last=now;this.time+=delta*this.speed;if(this.time>=this.duration){if(this.loop)this.time%=this.duration;else{this.time=this.duration;this.playing=false;this.last=null;}}return this.time;}
 play(now){if(this.playing)return;if(this.time>=this.duration)this.time=0;this.playing=true;this.last=now;}
 pause(now){this.step(now);this.playing=false;this.last=null;}
 seek(time,now){this.time=Math.max(0,Math.min(this.duration,time));if(this.time===this.duration)this.playing=false;this.last=this.playing?now:null;}
 setSpeed(speed,now){if(![.5,1].includes(speed))return;this.step(now);this.speed=speed;}
}
