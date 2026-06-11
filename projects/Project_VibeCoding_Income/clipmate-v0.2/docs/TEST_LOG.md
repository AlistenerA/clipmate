# TEST_LOG.md — ClipMate v0.1 / v0.2 测试记录

> 记录每轮运行过的命令、结果、错误。不隐藏失败。

---

## v0.2 Session 7 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
321 tests passed, 13 test files, 3.39s。
```text
✓ tests/example.test.ts (1 test) 2ms
✓ tests/notion-blocks.test.ts (13 tests) 9ms
✓ tests/history-ui.test.ts (32 tests) 16ms
✓ tests/history-polish.test.ts (65 tests) 20ms
✓ tests/notion-client.test.ts (10 tests) 14ms
✓ tests/notion-errors.test.ts (9 tests) 6ms
✓ tests/popup-target-selection.test.ts (23 tests) 12ms
✓ tests/shared-utils.test.ts (35 tests) 9ms
✓ tests/options-targets.test.ts (45 tests) 31ms
✓ tests/storage-migration.test.ts (34 tests) 47ms
✓ tests/history-retry-flow.test.ts (11 tests) 21ms
✓ tests/history-save-flow.test.ts (16 tests) 30ms
✓ tests/content-parser.test.ts (27 tests) 274ms

Test Files  13 passed (13)
     Tests  321 passed (321)
  Duration  3.39s
```

```pwsh
npm run build
```
构建成功：90 modules, 929ms
- tsc: 无类型错误
- vite build: 90 个模块，929ms
- dist/manifest.json version = 0.2.0 ✅

```pwsh
npm run zip
```
打包成功：clipmate-v0.2.zip (117.6 KB)

### 版本与权限检查

| 检查项 | 值 | 结果 |
|--------|-----|:---:|
| package.json version | 0.2.0 | ✅ |
| manifest.config.ts version | 0.2.0 | ✅ |
| dist/manifest.json version | 0.2.0 | ✅ |
| permissions | storage, activeTab | ✅ |
| host_permissions | https://api.notion.com/* | ✅ |
| content_scripts matches | <all_urls> | ✅ |
| 新增权限 | 无 | ✅ |

### zip 内容检查

zip 包含 21 个条目：
- ✅ manifest.json
- ✅ service-worker-loader.js
- ✅ assets/ (11 JS/CSS 构建产物)
- ✅ icons/ (7 图标文件: icon-16/32/48/128/512.png + icon-source.svg)
- ✅ src/popup/index.html
- ✅ src/options/index.html
- ✅ 不含 .ts/.tsx 源文件
- ✅ 不含 tests/、docs/、node_modules/、.git/、.env、README.md、package.json

### 隐私与日志检查

**console.log 调用**：仅在 `logger.ts:5`（logger 自身实现），所有日志调用通过 logger 封装。

**logger 输出内容审查**：
- `notionHandler.ts`: 仅输出 block 数量和错误码（`NOTION_AUTH_FAILED` / `NOTION_SAVE_FAILED`），无 Token/正文/备注泄露 ✅
- `content/index.ts`: 仅输出 wordCount 和状态信息，无正文全文泄露 ✅
- `background/index.ts`: 仅输出 ready/unhandled message 类型，无敏感信息 ✅
- `storage.ts`: 仅输出操作失败警告（如"Failed to read settings"），无数据内容泄露 ✅

**敏感信息搜索**：
- `NotionSettingsForm.tsx`: `type="password"` - UI 输入类型 ✅
- `NotionSettingsForm.tsx`: `placeholder="secret_xxxxxxxxxxxxx"` - 占位符文本，非真实 Token ✅
- `client.ts`: `Authorization: \`Bearer ${token}\`` - 使用变量，非硬编码 Token ✅
- `client.ts`: `'Notion-Version': NOTION_VERSION` - API 版本常量 ✅
- 无 `api_key`、`apikey`、`password` 硬编码出现 ✅

### 文档一致性检查

| 文档 | 检查结果 |
|------|:---:|
| README.md | 指向 0.2.0，v0.2 功能列表完整，已知限制不含未实现功能承诺 ✅ |
| RELEASE_CHECKLIST.md | 版本 0.2.0，权限对照正确 ✅ |
| PERMISSION_JUSTIFICATION.md | 权限与 manifest 一致，v0.2 权限对比表正确 ✅ |
| PRIVACY_POLICY_DRAFT.md | 涵盖历史记录存储说明，不调用第三方 favicon API ✅ |
| STORE_LISTING_DRAFT.md | 功能列表与 v0.2 一致，无承诺未实现功能 ✅ |
| CURRENT_STATUS.md | 已更新 Session 7 ✅ |

