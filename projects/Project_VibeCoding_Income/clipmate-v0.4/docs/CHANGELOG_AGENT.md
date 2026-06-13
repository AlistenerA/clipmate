# CHANGELOG_AGENT.md — ClipMate v0.4 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

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
