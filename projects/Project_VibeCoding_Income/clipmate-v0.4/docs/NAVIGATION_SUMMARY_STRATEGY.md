# NAVIGATION_SUMMARY_STRATEGY.md — ClipMate v0.4 Navigation Summary Mode Strategy Design

> **Session 3.0 docs-only strategy design。** 本文档不包含代码实现。具体实现由 Session 3/3.1/3.2 完成。
>
> **Session 3 Draft Builder 已完成。** 实现文件：`src/content/navigationSummary/navigationSummaryBuilder.ts`（7 个纯函数）、`tests/navigation-summary-builder.test.ts`（73 tests）。仍未接入保存流程，Session 3.1 完成集成。
>
> 本文档在 Session 1/2/2.1/2.2 完成后编写，基于已有 PageTypeDetector、SiteProfileEngine、IntentSignalCollector 的能力。

---

## 1. 目标

Navigation Summary Mode 解决以下问题：

1. **搜索页、导航页、首页、目录页、低正文置信页面不能继续按正文文章无限提取。** 当前 `buildLowConfidenceSummary` 已做了基础兜底（警告 + 标题 + URL + 最多 10 条链接），但链接提取策略与 PageType/SiteProfile 脱节。
2. **应生成安全、简短、可解释的页面摘要。** 摘要应能让用户一眼判断该页面是否值得保存，而不是被大量噪音链接淹没。
3. **保留标题、URL、domain、pageType、siteProfile、主要链接列表。** 这些是最小可用信息。
4. **不保存正文全文、评论全文、完整页面 HTML。** 导航摘要模式下没有"正文"这个概念。
5. **不新增权限、不访问网络、不接入 AI。** 纯 DOM 只读操作。

### 与现有 `buildLowConfidenceSummary` 的关系

当前 `articleBoundaryGuard.ts:317` 的 `buildLowConfidenceSummary(doc, title, url, pageType?)` 是 v0.4 Session 1 的快速接入方案。它存在以下局限：

- 链接提取用全页面 `doc.querySelectorAll('a[href]')`，不区分主要区域和噪音区域
- 不使用 SiteProfile 的 `selectorHints.searchResultCard` 优先抓取结果卡片内链接
- 不使用 IntentSnapshot（`detectClipIntent` 已能返回 `clip-navigation-summary`，但保存链路未消费）
- 输出直接拼 Markdown 字符串，无结构化中间产物

Navigation Summary Mode 不推翻 `buildLowConfidenceSummary`，而是**在它之前插入一个结构化 draft builder 层**，让下游（复制、保存到 Notion）可以消费结构化数据。

---

## 2. 输入信号

后续实现只能使用以下信号，不得超出：

### 已有可用信号（已实现的模块）

| 信号来源 | 字段/函数 | 说明 |
|----------|----------|------|
| PageTypeDetector | `PageTypeDetectionResult.type` | article / search-results / navigation / forum-or-comment / video / ai-answer / unknown |
| PageTypeDetector | `PageTypeDetectionResult.confidence` | 检测置信度 0-1 |
| PageTypeDetector | `PageTypeDetectionSignals` | linkCount / linkDensity / textLength / paragraphCount 等原始统计 |
| SiteProfileEngine | `matchSiteProfile(input)` | 返回 `SiteProfileMatch \| null`，含 profile 数据、匹配域、confidence |
| SiteProfile | `profile.selectorHints.searchResultCard` | 搜索站点的结果卡片 CSS selector |
| SiteProfile | `profile.selectorHints.contentContainer` | 站点主内容容器 selector |
| SiteProfile | `profile.selectorHints.commentContainer` | 评论区容器 selector |
| IntentSignalCollector | `collectIntentSnapshot(input)` | 返回 `IntentSnapshot`，含 intent / confidence / reasons |
| IntentSignalCollector | `detectClipIntent(...)` | 14 种 intent 判断，含 `clip-navigation-summary` |
| IntentSignalCollector | `collectVisibleContext(doc, siteProfileMatch)` | 视口视频/评论/搜索/文章信号统计 |
| ArticleBoundaryGuard | `assessArticleConfidence(text, html)` | 正文置信度 high/medium/low |
| ArticleBoundaryGuard | `extractSignalsFromDocument(doc)` | 页面 DOM 统计信号 |
| Document（只读） | `doc.URL` / `doc.title` / `doc.querySelectorAll` | 当前页面基本信息 |
| Selection | `window.getSelection()` | 用户选区 |

