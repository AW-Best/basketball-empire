// Result controls only; the server owns invitations and acceptance.
export function rematchControls(room,seat,{solo=false}={}){
 const base={label:'Play Again',action:solo?'READY':'REMATCH',version:room.rematchVersion??0,disabled:false,secondary:null,message:''};
 if(solo)return base;
 if(room.rematch?.from===seat)return {...base,label:'Waiting for Rival',disabled:true,secondary:'Cancel Invite',message:'Invite sent. Your result and room stay here while you wait.'};
 if(room.rematch)return {...base,label:'Accept Rematch',secondary:'Not Now',message:'Your rival wants a rematch. Accept to start a 3-second countdown in this room.'};
 const declined=room.rematchDeclinedBy;
 return {...base,message:declined?(declined===seat?'You declined. Your result and room are saved. Invite again whenever you like.':'Your rival declined. Your result and room are saved. You can invite again later.'):'Invite your rival. A new round starts here only when both agree.'};
}
