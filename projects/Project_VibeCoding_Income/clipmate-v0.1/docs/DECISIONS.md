# DECISIONS.md — ClipMate v0.1 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

---

## Session 0 决策

### D-001：v0.1 只支持 Notion，不支持飞书/语雀

- **原因**：Notion 官方 Web Clipper 有 100 万+ 用户但评分仅 3.3，痛点最明确。飞书/语雀用户基数小且需额外 API 适配。
- **影响**：v0.1 平台适配器仅需实现 Notion 一个。
- **可反转性**：高。架构预留 IPlatform 接口，后续可扩展。

### D-002：v0.1 使用手动 Notion Token + Page ID，不做 OAuth

- **原因**：OAuth 需要后端服务器、回调 URL、Token 刷新，工作量 2-3 天。手动 Token 仅需用户在 Options 页粘贴。
- **影响**：用户体验略差（需去 Notion 开发者页创建 Token），但开发时间从 6-7 天缩短到可接受范围。
- **可反转性**：高。后续 Session 可新增 OAuth 流程。

### D-003：v0.1 支持 fullpage 和 selection 两种剪藏模式

- **原因**：官方 Web Clipper 不支持选择性剪藏，这是用户 Top 3 痛点。fullpage 是基础需求。
- **影响**：Content Script 需要两套提取逻辑。
- **可反转性**：不可逆。核心功能。

### D-004：v0.1 支持复制 Markdown

- **原因**：用户可能不想保存到 Notion，只想要干净的 Markdown 格式。低实现成本（用 turndown 库）。
- **影响**：共享模块需包含 markdown.ts。
- **可反转性**：低。属于核心体验。

### D-005：v0.1 使用 chrome.storage.local

- **原因**：MV3 推荐方案，支持大容量本地存储（5MB+），比 chrome.storage.sync 的 100KB 限制更适合。
- **影响**：设置不会跨设备同步，但用户量少的早期阶段这不是问题。
- **可反转性**：中。后续可切换到 sync 或两者并用。

### D-006：v0.1 不做付费

- **原因**：Edge Add-ons 和 Chrome Web Store 官方支付均已弃用或不可用。外部支付（Lemon Squeezy）需要后端验证服务，v0.1 不做。
- **影响**：纯免费产品，无收入。
- **可反转性**：高。后续可添加付费功能。

### D-007：v0.1 不做 AI

- **原因**：AI 摘要和 AI 标签需要额外 API（GLM/DeepSeek），增加用户配置复杂度（需要再填一个 API Key）。v0.1 先验证核心剪藏流程。
- **影响**：产品竞争力不如「AI 加持」的竞品，但核心功能更稳定。
- **可反转性**：高。后续可轻松集成。

### D-008：v0.1 不做 OCR 和截图回退

- **原因**：OCR 需要第三方 API 或本地模型；截图回退需要 canvas API 和图片处理，复杂度高。
- **影响**：对复杂网页可能提取失败，用户体验受限。
- **可反转性**：中。需要较多开发工作。

### D-009：技术栈选择 Vite + React + TypeScript + Tailwind + @crxjs/vite-plugin

- **原因**：参考竞品 web-clipper（React + Webpack）和行业趋势（Vite 更快）。@crxjs/vite-plugin 是 MV3 插件开发最成熟的 Vite 方案。
- **影响**：固定技术栈，后续不能更换。
- **可反转性**：低。一旦启动开发，更换成本高。

---

## Session 1 决策

本轮无新增技术决策。Session 1 严格遵循 Session 0 确定的 D-009 技术栈，按规范搭建脚手架。
所有 Manifest 权限（storage + activeTab）遵循 D-005（本地存储）和 v0.1 最小权限原则。

---

## Session 2 决策

### D-010：Content Script 提取为同步操作，不引入 Promise/Worker

- **原因**：Readability（DOM 遍历）和 turndown（字符串处理）都是同步 API。将提取包装成异步会增加复杂度而无收益。sendResponse 同步返回，chrome.runtime.onMessage 监听器也使用同步路径（`return false` 表示不保持通道，因为响应立即可用）。
- **影响**：提取失败由 try/catch 捕获。不会阻塞 UI（Content Script 在独立线程运行）。
- **可反转性**：低。v0.1 暂不需要异步，但若后续引入截图回退（需要 canvas），可能需要改为异步。

### D-011：Readability 失败时 fallback 到 body.innerText，不做更多尝试

- **原因**：Readability 对中英文博客页面的覆盖率已足够高（>90%）。SPA 页面、非标准结构的页面失败时，`body.innerText` 是最可靠的降级方案。不引入更复杂的 fallback（如按段落迭代提取、检测主要内容区域等），避免过度工程。
- **影响**：SPA 页面的 fallback 会包含导航栏、页脚等无关文字，体验下降。但 v0.1 目标是非 SPA 博客/文章页。
- **可反转性**：高。后续可引入更智能的 fallback（如检测 `<article>` 标签、主要 div 等）。

