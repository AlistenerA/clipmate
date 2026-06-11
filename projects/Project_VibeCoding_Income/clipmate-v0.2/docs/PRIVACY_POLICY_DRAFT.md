# PRIVACY_POLICY_DRAFT.md — ClipMate v0.1 隐私政策定稿

> 上架 Edge Add-ons 时必须提供公开可访问的隐私政策 URL。建议将此内容托管到 GitHub Pages。

---

## Privacy Policy for ClipMate

**Last updated: [DATE]**

### 1. Information We Collect

ClipMate does **not** collect, store, or transmit any personal information to external servers. All data remains on your device:

- **Notion Integration Token**: Stored locally in your browser using `chrome.storage.local`. This Token is only used to authenticate API requests to Notion on your behalf. It is never sent to any server other than Notion's official API (`https://api.notion.com`).

- **User Settings**: Stored locally in your browser. Includes your configured Notion Page ID, default tags, tag history preference, and UI settings. Never transmitted externally.

- **Tags and Notes**: Stored locally in your browser. Used only as part of the clipping workflow.

### 2. How We Use Information

- Your Notion Token is used exclusively to call the Notion API to save clipped content to your own Notion workspace.
- Your settings and tags are used only to personalize your clipping experience within the extension.

### 3. What Data Is Sent to Notion

When you actively trigger a clipping action (clicking "Save to Notion"), ClipMate sends the following data directly from your browser to Notion's API (`https://api.notion.com`):

- The page **title** and **URL** of the webpage you are clipping
- The **tags** you entered in the extension
- The **notes** you entered in the extension
- The **extracted body text** of the webpage

This data is sent only when you initiate the action. ClipMate does not intercept, store, or log this content on any intermediate server.

### 4. Data Storage

All data is stored **locally** in your browser using Chrome's Storage API (`chrome.storage.local`). No data is stored on any remote server operated by ClipMate. You can clear all local data by removing the extension from your browser, or by clearing your browser's extension storage.

### 5. Third-Party Services

ClipMate integrates with **Notion API** (`https://api.notion.com`). When you clip content to Notion, the data listed in Section 3 is sent directly to Notion's servers. This is the only external service the extension communicates with. Please refer to [Notion's Privacy Policy](https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091) for how Notion handles your data.

### 6. What We Do NOT Do

- **We do not sell** user data to any third party.
- **We do not track** your browsing activity or behavior.
- **We do not collect** analytics, telemetry, or usage statistics.
- **We do not use** advertising identifiers or cookies.
- **We do not execute** remote code — all extension code runs locally in your browser.
- **We do not collect** personally identifiable information (PII).

### 7. Data Security

- Your Notion Token is never exposed in plain text in the extension UI (masked input).
- All API communications with Notion use HTTPS encryption.
- The extension runs entirely in your browser with no remote server.
- You can inspect all local data in your browser's DevTools (Application → Storage → Extension Storage).

### 8. Children's Privacy

ClipMate is not intended for use by children under 13.

### 9. Changes to This Policy

We may update this policy. Changes will be reflected in the extension's documentation and the privacy policy URL.

### 10. Contact

For questions about this privacy policy, contact: [YOUR_EMAIL]

---

## 中文版本

### ClipMate 隐私政策

ClipMate 是一款浏览器扩展，**不收集、不存储、不传输**您的任何个人信息到外部服务器。

#### 数据收集
- **Notion Token**：仅存储在浏览器本地（`chrome.storage.local`），仅用于向 Notion API 发起认证请求。
- **用户设置和标签**：仅存储在浏览器本地。

#### 数据发送
当您主动点击「保存到 Notion」时，ClipMate 将以下数据直接从浏览器发送到 Notion API（`https://api.notion.com`）：
- 被剪藏网页的标题和 URL
- 您在扩展中输入的标签
- 您在扩展中输入的备注
- 网页正文提取结果

ClipMate 不拦截、不存储、不记录这些数据。没有中间服务器。

#### 我们不做的事
- **不出售**用户数据
- **不做广告追踪**
- **不收集分析数据**
- **不使用**广告标识符或 Cookie
- **不执行远程代码**

#### 第三方服务
ClipMate 仅与 Notion API 通信。数据由 Notion 按照其[隐私政策](https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091)处理。

#### 数据安全
- Notion Token 在 UI 中脱敏显示
- 所有通信使用 HTTPS 加密
- 所有代码在浏览器本地运行，无远程服务器
- 您可以随时通过移除扩展或清除浏览器数据来删除所有本地数据

---

> **上架提醒**：Edge Partner Center 需要提供公开可访问的隐私政策 URL。建议将此内容托管在 GitHub Pages。
