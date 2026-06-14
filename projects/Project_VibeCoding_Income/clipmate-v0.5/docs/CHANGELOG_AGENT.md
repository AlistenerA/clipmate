# CHANGELOG_AGENT.md — ClipMate v0.5 每轮修改记录

---

## v0.5 Session 0：版本交接、目录创建与文章图片保存规划 (2026-06-14)

### 性质

从 clipmate-v0.4 稳定基线 (1850c64) 复制创建 clipmate-v0.5 开发目录。更新所有交接文档，制定 Article Image Saving 分 Session 规划。不实现功能代码。

### 操作

1. robocopy clipmate-v0.4 → clipmate-v0.5（排除 node_modules/dist/build/coverage/.git/.wolf/.opencode/.playwright-mcp/*.zip/.env）
2. npm install 在 v0.5 目录
3. 更新 AGENT_CONTEXT.md / CURRENT_STATUS.md / V0.5_PLAN.md / DECISIONS.md / CHANGELOG_AGENT.md / TEST_LOG.md / ISSUES.md
4. lint 0 / 1691 tests pass / build success

### 新增文件

- `clipmate-v0.5/` 整个目录（从 v0.4 复制）
- `clipmate-v0.5/docs/AGENT_CONTEXT.md`（重写）
- `clipmate-v0.5/docs/CURRENT_STATUS.md`（重写）
- `clipmate-v0.5/docs/V0.5_PLAN.md`（新增）
- `clipmate-v0.5/docs/DECISIONS.md`（重写）
- `clipmate-v0.5/docs/CHANGELOG_AGENT.md`（重写）
- `clipmate-v0.5/docs/TEST_LOG.md`（重写）
- `clipmate-v0.5/docs/ISSUES.md`（重写）

### 未修改

- `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- `../../opencode.json`
- `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未实现功能代码
