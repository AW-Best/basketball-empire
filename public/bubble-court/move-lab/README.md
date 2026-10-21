# Hoopire 独立动作工作台

四种动作的独立审阅入口。先在此打磨，确认动作后再显式集成回对局；不要直接修改正式对战源。

## 启动

本目录已自带运行所需JS/SVG，无安装、构建、CDN或游戏后端依赖。在仓库根目录运行：

```sh
python3 public/bubble-court/move-lab/serve.py
```

打开 http://localhost:8788/ 。也可 `/?move=classic`、`/?move=windmill`、`/?move=blackhole`、`/?move=cat` 直达。该服务只绑定本机。

## 操作

- 点招式即播放，没有对局、充能和三秒倒数。
- 播放/暂停、重播；0.5×/1×；可选四招连播、整组循环。手动切招/拖动退出连播。
- 拖时间轴，或点起势、接触、出球、传出、爆破慢放、收势。
- 干扰飞出与爆破开关只控制示意层，动作中的篮球仍保留。
- 落点是抽象示意，不绘制泡泡棋盘，不创建真实干扰球。
- 后台自动暂停，返回点播放继续。系统开启减少动态效果时停在关键帧，可手动拖动检查。

## 文件与隔离

- index.html / style.css：独立工作台。
- app.mjs / clock.mjs：播放控制与纯预览钟。
- runtime/：2026-10-18动作快照，完整独立副本，无游戏model、network、mock、lobby导入；不使用存储或房间API。
- runtime/snapshot.json：快照源路径与初始哈希，用于后续审阅差异。调整动作后哈希不会自动更新，保留原基线。
- runtime/duel/moves/{windmill,blackhole,cat}/：后三招；runtime/duel-lab/slam/：双手重扣。
- runtime/duel-lab/Constants.js、runtime/duel/attack-timing.mjs：独立时序与镜头配置。

接下来仅修改此目录，现有DEMO01版本保持原样。动作确认后比较snapshot基线，把已确认的渲染改动接回；再单独验证对战攻防与结算。原动作素材来源说明保留在runtime/duel/moves/README.md。

## VOL.02

六款官方竞品依据见 [研究页](research.html) 与 docs/research/hoopire-motion-competitors-2026-10-19.md。后三招共享原创 Canvas 人物/道具与有约束的手臂，源动作完成后再分四球；末端爆破完整淡出后留画。基础扣篮完整贯网、松手和落地。工作台运行时约64KB，30fps、DPR上限1.5；实体手机FPS尚未实测。serve.py禁缓存，避免跨会话加载旧模块。
