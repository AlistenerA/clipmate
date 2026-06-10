# TEST_LOG.md — ClipMate v0.1 测试记录

> 记录每轮运行过的命令、结果、错误。不隐藏失败。

---

## Session 3 (2026-06-10)

### 运行命令

```pwsh
npm run build
```
构建成功：76 modules, 729ms
- tsc: 无类型错误
- vite build: 76 个模块，729ms
- Popup bundle: 8.02KB (gzip 3.40KB)
- Options bundle: 5.33KB (gzip 1.96KB)
- Content Script bundle: 47.55KB (gzip 16.17KB)

```pwsh
npm run lint
```
首次报错（3 个未使用变量）→ 已修复：
- `resetDraft` in App.tsx → 从解构中移除
- `notionConfigured` in ActionButtons.tsx → 从 Props 中移除
- `error` in StatusBar.tsx → 从 Props 中移除

修复后：0 errors, 0 warnings。

```pwsh
npm run test
```
14 tests passed, 2 test files, 1.26s。

```pwsh
npm run build
```
最终验证：76 modules, 729ms 成功。

### 测试结果

```text
✓ tests/example.test.ts (1 test) 1ms
✓ tests/shared-utils.test.ts (13 tests) 3ms

Test Files  2 passed (2)
     Tests  14 passed (14)
  Duration  1.26s
```

### 错误/失败

- **Lint 第一轮失败**（3 个 unused vars）→ 全部修复，第二轮通过

---

## Session 2 (2026-06-10)

### 运行命令

```pwsh
npm install @mozilla/readability turndown
```
成功安装 @mozilla/readability, turndown（+3 packages, 339 total）。

```pwsh
npm install --save-dev @types/turndown
```
成功安装 turndown 类型定义（340 packages total）。

```pwsh
npm install --save-dev jsdom
```
成功安装 jsdom（+37 packages, 377 total）。

```pwsh
npm run build
```

首次构建报错（预期内）：
- `TS2345`: SelectionResult 类型不匹配 → 已修复（映射 html→content, text→textContent）
- `TS7016`: turndown 缺少声明文件 → 已安装 @types/turndown
- `TS2322`: `'strike'` 不在 HTMLElementTagNameMap → 已修复（移除 strike，保留 del/s）

修复后构建成功：
- tsc: 无类型错误
- vite build: 57 个模块，716ms
- Content Script bundle: 47.73KB (gzip 16.24KB)

```pwsh
npm run test
```
首次报错：缺少 jsdom 依赖 → 已修复。

修复后测试通过：
- `tests/example.test.ts` — 1 test passed
- `tests/shared-utils.test.ts` — 13 tests passed
- 总计：14 tests passed, 2 test files

```pwsh
npm run lint
```
首次报错：`sendMessage.ts` 中 `logger` 已导入但未使用 → 已修复（在 `sendToActiveTab` 中添加错误日志）。
修复后：0 errors, 0 warnings。

```pwsh
npm run build
```
最终验证：57 modules, 719ms 成功。

### 测试结果

```text
✓ tests/example.test.ts (1 test) 1ms
✓ tests/shared-utils.test.ts (13 tests) 2ms

Test Files  2 passed (2)
     Tests  14 passed (14)
  Duration  4.32s
```

### 错误/失败

- **构建第一轮失败**（3 个 TS 错误）→ 全部修复，第二轮通过
- **测试第一轮失败**（缺少 jsdom）→ 安装后通过
- **Lint 第一轮失败**（logger 未使用）→ 修复后通过

---

## Session 1 (2026-06-10)

### 运行命令

```pwsh
npm install
```
成功安装 335 个包，4 个安全漏洞（来自 eslint@8.57.1，仅开发依赖，不影响运行时）。

```pwsh
npm run build
```
执行 `tsc --noEmit && vite build`，两者均成功。
- tsc: 无类型错误
- vite build: 38 个模块转换，生成 dist/ 目录，661ms

### 测试结果

```pwsh
npm run test
```
未执行（仅占位测试，无实际业务逻辑）。

### 错误/失败

无。

---

## Session 0 (2026-06-10)

### 运行命令

```
New-Item -ItemType Directory -Path "clipmate-v0.1\docs" -Force
```
执行成功，创建了 `clipmate-v0.1/docs/` 目录。

### 未执行的命令

- `npm install` — 未执行（Session 0 不安装依赖）
- `npm run build` — 未执行（无源码）
- `npm run test` — 未执行（无测试）
- `npm run lint` — 未执行（无源码）
- `npm run dev` — 未执行（无源码）

### 测试结果

不适用（本轮仅文档，无代码可测）。

### 错误/失败

无。

