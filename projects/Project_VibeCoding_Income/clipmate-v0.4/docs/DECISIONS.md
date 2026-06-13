# DECISIONS.md — ClipMate v0.4 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

---

## v0.4 Session 3.2 决策

### D-v0.4-026：low-confidence + high-linkDensity 导航摘要仅作为 fallback，不覆盖有专属处理器的页面类型

- **原因**：视频页、论坛评论页、AI 对话页已有自己的专属低置信 fallback 消息（如 "已避免保存大量媒体元素" "已避免保存大量楼层" 等）。低置信 + 高链接密度触发条件对这类页面无意义——视频页天然链接密度高但不应被当导航页。
- **影响**：`shouldBuildNavigationSummary` 新增 `SPECIALIZED_NON_NAV_PAGE_TYPES` 集合（video / forum-or-comment / ai-answer），规则 4/5（低置信+高链接密度 / unknown+高链接密度）不对此类页面触发。显式 intent（clip-navigation-summary）和显式 pageType（navigation / search-results）不受影响。
- **可反转性**：中。若后续发现典型视频页经常被误分类为文章页且需要 navigation summary，可重新评估是否移除 guard 或将 guard 升级为更智能的判断。

---

## v0.4 Session 3.1 决策

### D-v0.4-025：Navigation Summary minimal integration 只接入低置信 fallback，不覆盖 selection-first

- **原因**：`buildLowConfidenceSummary` 的旧调用点（content/index.ts）只在 `report.confidence === 'low'` 或 fallback 路径中触发，这些场景下用户无选区概率极高。selection-first 由 Intent Signal Collector 在 `shouldBuildNavigationSummary` 中通过 `intentSnapshot.selectionPresent` 再次验证。新增集成不拦截任何有选区的场景。
- **影响**：`buildNavigationMarkdownFallback` 在 `intentSnapshot.selectionPresent && selectionTextLength > 0` 时返回 null，确保 selection-first 不被覆盖。`buildLowConfidenceSummary` 的新代码路径同样遵循此原则。
- **可反转性**：低。违反此决策等于覆盖用户明确意图（D-v0.4-021）。

### D-v0.4-024：Navigation Summary Markdown serializer 只格式化已有 draft，不读取 DOM、不访问网络、不写 storage

- **原因**：Markdown serializer 的职责是将已构建的 NavigationSummaryDraft 转换为安全 Markdown 字符串。访问 DOM、网络或 storage 会引入副作用、降低可测试性，并与 v0.4 纯前端安全定位冲突。
- **影响**：`escapeMarkdownText` 和 `formatNavigationSummaryMarkdown` 均为纯函数，接收字符串或结构化对象，返回字符串。`buildNavigationMarkdownFallback` 仅组合已有纯函数（shouldBuild + buildDraft + formatMarkdown），不新增副作用。
- **可反转性**：低。推翻此决策需要重新设计 serializer 模块边界。

---

## v0.4 Session 3 决策

### D-v0.4-023：Navigation Summary links 只从当前 DOM 的 a[href] 提取，不访问目标链接内容

- **原因**：链接筛选的目的是提取当前页面内可见超链接的 text + href + domain，不是抓取目标页面内容。任何网络请求都需要新增 host_permissions 或绕过 CSP，与 v0.4 纯前端定位冲突。
- **影响**：`collectNavigationSummaryLinks` 仅通过 `doc.querySelectorAll('a[href]')` 读取 DOM 属性。`domain` 字段通过 `new URL(href).hostname` 解析，不发起请求。`reason` 字段为固定短句（'search result' / 'main content' / 'navigation link'），不含正文。
- **可反转性**：低。推翻此决策意味着引入网络权限和隐私风险。

### D-v0.4-022：Navigation Summary Draft Builder 只生成内部 draft，不直接写入 Markdown/Notion

