# 固定棋盘，扣篮直接叠加

需求：屏幕大小不再随扣篮来回切换；直接叠加演出。仅本地，不提交、不部署。

## AC 与审查

/sm、/arch、/ui 预审通过：场景槽始终58px，solo攻击状态行固定32px。倒数、演出、收起、空/单/双向队列不改变棋盘rect或footer位置。演出层pointer-events:none，只有44px收起/展开按钮可拦截输入；收起不清瞄准手势。玩法、3秒预告、攻击和冷却不变；未加入仅讨论过的受击停顿。

## 红灯复现

浏览器390×844，先读取 `#board` 与 `footer` 的 getBoundingClientRect，再充能并选黑洞。对几何做 deepEqual：倒数阶段棋盘top从187变214、高534变507，断言失败；原因除动态court-slot外，attack-queue也由hidden变流内块。

## 实现

- game.mjs移除演出触发的court-slot高度写入与pointer清空。
- solo演出绝对定位叠加，高度clamp(140px,23svh,205px)；原布局只保留固定58px场景槽。
- solo攻击队列常驻32px，空态visibility:hidden，两行文字截在固定容器内、完整内容放title；不再动态display/高度。
- 保留收起停止绘制与展开恢复；overlay不拦截棋盘，footer保持原位。

## 验证

- 规则与动画相关23项回归通过。
- 浏览器使用相同read-only DOM几何断言，复测390×844及390×650的倒数、演出、收起和队列变化。

绿灯结果：390×844棋盘top219、高502，footer748–844；倒数/演出/收起/空队列/单双向攻击队列均严格deepEqual。390×650相同断言通过，footer始终在650内。演出仍playing时，elementFromPoint(300,270)为board，实际点击该覆盖位置后shots由1增至2；几何仍相等。/rev无阻断项。截图：`/tmp/hoopire-fixed-overlay.png`。未提交、未部署。
