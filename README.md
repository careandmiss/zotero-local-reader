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

本地数据库读取、文献浏览与 PDF 路由功能已实现；合成测试、语法检查和 bundle 检查均通过。PDF HTTP 字节范围与存储路径限制已由合成测试验证。DSH profile 中的实际 Zotero 数据库读取、侧栏槽位展示和 Chromium 原生 PDF 渲染尚未验证，因为当前未安装插件。

## English

This DSH Host + Client bundle provides a right-sidebar reader for a local Zotero library. Add this repository through **Plugins > Add plugin**. Set `dataDir` in plugin settings to the folder containing `zotero.sqlite` when standard directory discovery does not find the library. Open **Zotero local library** in the right sidebar to search by title, author, or abstract, inspect item details, and read Zotero-managed local PDFs.

The plugin reads SQLite in read-only mode, refreshes the panel every 15 seconds, and does not require Zotero Desktop to remain open. It supports PDFs below Zotero `storage/` only; linked external files, PDF full-text search, record editing, Zotero Web API, and cloud services are out of scope. Tests use temporary synthetic fixtures only. Live profile, real-library, and native-viewer rendering checks have not been performed.
