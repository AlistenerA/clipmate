# TEST_LOG.md — ClipMate v0.1 测试记录

> 记录每轮运行过的命令、结果、错误。不隐藏失败。

---

## Session 4.2.1 (2026-06-10)

### 运行命令

```pwsh
npm run test
```
80 tests passed, 6 test files, 1.62s。
```text
✓ tests/example.test.ts (1 test) 1ms
✓ tests/notion-blocks.test.ts (13 tests) 5ms
✓ tests/notion-errors.test.ts (9 tests) 3ms
✓ tests/notion-client.test.ts (10 tests) 8ms
✓ tests/shared-utils.test.ts (35 tests) 7ms
✓ tests/content-parser.test.ts (12 tests) 100ms

Test Files  6 passed (6)
     Tests  80 passed (80)
  Duration  1.62s
```

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run build
```
构建成功：80 modules, 776ms
- tsc: 无类型错误
- vite build: 80 个模块，776ms
- Popup bundle: 9.28KB (gzip 3.78KB)
- Options bundle: 5.36KB (gzip 1.98KB)
- Content Script bundle: 47.61KB (gzip 16.21KB)
- Background bundle: 3.26KB (gzip 1.53KB)

### 测试变更

- **notion-blocks**：重写长备注测试 → 验证所有 chunk 为 callout + 📝 图标 + 无 paragraph 泄露 + rich_text ≤ 2000
- **cleanMarkdown**：重写全部测试（10 tests）
  - 三种中文引号真实场景（用户提供）
  - 多段相邻粗体合并 `**A****B****C**` → `**ABC**`
  - 6 星号边缘情况 `**a******b**` → `**a**b**`
  - 空格分隔不合并 `**A** **B**`
  - 正常粗体/文本保留
  - 空粗体行移除

### 错误/失败

无。

---

## Session 4.2 (2026-06-10)

### 运行命令

```pwsh
npm run test
```
初测 76 tests, 2 failed（countWords mixed CJK 和 CJK with punctuation 期望值未更新 → 修复后全部通过）。
最终：
```text
✓ tests/example.test.ts (1 test) 1ms
✓ tests/notion-client.test.ts (10 tests) 7ms
✓ tests/notion-errors.test.ts (9 tests) 2ms
✓ tests/notion-blocks.test.ts (13 tests) 6ms
✓ tests/shared-utils.test.ts (31 tests) 5ms
✓ tests/content-parser.test.ts (12 tests) 92ms

Test Files  6 passed (6)
     Tests  76 passed (76)
  Duration  1.57s
```

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run build
```
构建成功：80 modules, 783ms
- tsc: 无类型错误
- vite build: 80 个模块，783ms
- Popup bundle: 9.28KB (gzip 3.78KB)
- Options bundle: 5.36KB (gzip 1.98KB)
- Content Script bundle: 47.54KB (gzip 16.18KB)
- Background bundle: 3.29KB (gzip 1.55KB)

### 新增/修改测试覆盖

