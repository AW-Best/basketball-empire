# 独立完整队员扣篮预览

2026-10-17，用户要求将独立预览的手换成队员，先不放双人对战。本地修改，不提交、不推送、不部署。

## /sm AC、/arch及/ui审批

design_review已批准独立animation/player-*方案：

- 原创2D漫画完整队员，头脸/球衣07/短裤/双臂双腿/运动鞋；起跳、举球、扣篮、抓筐、落地。
- 独立2秒演示，400×320球场；不导入游戏规则、room、model或EventBus，不修改duel renderer/手部/游戏文件。
- 肢长固定，2骨骼IK连续，目标必须可达。手球相随，释放/抓框连续，双脚离地后才扣篮。
- 鞋底接地，不以踝心当脚底；着地后屈膝缓冲再站稳，接地脚不滑动、不穿地。
- 重播/半速/时间轴/关键帧/配色切换；标明完整队员独立研究，未接入双人，不暗示发送真实攻击。
- 低动态静态关键姿势、DPR≤1.5、后台及bfcache生命周期明确；手机320/390看全队员、球和篮圈。
- 先红绿测试骨长、手球、抓圈、落地、可达性/连续及导入隔离，再/rev及实际浏览器检查。

## Completion
- Replaced only the independent animation entry with original Canvas full-player art (jersey07, shorts, sneakers, face) and a reversible2000ms gather/jump/dunk/hang/landing timeline.
- Fixed-length two-bone limbs, carried ball/rim hand constraints, sole-aware planted landing, and reduced-motion key poses implemented.
- Review caught net/rim occlusion: now rear net/open rear rim → player/ball → front net/open front rim → gripping fingers. Regression was red before repair and green after.
-10 new tests and all56 related tests pass. Full npm suite escalation was declined; it was not run in this turn. Previous known unrelated athlete test failure remains outside scope.
- Actual local browser playback, half-speed, timeline keyframes and full-player scene inspected.390 CSS-width DOM check had no horizontal overflow and44px minimum controls. Browser screenshot backend cropped during viewport overrides; reset to native viewport for final visual proof. No claim of physical phone performance testing.
- /rev and static UI approved after occlusion repair. Existing multiplayer, shared hand renderer, room logic and rules unchanged. No commit/push/deployment.
