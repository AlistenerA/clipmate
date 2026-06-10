# PRIVACY_POLICY_DRAFT.md — ClipMate v0.1 隐私政策草稿

> 上架 Edge Add-ons 时必须提供隐私政策 URL。此文档为草稿，正式发布时托管到 GitHub Pages。

---

## Privacy Policy for ClipMate

**Last updated: [DATE]**

### 1. Information We Collect

ClipMate does **not** collect, store, or transmit any personal information to external servers. Specifically:

- **Notion Integration Token**: Stored locally in your browser using `chrome.storage.local`. Used solely to authenticate API requests to Notion on your behalf. Never sent to any third-party server.
- **Clipped Content**: Web page content you choose to clip is sent directly from your browser to Notion's API (`https://api.notion.com`). We do not intercept, store, or log this content.
- **User Settings**: Stored locally in your browser. Includes preferences like default target page, tag history, and UI settings.
- **Tags and Notes**: Stored locally in your browser.

### 2. How We Use Information

- Your Notion Token is used exclusively to call the Notion API for saving pages.
- Your settings are used to personalize your clipping experience.

### 3. Data Storage

All data is stored **locally** in your browser using Chrome's Storage API. No data is stored on any remote server operated by ClipMate.

### 4. Third-Party Services

ClipMate integrates with **Notion API** (`https://api.notion.com`). When you clip content to Notion, the content is sent directly to Notion's servers. Please refer to [Notion's Privacy Policy](https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091) for how Notion handles your data.

### 5. Data Security

- Your Notion Token is never exposed in plain text in the extension's UI.
- All API communications use HTTPS encryption.
- No remote code execution — the extension runs entirely in your browser.

### 6. Children's Privacy

ClipMate is not intended for use by children under 13.

### 7. Changes to This Policy

We may update this policy. Changes will be reflected in the extension's documentation.

### 8. Contact

For questions about this privacy policy, contact: [YOUR_EMAIL]

---

## 中文版本（建议同时提供）

### ClipMate 隐私政策

ClipMate 是一款浏览器扩展，**不收集、不存储、不传输**您的任何个人信息到外部服务器。

- **Notion Token**：仅存储在您浏览器的本地存储中，仅用于向 Notion API 发起请求。
- **剪藏内容**：直接从您的浏览器发送到 Notion 官方 API，我们不做任何拦截、存储或记录。
- **所有设置和标签**：均存储在浏览器本地。
- **无远程服务器**：ClipMate 没有后台服务器，所有代码在您浏览器本地运行。

---

> **上架提醒**：Edge Partner Center 需要提供公开可访问的隐私政策 URL。建议将此内容托管在 GitHub Pages。
