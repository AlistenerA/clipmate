# CURRENT_STATUS.md — ClipMate v0.3 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，除非用户明确要求 patch，否则不修改
> - `clipmate-v0.3/` = 当前 v0.3 规划与开发目录

---

## 当前阶段

**v0.3 Session 8-D 已完成** — 选区优先模式小修 + 已知问题归档 + 文档脱敏清理

- v0.3 主线：内容保真增强版
- Session 8-D 交付：
  - A：Popup 选区优先模式修复 — 每次打开 Popup 先检查 selection，有选区则优先 selection，无选区才恢复旧 draft 或走 fullpage

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
| Markdown Preview | ✅ 已完成 | Session 5 |
| Article Boundary Guard | ✅ 已完成 | Session 6 |
| 文档、QA、版本号、打包 | ✅ 已完成 | Session 7 — 版本号 0.3.0，所有发布文档更新，lint/test/build/zip 通过 |
| 鲁棒性检查与修复 | ✅ Session 8-D | 人工 QA 修复完毕 + Notion rich_text + 页面类型 + 选区优先 |
| package.json 版本号 | 0.3.0 | Session 7 已升级 |
| manifest.config.ts 版本号 | 0.3.0 | Session 7 已升级 |
| manifest 权限 | 未变 | storage / activeTab / host_permissions api.notion.com |

---

## 已完成

- [x] v0.3 Session 0：版本目录隔离与启动前评估
- [x] v0.3 Session 0.1：重规划修正 — 主线调整为内容保真增强（docs-only）
- [x] v0.3 Session 1：Markdown Target Profiles — 数据结构、纯函数、测试、Popup 接入
- [x] v0.3 Session 2：LaTeX 公式保留 — formulaPreserve 纯函数、cleanMarkdown 保护、Content Script MathJax 提取、htmlToMarkdown 预处理
- [x] v0.3 Session 3：Code Block Cleaner — codeBlockCleaner 纯函数、htmlToMarkdown 后处理、59 tests
- [x] v0.3 Session 4：Image / Link / Table Normalization — mediaLinkTableNormalizer 纯函数、Turndown rules 增强、83 tests
- [x] v0.3 Session 5：Markdown Preview — parseMarkdownPreview 纯函数、MarkdownPreview 安全组件、Popup 切换、41 tests（含卡住修复）
- [x] v0.3 Session 6：Article Boundary Guard — DOM 噪音预清理、正文候选评分、尾部截断、低置信兜底、99 tests
- [x] v0.3 Session 7：文档、QA、版本号、打包 — 版本号 0.3.0，README/隐私/权限/商店/测试计划/QA 清单更新，lint 0 errors / test 703 passed / build success / zip 129KB
- [x] v0.3 Session 8-B：人工 QA blocker 最小修复 — 9 项修复 + 32 tests / lint 0 errors / test 735 passed / build success
- [x] v0.3 Session 8-C：人工复测后剩余问题修复 — Notion rich_text + LaTeX 二次清理 + 页面类型识别 + 选区优先 + 22 tests / lint 0 errors / test 757 passed / build success
- [x] v0.3 Session 8-D：选区优先模式小修 — Popup 每次打开优先检查 selection + 已知问题归档 + 文档脱敏 + lint 0 errors / test 757 passed / build success

---

## Public Snapshot Status

- v0.3 public snapshot has been prepared and pushed to GitHub public repository.
- Public repository: https://github.com/AlistenerA/clipmate
- Public repository policy: keep latest public version only (currently clipmate-v0.3).
- Next planned version: v0.4 — Site Profiles and Scenario Modes.
- See `docs/V0.4_HANDOFF.md`.<｜end▁of▁thinking｜>

## 未完成（按优先级）

1. v0.3 人工 QA 复测 — 选区优先模式需用户复测
2. v0.4+ 已知问题：CSDN/LaTeX 站点渲染残留 → v0.4
3. v0.4+ 已知问题：搜索页/导航页分类仍需优化 → v0.4
4. v0.2 发布到 Edge Add-ons（独立于 v0.3，由用户决定何时执行）

---

## 下一阶段建议

**用户复测选区优先模式 → ChatGPT 审查 8-B/8-C/8-D → commit → 发布准备**
