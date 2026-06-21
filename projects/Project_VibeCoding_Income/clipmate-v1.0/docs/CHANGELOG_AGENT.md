# CHANGELOG_AGENT.md — ClipMate v0.9 每轮修改记录

## v1.0.1 License foundation（2026-06-21）

- 从冻结 v0.9.3 隔离创建 `clipmate-v1.0/`，版本更新到 1.0.1。
- 新增 `src/pro/`、后台 License handler/lifecycle、Options 激活卡和三步 Onboarding。
- 新增 `alarms` 与精确 License host permission；staging/production 构建地址隔离。
- 新增授权、API、后台、Onboarding 与 manifest 测试。
- 更新隐私政策、权限说明、状态和交接文档。

---

---

## v0.9.3 提交版冻结与商店归档（2026-06-20）

- 冻结 `clipmate-v0.9/` v0.9.3，不再新增功能。
- 新建 `release-submissions/clipmate-v0.9.3-submission/`，包含最小运行目录、商店 zip、发布说明、商店文案和审核清单。
- 将生成的 Popup/Options HTML 入口规范到包根目录，移除未引用的图标源文件和 512 图标，提交包不含开发 `src/` 目录。
- 逐项核对 manifest 权限、Notion 数据传输、远程代码、敏感信息、zip 路径和运行资源引用。
- 最终 zip 为 924131 bytes / 26 entries，根目录唯一 manifest 0.9.3，SHA-256 `CE507BAF3E80E07F6EE778FDCCD6DDA0264F0651924FD67BCCFB5DA966318226`。

## v0.9.1-v0.9.3 人工测试修复与自适应增强（2026-06-20）

- v0.9.1 修复 fenced code 关闭围栏误改、相邻代码/正文顺序、同 URL 双标签页草稿串扰与重复模式提示。
- v0.9.2 引入主类型加多特征候选、AI 对话适配、GitHub 路由、角色选区和高置信技术文章首次自适应。
- v0.9.3 引入全文多候选、受保护结构质量门禁和精确噪声规则，保留旧提取永久兜底。
- 新增 3 份脱敏 fixture、3 个 v0.9.x 测试面和扩展既有架构/站点 profile 回归。
- 版本统一为 0.9.3；未新增依赖、权限、host permission、远程服务或持久化偏好。
- 全量 lint/test/build 与隔离 Popup QA 通过；真实浏览器和 Notion 仍作为人工发布门禁。

## v0.9.0 页面感知模式（2026-06-19）

- 从冻结的 v0.8.5 创建独立 v0.9 分支与目录。
- 将既有 Page Type Detector 接入提取响应，输出最小化的页面感知上下文。
- 新增可解释的模式推荐、页面特定标签、主要模式和“更多模式”入口。
- 高置信度视频/AI 页首次自动采用结构化模式；选区、恢复草稿和用户选择优先。
- 新增 18 项 v0.9 测试，完整套件为 62 files / 2028 tests。
- Playwright 验证真实构建 Popup 的推荐、展开和用户覆盖交互。
- 版本号更新为 0.9.0；无新增依赖、权限、host permission、远程 API 或 storage schema。

---

## v0.8.5 交互与 History 收口（2026-06-19）

- Asset Picker 记录当前悬停候选和指针坐标；滚动/缩放时重算位置，图片仍在指针下时边框随图移动，离开后立即隐藏。
- History 新增 `notion-save` / `markdown-copy` 行为元数据，复制记录标明 Notion、Obsidian、Typora 或通用 Markdown。
- Notion 成功记录保存由 page ID 构造的页面链接；Options 仅渲染 HTTPS 且主机为 `notion.so` 的链接。
- Markdown 复制仅在剪贴板写入成功且历史开关开启时记入 History，失败复制不产生误记录。
- 版本号更新为 0.8.5；未新增权限、host permission、远程 API 或敏感历史字段。

---

## v0.8.4 混合代码识别（2026-06-19）

- Readability 前将 `example_code`、`codehilite`、`syntaxhighlighter` 规范成标准 `pre/code`，一行短代码不再被压成正文。
- 博客园/JB51 SyntaxHighlighter 的 gutter/code 布局表按代码行提取，移除行号并阻止误转 Markdown 数据表。
- 加入限定 9 种常用语言的 highlight.js fast path；低置信度时在 Popup 内懒加载微软语言检测模型复核。
- 模型 JSON/权重作为扩展本地静态资源进入 `dist/model/`，无外部模型请求、无新增权限或 web-accessible resource。
- 教程 `ClipDocument` 与 Markdown 同步补齐语言，Notion code block 使用同一检测结果。
- 版本号更新为 0.8.4；新增 `highlight.js@11.11.1` 与 `@vscode/vscode-languagedetection@1.0.23`。

---

## v0.8.3 全文结构与图片语义修复（2026-06-19）

