# CURRENT_STATUS.md - ClipMate v0.9 当前状态

更新日期：2026-06-19

## 版本边界

- `clipmate-v0.1/` 到 `clipmate-v0.8/`：历史冻结目录。
- `clipmate-v0.8/` 最终版本为 v0.8.5，冻结提交 `2ce7c58` 已推送。
- `clipmate-v0.9/`：当前 v0.9.0 页面感知模式目录。
- 当前分支：`codex/clipmate-v0.9-page-aware`。

## v0.9.0 交付

- 复用 Page Type Detector，在 content script 内生成脱敏的 `PageAwareness`。
- Popup 按文章、视频、讨论、AI 对话、搜索、导航和未知页面推荐模式并解释原因。
- 默认只显示相关模式，“更多模式”始终恢复全文、选区、教程全部能力。
- 视频页教程模式显示为“视频收藏”，讨论页选区显示为“评论选区”，导航页全文显示为“页面摘要”。
- 高置信度视频/AI 页首次自动采用结构化模式；现有选区、恢复草稿和用户手动切换不会被覆盖。
- 推荐异常或 detector 失败时继续使用原全文链路。
- 未新增 manifest 权限、host permission、远程 API、依赖或 storage schema。

## 自动化与构建

- `npm run lint`：通过，0 errors。
- `npm run test`：62 files / 2028 tests 全部通过。
- `npm run build`：通过，168 modules transformed；`dist/manifest.json` 为 0.9.0。
- `npm audit --omit=dev`：生产依赖 0 漏洞；8 项完整 audit 告警仅属于开发工具链。
- `npm run zip`：`clipmate-v0.9.zip` 为 948206 bytes / 28 entries，manifest 0.9.0，包含本地代码模型且无危险父路径。
- Playwright：真实构建 Popup 在视频 mock 页自动进入“视频收藏”；“更多模式”展开三种模式；点击“全文”后保持全文，不被自动切回。
- 浏览器控制台仅有本地 preview 的 `/favicon.ico` 404，无应用错误。

## 发布边界

- 浏览器验证使用无 Token、无 Page ID、无真实用户内容的本地 mock。
- 未使用真实 Notion 凭据，Notion 保存沿用 v0.8.5 已测试链路。
- 正式 Chrome/Edge 解压扩展与真实 Notion 冒烟仍建议在首次分发前执行。
