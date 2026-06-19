# AGENT_CONTEXT.md - ClipMate v0.8 冻结交接

更新日期：2026-06-19

## 冻结基线

- 目录：`clipmate-v0.8/`
- 最终版本：`0.8.5`
- 发布分支：`codex/clipmate-v0.8-asset-picker`
- 状态：v0.8.3-v0.8.5 已开发并通过 lint、2010 项测试、正式构建和生产依赖审计。

## 关键实现

- `src/platforms/notion/blocks.ts`：结构化 Markdown/ClipDocument 到 Notion block，评论上下文兼容路径。
- `src/content/parser/codeContainers.ts`：代码容器预处理和 SyntaxHighlighter 布局表恢复。
- `src/shared/markdown/codeLanguageDetection.ts`：DOM 提示、highlight.js、本地 ML 的混合代码语言识别。
- `public/model/`：随扩展发布的模型 JSON 和权重，不访问远程模型服务。
- `src/content/assetPicker/assetPickerController.ts`：视口变化下的悬停框同步与清理。
- `src/shared/types/history.types.ts`、`src/options/components/HistoryTab.tsx`：动作类型、复制目标与安全 Notion 链接。
- `tests/v083-human-qa-regressions.test.ts`、`tests/v084-code-detection.test.ts`、`tests/v085-interaction-history.test.ts`：本轮回归覆盖。

## 安全边界

- Notion token 仅保存在 `chrome.storage.local`，请求仅发往 manifest 中已有的 `https://api.notion.com/*`。
- 模型和权重随扩展本地发布；不上传代码或用户页面内容到识别服务。
- 不新增 cookie、下载、文件上传、远程代码、私有平台 API 或跨站 host 权限。
- Shadow DOM 的 `innerHTML` 仅包含编译期静态模板，不插入页面或用户内容。

## 续作规则

- v0.8.5 提交并推送后禁止继续修改本目录；后续开发进入 `clipmate-v0.9/`。
- v0.8 只允许从冻结提交切出紧急修复分支，禁止继续叠加 v0.9 产品功能。
- 不提交 `node_modules`、`dist`、zip、测试截图、token 或用户内容。
