# ISSUES.md — ClipMate v0.1 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## 开放问题

### I-008：Notion rich_text 各字段可能超过 2000 字限制

- **状态**：✅ 已修复 (Session 4.1)
- **描述**：blocks.ts 中标题、URL 显示文本、标签拼接文本、备注 callout 的 rich_text 未做 2000 字长度限制。若用户输入超长备注（>2000 字），Notion API 会拒绝请求。标题、URL、标签理论上也可能超长。
- **修复**：标题截断到 2000 字；URL 显示文本截断（保留完整 href）；标签文本截断；备注按 2000 字切分为多个 callout block（首个带📝图标）。

### I-007：appendBlocks 的错误映射未经单元测试

- **状态**：✅ 已修复 (Session 4.1)
- **描述**：client.ts 的 HTTP 状态码→错误码映射（401/403→AUTH_FAILED, 404→PAGE_NOT_FOUND, 429→RATE_LIMITED, 500→SAVE_FAILED, fetch reject→NETWORK_ERROR）和分批逻辑（100 blocks/batch）未有专门的单元测试。
- **修复**：新增 `tests/notion-client.test.ts`（10 tests），mock fetch 覆盖全部 6 种错误映射 + 4 个分批场景。

### I-006：ClipDraft 恢复与自动提取存在潜在竞态

- **状态**：🟡 已缓解
- **描述**：Popup 打开时同时触发「恢复上次草稿」和「自动提取」，可能导致恢复的草稿被提取覆盖，或反之。Session 3.1 通过 `draftLoaded` + `restoredRef` 机制已缓解：有草稿时跳过自动提取，无草稿时正常提取。
- **影响**：边界场景下可能出现短暂闪烁（先显示恢复内容，mode 变化后重新提取）。不影响数据正确性。
- **缓解**：v0.1 可接受。v0.2+ 可考虑 URL 匹配检查（仅当草稿 URL 与当前页 URL 匹配时才恢复）。

### I-001：Notion API 保存格式可能需要后续调试

- **状态**：🟡 Session 4 接入
- **描述**：Notion API 的 Block 格式对复杂 HTML 的兼容性待验证。特别是 `<table>`、嵌套列表、代码块等复杂元素。
- **影响**：富文本页面可能丢失格式。
- **缓解**：优先支持基础 Block（段落、标题、列表、引用、图片），复杂元素降级为纯文本。
- **更新**：Session 3 已实现 Popup 配置检查和占位提示。Session 4 将实现完整 Notion API 调用链。

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
- **描述**：Content Script bundle 47.55KB (gzip 16.17KB)，主要来自 @mozilla/readability 和 turndown。对于浏览器扩展来说可接受，但后续可考虑代码拆分。
- **缓解**：v0.1 不优化，v0.2+ 可考虑按需加载或 tree-shaking。

---

## 已解决问题

### I-S4-001：不存在 Notion API 保存链路（Session 4）
✅ 已实现：完整 Popup → Background SW → Notion API 保存链路。包括 client.ts（API 封装，401/403/404/429 错误映射）、blocks.ts（ClipDraft→Blocks 转换，2000 字切分）、notionHandler.ts（校验 Token/Page ID/内容）、useSaveToNotion.ts（loading/error/saved 状态）。新增 host_permissions: https://api.notion.com/*。

### I-001：Notion API 保存格式可能需要后续调试（Session 4）
✅ 已解决：Session 4 完成 Notion API 集成。支持基础 blocks：heading_2（标题）、paragraph（URL/标签）、callout（备注）、divider、paragraph（正文段落）。正文按纯文本段落保存（双换行分段），长文本自动切分 2000 字。复杂元素（表格/嵌套列表）降级为纯文本段落。待真机验证。

### I-S3.1-001：剪藏草稿不持久化，标签/备注在 Popup 关闭后丢失（Session 3.1）
✅ 已修复：`src/popup/App.tsx` 新增 auto-save / restore 逻辑。提取成功后自动保存 ClipDraft（Content + Tags + Note）到 `chrome.storage.local`；Popup 打开时自动恢复上次草稿。使用 `draftLoaded` 状态 + `restoredRef` 标记防止恢复与自动提取的竞态。

### I-S3.1-002：Background SW 对所有消息返回 `{ success: true }`（Session 3.1）
✅ 已修复：`src/background/index.ts` 不再响应未处理消息类型，仅记录日志。避免未来误用 `sendToRuntime` 时收到虚假成功。

### I-S3.1-003：错误码翻译函数不可测试（Session 3.1）
✅ 已修复：`src/shared/constants/defaults.ts` 新增 `ERROR_MESSAGES` 常量，`useExtractContent.ts` 移除私有 `translateError` 函数改用共享常量。

### I-S3-001：Lint 未使用变量（Session 3）
✅ 已修复：移除 App.tsx 中未使用的 `resetDraft`、ActionButtons.tsx 中 `notionConfigured`、StatusBar.tsx 中 `error` prop。

### I-S2-001：turndown 和 jsdom 类型依赖缺失（Session 2）
✅ 已安装 @types/turndown 和 jsdom。

### I-S2-002：SelectionResult 与 buildContent 参数不匹配（Session 2）
✅ 已修复：映射 `{ html, text }` → `{ content, textContent }`。

### I-S2-003：turndown strike 标签不在 HTMLElementTagNameMap（Session 2）
✅ 已修复：移除 `strike` 过滤，仅保留 `del` 和 `s`。

