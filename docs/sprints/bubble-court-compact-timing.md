# 四招统一紧凑节奏 — 2026-10-18

范围：本地DEMO01/双视角设计，用户要求不提交、不部署。

## /sm AC

- 双手、风车、黑洞、巨猫动作均3秒；保留前3秒防守倒数与后320ms闪电+600ms干扰飞入，总6.92秒。
- 保留完整动作、重点段相对慢放；源时间连续单调，命中/结束采样准确。
- 对局暂停贯穿完整演出；尾段结束前不加灰，结束只加一次并恢复发射。
- 四招100能量/最多4干扰不变；普通LAN与独立原动作库保留原时域。
- 卡片、指南、规则、设计对照页使用同源时长。刷新本地浏览器，实际查看四招和尾段。

## /arch + /ui 预审

既有duel_network_review角色只读通过。getPresentationMove在现有分段慢放时间上归一到Constants的3000ms；sourceTime先逆归一再逆变形。native impact是对方落点，映射实际源点，不能硬改为统一砸筐时刻。model/Mock已经消费getCinematicDuration，不加新定时器，不改变原MOVES。UI称重点段相对慢放。

## 验证

- 新增6测试RED：统一时长/完整连续采样、四招倒数→演出→爆发→飞入→落灰与继续发射。
- 94条相关规则、演出、客户端和结果回归全部通过。
- /rev最终只读复审通过；浏览器四招逐一实际播放，burst/flight阶段均出现且结束恢复playing，选招四卡均3.0秒。风车新爆发/飞入截图保存在/tmp/hoopire-compact-windmill-{burst,flight}.png，其余动作截图/tmp/hoopire-compact-{classic,blackhole,cat}-action.png。
- 仅本地文件修改；没有提交、推送或部署。

## 节奏审查（game-designer，本轮范围）

| 项目 | 调整前 | 调整后 |
| --- | --- | --- |
| 时长一致性 | 2/5，各招2.1～8.8秒 | 5/5，统一3秒 |
| 关键动作辨识 | 4/5 | 4/5，保留源重点段的相对慢放 |
| 爆发到干扰的反馈 | 4/5 | 4/5，尾段0.92秒保留 |
| 规则与界面一致性 | 4/5 | 5/5，时长说明同步 |

实现文件：public/bubble-court/duel-lab/Constants.js、duel/moves.mjs、duel/game.mjs、duel/index.html、duel/design/index.html。Constants新增clipMs，既有模型和渲染器同源消费。测试文件duel-compact-timing.test.js新增，cinematic.test.js与duel-spectacle.test.js更新有意改变的时长约定。规则和SPRINT-STATUS同步。原素材、输入、计分、碰撞、粒子预算和结果过渡均保留。
