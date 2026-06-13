# CHANGELOG_AGENT.md — ClipMate v0.4 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

---

## v0.4 Session 5：Site Icon / Theme Cache (2026-06-13)

### 性质

代码实现：siteVisual 纯函数模块 + metaParser 安全接入。不改变剪藏主链路，不新增权限/依赖。cache 为纯函数 strategy，暂不实际持久化 chrome.storage。

### 产出

- `src/shared/siteVisual/siteVisual.types.ts` — 类型定义（~25 lines）
  - `SiteVisualMetadata`：domain, siteIconUrl?, themeColor?, source, updatedAt
  - `SiteVisualExtractInput`：document, pageUrl
  - `SiteVisualCacheRecord`：domain, siteIconUrl?, themeColor?, updatedAt
- `src/shared/siteVisual/siteVisualExtractor.ts` — 安全提取器（~150 lines）
  - `extractDomain(url)` → hostname
  - `normalizeThemeColor(value)` → 安全归一化：仅接受 #hex / rgb(rgba) / hsl(hsla)，拒绝 javascript/data/url/expression/calc/var/颜色名，长度限制 128 字符
  - `isSafeIconUrl(url)` → 允许 http/https/相对路径，拒绝 javascript/data/blob/chrome/edge/about/file/vbscript
  - `normalizeIconUrl(url, baseUrl)` → 安全解析为绝对 URL
  - `extractSiteVisualMetadata(input)` → icon（link rel 优先级）+ themeColor（meta theme-color）+ fallback /favicon.ico，不访问网络/chrome API/storage
- `src/shared/siteVisual/siteVisualCache.ts` — 纯函数 cache strategy（~90 lines）
  - `SITE_VISUAL_CACHE_TTL_MS` = 7 天
  - `shouldUseCachedSiteVisual(record, now?)` → TTL 过期检查
  - `mergeSiteVisualWithCache(extracted, cached, now?)` → extracted 优先，缺失时 fallback cache，source 自动标记 document/cache/fallback
  - `toSiteVisualCacheRecord(metadata)` → 剥离 source，只保留 domain/siteIconUrl/themeColor/updatedAt
- `src/shared/siteVisual/index.ts` — 模块导出

### 修改文件

- `src/content/parser/metaParser.ts` — 6 insertions, 8 deletions
  - `resolveIconUrl` → 委托 `normalizeIconUrl`
  - `extractThemeColor` → 委托 `normalizeThemeColor`
  - `extractSiteIconUrl` → 使用 `normalizeIconUrl` 替代旧的 `resolveIconUrl`
  - `parseMetadata` 签名不变，向后兼容

### 新增测试

- `tests/site-visual-extractor.test.ts` — 67 tests
  - extractDomain：5 tests（正常/子域/无路径/空/非法）
  - normalizeThemeColor：21 tests（#fff/#ffffff/rgb/rgba/hsl/hsla/拒绝 javascript/data/url/expression/null/空/过长/颜色名/calc/var/trim）
  - isSafeIconUrl：15 tests（接受 https/http/绝对路径/相对/父级相对，拒绝 js/data/blob/chrome/edge/about/file/空/vbscript）
  - normalizeIconUrl：12 tests（绝对/相对/无前导斜线/拒绝 7 种危险协议/空/ftp）
  - extractSiteVisualMetadata：11 tests（domain/icon/apple-touch-icon/icon-over-shortcut/fallback/themeColor/拒绝不安全 icon/拒绝不安全 themeColor/updatedAt/graceful/空 pageUrl）
  - Safety：3 tests（无 fetch/XMLHttpRequest/chrome.storage/不保存完整 DOM/body）
- `tests/site-visual-cache.test.ts` — 23 tests
  - shouldUseCachedSiteVisual：7 tests（valid/undefined/missing updatedAt/expired/boundary/explicit now/far future）
  - mergeSiteVisualWithCache：10 tests（无 cache/过期/有提取优先/缺失 fallback cache/全部缺失 fallback/过期不用）
  - toSiteVisualCacheRecord：5 tests（字段剥离/无 source/无 title/url/description/contentText/markdown/body/fullHtml/空 domain/null）
  - Safety：2 tests（无 chrome.storage/无 fetch/XMLHttpRequest）

### 未修改

- 未修改 Popup UI、Options UI、Background route
- 未修改 Notion 保存主链路
- 未修改 fullpage / selection 提取主逻辑
- 未修改 navigationSummary / commentSelection / intent 模块
- 未修改 content/index.ts
- 未修改 package.json / manifest.config.ts / package-lock.json
- 未新增依赖、未新增 manifest 权限

### 改动摘要

- 实现安全 Site Visual 提取器：icon 优先级 + themeColor 归一化 + 危险协议拒绝
- 实现纯函数 cache strategy：TTL 7 天、extracted 优先、缺失 fallback、source 自动标记
- metaParser 最小接入：resolveIconUrl/extractThemeColor/extractSiteIconUrl 委托给 safe extractor
- cache 暂未实际持久化到 chrome.storage，ISSUES 记录为 deferred
- 不访问网络/chrome API/storage/完整 DOM
- lint 0 / 1274 tests（+90 new）全部通过 / build success（116 modules）

