# DECISIONS.md — ClipMate v0.4 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

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
