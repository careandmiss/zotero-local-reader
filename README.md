# DSH Zotero local reader

## 使用说明

1. 在 DSH 的 **Plugins > Add plugin** 中添加本仓库目录。
2. 如 Zotero 数据目录不是默认位置，在插件设置中把 `dataDir` 配为包含 `zotero.sqlite` 的目录；也可直接配置数据库文件路径。留空时使用本机标准目录发现。
3. 从 DSH 左侧导航打开 **Zotero 本地库**：左栏按集合筛选，中栏按标题/作者/摘要搜索并按最近添加、标题、日期或作者排序，右栏查看元数据和阅读本地 PDF。右侧栏仍保留紧凑的快速阅读入口。

每次查询都会读取当前本机 SQLite 状态，面板每 15 秒自动刷新，也可使用顶部刷新按钮。Zotero Desktop 无需保持运行。

## 数据与限制

- 插件以只读方式访问本机 Zotero SQLite，并且只读取 Zotero `storage/` 下的 PDF 附件。
- 不读取外部链接附件，不编辑文献、注释或文件，也不搜索 PDF 全文。
- 不调用 Zotero Web API 或云服务，不向外部发送文库内容。
- 测试仅使用临时合成数据库和合成 PDF；仓库不应包含真实文库、论文文件或凭证。

## 实现状态

本地数据库读取、文献浏览与 PDF 路由功能已实现；新增全宽三栏主工作区、集合折叠、服务端排序，并保留右侧栏快速阅读入口。25 项合成测试、四项语法检查、bundle 检查和 diff 检查通过。新版 bundle 已安装到 DSH desktop profile，`plugin_manager` 返回 applied 且插件 row active；替换模块需用户重启 DSH 后，才可在现有 GUI 验收新工作区。此前截图仅确认旧右侧栏版本的 PDF 查看器；新主工作区仍未视觉验证。另一次使用当前文库设置时出现“无法读取 Zotero 数据库”，根因尚未定位；自动化检查只用合成 fixture，未读取真实库内容。

## English

This DSH Host + Client bundle provides a three-pane Zotero library workspace in the main area, plus a compact right-sidebar reader. Add this repository through **Plugins > Add plugin**. Set `dataDir` in plugin settings to the folder containing `zotero.sqlite` when standard directory discovery does not find the library. Open **Zotero local library** from the left navigation to browse/collapse collections, search by title, author, or abstract, sort and page through items, inspect details, and read Zotero-managed local PDFs.

The plugin reads SQLite in read-only mode, refreshes the panel every 15 seconds, and does not require Zotero Desktop to remain open. It supports PDFs below Zotero `storage/` only; linked external files, PDF full-text search, record editing, Zotero Web API, and cloud services are out of scope. The updated source passes all 25 synthetic tests, four syntax checks, bundle checks, and `git diff --check`. The bundle is installed and its plugin row is active; replacing the package requires a DSH restart to load a fresh Client module generation, after which the main workspace still needs GUI validation. Earlier screenshots confirmed only the previous right-sidebar reader/PDF view. The user's current library setting has shown an unreadable-database error, whose root cause and real-library schema/path compatibility remain unresolved; automated checks do not read the real library.