- 全文 Markdown 改用既有 `ClipDocument` 结构解析器生成 Notion blocks，表格、标题、列表和代码不再压成普通段落。
- 图片 alt 仅保留为替代文本，不再自动充当 Notion 题注；真实 figcaption 只输出一次。
- 过滤“在这里插入图片描述”等站点占位文案，原文无题注时保持空 caption。
- Notion metadata callout 优先使用经过 HTTP(S) 校验的网站图标，不安全或缺失 URL 回退书签 emoji。
- 新增 v0.8.3 人工问题回归；版本号更新为 0.8.3，未新增权限、host permission 或远程请求。

---

## v0.8.2 教程结构保真修复（2026-06-19）

- Readability 开启 `keepClasses`，让 Runoob `example_code` 在完整提取链路中保留并转 fenced code。
- 修复 `1\.` 数字标题；只规范 heading 行，不改普通段落转义。
- `ClipDocument` 新增 list block，Notion 输出原生 bulleted/numbered list item。
- 无来源题注的自动图和手选图保持空 alt/caption，不再显示伪 `image` 或“网页图片”题注。
- 新增 4 个截图回归测试，以及 22 图上限、无候选、失效外链三张离线 fixture。
- 版本号更新为 0.8.2；未新增依赖、权限、host permission 或 storage schema。

---

## v0.8.1 Asset Picker 可靠性修复（2026-06-19）

- 修复 Popup 重开时先消费 completed session、后恢复草稿导致手选图片永久丢失的竞态。
- 选图启动成功后自动关闭 Popup，用户无需再手动点击网页让出焦点。
- 切换全文/选区/教程前先取消 active picker；并用 request id 防止旧提取结果覆盖新模式。
- 页面卡片遮罩接收点击时按坐标回落到实际图片，修复 VCG-like 图集候选可见但无法点选。
- 正文内不小于 80x80 的技术 logo 允许用户显式选择；站点页头 logo、头像、图标等仍过滤。
- 新增 session 恢复、跨页丢弃、正文 logo、遮罩点击回归；版本号更新为 0.8.1。
- 未新增依赖、manifest 权限、host permission、网络请求或持久化字段。

---

## v0.8.0 Asset Picker（2026-06-19）

- 从冻结的 v0.7.3 基线创建独立 `clipmate-v0.8/` 目录。
- 新增带 session id 的页面图片选择协议，旧会话不能覆盖新草稿。
- 新增 Shadow DOM 页面工具条、候选高亮、点击选择、完成、取消和 Escape 清理。
- 候选复用 lazy/srcset/picture 解析、噪声过滤和 Asset Pipeline；隐藏元素与非 HTTP(S) URL不进入选择链路。
- Popup 新增图片预览、移除、排序和 20 张上限；重开 Popup 后恢复当前页完成结果。
- Markdown 幂等追加手选图片，删除全部手选图片后恢复提取基线。
- 教程模式 Notion blocks 支持手选图片并对 ClipDocument figure 去重。
- 新增定向测试、离线 fixture 与 `V0.8_TEST_DOCUMENT.md`。
- 版本号更新为 0.8.0；依赖、权限和 host permission 均未增加。
- 创建并切换到独立分支 `codex/clipmate-v0.8-asset-picker`，V0.7 分支和目录保持冻结。

---

## v0.7.3 视频页与测试诊断（2026-06-19）

- 已知视频页使用 canonical URL、meta description 和公开 DOM 评论数生成精简摘要。
- Popup 新增视频卡片；Notion 对 YouTube/Vimeo/direct video 输出 video block，其他 provider 输出 bookmark。
- 新增教程模式未知资源诊断面板，诊断数据与复制、Notion blocks、History 正文隔离。
- 新增 `tests/v073-video-diagnostics.test.ts`，覆盖视频摘要、普通文章旁路、预览卡片、Notion provider 降级和诊断隔离。
- 版本号更新为 0.7.3；未新增依赖或权限。
- 手动图片点选已规划到 `docs/V0.8_PLAN.md` 的 P0 Asset Picker。

---

## v0.7.2：Notion Save Resilience (2026-06-19)

### 修复

- 解析标准 author、`article:published_time` / `datePublished` / `time[datetime]` 元数据。
- 用单一 `🔖` callout 合并来源、站点、作者、发布日期、模式、剪藏时间与标签，减少重复头部行。
- 教程 table 超过 100 个嵌套 children 时拆成多张表并重复表头。
- 空 equation 降级为文本；教程图片无实际题注时输出空 caption，不再用 alt 冒充题注。
- Notion 客户端区分 validation、conflict、rate limit、service unavailable，返回失败批次和 HTTP 状态。
- Popup 显示“简短原因 + 错误代码”，History 保存同一短摘要；不保存或显示 API 错误正文。

### 官方文档核对

- Notion Append block children：单次最多 100 个 child block。
- Notion status codes：400 `validation_error`、409 `conflict_error`、429 `rate_limited`。
- Notion table：`table_width` 在创建后不能通过 API 修改。