---

## v0.4 Roadmap Adjustment：Defer History UX Sessions (2026-06-13)

### 性质

docs-only roadmap adjustment。不修改 src/tests/package/manifest。

### 变更

- 从 v0.4 当前路线中移出 **Tag Search UX**（历史搜索栏支持 #tag）
- 从 v0.4 当前路线中移出 **Better History Config**（历史入口移到设置页/独立 tab）
- 将两者标记为 deferred to v0.5 History UX / Settings Refactor
- V0.4_PLAN Session 5-9 重新编号为 Session 5-8

### 修改文件

- `docs/V0.4_PLAN.md` — 移除原 Session 5 Tag Search UX，新增 Deferred 章节，Session 6-9 → 5-8
- `docs/CURRENT_STATUS.md` — 进度表 Tag Search UX 标记为 deferred，未完成列表移除并新增 Deferred 章节
- `docs/ISSUES.md` — F05 标记 deferred，新增 F08 Better History Config deferred
- `docs/DECISIONS.md` — 新增 D-v0.4-029
- `docs/SITE_INTENT_MATRIX.md` — 下一阶段描述移除 Session 5 Tag Search UX 引用

### 改动摘要

- docs-only，未修改 src/tests/package/manifest
- Tag Search UX 和 Better History Config 不是删除，是 deferred to v0.5
- v0.4 后续 Session：4.1 Anti-Slop → 5 Site Icon → 6 Link Card → 7 Docs/Package → 8 Release

---

## v0.4 Session 4：Comment / Selection Clip Core (2026-06-13)

### 性质

代码实现：commentSelection 纯函数模块 + GET_SELECTION 最小接入。不改变 fullpage、Popup、Notion、Background route。

### 产出

- `src/content/commentSelection/commentSelection.types.ts` — 类型定义（~50 lines）
  - `CommentSelectionMode`：7 种选区模式
  - `CommentSelectionDraft`：包含 mode、selectionContext、selectedTextLength、warning、markdown、reasons 等，不保存 selectedText 字段
  - `CommentSelectionInput`：title/url/pageType/selectionText/selectionMarkdown/selectionContext 等
- `src/content/commentSelection/commentSelectionBuilder.ts` — 核心实现（~130 lines）
  - `extractDomain(url)` — 提取 hostname
  - `detectCommentSelectionMode(input)` — 基于 selectionContext + pageType 判断 7 种模式
  - `getCommentSelectionWarning(mode)` — 返回对应 warning 文案
  - `buildCommentSelectionDraft(input)` — 整合输出 draft
- `src/content/commentSelection/commentSelectionMarkdown.ts` — Markdown serializer（~75 lines）
  - `escapeMarkdownText(text)` — 转义 19 种 Markdown 特殊字符
  - `formatCommentSelectionMarkdown(draft)` — draft → 结构化 Markdown 字符串
- `src/content/commentSelection/index.ts` — 模块导出

### 修改文件

- `src/content/index.ts` — 42 行新增
  - 新增 import：siteProfile（matchSiteProfile）、intent（collectIntentSnapshot/getSelectionRootElement）、commentSelection（builder/serializer）
  - `handleGetSelection()` 中集成：获取 pageType/siteProfileMatch/intentSnapshot → 构建 CommentSelectionDraft → 若 mode 非 generic 则替换 content.markdown

### 新增测试

- `tests/comment-selection-builder.test.ts` — 52 tests
  - extractDomain：4 tests（正常/子域/非法/空）
  - detectCommentSelectionMode：14 tests（7 种模式覆盖 + 边界）
  - getCommentSelectionWarning：7 tests（每种模式 warning 文案）
  - buildCommentSelectionDraft：27 tests（字段正确性、隐私安全、理由生成、边界处理）
- `tests/comment-selection-markdown.test.ts` — 48 tests
  - escapeMarkdownText：19 tests（19 种特殊字符 + 空 + 中文 + 混合 + 多字符序列）
  - formatCommentSelectionMarkdown：22 tests（标题/warning/Source/pageType/selectionContext/selectedTextLength/siteProfileId/用户内容/理由/转义/空内容）
  - Safety checks：7 tests（chrome API/storage/document/network/full DOM/settings/token）

### 未修改

- 未修改 Popup UI、Options UI、Background route
- 未修改 Notion 保存主链路
- 未修改 fullpage 主链路
- 未修改 selection-first 行为
- 未修改 package.json / manifest.config.ts / package-lock.json
- 未新增依赖、未新增 manifest 权限

### 改动摘要

- 实现 Comment / Selection Clip Core：7 种选区模式，基于 selectionContext + pageType 判断
- selection-first 不变：有选区走 selection 路径，不抓取整页评论/论坛
- 每个模式有对应 warning，selection-generic 不强制加 warning
- Draft 不保存 selectedText 字段，只保存 selectedTextLength
- Markdown 输出允许包含用户主动选中内容，但不得扩展抓取
- lint 0 / 1184 tests（+100 new）全部通过 / build success（115 modules）

