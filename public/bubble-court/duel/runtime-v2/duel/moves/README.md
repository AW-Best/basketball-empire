# DEMO01 四招演出适配

这三个 Canvas 动作来自用户在 `/Users/leiw/Projects/tutorials/leiw/spike/bubble-court-dunk-lab` 创建的小样：根目录风车、`blackhole/` 黑洞、`giant-cat/` 巨猫。这里保存本地适配版本，原实验文件保持原样，不依赖 8787 服务或 CDN。

- `motion.mjs` 保留原采样曲线，`scene.mjs` 抽出渲染函数，移除 DOM 控件和独立 RAF。
- `createMoveScene(ctx).render(ms,{own,count})` 由游戏唯一时钟驱动；显示真实剩余干扰数量，0 时不画落入的障碍。
- 画面中两块小棋盘是进攻/防守示意，实际棋盘与结果始终由游戏 reducer 决定。
- 巨猫毛线、黑洞陨石只是动画装饰；实际都为相同灰球，邻近同色消除可击碎。
- `../moves.mjs` 是 DEMO01 规则配置；`../move-court.mjs` 限制 30fps、DPR≤1.5，闲置/收起/后台停止绘制。加载失败显示基础扣篮和提示，不重复结算攻击。
- 基础双手扣篮复用 `duel-lab/slam/scene.mjs`，不复制动作代码。

未增加付费素材或第三方资源。用户的原动作库仍是独立效果比较页，不代表实际游戏伤害。
