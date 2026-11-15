# DSH 本地 Zotero 阅读器 — Specification

- Derived from: `intent/intent.md`（用户最新澄清）
- Author: DSH agent；Plan/Design 已获用户批准
- Status: Approved by user on 2026-11-15; UI option A approved separately on 2026-11-15
- Date: 2026-11-15

## Requirements

### Functional

1. 在 DSH 主工作区提供独立 Zotero 文库入口，不依赖 MCP 绘制界面；保留原右侧栏紧凑快速阅读入口。
2. 只读访问本机 Zotero SQLite：展示集合层级/计数、条目列表与条目元数据；支持标题/作者/摘要搜索、分页、手动刷新和最近添加/标题/日期/作者排序。
3. 主工作区提供集合、条目列表、详情/PDF 三栏视图；集合可折叠，空间不足时响应式退化为双栏或列表/详情导航。
4. 打开条目后在详情区阅读本地 PDF 附件；从当前 Zotero 数据库解析附件 key，再从其对应的本地 `storage/<key>/` 提供文件。
5. 每个列表、搜索、详情请求都读取当下 SQLite 状态；面板打开时提供低频刷新，保证新加/删除/改名条目能及时反映。数据库繁忙时明确提示并允许重试。
6. 标准数据目录自动探测；非标准路径可在 DSH 插件设置中配置。

### Non-functional

- 严格只读：SQLite `readOnly`、`PRAGMA query_only=ON`，路由只接受 GET；测试证明调用不会改库。
- 安全：SQL 参数化；排序字段/方向只能来自服务端枚举白名单；附件 canonical path 必须留在配置的数据目录 `storage` 子树；不提供任意路径读取；拒绝跨站请求；不输出论文正文到日志。
- 隐私：不访问 Zotero Web API、不上传、不需 Zotero API Key；Host 与 Client 使用 DSH 同源接口。
- 健壮：缺库、schema 不兼容、锁忙、缺附件、PDF 无效时有不同的用户可行动错误。
- UI 遵循 DSH 主题 token 与语言服务；使用 DSH slots，不直接写 DOM，不依赖另一插件的 DOM/CSS。

## Design

### 结构

- **Host 插件**：通过 Cordis `webServer` 注册 `/dsh-zotero-local/api/*`；基于 Node 24 `node:sqlite` 只读连接本地数据库，提供健康检查、集合树/计数、条目分页/搜索/排序、详情、附件 PDF 流。
- **Client 插件**：注册 root-scoped keyed `main` panel 和具有同 key 的 `sidebar.panellist` 启动项；保留唯一 `sidebarRightTabs` id 与 `sidebar.right.pane.tab` 作为紧凑阅读器。React 组件展示三栏文库工作区，通过 `fetch` 访问 Host API。使用同源文件端点与 Chromium iframe；若用户授权的 live 验证证明原生 viewer 不可用，再评估捆绑 PDF.js。
- **Client 注入**：manifest 注入 DSH 内置 `ui-layout`、`ui-sidebar`、`ui-sidebar-right` 与 locale 包；不增加 npm 运行时依赖。
- **数据路径**：配置 `dataDir` 优先；其次 `ZOTERO_DB_PATH`、`ZOTERO_DATA_DIR`；最后探测用户默认 `~/Zotero`。数据库默认为 `<dataDir>/zotero.sqlite`，附件仅限 `<dataDir>/storage/<attachment-key>/`。
- **实时性**：每个 API 请求新开只读连接或确保读事务结束后可见下一次提交；无长期元数据缓存。面板处于可见状态时低频刷新，用户也可手动刷新。
- **安全边界**：HTTP 只对 DSH Web Server 同源/回环提供服务；PDF 路由按 item/attachment key 查数据库后再流文件，不接受路径参数；支持 Range 请求以便 PDF 查看器分页读取。

### 主工作区

- 顶部工具栏：以克制、紧凑的 Zotero 文库视图层级呈现标题、只读/连接状态、刷新与返回入口；不展示完整文件系统路径。
- 左栏集合树：显示集合名、文件夹图标与计数，支持展开/折叠、选中筛选；折叠包含当前筛选的祖先时，筛选自动切换到可见祖先。
- 中栏文献表：标题、作者、日期、类型、本地 PDF 状态；标题/作者/日期列头控制既有白名单排序，最近添加保留在选择器中；搜索覆盖标题/作者/摘要，分页和稳定 tie-break 不变。
- 右栏检查器：固定显示所选条目的题名/作者/日期，提供真实可用的“信息/PDF”页签；信息页显示已有元数据/摘要/标签/集合，PDF 页显示附件选择、状态与同源预览；无本地文件、错误响应可重试。不得伪造未实现的 Notes、Related、编辑、导入或同步入口。
- 主工作区视觉：紧凑表格密度、平面分隔、明确选中/焦点状态；背景/边界/交互/浅深色保持 DSH theme tokens，不硬编码 Zotero 调色板。
- 窄布局：集合过滤器仍可达，文献列表与详情之间可往返切换；不依赖横向滚动才能使用。
- 右侧栏快速阅读：保留紧凑搜索/列表/详情 UI，避免强行在窄栏放置三列。
- 空库、未配置、数据库忙碌、缺附件、损坏文件、版本不兼容均有提示。