- **原因**：参考 D-v0.4-019 的三步拆分（draft builder → 集成 → Notion blocks）。`buildNavigationSummaryDraft` 输出结构化 `NavigationSummaryDraft` 对象，由 Session 3.1 的下游（Markdown 序列化器、Notion block 转换器）消费。过早将 draft builder 与输出格式耦合会降低可测试性和可复用性。
- **影响**：`buildNavigationSummaryDraft` 返回纯对象，不生成 Markdown 字符串或 Notion blocks。所有字段为统计量或短句（warning / reasons / link text / domain），不含正文全文、评论全文、完整 DOM。
- **可反转性**：中。如果 Session 3.1 集成测试充分且无退化，此拆分验证有效后不再反转。

---

## v0.4 Session 3.0 决策

### D-v0.4-021：有用户选区时，selection-first 永远优先于 navigation summary

- **原因**：用户主动划选内容是最明确的高优先级意图信号。无论页面是 navigation/search-results 还是低置信，只要用户划选了内容，必须走选区流程。Navigation summary 只在无选区时触发。
- **影响**：触发条件规则优先级表中，规则 1（用户有选区 → 不触发）为最高优先级。Intent Signal Collector 的 selection-first 逻辑已经体现此原则（`detectClipIntent` 在有选区时优先返回 selection 相关 intent）。
- **可反转性**：低。违反此决策等于覆盖用户明确意图。

### D-v0.4-020：Navigation Summary 不抓取目标链接内容，不访问网络，不新增权限

- **原因**：链接筛选的目的是提取当前页面内可见的超链接信息（text + href + domain），不是去抓取链接指向页面的内容。任何网络请求都需要新增 host_permissions 或绕过 CSP，与 v0.4 的纯前端定位冲突。
- **影响**：Session 3 实现的链接提取仅限于 `doc.querySelectorAll('a[href]')` 的只读 DOM 操作。`NavigationLink` 结构的 `domain` 字段通过 `new URL(href).hostname` 从 href 字符串解析，不发起请求。
- **可反转性**：低。推翻此决策意味着引入网络权限和隐私风险。

### D-v0.4-019：Navigation Summary Mode 先实现内部 draft builder，再接入复制/保存流程

- **原因**：当前 `buildLowConfidenceSummary` 直接将 Markdown 字符串拼接与链接提取耦合在一起，难以测试、难以接入 Notion block 转换。应先实现一个纯函数 draft builder，输出结构化的 `NavigationSummaryDraft`，再由下游（Markdown 序列化器、Notion block 转换器）消费。
- **影响**：Session 3 实现纯函数 draft builder + 单元测试；Session 3.1 最小接入低置信 fallback，保持 Markdown 输出向后兼容；Session 3.2 做 Notion block 转换。
- **可反转性**：中。如果 Session 3 测试覆盖充分且集成无退化，此拆分验证有效后不再反转。

---

## v0.4 Session 2.2 决策

### D-v0.4-018：站点级 selector 只能保存在 seedProfiles.ts，Intent / PageType / Extractor 不写具体站点 domain 规则

- **原因**：v0.4 架构要求所有站点适配规则通过结构化 Site Profile Engine 管理（D-v0.4-004、D-v0.4-008、D-v0.4-011）。Session 2.2 补强后验证：content/intent/、content/extractors/、pageTypeDetector.ts 中无任何站点 domain 硬编码。selectorHints.videoPlayer 作为站点级选择器的唯一入口，由 collectVisibleContext 通过 siteProfileMatch.profile 访问。
- **影响**：新增站点适配只需在 seedProfiles.ts 添加结构化 profile，下游 Intent / ClipStrategy 通过 siteProfileMatch.profile.selectorHints 间接使用。任何试图在 Intent/PageType/Extractor 中直接写站点 domain 规则的代码应在 code review 中拒绝。
- **可反转性**：低。推翻此决策意味着放弃 profile engine 的架构意义。

### D-v0.4-017：Seed profiles 只提供 selector hints，不承诺真实站点完整适配

