# DSH 本地 Zotero 侧栏阅读器

- Author: 用户（DSH 对话）
- Source: DSH Web GUI 会话
- Status: Accepted — 用户要求编写计划并构建
- Date: 2026-11-15

## Problem

用户希望在 DSH 内直接浏览和阅读本机 Zotero 文库中的论文，不必启动 Zotero 桌面端，也不满足于只有模型工具、没有可见阅读侧栏的 MCP 集成。

## Proposed outcome

提供一个 DSH 右侧栏插件：读取本机 `zotero.sqlite` 中的文库、分类和条目，并在侧栏内显示论文 PDF。每次查询从本地库读取最新状态，Zotero 关闭时仍可使用；插件严格只读，不把文献内容上传到云端。

## Affected users and systems

- 受影响用户：当前 DSH profile 的用户。
- 系统：DSH Host/Web Client、当前用户的 Zotero 数据目录和本地附件文件。
- 决策方：用户；实现者：本次 DSH agent。

## Constraints

- 以用户最新澄清为准：目标是本地 Zotero 实时读取，不是 Zotero Web API 云端登录。
- 不修改 Zotero 数据库、附件或 Zotero profile；不提交任何用户文献内容。
- Host 侧只读 SQLite；浏览器只经 DSH 同源路由读取数据/PDF。
- 优先兼容当前 DSH 0.2.1-rc 系列及 Windows 环境；标准数据目录可自动发现，定制目录可配置。

## Out of scope

- 创建、编辑、删除条目/分类/笔记或标注。
- 云端 Zotero 登录、API Key/OAuth、跨设备同步。
- OCR、PDF 翻译、批注回写、模型写库工具。
- 未同步到本机的附件、第三方网盘附件和任意外部文件路径。

## Open questions

- 若 Zotero 使用非标准数据目录，需要在 DSH 插件设置中填入目录；默认自动探测 `~/Zotero`。
- SQLite 正被 Zotero 同步/索引锁定时，插件将显示可重试的忙碌提示；不绕过锁或复制并写入数据库。