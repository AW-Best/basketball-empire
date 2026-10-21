# 四招独立动作工作台 — 2026-10-18，仅本地

## /sm AC 与 /arch /ui

用户要求先拆出四种动作，不再每次启动整游戏，先确认视觉后再集成。duel_network_review角色只读预审通过。

- 独立静态页面，点卡立即播放，无倒数/充能/房间。
- 仅一个MoveCourt和一个FX画布，完整保留当前动作/末端慢爆。
- 播放暂停重播、半速/原速、时间轴拖动、关键点、循环及干扰示意开关。
- source与FX共用同一个纯PreviewClock；切卡清理旧场景/FX/帧缓存。
- 后台暂停；减少动态效果停在关键帧；30fps、DPR≤1.5。
- 不再共享可变游戏动作文件。move-lab/runtime持有约60KB渲染快照，后续只改lab，确认后再集成。
- 不提交、不部署。

## 实现

新增public/bubble-court/move-lab/{index.html,style.css,app.mjs,clock.mjs,README.md}和runtime纯动作快照（含snapshot.json源路径/哈希、原素材说明）。只有快照的MoveCourt增加ready promise供独立页等本地模块加载；原游戏MoveCourt与Constants本轮临时修改已恢复，无净改动。原对战模式不改。

独立静态服务127.0.0.1:8788，直接serve该文件夹即可，不依赖8780对战服务、npm安装或构建。独立页使用干扰落点示意，不渲染两个假棋盘。

## TDD / 检查

move-lab.test.js三项RED→GREEN：clock暂停/继续/完成；seekclamp、速度切换无跳、loop、reset；全导入图限制在move-lab并无model/network/game/API/storage。隔离补充断言也先红后绿。与原MovePlayback/末端慢爆共25项相关测试通过。

浏览器8788独立入口四招依次直接播放，都正常结束且fallback=false；半速后暂停time458ms保持，End键seek到4000；关FX后canvas idle/目标隐藏，重新开为impact；循环一轮后继续playing、time537ms；时间轴与关键点正常。截图/tmp/hoopire-motion-lab-{classic,windmill,blackhole,cat}.png。

当前实现包含响应式CSS，真实浏览器本轮在1280×720检查；不声称已在实体手机或低端GPU测量帧率。

最终只读复审通过。原MoveCourt和Constants已与快照中除预览ready/MOTION_LAB之外的基线逐字比较，恢复一致。