### 版本与边界

- package/manifest/package-lock 版本更新为 0.7.2。
- 未新增依赖、manifest 权限、host permission 或 storage schema。
- 继续使用官方 Notion API；未采用参考插件的 cookie、私有接口或页面脚本注入方案。

### 验证

- 新增 `tests/v072-notion-resilience.test.ts`，5 个测试；Notion client 新增 2 个错误定位测试。
- `npm run lint` 通过。
- 55 files / 1979 tests 全通过。
- `npm run build` 通过，132 modules transformed。
- 真实 Notion 保存需要用户测试 Integration 和目标页面，仍为人工发布门禁。

## v0.7.1：Tutorial Fidelity & Preview Fixes (2026-06-19)

### 修复

- 识别 Runoob `example_code` 与同类代码容器，保留 `<br>` 换行并保守推断 TypeScript、LaTeX、Python、Java 语言。
- Markdown 预览与 `ClipDocument` 同时识别带空格的 thematic break，避免 `* * *` 显示为杂点。
- BBC `图像加注文字，` 无障碍前缀规范为 `题注：`，其他站点题注保持原样。
- Popup 对安全 HTTP(S) 图片显示实际预览，使用 `no-referrer` 和懒加载；不安全或加载失败时降级为文字。
- Popup 持久化草稿和保存 Notion 时显式传入当前 mode，避免教程模式 History 被竞态写成全文。

### 版本与边界

- package/manifest/package-lock 版本更新为 0.7.1。
- 未新增依赖、manifest 权限、host permission 或 storage schema。
- 未修改 v0.6 及历史版本目录。

### 验证

- 新增 `tests/v071-tutorial-fidelity.test.ts`，5 个回归测试。
- `npm run lint` 通过。
- 54 files / 1971 tests 全通过。
- `npm run build` 通过，132 modules transformed。
- 浏览器运行仍被 Windows 沙箱拒绝，真实 Popup 图片加载保留为人工 QA。

## v0.7.0：Tutorial Mode Document Model (2026-06-18)

### 新增

- 新建独立 `clipmate-v0.7/` 目录和 `codex/clipmate-v0.7-tutorial-mode` 分支，冻结 v0.6。
- 新增 `features/document`：`ClipDocument`、结构化 block union、视频元数据去重与 Markdown 补充。
- Popup 新增“教程”模式，模式切换立即重新提取并清空旧内容。
- content script 新增 `EXTRACT_TUTORIAL`，保留标题、代码、公式、表格、callout、图片题注与视频链接。
- Notion 转换新增 heading/code/equation/table/callout/image/bookmark 输出。
- History mode 扩展为共享 `ClipMode`，Options 显示“教程”。
- 新增 5 个教程模式测试、人工测试 fixture、启动脚本和 `V0.7_MANUAL_RISK_QA.md`。

### 版本与边界

- package/manifest/package-lock 版本更新为 0.7.0。
- 未新增依赖、manifest 权限、host permission 或 storage migration。
- 不下载视频，不访问视频目标内容，不输出或提交敏感数据。

### 验证

- lint 通过。
- 53 files / 1966 tests 全通过。
- build 通过，132 modules transformed。
- 真实 Chrome/Edge/Notion QA 待用户执行。

---

## v0.6.0：Version Folder Promotion & Archive Script (2026-06-17)

### 性质

按用户新的版本隔离规则，将当前已完成的 v0.6 从 `clipmate-v0.5/` 正式迁移为 `clipmate-v0.6/`，并更新活跃版本文档与本地归档命名。

### 修改文件

- `clipmate-v0.5/` → `clipmate-v0.6/` — 版本目录迁移
- `package.json` — zip 脚本从 `clipmate-v0.5.zip` 更新为 `clipmate-v0.6.zip`
- `docs/CURRENT_STATUS.md` / `docs/AGENT_CONTEXT.md` — 当前目录和 v0.6 续作规则更新
- 项目级 `docs/PROJECT_MEMORY.md` / `docs/CODEX_MIGRATION.md` / `docs/PROJECT_ARCHITECTURE.md` — 当前活跃版本更新为 `clipmate-v0.6`

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：51 files, 1959 tests pass
- `npm run build`：成功，dist/manifest.json version = 0.6.0
- `npm run zip`：成功，生成本地 `clipmate-v0.6.zip`

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未新增依赖、未新增 manifest 权限
- 未提交 `dist/` / `node_modules/` / zip

---

## v0.6.0：Asset Pipeline Foundation (2026-06-17)

### 性质

v0.6 架构主线第一步。建立图片 asset pipeline 的纯函数底座和质量报告，不改变现有保存行为，不新增权限，不接入 Notion File Upload。

### 新增文件