- **原因**：所有 selectorHints 为 seed/hint 级别数据，基于对站点 DOM 结构的通用猜测，不经过真实浏览器自动化验证。真实站点 DOM 可能因版本更新、A/B 测试、用户登录状态、地区差异等因素变化。
- **影响**：selectorHints 作为下游模块（Navigation Summary / Comment Mode / Intent Signal Collector）的辅助信息使用，不应作为唯一依据。所有依赖 selectorHints 的下游逻辑必须有 fallback 到通用提取器的能力。ISSUES.md 记录需真实站点手动 QA 的 profile 清单（QA01-QA05）。
- **可反转性**：中。后续版本可通过真实浏览器自动化 QA 提升 selector 置信度，将 selector 从 seed 升级为 verified。但核心原则（不承诺完整适配）应保持不变。

---

## v0.4 Session 2.1 决策

### D-v0.4-016：Intent 检测只输出建议意图，不直接改变 fullpage / selection 保存策略

- **原因**：Intent Signal Collector 的职责是收集信号并输出意图建议，不应直接修改现有的 fullpage / selection 保存行为。clipStrategy 层将在后续 Session 中根据 IntentSnapshot 决定是否调整剪藏策略。
- **影响**：`detectClipIntent` 返回 `{ intent, confidence, reasons }`，但不调用任何保存/提取函数。Content Script 的现有 save 流程不受影响。
- **可反转性**：高。Session 3/4 实现 clipStrategy 时可接入。

### D-v0.4-015：IntentSnapshot 不保存 selected text、正文、评论、Markdown，只保存长度、枚举上下文和脱敏 hints

- **原因**：隐私和安全底线要求不持久化用户内容。IntentSnapshot 设计时所有字段均为统计量或枚举值：selectionTextLength 为数字、selectionContext 为枚举、nearestClassHints 为白名单过滤后的语义 hint、reasons 为短句。不包含完整文本。
- **影响**：所有函数均遵循此原则。`getSelectionTextLength` 只返回数字不返回文本。`sanitizeClassHints` 只保留白名单语义词。
- **可反转性**：低。推翻此决策意味着引入隐私风险。

### D-v0.4-014：Intent Signal Collector 只在剪藏触发时生成脱敏 IntentSnapshot，不做长期监听

- **原因**：长期 DOM 监听（MutationObserver / scroll / click tracking）会引入性能开销、隐私风险和 manifest 权限问题。Intent 判断应在用户主动触发剪藏时基于当前 Document + Selection 快照一次性计算。
- **影响**：`collectIntentSnapshot` 为纯函数 + DOM 只读操作，不注册任何 event listener、不持久化任何状态到 storage、不在 background worker 中运行。
- **可反转性**：中。如果后续发现需要 RecentInteraction 信号（如最近点击位置），可在单次 session 内通过 content script 的 tab 内存轻量缓存实现，不升级为长期监听。

---

## v0.4 Session 2 决策

### D-v0.4-013：Site Profile 匹配函数保持纯函数，不访问 chrome API、DOM、storage 或网络

- **原因**：Site Profile Engine 的核心职责是 URL/hostname 驱动的结构化 profile 匹配。纯函数设计使其可独立单元测试、无副作用、可在 content script 或 background worker 中安全调用。
- **影响**：`normalizeHostname`、`hostnameMatchesDomain`、`matchSiteProfile`、`listSiteProfiles` 均为纯函数。不读取 DOM、不访问 chrome.storage、不发起网络请求。
- **可反转性**：低。推翻此决策需要重新设计模块边界。

### D-v0.4-012：Seed profiles 只提供 domain/url/pageType/selector hints，不直接改变剪藏策略

- **原因**：Site Profile Engine 的 seed profiles 是数据配置，不应直接耦合剪藏行为。剪藏策略应由后续 Session 的 clipStrategy 模块根据 SiteProfile + PageType + IntentSnapshot 综合决定。过早让 profile 直接控制剪藏策略会导致职责混乱。
- **影响**：`selectorHints` 字段仅作为数据 hint 提供给下游模块自行解析。`matchSiteProfile` 返回 profile 匹配结果，不做内容提取或策略选择。
- **可反转性**：中。后续 Session 可评估是否需要在 profile 中增加策略 hint 字段。