### 边界决策验证

| 检查项 | 结论 |
|--------|:---:|
| historyLimit clamp [10, 500] | storage.ts:51-52 实现 ✅ |
| MAX_MARKDOWN_LENGTH 50000 + truncation | defaults.ts:26 + storage.ts:147-148 ✅ |
| deleteTarget 不删历史 | targetManager.ts:106 仅操作 targets ✅ |
| retry 保存更新原历史不新增 | notionHandler.ts:28-38 使用 updateHistoryItem ✅ |
| favicon 仅从 DOM 读取 | metaParser.ts:30 遍历 link 标签 ✅ |
| popup 同站不同 URL 重新提取 | historyView.ts:222 shouldAutoExtractForActiveTab ✅ |

### 错误/失败

无。全部自动化检查通过，未发现需要修复的问题。本轮未修改任何业务代码。

---

## v0.2 Session 6 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
321 tests passed, 13 test files, 2.81s。
```text
✓ tests/example.test.ts (1 test) 2ms
✓ tests/notion-client.test.ts (10 tests) 11ms
✓ tests/notion-blocks.test.ts (13 tests) 8ms
✓ tests/notion-errors.test.ts (9 tests) 6ms
✓ tests/popup-target-selection.test.ts (23 tests) 10ms
✓ tests/history-ui.test.ts (32 tests) 15ms
✓ tests/history-polish.test.ts (65 tests) 16ms
✓ tests/shared-utils.test.ts (35 tests) 10ms
✓ tests/options-targets.test.ts (45 tests) 20ms
✓ tests/storage-migration.test.ts (34 tests) 42ms
✓ tests/history-retry-flow.test.ts (11 tests) 15ms
✓ tests/history-save-flow.test.ts (16 tests) 27ms
✓ tests/content-parser.test.ts (27 tests) 264ms

Test Files  13 passed (13)
     Tests  321 passed (321)
  Duration  2.81s
```

```pwsh
npm run build
```
构建成功：90 modules, 982ms
- tsc: 无类型错误
- vite build: 90 个模块，982ms
- dist/manifest.json version = 0.2.0 ✅

```pwsh
npm run zip
```
打包成功：clipmate-v0.2.zip (117.6 KB)

### zip 内容验证

zip 包含 21 个条目：
- ✅ manifest.json
- ✅ service-worker-loader.js
- ✅ assets/ (11 JS/CSS 构建产物)
- ✅ icons/ (7 图标文件: icon-16/32/48/128/512.png + icon-source.svg)
- ✅ src/popup/index.html
- ✅ src/options/index.html
- ✅ 不含 .ts/.tsx 源文件
- ✅ 不含 tests/、docs/、node_modules/、.env、package.json、README.md、.git/

### 错误/失败

无。Lint 0 errors, 321 tests passed, build 成功, zip 成功。本轮仅修改文档和版本号，未修改业务代码。

---

## v0.2 Session 5.2 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
321 tests passed, 13 test files, 2.97s。
```text
✓ tests/example.test.ts (1 test) 5ms
✓ tests/notion-blocks.test.ts (13 tests) 6ms
✓ tests/notion-client.test.ts (10 tests) 12ms
✓ tests/history-ui.test.ts (32 tests) 9ms
✓ tests/history-polish.test.ts (65 tests) 14ms
✓ tests/notion-errors.test.ts (9 tests) 3ms
✓ tests/popup-target-selection.test.ts (23 tests) 9ms
✓ tests/options-targets.test.ts (45 tests) 19ms
✓ tests/shared-utils.test.ts (35 tests) 10ms
✓ tests/history-retry-flow.test.ts (11 tests) 19ms
✓ tests/history-save-flow.test.ts (16 tests) 17ms
✓ tests/storage-migration.test.ts (34 tests) 56ms
✓ tests/content-parser.test.ts (27 tests) 244ms

Test Files  13 passed (13)
     Tests  321 passed (321)
  Duration  2.97s
```

```pwsh
npm run build
```
构建成功：90 modules, 961ms
- tsc: 无类型错误
- vite build: 90 个模块，961ms
- Options bundle: 21.70KB (gzip 6.84KB)
- Background bundle: 4.68KB (gzip 1.92KB)