---

## v0.4 Session 3.2：Navigation Summary QA Fix + IS01 Completion (2026-06-13)

### 性质

代码修复 + QA hardening + 人工测试文档。不接入 Notion block。

### IS01 修复

- **`src/content/index.ts`** — 8 行变更
  - 导入 `confidenceToNumeric`
  - 两个 `buildLowConfidenceSummary` 调用点新增 `confidenceToNumeric(report.confidence)` 和 `report.linkDensity` 参数
  - Readability fallback 路径（原 line 98）和 Readability success + low confidence 路径（原 line 139）均传递新参数
- **`src/content/extractors/articleBoundaryGuard.ts`** — 10 行新增
  - 新增 `ARTICLE_CONFIDENCE_NUMERIC` 映射表：high→0.9, medium→0.5, low→0.2
  - 新增 `confidenceToNumeric(confidence: string): number` 导出函数

### Guard

- **`src/content/navigationSummary/navigationSummaryBuilder.ts`** — 8 行变更
  - 新增 `SPECIALIZED_NON_NAV_PAGE_TYPES` 集合：video / forum-or-comment / ai-answer
  - `shouldBuildNavigationSummary` 中规则 4/5（低置信+高链接密度 / unknown+高链接密度）被该集合 guard，防止视频/论坛/AI-answer 页面误触发

### QA hardening 测试

- **`tests/article-boundary-guard.test.ts`** — 新增 8 个测试（114→121）
  - video/forum/ai-answer + 低置信+高链接密度 → 不触发（3 tests）
  - article + 低置信+高链接密度 → 触发（1 test）
  - article + 中/高置信+高链接密度 → 不触发（2 tests）
  - article + 低置信+低链接密度 → 不触发（1 test）
- **`tests/navigation-summary-builder.test.ts`** — 新增 7 个测试（73→80）
  - video/forum/ai-answer + 低置信+高链接密度 → false（3 tests）
  - article + 低置信+高链接密度 → true（1 test）
  - article + 低置信+低链接密度 → false（1 test）
  - video + intent=clip-navigation-summary → true（intent 覆盖 guard，1 test）
  - video + selection present → false（selection-first 覆盖所有，1 test）
- **`tests/navigation-summary-markdown.test.ts`** — 新增 3 个测试（55→58）
  - video/forum/ai-answer + 低置信+高链接密度 → null（guard 集成验证）

### 新增文档

- **`docs/NAVIGATION_SUMMARY_QA.md`** — 人工测试文档
  - 7 个测试场景（搜索/导航/低置信/文章/视频/选区/论坛）
  - 隐私检查清单
  - 已知限制
  - QA 结果记录表

### 修改文件汇总

- `src/content/index.ts` — IS01 修复（传递 articleConfidence + linkDensity）
- `src/content/extractors/articleBoundaryGuard.ts` — 新增 confidenceToNumeric
- `src/content/navigationSummary/navigationSummaryBuilder.ts` — guard 防止误触发
- `tests/article-boundary-guard.test.ts` — +8 tests
- `tests/navigation-summary-builder.test.ts` — +7 tests
- `tests/navigation-summary-markdown.test.ts` — +3 tests
- `docs/NAVIGATION_SUMMARY_QA.md` — 新增
- `docs/CURRENT_STATUS.md` — 更新
- `docs/CHANGELOG_AGENT.md` — 本记录
- `docs/TEST_LOG.md` — 更新
- `docs/ISSUES.md` — 更新
- `docs/DECISIONS.md` — 更新
- `docs/NAVIGATION_SUMMARY_STRATEGY.md` — 更新

### 未修改

- 未修改 Popup UI、Options UI、Background route
- 未修改 Notion 保存主链路
- 未修改 selection-first 行为
- 未修改 package.json / manifest.config.ts / package-lock.json
- 未新增依赖、未新增 manifest 权限
- 未接入 Notion block 转换

### 改动摘要

- IS01 修复：low-confidence + high-linkDensity 路径现在从 content/index.ts 传递评估值触发
- Guard：视频/论坛/AI-answer 低置信+高链接密度不误触发 Navigation Summary
- 17 个新测试覆盖触发/不触发/guard/intent-override/selection-first
- 总测试数：1067 → 1084
- lint 0 / test 1084 pass / build success（104 modules）
- 人工 QA 文档覆盖 7 个测试场景 + 隐私检查

---

## v0.4 Session 3.1：Navigation Summary Markdown + Minimal Integration (2026-06-13)

### 性质

代码实现：Markdown serializer + 最小低置信 fallback 接入。未改 content/index.ts，未接入 Notion block，未改 Popup UI。

### 产出

