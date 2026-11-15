# DSH Zotero local reader

## 使用说明

1. 在 DSH 的 **Plugins > Add plugin** 中添加本仓库目录。
2. 如 Zotero 数据目录不是默认位置，在插件设置中把 `dataDir` 配为包含 `zotero.sqlite` 的目录；也可直接配置数据库文件路径。留空时使用本机标准目录发现。
3. 打开 DSH 右侧栏 **Zotero 本地库**，按标题、作者或摘要搜索，选择文献查看元数据；有关联 PDF 时可在详情区选择附件并阅读。

每次查询都会读取当前本机 SQLite 状态，面板每 15 秒自动刷新，也可使用顶部刷新按钮。Zotero Desktop 无需保持运行。

## 数据与限制

- 插件以只读方式访问本机 Zotero SQLite，并且只读取 Zotero `storage/` 下的 PDF 附件。
- 不读取外部链接附件，不编辑文献、注释或文件，也不搜索 PDF 全文。
- 不调用 Zotero Web API 或云服务，不向外部发送文库内容。
- 测试仅使用临时合成数据库和合成 PDF；仓库不应包含真实文库、论文文件或凭证。

## 实现状态

本地数据库读取、文献浏览与 PDF 路由功能已实现；23 项合成测试、语法检查和 bundle 检查均通过，合成库 health/search 检查也通过。插件已安装到本地 DSH desktop profile 且 active。用户截图确认侧栏和 PDF 查看器可显示，并报告搜索/详情/PDF 操作通过；但另一次使用当前文库设置时出现“无法读取 Zotero 数据库”。根因尚未定位，真实库路径/schema 兼容性仍待验证；自动化检查未读取真实库内容。

## English

This DSH Host + Client bundle provides a right-sidebar reader for a local Zotero library. Add this repository through **Plugins > Add plugin**. Set `dataDir` in plugin settings to the folder containing `zotero.sqlite` when standard directory discovery does not find the library. Open **Zotero local library** in the right sidebar to search by title, author, or abstract, inspect item details, and read Zotero-managed local PDFs.

The plugin reads SQLite in read-only mode, refreshes the panel every 15 seconds, and does not require Zotero Desktop to remain open. It supports PDFs below Zotero `storage/` only; linked external files, PDF full-text search, record editing, Zotero Web API, and cloud services are out of scope. The bundle is installed and active in the local DSH desktop profile. All 23 synthetic tests, syntax checks, bundle checks, and a synthetic health/search smoke test pass. User screenshots confirm the sidebar and embedded PDF viewer render, and the user reports search/detail/PDF use succeeded; however, another check with the user's current library setting shows an unreadable-database error. Root cause and real-library schema/path compatibility remain unresolved; automated checks do not read the real library.
