import {CHALLENGE} from './Constants.js?v=10';
/** Challenge accounting is independent of ball physics and rendering. */
export class StreetSession {
 constructor({shotLimit=CHALLENGE.shotLimit,target=CHALLENGE.target}={}){this.shotLimit=shotLimit;this.target=target;this.shots=0;this.dunks=0;this.cleared=0;this.streak=0;this.bestStreak=0;this.status='playing';this.reason='';}
 shoot(){if(this.status!=='playing'||this.shots>=this.shotLimit)return false;this.shots++;return true;}
 resolve(cleared){if(this.status!=='playing')return;this.cleared+=cleared;this.streak=cleared?this.streak+1:0;this.bestStreak=Math.max(this.bestStreak,this.streak);}
 dunk(cleared){if(this.status!=='playing')return;this.dunks++;this.cleared+=cleared;}
 evaluate({energy=0,danger=false,busy=false}={}){if(this.status!=='playing')return this.status;if(danger){this.status='lost';this.reason='danger';}else if(this.dunks>=this.target){this.status='won';this.reason='target';}else if(!busy&&this.shots>=this.shotLimit&&energy<100){this.status='lost';this.reason='shots';}return this.status;}
 summary(){return {status:this.status,reason:this.reason,dunks:this.dunks,target:this.target,shots:this.shots,remaining:Math.max(0,this.shotLimit-this.shots),cleared:this.cleared,bestStreak:this.bestStreak,stars:this.status==='won'?(this.shots<=CHALLENGE.threeStars?3:this.shots<=CHALLENGE.twoStars?2:1):0};}
}
