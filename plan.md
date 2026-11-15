# DSH 本地 Zotero 侧栏阅读器 — Build Plan

- Derived from: `intent/intent.md` + `spec.md`
- Status: Approved by user on 2026-11-15 — code phase authorized; profile installation was separately authorized in goal round 1 and applied to the desktop profile.
- Date: 2026-11-15

## 本计划的结果定义

构建一个独立 DSH bundle（不是单独 MCP 工具），在 DSH 主工作区提供本地 Zotero 三栏文库，并保留右侧栏快速阅读入口；直接从本机 SQLite 与 storage 文件读取最新数据和 PDF。与当前 `dsh-plugin-zotero` 的差异是：它的阅读 UI/功能丰富但 Host 端依赖运行中的 Zotero Local API；本插件的数据层不依赖 Zotero 进程。现有 `zotero_offline_mcp` 保留给模型全文搜索/文本抽取，本插件负责 DSH 可见的文库浏览和 PDF 阅读，两者不互相替代。

## 文件范围

新项目 `zotero-local-reader/`：

- `package.json`：声明 bundle 与 web Client manifest；不加运行时构建脚本或不必要依赖。
- `cordis.patch.yml`：插入唯一 Host plugin row。
- `index.js`：Host 插件入口、volatile Config、webServer 路由注册及生命周期清理。
- `src/zotero-db.js`：路径探测、只读 SQLite 连接、集合/条目/附件查询。
- `src/http.js`：同源/回环校验、JSON 信封、健康/集合/搜索/详情/PDF Range 路由。
- `client.js`：DSH 主工作区 keyed panel、`sidebar.panellist` 入口与保留的右侧栏 tab（集合树、可排序列表、详情、PDF 阅读器、空态/错误/加载态）；`package.json` 注入所需的 DSH 内置布局/侧栏 Client 包。
- `locale/zh.json`、`locale/en.json`：面板与插件元数据文案。
- `icon.svg`：原创 bundle 图标；省略可选 detail 图片页。
- `tests/*.test.js`：SQLite fixture、路由与只读/安全测试。
- `README.md`：用户安装、配置数据目录、刷新与故障说明。
- `AGENTS.md`、`ASSUMPTIONS.md`、`BUILD_NOTE.md`、`spec.md`、`plan.md`：项目决策与验证记录。

不会修改 DSH 主仓库代码、用户 Zotero 数据库、当前已安装插件文件或 `zotero_offline_mcp`；待安装时通过 DSH Plugin Manager 添加这个独立本地 bundle。

## 实施阶梯（每一级保持前级通过）

### F0 — Walking skeleton

1. 完成 bundle manifest、Host 插件入口和 Client 模块骨架。
2. 插件注册唯一右侧栏 tab，Host `/health` 返回 `ready / database_missing / database_busy`。
3. `node --check`、manifest/patch 检查和最小 Host handler 单测通过。
4. 验收：本地 DSH bundle 可被识别；无库时显示清晰“配置 Zotero 数据目录”空态，而不是崩溃。

### F1 — 只读数据库与文库树

1. 使用 `node:sqlite` 建只读连接：`readOnly`、`PRAGMA query_only=ON`、有限 `busy_timeout`；不使用 `immutable=1`。
2. 默认路径自动探测并支持 `dataDir` 配置；检查 `zotero.sqlite` 与 schema。
3. 查询集合、父子关系、计数；避免 N+1 查询，所有 SQL 参数化。
4. 验收：fixture 下集合树正确；插入/更新语句被拒；数据库文件前后内容一致；锁忙映射成可重试错误。

### F2 — 条目搜索与详情

1. 支持全库/集合过滤，非附件的文献条目分页；提取标题、作者、日期、摘要、DOI、标签。
2. 搜索仅从必要字段匹配；设置页大小硬上限；无结果与继续分页状态明确。
3. 每次操作从数据库读当前快照；不跨请求持有 stale cache；UI 提供手动刷新与面板可见时低频刷新。
4. 验收：fixture 通过作者/标题/摘要搜索、排序、分页、集合筛选和空结果测试。

