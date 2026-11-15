# DSH Zotero local reader

## 使用说明

1. 在 DSH 的 **Plugins > Add plugin** 中添加本仓库目录。
2. 如 Zotero 数据目录不是默认位置，在插件设置中把 `dataDir` 配为包含 `zotero.sqlite` 的目录；也可直接配置数据库文件路径。留空时使用本机标准目录发现。
3. 从 DSH 左侧导航打开 **Zotero 本地阅读器**：主视图左侧为集合树和可搜索标签，右侧为紧凑可排序文献表；点击条目进入带返回按钮的沉浸式主工作区阅读视图。正常情况下入口直接显示在左侧导航；只有手动取消固定后，才会出现在“更多”菜单（该菜单由 DSH 的面板操作入口提供）。可用图钉重新固定，但插件重载后固定状态可能重置。在有活动会话的页面打开右侧栏 Zotero 元数据预览，选择文献后可选择“在侧栏打开 PDF”或“在主工作区阅读 PDF”；侧栏 PDF 使用 DSH 原生文档预览画布，可由宿主全屏控件扩展为全屏。

若插件管理器显示“已启用”，但左侧导航和“更多”中都没有入口，说明 Host 插件启用状态尚不能证明浏览器 Client 入口已加载；请刷新/重启现有 DSH GUI 后再检查。仍无入口时，可打开 **设置 > 插件 > 插件列表（Plugin list）** 查看 Client 同步失败及重试提示，再把该页截图发给维护者。

每次查询都会读取当前本机 SQLite 状态，面板每 15 秒自动刷新，也可使用顶部刷新按钮。Zotero Desktop 无需保持运行。

## 数据与限制

- 插件以只读方式访问本机 Zotero SQLite，并且只读取 Zotero `storage/` 下的 PDF 附件。
- 不读取外部链接附件，不编辑文献、注释或文件，也不搜索 PDF 全文。
- 不调用 Zotero Web API 或云服务，不向外部发送文库内容。
- 测试仅使用临时合成数据库和合成 PDF；仓库不应包含真实文库、论文文件或凭证。

## 实现状态

目标已按用户最新截图更新为优先采用 DSH 原生 document-preview PDF canvas（截图 2/3 的页面/工具栏风格），而不是只用普通 iframe（截图 1）。侧栏 resource tab 已改为通过只读同源 Zotero API 获取有上限的 PDF 字节，并交给 DSH 原生 PDF body slot；主工作区流式阅读器保留为备用。27 项合成测试、四项语法检查、bundle 和 diff 检查已通过；只读 API/UX 复审没有剩余 blocker。已知范围限制：全局文库行仍走主工作区备用阅读器，多个附件只选第一个 PDF，下载过程暂无百分比进度。原生阅读器实现已提交并推送为 `0566b06`；入口名称与“更多”导航提示修正已推送为 `bb87ac8`。当前 DSH profile 已启用并链接到此工作区；尝试安装更新时插件管理器返回 `already-installed`（`changed:false`），因此没有移除或重装 bundle，也未改 profile 配置。需重启/刷新现有 GUI 使运行时重新加载源文件，再由用户验收；当前没有 agent 控制的认证浏览器。此前真实库设置曾出现“无法读取 Zotero 数据库”，根因仍未定位；自动化仅使用合成 fixture，没有读取真实数据库或论文内容。

## English

This DSH Host + Client bundle provides a two-pane Zotero library in the main workspace: collections and searchable tags on the left, a compact item list on the right. Clicking an item opens the immersive main-panel reader with a floating return action. In a DSH session, the separate right-sidebar metadata preview offers both “Open PDF in sidebar” and “Read PDF in main workspace”; the side tab uses DSH's native document-preview PDF canvas, and the rightbar fullscreen control expands that same tab to fullscreen. Add this repository through **Plugins > Add plugin**. Set `dataDir` in plugin settings to the folder containing `zotero.sqlite` when standard directory discovery does not find the library. Open **Zotero Local Reader** from the left navigation; it is normally shown there. Only if manually unpinned does it move under **More** (when DSH's panel-actions menu is available). The pin is temporary and may reset when DSH reloads plugins. Browse/collapse collections, filter by tag, search by title/author/abstract, sort from the title/creator/date headers, and read Zotero-managed PDFs. If the Plugin Manager says Enabled but the entry is absent from both places, that confirms Host activation only; refresh/restart the existing DSH GUI. If still absent, open **Settings > Plugins > Plugin list** and check for Client synchronization failures or a Retry action.

The plugin reads SQLite in read-only mode, refreshes the panel every 15 seconds, and does not require Zotero Desktop to remain open. It supports PDFs below Zotero `storage/` only; linked external files, PDF full-text search, record editing, Zotero Web API, and cloud services are out of scope. The native DSH PDF-canvas implementation is committed and pushed as `0566b06`; the clearer “Zotero Local Reader” label and More-menu guidance are in `bb87ac8`. 27 synthetic tests, four syntax checks, bundle validation, diff checks, and source API/UX reviews pass. The current DSH profile already has the bundle enabled and linked to this workspace. An install attempt returned `already-installed` (`changed:false`), so no bundle removal/reinstall or profile configuration change was made. Restart/refresh the existing GUI to reload the current source, then complete visual acceptance; the agent has no authenticated browser control. The unreadable-database state for the real-library setting remains unresolved; automated checks use synthetic data only and do not inspect the real library.
