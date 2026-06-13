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

**v0.4 Session 2.2 已完成** — Seed Profiles Manual QA / Refinement（待 ChatGPT 审查）。

- v0.4 Session 1：Page Type Detector 已提交（commit 54a9957）
- v0.4 Session 1.1：完成 SITE_INTENT_MATRIX.md 和 QUALITY_GUARDRAILS.md
- v0.4 Session 2：完成 Site Profile Engine（siteProfile.types / seedProfiles / siteProfileEngine / index）— commit 006908e
- v0.4 Session 2.1：完成 Intent Signal Collector（intent.types / intentSignalCollector / 61 tests）— commit 72db8b6
- v0.4 Session 2.3：Anti-Slop Review 发现 B1 build blocker（缺少 SelectionContext 导入）和 M1 video iframe domain slop
- v0.4 Session 2.3.1：修复 B1 + M1，lint 0 / test 928 passed / build success
- v0.4 Session 2.2：补强 11 个 profile 的 selectorHints（contentContainer / commentContainer），所有 19 个 profile 现在至少有 1 个 selectorHints 字段；新增 8 个 profile 结构验证测试；总测试数 936
- 建议后续进入 Session 3 Navigation Summary Mode，等待 ChatGPT 审查本 Session 后决定

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
| Session 2.2 Seed Site Profiles | ✅ 已完成 | 本轮补强 11 profiles + 8 tests，待 ChatGPT 审查 |
| Session 3 Navigation Summary Mode | ⏳ 待启动 | |
| Session 4 Comment / Selection Clip Mode | ⏳ 待启动 | |
| Session 4.1 Anti-Slop Review | ⏳ 待启动 | 建议新增 |
| Session 5 Tag Search UX | ⏳ 待启动 | |
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

---

## 未完成（按优先级）

1. Session 3：Navigation Summary Mode — 导航页摘要模式
2. Session 4：Comment / Selection Clip Mode — 评论选区模式
3. Session 4.1：Anti-Slop Review — Comment Mode 后质量审查（建议新增）
4. Session 5：Tag Search UX — 标签搜索
5. Session 6：Site Icon / Theme Cache — 站点图标/主题缓存
6. Session 7：Link Card Preview — 链接卡片预览
7. Session 8：Docs, QA, Version, Package
8. Session 9：Robustness Check and Release Candidate Review

---

## v0.3 已知问题（继承到 v0.4）

1. CSDN/LaTeX 站点渲染残留 → v0.4 Session 2 可能涉及
2. 搜索页/导航页分类体验 → v0.4 Session 1 已改善通用启发式，Session 3 继续增强
3. 本地 .md 保存按钮 → v0.4+
4. 最近复制历史 → v0.4+
5. Typora/Obsidian 目录记忆 → v0.4+

---

## 下一阶段建议

**ChatGPT 审查本 Session 2.2 输出 → commit → 进入 Session 3 Navigation Summary Mode**
（v0.4 中间目标 PageType + SiteProfile + IntentSnapshot 的 profile 数据层已就绪，下游 Session 3 可使用 siteProfileMatch.selectorHints 信息）