- `src/content/navigationSummary/navigationSummaryMarkdown.ts` — Markdown serializer（~95 lines）
  - `escapeMarkdownText(text)` — 转义 16 种 Markdown 控制字符
  - `formatNavigationSummaryMarkdown(draft)` — draft → 安全 Markdown 字符串
  - `buildNavigationMarkdownFallback(input)` — 最小集成函数，返回 string | null
- `tests/navigation-summary-markdown.test.ts` — 55 tests

### 新增文件

- `src/content/navigationSummary/navigationSummaryMarkdown.ts` — Markdown serializer 与集成函数
  - `escapeMarkdownText(text: string): string` — 遍历字符，对 16 种 Markdown 特殊字符加反斜杠前缀，不破坏中文/英文
  - `formatNavigationSummaryMarkdown(draft: NavigationSummaryDraft): string` — 生成标题 H1、warning blockquote、metadata 列表、主要链接编号列表（带 domain）、生成原因列表（最多 5 条）
  - `buildNavigationMarkdownFallback(input: NavigationSummaryInput): string | null` — 调用 shouldBuildNavigationSummary → null 或 buildDraft + formatMarkdown → string
  - 不访问 document/storage/chrome API/network，不保存 selected text/正文/评论/完整 DOM
- `tests/navigation-summary-markdown.test.ts` — 55 tests
  - escapeMarkdownText：20 tests（16 种特殊字符 + 空输入 + 中文 + 混合 + 多字符序列）
  - formatNavigationSummaryMarkdown：20 tests（标题/warning/URL/pageType/domain/siteProfileId/链接/text escape/domain escape/空链接/生成原因/reason escape/上限 5/空 reasons 省略/不包含 body/innerHTML/comment/DOM）
  - buildNavigationMarkdownFallback：9 tests（search-results/navigation/low-confidence+high-linkDensity/article/forum-or-comment/video/selection-first/dangerous links/不包含 DOM）
  - Safety checks：6 tests（chrome API/storage/document/network/full-text fields）

### 修改文件

- `src/content/navigationSummary/index.ts` — +1 行 export
- `src/content/extractors/articleBoundaryGuard.ts` — 29 行变更
  - 导入 `buildNavigationMarkdownFallback` 和 `NavigationSummaryInput`
  - `buildLowConfidenceSummary` 签名扩展：新增可选 `articleConfidence?` 和 `linkDensity?` 参数
  - 内部优先调用 `buildNavigationMarkdownFallback`，返回结构化 Markdown 时直接返回
  - navigation/search-results 页面类型会自动走新的 draft builder + serializer 路径
  - 旧触发条件（无 pageType 或非触发类型）仍走原有 fallback 逻辑
- `tests/article-boundary-guard.test.ts` — 38 行变更
  - 更新 2 个旧测试（search-results/navigation pageType）：适配新结构化 Markdown 输出格式
  - 新增 3 个测试：low-confidence+high-linkDensity 集成、旧 fallback 不退化的验证、video pageType 不走新路径

### 未修改

- 未修改 `src/content/index.ts`（旧调用点只需 4 args，新 params 可选，向后兼容）
- 未修改 `src/popup/`、`src/options/`、`src/background/`
- 未修改 Notion 保存流程、Notion block 转换
- 未修改 selection-first 行为
- 未修改 package.json / manifest.config.ts / package-lock.json
- 未新增依赖、未新增 manifest 权限

### 改动摘要

- 实现安全 Markdown serializer：16 种控制字符转义，不破坏 URL href
- `buildLowConfidenceSummary` 委托给新的 draft builder + serializer，navigation/search-results 页面类型自动走新路径
- low-confidence+high-linkDensity 路径已实现但需 content/index.ts 传递报告值才能触发（deferred）
- 纯函数设计：不访问 document/storage/chrome API/network
- 不保存 selected text、正文、评论、完整 DOM
- lint 0 / test 1067（+58 new）全部通过 / build success（104 modules）

---

## v0.4 Session 3：Navigation Summary Draft Builder (2026-06-13)

### 性质

代码实现：纯函数 draft builder + 单元测试。不接入保存流程，不改变 Popup UI，不接入 Markdown 复制或 Notion 保存。

### 产出

- `src/content/navigationSummary/navigationSummary.types.ts` — 类型定义
- `src/content/navigationSummary/navigationSummaryBuilder.ts` — 7 个纯函数
- `src/content/navigationSummary/index.ts` — 模块导出
- `tests/navigation-summary-builder.test.ts` — 73 个测试

### 新增文件

- `src/content/navigationSummary/navigationSummary.types.ts` — 类型定义（~45 lines）
  - `NavigationSummaryMode`：navigation / search-results / low-confidence
  - `NavigationSummaryLink`：text, href, domain?, reason?
  - `NavigationSummaryDraft`：title, url, domain, pageType, siteProfileId?, mode, warning, links, reasons
  - `NavigationSummaryInput`：document, title, url, pageType, siteProfileMatch?, intentSnapshot?, articleConfidence?, linkDensity?, maxLinks?