### 严格禁止使用的信号

- 远程网络请求（fetch/XHR）
- AI API（OpenAI/DeepSeek/Claude/Zhipu/Gemini）
- OCR / 截图
- 媒体下载
- 长期 DOM 监听（MutationObserver / scroll tracking）
- 完整 DOM/HTML 保存
- chrome.storage 持久化 IntentSnapshot
- chrome.tabs / chrome.scripting API（超出 activeTab 权限）

---

## 3. 触发条件草案

以下为 Session 3 实现时的触发规则草案。**本轮不改保存策略。**

### 规则优先级（从高到低）

| 优先级 | 条件 | 模式 | 说明 |
|:---:|------|------|------|
| 1 | **用户有选区**（selectionTextLength > 0） | **不触发** | selection-first 永远优先，强行走现有选区流程 |
| 2 | `detectClipIntent` 输出 `clip-navigation-summary`，confidence ≥ 0.5 | navigation-summary | Intent Signal Collector 综合 pageType + siteProfile + selection + visible 判断 |
| 3 | `pageType === 'navigation'` 且无选区 | navigation-summary | 页面已明确为导航页 |
| 4 | `pageType === 'search-results'` 且无选区 | search-result-summary | 页面已明确为搜索结果页 |
| 5 | `assessArticleConfidence` 返回 `low`，且 `linkDensity > 0.5` | low-confidence-summary | 正文不足 + 链接密集 |
| 6 | `pageType === 'unknown'` 且 `linkCount > 20` 且 `textLength < 800` | safe-fallback-summary | 无法判断类型但高度疑似导航/聚合页 |

### 明确不触发的情况

- 用户有选区：任何情况下优先处理选区
- `pageType === 'article'` 且 `assessArticleConfidence !== 'low'`：正常正文提取
- `pageType === 'video'` 或 `pageType === 'forum-or-comment'` 或 `pageType === 'ai-answer'`：这些由 Session 4 Comment Mode 或未来版本处理

### 说明
这些规则只是 Session 3 实现草案，本轮不改保存策略。Session 3 实现时应设计为可选接入，不强制替换现有 `buildLowConfidenceSummary`。

---

## 4. 输出结构草案

以下为 Session 3 将实现的类型规划（概念设计，不写 TypeScript 代码到 `src/`）：

```
NavigationSummaryDraft
├── title: string              // 页面标题
├── url: string                // 页面 URL
├── domain: string             // 标准化域名
├── pageType: PageType         // 检测到的页面类型
├── siteProfileId?: string     // 匹配到的 site profile ID
├── mode: 'navigation' | 'search-results' | 'low-confidence'  // 触发模式
├── warning: string            // 用户可见的警告文案（中文）
├── links: NavigationLink[]    // 链接列表（最多 15 条，见链接筛选策略）
├── reasons: string[]          // 触发原因（短句，脱敏）
```

```
NavigationLink
├── text: string               // 清洗后的链接文本（截断到 100 字符）
├── href: string               // 原始 href 值
├── domain?: string            // 目标域名（可选，用于展示）
├── source?: 'searchResultCard' | 'mainContent' | 'generic'  // 来源标注
```

### 设计约束

1. `links` 最多 **15 条**（搜索页可放宽到 15，导航页/低置信页最多 10 条）。
2. `link.text` 必须清洗：去除前后空白、截断超长文本（>100 字符）、过滤纯标点/纯数字。
3. 不保存隐藏链接、`javascript:`、`data:`、空 href、`#`。
4. 不保存完整 DOM（只提取链接的 text + href + 来源）。
5. `reasons` 为短句，不含正文全文、不含完整 className、不含 Token/Key。
6. `warning` 使用中文，简洁说明当前模式和原因。

---

## 5. 链接筛选策略草案

Session 3 实现的链接筛选应遵循以下流程，先提取候选链接，再排序截断。

### 候选链接提取