- `src/features/assets/assetPipeline.ts` — 定义 `ClipAsset` / `FigureAsset` / `ImageSaveStrategy` / `ImageAssetQualityReport`，支持图片 strategy 选择和质量报告
- `src/features/assets/index.ts` — assets feature barrel export
- `tests/asset-pipeline.test.ts` — 10 个 asset pipeline / Notion save plan asset report 测试
- `docs/V0.6_ASSET_PIPELINE.md` — v0.6 asset pipeline 说明

### 修改文件

- `src/features/notion/notionSavePlan.ts` — `NotionSavePlan` 增加 `assetReport`，报告 Markdown 图片的 ready / candidate / blocked 状态
- `package.json` / `manifest.config.ts` / `package-lock.json` — ClipMate 根版本 0.5.3 → 0.6.0
- `docs/CURRENT_STATUS.md` / `docs/AGENT_CONTEXT.md` / `docs/TEST_LOG.md` / `docs/ISSUES.md` / `docs/DECISIONS.md` — 更新本轮状态、测试和决策

### 测试

- `npx vitest run tests/asset-pipeline.test.ts tests/architecture-foundation.test.ts`：2 files, 18 tests pass
- `npm run lint`：0 errors, 0 warnings
- `npm run test`：51 files, 1959 tests pass
- `npm run build`：成功，dist/manifest.json version = 0.6.0

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未新建 `clipmate-v0.6/`，避免一次性复制 200+ tracked files 与依赖重装
- 未新增依赖、未新增 manifest 权限
- 未启用 Notion File Upload API
- 未下载/上传/缓存图片
- 未改变 Notion blocks 的 external image / paragraph fallback 行为

---

## v0.5.3：Popup Save Summary & Duplicate Save Hints (2026-06-17)

### 性质

优化 Popup 保存体验。支持保存前编辑标题，将原有限正文预览替换为保存摘要区，并基于本地历史记录提示同 URL 重复保存。不新增权限、不改变 Notion API 策略。

### 新增文件

- `src/popup/components/SaveSummary.tsx` — 保存摘要组件，展示站点 icon、可编辑标题、来源、字数、图片数和重复保存提示
- `src/popup/utils/recentHistory.ts` — 从本地 history 中查找同 URL 最近 saved 记录并格式化时间提示
- `tests/popup-recent-history.test.ts` — 8 个 recent history 单元测试

### 修改文件

- `src/popup/App.tsx` — 接入保存摘要、可编辑标题、保存草稿标题、复制 Markdown 标题和 Notion 保存标题；保存成功后刷新重复保存提示
- `src/popup/components/ContentPreview.tsx` — 删除旧的有限正文预览组件，避免与主 Markdown 原文/预览区域重复
- `package.json` / `manifest.config.ts` / `package-lock.json` — ClipMate 根版本 0.5.2 → 0.5.3
- `docs/CURRENT_STATUS.md` / `docs/AGENT_CONTEXT.md` / `docs/TEST_LOG.md` / `docs/ISSUES.md` / `docs/DECISIONS.md` — 更新本轮状态、测试和决策

### 测试

- `npx vitest run tests/popup-recent-history.test.ts`：1 file, 8 tests pass
- `npm run lint`：0 errors, 0 warnings
- `npm run test`：50 files, 1949 tests pass
- `npm run build`：成功，dist/manifest.json version = 0.5.3

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未新增依赖、未新增 manifest 权限
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未修改 Options/History 页面结构
- 未引入 Save to Notion 的私有接口或 cookie 依赖

---

## v0.5.2：CCTV-like Image Source Recovery & Markdown Profile Compatibility (2026-06-17)

### 性质

用户测试 CCTV 新闻页发现正文图片全部丢失，同时 Obsidian / Typora Markdown 输出存在 `**加粗**正文` 紧贴导致的渲染兼容问题。本轮做最小修复，不新增权限、不下载/上传/缓存图片。

### 修改文件

- `src/content/extractors/articleImages.ts` — `getBestSrc()` 统一读取 `src`、`currentSrc`、`data-src`、`data-original`、`data-lazy-src`、`srcset`、`picture source` 和 `video poster`；placeholder/noise src 会让位给真实懒加载图片
- `src/content/parser/htmlToMarkdown.ts` — Markdown 图片转换复用 `getBestSrc()`；新增 video poster Markdown fallback；Markdown 层也应用 ancestor 噪声过滤
- `src/shared/markdown/formatWithProfile.ts` — profile 输出层为 `**bold**text` 补安全空格，跳过 fenced code blocks
- `package.json` / `manifest.config.ts` / `package-lock.json` — ClipMate 根版本 0.5.1 → 0.5.2
- `docs/CURRENT_STATUS.md` / `docs/AGENT_CONTEXT.md` / `docs/TEST_LOG.md` / `docs/ISSUES.md` / `docs/DECISIONS.md` — 更新本轮状态、测试和决策

### 测试

