# 接触闪电与同画面定格 — 2026-10-18，仅本地

## /sm AC 与 /arch /ui

用户澄清：不再另开BREAK THEM提示画面；同一扣篮末图停留几秒，砸筐就爆闪电、干扰直接飞向对手，不提交、不部署。

既有duel_network_review角色预审和最终只读复审通过：演出3000ms，接触1000、跟随120、闪电320、飞球接触后100起600ms；1120～3000保持末姿。carrier到终点后稳定等待model END一次实际落灰，飞球延期规则仍保留；来源/接收方向清楚。最后400ms同层淡出，保留近2秒姿态且不额外加时。

## 实现与节奏审查

| 项目 | 原来 | 现在 |
| --- | --- | --- |
| 动作与爆发连接 | 2/5，全动作结束后另爆发 | 5/5，真实接触同刻爆发 |
| 画面连贯 | 3/5，收势后切大字 | 5/5，原接触末姿定格 |
| 信息负担 | 3/5，POWER/BREAK覆盖主体 | 4/5，只留小方向/数量和灰球提示 |
| 节奏 | 4/5，总6.92秒 | 4/5，总6秒，定格与飞球重叠 |

新增Constants contact/follow/launch/fade与四招source接触/定格锚点；moves增加attackSourceTime/attackOrigin。MoveCourt和设计页共用采样及quiet模式，原native/sourceTime保持兼容；黑洞/巨猫镜头变换与letterbox纳入原点定位。spectacle去大字，末端carrier缓存；feedback收到garbage不再弹大字层。模型仅使用3000ms完整presentation结束，原在途球保护保留。

修改区域：duel-lab/Constants.js、duel-lab/model.js、duel-lab/slam/scene.mjs；duel/moves.mjs、move-court.mjs、spectacle.mjs、feedback.mjs、game.mjs、network.css、index.html；三个动作scene的quiet文字开关；design/app.mjs、index.html、style.css。规则及相关测试同步。

## TDD / 验证

- 新增duel-contact-sequence.test.js共8项RED→GREEN：接触/定格连续采样、闪电与飞球重叠、末端不消失、零灰球、无新大字、camera/letterbox原点、四招真实Mock倒数后单次落灰。
- 102条相关规则/客户端/动作/结算回归通过；/rev最终复审通过。
- 浏览器四招分别实际播放，flight与hold均出现，结束恢复playing，combat-notice均不可见；无脚本错误。巨猫定格后移至源3.3秒，使球离开爪掌。
- 截图：/tmp/hoopire-contact-{classic,windmill,blackhole,cat}-{flight,hold}.png。
- 接收方额外实测：同一居中卡保留至飞球/hold结束，最终普通32、干扰4、phase=playing；无BREAK THEM面板或脚本错误。接收方证据/tmp/hoopire-contact-receiver-{flight,hold}.png。
- 本地8780服务恢复启动；未提交、推送、部署。