- `src/content/navigationSummary/navigationSummaryBuilder.ts` — 核心实现（~315 lines）
  - `sanitizeLinkText(text, maxLength)` — trim、折叠空白、截断
  - `isSafeLinkHref(href)` — 允许 http/https/relative，拒绝 javascript/data/mailto/tel/blob/chrome/edge/about/#
  - `toAbsoluteHttpUrl(href, baseUrl)` — 相对链接转绝对 URL，仅 http/https
  - `extractDomain(url)` — 提取 hostname
  - `shouldBuildNavigationSummary(input)` — 6 级触发规则，selection-first 永远优先
  - `collectNavigationSummaryLinks(input)` — 3 级优先级：searchResultCard > main/article > body fallback
  - `buildNavigationSummaryDraft(input)` — 整合输出，异常返回安全空 draft
- `src/content/navigationSummary/index.ts` — 模块导出

### 未修改

- 未修改 `src/content/index.ts`
- 未修改 `src/content/extractors/articleBoundaryGuard.ts`
- 未修改 `src/popup/`、`src/options/`、`src/background/`
- 未修改保存流程、Popup UI、Notion 保存、Markdown 输出
- 未修改 package.json / manifest.config.ts / package-lock.json
- 未新增依赖、未新增 manifest 权限

### 改动摘要

- 实现 Navigation Summary Draft Builder，7 个纯函数，不访问 chrome API / storage / 网络
- shouldBuildNavigationSummary：6 级触发规则，selection-first 最高优先级
- collectNavigationSummaryLinks：searchResultCard > main/content > body fallback，去重 + 每 domain 3 条 + 总数上限
- buildNavigationSummaryDraft：异常安全（try-catch 返回空 draft）
- 不保存 selected text、正文、评论、Markdown、完整 DOM/HTML
- 不抓取目标链接内容，不访问网络
- lint 0 / test 1009（+73 new）全部通过 / build success

---

## v0.4 Session 3.0：Navigation Summary Mode Strategy Design (2026-06-13)

### 性质

docs-only strategy design。不修改 src/tests，不改变保存策略。

### 产出

- `docs/NAVIGATION_SUMMARY_STRATEGY.md` — 导航摘要模式策略设计文档
  - 目标：搜索页/导航页/低正文置信页的安全摘要流程
  - 输入信号：明确可用的 PageType / SiteProfile / IntentSnapshot / Document 信号
  - 触发条件草案：6 级优先级规则，selection-first 永远优先
  - 输出结构草案：NavigationSummaryDraft + NavigationLink 概念设计
  - 链接筛选策略：7 步流程（候选提取 → 清洗过滤 → 搜索页/导航页特殊策略）
  - Notion / Markdown 关系：分阶段实现，先 draft builder 再接入
  - Session 3 实现边界：拆分为 3.0/3.1/3.2 三个子 Session
  - 风险：5 项已知风险，全部有缓解措施

### 修改文件

- `docs/NAVIGATION_SUMMARY_STRATEGY.md` — 新增（~350 lines）
- `docs/CURRENT_STATUS.md` — 更新阶段、进度、下一步建议
- `docs/CHANGELOG_AGENT.md` — 本记录
- `docs/TEST_LOG.md` — Session 3.0 记录
- `docs/ISSUES.md` — 新增 3 项导航摘要风险（R-v0.4-nav-001 ~ R-v0.4-nav-003）
- `docs/DECISIONS.md` — 新增 3 项决策（D-v0.4-019 ~ D-v0.4-021）
- `docs/SITE_INTENT_MATRIX.md` — 更新进度表，标记 Session 3.0 已完成

### 改动摘要

- 完成 Navigation Summary Mode 完整策略设计
- 明确 Session 3 分 3 步实现：draft builder → 集成 → QA
- 确立 selection-first > navigation summary 的优先级原则
- 确立 "不抓取目标链接内容、不访问网络、不新增权限" 的安全底线
- 本轮 docs-only，未修改 src/tests/package/manifest

---

## v0.4 Session 2.2：Seed Profiles Manual QA / Refinement (2026-06-13)

### 性质

数据结构补强：对现有 19 个 seed profiles 做结构化 selectorHints 补齐和静态 QA。不改引擎、不改 Intent、不改保存策略。

### 修改 profile

- **bilibili-video**：新增 `contentContainer: '.video-desc-container, .video-info-detail'`
- **iqiyi-video**：新增 `contentContainer: '.iqp-intro, .video-info'`, `commentContainer: '.iqp-comment, .comment-list'`
- **youku-video**：新增 `contentContainer: '.video-info, .yk-video-info'`, `commentContainer: '.comment-box, .comment-list'`
- **tencent-video**：新增 `contentContainer: '.video-info, .mod_intro'`, `commentContainer: '.comment-list, .mod_comment'`
- **tiktok-short-video**：新增 `contentContainer: '[data-e2e="video-desc"], .DivVideoInfoContainer'`, `commentContainer: '[data-e2e="comment"], .DivCommentContainer'`
- **douyin-short-video**：新增 `contentContainer: '.video-info-desc, .desc'`, `commentContainer: '.comment-container, .comment-list'`
- **kuaishou-short-video**：新增 `contentContainer: '.video-info-container, .desc'`, `commentContainer: '.comment-container, .comment-list'`
- **reddit-community**：新增 `contentContainer: 'shreddit-post, [slot="post"]'`
- **claude-ai-chat**：新增 `selectorHints: { contentContainer: '[data-message-author-role]' }`（之前无 selectorHints）
- **gemini-ai-chat**：新增 `selectorHints: { contentContainer: '.chat-turn, .message-content' }`（之前无 selectorHints）
- **copilot-ai-chat**：新增 `selectorHints: { contentContainer: '.chat-message, .message-content' }`（之前无 selectorHints）

