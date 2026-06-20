# AGENT_CONTEXT.md - ClipMate v0.9

更新日期：2026-06-20

## 当前版本

- 目录：`clipmate-v0.9/`
- 版本：`0.9.3`
- 分支：`codex/clipmate-v0.9-page-aware`
- 状态：v0.9.3 已冻结并生成商店提交版，等待真实 Chrome/Edge/Notion 人工验收

## 核心实现

- `src/shared/markdown/codeLanguageDetection.ts`：有状态 fenced code 解析，只增强无语言起始围栏。
- `src/features/capture/clipDraft.ts`：URL 与 `sourceTabId` 双重草稿恢复门禁。
- `src/shared/utils/pageTypeDetector.ts`：主类型、多特征候选和技术代码容器统计。
- `src/shared/utils/pageAwareModes.ts`：模式家族、脱敏候选、技术文章自动采用策略。
- `src/shared/siteProfiles/`：路由和 AI 对话 selector hints。
- `src/content/aiConversation/`：ChatGPT、DeepSeek、豆包完整对话与角色选区提取。
- `src/content/extractors/extractionQuality.ts`：全文多候选质量评估和受保护结构门禁。
- `src/content/extractors/articleBoundaryGuard.ts`：精确 token/角色噪声清理。
- `tests/fixtures/v092/`：Runoob、DeepSeek、豆包脱敏最小 fixture。

## 不变量

- 内部模式 ID 继续使用 `fullpage / selection / tutorial`，History 不迁移；UI 显示全文、选区、自适应。
- 页面感知不新增 URL、正文、DOM、选区文本或原始 detector signals 持久化。
- 推荐只依据当前页，不学习站点/全局频率，不新增偏好存储。
- 真实 DOM table 转 Notion table；HTML 示例代码保持 code block，不执行任意 HTML。
- 旧全文结果永远是保底候选；新候选丢失标题、代码、列表、表格、公式或图片时不得替换。
- 不新增权限、遥测、远程模型、Cookie、字幕、下载、私有 API 或完整 HTML 离线归档。

## 验证与续作

- 当前快照：lint 通过；64 files / 2043 tests；build 171 modules；manifest 0.9.3。
- Playwright mock popup 已验证自适应首次采用、推荐去重、模式展开、手动覆盖和零控制台错误。
- 提交版位于 `release-submissions/clipmate-v0.9.3-submission/`，zip 为 26 个条目且根目录直接包含 manifest。
- 下一步是用户对精确提交包执行真实 Chrome/Edge 与 Notion 人工验收，然后在两个商店后台提交。
- 不提交 `node_modules`、开发 `dist`、`.playwright-cli`、截图、Token 或用户内容；本次仅按用户指令提交隔离的审核 zip。
