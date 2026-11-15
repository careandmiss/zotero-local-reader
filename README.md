# DSH Zotero local reader

## 使用说明

1. 在 DSH 的 **Plugins > Add plugin** 中添加本仓库目录。
2. 如 Zotero 数据目录不是默认位置，在插件设置中把 `dataDir` 配为包含 `zotero.sqlite` 的目录；也可直接配置数据库文件路径。留空时使用本机标准目录发现。
3. 从 DSH 左侧导航打开 **Zotero 本地库**：主视图左侧为集合树和可搜索标签，右侧为紧凑可排序文献表。打开条目后切换到主工作区的全宽 PDF 阅读视图；“信息/PDF”页签可查看元数据或 PDF，返回后保留文库筛选状态。右侧栏入口仅用于元数据快速预览，并可将全文阅读转到主工作区。

每次查询都会读取当前本机 SQLite 状态，面板每 15 秒自动刷新，也可使用顶部刷新按钮。Zotero Desktop 无需保持运行。

## 数据与限制

- 插件以只读方式访问本机 Zotero SQLite，并且只读取 Zotero `storage/` 下的 PDF 附件。
- 不读取外部链接附件，不编辑文献、注释或文件，也不搜索 PDF 全文。
- 不调用 Zotero Web API 或云服务，不向外部发送文库内容。
- 测试仅使用临时合成数据库和合成 PDF；仓库不应包含真实文库、论文文件或凭证。

## 实现状态

本轮根据用户截图和已安装文献库插件的源码纠正了布局：主工作区为“集合/标签 + 条目列表”两栏；打开条目后进入全宽阅读模式，PDF 默认显示；右侧栏保留元数据快速预览并可跳转到主工作区阅读。只读标签 API 与标签筛选已添加。27 项合成测试、四项语法检查、bundle 检查和 diff 检查全部通过；源码级 UX 与 API 复审无阻塞项。新 bundle 已应用到当前 DSH profile 且插件显示 active，但 live 视觉效果尚未验证；请刷新/重启现有 GUI 后验收。此前真实库设置曾出现“无法读取 Zotero 数据库”，根因仍未定位；自动化仅使用合成 fixture，没有读取真实数据库或论文内容。

## English

This DSH Host + Client bundle provides a two-pane Zotero library view in the main workspace: collections and searchable tags on the left, a compact item list on the right. Opening an item switches to a full-width reader with PDF as the default view and a return-to-library action that preserves filters. The right sidebar remains a metadata quick preview and can route full reading to the main workspace. Add this repository through **Plugins > Add plugin**. Set `dataDir` in plugin settings to the folder containing `zotero.sqlite` when standard directory discovery does not find the library. Open **Zotero local library** from the left navigation to browse/collapse collections, filter by tag, search by title/author/abstract, sort from the title/creator/date headers, and read Zotero-managed PDFs.

The plugin reads SQLite in read-only mode, refreshes the panel every 15 seconds, and does not require Zotero Desktop to remain open. It supports PDFs below Zotero `storage/` only; linked external files, PDF full-text search, record editing, Zotero Web API, and cloud services are out of scope. All 27 synthetic tests, four syntax checks, bundle validation, and `git diff --check` pass; source-level UX and API reviews found no blockers. The updated bundle is applied to the current DSH profile and its plugin row is active, but the live UI has not been visually verified; refresh/restart the existing GUI before review. The unreadable-database state for the real-library setting remains unresolved; automated checks use synthetic data only and do not inspect the real library.
