export class PreviewClock {
 constructor(){this.time=0;this.rate=1;this.phase='idle';this.last=null;}
 start(){if(this.phase!=='idle')return;this.phase='playing';this.last=null;}
 pause(paused){if(!['playing','paused'].includes(this.phase))return;this.phase=paused?'paused':'playing';this.last=null;}
 speed(value){if(['1','0.5','0.25'].includes(String(value)))this.rate=Number(value);}
 step(now){if(this.phase!=='playing'){this.last=null;return false;}if(this.last!==null)this.time=Math.min(1.5,this.time+Math.max(0,Math.min(.05,(now-this.last)/1000))*this.rate);this.last=now;if(this.time>=1.5){this.phase='finished';return true;}return false;}
}
