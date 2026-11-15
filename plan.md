# DSH 本地 Zotero 侧栏阅读器 — Build Plan

- Derived from: `intent/intent.md` + `spec.md`
- Status: Draft — **等待用户批准；批准前不写实现代码、不安装到当前 profile**
- Date: 2026-11-15

## 本计划的结果定义

构建一个独立 DSH bundle（不是单独 MCP 工具），在 DSH 右侧栏显示本地 Zotero 文库，并直接从本机 SQLite 与 storage 文件读取最新数据和 PDF。与当前 `dsh-plugin-zotero` 的差异是：它的阅读 UI/功能丰富但 Host 端依赖运行中的 Zotero Local API；本插件的数据层不依赖 Zotero 进程。现有 `zotero_offline_mcp` 保留给模型全文搜索/文本抽取，本插件负责 DSH 可见的文库浏览和 PDF 阅读，两者不互相替代。

## 文件范围

新项目 `zotero-local-reader/`：

- `package.json`：声明 bundle 与 web Client manifest；不加运行时构建脚本或不必要依赖。
- `cordis.patch.yml`：插入唯一 Host plugin row。
- `index.js`：Host 插件入口、volatile Config、webServer 路由注册及生命周期清理。
- `src/zotero-db.js`：路径探测、只读 SQLite 连接、集合/条目/附件查询。
- `src/http.js`：同源/回环校验、JSON 信封、健康/集合/搜索/详情/PDF Range 路由。
- `client.js`：DSH 侧栏 tab 和 React 组件（库树、列表、阅读器、空态/错误/加载态）。
- `locale/zh.json`、`locale/en.json`：面板与插件元数据文案。
- `docs/DETAIL.md`、`icon.svg`：安装说明、限制和 bundle 图标。
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
2. `path.resolve` 后验证仍在 `storage` 根目录下；只服务 PDF；设置正确 MIME、`nosniff`、`no-store`，支持 `Range/206` 与 `416`。
3. Client 使用 DSH 同源 `/file/<itemKey>` 预览，在侧栏展示元数据、翻页/缩放由内嵌 PDF viewer 提供；没有 PDF 时显示原因。
4. 验收：fixture PDF 的 full response 与 Range 字节正确；穿越、未知 key、linked external file、非 PDF 均拒绝。

### F4 — 错误恢复、体验与交付

1. 完整 loading/empty/error/retry 状态，限制轮询并在组件卸载时清除计时器。
2. zh/en locale、主题 token、键盘/ARIA 基础支持、icon/detail 文档。
3. 运行 test、lint/语法、bundle 静态检查；安装到当前 DSH profile 后核对插件 active 和工具/侧栏状态，不读取或回显用户论文正文。
4. 委托独立 UI/UX 与安全/bug review；修复有证据的问题后再报告。
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
- `node scripts/check-bundle.mjs`（如需要）：package exports、patch、locale、detail/icon 存在且一致。
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
