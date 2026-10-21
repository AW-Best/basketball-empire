// Presentation-only proposal: one event, two local perspectives. No game mutations.
export function roleView(attack,role,stage){
 const own=role==='sender',count=Math.max(0,Math.min(attack.initial,attack.remaining)),blocked=attack.initial-count;
 let title,hint;
 if(stage==='warning'){title=own?'你的扣篮，即将出手':`${attack.attacker} 向你发动扣篮`;hint=own?'目标已锁定 · 对手仍可消除抵消':'同次消除3个普通球，抵消1个干扰';}
 else if(stage==='action'){title=own?'你的双手重扣！':`${attack.attacker} 的双手重扣`;hint=own?'等待对手接招 · 双方比赛暂停':'受击演出中，比赛暂停 · 结束后恢复';}
 else {title=count?(own?`命中对手 ×${count}`:`干扰落入 ×${count}`):(own?'被对手全部化解':'BLOCK! 全部化解');hint=own?`本次清底排成功 · 对手抵消 ${blocked} 个`:`已抵消 ${blocked} 个 · ${count?'消除旁边同色球可击碎干扰':'这次不会新增干扰'}`;}
 if(count===0){title=own?'被对手全部化解':'BLOCK! 全部化解';hint=own?'对手已化解干扰 · 你的清底排仍然生效':'不会新增干扰 · 继续消除、蓄能反击';}
 if(stage==='action')hint=own?'等待对手接招 · 双方比赛暂停':'受击演出中，比赛暂停 · 结束后恢复';
 return {paused:stage==='action',centered:stage==='action'&&!own,canCollapse:stage!=='action'||own,attackId:attack.id,role,stage,count,blocked,move:'双手重扣',you:own?attack.attacker:attack.defender,other:own?attack.defender:attack.attacker,energy:own?0:64,direction:own?`你 → ${attack.defender}`:`${attack.attacker} → 你`,eyebrow:own?'YOUR ATTACK / 你发起':'INCOMING / 你接招',title,hint,showFlight:stage==='impact'&&count>0};
}
