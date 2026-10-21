// No clock or timers here: the workbench advances this list when its one clock ends.
export class MovePlaylist {
 constructor(ids){this.ids=[...ids];this.active=false;this.index=0;}
 start(id=this.ids[0]){this.index=Math.max(0,this.ids.indexOf(id));this.active=true;return this.ids[this.index];}
 advance(loop=false){if(!this.active)return null;this.index++;if(this.index>=this.ids.length){if(loop)this.index=0;else{this.stop();return null;}}return this.ids[this.index];}
 stop(){this.active=false;}
}
