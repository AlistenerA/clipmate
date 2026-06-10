# ISSUES.md — ClipMate v0.1 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## 开放问题

### I-001：Notion API 保存格式可能需要后续调试

- **状态**：未开始
- **描述**：Notion API 的 Block 格式对复杂 HTML 的兼容性待验证。特别是 `<table>`、嵌套列表、代码块等复杂元素。
- **影响**：富文本页面可能丢失格式。
- **缓解**：优先支持基础 Block（段落、标题、列表、引用、图片），复杂元素降级为纯文本。

### I-002：Readability 对复杂网页可能提取失败，需要 fallback

- **状态**：🟡 已实现基础 fallback
- **描述**：Mozilla Readability 对 SPA（如 Notion 自身页面）、中文网页、非标准博客可能失败。当前已实现 `body.innerText` fallback，但 fallback 质量未经真实页面验证。
- **影响**：部分网页正文提取可能不精准。
- **缓解**：v0.1 fallback 使用整个 body innerText（已移除 script/style/noscript/iframe）。v0.2+ 可考虑截图回退。

### I-003：Edge 审核需要隐私政策和权限说明

- **状态**：未开始
- **描述**：Edge Add-ons 审核要求隐私政策 URL（必填）和权限使用说明。
- **缓解**：已在 `PRIVACY_POLICY_DRAFT.md` 起草隐私政策。上架时使用 GitHub Pages 托管隐私政策页面。

### I-004：当前 MCP 中 file-reader 和 git 工具可能不可用

- **状态**：未开始
- **描述**：根据 AGENTS.md，MCP 工具（read_image/read_pdf/read_docx）在当前环境可能不可用。
- **影响**：如果需要读取图片/PDF 素材，可能需要使用 CLI fallback 方式。
- **缓解**：不依赖 MCP 工具完成业务代码开发。

### I-005：Bundle 体积偏大

- **状态**：🟡 待评估
- **描述**：Content Script bundle 47.73KB (gzip 16.24KB)，主要来自 @mozilla/readability 和 turndown。对于浏览器扩展来说可接受，但后续可考虑代码拆分。
- **缓解**：v0.1 不优化，v0.2+ 可考虑按需加载或 tree-shaking。

---

## 已解决问题

### I-S2-001：turndown 和 jsdom 类型依赖缺失（Session 2）
✅ 已安装 @types/turndown 和 jsdom。

### I-S2-002：SelectionResult 与 buildContent 参数不匹配（Session 2）
✅ 已修复：映射 `{ html, text }` → `{ content, textContent }`。

### I-S2-003：turndown strike 标签不在 HTMLElementTagNameMap（Session 2）
✅ 已修复：移除 `strike` 过滤，仅保留 `del` 和 `s`。

