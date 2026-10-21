# 巨猫拍球慢放 — 2026-10-18，仅本地

用户反馈最后演示的巨猫大招太快。/sm /arch /ui：duel_network_review只读预审通过；只调整DEMO01巨猫，不提交、不部署。

## AC / 时序

- 巨猫3秒改4秒，其他三招仍3秒；前置倒数3秒不变。
- 新增时间用在蓄力、拍击和飞行，收尾停留保持800ms。
- 源动作锚点：visual0→src0，1000→2600，1500→2750接触，1750→2950挥拍，2800→4500命中，3200→5000收爪，4000结束。
- 1500ms拍击同步闪电；1600起1200ms飞球，2800源球/干扰同步命中。模型4000一次落灰，恢复原对局；灰球数量和伤害不改。

## 改动

Constants.js增加CAT_SPECTACLE，duel/attack-timing.mjs提供统一getAttackTiming；moves、spectacle、model、game读取同一profile。fade按本次presentation完整duration，选招与说明标注巨猫4秒/其余3秒。历史sourceTime、原素材和独立动作库时长保持。

## TDD 与回放

新增duel-cat-slow.test.js三项均RED→GREEN：从原3000ms/1000ms接触失败，到4000ms新锚点、闪电飞行边界、4秒完整暂停后单次落灰恢复发射。旧compact/contact/skill-release边界同步为按招式读取profile，其余三招仍明确3000ms；116项相关测试通过。

浏览器实际新选招卡巨猫4.0秒，完整播放蓄力、拍击爆发、飞行、命中收爪与恢复；当前用户窄窗口约319px仍可辨认。证据 /tmp/hoopire-cat-slow-{windup,hit,flight,settle}.png。
