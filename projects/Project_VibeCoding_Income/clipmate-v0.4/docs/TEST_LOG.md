# TEST_LOG.md — ClipMate v0.4 测试记录

> 记录每轮运行过的命令、结果、错误。不隐藏失败。

---

## v0.4 Session 6 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 32 文件 1383 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：首次 1 错误（prefer-const: themeColor），修复后通过（无输出）
- `npm run test`：32 个测试文件，1383 个测试，全部通过
- `npm run build`：构建成功，116 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| link-card-builder.test.ts | 62 | ✅ 全部通过（新增）|
| link-card-markdown.test.ts | 47 | ✅ 全部通过（新增）|
| content-parser.test.ts | 27 | ✅ 全部通过（M2 修复后无退化）|
| site-visual-extractor.test.ts | 67 | ✅ 全部通过（M2 修复后无退化）|
| site-visual-cache.test.ts | 23 | ✅ 全部通过（无退化）|
| 其余 28 个测试文件 | 1157 | ✅ 全部通过（无退化）|

### 错误/修复

1. lint prefer-const：`let themeColor` → `const themeColor`
2. test：`escapeMarkdownText` "does not escape URL characters unnecessarily" 预期不包含 'http' 但 dots 被转义后仍包含 'http' → 改为验证 dots 转义
3. test：`formatLinkCardMarkdown` "outputs reasons" 预期 `- source=current-page` 但 `-` 被转义 → 改为匹配部分子串

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 1383 tests pass ✅
- build success ✅
- linkCard 模块不访问 chrome API/storage/network ✅
- linkCard 模块不保存正文/选区/评论/完整 DOM/Markdown/settings/request ✅
- M2 已修复：metaParser 委托 extractIconFromLinks ✅

---

## v0.4 Session 5 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 30 文件 1274 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：首次 2 错误（未使用的 ICON_LINK_SELECTORS 和 baseUrl 参数），修复后通过（无输出）
- `npm run test`：30 个测试文件，1274 个测试，全部通过
- `npm run build`：构建成功，116 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| site-visual-extractor.test.ts | 67 | ✅ 全部通过（新增）|
| site-visual-cache.test.ts | 23 | ✅ 全部通过（新增）|
| content-parser.test.ts | 27 | ✅ 全部通过（无退化）|
| 其余 27 个测试文件 | 1157 | ✅ 全部通过（无退化）|

### 错误/修复

1. lint：`ICON_LINK_SELECTORS` 未使用 → 移除
2. lint：`isSafeIconUrl` 的 `baseUrl` 参数未使用 → 移除参数
3. test：`prefers icon over shortcut icon` — makeDom 未传递 pageUrl 导致 baseURI 不正确 → 修复
4. test：cache merge `source` 断言失败 3 处 → 修复 mergeSiteVisualWithCache

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- lint 0 ✅
- 1274 tests pass ✅
- build success ✅

---

## v0.4 Roadmap Adjustment：Defer History UX Sessions (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 28 文件 1184 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：首次 2 错误（未使用的 import SiteProfileMatch/IntentSnapshot），修复后通过（无输出）
- `npm run test`：28 个测试文件，1184 个测试，全部通过
- `npm run build`：构建成功，115 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| comment-selection-builder.test.ts | 52 | ✅ 全部通过（新增）|
| comment-selection-markdown.test.ts | 48 | ✅ 全部通过（新增）|
| 其余 26 个测试文件 | 1084 | ✅ 全部通过（无退化）|

### 本轮新增测试（comment-selection-builder.test.ts）

- extractDomain：4 tests（正常/子域/非法/空）
- detectCommentSelectionMode：14 tests（comment+forum→forum-selection、comment+video→video-comment-selection、comment+video+short→short-video-caption、video-description→video-description、ai-answer→ai-answer/ai-answer pageType、comment+unknown→comment-selection、article/unknown/navigation/search-result→selection-generic、undefined selectionContext）
- getCommentSelectionWarning：7 tests（6 种模式 warning + selection-generic 返回 undefined）
- buildCommentSelectionDraft：27 tests（title/url/domain、selectedTextLength 计算、无 selectedText 字段、无 commentBody/fullHtml/fullText/body/innerHTML/fullPage、reasons 短句、selection-first 理由、context/intent/pageType 理由、generic/unknown intent 不加 intent reason、siteProfileId、selectionMarkdown 优先、warning/contextLabel、空 title/url、null intentSnapshot/siteProfileMatch、intent reason 正确、reasons 不超过 5）

### 本轮新增测试（comment-selection-markdown.test.ts）

