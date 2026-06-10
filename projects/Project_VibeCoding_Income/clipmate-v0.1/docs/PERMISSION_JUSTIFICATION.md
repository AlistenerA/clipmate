# PERMISSION_JUSTIFICATION.md — ClipMate v0.1 权限说明

> 上架 Edge Add-ons / Chrome Web Store 时提交的权限使用说明。

---

## 权限清单

| 权限 | 类型 |
|------|------|
| `activeTab` | permissions |
| `storage` | permissions |
| `https://api.notion.com/*` | host_permissions |
| `<all_urls>` (content_scripts) | 内容脚本注入范围 |

---

## 1. `activeTab`

**用途**：当用户点击工具栏图标时，获取当前活动标签页的 URL 和标题，用于判断剪藏来源。

**不使用** `tabs` 权限的原因：
- `activeTab` 仅在用户主动点击扩展图标后才授予当前标签页权限
- 不需要持久访问所有标签页
- 最小权限原则 — 用户无需授予"读取浏览历史"级别的 `tabs` 权限

**代码位置**：`src/popup/hooks/useCurrentTab.ts` 使用 `chrome.tabs.query({ active: true, currentWindow: true })`

---

## 2. `storage`

**用途**：将用户设置持久化到浏览器本地存储：
- Notion Token（用户手动配置的 Integration Token）
- Notion Page ID（用户选择的目标页面 ID）
- 默认标签
- 历史记录开关
- 上次剪藏草稿（防止意外关闭 Popup 丢失编辑内容）

**不使用** `sync` 存储的原因：
- `chrome.storage.sync` 限制 100KB，不足以保存剪藏草稿
- 早期不跨设备同步设置

**代码位置**：`src/shared/storage/storage.ts` 使用 `chrome.storage.local`

---

## 3. `https://api.notion.com/*`

**用途**：通过 Background Service Worker 调用 Notion API，实现以下功能：
- `PATCH /v1/blocks/{page_id}/children` — 将剪藏的网页内容追加到用户的 Notion 页面

**不使用** 更宽泛的 `https://*/*` 的原因：
- 限制仅 Notion API 域名
- 用户安装时可以清楚看到扩展只访问 Notion 服务

**代码位置**：`src/platforms/notion/client.ts`、`src/background/handlers/notionHandler.ts`

---

## 4. `content_scripts` matches `<all_urls>`

**用途**：在用户访问的所有页面注入 Content Script，实现以下功能：
- 提取当前页面正文（通过 Mozilla Readability 算法）
- 提取用户选中文字（选区模式）
- 解析页面元数据（标题、描述、站点名）
- HTML 转 Markdown
- Fallback 提取（Readability 失败时降级为 body.innerText）

**使用** `<all_urls>` 而非特定域名列表的原因：
- 用户可能在任何网站（博客、文档、新闻、内部知识库）上剪藏内容
- 无法预先枚举所有用户可能访问的域名
- 扩展仅在用户主动点击图标时才执行内容提取，不会在后台静默运行

**Content Script 不会做的事**：
- 不会读取页面 cookie 或 localStorage
- 不会修改页面 DOM（仅读取）
- 不会向第三方发送数据
- 不会在该页面自行执行网络请求

---

## 5. 不执行远程代码

ClipMate 的所有代码均打包在扩展包内，不通过 `<script src="https://...">` 或 `eval()` 加载外部脚本。

---

## 6. 不收集分析数据

ClipMate 不在任何位置嵌入统计 SDK、不发送遥测数据、不收集用户行为数据。用户数据（Token、剪藏内容）仅存储在本地 `chrome.storage.local` 中，通过用户手动操作发送到用户自己的 Notion 工作区。

---

## 隐私政策补充说明

详见 `PRIVACY_POLICY_DRAFT.md`。
