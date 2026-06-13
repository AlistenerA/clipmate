# DECISIONS.md — ClipMate v0.4 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

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