### D-v0.4-011：Site Profile Engine 采用结构化 profile 数据和统一匹配函数，不写散落 domain if

- **原因**：v0.4 Session 0 决策 D-v0.4-004 和 D-v0.4-008 均要求站点适配通过结构化 profile engine 管理。Session 2 完成了该引擎的实现：所有站点规则通过 `SEED_PROFILES` 数组中的结构化 `SiteProfile` 数据配置，`matchSiteProfile` 函数通过遍历 profiles 进行 domain/PageType 匹配和 confidence 计算，代码中无任何散落 `if (hostname === 'xxx.com')` 硬编码。
- **影响**：新增站点适配只需在 `seedProfiles.ts` 中添加一条结构化 profile 记录，无需修改引擎逻辑或 content script。
- **可反转性**：低。推翻此决策意味着放弃 profile engine 的架构意义。

---

## v0.4 Session 1.1 决策

### D-v0.4-010：v0.4 增加 Anti-Slop Review 节点，防止重复逻辑、紧耦合和目录失控

- **原因**：v0.4 功能范围扩大（PageType + SiteProfile + Intent + ClipStrategy），多模块并行开发增加 vibe slop 风险。需要定期质量审查防止重复实现、散落硬编码、目录混乱。
- **影响**：Session 2.3、Session 4.1、Session 8 前各增加一次 Anti-Slop Review。审查项定义在 `QUALITY_GUARDRAILS.md`。
- **可反转性**：中。审查节点可调整频次。

### D-v0.4-009：IntentSnapshot 默认只保存在当前 tab 内存，不持久化用户正文或评论全文

- **原因**：用户意图判断需要 selection context + visible context + recent interaction 信息，但这些信息一旦持久化就可能包含用户内容。仅保留在当前 tab 内存可避免隐私风险。
- **影响**：IntentSnapshot 不写入 chrome.storage，不发送到任何远程服务。tab 切换或关闭后信息自动清除。只保存统计量（如 selectionTextLength）、脱敏 hints（如 nearestTag），不保存原始内容。
- **可反转性**：高。如果需要持久化统计量（如用于改善后续剪藏准确率），可以单独设计脱敏埋点。

### D-v0.4-008：站点适配必须以结构化 profile seed list 管理，不写散落 domain if

- **原因**：v0.4 的站点适配能力如果通过散落 `if (hostname === 'xxx')` 实现，将迅速劣化为 vibe slop。必须通过 Site Profile Engine 的结构化 profile（domain pattern + selector hints）统一管理。每个 profile 是数据配置，不是业务逻辑。
- **影响**：Session 2 必须实现 Site Profile Engine 作为站点适配的唯一入口。Session 2.2 Seed Site Profiles 的 profile 配置文件通过引擎加载，不直接 hardcode 到 extractor / content script 中。
- **可反转性**：低。推翻此决策等价于放弃 D-v0.4-004 和 D-v0.4-005 的架构原则。

### D-v0.4-007：用户意图判断必须基于 PageType + SiteProfile + SelectionContext + VisibleContext，不依赖 AI

- **原因**：v0.4 定位为无 AI 的纯前端增强版本。用户意图判断必须通过 DOM 结构、URL 模式、站点规则、用户交互信号等可解释的启发式方法实现。AI 辅助意图判断留到 v0.5+。
- **影响**：Session 2.1 的 Intent Signal Collector 不接入任何 AI API。无法可靠判断的场景标记为 `unknown` 或 `needs-ai-later`，不强行猜。
- **可反转性**：中。如果 Session 2.1 完成后意图准确率显著不足，可评估是否需要引入本地轻量模型（仍需 ChatGPT 审查）。

---

## v0.4 Session 1 决策

### D-v0.4-006：检测结果先作为 metadata/report/summary 辅助，不直接改变保存策略