- `npx vitest run tests/article-images.test.ts tests/markdown-images.test.ts tests/markdown-profiles.test.ts`：3 files, 169 tests pass
- `npm run lint`：0 errors, 0 warnings
- `npm run test`：49 files, 1941 tests pass
- `npm run build`：成功，dist/manifest.json version = 0.5.2

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未新增依赖、未新增 manifest 权限
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未修改 Popup/Options UI
- 未引入 Save to Notion 的私有接口或 cookie 依赖

---

## v0.5.1：Architecture Foundation (2026-06-17)

### 性质

v0.5.x 架构级底座更新。以 Save to Notion 参考项目的会话/目标/保存编排思路为参考，但保持 ClipMate 官方 Notion API、最小权限、可测试纯函数边界。

### 新增文件

- `src/features/capture/clipDraft.ts` — ClipDraft 创建、正文读取、可保存判断
- `src/features/capture/index.ts` — capture feature barrel export
- `src/features/session/clipSession.ts` — ClipSession、状态转换、session → SaveToNotionPayload
- `src/features/session/index.ts` — session feature barrel export
- `src/features/notion/notionSavePlan.ts` — NotionSavePlan 生成、保存前校验、blocks 构建
- `src/features/notion/index.ts` — notion feature barrel export
- `tests/architecture-foundation.test.ts` — 8 个架构底座测试
- `docs/V0.5_X_ARCHITECTURE.md` — v0.5.x 架构说明

### 修改文件

- `src/popup/App.tsx` — 草稿缓存和保存入口改用 `createClipDraft()`；保存时创建 `ClipSession` 并转换为 Notion payload
- `src/background/handlers/notionHandler.ts` — 用 `createNotionSavePlan()` 承接 token/page/content 校验、blocks 构建和 retry 元数据
- `package.json` / `manifest.config.ts` / `package-lock.json` — ClipMate 根版本 0.5.0 → 0.5.1
- `docs/CURRENT_STATUS.md` / `docs/AGENT_CONTEXT.md` / `docs/TEST_LOG.md` / `docs/ISSUES.md` / `docs/DECISIONS.md` — 更新本轮状态、测试和决策

### 测试

- `npx vitest run tests/architecture-foundation.test.ts`：1 file, 8 tests pass
- `npm run lint`：0 errors, 0 warnings
- `npm run test`：49 files, 1930 tests pass
- `npm run build`：成功，dist/manifest.json version = 0.5.1

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未新增依赖、未新增 manifest 权限
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未引入 Save to Notion 的私有接口或 cookie 依赖
- 未 git add / commit / push

---

## v0.5 Session 6：Release Readiness (2026-06-14)

### 性质

v0.5 发布前准备和最终审查。不新增功能，不做代码修复。

### 版本统一
- `package.json` version: 0.4.0 → 0.5.0
- `manifest.config.ts` version: 0.4.0 → 0.5.0
- `package-lock.json` version: 0.4.0 → 0.5.0 (2 处)
- zip 脚本: clipmate-v0.4.zip → clipmate-v0.5.zip
- 未修改依赖版本

### 发布文档更新
- `README.md` — 更新为 v0.5，新增 Article Image Saving 章节，更新已知限制、隐私说明、测试数量
- `STORE_LISTING_DRAFT.md` — 更新为 v0.5，新增文章图片保存描述
- `PRIVACY_POLICY_DRAFT.md` — 更新为 v0.5，新增图片 external URL 策略说明、不保存完整图片 URL 列表说明
- `PERMISSION_JUSTIFICATION.md` — 更新为 v0.5，新增 v0.5 权限对比、图片提取不发起网络请求说明
- `TEST_PLAN.md` — 更新为 v0.5，新增 TC-59~TC-73（15 项图片功能 QA）
- `RELEASE_CHECKLIST.md` — 更新为 v0.5，更新版本号/测试数量/图片功能 QA 项

### 安全扫描
- Token/API Key 扫描：0 真实泄露（均为代码变量名/测试假 Token/否定断言）
- 危险 API 扫描：0 发现（无 FileReader/canvas/toDataURL/createObjectURL/file_upload 等）
- 远程代码风险扫描：0 发现（无 eval/new Function/动态 import/远程 script）

### 文档更新
- `docs/CURRENT_STATUS.md` — Session 6 完成
- `docs/CHANGELOG_AGENT.md` — 本轮记录
- `docs/TEST_LOG.md` — 本轮测试记录
- `docs/ISSUES.md` — 更新为 v0.5 发布状态
- `docs/DECISIONS.md` — 新增 D-v0.5-027/D-v0.5-028

### 测试
- `npm run lint`：0 errors, 0 warnings
- `npm run test`：48 files, 1922 tests pass
- `npm run build`：成功，dist/manifest.json version = 0.5.0
- `npm run zip`：成功，clipmate-v0.5.zip (146KB)

### 未修改
- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改源码（`src/` 目录零变更）
- 未新增依赖、未新增权限
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未新增 FileReader/canvas/toDataURL/createObjectURL
- 未 git add / commit / push

