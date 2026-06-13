# CHANGELOG_AGENT.md — ClipMate v0.4 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

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
