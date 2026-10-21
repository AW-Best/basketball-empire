export class SlamPlayback {
 constructor(){this.reset();}
 reset(){this.moment=null;this.lastEvent=null;}
 play(event,own){const key={round:event.roundId??0,id:event.id??0};if(this.lastEvent&&(key.round<this.lastEvent.round||(key.round===this.lastEvent.round&&key.id<=this.lastEvent.id)))return false;this.lastEvent=key;this.moment={...event,own};return true;}
 sample(now){if(!this.moment)return {active:false,ms:1500};const ms=now-this.moment.at;return {active:ms>=0&&ms<1500,ms:Math.max(0,Math.min(1500,ms))};}
}