- **原因**：v0.4 Session 1 的 Page Type Detector 刚完成，分类准确率需要后续 Session 的 Site Profile Engine 和 Navigation Summary Mode 增强后才能保证。在检测结果充分验证前，只作为 assessArticleConfidence / buildLowConfidenceSummary 的低置信兜底判断辅助，不改变 fullpage/selection 的正常保存行为。
- **影响**：`classifyPageType` 继续在 `content/index.ts` 中用于低置信 fallback summary，不新增对保存策略的拦截。Session 3 Navigation Summary Mode 完成后可重新评估。
- **可反转性**：高。后续 Session 可随时接入。

### D-v0.4-005：Page Type Detector 先做通用启发式，不写站点硬编码

- **原因**：检测逻辑应基于 URL pattern、title keyword、DOM 结构统计量等通用信号，不写 `if domain === 'zhihu.com'` 等具体站点判断。站点级规则由 Session 2 Site Profile Engine 通过结构化 profile 统一管理。
- **影响**：detector 的 6 个内部 assessor 函数全部基于通用信号，代码中的 SEARCH_URL_PATTERNS / SEARCH_TITLE_KEYWORDS / VIDEO_TITLE_KEYWORDS 等列表都是通用关键词（如 search/搜索/video/视频/chat/对话），不与任何具体域名绑定。
- **可反转性**：低。推翻此决策意味着放弃 profile engine 的架构意义。

---

## v0.4 Session 0 决策

### D-v0.4-004：站点适配必须通过 profile engine，不允许散落硬编码 if

- **原因**：v0.4 的 Site Profile Engine 要求所有站点级适配规则通过结构化 profile 引擎（domain / URL pattern / hostname 匹配）统一管理。任何散落的 `if (hostname === 'xxx.com')` 硬编码都会增加维护成本并绕开引擎抽象。
- **影响**：Session 2 开发的 Site Profile Engine 必须是所有站点适配的唯一入口。禁止在 extractor / content script 中直接写站点级判断。
- **可反转性**：低。推翻此决策意味着放弃 profile engine 的架构意义。

### D-v0.4-003：版本号升级推迟到 release docs/package session

- **原因**：v0.4 从 v0.3 复制创建，package.json 和 manifest.config.ts 版本号当前为 0.3.0。提前升级版本号会在多轮开发中产生语义不准确的问题（代码未就绪但版本已显示 0.4.0）。推迟到 Session 8（Docs, QA, Version, Package）统一升级并同步所有文档。
- **影响**：Session 0-7 期间 npm scripts 显示 0.3.0。Session 8 时一次性升级 package.json / manifest.config.ts / package-lock.json / README。
- **可反转性**：高。

### D-v0.4-002：不在 v0.4 引入 AI、后端、登录、云同步、付费

- **原因**：这些功能方向与 v0.4 定位（站点适配与场景模式）无关。AI/后端/登录会引入 manifest 权限变更、隐私政策更新、依赖膨胀和审核风险。v0.4 聚焦纯前端剪藏能力增强。
- **影响**：v0.4 所有 Session 不得修改 manifest 权限、不得新增 AI API 调用、不得新增后端交互。已在 V0.4_PLAN.md 列为严格非目标。
- **可反转性**：低。v0.4 架构围绕此决策设计。

### D-v0.4-001：v0.4 定位为 Site Profiles and Scenario Modes

- **原因**：v0.3 完成内容保真增强后，ClipMate 需要进一步区分页面类型并采取不同剪藏策略。站点适配和场景模式是自然演进方向，无需引入 AI 或后端即可实现。
- **影响**：v0.4 所有 Session 围绕 Site Profile Engine + Scenario Modes 展开。非此方向的功能（AI、登录、付费等）暂缓到后续版本。
- **可反转性**：低。推翻此决策意味着整个 v0.4 方向重规划。

---

*（v0.4 之前版本的决策记录见 clipmate-v0.3/docs/DECISIONS.md）*
