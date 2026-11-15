# DSH Zotero local reader

## 使用说明

1. 在 DSH 的 **Plugins > Add plugin** 中添加本仓库目录。
2. 如 Zotero 数据目录不是默认位置，在插件设置中把 `dataDir` 配为包含 `zotero.sqlite` 的目录；也可直接配置数据库文件路径。留空时使用本机标准目录发现。
3. 从 DSH 左侧导航打开 **Zotero 本地库**：使用类似 Zotero 文库的集合树、紧凑可排序表格和右侧检查器。标题/作者/日期列头切换排序；右侧“信息/PDF”页签查看元数据或阅读本地 PDF。右侧栏仍保留紧凑的快速阅读入口。

每次查询都会读取当前本机 SQLite 状态，面板每 15 秒自动刷新，也可使用顶部刷新按钮。Zotero Desktop 无需保持运行。

## 数据与限制

- 插件以只读方式访问本机 Zotero SQLite，并且只读取 Zotero `storage/` 下的 PDF 附件。
- 不读取外部链接附件，不编辑文献、注释或文件，也不搜索 PDF 全文。
- 不调用 Zotero Web API 或云服务，不向外部发送文库内容。
- 测试仅使用临时合成数据库和合成 PDF；仓库不应包含真实文库、论文文件或凭证。

## 实现状态

本地数据库读取、文献浏览与 PDF 路由功能已实现；主工作区现采用常见 Zotero 文库层级（集合树、语义化可排序表格、右侧“信息/PDF”检查器），保留右侧栏快速阅读入口，界面颜色仍遵循 DSH theme tokens。25 项合成测试、四项语法检查、bundle 检查和 diff 检查通过。当前 desktop profile 中插件仍为 active，但本轮 Client 样式改动尚未在 GUI 载入；请在这轮更新后重启 DSH 再验收。没有参考截图，因此只对齐结构/密度，不声称像素级复刻。此前截图仅确认旧右侧栏版本；新主工作区和本轮样式尚无视觉验证。另一次使用当前文库设置时出现“无法读取 Zotero 数据库”，根因尚未定位；自动化检查只用合成 fixture，未读取真实库内容。

## English

This DSH Host + Client bundle provides a three-pane Zotero-style library workspace in the main area, plus a compact right-sidebar reader. Add this repository through **Plugins > Add plugin**. Set `dataDir` in plugin settings to the folder containing `zotero.sqlite` when standard directory discovery does not find the library. Open **Zotero local library** from the left navigation to browse/collapse collections, search by title, author, or abstract, sort from the title/creator/date headers, inspect metadata in the Info tab, or read Zotero-managed PDFs in the PDF tab.

The plugin reads SQLite in read-only mode, refreshes the panel every 15 seconds, and does not require Zotero Desktop to remain open. It supports PDFs below Zotero `storage/` only; linked external files, PDF full-text search, record editing, Zotero Web API, and cloud services are out of scope. This style pass passes all 25 synthetic tests, four syntax checks, bundle checks, and `git diff --check`. The desktop profile still shows the plugin active, but the current DSH process predates this style pass; restart DSH to load the changed Client source. The main workspace has not been visually verified, and no exact Zotero reference screenshot/version was supplied. Earlier screenshots confirmed only the previous right-sidebar reader/PDF view. The user's current library setting has shown an unreadable-database error, whose root cause and real-library schema/path compatibility remain unresolved; automated checks do not read the real library.