### F3 — 本地 PDF 安全流与阅读 UI

1. 将条目 key 解析到本地 attachment item，再映射到 `<dataDir>/storage/<attachmentKey>/<filename>`；不接受文件系统路径参数。
2. 从数据库 attachment key 构造候选路径，再用 `realpath` 验证文件仍在 canonical `storage` 根目录下；只服务 PDF；设置正确 MIME、`nosniff`、`no-store`，支持单个 `Range/206` 与无效范围 `416`。
3. Client 使用 DSH 同源 `/file/<parentItemKey>/<attachmentKey>` 预览；详情列出所有本地 PDF，默认选最新附件，元数据与 PDF viewer 在同一窄栏；缺失/越界/错误状态可重试。
4. 验收：fixture PDF 的 full response 与 Range 字节正确；穿越、symlink escape、错误归属 key、linked external file、缺失文件均拒绝或给安全错误。

### F4 — 错误恢复、体验与交付

1. 完整 loading/empty/error/retry 状态，限制轮询并在组件卸载时清除计时器。
2. zh/en locale、主题 token、键盘/ARIA 基础支持、原创 icon 与 README fallback；不声明可选 detail 图片页。
3. 运行全量 test、语法与 bundle 静态检查；profile 安装/active 状态已在单独授权后验证。用户截图确认侧栏与嵌入式 PDF 查看器渲染，用户报告搜索/详情/PDF 操作通过；但后续使用当前文库设置出现无法读取数据库状态，根因未定位。Agent 未直接查询真实数据库；真实 schema/路径兼容仍待验证。当前会话无已认证浏览器控制，不尝试绕过认证。
4. 委托独立 UI/UX、包元数据与安全 review；修复有证据的问题后再报告。
5. 若安装过程报告需批准的构建脚本，则不批准、不运行该脚本；改为零构建脚本或报告阻塞。

## 风险与缓解

| 风险 | 严重度 | 缓解/验收 |
|---|---|---|
| Zotero schema 变化或非标准数据目录 | 高 | 配置 path、schema 检查、fixture；实际运行时报可行动提示 |
| 同步/索引期间 SQLite 锁 | 中 | 有界 busy timeout；只读失败显示重试，不复制/写库 |
| PDF `iframe` 在 Electron/WebView 中不可用 | 中 | 先验证 native PDF viewer；失败则添加 PDF.js 运行资产回退，不改 Host 安全路由 |
| 附件路径穿越/任意文件泄露 | 高 | 只按 item key 查库、storage root canonical containment、测试 `..`/encoded path |
| 大库查询影响 Host 响应 | 中 | 参数化 SQL、索引友好查询、分页/上限、每请求关连接、低频刷新 |
| DSH Client HMR/侧栏无法即时显示 | 中 | 检查当前 `dev:web` watcher；不承诺自动更新，必要时按 DSH 文档刷新现有 GUI/重启受影响 Host |
| 个人文献隐私 | 高 | 无 Web API、无遥测、日志不含标题/摘要/正文/路径；只读且本机处理 |

## 验证命令与预期

- `node --test tests/*.test.js`：所有测试通过，覆盖 DB 与 HTTP 安全边界。
- `node --check index.js && node --check client.js`：语法检查通过。
- `node scripts/check-bundle.mjs`：package exports、patch、locale、README fallback、icon 限制与 runtime 文件存在且一致。
- DSH Plugin Manager：bundle 已安装；目标 row `enabled=true`, `fiberPhase=active`。
- Web GUI：右侧栏出现 Zotero 本地阅读器，collections/items/PDF 可读；安装/页面更新方式按当前 dev watcher 状态判断。

## 执行顺序