| 步骤 | 操作 | 说明 |
|:---:|------|------|
| 1 | **优先从 siteProfile 的 selectorHints 提取** | 若 `matchSiteProfile` 返回了 profile，且有 `searchResultCard` selector，优先在该 selector 范围内提取链接 |
| 2 | **其次从 main/article 区域提取** | 使用 `profile.selectorHints.contentContainer` 或通用 `main, article, [role="main"]` |
| 3 | **最后从全页面提取** | fallback 使用 `doc.querySelectorAll('a[href]')`，但排除导航/侧栏区域 |

### 链接清洗与过滤

| 步骤 | 规则 | 说明 |
|:---:|------|------|
| 1 | 去重 `href` | 完全相同 href 只保留第一条 |
| 2 | 过滤危险协议 | 排除 `javascript:` / `data:` / `mailto:` / `tel:` / `file:` |
| 3 | 过滤空文本 | `textContent` trim 后为空或 < 2 字符 |
| 4 | 过滤超短文本 | textLength < 4 字符（但可保留纯数字编号如 "1." / "①" 的 margin） |
| 5 | 过滤超长文本 | textLength > 120 字符截断到 100 字符 + "..." |
| 6 | 过滤噪音容器 | 若链接祖先 class/id 命中 `NOISE_CSS_KEYWORDS`（已定义在 articleBoundaryGuard.ts）则排除 |
| 7 | 限制每个 domain | 同一 domain 最多 3 条链接，避免某个站点霸榜 |
| 8 | 过滤隐藏链接 | `offsetParent === null` 且 `getBoundingClientRect` 尺寸为 0 的链接排除 |

### 搜索页特殊策略

搜索页（`pageType === 'search-results'` 且有 searchResultCard selector）：
- **优先使用 `profile.selectorHints.searchResultCard`** 作为提取范围
- 结果卡片内的链接按 DOM 顺序保留
- 卡片外链接降权到末尾

### 导航页特殊策略

导航页（`pageType === 'navigation'`）：
- **排除 role="navigation" / nav / footer / aside 中的链接**
- 优先 `main` / `article` / `[role="main"]` 内的链接
- 严格限制数量为 10

### 不会做的事

- **不抓取目标链接内容**（不发起任何网络请求）
- **不解析链接指向的页面**
- **不跟踪重定向**
- **不保存搜索结果排名信息**
- **不区分内链/外链以实现排序**

---

## 6. 与 Notion / Markdown 的关系

### Markdown 输出

Navigation Summary 最终应能复制为 Markdown。输出格式草案：

```markdown
> ⚠️ 当前页面为[导航页/搜索结果页/低正文置信页]，已生成安全摘要而非全文提取。
> 原因：{reasons 拼接}

**{title}**

来源：{url}

---

### 主要链接

- [link text 1](href1)
- [link text 2](href2)
...
```

### Notion 输出

保存到 Notion 时应使用以下 block 结构：

```
callout block（warning 文案）
├── heading_2（title）
├── paragraph（url）
├── divider
└── bulleted_list_item[]（link list，最多 15 项）
```

### 实现边界

1. **不要在 Session 3 一次性改完所有平台输出。**
2. Session 3 先做内部 `NavigationSummary draft` 纯对象构建和单元测试。
3. Session 3.1 最小接入低置信 fallback（替换 `buildLowConfidenceSummary` 的内部逻辑），Markdown 输出保持向后兼容。
4. Session 3.1 同时验证复制到剪贴板的 Markdown 格式。
5. Session 3.2 做 Notion block 转换（callout + bulleted_list_item）。
6. 不改变 Popup UI 现有按钮行为。

---

## 7. Session 3 实现边界建议

拆分为 3 个子 Session，每个最小可提交：

### Session 3：Navigation Summary Draft Builder ✅ 已完成

**性质**：纯函数实现 + 单元测试，不接入保存流程。

**实际产出**：
- `src/content/navigationSummary/navigationSummary.types.ts` — 类型定义（~45 lines）
- `src/content/navigationSummary/navigationSummaryBuilder.ts` — 纯函数构建器（~315 lines）
  - `sanitizeLinkText` / `isSafeLinkHref` / `toAbsoluteHttpUrl` / `extractDomain`
  - `shouldBuildNavigationSummary` / `collectNavigationSummaryLinks` / `buildNavigationSummaryDraft`
- `src/content/navigationSummary/index.ts` — 模块导出
- `tests/navigation-summary-builder.test.ts` — 73 tests
- 未修改 `content/index.ts`、未修改 `articleBoundaryGuard.ts`

