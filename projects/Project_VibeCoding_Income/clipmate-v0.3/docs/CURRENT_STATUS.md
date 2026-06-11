# CURRENT_STATUS.md — ClipMate v0.3 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，除非用户明确要求 patch，否则不修改
> - `clipmate-v0.3/` = 当前 v0.3 规划与开发目录

---

## 当前阶段

**v0.3 Session 0 已完成** — 版本目录隔离与启动前评估。

- `clipmate-v0.3/` 已从稳定 v0.2 复制创建（基于 commit `6d6087c`）。
- 当前分支为 `feature/clipmate-v0.3-planning`。
- 本轮未实现任何功能。
- 下一步应由 ChatGPT 审查 V0.3_PLAN.md，再由用户确认 v0.3 唯一主线方向。

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| v0.3 版本目录创建 | ✅ 已完成 | 从 v0.2 复制，排除 node_modules/dist/build/zip/.env |
| v0.3 分支创建 | ✅ 已完成 | feature/clipmate-v0.3-planning |
| v0.3 文档更新 | ✅ 已完成 | AGENT_CONTEXT / CURRENT_STATUS / V0.3_PLAN / CHANGELOG_AGENT / TEST_LOG / ISSUES / DECISIONS |
| v0.3 方向评估 | ✅ 已完成 | 见 V0.3_PLAN.md |
| v0.3 Session 拆分草案 | ✅ 已完成 | 见 V0.3_PLAN.md |
| v0.3 功能开发 | ⬜ 未开始 | 等待用户确认主线方向 |
| package.json 版本号 | 0.2.0 | 未修改，留待 release Session |
| manifest.config.ts 版本号 | 0.2.0 | 未修改，留待 release Session |
| manifest 权限 | 未变 | storage / activeTab / host_permissions api.notion.com |

---

## 已完成

- [x] v0.3 Session 0：版本目录隔离与启动前评估

---

## 未完成（按优先级）

1. **用户确认 v0.3 唯一主线方向**（见 V0.3_PLAN.md 第五/六节）
2. v0.3 Session 1：确定主线方向，更新范围、数据结构草案、Session 拆分
3. v0.3 Session 2+：按选定主线拆小 Session 实现
4. v0.2 人工 QA（独立于 v0.3，由用户决定何时执行）
5. v0.2 发布到 Edge Add-ons（独立于 v0.3，由用户决定何时执行）

---

## 下一阶段建议

**由 ChatGPT 审查 V0.3_PLAN.md** → 用户确认唯一主线方向 → v0.3 Session 1 正式开始。

v0.3 候选方向及其评估详见 `V0.3_PLAN.md`。当前推荐优先评估 AI 摘要与 AI 标签，但必须由用户确认是否接受外部 API、隐私政策更新和"用户自带 API Key"模式。

> v0.3 Session 0 交付：版本目录隔离、分支创建、文档更新、方向评估。未修改 src/、tests/、package.json、manifest.config.ts。`clipmate-v0.1/` 和 `clipmate-v0.2/` 未修改。
