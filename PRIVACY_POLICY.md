# Privacy Policy for ClipMate

**Last updated: June 13, 2026**

### 1. Information We Collect

ClipMate does **not** collect, store, or transmit any personal information to external servers. All data remains on your device:

- **Notion Integration Token**: Stored locally in your browser using `chrome.storage.local`. This Token is only used to authenticate API requests to Notion on your behalf. It is never sent to any server other than Notion's official API (`https://api.notion.com`).

- **User Settings**: Stored locally in your browser. Includes configured Notion target pages, default tags, history settings (save history enabled, history limit), and UI settings. Never transmitted externally.

- **Local Clipping History**: Stored locally in your browser. Each history entry includes: page title, URL, tags, note preview, content preview, full Markdown, word count, target name snapshot, save status, error codes, site name, favicon URL, and theme color. This data is used only for the history UI within the extension and is never sent to any server.

### 2. How We Use Information

- Your Notion Token is used exclusively to call the Notion API to save clipped content to your own Notion workspace.
- Your settings and tags are used only to personalize your clipping experience within the extension.
- Your clipping history is used only for local search, copy, retry, and review within the extension's History UI.

### 3. What Data Is Sent to Notion

When you actively trigger a clipping action (clicking "Save to Notion" or retrying a failed save), ClipMate sends the following data directly from your browser to Notion's API (`https://api.notion.com`):

- The page title and URL of the webpage you are clipping
- The tags you entered in the extension
- The notes you entered in the extension
- The extracted body text of the webpage

This data is sent only when you initiate the action. ClipMate does not intercept, store, or log this content on any intermediate server.

### 4. Data Storage

All data is stored **locally** in your browser using Chrome's Storage API (`chrome.storage.local`). No data is stored on any remote server operated by ClipMate. You can clear all local data by removing the extension from your browser, or by clearing your browser's extension storage.

### 5. Third-Party Services

ClipMate integrates with **Notion API** (`https://api.notion.com`). When you clip content to Notion, the data listed in Section 3 is sent directly to Notion's servers. Please refer to [Notion's Privacy Policy](https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091) for how Notion handles your data.

ClipMate does **not** call any third-party favicon APIs. Website icons are extracted from the current page's DOM and stored locally in history records.

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

- You can clear all history from the History tab in Options.
- You can disable history recording in Options.
- You can delete individual history entries at any time.
- You can delete Notion targets from Options at any time.
- You can uninstall the extension to remove all local data.

### 9. Children's Privacy

ClipMate is not intended for use by children under 13.

### 10. Changes to This Policy

We may update this policy. Changes will be reflected in the extension's documentation and the privacy policy URL.

### 11. Contact

For questions about this privacy policy, please open an issue at: https://github.com/AlistenerA/clipmate/issues

---

## 中文版本 | Chinese

ClipMate 是一款浏览器扩展，不收集、不存储、不传输您的任何个人信息到外部服务器。

- **Notion Token**：仅存储在浏览器本地，仅用于向 Notion API 发起认证请求。
- **用户设置**：本地存储，从不传输到外部服务器。
- **本地剪藏历史**：仅用于扩展内的历史 UI，不发送到任何服务器。

当您主动保存内容时，数据直接从浏览器发送到 Notion API。不使用 AI、不追踪行为、不收集分析数据、不执行远程代码。
