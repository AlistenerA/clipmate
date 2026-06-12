# CURRENT_STATUS.md — ClipMate v0.3 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，除非用户明确要求 patch，否则不修改
> - `clipmate-v0.3/` = 当前 v0.3 规划与开发目录

---

## 当前阶段

**v0.3 Session 1 已完成** — Markdown Target Profiles：新增 Notion / Obsidian / Typora / Generic Markdown 四类输出 profile，数据结构、纯函数、测试和最小 Popup 接入。

- v0.3 主线：内容保真增强版。
- Session 1 交付：MarkdownTarget 类型、4 个 MarkdownProfile 定义、getMarkdownProfile / listMarkdownProfiles / normalizeMarkdownTarget / formatMarkdownWithProfile 纯函数、Popup MarkdownTargetSelector 组件、58 项新测试。
- 已接入 Popup 复制 Markdown 链路，默认 target 为 notion（保持向后兼容）。
- 未修改 Notion API 保存链路、未新增权限、未修改版本号。
- 下一步应进入 v0.3 Session 2：LaTeX / 数学公式保留。

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| v0.3 版本目录创建 | ✅ 已完成 | Session 0 |
| v0.3 分支创建 | ✅ 已完成 | feature/clipmate-v0.3-planning |
| v0.3 方向评估（初版AI方向） | ✅ 已完成 | Session 0，已被 Session 0.1 重规划替代 |
| v0.3 重规划修正 | ✅ 已完成 | Session 0.1 — 主线调整为内容保真增强 |
| v0.3 功能开发 | ✅ 进行中 | Session 1 已完成 |
| Markdown Target Profiles | ✅ 已完成 | Session 1 — 4 profiles + 纯函数 + 测试 + Popup 接入 |
| LaTeX 公式保留 | ⬜ 待开始 | Session 2 |
| Code Block Cleaner | ⬜ 待开始 | Session 3 |
| Image/Link/Table Normalization | ⬜ 待开始 | Session 4 |
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

---

## 未完成（按优先级）

1. v0.3 Session 2：LaTeX / 数学公式保留
2. v0.3 Session 3：Code Block Cleaner
3. v0.3 Session 4：Image / Link / Table Normalization
4. v0.3 Session 5：Markdown Preview
5. v0.3 Session 6：Article Boundary Guard
6. v0.3 Session 7：文档、QA、版本号、打包
7. v0.3 Session 8：鲁棒性检查与修复
8. v0.2 人工 QA（独立于 v0.3，由用户决定何时执行）
9. v0.2 发布到 Edge Add-ons（独立于 v0.3，由用户决定何时执行）

---

## 下一阶段建议

**由 ChatGPT 审查 Session 1 交付** → 用户确认 → 发送 v0.3 Session 2 专用 Prompt（LaTeX / 数学公式保留）。

> v0.3 Session 1 交付：新增 4 个 Markdown Target Profiles、formatMarkdownWithProfile 纯函数、Popup MarkdownTargetSelector 组件、58 项新测试。lint/test/build 全部通过。未修改 Notion API 保存链路、未修改版本号、未新增权限。
