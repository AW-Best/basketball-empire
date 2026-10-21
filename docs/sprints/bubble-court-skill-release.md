# 完整大招释放与顶部反馈 — 2026-10-18，仅本地

## /sm AC、/arch 与 /ui 预审

需求：消除积分不遮棋盘；接收方横铺特效；修复风车未出球、黑洞陨石未落下、巨猫未拍到对面就定格的截断。既有 duel_network_review 角色只读预审通过。

- 普通消除明确显示分数、能量；棋盘外固定32px HUD，不随内容增加高度。
- 接收方演出以.game为定位容器，width:100%，中心横铺，不更改棋盘布局。
- 后三招连续完成释放、飞行、命中、收势再定格；基础重扣保留原砸筐/穿网跟随。
- 三秒倒数+三秒演出不变；真实灰球由模型在演出结束一次结算，在途球保护和零数量防守不变。

## 改动

Constants增加releaseImpactMs=1850、releaseEndMs=2200、landingGlowMs=250，飞球750ms。特殊动作源末姿改为风车5000、黑洞6600、巨猫5000ms。attackSourceTime在1000接触→1850原素材命中→2200收势之间连续映射，2200后停住；没有裁掉球的飞行。

spectacle在1100启动视觉球，1850到达，与源动作命中同步；落点短环250ms后静止缓存。保持count=0不冒出干扰球，原scene障碍数量0避免重复伤害。没有新增计时器或依赖。

index把combat-notice移到board-wrap之前固定HUD；network.css移除中心大字，接收层改全容器宽绝对定位；feedback显示+分数/+能量，game指南同步。

## TDD 与实际验证

- duel-skill-release.test.js四项原始失败，证明三个动作在2450/5500/3300提前冻结、飞球提前到达。
- duel-hud.test.js两项RED→GREEN：分数能量提示、HUD独立布局、接收方全宽定位。
- 更新旧时间断言后108项相关规则、动作、暂停、连发、网络客户端、结算回归通过。
- 浏览器连续播放三招，均fallback=false，结束回到playing。截图 /tmp/hoopire-release-{windmill,blackhole,cat}-{flight,hold}.png。
- 接收方演出x420、宽440与游戏容器一致；棋盘演出前中同为x420 y251 440×346，结束真实灰球4个且继续playing。
- 实际发射消除3个普通球：顶部提示+30分、+48能量；notice y219 h31，board y251，提示不遮棋盘。截图 /tmp/hoopire-release-score-hud.png、receiver-flight.png、receiver-hold.png。

不提交、不推送、不部署。修正此前contact-hold文档中“所有动作1120后冻结”的方案，以本文件和最新规则为准。