---

## v0.5 Session 5.2：Image Caption Placement & Markdown Image Layout Polish (2026-06-14)

### 性质

用户真实测试发现图片题注粘连：`![△特朗普（资料图）](url)△特朗普（资料图）`。

修复 A（Markdown 题注粘连）：
- `htmlToMarkdown.ts` 新增 `splitImageCaptionGlue()` 后处理函数
- 检测 `![alt](url)caption` 粘连模式，当 caption 与 alt 匹配时拆分为 `![alt](url)\n\n*caption*`

修复 B（Notion image.caption）：
- `blocks.ts` `markdownToContentBlocks` 改为 indexed loop，识别图片后紧跟的 `*caption*` 段落
- 合并为单一 image block 的 `image.caption`，不额外输出 caption paragraph
- caption 长度限制 200 字符，超出回退使用 alt

未实现：复制 Markdown 居中 HTML（P2，暂缓；Notion API 不支持 align）

### 修改文件

- `src/content/parser/htmlToMarkdown.ts` — 新增 splitImageCaptionGlue()；在 htmlToMarkdown 管道调用
- `src/platforms/notion/blocks.ts` — markdownToContentBlocks 改为 indexed loop；新增 ITALIC_CAPTION_RE；合并 image+caption

### 新增文件

- `tests/image-caption-layout.test.ts` — 14 个测试

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：48 files, 1922 tests pass（+14）
- `npm run build`：成功

---

## v0.5 Session 5.1：Sina Image Pollution Guard & Notion Image URL Compatibility (2026-06-14)

### 性质

用户真实测试 Sina 新闻页发现两个发布前质量问题：
1. 推荐区/热搜区/侧栏缩略图通过 `injectMissingImages` 污染 Markdown 末尾 `## Images`
2. Sina resize/proxy 型图片 URL 在 Notion 无法渲染

修复 A（正文图片污染）：
- `injectMissingImages` 改为基于正文 HTML fragment（`createFragmentDocument`），不再从整个 document 提取
- `attachImageMetadata` 同样改为基于正文 fragment
- `extractArticleImages` `querySelectorAll` 修复为基于 `root` 元素，修复 Element 参数被忽略的 bug
- 新增 `isNoiseByAncestor()` — 检测 recommend/related/hot/rank/sidebar/feed-card/news-list/trending 等祖先容器
- 新增 Sina 特定噪声 URL 模式：`/default/`、`/sinakd[/.]`、`/api/auto/resize`

修复 B（Notion URL 兼容性）：
- 新增 `isLikelyDirectImageHosting()` — 过滤 resize/proxy 型 URL
- 不兼容 URL（含 `/api/auto/resize`、`/api/` 代理路径、`/resize|crop|thumbnail|thumb` 路径、`?img=` 代理查询）降级为 paragraph block
- 不会阻断正文保存

### 修改文件

- `src/content/extractors/articleImages.ts` — 修复 querySelectorAll 作用域；新增 isNoiseByAncestor()；新增 Sina 特定噪声 URL 模式；导出 isNoiseByAncestor
- `src/content/index.ts` — injectMissingImages / attachImageMetadata 改为基于 createFragmentDocument(contentHtml)；移除未使用的 doc 变量
- `src/platforms/notion/blocks.ts` — 新增 isLikelyDirectImageHosting() 兼容性过滤；tryImageBlock 增加过滤调用

### 新增文件

- `tests/sina-image-pollution.test.ts` — 28 个测试

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改 `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未新增 FileReader/canvas/toDataURL/createObjectURL

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：47 files, 1908 tests pass（新增 28 个）
- `npm run build`：成功

---

## v0.5 Session 5：Manual QA and Site Cases (2026-06-14)

### 性质

使用 12 个站点场景的 fixture QA 验证 v0.5 文章图片保存全链路（提取→Markdown→Notion blocks→Popup/History 元数据）。未执行真实网页 QA、未执行真实 Notion save。不开发新功能，只做 QA + 测试补充 + 文档更新。

### 新增文件

- `tests/image-site-cases.test.ts` — 52 个 QA 场景测试

### 测试覆盖

| 场景 | 测试数 | 覆盖 |
|------|:---:|------|
| 新闻文章 | 7 | 多图 + caption + figure/figcaption + 相对 URL + 噪声过滤 + 元数据 |
| 博客文章 | 5 | figure/figcaption + alt/title + avatar/logo 过滤 + heading/code block 保持 |
| 技术文档 | 5 | 截图 + icon/favicon/emoji/spinner 过滤 + code block 不受影响 |
| CSDN-like | 7 | 懒加载（Turndown data-src/data-original）+ srcset + avatar/badge 过滤 |
| 图片去重 | 3 | extractArticleImages + Markdown + Notion blocks 去重 |
| 噪声过滤 | 4 | logo/avatar/badge/emoji/sprite/thumb/qr/pixel 全过滤 |
| Markdown 图文顺序 | 2 | 文本-图片交错顺序保持 |
| Notion blocks 顺序 | 3 | paragraph-image 交替 + external type 校验 |
| Popup/History 元数据 | 4 | buildHistoryInput + 成功/失败保存路径 |
| selection 回归 | 4 | selection/comment-context 不继承 fullpage 图片信息 |
| 边缘情况 | 5 | data:/blob: URI / 过小尺寸 / 空 alt |
| 全链路 smoke | 2 | extract→markdown→blocks→metadata 集成 |

### QA 发现

- `extractArticleImages.getBestSrc` 不处理 data-src/data-original 懒加载属性（Turndown img rule 正确处理）
- `markdownToContentBlocks` 当前仅输出 paragraph/image blocks（不处理 heading_2 等）
- "ad-banner" class 不在已知噪声 class 列表中（广告图类名多样性，已知局限）

### 修改文件

- `docs/CURRENT_STATUS.md` — Session 5 完成 + Session 进度更新
- `docs/CHANGELOG_AGENT.md` — 本轮记录
- `docs/TEST_LOG.md` — 新增测试记录
- `docs/ISSUES.md` — QA 发现记录
- `docs/DECISIONS.md` — 新增 D-v0.5-018 / D-v0.5-019

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改 `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未修改源码（`src/` 目录无变更）
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未执行真实 Notion save
- 未修改已有测试

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：46 files, 1880 tests pass（新增 52 个）
- `npm run build`：成功