### 未修改

- 未新增/删除 profile
- 未修改 profile id / domains / category / priority
- 未修改 SiteProfile 类型（selectorHints 结构足够）
- 未修改 siteProfileEngine
- 未修改 intentSignalCollector
- 未改变保存策略
- 未接入 Popup UI

### 修改文件

- `src/shared/siteProfiles/seedProfiles.ts` — 11 个 profile 补强 selectorHints
- `tests/site-profile-engine.test.ts` — 新增 8 个结构验证测试（selectorHints 要求 / category 验证 / searchResultCard / videoPlayer / contentCommentContainer / ai-chat contentContainer / 敏感信息 / 计数）
- `tests/intent-signal-collector.test.ts` — 扩展 domain-free 检查覆盖所有 18 个站点名
- `docs/CURRENT_STATUS.md` — 更新阶段、进度、下一步建议
- `docs/CHANGELOG_AGENT.md` — 本记录
- `docs/TEST_LOG.md` — Session 2.2 记录
- `docs/ISSUES.md` — 新增需真实站点 QA 的 profile 和 DOM 动态风险记录
- `docs/DECISIONS.md` — 新增 D-v0.4-017 / D-v0.4-018
- `docs/SITE_INTENT_MATRIX.md` — 更新各 Session 完成状态

### 改动摘要

- 所有 19 个 seed profiles 现在至少有 1 个 selectorHints 字段
- selectorHints 全部为 seed/hint 级别，不承诺真实站点 100% 有效
- 站点级 selector 仅存在于 seedProfiles.ts，未扩散到 pageTypeDetector / intentSignalCollector / extractors
- lint 0 / test 936 passed (+8 new) / build success

## v0.4 Session 2.3.1：Build Fix + Video Iframe Selector Migration (2026-06-13)

### 性质

最小修复：修复 Session 2.3 Anti-Slop Review 发现的 B1 build blocker 和 M1 video iframe domain slop。

### 修复内容

- B1：intentSignalCollector.ts 补充缺失的 `SelectionContext` 类型导入，修复 tsc --noEmit 报错
- M1：移除 intentSignalCollector.ts 中硬编码的视频站点 iframe selector（youtube/bilibili/youku），改为通用 selector + SiteProfile.selectorHints.videoPlayer
- seedProfiles.ts：为 8 个视频类 profile 补充 videoPlayer 提示选择器
- 新增 `countSafeSelectors` 内部辅助函数统一 selector 查询

### 修改文件

- `src/content/intent/intentSignalCollector.ts` — 补充 SelectionContext/SiteProfileMatch 导入；collectVisibleContext 签名变更接受 siteProfileMatch；移除 3 条 domain iframe selector；新增 countSafeSelectors
- `src/shared/siteProfiles/seedProfiles.ts` — 为 youtube/bilibili/iqiyi/youku/tencent/tiktok/douyin/kuaishou 8 个视频 profile 添加 videoPlayer selectorHints
- `tests/intent-signal-collector.test.ts` — 更新 1 个旧测试（iframe src player）；新增 5 个测试（site-specific videoPlayer / comma-separated / null match / pass-through / domain-free check）；61→67 tests
- `docs/CURRENT_STATUS.md` — 更新阶段、进度、下一步建议
- `docs/CHANGELOG_AGENT.md` — 本记录
- `docs/TEST_LOG.md` — Session 2.3.1 记录
- `docs/ISSUES.md` — B1/M1 修复记录

### 改动摘要

- 修复 TypeScript 编译错误（B1 blocker）
- 移除 Intent Signal Collector 中的视频站点 domain 硬编码（M1 major）
- 视频站点 selector 迁移到 seedProfiles.ts 的结构化 profile 数据中
- collectVisibleContext 通过 siteProfileMatch.profile.selectorHints.videoPlayer 访问站点级选择器
- 不改变保存策略、不接入 Popup、不新增权限/依赖
- lint 0 / test 928 passed (+6 new) / build success

---

## v0.4 Session 2.1：Intent Signal Collector (2026-06-13)

### 性质

代码实现：脱敏 Intent Snapshot 数据结构、纯函数、轻量 DOM 信号采集。不改变保存策略。

### 产出

