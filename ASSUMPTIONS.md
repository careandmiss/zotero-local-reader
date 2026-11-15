# 假设台账（代码前）

本文件记录会改变数据源、权限或交互语义的决定。用户最后澄清的“实时阅读本地 Zotero 论文”优先于此前关于 Web API 登录的设想。尚未实现任何代码。

| ID | 决定/假设 | 类别 | 依据 | 影响与缓解 | 状态 |
|---|---|---|---|---|---|
| A1 | 使用本地 `zotero.sqlite` 与附件 storage，不走 Zotero Web API | Semantic | 用户最新明确“实时阅读本地的 Zotero 论文” | 不需要 Zotero 账号/API Key；只能读本机已下载内容 | 已由用户目标确定 |
| A2 | 插件是 DSH Host + Client 侧栏扩展，不是只注册一个 MCP 工具 | Semantic | 用户强调 MCP 无法承载侧栏显示 | 提供可见的文库浏览与 PDF 阅读；不改 DSH 核心 | 已由用户目标确定 |
| A3 | 所有能力只读，不做 Zotero 写操作 | Safety | 本任务只要求阅读，降低数据库破坏风险 | 禁止 SQL 写语句，Host 路由仅 GET | 默认；若新增写功能需另行设计 |
| A4 | MVP 只支持 Zotero 导入/管理的 storage 附件，不支持任意 linked-file 路径 | Scope | 任意本地路径会扩大 Host 文件读取权限 | 只服务 `<dataDir>/storage/<key>` | 暂定 |
| A5 | “实时”定义为无长期缓存：每次搜索/列表/详情都查当前 SQLite，面板可见时低频刷新 | Semantic | 用户希望本地库及时变化 | SQLite 锁忙时显示重试而非旧数据冒充最新 | 暂定 |
| A6 | 默认 `~/Zotero`，允许环境变量或插件 Config 设置自定义数据目录 | UX/Operational | 本地 Zotero 常见目录；避免全盘扫描 | 自定义路径不自动猜测，显示配置指引 | 暂定 |
| A7 | 首版使用 DSH 同源 Host PDF 路由和 Chromium 内嵌 PDF viewer | UX/Implementation | 已安装的 DSH Zotero 插件已有 PDF 侧栏阅读经验 | 若当前 Electron 不支持内嵌 PDF，F3 改为 PDF.js | 待验证 |
| A8 | 不依赖用户当前安装的 `dsh-plugin-zotero` 作为运行时模块，也不改其文件 | Maintainability | 该包在 profile node_modules，只有编译产物且依赖本机 Zotero API | 新 bundle 使用独立 id/route，避免同插件 API 竞态 | 确定 |
| A9 | 不读取/提交用户论文内容，不使用真实文献作为测试断言 | Privacy | 本地文库是私人数据 | 使用临时合成 SQLite/PDF fixture 验证 | 确定 |
| A10 | “登录”不再作为 Zotero Web API 登录要求；如果用户所指是 DSH 的登录门槛，插件继承当前 DSH 会话 | Semantic | 用户最新澄清要求本地库实时读取 | 本地数据库模式本身无法验证 Zotero 云端身份 | 等待计划审核时确认 |