### D-012：turndown 使用 atx 标题风格和 fenced 代码块

- **原因**：`atx`（`#` 前缀）是 Markdown 事实标准，相比 `setext`（下划线）更适合程序化生成。`fenced` 代码块（`` ``` ``）支持语言标注，比缩进式代码块更通用。
- **影响**：生成的 Markdown 适用于 Notion（通过 API）、GitHub、Obsidian 等主流平台。
- **可反转性**：中。可通过 turndown 配置切换风格，但需测试 Notion API 兼容性。

### D-013：日志只输出模式和字数，绝不输出正文、Token、URL

- **原因**：防止敏感信息泄露到 Console。Content Script 运行在用户页面的 JS 上下文中，任何 console 输出都可能被页面脚本读取（虽然概率低）。
- **影响**：调试略不便（需手动检查提取结果），但安全性优先。
- **可反转性**：高。后续可添加 debug mode 开关。

---

## Session 3 决策

### D-014：Popup/Options 直接使用 chrome.storage.local，不走 Background 路由

- **原因**：Popup 和 Options 页面本身具有完整的 chrome.* API 访问权限，直接调用 `chrome.storage.local` 比通过 Background Service Worker 中继更简单、更少延迟、更少代码。Background SW 的 `GET_SETTINGS`/`SAVE_SETTINGS` 消息类型预留给未来可能需要跨上下文共享设置的场景（如 Content Script 读取设置）。
- **影响**：Settings 的读写逻辑在 Popup/Options 中通过 shared storage 模块完成，Background SW 保持轻量。
- **可反转性**：高。后续可改为通过 Background 路由，只需修改调用方使用 `sendToRuntime` 而非直接 import storage 模块。

### D-015：复制功能使用 Clipboard API + execCommand fallback

- **原因**：`navigator.clipboard.writeText` 是标准 API，但在某些上下文（如 Chrome Extension Popup）可能因权限不足而失败。`document.execCommand('copy')` 是成熟的 fallback 方案。
- **影响**：复制 Markdown 成功率提升，即使 Clipboard API 不可用也能通过 textarea + execCommand 完成。
- **可反转性**：低。这是标准实践，无需反转。

### D-016：Popup 状态管理使用组件内 useState + 组合 hooks，不用 Context/Reducer

- **原因**：Popup 页面简单（单页面、无深层组件嵌套、无跨组件状态共享需求），用 React Context + useReducer 是过度工程。4 个自定义 hooks（useCurrentTab/useExtractContent/useClipDraft/useCopyMarkdown）组合在 App.tsx 中，每个 hook 职责单一。
- **影响**：代码更直观、易调试。如果后续 Popup 变得更复杂（多页面、多步向导），可重构为 Context。
- **可反转性**：高。组件间通过 props 传递，改为 Context 只需包装 Provider。

### D-017：错误信息中文化，面向最终用户

- **原因**：剪藏工具的目标用户是中文用户，错误信息（如"请先选中页面文字后再提取"、"内容提取失败，请尝试全文模式"）比英文代码（如"NO_SELECTION"、"EXTRACTION_FAILED"）更友好。
- **影响**：翻译映射表 `Record<string, string>` 在 useExtractContent hook 中维护。新错误码需同步添加翻译。
- **可反转性**：高。可替换为 i18n 方案，但 v0.1 暂不需要。

---

## Session 3.1 决策

### D-018：剪藏草稿在 Popup 关闭前自动持久化到 chrome.storage.local

- **原因**：Session 3 实现中，标签和备注仅在 React state 中存在，Popup 关闭即丢失。用户可能在添加标签/备注后意外关闭 Popup，应能恢复上次编辑状态。
- **影响**：Popup 打开时尝试恢复上次草稿（跳过自动提取）；提取成功或标签变更时自动保存。Note 变更也触发保存（接受每按键一次写入的性能开销）。
- **可反转性**：高。后续可添加 debounce 或整合到 Notion API 保存流程。

### D-019：Background SW 不响应未处理的消息类型

- **原因**：Session 3 中 Background SW 对所有消息返回 `{ success: true }`，若未来误用 `sendToRuntime` 会收到虚假成功，掩盖真实错误。
- **影响**：改为仅记录日志不响应（`return false`），`sendToRuntime` 调用方会收到错误，更早暴露问题。
- **可反转性**：高。后续 Background SW 需要处理消息时直接添加对应 handler。

### D-020：ERROR_MESSAGES 常量提取到 shared/constants/defaults.ts

- **原因**：Session 3 的错误码翻译是 `useExtractContent` 内的私有函数，无法被测试覆盖。提取为共享常量后，Popup 和测试均可引用。
- **影响**：`src/shared/constants/defaults.ts` 新增 `ERROR_MESSAGES` 导出。`useExtractContent.ts` 移除私有 `translateError` 函数。
- **可反转性**：高。后续可改为 i18n 方案。

---

## Session 4.1 决策

### D-025：blocks.ts 各字段均做 2000 字长度限制

- **原因**：Notion API rich_text 对象的 `text.content` 字段限制 2000 字符。此前仅有正文段落做了 chunkText 切分，标题、URL 显示文本、标签文本、备注 callout 未限制长度。用户输入的备注可能超过 2000 字（如粘贴一段长文本作为备注）。
- **影响**：标题截断到 2000 字；URL 显示文本截断到 2000 字（link.url 保留完整）；标签文本截断到 1997 字（预留"标签："前缀）；备注按 chunkText 切分为多个 callout block（首个带📝图标，后续不带）。
- **可反转性**：高。后续可改为更智能的分段策略或 Markdown parser。

### D-026：Notion client 错误映射使用 mock fetch 单元测试，不真实调用 API

- **原因**：client.ts 的 `makeRequest` 内部函数不可外部访问，仅能通过 `appendBlocks` 间接测试。使用 vitest `vi.stubGlobal('fetch')` 模拟 fetch 响应，验证错误码映射的正确性和分批逻辑。
- **影响**：新增 10 个测试用例，覆盖全部 HTTP 错误路径和 3 种分批场景（≤100、150、250、中途失败停止）。
- **可反转性**：高。后续可改为 E2E 测试。

### D-027：权限说明文档作为上架材料草稿

- **原因**：Edge Add-ons / Chrome Web Store 审核需要说明每个权限的用途。创建 `docs/PERMISSION_JUSTIFICATION.md` 详细解释 `activeTab`（点击图标时获取当前页）、`storage`（本地保存设置和草稿）、`https://api.notion.com/*`（仅调用 Notion API）、`<all_urls>` content_scripts（用户可在任何网站剪藏，不静默运行）。
- **影响**：上架材料 +1，后续可直接引用。
- **可反转性**：不可逆。文档是审核必需材料。

