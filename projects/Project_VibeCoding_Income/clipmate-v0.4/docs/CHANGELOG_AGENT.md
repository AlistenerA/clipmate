# CHANGELOG_AGENT.md — ClipMate v0.4 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

---

## v0.4 Session 0：工作区创建与规划审查 (2026-06-13)

### 产出

- `clipmate-v0.4/` — 从 v0.3 复制的完整项目目录（排除 node_modules/dist/build/coverage/*.zip/.env/.wolf/.opencode/.playwright-mcp）
- `feature/clipmate-v0.4-site-profiles` — 新开发分支

### 新增/修改文件

- `docs/V0.4_PLAN.md` — v0.4 规划文档（9 个 Session 拆分、核心目标、非目标、权限策略、commit 策略）
- `docs/AGENT_CONTEXT.md` — 重写为 v0.4 版本上下文
- `docs/CURRENT_STATUS.md` — 更新为 Session 0 完成状态
- `docs/CHANGELOG_AGENT.md` — 本条记录（基于 v0.3 CHANGELOG 清除旧记录，新建 v0.4 记录）
- `docs/TEST_LOG.md` — Session 0 记录（docs/workspace setup only）
- `docs/ISSUES.md` — 记录 v0.3 继承的 known issues
- `docs/DECISIONS.md` — 新增 D-v0.4-001 ~ D-v0.4-004

### 未修改文件

- `clipmate-v0.1/` — 未修改
- `clipmate-v0.2/` — 未修改
- `clipmate-v0.3/` — 未修改
- `clipmate-v0.4/src/` — 未修改
- `clipmate-v0.4/tests/` — 未修改
- `clipmate-v0.4/package.json` — 未修改（版本号保持 0.3.0）
- `clipmate-v0.4/manifest.config.ts` — 未修改（版本号保持 0.3.0）
- `clipmate-v0.4/package-lock.json` — 未修改

### 改动摘要

- 从稳定 v0.3 创建 v0.4 工作目录，排除 node_modules/dist/build/coverage/zip/.env/.wolf/.opencode/.playwright-mcp
- 创建 feature/clipmate-v0.4-site-profiles 分支
- 建立 v0.4 规划文档：7 个 Session + 2 个发布 Session，明确非目标和权限策略
- 版本号推迟策略：当前 package/manifest 保持 0.3.0，release 前统一升 0.4.0
- 本轮 docs + workspace setup only，未修改业务代码
- 未新增权限、未新增依赖
- 未运行 lint/test/build（无代码变更）
- 未 commit

---

*（v0.4 之前版本的修改记录见 clipmate-v0.3/docs/CHANGELOG_AGENT.md）*
