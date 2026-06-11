# CHANGELOG_AGENT.md — ClipMate v0.1 / v0.2 / v0.3 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

---

## v0.3 Session 0：版本目录隔离与启动前评估 (2026-06-11)

### 新增文件
- `clipmate-v0.3/` — 从 v0.2 复制的新版本目录（排除 node_modules/dist/build/*.zip/.env）
- `docs/V0.3_PLAN.md` — v0.3 迭代规划文档（定位、候选方向评估、Session 拆分草案、待决策问题）

### 修改文件
- `docs/AGENT_CONTEXT.md` — 重写为 v0.3 版本上下文
- `docs/CURRENT_STATUS.md` — 更新为 v0.3 Session 0 完成状态
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 0 记录
- `docs/ISSUES.md` — 更新待决策问题
- `docs/DECISIONS.md` — 新增 D-v0.3-001~D-v0.3-004

### 未修改文件
- `clipmate-v0.1/` — 未修改
- `clipmate-v0.2/` — 未修改
- `clipmate-v0.3/src/` — 未修改
- `clipmate-v0.3/tests/` — 未修改
- `clipmate-v0.3/package.json` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/manifest.config.ts` — 未修改（版本号保持 0.2.0）

### 改动摘要
- 基于稳定 v0.2（commit `6d6087c`）创建 clipmate-v0.3/ 独立目录
- 创建 feature/clipmate-v0.3-planning 分支
- 新建 V0.3_PLAN.md：6 个候选方向评估、影响分析、推荐优先级、Session 拆分草案、7 个待用户决策问题
- 更新所有 v0.3 docs 为 v0.3 上下文
- 未修改任何业务代码
- 未修改 v0.1/v0.2
- 未新增/修改 manifest 权限
- 未新增依赖
- 未运行 lint/test/build（本轮不需要）

---

## v0.2 Session 8：跨版本工作流规则录入 + v0.3 交接文档 (2026-06-11)

### 新增文件
- `docs/WORKFLOW_RULES.md` — ClipMate 跨版本 Agent 工作流规则（通用规则，适用于 v0.2、v0.2.x、v0.3、v0.4 及后续版本）
- `docs/V0.3_HANDOFF.md` — v0.3 版本交接与规划草案（候选方向评估、启动前置条件、禁止事项）

### 修改文件
- `docs/AGENT_CONTEXT.md` — 新增"跨版本工作流规则入口"章节，引导 agent 优先读取 WORKFLOW_RULES.md 和 V0.3_HANDOFF.md
- `docs/CURRENT_STATUS.md` — 更新当前阶段为 Session 8 已完成
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 8 记录（docs-only，无代码变更）
- `docs/ISSUES.md` — 确认无新增 blocker
- `docs/DECISIONS.md` — 新增 D-075/D-076/D-077

### 改动摘要
- 本轮为 docs-only 规则录入任务，未修改任何业务代码
- 未修改 clipmate-v0.1/
- 未修改 clipmate-v0.2/src/
- 未修改 clipmate-v0.2/tests/
- 未修改 package.json / manifest.config.ts 版本号
- WORKFLOW_RULES.md 覆盖：优先级规则、安全底线、版本目录隔离、每轮开始/结束规则、Git commit 规则、Bug 修复流程、功能开发规划流程、鲁棒性检查流程、人工测试与 ChatGPT 审查规则
- V0.3_HANDOFF.md 覆盖：当前状态、启动前置条件、5 个候选方向评估（AI/Database/多平台/OCR/付费）、推荐优先级、启动 Prompt 原则、禁止事项、ChatGPT 审查节点

---
*（以下为 v0.2 及更早版本的修改记录，完整内容见 clipmate-v0.2/docs/CHANGELOG_AGENT.md）*