1. 用户审核本计划（AI-native SDLC 的 Build gate）。
2. 写 F0 + F1 测试和实现，达到 F0/F1 验收。
3. 实现 F2，然后独立测试。
4. 实现 F3，重点做路径、Range 和只读测试。
5. 加 F4 体验、文档、评审，跑整套验证。
6. 只有用户明确授权后安装/启用到当前 profile；验证没有回显论文内容或敏感路径。

## 并行化

当前 F0–F3 共享 Host/Client API 合同，先由一个实现者串行完成。API 稳定后可由独立 `ui-reviewer` 检查 Client 体验、`security-reviewer` 检查 SQLite/文件路由，均只读并提交带行号证据的报告。

## UI 对齐扩展（用户已批准）

### 用户确认与现状

用户于 2026-11-15 15:23 (+08:00) 选择 A：全宽三栏工作台，并保留现有右侧栏快速阅读入口。当前 Client 只注册为右侧栏阅读器，列表与详情分步显示。已核对运行版本 DSH 0.2.2-rc.3 的包文档/源码：`main` 是 root-scoped keyed slot，`sidebar.panellist` 将面板入口连接至同 key；有可复用的主面板注册模式。当前没有 `cordis_inspect_query` 实时 slot 证据，运行时导航仍需在既有 DSH 页面手动验收。

### 批准范围

新增从 DSH 左侧导航打开的全宽 Zotero 文库工作台，保留现有右侧栏快速阅读入口。工作台采用三栏：

1. **左栏**：可折叠集合树、集合计数与集合过滤。
2. **中栏**：搜索框、可排序分页列表；列显示标题、作者、年份/日期、类型与本地 PDF 指示；搜索覆盖标题/作者/摘要。排序只接受服务端枚举白名单（最近添加、标题、日期、作者），稳定 tie-break；默认沿用最近添加顺序。
3. **右栏**：条目详情（摘要、DOI、期刊、标签、集合、附件列表）及所选 PDF 阅读器；窄窗口退化为集合抽屉与列表/详情单栏导航。

复用现有只读 SQLite 与同源 HTTP API，不新增 Zotero 写操作、Web API、云同步或外部附件访问；保留 storage 路径约束、只读连接、分页上限与同源检查。真实文库 `dataDir` 错误仍独立待诊断；只用合成 fixture，绝不读取真实数据库排障。

### 实施顺序与文件范围

1. 先在 `tests/library.test.js` 与 `tests/http.test.js` 添加排序、非法 sort、参数注入拒绝的合成回归测试。
2. 在 `src/zotero-db.js` 增加排序白名单与稳定排序；在 `src/http.js` 校验并传递 `sort`/`direction`，不拼接未受信任 SQL。
3. 在 `package.json` 注入 DSH 内置 `ui-layout` 与 `ui-sidebar` Client 包，使布局服务/扩展点可用；在 `client.js` 为既有 Panel 增加 wide 模式：注册 `main` keyed panel 与 `sidebar.panellist` 图标；复用现有健康检查、详情/PDF 流程，显示集合树、列表列与三栏详情；保留 `sidebar.right.pane.tab` 的 compact 模式。
4. 更新 `README.md`、`spec.md`、`AGENTS.md`、`BUILD_NOTE.md`、`docs/UI_DIRECTION.md`、`implement-stage/BUILD_NOTE.md` 与 handoff，记录已实现/未验证状态。
5. 安装已测试 bundle 到当前 DSH desktop profile；不启动替代服务器，不绕过认证。安装返回 `application=applied` 且面板 row active；替换 package 需重启 DSH 载入新 Client module generation。用户重启/刷新现有 GUI 后用 synthetic fixture 验收主面板、集合/搜索/排序/分页/详情/PDF。

### 验收口径

