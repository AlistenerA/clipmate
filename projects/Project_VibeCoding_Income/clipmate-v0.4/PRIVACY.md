# PRIVACY.md — ClipMate v0.4 Privacy Policy

> 上架 Edge Add-ons / Chrome Web Store 时必须提供公开可访问的隐私政策 URL。建议将此内容托管到 GitHub Pages。

---

## Privacy Policy for ClipMate

**Last updated: [DATE]**

### 1. Information We Collect

ClipMate does **not** collect, store, or transmit any personal information to external servers. All data remains on your device:

- **Notion Integration Token**: Stored locally in your browser using `chrome.storage.local`. This Token is only used to authenticate API requests to Notion on your behalf. It is never sent to any server other than Notion's official API (`https://api.notion.com`).

- **User Settings**: Stored locally in your browser. Includes configured Notion target pages, default tags, history settings, and UI settings. Never transmitted externally.

- **Local Clipping History**: Stored locally in your browser. Each history entry includes: page title, URL, tags, note preview, content preview, full Markdown, word count, target name snapshot, save status, error codes, site name, favicon URL, and theme color. This data is used only for the history UI within the extension and is never sent to any server.

### 2. How We Use Information

- Your Notion Token is used exclusively to call the Notion API to save clipped content to your own Notion workspace.
- Your settings and tags are used only to personalize your clipping experience within the extension.
- Your clipping history is used only for local search, copy, retry, and review within the extension's History UI.

### 3. What Data Is Sent to Notion

When you actively trigger a clipping action, ClipMate sends the following data directly from your browser to Notion's API (`https://api.notion.com`):

- The page **title** and **URL** of the webpage you are clipping
- The **tags** you entered in the extension
- The **notes** you entered in the extension
- The **extracted body text** of the webpage

This data is sent only when you initiate the action. ClipMate does not intercept, store, or log this content on any intermediate server.

### 4. Data Storage

All data is stored **locally** in your browser using Chrome's Storage API (`chrome.storage.local`). No data is stored on any remote server operated by ClipMate. You can clear all local data by removing the extension from your browser, or by clearing your browser's extension storage.

### 5. Third-Party Services

ClipMate integrates with **Notion API** (`https://api.notion.com`). When you clip content to Notion, the data listed in Section 3 is sent directly to Notion's servers. This is the only external service the extension communicates with.

### 6. What We Do NOT Do

- **We do not sell** user data to any third party.
- **We do not track** your browsing activity or behavior.
- **We do not collect** analytics, telemetry, or usage statistics.
- **We do not use** advertising identifiers or cookies.
- **We do not execute** remote code — all extension code runs locally in your browser.
- **We do not collect** personally identifiable information (PII).
- **We do not process** user content with AI services or external language models.
- **We do not sync** data to the cloud.
- **We do not call** third-party favicon or API services.
- **We do not access** target URL content (Link Card is built from current page metadata only, without network requests).
- **We do not validate** favicon URLs by network request (Site Visual extracts from current Document DOM only).
- **We do not persist** IntentSnapshot — intent detection runs in tab memory only and is discarded on tab close.

### 7. v0.4 Privacy Additions

- **IntentSnapshot**: User intent detection signals (page type, selection context, visible context statistics) are computed in-memory per tab and **never persisted** to storage. No full text, comments, or DOM are saved.
- **Site Visual**: Favicon URLs and theme colors are extracted from the current page's DOM (`<link rel>` and `<meta name="theme-color">` elements). No network requests are made to validate or download icons.
- **Link Card**: Link previews are built from current page metadata or manual user input only. No network requests are made to the target URL. No remote page content is fetched.
- **Navigation Summary**: Links extracted from navigation/search pages are current-page DOM only (`<a href>` elements). Target link content is never fetched.
- **Comment Selection**: Only user-selected text is saved. Full comment threads or forum pages are never auto-scraped.
- **No complete DOM/HTML**, comment full text, or article full text is persisted to any durable structure.

### 8. Data Security

- Your Notion Token is never exposed in plain text in the extension UI (masked input).
- All API communications with Notion use HTTPS encryption.
- The extension runs entirely in your browser with no remote server.
- ClipMate does NOT output Token, full body text, full notes, or complete Markdown to the browser console.

### 9. User Controls

- You can **clear all history** from the History tab in Options.
- You can **disable history recording** in Options.
- You can **delete individual history entries** at any time.
- You can **delete Notion targets** from Options at any time.
- You can **uninstall the extension** to remove all local data.

### 10. Children's Privacy

ClipMate is not intended for use by children under 13.

### 11. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected in the extension listing and this document.

### 12. Contact

For privacy-related questions, please contact us via the GitHub repository issues page.
