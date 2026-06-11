# TEST_LOG.md — ClipMate v0.1 / v0.2 测试记录

> 记录每轮运行过的命令、结果、错误。不隐藏失败。

---

## v0.2 Session 3 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
146 tests passed, 8 test files, 1.94s。
```text
✓ tests/example.test.ts (1 test) 2ms
✓ tests/notion-client.test.ts (10 tests) 9ms
✓ tests/notion-blocks.test.ts (13 tests) 5ms
✓ tests/notion-errors.test.ts (9 tests) 4ms
✓ tests/options-targets.test.ts (32 tests) 9ms
✓ tests/shared-utils.test.ts (35 tests) 8ms
✓ tests/storage-migration.test.ts (34 tests) 43ms
✓ tests/content-parser.test.ts (12 tests) 119ms

Test Files  8 passed (8)
     Tests  146 passed (146)
  Duration  1.94s
```

```pwsh
npm run build
```
构建成功：85 modules, 877ms
- tsc: 无类型错误
- vite build: 85 个模块，877ms
- Options bundle: 11.22KB (gzip 3.45KB) — 相比 v0.1 5.36KB 增加约 6KB（新增 TargetList/TargetEditor/targetManager）

### 新增测试覆盖

| 分类 | 测试数 | 覆盖内容 |
|------|:---:|------|
| addTarget | 10 | 首目标默认、次目标不覆盖默认、makeDefault 覆盖、trim、空名称/ID 报错、时间戳 |
| updateTarget | 8 | 更新名称/pageId、trim、保留 id/createdAt、更新 updatedAt、保留 isDefault、找不到报错 |
| deleteTarget | 6 | 删非默认、删默认选新默认、删最后一个清空 defaultId、找不到报错、唯一默认 |
| setDefaultTarget | 4 | 设置默认、取消前一默认、已默认 no-op、找不到报错 |
| maskPageId | 3 | 空字符串、长 pageId 截断、短 pageId |

### 错误/失败

无。

---

## v0.2 Session 2 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
114 tests passed, 7 test files。

```pwsh
npm run build
```
构建成功。

### 产出

- `clipmate-v0.2/` 目录创建并迁移完成
- `clipmate-v0.1/` 恢复为 v0.1 冻结快照
- 更新 V0.2_PLAN / AGENT_CONTEXT / CURRENT_STATUS / CHANGELOG_AGENT / DECISIONS

### 错误/失败

无。

---

## v0.2 Session 1 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
114 tests passed, 7 test files, 2.07s。
```text
✓ tests/example.test.ts (1 test) 2ms
✓ tests/notion-errors.test.ts (9 tests) 3ms
✓ tests/notion-blocks.test.ts (13 tests) 6ms
✓ tests/notion-client.test.ts (10 tests) 8ms
✓ tests/shared-utils.test.ts (35 tests) 6ms
✓ tests/storage-migration.test.ts (34 tests) 39ms
✓ tests/content-parser.test.ts (12 tests) 116ms

Test Files  7 passed (7)
     Tests  114 passed (114)
  Duration  2.07s
```

```pwsh
npm run build
```
构建成功：82 modules, 907ms
- tsc: 无类型错误
- vite build: 82 个模块，907ms
- Popup bundle: 9.28KB (gzip 3.78KB)
- Options bundle: 5.36KB (gzip 1.98KB)
- Content Script bundle: 47.61KB (gzip 16.21KB)
- Background bundle: 3.26KB (gzip 1.53KB)
- Storage bundle: 2.43KB (gzip 1.26KB)

### 新增测试覆盖

| 分类 | 测试数 | 覆盖内容 |
|------|:---:|------|
| migrateSettings 纯函数 | 7 | v0.1 迁移、无 pageId 不创建空目标、空/null 初始化、字段保留、Token 不打印 |
| getSettings 与迁移 | 4 | v2 存储读取、v0.1 自动迁移、不重复迁移、写回存储 |
| saveSettings | 1 | 保存并读取验证 |
| notionTargets CRUD | 5 | 获取/保存/默认目标/空列表 |
| history CRUD | 14 | 添加/更新/删除/清空/搜索（title/url/tags/大小写/空查询）、markdown 截断、limit 裁剪、limit 下限 clamp |
| no token leakage | 1 | Token 透传不打印 |

### 错误/失败

- **limit enforcement 测试失败（已修复）**：测试使用 `historyLimit: 3`（低于 MIN_HISTORY_LIMIT=10），limit 被 clamp 到 10 导致裁剪未生效。修复：测试改用 `historyLimit: 10` 并新增 clamp 验证测试。
- **ESLint 1 error（已修复）**：`DEFAULT_HISTORY_LIMIT` 被导入但未使用。修复：从 import 中移除。

### 运行命令

无。本轮为纯规划 Session，未修改业务代码，未运行测试/构建/lint。

### 产出

- `docs/V0.2_PLAN.md` — v0.2 迭代规划文档
- 更新 CURRENT_STATUS / CHANGELOG_AGENT / DECISIONS

### 错误/失败

无。

---

## v0.1 Session 5.1 (2026-06-10)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
80 tests passed, 6 test files, 1.39s。
```text
✓ tests/example.test.ts (1 test) 1ms
✓ tests/notion-errors.test.ts (9 tests) 2ms
✓ tests/notion-blocks.test.ts (13 tests) 4ms
✓ tests/notion-client.test.ts (10 tests) 6ms
✓ tests/shared-utils.test.ts (35 tests) 4ms
✓ tests/content-parser.test.ts (12 tests) 89ms

Test Files  6 passed (6)
     Tests  80 passed (80)
  Duration  1.39s
```

```pwsh
npm run build
```
构建成功：80 modules, 844ms
- tsc: 无类型错误
- vite build: 80 个模块，844ms
- Popup bundle: 9.28KB (gzip 3.78KB)
- Options bundle: 5.36KB (gzip 1.98KB)
- Content Script bundle: 47.61KB (gzip 16.21KB)
- Background bundle: 3.26KB (gzip 1.53KB)
- dist/icons/ 含 6 个图标文件（16/32/48/128/512 PNG + SVG source）

```pwsh
npm run zip
```
**首次失败**：PowerShell 执行策略限制 `Import-Module Microsoft.PowerShell.Archive`。
**绕过方案**：使用 `[System.IO.Compression.ZipFile]::CreateFromDirectory()` .NET API 直接打包。
打包成功：clipmate-v0.1.zip (111KB)

### zip 内容验证
- ✅ 含 icons/icon-{16,32,48,128,512}.png 和 icon-source.svg
- ✅ 不含 src/ 源码文件（仅 src/options/index.html 和 src/popup/index.html 构建产物）
- ✅ 不含 tests/、docs/、node_modules/、.git/、.env

### 错误/失败

- **npm run zip 失败**：PowerShell 执行策略 (Restricted) 阻止加载 `Microsoft.PowerShell.Archive` 模块，`Compress-Archive` 不可用。临时使用 .NET `ZipFile` API 打包成功。如需长期修复，可将执行策略设为 `RemoteSigned` 或改写 zip 脚本使用 .NET API。

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