- `src/content/intent/intent.types.ts` — ClipIntent / SelectionContext / IntentSnapshot / IntentSignalInput 类型定义
- `src/content/intent/intentSignalCollector.ts` — 9 个纯函数 + 3 个内部辅助函数
- `src/content/intent/index.ts` — 模块导出
- `tests/intent-signal-collector.test.ts` — 61 个测试

### 新增文件

- `src/content/intent/intent.types.ts` — 类型定义（~65 lines）
  - `ClipIntent`：14 个意图值（clip-article ~ needs-ai-later）
  - `SelectionContext`：7 个选区上下文（article / comment / video-description / search-result / navigation / ai-answer / unknown）
  - `VisibleContextSnapshot`：4 个可见信号统计量
  - `IntentSnapshot`：完整的意图快照数据结构（pageType, siteProfileId, selectionPresent, selectionTextLength, selectionContext, nearestRole, nearestTag, nearestClassHints, visibleContext, confidence, intent, reasons）
  - `IntentSignalInput`：函数输入接口
- `src/content/intent/intentSignalCollector.ts` — 核心实现（~280 lines）
  - `sanitizeClassHints(className)` → 白名单语义 hint（去重，最多 8 个）
  - `getSelectionTextLength(selection?)` → 只返回长度，不返回文本
  - `getSelectionRootElement(selection?)` → 选区祖先 Element
  - `classifyElementContext(element)` → DOM 祖先向上遍历，返回 SelectionContext 枚举
  - `collectVisibleContext(document)` → 统计 video/comment/search/article 信号量
  - `detectClipIntent(snapshot)` → 11 级优先级判断，返回 intent + confidence + reasons
  - `collectIntentSnapshot(input)` → 综合所有函数输出完整 IntentSnapshot
- `src/content/intent/index.ts` — re-export 所有导出

### 改动摘要

- 实现脱敏 Intent Signal Collector，输入 PageType + SiteProfile + Selection + Document，输出 IntentSnapshot
- 所有函数为纯函数或只读 DOM，不访问 chrome API / storage / 网络
- 不保存 selected text / 正文 / 评论 / Markdown，reasons 为短句
- nearestClassHints 通过白名单过滤，去重，最多 8 个，不含完整 className
- 不改变 fullpage / selection 保存策略
- 不接入 Popup UI
- 不实现评论区剪藏 UI
- 不实现长期监听或持久化
- lint 0，922 tests（含 61 new）全部通过，build 成功

---

## v0.4 Session 2：Site Profile Engine (2026-06-13)

### 性质

代码实现：结构化 profile 数据 + 纯函数匹配引擎，不改变剪藏策略。

### 产出

- `src/shared/siteProfiles/siteProfile.types.ts` — 类型定义
- `src/shared/siteProfiles/seedProfiles.ts` — 19 个 seed profiles
- `src/shared/siteProfiles/siteProfileEngine.ts` — 纯函数匹配引擎
- `src/shared/siteProfiles/index.ts` — 模块导出
- `tests/site-profile-engine.test.ts` — 62 个单元测试

### 新增文件

- `src/shared/siteProfiles/siteProfile.types.ts` — 类型定义
  - `SiteProfileCategory`：search / video / short-video / social / community / ai-chat
  - `SiteProfile`：id, label, category, domains, pageTypes, priority, selectorHints
  - `SiteProfileMatchInput`：url, pageType
  - `SiteProfileMatch`：profile, matchedDomain, matchedPageType, confidence, reasons
- `src/shared/siteProfiles/seedProfiles.ts` — 19 个结构化 seed profiles
  - 搜索：google-search / bing-search / baidu-search
  - 长视频：youtube-video / bilibili-video / iqiyi-video / youku-video / tencent-video
  - 短视频：tiktok-short-video / douyin-short-video / kuaishou-short-video
  - 社交/社区：xiaohongshu-social / zhihu-community / reddit-community / weibo-social
  - AI 对话：chatgpt-ai-chat / claude-ai-chat / gemini-ai-chat / copilot-ai-chat
- `src/shared/siteProfiles/siteProfileEngine.ts` — 纯函数引擎（~120 lines）
  - `normalizeHostname(urlOrHostname)` — 提取标准化 hostname
  - `hostnameMatchesDomain(hostname, domain)` — 精确/子域名匹配
  - `matchSiteProfile(input, profiles?)` — 纯函数匹配，confidence 0-1
  - `listSiteProfiles(profiles?)` — 返回不可变副本
- `src/shared/siteProfiles/index.ts` — 模块导出
- `tests/site-profile-engine.test.ts` — 62 个测试

### 改动摘要

- 实现结构化 Site Profile Engine，19 个 seed profiles 覆盖 6 类站点
- 所有站点规则通过数据配置管理，无散落 domain if 硬编码
- 匹配函数为纯函数，不访问 chrome API / DOM / storage / 网络
- 不改变现有剪藏保存策略
- 未实现 Intent Signal Collector
- 未实现评论/选区判断
- 未新增 manifest 权限、依赖、版本号变更
- lint 0，861 tests（含 62 new）全部通过，build 成功

---

## v0.4 Session 1.1：Intent & Site Profile Planning (2026-06-13)