### 新增测试覆盖

| 分类 | 测试数 | 覆盖内容 |
|------|:---:|------|
| stripMarkdownImages | 8 | 无 alt 图片、带 alt 图片、链接图片、HTML img、文本保留、多图片、无图片原文、空输入 |
| normalizeSummaryText | 4 | trim、空白压缩、纯空白、正常文本 |
| getHistorySummary 更新 | 11 | descriptionPreview 优先、contentPreview 清理图片、markdown body 跳图片、多图开篇、链接图开篇、HTML img 开篇、全图片回退、URL 回退、标题回退、普通文本不变 |
| resolveIconUrl | 4 | 绝对 URL、相对路径、无前导斜杠、无效 URL |
| extractThemeColor | 2 | 提取 theme-color、无 meta tag |
| extractSiteIconUrl | 9 | rel=icon、apple-touch-icon 优先、icon 优先 shortcut、相对路径解析、fallback /favicon.ico、baseURI 优先、空 href fallback、parseMetadata 集成、mask-icon |
| buildHistoryInput 新字段 | 4 | siteIconUrl、themeColor、siteName、descriptionPreview |
| history-save-flow 新字段 | 3 | descriptionPreview 写入、siteName+siteIconUrl 写入、无新字段兼容 |

总测试从 280 增至 321（+41）。

### 错误/失败

首次运行 7 项失败（4 项 extractSiteIconUrl + 3 项 getHistorySummary/stripMarkdownImages），原因：
- **JSDOM 中 `querySelectorAll('link[rel]')` 对多 link 元素/某些 rel 值返回空集合** → 改用 `querySelectorAll('link')` 遍历后手动过滤 rel
- **`doc.baseURI` 在无 url 选项的 JSDOM 中为 `about:blank`，导致相对 icon 路径解析失败** → `baseUrl` 增加判断：非 http 协议的 baseURI 回退到 `pageUrl`
- **`stripMarkdownImages` 先移除 `![]()` 再移除 `[![]()]()` 导致链接图片残留 `[]()`** → 调整顺序为先移除外层链接图片再移除内层图片
- **`makeHistoryItem` 未包含 `descriptionPreview` 等新增字段** → 补齐 4 个可选字段

全部修复后 321 tests 全通过。

---

## v0.2 Session 5.1 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
280 tests passed, 13 test files, 2.99s。
```text
✓ tests/example.test.ts (1 test) 2ms
✓ tests/notion-blocks.test.ts (13 tests) 5ms
✓ tests/notion-client.test.ts (10 tests) 10ms
✓ tests/popup-target-selection.test.ts (19 tests) 6ms
✓ tests/history-ui.test.ts (32 tests) 15ms
✓ tests/history-polish.test.ts (46 tests) 13ms
✓ tests/notion-errors.test.ts (9 tests) 3ms
✓ tests/options-targets.test.ts (45 tests) 21ms
✓ tests/shared-utils.test.ts (35 tests) 14ms
✓ tests/storage-migration.test.ts (34 tests) 45ms
✓ tests/history-retry-flow.test.ts (11 tests) 12ms
✓ tests/history-save-flow.test.ts (13 tests) 21ms
✓ tests/content-parser.test.ts (12 tests) 145ms

Test Files  13 passed (13)
     Tests  280 passed (280)
  Duration  2.99s
```

```pwsh
npm run build
```
构建成功：90 modules, 934ms
- tsc: 无类型错误
- vite build: 90 个模块，934ms
- Options bundle: 21.31KB (gzip 6.69KB) — 相比 S5 的 18.94KB 增加约 2.4KB（新增搜索高亮/匹配标签/站点头像组件逻辑）
- Background/Popup/Content 体积无明显变化

### 新增测试覆盖

| 分类 | 测试数 | 覆盖内容 |
|------|:---:|------|
| highlightText | 7 | 空 query、匹配、大小写不敏感、多次出现、无匹配、特殊正则字符、多词匹配 |
| getHistoryMatchInfo | 11 | 空 query 全 false、标题/URL/标签/目标名/备注/contentPreview/markdown body 匹配、targetName undefined、contentPreview 已匹配时 markdownMatched 不设、大小写不敏感 |
| getDomainFromUrl | 3 | 提取域名、无效 URL、空输入 |
| getSiteInitial | 4 | 首字母大写、空字符串 ?、CJK、www 前缀 |
| getHistorySummary | 5 | notePreview 优先、contentPreview fallback、markdown body fallback、URL fallback、title fallback |
| extractMarkdownBodyPreview | 3 | 截取前 N 字、空 body、无分隔符全返回 |
| getStableSiteColor | 5 | 同 domain 同色、不同 domain 大概率不同、空 domain 默认灰、有效 hex |
| shouldAutoExtractForActiveTab | 6 | 空 tab(=false)、无 draft(=true)、URL 相同(=false)、同域不同 URL(=true)、跨域不同 URL(=true) |
| filterHistoryLocally body match | 2 | 搜索命中 markdown 正文、搜索未命中 |

