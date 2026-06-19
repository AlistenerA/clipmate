# AGENT_CONTEXT.md - ClipMate v0.9

更新日期：2026-06-19

## 当前版本

- 目录：`clipmate-v0.9/`
- 版本：`0.9.0`
- 分支：`codex/clipmate-v0.9-page-aware`
- 基线：冻结的 v0.8.5 提交 `2ce7c58`

## 核心实现

- `src/shared/utils/pageTypeDetector.ts`：既有本地页面类型检测。
- `src/shared/utils/pageAwareModes.ts`：纯函数推荐、标签、首次自动采用守卫。
- `src/content/pageAwareness.ts`：DOM 到脱敏页面感知上下文的接线层。
- `src/content/index.ts`：全文、教程、选区响应附加可选页面感知字段。
- `src/popup/components/ClipModeToggle.tsx`：推荐、原因、主要模式和“更多模式”。
- `src/popup/App.tsx`：首次自动采用、草稿恢复和用户覆盖生命周期。
- `tests/v090-page-aware-modes.test.tsx`：策略、DOM 接线、React 安全渲染和覆盖守卫。

## 不变量

- 页面推荐是 UI 导航，不是权限或功能锁；三个既有模式始终可用。
- 跨消息与草稿只保留类型、置信度、布尔值和固定推荐文案，不保存 detector 原始 signals。
- 不将页面正文、选择文本、DOM、URL 或 detector reasons 新增到页面感知字段。
- 不新增权限、网络目标、遥测、远程模型、cookie、字幕或私有 API。
- v0.8 及更早目录禁止修改；后续修复只进入 v0.9 分支。

## 续作方向

- v0.9.x 可评估独立视频收藏数据模型、站点级用户偏好和更多真实站点校准。
- 任何持久化用户偏好都必须先设计 schema 迁移和禁用入口。
- 不提交 `node_modules`、`dist`、zip、`.playwright-cli`、测试截图、Token 或用户内容。
