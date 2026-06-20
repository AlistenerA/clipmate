# ClipMate Privacy Policy / ClipMate 隐私政策

[中文](#中文) | [English](#english)

**生效日期 / Effective date: 2026-06-20**

## 中文

本隐私政策适用于 ClipMate v0.9.3。ClipMate 是一款在用户浏览器中运行的网页剪藏扩展。

### 1. 基本原则

ClipMate 不运营用于收集用户内容的后端服务器，不出售用户数据，不投放广告，也不使用分析或遥测服务。扩展会在本地处理用户选择的网页内容，并仅在用户主动保存到 Notion 时将必要数据直接发送到 Notion 官方 API。

### 2. 浏览器本地处理和存储的数据

ClipMate 使用 `chrome.storage.local` 保存以下数据：

- Notion Integration Token 和用户配置的目标页面标识。
- 默认标签、默认目标、历史记录开关及其他界面设置。
- 当前剪藏草稿，包括页面标题、来源 URL、提取或选择的内容、Markdown、用于预览的内容结构、标签、备注、剪藏模式和用户选择的外部图片 URL。
- 可选的本地历史，包括标题、URL、标签、备注摘要、内容摘要、Markdown、字数、目标名称、保存状态、错误代码、站点元数据和轻量图片元数据。

这些数据用于恢复配置、编辑草稿、搜索和复制历史、删除记录以及重试失败的 Notion 保存。ClipMate 不会把这些本地数据同步到自有服务器。

### 3. 发送到 Notion 的数据

只有当用户点击“保存到 Notion”或主动重试失败记录时，ClipMate 才会直接向 `https://api.notion.com` 发送：

- Notion Integration Token，用于请求认证。
- 用户选择的 Notion 目标页面标识。
- 剪藏标题和来源 URL。
- 用户输入的标签和备注。
- 提取或选择的正文以及支持的 Markdown/Notion 结构。
- 剪藏中包含的外部图片 URL 和支持的视频链接。

这些数据用于完成用户请求的 Notion 保存。ClipMate 不在浏览器与 Notion 之间设置中间服务器。Notion 对接收数据的处理受 Notion 自身条款和隐私政策约束。

### 4. 页面和图片处理

- 内容脚本读取当前网页 DOM，以执行用户请求的正文提取、选区处理、页面类型判断和图片点选。
- 页面类型判断在本地完成，不会把原始 DOM、正文或判断信号发送给外部模型。
- 图片以外部 URL 方式保存，不下载、上传或缓存图片二进制。
- 当 Popup 显示图片预览时，浏览器可能直接向图片原始托管站点请求该图片。ClipMate 不代理该请求，并使用受限的引用来源策略。
- 视频功能仅处理页面中已有的安全链接元数据，不下载视频、不读取 Cookie、不抓取字幕。

### 5. 第三方服务

ClipMate 的主动数据保存集成仅为 Notion API。除用户当前网页及其原始图片资源外，扩展不访问其他内容处理服务，也不把用户内容发送给外部 AI 或语言模型。

### 6. 浏览器权限用途

- `storage`：本地保存设置、Notion 配置、草稿和可选历史。
- `activeTab`：在用户打开 Popup 时识别当前标签页并进行剪藏交互。
- `<all_urls>` 内容脚本：在用户选择的普通网页上提供通用剪藏能力；浏览器内部页面和扩展商店页面仍受浏览器限制。
- `https://api.notion.com/*`：仅用于用户发起的 Notion 保存请求。

### 7. ClipMate 不做的事

- 不出售或出租用户数据。
- 不追踪浏览历史，不创建跨站用户画像。
- 不收集分析、遥测、崩溃报告或广告标识符。
- 不读取 Cookie，不申请 Cookie、下载、身份或浏览历史权限。
- 不远程下载或执行 JavaScript。
- 不把网页内容发送给外部 AI 服务。
- 不做云同步，不运营用户内容数据库。

### 8. 用户控制与保留期限

用户可以：

- 关闭本地历史记录。
- 删除单条历史或清空全部历史。
- 删除 Notion 目标和清空配置。
- 覆盖或清除当前草稿。
- 卸载扩展以移除浏览器为 ClipMate 保存的本地数据。

Notion 中已经保存的内容需由用户在其 Notion 工作区内管理或删除。

### 9. 数据安全

- Notion Token 输入在界面中使用密码输入方式显示，配置概览仅显示脱敏值。
- Notion API 通信使用 HTTPS。
- 日志不会输出 Token、完整备注、完整正文或完整 Markdown。
- 扩展代码和本地模型随安装包提供，不从远程位置加载执行代码。

### 10. 儿童隐私

ClipMate 不面向 13 岁以下儿童设计，也不会有意收集儿童个人信息。

### 11. 政策更新与联系

功能或数据处理方式变化时，本政策会更新生效日期。隐私问题可通过 [GitHub Issues](https://github.com/AlistenerA/clipmate/issues) 联系维护者。

## English

This Privacy Policy applies to ClipMate v0.9.3. ClipMate is a web-clipping extension that runs in the user's browser.

### 1. Core principles

ClipMate does not operate a backend that collects user content, does not sell user data, does not display advertising, and does not use analytics or telemetry services. The extension processes user-selected webpage content locally and sends necessary data directly to the official Notion API only when the user initiates a Notion save.

### 2. Data processed and stored locally

ClipMate uses `chrome.storage.local` to store:

- The Notion Integration Token and identifiers for user-configured target pages.
- Default tags, default target, history preference, and other interface settings.
- The current clipping draft, including page title, source URL, extracted or selected content, Markdown, preview content structure, tags, note, clipping mode, and user-selected external image URLs.
- Optional local history, including title, URL, tags, note preview, content preview, Markdown, word count, target name, save status, error codes, site metadata, and lightweight image metadata.

This data supports configuration restore, draft editing, history search and copy, record deletion, and retry of failed Notion saves. ClipMate does not synchronize this local data to an operator-controlled server.

### 3. Data sent to Notion

Only when the user selects “Save to Notion” or explicitly retries a failed record does ClipMate send the following directly to `https://api.notion.com`:

- The Notion Integration Token for request authentication.
- The identifier of the Notion target page selected by the user.
- The clip title and source URL.
- User-entered tags and note.
- Extracted or selected body content and supported Markdown/Notion structure.
- External image URLs and supported video links included in the clip.

This data is required to perform the Notion save requested by the user. ClipMate does not place an intermediate server between the browser and Notion. Notion's own terms and privacy policy govern its processing of received data.

### 4. Page and image processing

- The content script reads the current page DOM to perform user-requested content extraction, selection handling, local page classification, and image selection.
- Page classification runs locally and does not send raw DOM, body text, or classification signals to an external model.
- Images are saved as external URLs. ClipMate does not download, upload, or cache image bytes.
- When the Popup displays an image preview, the browser may request that image directly from its original host. ClipMate does not proxy the request and uses a restricted referrer policy.
- Video support processes safe link metadata already present on the page. It does not download video, read cookies, or fetch subtitles.

### 5. Third-party services

Notion API is ClipMate's only active data-saving integration. Apart from the current webpage and its original image resources, the extension does not contact another content-processing service and does not send user content to an external AI or language model.

### 6. Browser permission purposes

- `storage`: stores settings, Notion configuration, drafts, and optional history locally.
- `activeTab`: identifies the active tab and supports clipping after the user opens the Popup.
- `<all_urls>` content script: provides general clipping on ordinary webpages selected by the user; browser-internal and extension-store pages remain restricted by the browser.
- `https://api.notion.com/*`: used only for Notion saves initiated by the user.

### 7. What ClipMate does not do

- It does not sell or rent user data.
- It does not track browsing history or create cross-site user profiles.
- It does not collect analytics, telemetry, crash reports, or advertising identifiers.
- It does not read cookies or request cookie, download, identity, or browsing-history permissions.
- It does not remotely download or execute JavaScript.
- It does not send webpage content to an external AI service.
- It does not provide cloud sync or operate a user-content database.

### 8. User controls and retention

Users can:

- Disable local history.
- Delete individual history records or clear all history.
- Delete Notion targets and clear configuration.
- Replace or clear the current draft.
- Uninstall the extension to remove local data stored for ClipMate by the browser.

Content already saved in Notion must be managed or deleted by the user within their Notion workspace.

### 9. Data security

- The Notion Token field uses a password-style input, and the configuration summary shows only a masked value.
- Communication with the Notion API uses HTTPS.
- Logs do not output the Token, complete notes, complete body content, or complete Markdown.
- Extension code and the local model are packaged with the installation and are not loaded as executable code from remote locations.

### 10. Children's privacy

ClipMate is not designed for children under 13 and does not knowingly collect personal information from children.

### 11. Policy updates and contact

If features or data practices change, this policy will be updated with a new effective date. For privacy questions, contact the maintainers through [GitHub Issues](https://github.com/AlistenerA/clipmate/issues).
