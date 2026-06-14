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

**v0.4 Session 8.5 已完成** — Content Script Connection Failure Fix。

- 真实 Edge 微博测试发现 "Receiving end does not exist" 错误
- 修复：友好错误提示 + 纯函数 error detection + 早期检测
- 修复后：lint 0 / 1426 tests pass / build success
- 下一步：ChatGPT 审查 → commit → 用户刷新微博详情页重新测试

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
| Session 2.1 Intent Signal Collector | ✅ 已完成 | commit 72db8b6 |
| Session 2.3 Anti-Slop Review | ✅ 已完成 | read-only review，发现 B1 build blocker + M1 video slop |
| Session 2.3.1 Build Fix & Migration | ✅ 已完成 | B1/M1 修复 |
| Session 2.2 Seed Site Profiles | ✅ 已完成 | 11 profiles 补强，commit 36c638b |
| Session 3.0 Strategy Design | ✅ 已完成 | docs-only，产出 NAVIGATION_SUMMARY_STRATEGY.md |
| Session 3 Navigation Summary Draft Builder | ✅ 已完成 | 纯函数 draft builder + 73 tests |
| Session 3.1 Navigation Summary Integration | ✅ 已完成 | Markdown serializer + minimal fallback |
| Session 3.2 Navigation Summary QA Fix + IS01 | ✅ 已完成 | IS01 修复 + guard + 17 tests + QA doc |
| Session 4 Comment / Selection Clip Mode | ✅ 已完成 | cd826d3 |
| Session 4.1 Anti-Slop Review | ✅ 已完成 | ChatGPT 审查通过 |
| Session 5 Site Icon / Theme Cache | ✅ 已完成 | 2b2715e |
| Session 5.1 Anti-Slop Review | ✅ 已完成 | M2 发现，Session 6 已修复 |
| Session 6 Link Card Preview | ✅ 已完成 | a36da4e |
| Session 6.1 Anti-Slop Review | ✅ 已完成 | ChatGPT 审查通过 |
| Session 7 Docs, QA, Version, Package | ✅ 已完成 | 本轮，待 ChatGPT 审查 |
| Session 8 Robustness Check and Release | ✅ 已完成 | Session 8 (只读审查，通过) |
| Session 8.1 Bilibili QA Fix | ✅ 已完成 | commit e071bc1 |
| Session 8.2 Playwright QA Integration | ✅ 已完成 | 本轮 docs-only |
| Session 8.3 Playwright Site QA | ✅ 已完成 | Weibo/Bilibili profile 修正 |
| Session 8.3.1 Stabilize QA Patch | ✅ 已完成 | ChatGPT 审查修正 |
| Session 8.5 Connection Fix | ✅ 已完成 | 友好错误提示，微博 blocker 修复 |

---

## 已完成

- [x] v0.4 Session 0：工作区创建与规划审查
- [x] v0.4 Session 1：Page Type Detector
- [x] v0.4 Session 1.1：Intent & Site Profile Planning
- [x] v0.4 Session 2：Site Profile Engine
- [x] v0.4 Session 2.1：Intent Signal Collector
- [x] v0.4 Session 2.3：Anti-Slop Review
- [x] v0.4 Session 2.3.1：Build Fix + Video Iframe Selector Migration
- [x] v0.4 Session 2.2：Seed Profiles Refinement
- [x] v0.4 Session 3.0：Navigation Summary Strategy Design
- [x] v0.4 Session 3：Navigation Summary Draft Builder
- [x] v0.4 Session 3.1：Navigation Summary Markdown + Integration
- [x] v0.4 Session 3.2：Navigation Summary QA Fix + IS01
- [x] v0.4 Session 4：Comment / Selection Clip Core
- [x] v0.4 Session 4.1：Anti-Slop Review
- [x] v0.4 Session 5：Site Icon / Theme Cache
- [x] v0.4 Session 5.1：Anti-Slop Review
- [x] v0.4 Session 6：Link Card Preview Core
- [x] v0.4 Session 6.1：Anti-Slop Review
- [x] v0.4 Session 7：Docs, Manual QA, Version Bump to 0.4.0, Package
- [x] v0.4 Session 8：Release Robustness Review（只读审查，通过）
- [x] v0.4 Session 8.1：Bilibili Video Page Manual QA Fix
- [x] v0.4 Session 8.2：Playwright QA Workflow Integration
- [x] v0.4 Session 8.3：Playwright-assisted Site Classification & Comment Boundary QA
- [x] v0.4 Session 8.3.1：Stabilize Playwright Site QA Patch
- [x] v0.4 Session 8.5：Content Script Connection Failure Fix

---

## 未完成（按优先级）

1. 用户刷新微博详情页后重新测试全文/选区剪藏（验证 S8.5 修复）
2. Xiaohongshu / Douyin / Google 因反爬无法自动验证 → 需用户人工测试

### Deferred（延后到 v0.5 或独立专项）

- Tag Search UX：历史搜索栏支持 #tag 快速筛选 → v0.5
- Better History Config：历史入口放到设置页/独立 tab → v0.5
- SiteVisual cache persistence：已实现纯函数 strategy，未写入 chrome.storage → v0.5
- Link Card Popup UI：builder/serializer 已实现，UI 未接入 → v0.5
- Notion 专用 card block → v0.5
- History UI for Link Card → v0.5

---

## v0.3 已知问题（继承到 v0.4）

1. CSDN/LaTeX 站点渲染残留 → v0.4 Session 2 已改善，部分限制仍存在
2. 搜索页/导航页分类体验 → v0.4 Session 1/3 已大幅改善
3. 本地 .md 保存按钮 → v0.5+
4. 最近复制历史 → v0.5+
5. Typora/Obsidian 目录记忆 → v0.5+

---

## 下一阶段建议

**ChatGPT 审查本轮 Session 8.5 → commit → 用户刷新微博详情页并重新测试全文/选区剪藏。**
