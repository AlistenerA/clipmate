# ISSUES.md — ClipMate v0.1 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## 开放问题

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
- **更新**：Session 3 已实现 Popup 配置检查和占位提示。Session 4 已实现完整 Notion API 调用链。

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
- **描述**：Content Script bundle 47.54KB (gzip 16.18KB)，主要来自 @mozilla/readability 和 turndown。对于浏览器扩展来说可接受，但后续可考虑代码拆分。
- **缓解**：v0.1 不优化，v0.2+ 可考虑按需加载或 tree-shaking。

---

## 已解决问题

### I-015：粗体合并 `****` 修复不完整（Session 4.2.1）
✅ 已修复：在 `htmlToMarkdown.ts` 中新增 `mergeAdjacentBold` 函数，turndown 转换前合并相邻 `<strong>`/`<b>` 标签，从源头消除 `****` 产生。`cleanMarkdown` 重写为迭代正则（`**A****B**` → `**AB**`），支持中文引号和多次出现。

### I-014：长备注后续段落变成普通 paragraph，泄露到 callout 外（Session 4.2.1）
✅ 已修复：`chunkText` 切分后的所有 note chunk 均生成 callout block（`icon: { emoji: '📝' }`），不再将后续 chunk 变为 paragraph block。

### I-013：长备注第二段 callout 显示 💡 而非 📝（Session 4.2）
✅ 已修复：长备注（>2000 字）首段使用 callout block + 📝 图标，后续段落使用普通 paragraph block。不再出现图标不一致问题。

### I-012：控制台疑似打印明文 Token（Session 4.2）
✅ 已修复：移除 `logger.error` 的 `err` 参数（全项目 9 处），不再输出可能包含 Token/正文/备注的原始错误对象。`background/index.ts` 统一改用 logger。DevTools Storage 可见 Token 属于本地存储正常行为，不等于 console 泄露。

### I-011：Markdown 中出现异常 **** 粗体标记（Session 4.2）
✅ 已修复：`cleanMarkdown` 清理函数将连续 4 个及以上星号规范化为 `**`，移除空粗体行。turndown 输出后调用清理。

### I-010：复制 Markdown 缺少标题和来源 URL（Session 4.2）
✅ 已修复：`formatCopyMarkdown` 函数生成完整 Markdown 文档：`# 标题` → `来源：URL` → `标签：#tag` → `> 备注` → `---` → 正文。App.tsx copy handler 改用此函数。

### I-009：中文选区字数显示为 1（应为实际字符数）（Session 4.2）
✅ 已修复：`countWords` 函数支持 CJK 字符逐个计数（含全角标点），英文按空白分词，混合文本正确累计。UI 显示 `${wordCount} 字` 现在准确反映字符数。

### I-008：Notion rich_text 各字段可能超过 2000 字限制

- **状态**：✅ 已修复 (Session 4.1)
- **描述**：blocks.ts 中标题、URL 显示文本、标签拼接文本、备注 callout 的 rich_text 未做 2000 字长度限制。若用户输入超长备注（>2000 字），Notion API 会拒绝请求。标题、URL、标签理论上也可能超长。
- **修复**：标题截断到 2000 字；URL 显示文本截断（保留完整 href）；标签文本截断；备注按 2000 字切分为多个 callout block（首个带📝图标，Session 4.2 改为后续用 paragraph）。

### I-007：appendBlocks 的错误映射未经单元测试

- **状态**：✅ 已修复 (Session 4.1)

### I-S4-001：不存在 Notion API 保存链路（Session 4）
✅ 已实现：完整 Popup → Background SW → Notion API 保存链路。

### I-001：Notion API 保存格式可能需要后续调试（Session 4）
✅ 已解决：Session 4 完成 Notion API 集成。

### I-S3.1-001：剪藏草稿不持久化
✅ 已修复

### I-S3.1-002：Background SW 对所有消息返回 `{ success: true }`
✅ 已修复

### I-S3.1-003：错误码翻译函数不可测试
✅ 已修复

### I-S3-001：Lint 未使用变量
✅ 已修复

### I-S2-001：turndown 和 jsdom 类型依赖缺失
✅ 已安装

### I-S2-002：SelectionResult 与 buildContent 参数不匹配
✅ 已修复

### I-S2-003：turndown strike 标签不在 HTMLElementTagNameMap
✅ 已修复

