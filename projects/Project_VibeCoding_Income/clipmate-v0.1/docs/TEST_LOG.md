# TEST_LOG.md — ClipMate v0.1 测试记录

> 记录每轮运行过的命令、结果、错误。不隐藏失败。

---

## Session 5 (2026-06-10)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
80 tests passed, 6 test files, 2.00s。
```text
✓ tests/example.test.ts (1 test) 2ms
✓ tests/notion-errors.test.ts (9 tests) 5ms
✓ tests/notion-blocks.test.ts (13 tests) 8ms
✓ tests/notion-client.test.ts (10 tests) 9ms
✓ tests/shared-utils.test.ts (35 tests) 8ms
✓ tests/content-parser.test.ts (12 tests) 124ms

Test Files  6 passed (6)
     Tests  80 passed (80)
  Duration  2.00s
```

```pwsh
npm run build
```
构建成功：80 modules, 756ms
- tsc: 无类型错误
- vite build: 80 个模块，756ms
- Popup bundle: 9.28KB (gzip 3.78KB)
- Options bundle: 5.36KB (gzip 1.98KB)
- Content Script bundle: 47.61KB (gzip 16.21KB)
- Background bundle: 3.26KB (gzip 1.53KB)

```pwsh
npm run zip
```
打包成功：clipmate-v0.1.zip (77.7KB)
- 使用 `Import-Module Microsoft.PowerShell.Archive; Compress-Archive`
- 仅包含 dist/ 构建产物，不含源码/测试/文档/node_modules

### 测试变更

无（本轮未修改业务代码，测试结果与 Session 4.2.1 一致）。

### 新增文档
- `docs/TEST_PLAN.md` — 16 项测试用例
- `docs/MANUAL_QA_RESULT_TEMPLATE.md` — 手动测试记录模板
- `README.md` — 项目 README

### 修改文档
- `docs/RELEASE_CHECKLIST.md` — 重写
- `docs/PRIVACY_POLICY_DRAFT.md` — 重写
- `docs/STORE_LISTING_DRAFT.md` — 重写
- `docs/PERMISSION_JUSTIFICATION.md` — 重写

### 错误/失败

- **npm run zip 首次失败**：`Compress-Archive` 命令未找到（模块未加载）。修复：在脚本中增加 `Import-Module Microsoft.PowerShell.Archive` 前置步骤后成功。

---

## Session 4.2.1 (2026-06-10)

（详见完整 TEST_LOG.md）

---

