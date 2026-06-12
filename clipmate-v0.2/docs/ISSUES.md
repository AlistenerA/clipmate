# ISSUES.md — ClipMate v0.1 / v0.2 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## v0.2 开放问题

> v0.2 Session 8 已完成。

### Session 8 状态

Session 8 无新增 blocker。本轮为 docs-only 规则录入任务，未修改业务代码。v0.3 尚未启动，功能方向未最终确定。AI、多平台、OCR、付费等仍需单独评估后才能进入实现。

### Session 7 状态

Session 7 无新增 blocker。全量自动化检查（lint/test/build/zip/权限/日志/敏感信息/文档一致性/边界决策）全部通过。无新增问题。

### I-027：History 预览显示图片语法（Session 5.2）

- **状态**：✅ 已解决
- **描述**：文章开篇是图片时，历史条目预览显示 Markdown 图片语法 `![](url)`，非常难看。
- **修复**：新增 `stripMarkdownImages` 纯函数（移除 `![]()` / `[![]()]()` / `<img>` 标签）和 `normalizeSummaryText`，在 `getHistorySummary` 中清理 body 后再取摘要。

### I-026：网站图标只有域名首字母（Session 5.2）

- **状态**：✅ 已解决
- **描述**：历史条目图标仅显示域名首字母头像，期望优先显示真实 favicon。
- **修复**：Content Script 的 `extractSiteIconUrl` 从 `<link rel="...">` 提取真实图标 URL（优先级 `apple-touch-icon` > `icon` > `shortcut icon` > `mask-icon` > `/favicon.ico` fallback）。新增 `siteIconUrl` / `siteName` / `themeColor` / `descriptionPreview` 可选字段，数据流从 metaParser → buildContent → history input → storage。HistoryItem 渲染 `<img src={siteIconUrl}>`，`onError` 后隐藏图片并 fallback 域名首字母。旧历史记录无新字段时直接显示首字母。

### I-025：搜索关键词匹配不渲染高亮（Session 5.1）

- **状态**：✅ 已解决
- **描述**：人工测试发现搜索时不会给匹配的关键词做高亮。
- **修复**：`HistoryItem.tsx` 用 `highlightText` 纯函数切分匹配片段为 token 数组，React `<mark>` 渲染，非 `dangerouslySetInnerHTML`。标题、URL/域名、摘要中匹配文字均有高亮。

### I-024：搜索匹配 tag 不显示（Session 5.1）

- **状态**：✅ 已解决
- **描述**：搜索命中正文/备注/目标时没有视觉反馈。
- **修复**：`getHistoryMatchInfo` 返回各字段匹配状态，HistoryItem 渲染匹配 tag（黄底标签/紫色"目标匹配"/青色"备注匹配"/橙色"正文匹配"）。

### I-023：历史条目预览样式单调（Session 5.1）

- **状态**：✅ 已解决
- **描述**：预览区像纯文本，不够直观。
- **修复**：HistoryItem 重设计：每条历史左侧显示域名首字母圆形头像 + 同站颜色；摘要优先级 notePreview → contentPreview → markdown body → URL 兜底。

### I-022：同站不同文章打开 Popup 不自动刷新（Session 5.1）

- **状态**：✅ 已解决
- **描述**：同一网站不同文章间切换后打开 Popup 仍显示上一篇文章。
- **修复**：`App.tsx` 中 `Promise.all([getLastClipDraft(), chrome.tabs.query()])` 比较 draft URL 与 active tab URL；不同则不自恢复内容而触发 auto-extract；相同则保持 draft 恢复全量（含 tags/note）。

### I-018：复制 Markdown 暂不写入 unsaved 历史（Session 4）

- **状态**：🟡 已确认保留
- **描述**：Popup 中「复制 Markdown」不会写入 `saveStatus='unsaved'` 历史。Session 5 未修改 Popup 逻辑，因为那会扩大 Session 范围。History UI 已支持展示和重试已有的 unsaved 历史记录。
- **影响**：用户复制 Markdown 后不会在历史记录中留下 unsaved 条目。可留待后续 Session 处理。

### I-019：Popup alert 文案与 ERROR_MESSAGES 不一致（Session 4.1）

- **状态**：✅ 已解决
- **描述**：Session 4 的 `App.tsx` 中 alert 使用硬编码文案，与 `ERROR_MESSAGES` 不一致。

