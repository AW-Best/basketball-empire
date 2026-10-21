# 公网双人对战与四招集成

2026-10-21。承接用户“实现双人对战模式”“你自己玩玩试试”和先前发布到 Hoopire 的授权；不执行 git commit/push。

## AC 与架构

- 六位房间码，两部手机各占一个服务器签发的座位；同局 READY、射击、能量、Dunk、触底胜负和重赛同步。
- 服务端控制消除、4个干扰上限、3秒防守倒数、正式演出暂停、单次落球和恢复。Dunk 不结算胜负。
- 四招使用已确认工作台的独立固定 runtime，不引用可继续修改的实验文件。
- wall/game/visual 三个时间域分别负责在线状态、规则和演出；连续大招不因累计演出时长冻结。
- 独立 BubbleDuelRoom SQLite Durable Object，串行处理，完整保存身份/时钟/动作去重；30分钟回收。沿用现网 exports 声明生命周期，不能混用 migrations。
- 匿名建房每IP每分钟6次；8KiB请求体、同源、服务器token、动作校验、旧回合拒绝和持久去重。线上拒绝 CHARGE/END_CINEMA/预览指令。
- /arch 与 /ui 预审由既有 duel_network_review 完成；后续按实际浏览器和 HTTP 回归核对。

## 实现与红绿记录

- Session/DO/客户端先新增行为测试，验证自然蓄能两次Dunk、完整演出、一次落灰、重连、持久化和并发加入。
- 连续大招视觉时钟被误限到 gameNow+duration：回归先失败，再改为 visualNow+remaining。
- 实际浏览器发现同 revision 的掉线状态被 consume 丢弃：旧版截图 `/tmp/hoopire-duel-red-offline.png`；改为只拒绝更旧 revision，实看暂停与重连恢复。
- 旧响应乱序不能覆盖新演出或暂停状态，有客户端回归。
- 发布预检实际报错 migrations/exports 互斥：先加失败配置测试，再移除重复 migrations，保留原三个 DO 与新 BubbleDuelRoom 的 exports。
- HUD 测试仍只匹配 mock CSS，更新为覆盖 mock/online 的共享选择器；浏览器在演出前后 board rect 均为 x420/y219/w440/h378。

## 实际双页试玩

通过正常页面操作创建 QK696A，两个独立 sessionStorage 玩家 A/B；不是给内部状态赋值。首招实际点按三次完成正常消除，积分90、能量100。随后为覆盖全部演出，使用仅本地测试服务显式开启的充能按钮。

1. A→B 风车：B灰球0→4；演出中点按不发射，结束后shots0→1，仍playing。
2. B→A 黑洞：A灰球0→4；第二招继续完整播放，未提前结算。
3. A→B 巨猫：B灰球4→8；连续约250ms截图观测倒数、接触、爆破、四球传出及结束；playing未变、shots保持1。
4. B→A 双手重扣：A仍能收到4球并继续，双方各Dunk2次。
5. A继续发射堆球，shots3→8后真实触底：先保留灰化棋盘，再A失败/B胜利。双方点再来一局，round1→2，普通球40、灰球/积分/能量/Dunk次数清零。
6. B离开页面超过10墙钟秒：A实际显示等待重连；B回到同房保留座位，A恢复playing（revision未改变时也更新）。
7. 第二回合再实播黑洞、风车，连续截图核对球命中后再分四载体。两个页面控制台 error/warn 均为空。

证据：`/tmp/hoopire-duel-{classic-impact,windmill-transfer,blackhole-transfer,cat-transfer,loss}.png`。未测实体手机FPS，未声称跨移动网络真机验证。

## 验证与发布

- 相关客户端/Session/DO/HUD：21/21；部署配置与DO：14/14。
- 完整回归修正过时HUD匹配后：475项，474通过；仅既有 `athlete.test.js` 的旧3D palm misses the rim 失败。对应旧3D文件未变，新对战使用SVG/Canvas固定runtime，不加载旧SkinnedPlayer。
- 隔离发布包与线上 smoke 结果在完成后追加。主仓库不提交、不推送；其他实验页面不随本次上线。
- 祖先AGENTS要求 graphify update，但当前 graphify 命令不可用，未创建图谱。

### 最终发布验收

- 新增配置回归后全套476项：475通过，仍仅旧3D athlete palm 失败。
- Wrangler隔离包dry-run通过；Miniflare实际DO会话建房201、A/B加入、READY倒数、第三人409、匿名401、CHARGE400。
- 发布版本 `3e5b2761-4292-4e2c-9def-4afc80ff36e3`，只新增 BubbleDuelRoom，保留旧3个DO；前版参考 `414adfeb-6817-4206-90f4-0d09446bbf43`。
- 发布包121个实际静态文件（内容去重上传45个），47个旧线上文件已逐个与仓库HEAD验证字节一致。未包含win-lab、duel/design、其他实验入口、serve.py或内部snapshot记录。新模块相对依赖检查无缺失。
- 现网：https://hoopire.com/bubble-court/duel/；独立四招：https://hoopire.com/bubble-court/move-lab/。
- 现网真实双页WGP7HS：A/B建房加入准备；A正常3次消除获得90分/100能量，选择风车。B完整倒数→动作→爆破→四球落入，灰球0→4，演出结束仍playing，随后正常点按shots0→1；两端控制台无warn/error。
- B首访曾停在module加载中，刷新后进入成功；未改安全策略、未绕过证书检查。未宣称已验证实体手机加载性能。
- 现网独立API会话5EGHFU：建房201，A/B座位，第三人409；充能/END_CINEMA均400；匿名401；charge capability=false。
- 发布后9个关键旧/新资源线上字节核对通过，包含原首页、原泡泡首页、原app.js、ads.txt和新runtime。
- 证据与版本记录：`docs/evidence/online-duel-20261021/`；全过程未commit/push。