## Standards applied

- DSH `dsh-doc`：Host 与 Client 分层、通过 slot 扩展、资源由 context effect 管理、使用主题和 locale；不直接嵌入另一个 HTML 应用。
- 安全：本地化最小权限、参数化 SQL、路径约束、只读模式、无秘密/论文内容日志。
- UX：明确连接/错误/空态、按钮用动作描述、键盘可达、主题适配、响应式布局。

## Gotchas

- Zotero 可用 WAL；不得以 `immutable=1` 打开，否则可能错过 WAL 中尚未 checkpoint 的最新内容。
- Zotero 同步或索引期间可能短暂锁库；有限等待后应返回可重试提示，绝不能切换成写连接。
- Zotero 的 schema 会变化；SQLite 查询必须以合成 fixture 覆盖关键表，实际 Zotero 版本验证留到用户提供版本/条件时执行。
- linked-file 附件可能在 storage 外；MVP 拒绝任意外部路径，避免 Host 任意文件读取。
- DSH 本地页面上的 PDF `<iframe>` 是否支持 Chromium 内建 viewer 仍需用户在现有 GUI 确认；只有实测证明不可用时，才评估同源 PDF.js 回退方案。
- 插件包替换可能需要重启 DSH 才加载新的 Client module generation；不承诺 HMR，安装结果决定后续步骤。

## Open questions

- 用户需求现已明确为本地库；Web API 登录要求由最新澄清覆盖。若未来希望跨设备访问，应另做明确授权的 Web API 模式。
- 非标准 Zotero 数据目录由用户在插件设置中配置；不扫描整个磁盘寻找数据库。
- 用户当前 Zotero 确切版本与真实文库 schema/path 兼容性待确认；不得读取或索取真实数据库路径/内容。

## Verification plan

- 单元测试：临时 SQLite fixture 覆盖集合层级/父子 key、条目、搜索、排序白名单/稳定分页、附件归属、坏路径、锁忙；断言只读数据库不能写入。
- HTTP 测试：错误方法、跨站、未知 key、非法 sort/direction、路径穿越、Range、缺附件响应。
- Bundle 检查：manifest/patch/locale/client 模块语法和导出完整。
- 运行验证：合成 fixture 验证 API、PDF 路由与 Range。更新安装到当前 desktop profile、主面板/右侧栏实际渲染与响应式行为需通过现有认证 GUI 由用户验收；不启动替代服务器、不绕过认证，不读取真实论文内容。

## Approved UI Amendment — two-pane library and full-width reader

Approved by the user on 2026-11-15 after comparing two screenshots and inspecting the installed `dsh-plugin-zotero@0.8.1` Client source. This amendment supersedes Requirements 3–4 and the three-pane Main Workspace bullets above; all read-only, same-origin, DSH theme, and security requirements remain in force.

### Revised functional requirements

1. Main library mode is two-pane: left collection tree + functional tag filter/counts; right compact item list with search, safe sorting, and pagination. No permanently visible third details/PDF column.
2. Opening an item from the main list transitions to a dedicated full-width reader mode within the `main` panel. PDF is the default reader content; title/back and a real Info/PDF switch remain accessible. Info shows the existing local metadata. Returning to the library restores collection, tag, query, sort, direction, page, and selection state.
3. The right-sidebar tab remains a quick-preview path, not the primary full-paper reading surface. Invoking full reading from the sidebar navigates to the main panel reader; the PDF is not presented as the main reading experience in the narrow sidebar.
4. Tags are obtained through a new same-origin, GET-only `/tags` endpoint returning tag name and item count, optionally scoped to a collection. Item-list requests may filter by one exact tag name. Query/tag values are length-bounded and parameterized; no user string is interpolated into SQL.

### Revised interaction and visual design

- Library left pane contains a collection tree and tag filter section; changing collection clears the current tag selection. Right pane contains a dense table/list and selected-row state.
- Opening a paper switches to a full-width document-first view with a visible return action. `Info` and `PDF` are mutually exclusive reader views; the PDF iframe fills available main-panel width and height rather than occupying a third column.
- The compact sidebar continues to support local search/quick metadata preview. A full-read action routes to the full-width main reader.
- Use DSH theme tokens and locale service; do not copy the other plugin's DOM/CSS or add its write/sync/import features.

### Additional verification

- Synthetic DB/HTTP tests cover tag enumeration/counts, collection scoping, exact tag filtering, invalid/overlong tag input, plus existing read-only and request-origin guarantees.
- Client source review covers two-pane rendering, full-width mode transitions, return-state preservation, keyboard access, compact sidebar routing, and responsive behavior. Visual acceptance still requires the user in the existing authenticated GUI after restart.