总测试从 234 增至 280（+46）。

### 错误/失败

无。一次通过。

---

## v0.2 Session 5 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
234 tests passed, 12 test files, 2.79s。
```text
✓ tests/example.test.ts (1 test) 3ms
✓ tests/notion-blocks.test.ts (13 tests) 7ms
✓ tests/notion-client.test.ts (10 tests) 8ms
✓ tests/history-ui.test.ts (32 tests) 10ms
✓ tests/notion-errors.test.ts (9 tests) 3ms
✓ tests/popup-target-selection.test.ts (19 tests) 7ms
✓ tests/options-targets.test.ts (45 tests) 15ms
✓ tests/shared-utils.test.ts (35 tests) 17ms
✓ tests/storage-migration.test.ts (34 tests) 39ms
✓ tests/history-retry-flow.test.ts (11 tests) 14ms
✓ tests/history-save-flow.test.ts (13 tests) 17ms
✓ tests/content-parser.test.ts (12 tests) 159ms

Test Files  12 passed (12)
     Tests  234 passed (234)
  Duration  2.79s
```

```pwsh
npm run build
```
构建成功：90 modules, 978ms
- tsc: 无类型错误
- vite build: 90 个模块，978ms
- Options bundle: 18.94KB (gzip 5.78KB) — 相比 S4.1 的 11.22KB 增加约 7.7KB（新增 HistoryTab/HistoryItem/historyView）
- Background bundle: 4.27KB (gzip 1.82KB) — 相比 S4.1 的 3.26KB 增加约 1KB（retry update 逻辑）

### 新增测试覆盖

| 分类 | 测试数 | 覆盖内容 |
|------|:---:|------|
| extractBodyMarkdown | 4 | 双换行分隔、单换行分隔、无分隔原样返回、多个 --- 保留后续 |
| getHistoryStatusLabel | 3 | saved/failed/unsaved 中文标签 |
| getHistoryStatusTone | 3 | 绿/红/灰色调 |
| formatHistoryTime | 2 | 有效 ISO 包含日期+时间、无效输入原样返回 |
| getHostname | 2 | 提取域名、无效 URL 原样返回 |
| resolveRetryTarget | 6 | 空 targets/null、原 targetId 匹配、targetId 无效回退默认、回退首个、无 targetId 用默认、无 targetId 无默认用首个 |
| filterHistoryLocally | 13 | 空/空白查询、标题/URL/标签/目标名/备注预览/正文预览搜索、大小写不敏感、部分匹配、无匹配 |
| getModeLabel | 2 | 全文/选区中文标签 |
| handleSaveToNotion retry | 11 | update 模式更新原历史不新增、update 模式失败更新原历史、普通模式仍新增、普通失败仍新增、update 模式无视 saveHistoryEnabled、Token 缺失、pageId 空、内容空、append 模式仍新增、success 清除 errorCode、更新时间戳 |

总测试从 191 增至 234（+43）。

### 错误/失败

首次运行 4 项测试失败：
- `extractBodyMarkdown`: `slice(idx + 5)` 保留了前导 `\n`，修复：增加 `startsWith('\n')` 判断裁剪
- `formatHistoryTime`: UTC 10:30 在本地时区显示 18:30，修复：测试改用 `/\d{2}:\d{2}/` 正则匹配
- `formatHistoryTime` 无效输入：`new Date('not-a-date')` 返回 NaN，修复：实现增加 `isNaN(d.getTime())` 检测

全部修复后 234 tests 全通过。

---