### I-020：Notion URL #hash 可能混淆用户（Session 4.1）

- **状态**：✅ 已解决
- **描述**：Notion URL 如 `.../Page-37b5fa...#37c5fa...` 中 # 后是块定位 ID，用户可能误当作页面 ID 填写。
- **修复**：`targetManager.ts` 新增 `extractNotionPageId()` 函数，用 `new URL().pathname` 自动忽略 hash；TargetEditor 增加提示文案说明 # 后不需要填写。

### I-021：Popup 目标选择框显示 Page ID 预览（Session 4.1）

- **状态**：✅ 已解决
- **描述**：Popup TargetSelector 下拉选项显示 `目标名称 (...aa453c)`，Page ID 预览对用户无用且增加视觉噪音。
- **修复**：TargetSelector 移除 `(maskPageId)` 显示，仅保留 `t.name`。Options 管理页仍保留脱敏 Page ID。

### I-018：复制 Markdown 暂不写入 unsaved 历史（Session 4）

- **状态**：🟡 已确认保留
- **描述**：Popup 中「复制 Markdown」不会写入 `saveStatus='unsaved'` 历史。Session 5 未修改 Popup 逻辑，因为那会扩大 Session 范围。History UI 已支持展示和重试已有的 unsaved 历史记录。
- **影响**：用户复制 Markdown 后不会在历史记录中留下 unsaved 条目。可留待后续 Session 处理。

### I-017：MIN_HISTORY_LIMIT 为 10，用户可设置更小值但会被 clamp（Session 1）

- **状态**：✅ 已处理
- **描述**：`saveSettings` 中 clamp `historyLimit` 到 [10, 500]。用户设置小于 10 的值会自动调整为 10。`addHistoryItem` 中也有安全阀 clamp。
- **影响**：用户想设置小于 10 的历史记录上限当前不支持。

---

## v0.1 开放问题

### I-016：public/icons/ 图标文件缺失（Session 5）

✅ 已解决（Session 5.1）— `public/icons/` 已部署 6 个图标文件（16/32/48/128/512 PNG + SVG source），manifest 已声明 icons 配置，dist 和 zip 均包含图标。

### I-006：ClipDraft 恢复与自动提取存在潜在竞态

- **状态**：🟡 已缓解
- **描述**：Popup 打开时同时触发「恢复上次草稿」和「自动提取」，可能导致恢复的草稿被提取覆盖。Session 3.1 通过 `draftLoaded` + `restoredRef` 机制已缓解。
- **影响**：边界场景可能出现短暂闪烁。不影响数据正确性。

### I-005：Bundle 体积偏大

- **状态**：🟡 待评估
- **描述**：Content Script bundle 47.61KB (gzip 16.21KB)，主要来自 @mozilla/readability 和 turndown。对浏览器扩展可接受。
- **缓解**：v0.1 不优化。

---

## 已解决问题

### I-015：粗体合并 `****` 修复不完整（Session 4.2.1）
✅ 已修复

### I-014：长备注后续段落变成普通 paragraph（Session 4.2.1）
✅ 已修复

### I-013：长备注第二段 callout 显示 💡 而非 📝（Session 4.2）
✅ 已修复

### I-012：控制台疑似打印明文 Token（Session 4.2）
✅ 已修复

### I-011：Markdown 中出现异常 **** 粗体标记（Session 4.2）
✅ 已修复

### I-010：复制 Markdown 缺少标题和来源 URL（Session 4.2）
✅ 已修复

### I-009：中文选区字数显示为 1（Session 4.2）
✅ 已修复

### I-008：Notion rich_text 各字段可能超 2000 字（Session 4.1/4.2.1）
✅ 已修复

### I-007：appendBlocks 错误映射未经单元测试（Session 4.1）
✅ 已修复

### I-003：Edge 审核需要隐私政策和权限说明（Session 5）
✅ 已解决：PRIVACY_POLICY_DRAFT.md 已重写定稿，PERMISSION_JUSTIFICATION.md 已对齐实际权限配置。

### I-004：MCP 工具可能不可用
🟡 非阻塞（不影响业务代码，CLI fallback 可用）

### I-001/I-002：Notion 保存格式/Readability 复杂网页提取质量
🟡 已缓解（Session 4/4.2 已实现基本方案和 fallback，真机测试待验证）
