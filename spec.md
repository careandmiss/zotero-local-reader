# DSH 本地 Zotero 侧栏阅读器 — Specification

- Derived from: `intent/intent.md`（用户最新澄清）
- Author: DSH agent；待用户审核
- Status: Approved by user on 2026-11-15
- Date: 2026-11-15

## Requirements

### Functional

1. 在 DSH 右侧栏提供独立 Zotero 入口，不依赖 MCP 来绘制界面。
2. 只读访问本机 Zotero SQLite：显示文库/集合树、条目列表和条目元数据；支持标题/作者/摘要搜索、分页与手动刷新。
3. 打开条目后在 DSH 侧栏阅读本地 PDF 附件；从当前 Zotero 数据库解析附件 key，再从其对应的本地 `storage/<key>/` 提供文件。
4. 每个列表、搜索、详情请求都读取当下 SQLite 状态；面板打开时提供低频刷新，保证新加/删除/改名条目能及时反映。数据库繁忙时明确提示并允许重试。
5. 标准数据目录自动探测；非标准路径可在 DSH 插件设置中配置。

### Non-functional

- 严格只读：SQLite `mode=ro`、`PRAGMA query_only=ON`，路由只接受 GET；测试证明调用不会改库。
- 安全：SQL 全部参数化；附件 canonical path 必须留在配置的数据目录 `storage` 子树；不提供任意路径读取；拒绝跨站请求；不输出论文正文到日志。
- 隐私：数据不访问 Zotero Web API、不上传、不需 Zotero API Key；Host 与 Client 使用 DSH 同源接口。
- 健壮：缺库、schema 不兼容、锁忙、缺附件、PDF 无效时有不同的用户可行动错误。
- UI 遵循 DSH 主题 token、语言服务与右侧栏布局，不直接写 DOM，不依赖另一插件的 DOM/CSS。

## Design

### 结构

- **Host 插件**：通过 Cordis `webServer` 注册 `/dsh-zotero-local/api/*`；基于 Node 24 `node:sqlite` 只读连接本地数据库，提供健康检查、集合树、条目分页/搜索、条目详情、附件 PDF 流。
- **Client 插件**：注册唯一 `sidebarRightTabs` id 和 `sidebar.right.pane.tab` 席位；React 组件展示「集合树 → 条目列表 → 阅读页」。通过 `fetch` 访问 Host API。PDF 首版使用 DSH Chromium 的内嵌 PDF 预览端点；若运行时不支持，则改用捆绑 PDF.js 的同一 Host 文件端点。
- **数据路径**：配置 `dataDir` 优先；其次 `ZOTERO_DATA_DIR`；最后探测用户默认 `~/Zotero`。数据库默认为 `<dataDir>/zotero.sqlite`，附件仅限 `<dataDir>/storage/<attachment-key>/`。
- **实时性**：每个 API 请求新开只读连接或确保读事务结束后可见下一次提交；无长期元数据缓存。面板处于可见状态时低频刷新，用户也可手动刷新。
- **安全边界**：HTTP 只对 DSH Web Server 同源/回环提供服务；PDF 路由按 item/attachment key 查数据库后再流文件，不接受路径参数；支持 Range 请求以便 PDF 查看器分页读取。

### MVP 界面

- 顶部状态/刷新区：显示库连接、数据源状态和最近刷新结果，不展示完整文件系统路径。
- 左列：集合树与搜索。
- 中列：条目标题、作者、年份和附件状态；搜索标题/作者/摘要；分页。
- 阅读区：条目元数据与 PDF 预览；无 PDF 时给出“无本地 PDF 附件”状态。
- 空库、未配置、数据库忙碌、缺附件、损坏文件、版本不兼容均有清晰提示。

## Standards applied

- DSH `dsh-doc`：Host 与 Client 分层、通过 slot 扩展、资源由 context effect 管理、使用主题和 locale；不直接嵌 iframe 托管 HTML 应用。
- 安全：本地化最小权限、参数化 SQL、路径约束、只读模式、无秘密/论文内容日志。
- UX：明确连接/错误/空态、按钮用动作描述、键盘可达、主题适配。

## Gotchas

- Zotero 可用 WAL；不得以 `immutable=1` 打开，否则可能错过 WAL 中尚未 checkpoint 的最新内容。
- Zotero 同步或索引期间可能短暂锁库；有限等待后应返回可重试提示，绝不能切换成写连接。
- Zotero 的 schema 会变化；SQLite 查询必须以 fixture 覆盖关键表，实际 Zotero 版本验证留到有条件时执行。
- linked-file 附件可能在 storage 外；MVP 拒绝任意外部路径，避免 Host 任意文件读取。
- DSH 本地页面上运行的 PDF `<iframe>` 是否支持 Chromium 内建 viewer 尚待安装后实测；若不支持，以 PDF.js 作为回退方案。

## Open questions

- 用户需求现已明确为本地库；Web API 登录要求由最新澄清覆盖。若未来希望跨设备访问，应另做明确授权的 Web API 模式。
- 非标准 Zotero 数据目录由用户在插件设置中配置；不扫描整个磁盘寻找数据库。

## Verification plan

- 单元测试：内存/临时 SQLite fixture 覆盖集合、条目、搜索、分页、附件归属、坏路径、锁忙；断言只读数据库不能写入。
- HTTP 测试：错误方法、跨站、未知 key、路径穿越、Range、缺附件响应。
- Bundle 检查：manifest/patch/locale/client 模块语法和导出完整。
- 运行验证：安装到当前 desktop profile 后检查插件状态 active、侧栏入口可见；使用不含真实论文的测试 fixture 验证 PDF 路由。真实文库验证只确认状态/功能，不把标题或正文写入日志/提交。
