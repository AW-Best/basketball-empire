# 后三招末端爆破慢动作 — 2026-10-18，仅本地

## 用户纠正 / AC

用户明确后三种都有相同问题，要最后爆破时慢动作，取代上一轮仅巨猫整体慢放的理解。既有duel_network_review角色 /sm /arch /ui 只读预审通过。

- 双手重扣不改，仍3秒。
- 风车/黑洞/巨猫都4秒，初接触统一1秒，前3秒倒数保留。
- 1100起1100ms飞行，到2200ms同时对应原动作impact与视觉球到达。
- 2200～3100ms以900ms播放源impact之后200ms(约0.22倍速)，原素材爆破仍逐帧推进，落点圈/碎光同时慢展开；不是延长静态尾帧。
- 3100～3500收势，3500后才短暂停留，最后400ms淡出；4000模型一次落灰并恢复。
- 无剩余干扰不新增落点爆破或球；减少动态效果设置无末端碎光/闪动。

## 实现

Constants用SPECIAL_SPECTACLE和各招SPECIAL_SOURCE_ANCHORS取代CAT_SPECTACLE；attack-timing按招式返回共同末端慢放配置。moves的既有源锚点插值、model/clock时长读取无需另加计时器。

spectacle新增impact阶段，最多4个落点、每点3道碎光，共最多12，重合落点去重；借用共享RAF/30fps，不新增循环。game保留原层并提示“命中爆破·慢动作”；选招、指南和规则同步为后三招4秒末端慢放。

## TDD / 验证

新增duel-impact-slow.test.js七项：三招慢速比/动态推进、phase边界、圈扩散、粒子上限、零数量和reduced；三招真实4秒暂停与单次落灰，经典保持3秒。新增7项中5项明确RED→GREEN，经典及已有巨猫4秒保护本来已绿。旧cat-slow、compact、contact、skill-release边界同步。123项相关测试通过。

浏览器三招依次完整播放，均显示impact阶段后恢复playing，fallback=false。慢爆早/中段截图证明圈位置半径变化；完整过程实际回放，不靠静帧宣称慢动作。证据 /tmp/hoopire-impact-slow-{windmill,blackhole,cat}-{early,expanding}.png。

接收方另实际完整windmill：impact阶段gray=0，结束playing/gray=4，界面横铺；证据 /tmp/hoopire-impact-slow-receiver.png。未提交、推送、部署。
