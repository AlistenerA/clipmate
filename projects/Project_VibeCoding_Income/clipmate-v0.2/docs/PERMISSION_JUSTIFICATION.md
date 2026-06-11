# PERMISSION_JUSTIFICATION.md — ClipMate v0.1 权限使用说明

> 上架 Edge Add-ons / Chrome Web Store 时提交的权限使用说明。
> 本说明对应 `manifest.config.ts` 中的实际权限配置。

---

## 实际权限清单

| 权限 | 类型 | 配置值 |
|------|------|--------|
| `activeTab` | permissions | - |
| `storage` | permissions | - |
| `https://api.notion.com/*` | host_permissions | - |
| `<all_urls>` | content_scripts → matches | - |

> **注意**：`content_scripts matches: ['<all_urls>']` 是在用户访问的任何网页注入 Content Script 的声明，**不是** `host_permissions`。两者在 Edge Partner Center 中有不同的审核标准。

---

## 1. `activeTab`

**用途**：当用户点击 ClipMate 工具栏图标时，获取当前活动标签页的 URL 和标题。

**实现细节**：
- 使用 `chrome.tabs.query({ active: true, currentWindow: true })` 获取当前标签页
- 仅在用户主动点击图标后才授予权限，不会在后台访问标签页

**不使用 `tabs` 权限的原因**：
- `activeTab` 是最小权限策略的选择 — 仅在用户主动操作时授权
- `tabs` 权限允许扩展读取所有标签页的 URL，审核更严格

**代码位置**：`src/popup/hooks/useCurrentTab.ts`

---

## 2. `storage`

**用途**：将用户设置持久化到浏览器本地存储。

**存储内容**：
- Notion Integration Token（用户手动配置）
- Notion Page ID（用户选择的目标页面 ID）
- 默认标签
- 标签历史开关
- 剪藏草稿（防止意外关闭 Popup 丢失编辑内容）

**实现细节**：
- 使用 `chrome.storage.local`（容量 5MB+，满足草稿存储需求）
- 不使用 `chrome.storage.sync`（限制 100KB，不足以保存草稿）
- 所有数据仅存储在用户本地浏览器，不发送到任何服务器

**代码位置**：`src/shared/storage/storage.ts`

---

## 3. `host_permissions: https://api.notion.com/*`

**用途**：允许 Background Service Worker 调用 Notion 官方 API。

**调用的 API**：
- `PATCH /v1/blocks/{page_id}/children` — 将用户剪藏的内容追加到指定 Notion 页面

**限制说明**：
- 权限范围仅限 `api.notion.com`，不能访问其他域名
- 仅在用户主动点击「保存到 Notion」时发起请求
- 不会在后台自动发送请求
- 仅使用 HTTPS 加密通信

**不使用更宽泛域名（如 `https://*/*`）的原因**：
- 最小权限原则：用户可清楚看到扩展只访问 Notion 服务
- 降低审核风险

**代码位置**：`src/platforms/notion/client.ts`、`src/background/handlers/notionHandler.ts`

---

## 4. `content_scripts matches: <all_urls>`

**用途**：在用户访问的网页注入 Content Script，用于提取网页内容。

**Content Script 功能**：
- 提取当前页面正文（通过 Mozilla Readability 算法）
- 提取用户选中文字（选区模式）
- 解析页面元数据（标题、描述）
- HTML 转 Markdown
- Fallback 提取（Readability 失败时降级为 `body.innerText`）

**使用 `<all_urls>` 而非特定域名列表的原因**：
- 用户可能在任何网站（博客、文档、新闻、内部知识库）上剪藏内容
- 无法预先枚举所有用户可能访问的域名
- 这是网页剪藏类扩展的标准做法（Notion 官方 Web Clipper 同样使用 `<all_urls>`）

**Content Script 的约束（审核说明重点）**：
- ✅ **仅在用户点击图标时执行提取**，不会在后台静默扫描页面
- ✅ **不会读取**页面 cookie 或 localStorage
- ✅ **不会修改**页面 DOM（仅读取，不写入）
- ✅ **不会向第三方发送**页面数据
- ✅ **不会自行发起**网络请求（所有 API 调用由 Background Service Worker 完成）
- ✅ Content Script 中的 `console.log` 仅输出脱敏后的状态信息（模式、字数），不输出正文全文

**代码位置**：`src/content/index.ts`

---

## 5. 不执行远程代码声明

ClipMate 的所有 JavaScript 代码均通过 `vite build` 打包在扩展包内，不通过以下方式加载外部代码：
- 不使用 `<script src="https://...">` 加载外部脚本
- 不使用 `eval()` 或 `new Function()`
- 不使用动态 `import()` 加载远程模块
- 不通过 `chrome.scripting.executeScript` 注入外部来源的代码

---

## 6. 不收集分析数据声明

ClipMate 不嵌入任何统计 SDK、不发送遥测数据、不收集用户行为数据。具体地：
- 无 Google Analytics、Firebase、Mixpanel 等统计服务
- 无 Sentry、Bugsnag 等错误上报服务
- 无广告 SDK 或追踪像素
- 用户数据（Token、设置、剪藏草稿）仅存储在本地 `chrome.storage.local`
- 用户剪藏内容仅通过用户手动操作发送到用户自己的 Notion 工作区

---

## 审核补充说明

如果需要向审核人员说明，可以使用以下话术：

> ClipMate 的 `<all_urls>` content_scripts 是为了支持用户在任意网站进行网页剪藏。Content Script 仅在用户主动点击扩展图标时才执行正文提取，不会在后台持续运行。提取的内容由 Background Service Worker 通过 HTTPS 直接发送到用户自己的 Notion API，不经过任何第三方服务器。所有用户配置和 Token 仅存储在浏览器本地 storage 中。