---

## v0.5 Session 4：Popup / History Lightweight Image Metadata (2026-06-14)

### 性质

在 Popup 和 History 中轻量展示文章图片信息（imageCount / firstImageUrl / skippedImageCount），不下载/上传/缓存图片，不保存完整图片 URL 列表。

### 修改文件

- `src/shared/types/clip.types.ts` — `ExtractedContent` 新增 `imageCount?` / `firstImageUrl?` / `skippedImageCount?`
- `src/shared/types/settings.types.ts` — `ClipHistoryItem` 新增 `imageCount?` / `firstImageUrl?` / `skippedImageCount?`
- `src/shared/storage/storage.ts` — `CreateHistoryItemInput` 和 `addHistoryItem()` 新增 image 元数据字段
- `src/popup/utils/historyPayload.ts` — `HistoryInput` 和 `buildHistoryInput()` 新增 image 元数据字段
- `src/background/handlers/notionHandler.ts` — 成功/失败保存路径传递 image 元数据到历史记录；retry update 通过 merge 保留已有 image 元数据
- `src/content/index.ts` — `buildContent()` 默认 selection mode imageCount=0；新增 `attachImageMetadata()` 在 fullpage 路径注入 image 元数据；低信心路径 imageCount=0
- `src/popup/components/StatusBar.tsx` — 新增 `imageCount?` prop，图片>0 时显示紫色「图片 N」徽章
- `src/popup/App.tsx` — 传递 `content.imageCount` 到 StatusBar
- `src/options/components/HistoryItem.tsx` — fullpage mode 下 imageCount>0 时显示紫色「图片 N」标签

### 新增文件

- `tests/image-metadata.test.ts` — 18 个测试

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改 `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未修改 Notion image block 核心逻辑
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未修改 selection / comment-context 图片逻辑
- 未记录完整图片 URL 列表到 history

### 核心能力

- fullpage extraction 自动附加 imageCount / firstImageUrl / skippedImageCount
- selection / comment-context mode：imageCount=0，不显示图片信息
- Popup StatusBar：图片>0 时显示紫色「图片 N」徽章
- HistoryItem：fullpage 且 imageCount>0 时显示紫色「图片 N」标签
- History 存储：save/retry/failed 路径均保留 image 元数据
- updateHistoryItem merge 机制自动保留 retry 时的 image 元数据

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：45 files, 1828 tests pass（新增 18 个）
- `npm run build`：成功

---

## v0.5 Session 3：Notion External Image Blocks (2026-06-14)

### 性质

将 Markdown 图片语法 `![alt](url)` 转换为 Notion `image` block（type: external）。替换 `chunkedParagraphBlocks` 为 `markdownToContentBlocks`，逐段落检测图片并生成 image block。不接入 Notion File Upload API，不下载/上传/缓存图片。

### 修改文件

- `src/platforms/notion/blocks.ts` — 新增 `IMAGE_MARKDOWN_RE`、`isValidExternalImageUrl()`、`tryImageBlock()`、`markdownToContentBlocks()`（导出）；移除未使用的 `chunkedParagraphBlocks`；`buildNotionBlocks()` 使用 `markdownToContentBlocks()`

### 新增文件

- `tests/notion-image-blocks.test.ts` — 29 个测试

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改 `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未修改 Popup/History UI
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未新增 FileReader/canvas/toDataURL/createObjectURL

### 核心能力

