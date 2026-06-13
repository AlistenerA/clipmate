# PRIVACY_POLICY_DRAFT.md — ClipMate v0.3 隐私政策草稿

> v0.3 发布候选草稿。上架 Edge Add-ons / Chrome Web Store 时必须提供公开可访问的隐私政策 URL。建议将此内容托管到 GitHub Pages。

---

## Privacy Policy for ClipMate

**Last updated: [DATE]**

### 1. Information We Collect

ClipMate does **not** collect, store, or transmit any personal information to external servers. All data remains on your device:

- **Notion Integration Token**: Stored locally in your browser using `chrome.storage.local`. This Token is only used to authenticate API requests to Notion on your behalf. It is never sent to any server other than Notion's official API (`https://api.notion.com`).

- **User Settings**: Stored locally in your browser. Includes configured Notion target pages, default tags, history settings (save history enabled, history limit), and UI settings. Never transmitted externally.

- **Local Clipping History**: Stored locally in your browser. Each history entry includes: page title, URL, tags, note preview, content preview, full Markdown, word count, target name snapshot, save status (saved/failed/unsaved), error codes, site name, favicon URL, and theme color. This data is used only for the history UI within the extension and is never sent to any server.

### 2. How We Use Information

- Your Notion Token is used exclusively to call the Notion API to save clipped content to your own Notion workspace.
- Your settings and tags are used only to personalize your clipping experience within the extension.
- Your clipping history is used only for local search, copy, retry, and review within the extension's History UI.

### 3. What Data Is Sent to Notion

When you actively trigger a clipping action (clicking "Save to Notion" or retrying a failed save), ClipMate sends the following data directly from your browser to Notion's API (`https://api.notion.com`):

- The page **title** and **URL** of the webpage you are clipping
- The **tags** you entered in the extension
- The **notes** you entered in the extension
- The **extracted body text** of the webpage

This data is sent only when you initiate the action. ClipMate does not intercept, store, or log this content on any intermediate server.

### 4. Data Storage

All data is stored **locally** in your browser using Chrome's Storage API (`chrome.storage.local`). No data is stored on any remote server operated by ClipMate. You can clear all local data by removing the extension from your browser, or by clearing your browser's extension storage.

### 5. Third-Party Services

ClipMate integrates with **Notion API** (`https://api.notion.com`). When you clip content to Notion, the data listed in Section 3 is sent directly to Notion's servers. This is the only external service the extension communicates with. Please refer to [Notion's Privacy Policy](https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091) for how Notion handles your data.

ClipMate does **not** call any third-party favicon APIs. Website icons are extracted from the current page's DOM (`<link rel="...">` elements) and stored locally in history records.

### 6. What We Do NOT Do

- **We do not sell** user data to any third party.
- **We do not track** your browsing activity or behavior.
- **We do not collect** analytics, telemetry, or usage statistics.
- **We do not use** advertising identifiers or cookies.
- **We do not execute** remote code — all extension code runs locally in your browser.
- **We do not collect** personally identifiable information (PII).
- **We do not process** user content with AI services or external language models.
- **We do not sync** data to the cloud.
- **We do not call** third-party favicon or API services for icons.

### 7. Data Security

- Your Notion Token is never exposed in plain text in the extension UI (masked input).
- All API communications with Notion use HTTPS encryption.
- The extension runs entirely in your browser with no remote server.
- You can inspect all local data in your browser's DevTools (Application → Storage → Extension Storage).
- ClipMate does NOT output Token, full body text, full notes, or complete Markdown to the browser console.

### 8. User Controls

- You can **clear all history** from the History tab in Options.
- You can **disable history recording** in Options (new clips will not be saved to history).
- You can **delete individual history entries** at any time.
- You can **delete Notion targets** from Options at any time.
- You can **uninstall the extension** to remove all local data.

### 9. Children's Privacy

ClipMate is not intended for use by children under 13.

### 10. Changes to This Policy

We may update this policy. Changes will be reflected in the extension's documentation and the privacy policy URL.

### 11. Contact

For questions about this privacy policy, contact: [YOUR_EMAIL]

---

## 中文版本

### ClipMate 隐私政策

ClipMate 是一款浏览器扩展，**不收集、不存储、不传输**您的任何个人信息到外部服务器。

#### 数据收集

- **Notion Token**：仅存储在浏览器本地（`chrome.storage.local`），仅用于向 Notion API 发起认证请求。
- **用户设置**：本地存储，包含 Notion 目标页面配置、默认标签、历史记录开关、历史保留上限。
- **本地剪藏历史**：每条历史包含：页面标题、URL、标签、备注摘要、正文摘要、完整 Markdown、字数、目标名称快照、保存状态（已保存/失败/未保存）、错误码、站点名称、favicon URL、主题色。仅用于扩展内的历史 UI，不发送到任何服务器。

#### 数据发送

当您主动点击「保存到 Notion」或重试失败保存时，ClipMate 将以下数据直接从浏览器发送到 Notion API（`https://api.notion.com`）：
- 被剪藏网页的标题和 URL
- 您在扩展中输入的标签
- 您在扩展中输入的备注
- 网页正文提取结果

ClipMate 不拦截、不存储、不记录这些数据。没有中间服务器。

#### 第三方服务

ClipMate 仅与 Notion API 通信。数据由 Notion 按照其[隐私政策](https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091)处理。

ClipMate **不调用**任何第三方 favicon API。网站图标从当前页面 DOM 的 `<link rel="...">` 元素提取，并存储在本地历史中。

#### 我们不做的事

- **不出售**用户数据给任何第三方
- **不追踪**浏览活动或行为
- **不收集**分析数据、遥测数据、使用统计
- **不使用**广告标识符或 Cookie
- **不执行**远程代码 — 所有扩展代码在浏览器本地运行
- **不收集**个人身份信息（PII）
- **不使用** AI 或外部语言模型处理用户内容
- **不做**云同步
- **不调用**第三方 favicon API

#### 数据安全

- Notion Token 在 UI 中脱敏显示
- 所有通信使用 HTTPS 加密
- 所有代码在浏览器本地运行，无远程服务器
- 控制台不输出 Token、正文全文、备注全文、完整 Markdown
- 您可以随时通过移除扩展或清除浏览器数据来删除所有本地数据

#### 用户控制

- 可在 Options 的「剪藏历史」标签页中**清空全部历史**
- 可在 Options 中**关闭历史记录**开关
- 可随时**删除单条历史记录**
- 可随时**删除 Notion 目标页面**
- **卸载扩展**即可清除所有本地数据

---

> **上架提醒**：Edge Partner Center 需要提供公开可访问的隐私政策 URL。建议将此内容托管在 GitHub Pages。