- 左侧导航能打开工作台，标题与入口本地化，返回按钮能切回 Conversation；原右侧栏入口仍可用。
- 合成用例覆盖集合过滤、搜索、排序（含稳定 tie-break）、分页、详情、附件与 PDF；非法排序参数拒绝，已有 GET-only/loopback/source/path containment 安全回归不退化。
- 宽窗口三栏可见；中/窄窗口不产生横向溢出，集合导航及条目详情仍可达；使用 DSH theme tokens、语义按钮/标签、键盘可操作。
- `node --test tests/*.test.js`、四个 `node --check`、`node scripts/check-bundle.mjs`、`git diff --check` 全部通过；只有现有认证 DSH GUI 的实际操作可作为 UI 验收，静态检查/mock 不替代。

### 安全、回退与当前状态

- 不新增依赖，不改 profile 配置，不写真实 Zotero 数据；sort 参数必须经 enum 映射后才进入 SQL。
- 若新的 panel 注册或布局失败，保留原 compact 右侧栏并回退本次 UI 变更；回退仅限插件仓库 bundle，不触碰 DSH profile 之外的数据。
- **状态**：实现、文档、团队评审、静态验证、安装、提交与 push 均已完成；用户已批准范围并完成 DSH slot/API 勘察。排序回归测试、服务端白名单排序、可折叠三栏主面板及保留的右侧栏入口已提交至 `main`（`1dd2632`）；全量 25/25 合成测试、四项语法检查、bundle 检查与 diff 检查通过。API/DSH reviewers 无阻塞项；UX reviewer 的集合折叠、字号与隐藏筛选问题均已修复并确认。`plugin_manager install_bundle` 返回 `application=applied`，`zotero-local-reader` row 为 enabled/active；替换 package 需由用户重启 DSH 载入新 Client module generation，之后仍需现有 GUI synthetic 手工验收。未触碰真实 Zotero 数据。
- **不卡死计数**：当前 UI 扩展实施失败 0 次；若同一步连续失败 2 次，先回需求/设计复判。

## Zotero 原生文库风格对齐（用户追加请求）

### 需求与假设

用户在重启安装后的 DSH 后要求“风格和 Zotero 文献库的展示界面一致”。本轮按 Zotero 桌面版常见的库视图进行结构与密度对齐：左侧集合树、中间紧凑条目表、右侧条目检查器；用户未提供本机 Zotero 版本或参考截图，因此不声称像素级复刻。颜色、键盘焦点与浅/深色主题仍继承 DSH token。

### 范围

1. 主工作区改为更扁平、紧凑的工具栏与三栏分隔；本地只读/连接状态弱化为辅助状态，不新增导入、编辑、同步等无实现操作。
2. 集合树保留全部文献入口、层级/折叠/计数/选中态，行距与交互反馈采用 DSH 侧栏 token。
3. 条目区使用紧凑表格密度；标题、作者、日期列标题可切换现有服务端排序键并显示排序方向；最近添加排序仍通过现有选择器，不给类型/PDF 列伪造排序能力。
4. 详情窗格固定文献信息头与真实可用的“信息 / PDF”标签页，避免 PDF 被长摘要推至底部；信息页复用已有元数据、摘要、标签与集合，PDF 页复用既有 attachment 校验与同源 viewer。右侧栏快速阅读保持原行为。
5. 不读取真实 Zotero 数据、不新增依赖、不调用 Zotero Desktop API；仅静态/合成测试可由 Agent 执行，authenticated GUI 需用户确认。

### 验收

- 主视图一眼呈现集合树、紧凑可排序文献表、右侧检查器；选中行/焦点/错误状态清晰且使用 DSH theme tokens。
- 标题/作者/日期点击只改变白名单 sort/direction；原有最近添加/分页/筛选功能保持。
- Info/PDF 标签只显示已有功能，PDF 仍由同源 route 和 storage containment 保证；compact 右侧栏不回归。
- 25 个既有合成测试、四项 `node --check`、bundle 检查、`git diff --check` 通过；新 Client 视觉仍需用户在已重启 DSH 的认证 GUI 中验收。若用户提供脱敏截图，再作精确间距/颜色对比。

## UX 修正：按用户截图改为双栏文库 + 全宽阅读（2026-11-15）

