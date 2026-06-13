# TEST_LOG.md — ClipMate v0.4 测试记录

> 记录每轮运行过的命令、结果、错误。不隐藏失败。

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
