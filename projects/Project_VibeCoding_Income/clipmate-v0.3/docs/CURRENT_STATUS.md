# CURRENT_STATUS.md — ClipMate v0.3 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，除非用户明确要求 patch，否则不修改
> - `clipmate-v0.3/` = 当前 v0.3 规划与开发目录

---

## 当前阶段

**v0.3 Session 4 已完成** — Image / Link / Table Normalization：新增 mediaLinkTableNormalizer 纯函数模块（7 个函数），Turndown rules 增强（img / figure / a / table），83 项新测试。

- v0.3 主线：内容保真增强版。
- Session 4 交付：
  - `mediaLinkTableNormalizer.ts`（7 个纯函数：isSafeLinkHref / isLikelyImageUrl / sanitizeMarkdownCell / normalizeImageMarkdown / normalizeLinkMarkdown / normalizeTableMarkdown）
  - `htmlToMarkdown.ts` 新增 4 个 Turndown rules（img 增强 / figure + caption / anchor 安全过滤 / table markdown 转换）
  - 83 项新测试
- 未修改 Notion API 保存链路、未新增权限、未修改版本号。
- 下一步应进入 v0.3 Session 5：Markdown Preview。

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| v0.3 版本目录创建 | ✅ 已完成 | Session 0 |
| v0.3 分支创建 | ✅ 已完成 | feature/clipmate-v0.3-planning |
| v0.3 方向评估（初版AI方向） | ✅ 已完成 | Session 0，已被 Session 0.1 重规划替代 |
| v0.3 重规划修正 | ✅ 已完成 | Session 0.1 — 主线调整为内容保真增强 |
| v0.3 功能开发 | ✅ 进行中 | Session 1-4 已完成 |
| Markdown Target Profiles | ✅ 已完成 | Session 1 — 4 profiles + 纯函数 + 测试 + Popup 接入 |
| LaTeX 公式保留 | ✅ 已完成 | Session 2 — formulaPreserve 纯函数 + cleanMarkdown 保护 + HTML 恢复 |
| Code Block Cleaner | ✅ 已完成 | Session 3 — codeBlockCleaner 纯函数 + 后处理清理 + 59 tests |
| Image / Link / Table Normalization | ✅ 已完成 | Session 4 — mediaLinkTableNormalizer 纯函数 + Turndown rules + 83 tests |
| Markdown Preview | ⬜ 待开始 | Session 5 |
| Article Boundary Guard | ⬜ 待开始 | Session 6 |
| 文档、QA、版本号、打包 | ⬜ 待开始 | Session 7 |
| 鲁棒性检查与修复 | ⬜ 待开始 | Session 8 |
| package.json 版本号 | 0.2.0 | 未修改，留待 Session 7 |
| manifest.config.ts 版本号 | 0.2.0 | 未修改，留待 Session 7 |
| manifest 权限 | 未变 | storage / activeTab / host_permissions api.notion.com |

---

## 已完成

- [x] v0.3 Session 0：版本目录隔离与启动前评估
- [x] v0.3 Session 0.1：重规划修正 — 主线调整为内容保真增强（docs-only）
- [x] v0.3 Session 1：Markdown Target Profiles — 数据结构、纯函数、测试、Popup 接入
- [x] v0.3 Session 2：LaTeX 公式保留 — formulaPreserve 纯函数、cleanMarkdown 保护、Content Script MathJax 提取、htmlToMarkdown 预处理
- [x] v0.3 Session 3：Code Block Cleaner — codeBlockCleaner 纯函数、htmlToMarkdown 后处理、59 tests
- [x] v0.3 Session 4：Image / Link / Table Normalization — mediaLinkTableNormalizer 纯函数、Turndown rules 增强、83 tests

---

## 未完成（按优先级）

1. v0.3 Session 5：Markdown Preview
2. v0.3 Session 6：Article Boundary Guard
3. v0.3 Session 7：文档、QA、版本号、打包
4. v0.3 Session 8：鲁棒性检查与修复
5. v0.2 人工 QA（独立于 v0.3，由用户决定何时执行）
6. v0.2 发布到 Edge Add-ons（独立于 v0.3，由用户决定何时执行）

---

## 下一阶段建议

**由 ChatGPT 审查 Session 4 交付** → 用户确认 → 发送 v0.3 Session 5 专用 Prompt（Markdown Preview）。