### 证据与诊断

- 用户截图一是文库列表页：左侧集合/标签筛选，右侧条目列表；截图二是窄侧栏中的 PDF 阅读器，页面面积不足，用户明确表示读论文不方便。
- 只读检查当前已安装的 `dsh-plugin-zotero@0.8.1` Client 包：`ZoteroPane` 注释和实现（profile `node_modules/dsh-plugin-zotero/client/client.js` 39407–39664）是“左侧集合与标签、右侧列表”的双栏；单击选择、双击在其独立 item tab 打开文档。`ZoteroItemPane`/`ItemDetail`（37984–38135、37449–37698）以文档为主体，信息/目录作为浮层，并通过 `sidebar.right.pane.tab` 注册（39672–39797）。此包只读检查，不修改。
- 本项目现行 `client.js` 828–835 是三栏（树/表/检查器），PDF 位于右侧详情窗格；与截图一不符，也会把阅读面积压窄。用户已批准按推荐方案替换。

### 批准后的设计与范围

1. **文库主视图**：改为双栏；左栏提供可折叠集合树和真实可操作的标签筛选/计数，右栏展示紧凑条目列表、搜索、排序、分页。集合改变时清除当前标签筛选；不保留空的第三个详情栏。
2. **主工作区阅读模式**：从列表打开条目后切换到独立全宽文档视图，PDF 默认占据主阅读区域；顶部提供返回文库与“信息/PDF”切换，信息使用已有详情元数据。返回后保留集合、标签、搜索、排序、分页状态。
3. **右侧栏**：保留快速预览入口，但不再把它作为全文阅读的主路径；从侧栏请求打开 PDF 时应转到主工作区的全宽阅读模式。保留同源 PDF route、attachment-key 绑定、`storage/` containment。
4. **标签数据 API**：在现有只读查询层增加按集合范围列举标签/计数及单标签过滤；使用参数化 SQL、限制查询长度，不暴露文件路径或引入任意 SQL。不会写 Zotero DB。
5. 保留 DSH theme tokens、locale、键盘/ARIA、响应式、GET-only/loopback/source checks、无新依赖；不复制其他插件 DOM/CSS，不增加编辑、同步或导入能力。

### 实施顺序

1. 修改 `src/zotero-db.js`：复用现有 `tags/itemTags` 表读取标签计数，并为 item-list 查询增加精确标签过滤；新增合成 DB 单测。
2. 修改 `src/http.js` 与 HTTP tests：添加只读 `GET /tags`，校验 collection/query/tag 输入；保留已有 GET-only 和来源校验。
3. 修改 `client.js`：建立左侧集合/标签栏 + 右侧列表；从列表进入全宽 reader，返回保持查询状态；compact 侧栏保留快速预览并把全文阅读导航到 main panel。
4. 更新 `spec.md`、README、UI direction、build note、handoff；执行 UX 复审、全部 synthetic tests、四项语法检查、bundle 与 diff 检查；不自动改动 profile 配置。
5. 提交/推送后由用户重启 DSH，在现有 GUI 用 synthetic fixture 核对：双栏库、标签筛选、全宽 PDF、返回保状态、右栏 quick preview。未得到截图/用户反馈前不宣称视觉验收通过。

### 验收口径

- 主文库只有两个主列；左侧可浏览集合并过滤标签，右侧列表密度与截图一相近，不出现第三栏详情/PDF。
- 打开条目后，PDF 默认在主工作区宽屏展示；标题/返回/信息可达；PDF 不再在窄右栏中充当主阅读视图。
- 集合/标签/查询/排序/分页任意组合过滤结果正确，返回文库后状态保持；右栏快速预览入口仍可用且全文阅读能转到主工作区。
- 新增 DB/HTTP 测试覆盖标签列表计数、集合范围、精确过滤、恶意与超长输入；27 项合成回归测试全部通过；四项语法、bundle、diff 检查通过；API 与 UX 源码复审无阻塞；GUI 验收由用户完成。

