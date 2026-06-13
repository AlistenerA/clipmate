# CURRENT_STATUS.md — ClipMate v0.4 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，除非用户明确要求 patch，否则不修改
> - `clipmate-v0.3/` = v0.3 公开快照，禁止功能修改
> - `clipmate-v0.4/` = 当前 v0.4 开发目录

---

## 当前阶段

**v0.4 Session 6 已完成** — Link Card Preview Core（待 ChatGPT 审查）。

- 新增 `siteVisual/` 模块：类型定义、安全提取器、纯函数 cache strategy
- 提取器：`extractDomain` / `normalizeThemeColor` / `isSafeIconUrl` / `normalizeIconUrl` / `extractSiteVisualMetadata`
- Cache strategy：`shouldUseCachedSiteVisual` / `mergeSiteVisualWithCache` / `toSiteVisualCacheRecord`（TTL 7 天）
- 安全归一化：themeColor 仅接受 #hex / rgb/rgba / hsl/hsla，拒绝 javascript/data/url/expression/calc/var
- 安全 icon URL：仅接受 http/https/相对路径，拒绝 javascript/data/blob/chrome/edge/about/file/vbscript
- 最小接入：`metaParser.ts` 的 `resolveIconUrl` / `extractThemeColor` / `extractSiteIconUrl` 委托给 safe extractor
- 本版本实际持久化 chrome.storage cache，cache strategy 为纯函数，ISSUES 记录 persistence deferred
- 未改 Popup / Options / Background / Notion / fullpage / selection 主链路
- 未新增权限/依赖
- 总测试数：1184 → 1274（+90：site-visual-extractor 67 + site-visual-cache 23）
- 下一步建议 Session 5.1 Anti-Slop Review 或直接进入 Session 6 Link Card Preview

- v0.4 Session 5.1 Anti-Slop Review：完成，发现 M2（metaParser 与 siteVisualExtractor icon 提取逻辑重复）→ Session 6 已修复
- v0.4 Session 6：Link Card Preview Core（本轮完成，待 ChatGPT 审查）

- v0.4 Session 1：Page Type Detector 已提交（commit 54a9957）
- v0.4 Session 1.1：完成 SITE_INTENT_MATRIX.md 和 QUALITY_GUARDRAILS.md
- v0.4 Session 2：完成 Site Profile Engine（siteProfile.types / seedProfiles / siteProfileEngine / index）— commit 006908e
- v0.4 Session 2.1：完成 Intent Signal Collector（intent.types / intentSignalCollector / 61 tests）— commit 72db8b6
- v0.4 Session 2.3：Anti-Slop Review 发现 B1 build blocker 和 M1 video iframe domain slop
- v0.4 Session 2.3.1：修复 B1 + M1，lint 0 / test 928 passed / build success
- v0.4 Session 2.2：补强 11 个 profile 的 selectorHints，所有 19 个 profile 至少有 1 个 selectorHints 字段
- v0.4 Session 3.0：Navigation Summary Strategy Design（docs-only）
- v0.4 Session 3：Navigation Summary Draft Builder（纯函数 + 73 tests）
- v0.4 Session 3.1：Navigation Summary Markdown + Minimal Integration（serializer + 55 tests）
- v0.4 Session 3.2：Navigation Summary QA Fix + IS01 Completion（IS01 fix + guard + 17 tests）
- v0.4 Session 4：Comment / Selection Clip Core（本轮完成）

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| v0.4 工作区创建 | ✅ 已完成 | Session 0 |
| v0.4 分支创建 | ✅ 已完成 | feature/clipmate-v0.4-site-profiles |
| v0.4 规划文档 | ✅ 已完成 | V0.4_PLAN / AGENT_CONTEXT / CURRENT_STATUS 等 |
| Session 1 Page Type Detector | ✅ 已完成 | 已提交 commit 54a9957，支持 7 类 |
| Session 1.1 Intent & Site Profile | ✅ 已完成 | docs-only：SITE_INTENT_MATRIX + QUALITY_GUARDRAILS |
| Session 2 Site Profile Engine | ✅ 已完成 | 19 seed profiles + 纯函数匹配引擎，commit 006908e |
| Session 2.1 Intent Signal Collector | ✅ 已完成 | commit 72db8b6，待 ChatGPT 审查 |
| Session 2.3 Anti-Slop Review | ✅ 已完成 | read-only review，发现 B1 build blocker + M1 video slop |
| Session 2.3.1 Build Fix & Migration | ✅ 已完成 | 待 ChatGPT 审查 |
| Session 2.2 Seed Site Profiles | ✅ 已完成 | 本轮补强 11 profiles + 8 tests，commit 36c638b |
| Session 3.0 Strategy Design | ✅ 已完成 | docs-only，产出 NAVIGATION_SUMMARY_STRATEGY.md |
| Session 3 Navigation Summary Draft Builder | ✅ 已完成 | 纯函数 draft builder + 73 tests，待 ChatGPT 审查 |
| Session 3.1 Navigation Summary Integration | ✅ 已完成 | Markdown serializer + minimal fallback，待 ChatGPT 审查 |
| Session 3.2 Navigation Summary QA Fix + IS01 | ✅ 已完成 | IS01 修复 + guard + 17 tests + QA doc，待 ChatGPT 审查 |
| Session 4 Comment / Selection Clip Mode | ✅ 已完成 | cd826d3，待 ChatGPT 审查 |
| Session 4.1 Anti-Slop Review | ✅ 已完成 | ChatGPT 审查通过，只读审查，无 commit |
| Session 5 Site Icon / Theme Cache | ✅ 已完成 | 本轮完成，待 ChatGPT 审查 |
| Session 5.1 Anti-Slop Review | ✅ 已完成 | M2 发现并已在 Session 6 修复 |
| Session 6 Link Card Preview | ✅ 已完成 | 本轮完成，待 ChatGPT 审查 |
| Session 8 Docs, QA, Version, Package | ⏳ 待启动 | |
| Session 9 Robustness Check and Release | ⏳ 待启动 | |