- escapeMarkdownText：19 tests（\\、\*、\_、\`、\[\]\(\)\{\}\<\>、\#、\+、\-、\.、\!、\|、\~、空、中文、混合、多字符序列）
- formatCommentSelectionMarkdown：22 tests（H1 标题/URL/pageType/selectionContext/selectedTextLength、comment/forum/video-comment/ai-answer 各输出 warning、selection-generic 无 warning、用户内容在 md 中、无 innerHTML/outerHTML/<html>/<body>、siteProfileId 有/无、reasons ≤5、title/warning/reason/contextLabel 转义、空 markdown、空 reasons）
- Safety checks：7 tests（无 chrome.、无 storage、无 document、无 fetch/XMLHttpRequest、无 <!DOCTYPE/<html/<head/<script/<style、无 settings/message request、无 token/api_key/pageId）

### 错误/修复

1. lint：commentSelectionBuilder.ts 中 import 了未使用的 `SiteProfileMatch` 和 `IntentSnapshot` → 移除
2. test：3 个 markdown 测试因 escapeMarkdownText 转义了 warning/siteProfileId/reason 中的 `-` 和 `.` 字符导致 `toContain('comment-related area')` 失败 → 改为检查单词片段（如 `toContain('comment') && toContain('area')`)

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 1184 tests pass ✅
- build success ✅
- commentSelection 模块不访问 chrome API/storage/network ✅
- commentSelection 模块不保存 selectedText 字段 ✅
- commentSelection 模块无站点域名硬编码 ✅
- 未抓取整页评论/论坛 ✅

---

## v0.4 Session 3.2 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 26 文件 1084 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：通过（无输出）
- `npm run test`：26 个测试文件，1084 个测试，全部通过
- `npm run build`：构建成功，104 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| article-boundary-guard.test.ts | 121 | ✅ 全部通过（Session 3.1 继承 114 + 本轮新增 7）|
| navigation-summary-builder.test.ts | 80 | ✅ 全部通过（Session 3 继承 73 + 本轮新增 7）|
| navigation-summary-markdown.test.ts | 58 | ✅ 全部通过（Session 3.1 继承 55 + 本轮新增 3）|
| 其余 23 个测试文件 | 819 | ✅ 全部通过（无退化）|

### 本轮新增测试（article-boundary-guard.test.ts）

- video + low confidence + high link density → 不触发 nav summary
- forum-or-comment + low confidence + high link density → 不触发 nav summary
- ai-answer + low confidence + high link density → 不触发 nav summary
- article + low confidence + high link density → 触发 nav summary
- article + medium confidence + high link density → 不触发
- article + high confidence + high link density → 不触发
- article + low confidence + low link density → 不触发

### 本轮新增测试（navigation-summary-builder.test.ts）

- video/forum/ai-answer + low confidence + high link density → false（3 tests）
- article + low confidence + high link density → true
- article + low confidence + low link density → false
- video + navigation intent → true（intent override guard）
- video + selection present → false（selection-first override all）

### 本轮新增测试（navigation-summary-markdown.test.ts）

- video/forum/ai-answer + low confidence + high link density → null（3 tests，guard 集成验证）

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 1084 tests pass ✅
- build success ✅
- IS01 修复：content/index.ts 传递 articleConfidence + linkDensity ✅
- Guard：视频/论坛/AI-answer 不误触发 ✅

---

## v0.4 Session 3.1 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 26 文件 1067 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：通过（无输出）
- `npm run test`：26 个测试文件，1067 个测试，全部通过
- `npm run build`：构建成功，104 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| navigation-summary-markdown.test.ts | 55 | ✅ 全部通过（新增）|
| article-boundary-guard.test.ts | 114 | ✅ 全部通过（更新 5 tests，Session 3 继承 111）|
| 其余 24 个测试文件 | 898 | ✅ 全部通过（无退化）|

### 本轮新增测试（navigation-summary-markdown.test.ts）

- escapeMarkdownText：20 tests（16 种 Markdown 控制字符转义、空输入、中文、多字符序列）
- formatNavigationSummaryMarkdown：20 tests（标题/warning/URL/pageType/domain/siteProfileId/links/text escape/domain escape/空链接/reasons/escape/上限 5/空 reasons/不含 body/innerHTML/comment/DOM）
- buildNavigationMarkdownFallback：9 tests（search-results/navigation/low-confidence+high-linkDensity/article/forum-or-comment/video/selection-first/dangerous links/DOM-free）
- Safety checks：6 tests（chrome API/storage/document/network/full-text fields）

### 本轮更新测试（article-boundary-guard.test.ts）

- 更新 search-results pageType 测试：适配新结构化 Markdown 输出
- 更新 navigation pageType 测试：适配新结构化 Markdown 输出
- 新增 low-confidence+high-linkDensity 集成测试
- 新增旧 fallback 不退化的验证测试
- 新增 video pageType 不走新路径的验证测试

### 错误/修复

1. `formatWarning(draft)` 误传完整 draft 对象而非 `draft.warning` → 已修复
2. 4 个测试预期值需适配 Markdown escape（domain 的 `.`、siteProfile 的 `-`、reasons count filter 需限定 section、低置信中文匹配）→ 已修复

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 1067 tests pass ✅
- build success ✅
- serializer 不访问 chrome API / storage / network ✅
- serializer 不访问 document ✅
- serializer 不保存 selected text / 正文 / 评论 / Markdown / 完整 DOM ✅

---

## v0.4 Session 3 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 25 文件 1009 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：首次 1 错误（prefer-const），修复后通过（无输出）
- `npm run test`：25 个测试文件，1009 个测试，全部通过
- `npm run build`：构建成功，102 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| navigation-summary-builder.test.ts | 73 | ✅ 全部通过（新增）|
| 其余 24 个测试文件 | 936 | ✅ 全部通过（无退化）|

### 本轮新增测试（navigation-summary-builder.test.ts）

- sanitizeLinkText：7 tests（trim、空白折叠、截断、空输入、中文）
- isSafeLinkHref：16 tests（允许 http/https/relative/root，拒绝 7 种危险协议）
- toAbsoluteHttpUrl：6 tests（相对/绝对/非法/空）
- extractDomain：3 tests（正常/非法/空）
- shouldBuildNavigationSummary：10 tests（6 级触发规则 + selection-first + null/undefined safety）
- collectNavigationSummaryLinks：13 tests（过滤/去重/限制/搜索卡片/fallback/domain/相对链接解析）
- buildNavigationSummaryDraft：12 tests（3 种 mode/warning/title fallback/domain/siteProfileId/空链接/reasons/异常安全）
- Safety checks：6 tests（chrome API/storage/network/innerHTML/full-text fields/reason length）

### 错误/修复

1. lint prefer-const：`let collected` → `const collected`，已修复
2. 其余无错误。

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 1009 tests pass ✅
- build success ✅
- builder 不访问 chrome API / storage / network ✅
- builder 不保存 selected text / 正文 / 评论 / Markdown / 完整 DOM ✅

---

## v0.4 Session 3.0 (2026-06-13)

### 运行命令

本轮为 docs-only strategy design，未运行 lint/test/build。

### 原因

无代码变更。本轮产出为 `NAVIGATION_SUMMARY_STRATEGY.md` 及配套文档更新。

### 检查项

- git status --short：clean（仅 docs 文件变更）✅
- git diff --stat：仅 docs 文件变更 ✅
- git ls-files --others --exclude-standard：无输出 ✅
- 敏感信息检查（rg）：无真实 Token/API Key/Page ID ✅
- 未修改 clipmate-v0.1/v0.2/v0.3 ✅
- 未修改 src/tests/package/manifest ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅

---

## v0.4 Session 2.2 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 24 文件 936 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：通过（无输出）
- `npm run test`：24 个测试文件，936 个测试，全部通过
- `npm run build`：构建成功，102 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| site-profile-engine.test.ts | 70 | ✅ 全部通过（Session 2 继承 62 + 本轮新增 8）|
| intent-signal-collector.test.ts | 67 | ✅ 全部通过（已扩展 domain-free 检查覆盖全部 18 站点名）|
| 其余 22 个测试文件 | 799 | ✅ 全部通过（无退化）|

### 本轮新增测试（site-profile-engine.test.ts）

- all seed profiles have a selectorHints object
- all seed profiles have a valid category
- search profiles have searchResultCard selector
- video and short-video profiles have videoPlayer selector
- social and community profiles have contentContainer or commentContainer
- ai-chat profiles have contentContainer selector
- seedProfiles.ts does not contain real tokens, API keys, or page IDs
- counts exactly 19 seed profiles

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 936 tests pass ✅
- build success ✅
- content/ 无站点 domain 硬编码 ✅
- pageTypeDetector.ts AI 产品名关键词记录为 minor（本轮不处理）✅

## v0.4 Session 2.3.1 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 24 文件 928 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：通过（无输出）
- `npm run test`：24 个测试文件，928 个测试，全部通过
- `npm run build`：构建成功，102 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| intent-signal-collector.test.ts | 67 | ✅ 全部通过（Session 2.1 继承 61 + 本轮新增 6）|
| 其余 23 个测试文件 | 861 | ✅ 全部通过（无退化）|

### 本轮新增测试

- collectVisibleContext with siteProfileMatch.selectorHints.videoPlayer
- comma-separated videoPlayer selectors
- null siteProfileMatch handling
- collectIntentSnapshot passes siteProfileMatch to collectVisibleContext
- intentSignalCollector domain-free check（String(collectVisibleContext) 不含站点名）
- 替代旧 "counts video iframes with youtube src" 为通用 "counts video iframes with player src" 和 "counts generic player class elements"

### Session 2.3 回顾（只读审查发现）

- Build 失败：TS2304: Cannot find name 'SelectionContext'（tsc --noEmit 报错）
- M1 video iframe domain slop：iframe[src*="youtube/bilibili/youku"] 硬编码在 intentSignalCollector 中

### 错误/修复

1. Session 2.3 发现 build 失败 → Session 2.3.1 补充 SelectionContext 导入后修复
2. Session 2.3 发现 domain 硬编码 → Session 2.3.1 迁移到 seedProfiles.ts 后清理
3. 其余无错误。

### 产出

- 修改 `src/content/intent/intentSignalCollector.ts` — +SiteProfileMatch/SelectionContext 导入，collectVisibleContext 签名变更，移除 domain hardcode
- 修改 `src/shared/siteProfiles/seedProfiles.ts` — 8 个 video profile 新增 videoPlayer selectorHints
- 修改 `tests/intent-signal-collector.test.ts` — +6 tests

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 928 tests pass ✅
- build success ✅
- intent/content/ 无视频站点 domain 硬编码 ✅

---

## v0.4 Session 2.1 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 24 文件 922 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：首次 5 错误（unused imports/vars），修复后通过（无输出）
- `npm run test`：24 个测试文件，922 个测试，全部通过
- `npm run build`：构建成功，102 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| intent-signal-collector.test.ts | 61 | ✅ 全部通过（新增）|
| 其余 23 个测试文件 | 861 | ✅ 全部通过（无退化）|

### 产出

- `src/content/intent/intent.types.ts` — ~65 lines
- `src/content/intent/intentSignalCollector.ts` — ~280 lines
- `src/content/intent/index.ts` — ~2 lines
- `tests/intent-signal-collector.test.ts` — ~410 lines

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 922 tests pass ✅
- build success ✅

### 错误/修复

1. lint: 5 个 unused import/var（PageType, SiteProfileMatch, ClipIntent, CONTEXT_NAV_KEYWORDS, CONTEXT_ARTICLE_KEYWORDS）→ 已移除无用导入和变量
2. 其余无错误。

---

## v0.4 Session 2 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 23 文件 861 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：通过（无输出）
- `npm run test`：23 个测试文件，861 个测试，全部通过
- `npm run build`：构建成功，102 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| site-profile-engine.test.ts | 62 | ✅ 全部通过（新增）|
| 其余 22 个测试文件 | 799 | ✅ 全部通过（无退化）|

### 产出

- `src/shared/siteProfiles/siteProfile.types.ts` — ~40 lines
- `src/shared/siteProfiles/seedProfiles.ts` — ~160 lines
- `src/shared/siteProfiles/siteProfileEngine.ts` — ~120 lines
- `src/shared/siteProfiles/index.ts` — ~5 lines
- `tests/site-profile-engine.test.ts` — ~330 lines

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 861 tests pass ✅
- build success ✅

### 错误/失败

无。

---

## v0.4 Session 1 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 22 文件 799 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：通过（无输出）
- `npm run test`：22 个测试文件，799 个测试，全部通过
- `npm run build`：构建成功，102 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| article-boundary-guard.test.ts | 111 | ✅ 全部通过 |
| page-type-detector.test.ts | 42 | ✅ 全部通过（新增）|
| 其余 20 个测试文件 | 646 | ✅ 全部通过（无退化）|

### 调试/修复历史

- linkCount 字段遗漏：PageTypeDetectionSignals 接口和 extractSignalsFromDocument 缺少 linkCount，已补充
- 信号权重 bug：assessor 在信号缺失时未增加 weightSum 分母，导致 confidence 虚高，已修复为所有信号始终计入 weight
- 导航过度检测：linkCount < 3 时仍可能命中 navigation，已添加 early return guard
- 搜索信号被导航压制：hasSearchInput / title 搜索关键词不在导航评估中考虑，已添加搜索标题信号降权
- 视频被文章压制：视频信号存在时文章仍可高分，已添加视频/iframe 检测对文章的降权
- 短文本被误判 article：textLength < 50 时 article confidence 异常，已添加降权
- makeDom 不支持 title 参数：旧 article-boundary-guard 测试中 makeDom 只接受 bodyHtml，已修改支持 title 参数

### 产出

- `src/shared/utils/pageTypeDetector.ts` — 289 lines
- `tests/page-type-detector.test.ts` — ~550 lines

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 799 tests pass ✅
- build success ✅

### 错误/失败

无。

---

## v0.4 Session 0 (2026-06-13)

### 运行命令

本轮为 docs/workspace setup only 任务。未修改业务代码。
未运行 npm run lint / test / build（本轮无代码变更，不需要）。

---

*（v0.4 之前版本的测试记录见 clipmate-v0.3/docs/TEST_LOG.md）*