### 当前实现与验证状态 — 2026-11-15

- 两栏文库、标签筛选 API、全宽主工作区阅读模式、侧栏快速预览到主阅读器的导航及状态保持已实现；设计修订提交 `001908f` 已推送。
- `node --test tests/*.test.js` 27/27；`index.js`、`client.js`、`src/zotero-db.js`、`src/http.js` 四项语法检查，`node scripts/check-bundle.mjs` 与 `git diff --check` 均通过。两个源码复审均无阻塞。
- 上一版双栏/主阅读器 bundle 曾在既有安装授权范围内应用到当前 DSH profile，`include:zotero-local-reader` 显示 enabled/active；本次 Session-bound 侧栏 PDF / 宿主全屏代码尚未应用。仍需用户刷新/重启现有 GUI 并验收本计划末尾的两条阅读路径；agent 无认证浏览器控制，未声称视觉验收通过。
- 所有测试仅用合成数据库/PDF；未读取真实 Zotero 数据。先前真实库读取错误仍未定位。

## 后续批准修订：侧栏阅读与全屏 — 2026-11-15

用户明确要求“可以侧边这样打开，同时也可以全屏看文件”，并进一步要求截图 2/3 的 DSH 原生文档预览阅读风格，不要只用截图 1 的普通嵌入式阅读器。技术复核确认全局 `main` 面板无活动 Session，不能从主文库调用 `sidebarRight.openResource()`；因此主列表仍进入沉浸主阅读器，侧栏 PDF resource tab 从会话级 metadata quick preview 发起。用户已批准让该 side/fullscreen tab 复用 DSH 原生 PDF canvas renderer。

### 实施与验收

1. 保留 main-panel readerMode 的沉浸视图：隐藏插件 header/hint/metadata/tabs，PDF 铺满并保留浮动返回；仅在此模式关闭 rightbar。
2. 新增按 item key 寻址的 DSH rightbar resource tab，并在 Session-bound metadata quick preview 中提供“Open PDF in sidebar” action；主文库是 sessionless global `main` 面板，因此其条目仍打开沉浸主阅读器，不调用 `openResource()`。
3. 右栏 PDF resource tab 复用 `ui-sidebar-documentpreview` 的 DSH PDF canvas 子 slot（适配宽度、缩放、文字层与文档预览主题），通过现有同源 GET API 读取 PDF bytes，不用 browser iframe、不展示 Zotero storage path。宿主原生 `push` / `fullscreen` 控件在侧读和全屏之间切换同一 tab；header 常驻“在主工作区阅读”备用入口，以覆盖大文件和原生解析/worker 错误。
4. 保留 loading/error/no-PDF、只读 DB、同源 GET、key-based attachment lookup、`storage/` containment；不安装 npm 包，只依赖当前 DSH profile 已提供的 `ui-sidebar-documentpreview` Client package。
5. 更新 UX 文档并复审；重跑 27 项合成测试、四项 syntax、bundle、diff 检查；提交/推送后由用户在现有 GUI 验收主列表沉浸阅读，以及 Session-bound metadata preview → DSH 原生 PDF canvas 侧栏 tab → 宿主全屏同一 tab；确认 Zotero path 不显示。

此修订已获用户确认并以设计提交 `3cf68a3` 记录。native PDF body slot 组合已实现并于 `0566b06` 提交、推送，入口标题与“更多”导航提示在 `bb87ac8` 中改进；27 项合成测试、四项语法检查、bundle 与 diff 检查通过，API/UX 复审确认无剩余 blocker（source-only，未做 live GUI 验证）。先前 iframe resource-tab 版本已被取代且未部署。用户已授权更新；当前 active profile 的 bundle 已启用并链接到此工作区，`install_bundle` 因 `already-installed` 且 `changed:false` 未改 profile，所以没有移除/重装。运行时重载和侧栏/全屏 GUI 验收仍需用户重启/刷新当前应用后完成。