---

### D-021：Notion 保存链路走 Popup → Background SW → Notion API

- **原因**：Background Service Worker 可以访问 chrome.storage 读取 Token/Page ID，且 fetch 不受 CORS 限制。Popup 通过 `sendToRuntime` 将 ClipDraft 发送给 Background，由 Background 完成 API 调用。这比 Popup 直接调用 Notion API 更安全（Token 不出现在 Content Script 上下文中）。
- **影响**：Background SW 从纯日志占位变为实际处理 SAVE_TO_NOTION 消息。新增 host_permissions `https://api.notion.com/*` 确保 fetch 可靠。
- **可反转性**：中。后续可改为 Popup 直接调用，但安全性略降。

### D-022：v0.1 正文按纯文本段落保存到 Notion，不做完整 Markdown 渲染

- **原因**：Notion API 的 rich_text 不支持嵌套格式（如行内代码、粗体、斜体与段落嵌套），需要在 blocks.ts 中实现复杂的 Markdown AST 解析才能生成正确 rich_text annotations。v0.1 优先实现可用闭环，正文按 `\n\n` 分段后每段一个 paragraph block。后续版本可引入 Markdown parser 生成更丰富的 blocks（如代码块、引用、列表）。
- **影响**：保存到 Notion 的正文为纯文本段落，丢失了原始 Markdown 的粗体/斜体/行内代码/列表/引用格式。用户仍可通过"复制 Markdown"获得完整格式。
- **可反转性**：高。后续可替换 blocks.ts 中的 `splitParagraphs` 为完整 Markdown→Blocks 转换器。

### D-023：host_permissions 增加 https://api.notion.com/*

- **原因**：Background Service Worker 的 `fetch` 在技术上不需要 host_permissions，但添加此权限可以确保在各类 Chrome/Edge 版本中的兼容性，且在扩展审核时向用户明确告知网络访问范围。仅限 Notion API 域名，不扩大权限范围。
- **影响**：用户安装时会看到"访问 api.notion.com 数据"提示。manifest.json 中 host_permissions 字段包含 `https://api.notion.com/*`。
- **可反转性**：高。若测试确认不需要即可移除。

### D-024：错误码使用英文常量 + ERROR_MESSAGES 映射为中文

- **原因**：延续 D-020 的模式。Background handler 返回英文错误码（如 `NOTION_TOKEN_MISSING`），Popup 通过 `ERROR_MESSAGES` 映射为用户可见中文提示。错误码可用于日志追踪，中文提示用于用户展示。日志中绝不输出 Token 或正文全文。
- **影响**：新增 8 个错误码和对应中文映射。Popup 和 Background 代码均不包含硬编码中文错误字符串（仅 ERROR_MESSAGES 常量表包含）。
- **可反转性**：高。后续可改为 i18n 方案。
