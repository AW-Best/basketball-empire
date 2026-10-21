// Physics and AI share game time; the unblocked wall clock only plays the cutscene.
export class MatchClock {
 constructor(wall){this.gameAt=wall;this.wallAt=wall;this.cinematic=null;}
 now(wall){return this.cinematic?this.gameAt:this.gameAt+Math.max(0,Math.min(10000,wall-this.wallAt));}
 advance(wall){this.gameAt=this.now(wall);this.wallAt=wall;return this.gameAt;}
 begin(gameAt,durationMs,wall){const overshoot=Math.max(0,this.gameAt-gameAt);this.gameAt=gameAt;this.wallAt=wall;this.cinematic={startWall:wall-overshoot,endWall:wall-overshoot+durationMs,durationMs};}
 visualNow(wall){return this.cinematic?this.gameAt+Math.max(0,wall-this.cinematic.startWall):this.now(wall);}
 done(wall){return !!this.cinematic&&wall>=this.cinematic.endWall;}
 end(wall){this.cinematic=null;this.wallAt=wall;}
}