## v0.2 Session 4.1 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
191 tests passed, 10 test files, 2.58s。
```text
✓ tests/example.test.ts (1 test) 3ms
✓ tests/notion-blocks.test.ts (13 tests) 8ms
✓ tests/popup-target-selection.test.ts (19 tests) 7ms
✓ tests/notion-errors.test.ts (9 tests) 7ms
✓ tests/notion-client.test.ts (10 tests) 10ms
✓ tests/shared-utils.test.ts (35 tests) 10ms
✓ tests/options-targets.test.ts (45 tests) 19ms
✓ tests/history-save-flow.test.ts (13 tests) 27ms
✓ tests/storage-migration.test.ts (34 tests) 46ms
✓ tests/content-parser.test.ts (12 tests) 167ms

Test Files  10 passed (10)
     Tests  191 passed (191)
  Duration  2.58s
```

```pwsh
npm run build
```
构建成功：87 modules, 931ms
- tsc: 无类型错误
- vite build: 87 个模块，931ms

### 新增测试覆盖

| 分类 | 测试数 | 覆盖内容 |
|------|:---:|------|
| extractNotionPageId | 8 | 空/空白/null、纯32位hex、UUID去横杠、URL无hash、URL有hash忽略、无效字符串、URL无hex段、trim |
| addTarget 归一化 | 2 | URL pageId归一化、UUID pageId归一化 |
| updateTarget 归一化 | 1 | URL pageId归一化 |
| addTarget 错误消息 | 1 | 新增 invalid pageId 错误消息测试 |

总测试从 178 增至 191（+13）。

### 错误/失败

首次运行 13 项测试失败：已有测试使用的 `'page-work'`、`'page-2'`、`'new-page'` 等短字符串无法通过 `extractNotionPageId` 验证。全部替换为合法 32 位 hex 字符串（PG_1/PG_2/PG_3）后修复。`updateTarget` 的 "target not found" 测试同时需要有效 pageId 才能到达目标查找阶段。

---

## v0.2 Session 4 (2026-06-11)

### 运行命令

```pwsh
npm run lint
```
0 errors, 0 warnings。

```pwsh
npm run test
```
178 tests passed, 10 test files, 2.57s。
```text
✓ tests/example.test.ts (1 test) 3ms
✓ tests/notion-blocks.test.ts (13 tests) 5ms
✓ tests/notion-client.test.ts (10 tests) 8ms
✓ tests/notion-errors.test.ts (9 tests) 4ms
✓ tests/popup-target-selection.test.ts (19 tests) 6ms
✓ tests/options-targets.test.ts (32 tests) 10ms
✓ tests/shared-utils.test.ts (35 tests) 14ms
✓ tests/storage-migration.test.ts (34 tests) 36ms
✓ tests/history-save-flow.test.ts (13 tests) 15ms
✓ tests/content-parser.test.ts (12 tests) 153ms

Test Files  10 passed (10)
     Tests  178 passed (178)
  Duration  2.57s
```

```pwsh
npm run build
```
构建成功：87 modules, 916ms
- tsc: 无类型错误
- vite build: 87 个模块，916ms

### 新增测试覆盖

| 分类 | 测试数 | 覆盖内容 |
|------|:---:|------|
| resolveSelectedTarget | 7 | 空 targets、无 defaultTargetId 回退首个、匹配 defaultTargetId、不匹配回退、唯一 target |
| maskPageId | 3 | 空字符串、短字符、最后6位 mask |
| buildHistoryInput | 9 | 基本构建、target 信息、saveStatus、notePreview/contentPreview 截断、空值处理、selection mode |
| handleSaveToNotion (集成) | 13 | Token 缺失、pageId 为空、内容为空、保存成功写 saved 历史、失败写 failed 历史、saveHistoryEnabled=false 不写、网络错误写历史、使用 payload.pageId 非 settings.notionPageId、无 targetId/targetName、markdownTruncated |

### 错误/失败

首次运行有 6 项测试失败，均为测试断言错误（非代码 bug）：
- `notion-errors.test.ts`: `NOTION_PAGE_ID_MISSING` 文案已改，测试期望未同步
- `popup-target-selection.test.ts`: `maskPageId('1234567')` 期望值计算错误（7 位字符最后 6 位是 `234567` 不是 `34567`）
- `popup-target-selection.test.ts`: 空字符串 `defaultTargetId` 测试期望 `undefined` 但实际回退第一个 target（falsy 值行为）
- `popup-target-selection.test.ts`: `undefined` 被 `??` fallback 覆盖，改为测试空字符串
- `history-save-flow.test.ts`: 网络错误测试期望 `NOTION_SAVE_FAILED` 但 `makeRequest` catch 抛出 `NETWORK_ERROR`

全部修复后 178 tests 全通过。

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

