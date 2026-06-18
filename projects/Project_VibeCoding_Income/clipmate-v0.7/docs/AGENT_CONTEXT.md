# AGENT_CONTEXT.md - ClipMate v0.7

更新日期：2026-06-19

## 当前开发版本

- 分支：`codex/clipmate-v0.7-tutorial-mode`
- 目录：`clipmate-v0.7/`
- 版本：`0.7.3`
- 状态：v0.7.1-v0.7.3 小版本修复已完成并通过自动化验证；等待真实浏览器与 Notion 候选验收。

## 冻结版本

- `clipmate-v0.1/` 到 `clipmate-v0.4/`：历史快照。
- `clipmate-v0.6/`：v0.6 Asset Pipeline 稳定快照，禁止在 v0.7 工作中修改。
- `clipmate-v0.5/`：已按用户要求迁移为 v0.6，不存在独立目录。

## v0.7 主目标

Tutorial Mode Document Model：

- `ClipMode` 支持 `tutorial`。
- `features/document` 提供 `ClipDocument` 与结构化 block union。
- content script 从教程 Markdown 与原页面媒体元素生成结构化文档。
- Notion adapter 消费 `ClipDocument`，保留教程关键结构。
- Popup、草稿和 History 识别教程 mode。

## 关键实现

- `src/features/document/clipDocument.ts`：解析 Markdown，生成 heading/paragraph/code/formula/table/callout/figure/video/divider。
- `src/content/index.ts`：`EXTRACT_TUTORIAL` 路由、视频链接采集、ClipDocument 装配。
- `src/platforms/notion/blocks.ts`：教程结构到原生 Notion blocks。
- `src/popup/components/ClipModeToggle.tsx`：三段模式选择。
- `manual-fixtures/tutorial-mode.html`：人工测试样例页。
- `src/features/document/videoPage.ts`：已知视频页四字段摘要。
- `src/shared/media/videoUrl.ts`：视频 URL/provider 统一规则。
- `src/features/document/tutorialDiagnostics.ts`：仅教程模式使用的未知资源诊断。
- `docs/V0.8_PLAN.md`：v0.8 路线图，P0 为 Asset Picker。

## 不变边界

- 不新增依赖、manifest 权限或 host permission。
- 不下载/上传/缓存视频；仅保存当前页面 DOM 中的 HTTP(S) 视频链接元数据。
- 不启用 Notion File Upload，不使用私有 Notion API、cookie、OCR、截图或 AI API。
- Token、Page ID、正文和完整 Markdown 不得写入测试文档或日志。

## 续作规则

- v0.7.1 已修复站点代码容器、分隔线、BBC 题注、Popup 图片预览和教程 History mode 竞态。
- v0.7.2 已修复 Notion 合并头部、大表拆分、图片空题注和结构化错误反馈。
- 不得改写 v0.7.1 / v0.7.2 / v0.7.3 提交边界；新的补丁必须独立提交。
- 人工测试发现的问题继续在 v0.7 分支和目录小步修复，每个 patch 独立验证和 commit。
- v0.7 人工验收完成后冻结目录并保留本地 zip。
- v0.8 必须从 v0.7 稳定提交创建新 `codex/` 分支和 `clipmate-v0.8/` 目录。
