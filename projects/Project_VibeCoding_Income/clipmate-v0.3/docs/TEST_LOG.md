# TEST_LOG.md — ClipMate v0.3 测试记录

> 记录每轮运行过的命令、结果、错误。不隐藏失败。

---

## v0.3 Session 1 (2026-06-12)

### 运行命令

```
npm run lint  → 0 errors, 0 warnings
npm run test  → 379 passed (14 files), 0 failures
npm run build → success
```

### 测试统计

- 总测试数：379（v0.2 继承 321 + Session 1 新增 58）
- 测试文件数：14（v0.2 继承 13 + Session 1 新增 1）
- 新增测试文件：`tests/markdown-profiles.test.ts`（58 tests）

### 新增测试覆盖

| 测试类别 | 测试数 |
|----------|:---:|
| listMarkdownProfiles | 4 |
| getMarkdownProfile | 5 |
| normalizeMarkdownTarget | 5 |
| Notion profile output | 7 |
| Obsidian profile output | 10 |
| Typora profile output | 6 |
| Generic profile output | 5 |
| Edge cases | 10 |
| Profile properties | 2 |
| **合计** | **58** |

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- lint 0 errors ✅
- test 全部通过 ✅
- build 成功 ✅
- 未新增 manifest 权限 ✅
- 未新增依赖 ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 无 dist/、build/、zip、node_modules、.env、.wolf/、.opencode/、.playwright-mcp/ 变更 ✅

### 错误/失败

lint 初始 1 个 error（formatWithProfile.ts:15 unnecessary escape character `\[`），已修复。

---

## v0.3 Session 0.1 (2026-06-12)

### 运行命令

本轮为 docs-only 规划修正任务。未修改业务代码。

未运行 npm run lint / test / build（本轮无代码变更，不需要）。

### 执行检查

已执行 git 检查：
- `git branch --show-current`：`feature/clipmate-v0.3-planning` ✅
- `git status --short`：干净 ✅
- `git log --oneline -8`：正常 ✅
- `git diff --stat`：仅 docs/ 下 6 个文件 ✅
- `git diff --name-only`：仅 docs/ 下 6 个文件 ✅

### 产出

- `docs/V0.3_PLAN.md` — 全面重写，主线调整为内容保真增强
- `docs/CURRENT_STATUS.md` — 更新为 Session 0.1 完成状态
- `docs/DECISIONS.md` — 新增 D-v0.3-005
- `docs/ISSUES.md` — 更新待决策问题和已知风险
- `docs/CHANGELOG_AGENT.md` — Session 0.1 记录
- `docs/TEST_LOG.md` — 本条记录

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/src/ ✅
- 未修改 clipmate-v0.3/tests/ ✅
- 未修改 clipmate-v0.3/package.json ✅
- 未修改 clipmate-v0.3/manifest.config.ts ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 lint/test/build ✅（原因：无代码变更）
- 无 dist/、build/、zip、node_modules、.env、.wolf/、.opencode/、.playwright-mcp/ 变更 ✅

### 错误/失败

无。

---

## v0.3 Session 0 (2026-06-11)

### 运行命令

本轮为目录复制 + 文档评估任务。未修改业务代码。

未运行 npm run lint / test / build（本轮不需要）。

### 产出

- `clipmate-v0.3/` — 从 v0.2 复制的完整项目目录
- `docs/V0.3_PLAN.md` — v0.3 规划文档
- 更新 AGENT_CONTEXT / CURRENT_STATUS / CHANGELOG_AGENT / TEST_LOG / ISSUES / DECISIONS

### 检查项

已执行 git status / git log 检查：
- git branch --show-current：`feature/clipmate-v0.3-planning` ✅
- git status --short（复制前）：clean ✅
- 复制命令：robocopy clipmate-v0.2 clipmate-v0.3 /E /XD node_modules dist build .git /XF *.zip .env .env.*
- git status --short（复制后）：仅 `?? clipmate-v0.3/` ✅
- git status --short（最终）：仅 clipmate-v0.3/ 新增/修改 ✅
- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 无 dist/、build/、zip、node_modules、.env、.wolf/、.opencode/、.playwright-mcp/ ✅

### 错误/失败

无。

---

*（以下为 v0.2 及更早版本的测试记录，完整内容见 clipmate-v0.2/docs/TEST_LOG.md）*