**已验证**：
- lint 0 / test 1009（+73 new）全部通过 / build success
- 纯函数，不访问 chrome API / storage / 网络
- 不改变保存行为
- 不使用现有 `buildLowConfidenceSummary` 代码（独立实现新模块）

### Session 3.1：Navigation Summary Integration

**性质**：最小接入现有低置信 fallback 路径。

**产出**：
- 修改 `content/index.ts` 或 `articleBoundaryGuard.ts` 的低置信分支，使用 draft builder 生成结构化摘要再转 Markdown
- 保持 selection-first 不变
- 验证 Markdown 输出向后兼容（现有测试不退化）
- 补充集成测试

**边界**：
- 只在 `assessArticleConfidence === 'low'` 或 `pageType` 为 navigation/search-results 时接入
- 不改变 Popup UI
- 不改变 Notion 保存流程（Markdown 字符串接口不变）

### Session 3.2：Navigation Summary QA / Fix + Notion Block

**性质**：修复 Session 3.1 发现的问题，完成 Notion block 转换。

**产出**：
- 新增 `src/content/navigation/navigationToNotion.ts` — NavigationSummary → Notion blocks
- 修复任何 QA 发现的问题
- 补充边界测试（空链接、全过滤、极端 DOM）
- 更新 docs

**边界**：
- 不新增 manifest 权限
- 不改变 Notion API 调用方式（复用现有 `appendBlocks` 路径）

---

## 8. 风险和不做事项

### 已知风险

| 编号 | 风险 | 缓解措施 |
|:---:|------|----------|
| R-v0.4-nav-001 | 导航页链接噪声高，可能超过候选链接处理能力 | 限制每个 domain 3 条、总数 15 条、过滤噪音容器 |
| R-v0.4-nav-002 | 搜索页 DOM 结构差异大，`searchResultCard` selector 为 seed/hint 级别 | 有 fallback 到全页面提取；不承诺完整适配 |
| R-v0.4-nav-003 | 低置信正文 fallback 可能覆盖用户本意保存的页面 | selection-first 永远优先；低置信页只生成摘要不阻塞保存 |
| R-v0.4-nav-004 | 搜索引擎结果页可能有 captcha/登录墙遮挡 | `querySelector` 在受限 DOM 内仅返回空列表，降级为安全 fallback |
| R-v0.4-nav-005 | 搜索页动态加载结果（infinite scroll），首次 DOM 不完整 | 当前不监听滚动；Session 3 仅基于首次 DOM 快照，记录 IS03 到 ISSUES.md |

### 严格不做事项

1. **不保存完整搜索结果页面**（不保存搜索结果列表的全部内容）
2. **不抓取目标链接指向的页面**（不发起网络请求）
3. **不新增 host_permissions**（搜索页 URL pattern 不需要额外权限）
4. **不远程加载或执行 JavaScript**
5. **不接入 AI / OCR / 媒体下载**
6. **不改变 selection-first 优先级**
7. **不新增 npm 依赖**

---

## 9. 决策记录引用

| 决策编号 | 内容 | 与本策略的关系 |
|:---:|------|------|
| D-v0.4-004 | 站点适配必须通过 profile engine | 链接优先提取时使用 `searchResultCard` / `contentContainer` selector hints |
| D-v0.4-005 | PageType 检测不做站点硬编码 | 触发条件依据 pageType，不依据 domain |
| D-v0.4-006 | 检测结果先作为辅助，不直接改变保存策略 | Session 3 的 draft builder 先作为独立模块，Session 3.1 才接入 |
| D-v0.4-009 | IntentSnapshot 不持久化 | Navigation Summary 触发后，IntentSnapshot 仍只在 tab 内存 |
| D-v0.4-012 | Seed profiles 不直接改变剪藏策略 | 链接提取使用 profile hints 但通过 draft builder 间接作用 |
| D-v0.4-019 | 先实现内部 draft builder，再接入复制/保存流程 | 本策略的 Session 拆分已体现 |
| D-v0.4-020 | Navigation Summary 不抓取目标链接内容 | 链接筛选策略明确此限制 |
| D-v0.4-021 | 有选区时 selection-first 优先 | 触发条件规则 1 明确此优先级 |
