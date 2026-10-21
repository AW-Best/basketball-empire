# 后三招改为动作特写 — 2026-10-18，仅本地

## 用户要求与 AC

后三招不要显示两个泡泡龙界面，像第一招一样对动作做特写。/sm /arch /ui：既有duel_network_review角色只读预审通过。仅DEMO01 cinematicFx启用actionOnly；真正棋盘、规则与历史动作库不改。

- 三scene不绘制左右示意棋盘、假能量条，保留人物/球/篮筐/传送门/猫爪。
- 完整释放、飞行、命中后再收势定格，不截掉招式。
- camera和闪电origin共用投影；避免黑洞nativecamera重复缩放。
- 三秒倒数+三秒演出、灰球数量与单次结算不变。

## 修改文件与效果

- public/bubble-court/duel-lab/Constants.js：CLOSEUP镜头关键点、跟随偏移、收势位置；全部为已有本地程序绘制，无新增素材或依赖。
- public/bubble-court/duel/moves/focus.mjs：focusCamera、applyFocus、projectFocusPoint与猫爪focusPaw。
- public/bubble-court/duel/moves.mjs：导出镜头/投影，attackOrigin在actionOnly时走同一特写镜头。
- public/bubble-court/duel/move-court.mjs：仅cinematicFx传actionOnly，来源使用真实画布rect。
- public/bubble-court/duel/moves/{windmill,blackhole,cat}/scene.mjs：棋盘/能量条条件绘制，特写替换原camera；保留默认原场景。
- test/bubble-court/duel-closeup.test.js：五项新增测试。
- docs/bubble-court-duel-rules.md、SPRINT-STATUS.md：规则与记录同步。

风车：放大回环、手和筐，完整出球后跟随；命中后镜头回到已落地人物。黑洞：沿入口、出口、砸筐和陨石连续跟进。巨猫：完整肉垫挥拍与出球，收爪时停在抬爪姿态，避免动作完后空镜。

## TDD / 验证

五项新测试均经历RED→GREEN：原scene默认会绘制12次棋盘；特写无棋盘/假能量条，legacy仍有两块示意棋盘；飞行段球含半径余量在390/440宽视口内；camera连续；contact投影与origin一致；命中后人物/爪仍可见。113条相关测试通过。

浏览器连续完整播放风车、黑洞、巨猫，三招fallback=false，结束恢复playing。风车和巨猫修正空镜后再次连续播放；receiver风车横铺只显示动作，结束真实gray=4并恢复playing。截图 /tmp/hoopire-closeup-{windmill,blackhole,cat}-{action,release,impact}.png；收势证据 /tmp/hoopire-closeup-{windmill,cat}-own-settled.png；接收方 /tmp/hoopire-closeup-windmill-received-{action,settled}.png。

不提交、不推送、不部署。