---

## 已完成

- [x] v0.4 Session 0：工作区创建与规划审查
- [x] v0.4 Session 1：Page Type Detector — 页面类型识别增强（7 类，通用启发式，已提交）
- [x] v0.4 Session 1.1：Intent & Site Profile Planning — docs-only（SITE_INTENT_MATRIX + QUALITY_GUARDRAILS）
- [x] v0.4 Session 2：Site Profile Engine — 结构化 profile 数据 + 纯函数匹配引擎 + 19 seed profiles + 62 tests
- [x] v0.4 Session 2.1：Intent Signal Collector — 意图信号采集（15 个函数 + 4 个类型/接口 + 61 tests）
- [x] v0.4 Session 2.3：Anti-Slop Review — read-only review 发现 B1 build blocker + M1 video selector slop
- [x] v0.4 Session 2.3.1：Build Fix + Video Iframe Selector Migration — 修复 B1/M1，lint 0 / test 928 / build success
- [x] v0.4 Session 2.2：Seed Profiles Manual QA / Refinement — 补强 11 个 profile selectorHints，8 个新测试，所有 19 个 profile 至少 1 个 hint
- [x] v0.4 Session 3.0：Navigation Summary Mode Strategy Design — docs-only，产出 NAVIGATION_SUMMARY_STRATEGY.md
- [x] v0.4 Session 3：Navigation Summary Draft Builder — 纯函数 draft builder + 73 tests + 文档更新
- [x] v0.4 Session 3.1：Navigation Summary Markdown + Minimal Integration — Markdown serializer + buildLowConfidenceSummary delegate + 55 new tests
- [x] v0.4 Session 3.2：Navigation Summary QA Fix + IS01 Completion — IS01 fix + guard + 17 new tests + NAVIGATION_SUMMARY_QA.md
- [x] v0.4 Session 4：Comment / Selection Clip Core — commentSelection 模块 + 100 tests
- [x] v0.4 Session 4.1：Anti-Slop Review — ChatGPT 审查通过
- [x] v0.4 Session 5：Site Icon / Theme Cache — siteVisual 模块 + 90 tests + metaParser 安全接入
- [x] v0.4 Session 5.1：Anti-Slop Review — 发现 M2 minor（icon 提取逻辑重复）
- [x] v0.4 Session 6：Link Card Preview Core — linkCard 模块 + 109 tests + M2 修复

---

## 未完成（按优先级）

1. Session 6.1：Anti-Slop Review — Link Card 后质量审查（建议新增）
2. Session 7：Docs, QA, Version Bump, Package
3. Session 8：Robustness Check and Release Candidate Review

### Deferred（延后到 v0.5 或独立专项）

- Tag Search UX（History UX）：历史搜索栏支持 #tag 快速筛选 → v0.5
- Better History Config（Settings Refactor）：历史入口放到设置页/独立 tab → v0.5

---

## v0.3 已知问题（继承到 v0.4）

1. CSDN/LaTeX 站点渲染残留 → v0.4 Session 2 可能涉及
2. 搜索页/导航页分类体验 → v0.4 Session 1 已改善通用启发式，Session 3 继续增强
3. 本地 .md 保存按钮 → v0.4+
4. 最近复制历史 → v0.4+
5. Typora/Obsidian 目录记忆 → v0.4+

---

## 下一阶段建议

**ChatGPT 审查本轮 Session 6 → commit → 进入 Session 6.1 Link Card Anti-Slop Review 或 Session 7 Docs/Package**
（Session 6 待 ChatGPT 审查后由用户决定下一步。）
