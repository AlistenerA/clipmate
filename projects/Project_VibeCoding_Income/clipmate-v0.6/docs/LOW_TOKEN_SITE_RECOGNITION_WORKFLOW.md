# LOW_TOKEN_SITE_RECOGNITION_WORKFLOW.md — ClipMate v0.4

> 低 token 网站识别与内容抽取辅助流程。用于调试 pageType / siteProfile / selection context 识别链路，不新增权限或依赖。

---

## 工具优先级

1. **Playwright MCP** — locator / accessibility snapshot / browser_evaluate 摘要（观察 DOM 结构、验证 selector）
2. **Playwright codegen / trace viewer** — 人工调试辅助
3. **Chrome DevTools MCP** — 仅 console/network/页面状态异常时使用
4. **@mozilla/readability** — 仅作普通文章 fallback 评估，不替代 site profile
5. **暂缓** — Crawlee / Trafilatura / axe-core / Scrapling（需单独审查）

## 禁止事项

1. 不 dump 整页 DOM
2. 不 dump 整页 HTML
3. 不 dump 完整 accessibility tree
4. 不 dump 完整 console/network/HAR/trace JSON
5. 不保存真实正文/评论/账号信息
6. 不扩大 manifest 权限
7. 不使用反爬绕过

## 单次观察摘要格式

```
site:
urlHost:
target:
pageState:
candidateSelectors:
selectedSelector:
titleFound:
titleSource:
authorFound:
contentFound:
commentFound:
mediaFound:
formatter:
risks:
nextAction:
```

## ClipMate 内容识别顺序

```
selection-first
→ site-specific profile (matchSiteProfile)
→ comment-context resolver (buildCommentClipContext)
→ generic semantic selector (classifyElementContext)
→ @mozilla/readability article fallback (Readability.js)
→ safe fallback / user warning
```

**selection-first 必须永远优先**，不得被 Readability 或 profile 覆盖。

## @mozilla/readability 评估

当前项目已使用 `@mozilla/readability` 作为 `handleExtractFullpage` 的主文章提取器。

**评估结论**：Readability 只适合作为普通文章正文 fallback，不适合微博/抖音/小红书/评论区主路径。评论区 DOM 结构（嵌套列表、评论项、无标题）与 Readability 的文章模型不兼容。

## extractionDebugSummary 使用

dev-only 去内容化调试函数 `buildExtractionDebugSummary`（`src/content/debug/`）：

- 仅输出长度桶、来源枚举、布尔值、selector hint
- 不输出真实标题文本、正文、评论
- 不默认 console.log
- 不在生产路径输出
- 当前仅在测试中验证链路正确性

## 已知平台陷阱

| 平台 | 陷阱 | 解决方案 |
|------|------|----------|
| 微博 | CSS Modules 随机类名，`classifyElementContext` 无法识别 | `detectCommentSelectionMode` pageType fallback |
| 小红书 | 反爬拦截，DOM 无法观察 | 人工测试 |
| 抖音 | 验证码拦截 | 人工测试 |
| Google 搜索 | reCAPTCHA | 用 Bing 替代测试 |

## v0.4 Session 8.6.2 发现

- 微博评论选区 `selectionContext === 'unknown'` → `detectCommentSelectionMode` 返回 `selection-generic` → 绕过 comment context 路径 → `content.title` 保持 `parseMetadata` 返回的泛化标题
- 修复：`selectionContext === 'unknown' && pageType === 'forum-or-comment'` → `comment-selection`