- `markdownToContentBlocks()`：替换 `chunkedParagraphBlocks`，逐段落检测 `![alt](url)` 语法
- 仅接受 http/https external URL；data:/blob:/非 http URL 降级为 paragraph block
- image block 使用 `{ type: 'external', external: { url } }` 结构
- alt 文本作为 caption（空 alt → 空 caption）
- 图片转换失败不影响正文段落保存
- comment-context 模式同步受益（共用 `markdownToContentBlocks`）

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：44 files, 1810 tests pass（新增 29 个）
- `npm run build`：成功

### 性质

将 Session 1 的图片提取能力接入 Markdown 生成链路。增强 Turndown `img` rule 的噪声过滤，添加去重后处理，在 Fullpage article clipping 的 Markdown 中保留正文图片语法 `![alt](url)`。

### 修改文件

- `src/content/extractors/articleImages.ts` — 导出 `isNoiseByClassName` / `isNoiseByAttribute` / `isDataUri` / `isBlobUri` 供 Markdown 层复用
- `src/content/parser/htmlToMarkdown.ts` — 增强 `img` Turndown rule（噪声过滤 + 尺寸过滤 + 去重 + alt 兜底 + 相对 URL 解析）；新增 `deduplicateImageMarkdown()` 后处理；新增 `pageUrl` 参数
- `src/content/index.ts` — 引入 `extractArticleImages`；新增 `injectMissingImages()` 安全网（将 Markdown 遗漏的图片追加到末尾 Images 区块）；`buildContent` 和 fallback 路径传递 `pageUrl`

### 新增文件

- `tests/markdown-images.test.ts` — 28 个测试

### 未修改

- 未修改 selection / comment-context 链路
- 未修改 Notion blocks 保存链路
- 未修改 Popup/History UI
- 未新增依赖/权限/版本号

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：43 files, 1781 tests pass（新增 28 个）
- `npm run build`：成功

---

## v0.5 Session 1：Article Image Extraction Core (2026-06-14)

### 性质

实现纯函数文章图片候选提取核心模块。只做提取+测试+文档，不做 Markdown/Notion/UI 接入。

### 新增文件

- `src/content/extractors/articleImages.ts` — 图片候选提取模块
- `tests/article-images.test.ts` — 62 个测试

### 核心能力

- 从 Document/Element 提取所有 `<img>` 元素
- 通过 `determineOrigin()` 单次遍历识别 `img` / `picture` / `figure` 来源
- `getBestSrc()` 从 src / currentSrc / `el.src` 取最优 URL
- `resolveUrl()` 把相对 URL、协议相对 URL 转绝对 URL
- `extractCaption()` 从 `<figcaption>` 提取 caption（最长 300 字截断）
- 噪声过滤：avatar/icon/logo/badge/emoji/sprite/thumb/favicon/qr/loading 等 class/id 和 URL 模式
- 过滤 tracking pixel（1x1 或小尺寸+关键词）
- 过滤 data: URI（可选保留）和 blob: URI
- 按 minWidth/minHeight 过滤过小图片
- 去重、maxImages 限制
- 纯函数，不访问网络/chrome API/storage
- 不下载/上传/缓存图片

### 修改文件

- 无（仅新增文件，未修改现有代码）

### 验证

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：42 文件，1753 测试全部通过（新增 62）
- `npm run build`：构建成功

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改 `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未接入 Markdown / Notion / Popup / History

---

## v0.5 Session 0：版本交接、目录创建与文章图片保存规划 (2026-06-14)

### 性质

从 clipmate-v0.4 稳定基线 (1850c64) 复制创建 clipmate-v0.5 开发目录。更新所有交接文档，制定 Article Image Saving 分 Session 规划。不实现功能代码。

### 操作

1. robocopy clipmate-v0.4 → clipmate-v0.5（排除 node_modules/dist/build/coverage/.git/.wolf/.opencode/.playwright-mcp/*.zip/.env）
2. npm install 在 v0.5 目录
3. 更新 AGENT_CONTEXT.md / CURRENT_STATUS.md / V0.5_PLAN.md / DECISIONS.md / CHANGELOG_AGENT.md / TEST_LOG.md / ISSUES.md
4. lint 0 / 1691 tests pass / build success

### 新增文件

- `clipmate-v0.5/` 整个目录（从 v0.4 复制）
- `clipmate-v0.5/docs/AGENT_CONTEXT.md`（重写）
- `clipmate-v0.5/docs/CURRENT_STATUS.md`（重写）
- `clipmate-v0.5/docs/V0.5_PLAN.md`（新增）
- `clipmate-v0.5/docs/DECISIONS.md`（重写）
- `clipmate-v0.5/docs/CHANGELOG_AGENT.md`（重写）
- `clipmate-v0.5/docs/TEST_LOG.md`（重写）
- `clipmate-v0.5/docs/ISSUES.md`（重写）

### 未修改

- `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- `../../opencode.json`
- `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未实现功能代码