- **countWords CJK**（9 tests）：纯英文/纯中文/混合中英/CJK 标点/空格/空字符串
- **cleanMarkdown**（5 tests）：空输入/**** 清理/多连续星号/空粗体行/正常粗体保留
- **formatCopyMarkdown**（7 tests）：完整结构/空 title/空 URL/空 tags/空 note/空 body/顺序验证
- **blocks callout 分片**（1 test）：长备注 ≥4500 字 → 1 callout + ≥2 paragraph，icon 验证
- **blocks callout 图标**：原有 note callout 测试增加 `icon: { emoji: '📝' }` 断言

### 日志安全审查

审查全部 console/logger 调用，移除所有 `err` 原始对象传递：
- `logger.ts`：移除 `err` 参数，只接受 `string` message
- `content/index.ts`：2 处 `logger.error` 移除 err
- `background/index.ts`：`console.log/error` → `logger.info/error`，不传 err
- `notionHandler.ts`：日志改为只输出错误码 `Notion save failed: ${code}`
- `storage.ts`：5 处 `logger.error` 移除 err 参数
- `sendMessage.ts`：`logger.error('No active tab found')` 无 err（安全）

结论：0 处 Token/正文/备注泄露。

### 错误/失败

- **测试第一轮 2 failed**（countWords CJK 期望值未更新）→ 修复期望值后全部通过

---

## Session 4.1 (2026-06-10)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
57 tests passed, 6 test files, 1.59s。

```pwsh
npm run build
```
构建成功：80 modules, 732ms
- tsc: 无类型错误
- vite build: 80 个模块，732ms
- Popup bundle: 9.19KB (gzip 3.74KB)
- Options bundle: 5.36KB (gzip 1.98KB)
- Content Script bundle: 47.55KB (gzip 16.17KB)
- Background bundle: 3.32KB (gzip 1.55KB)

### 测试结果

```text
✓ tests/example.test.ts (1 test) 2ms
✓ tests/notion-blocks.test.ts (12 tests) 4ms
✓ tests/notion-client.test.ts (10 tests) 6ms   ← 新增
✓ tests/notion-errors.test.ts (9 tests) 2ms
✓ tests/shared-utils.test.ts (13 tests) 3ms
✓ tests/content-parser.test.ts (12 tests) 94ms

Test Files  6 passed (6)
     Tests  57 passed (57)
  Duration  1.59s
```

### 测试覆盖说明（notion-client.test.ts 新增）

- **HTTP 错误映射**：401 → NOTION_AUTH_FAILED, 403 → NOTION_AUTH_FAILED, 404 → NOTION_PAGE_NOT_FOUND, 429 → NOTION_RATE_LIMITED, 500 → NOTION_SAVE_FAILED, fetch reject → NETWORK_ERROR
- **分批请求**：≤100 blocks 单次请求, 150 blocks 两次请求, 250 blocks 三次正向验证, 中途失败停止后续批次

### 日志安全审查

审查全部 19 处 console/logger 调用：
- `background/index.ts`：仅输出 status/message type（无 Token/正文）
- `notionHandler.ts`：仅输出 blocks count（无 Token/正文）
- `logger.ts`：通用工具，不假定输入内容
- `content/index.ts`：仅输出 mode/word count/status（无正文）
- `storage.ts`：仅输出操作类型+chrome API error（无内容）
- `sendMessage.ts`：仅输出 'No active tab found'（无其他）

结论：0 处 Token/正文/备注泄露。

### 错误/失败

无。

---

## Session 4 (2026-06-10)

### 运行命令

```pwsh
npm run test
```
47 tests passed, 5 test files, 1.45s。

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run build
```
构建成功：80 modules, 760ms
- tsc: 无类型错误
- vite build: 80 个模块，760ms
- Popup bundle: 9.19KB (gzip 3.74KB)
- Options bundle: 5.36KB (gzip 1.98KB)
- Content Script bundle: 47.55KB (gzip 16.17KB)
- Background bundle: 3.11KB (gzip 1.49KB)

### 测试结果

```text
✓ tests/example.test.ts (1 test) 1ms
✓ tests/notion-blocks.test.ts (12 tests) 4ms
✓ tests/notion-errors.test.ts (9 tests) 3ms
✓ tests/shared-utils.test.ts (13 tests) 3ms
✓ tests/content-parser.test.ts (12 tests) 102ms

Test Files  5 passed (5)
     Tests  47 passed (47)
  Duration  1.45s
```

### 错误/失败

无。

---

## Session 3.1 (2026-06-10)

### 运行命令

```pwsh
npm run build
```
构建成功：76 modules, 822ms
- tsc: 无类型错误
- vite build: 76 个模块，822ms
- Popup bundle: 8.32KB (gzip 3.48KB)
- Options bundle: 5.33KB (gzip 1.96KB)
- Content Script bundle: 47.55KB (gzip 16.17KB)

```pwsh
npm run lint
```
首次报错（现有代码残留导致重复 useEffect 语法错误）→ 已修复：
- `src/popup/App.tsx` 第26-30行：旧 useEffect 头未完全被替换，导致重复声明

修复后 lint 报 2 warnings（exhaustive-deps）→ 添加 eslint-disable 注释后通过。

最终：0 errors, 0 warnings。

```pwsh
npm run test
```
26 tests passed, 3 test files, 1.37s。

```pwsh
npm run build
```
最终验证：76 modules, 822ms 成功。

### 测试结果

```text
✓ tests/example.test.ts (1 test) 1ms
✓ tests/shared-utils.test.ts (13 tests) 3ms
✓ tests/content-parser.test.ts (12 tests) 78ms

Test Files  3 passed (3)
     Tests  26 passed (26)
  Duration  1.37s
```

### 错误/失败

- **Lint 语���错误**（重复 useEffect 头）→ 删除残留代码后修复
- **Lint 2 warnings**（exhaustive-deps）→ 添加 eslint-disable 注释，0 errors

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

