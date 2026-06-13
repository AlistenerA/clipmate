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

**v0.4 Session 4 已完成** — Comment / Selection Clip Core（待 ChatGPT 审查）。

- 新增 `commentSelection/` 模块：纯函数类型、builder、Markdown serializer
- 接入 `handleGetSelection()`：基于 selectionContext + pageType 判断选区模式，生成结构化 Markdown
- 7 种选区模式：selection-generic / comment-selection / forum-selection / video-description-selection / video-comment-selection / short-video-caption-selection / ai-answer-selection
- 每个模式有对应 warning 文案，selection-generic 不强制加 warning
- selection-first 不变：有选区永远走 selection 路径，不抓取整页评论/论坛
- 未改 fullpage、Popup、Options、Background、Notion 保存链路
- 总测试数：1084 → 1184（+100：comment-selection-builder 52 + comment-selection-markdown 48）
- 未接入 Notion block 转换，未新增权限/依赖
- 下一步建议 Session 4.1 Anti-Slop Review

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
| Session 4 Comment / Selection Clip Mode | ✅ 已完成 | commentSelection 模块 + GET_SELECTION 接入，待 ChatGPT 审查 |
| Session 4.1 Anti-Slop Review | ⏳ 待启动 | 建议新增 |
| Session 5 Tag Search UX | 🔄 deferred | v0.5 History UX |
| Session 6 Site Icon / Theme Cache | ⏳ 待启动 | |
| Session 7 Link Card Preview | ⏳ 待启动 | |
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

---

## 未完成（按优先级）

1. Session 4：Comment / Selection Clip Mode（✅ 已完成，待 ChatGPT 审查）
2. Session 3.2 Notion Block 转换（deferred，IS01 已修复，Notion block 未接入）
3. Session 4.1：Anti-Slop Review — Comment Mode 后质量审查（建议新增）
4. Session 5：Site Icon / Theme Cache — 站点图标/主题缓存
5. Session 6：Link Card Preview — 链接卡片预览
6. Session 7：Docs, QA, Version, Package
7. Session 8：Robustness Check and Release Candidate Review

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

**ChatGPT 审查本轮 Roadmap Adjustment → commit → 进入 Session 4.1 Anti-Slop Review**
（Session 4 已提交 cd826d3。Tag Search UX 和 Better History Config 已延后到 v0.5。）