### 性质

docs-only，不修改业务代码。

### 产出

- `docs/SITE_INTENT_MATRIX.md` — 站点意图矩阵
- `docs/QUALITY_GUARDRAILS.md` — 质量门禁

### 新增文件

- `docs/SITE_INTENT_MATRIX.md` — 站点意图矩阵
  - 设计目标（5 类信号 + 隐私边界）
  - 重点站点 Seed Profile 范围（搜索/长视频/短视频/社区/AI 对话，共 20+ 站点）
  - 用户意图分类（14 种 Intent 类型）
  - 判断优先级（8 条规则）
  - IntentSnapshot 概念规划（类型定义 + 隐私约束）
- `docs/QUALITY_GUARDRAILS.md` — 质量门禁
  - Vibe Slop 定义（9 类风险）
  - 模块边界建议（pageTypeDetector / siteProfileEngine / intentDetector / clipStrategy / extractors）
  - 质量门禁时机（5 个 Anti-Slop Review 节点）
  - 检查项清单（10 项）
  - 后续 Session 命名建议
  - 临时代码标记规范

### 修改文件

- `docs/V0.4_PLAN.md` — 补充：
  - 中间目标从 Site Profiles 扩展为 PageType + SiteProfile + IntentSnapshot + ClipStrategy
  - 增加 Session 2.1 / 2.2 / 2.3 建议
  - 增加短视频/评论区风险说明
  - 增加 unknown / needs-ai-later 处理策略
- `docs/CURRENT_STATUS.md` — 更新进度表、已完成/未完成列表、下一阶段建议
- `docs/DECISIONS.md` — 新增 4 项决策（D-v0.4-007 ~ D-v0.4-010）
- `docs/ISSUES.md` — 新增 3 项风险（R-v0.4-intent-001 ~ R-v0.4-intent-003）
- `docs/CHANGELOG_AGENT.md` — 本记录

### 改动摘要

- 为 v0.4 Session 2+ 提供完整的站点适配和用户意图判断设计规划
- 明确短视频/评论区为 v0.4 高风险场景
- 确立 Anti-Slop Review 机制，后续 Session 强制执行
- 所有规划仅文档层面，未修改 src/ / tests/ / package / manifest
- 所有站点规则必须通过结构化 profile engine 管理，禁止散落 domain if
- 所有意图判断不依赖 AI，无法判断时降级 unknown / needs-ai-later

---

## v0.4 Session 1：Page Type Detector (2026-06-13)

### 产出

- `src/shared/utils/pageTypeDetector.ts` — 通用页面类型检测器
- `tests/page-type-detector.test.ts` — 42 个单元测试

### 新增/修改文件

- `src/shared/utils/pageTypeDetector.ts` — 新增：纯函数检测模块
  - 导出 `PageType` 类型（7 类）
  - 导出 `PageTypeDetectionSignals` 接口
  - 导出 `PageTypeDetectionResult` 接口
  - 导出 `detectPageType(input)` 纯函数
  - 导出 `extractSignalsFromDocument(doc)` DOM 提取函数
  - 导出 `detectPageTypeFromDocument(doc)` 便捷包装
  - 6 个内部 assessor：assessArticle / assessSearchResults / assessNavigation / assessForumOrComment / assessVideo / assessAiAnswer
- `src/content/extractors/articleBoundaryGuard.ts` — 修改：
  - 导入新 detector，替换旧 `classifyPageType` 实现
  - 保持 `classifyPageType` 对外签名不变
  - `buildLowConfidenceSummary` 新增 forum-or-comment / video / ai-answer 的提示文案
- `src/shared/utils/index.ts` — 新增 `pageTypeDetector` 导出
- `tests/article-boundary-guard.test.ts` — 修改：
  - `makeDom` 函数新增 `title` 参数支持
  - Baidu 搜索测试适配新 detector（URL + title 参数）
- `tests/page-type-detector.test.ts` — 新增：42 个测试覆盖 7 类类型 + 混合场景 + 脱敏检查

### 改动摘要

- 实现通用页面类型检测器，从旧的 4 类扩展到 7 类
- 检测逻辑为纯函数，可独立单元测试，无外部依赖
- 旧 `classifyPageType` 已安全接入新 detector，保持向后兼容
- 检测结果作为 metadata/report 辅助，不改变保存策略
- 所有规则基于通用启发式（URL/title/DOM 结构），无站点硬编码
- lint 0，799 tests 全部通过，build 成功
- 未新增权限、未新增依赖、未修改版本号

---

## v0.4 Session 0：工作区创建与规划审查 (2026-06-13)

### 产出

- `clipmate-v0.4/` — 从 v0.3 复制的完整项目目录（排除 node_modules/dist/build/coverage/*.zip/.env/.wolf/.opencode/.playwright-mcp）
- `feature/clipmate-v0.4-site-profiles` — 新开发分支

---

*（v0.4 之前版本的修改记录见 clipmate-v0.3/docs/CHANGELOG_AGENT.md）*
