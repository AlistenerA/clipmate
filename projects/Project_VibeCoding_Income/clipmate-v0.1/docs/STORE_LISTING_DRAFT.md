# STORE_LISTING_DRAFT.md — ClipMate v0.1 商店文案草稿

> 上架 Edge Add-ons / Chrome Web Store 时填写。所有字段需最终确认。

---

## 基本信息

| 字段 | 内容 |
|------|------|
| Extension Name (中文) | ClipMate - 网页剪藏助手 |
| Extension Name (English) | ClipMate - Web Clipper for Notion |
| Category | Productivity |
| Visibility | Public |
| Default Locale | zh_CN |

---

## 简短描述（132字符以内，中文）

一键保存网页到 Notion，支持正文提取、选中剪藏、Markdown 复制。

---

## 简短描述（英文备选）

Save web pages to Notion in one click. Supports article extraction, selection clipping, and Markdown copy.

---

## 详细描述（中文）

ClipMate 是一款轻量级的网页剪藏浏览器扩展，帮助你将任何网页内容快速保存到 Notion。

**核心功能：**

- **一键剪藏**：点击工具栏图标，自动提取网页正文，保存到你的 Notion 页面。
- **智能正文提取**：基于 Mozilla Readability 引擎，自动识别文章标题、作者、正文，去除广告和侧边栏。
- **选择性剪藏**：选中网页上的任意文字，右键即可剪藏到 Notion。告别"全页保存再手动删除"。
- **标签和备注**：剪藏时可以添加标签和备注，方便后续检索和分类。
- **复制 Markdown**：一键将提取的正文转为 Markdown 格式复制到剪贴板，直接粘贴到任何编辑器。
- **轻量无侵入**：不收集任何用户数据，所有设置本地存储，Notion Token 仅用于 API 调用。

**为什么选择 ClipMate？**

Notion 官方 Web Clipper 有 100 万+ 用户，但评分仅 3.3 分——因为它不支持选出剪藏、不能加标签、正文提取经常失败。ClipMate 专为解决这些问题而生。

**使用方法：**

1. 安装扩展后，右键点击图标进入"选项"
2. 填写你的 Notion Integration Token 和目标 Page ID
3. 打开任意网页，点击图标或选中文字右键，一键剪藏

**隐私保护：**

ClipMate 不收集任何个人数据，不使用远程服务器，所有数据仅存储在浏览器本地。

---

## 搜索关键词（最多 7 个，每个最多 30 字）

1. 网页剪藏
2. Notion
3. Web Clipper
4. Markdown
5. 笔记
6. 知识管理
7. 剪藏插件

---

## 权限说明（Permission Justification）

| 权限 | 用途 |
|------|------|
| `storage` | 本地保存用户设置、Notion Token、标签历史 |
| `activeTab` | 获取当前标签页的网页内容用于剪藏 |
| `scripting` | 注入 Content Script 以提取网页正文 |
| `tabs` | 获取当前标签页标题和 URL |
| `host_permissions: <all_urls>` | 允许在任何网页上执行剪藏操作 |

---

## Single Purpose Description

ClipMate 的核心功能是帮助用户将网页内容保存到 Notion 笔记平台。所有权限均围绕这一核心功能——访问网页内容以提取正文，使用 storage 保存用户设置，调用 Notion API 完成保存。

---

## Remote Code Declaration

ClipMate 不包含、不执行、不加载任何远程代码。所有 JavaScript 代码均打包在扩展中，本地执行。

---

## Data Usage

| 数据类型 | 是否收集 | 用途 |
|----------|:---:|------|
| 个人信息 | 否 | - |
| 网页内容 | 否（直接发送到 Notion API）| 用户主动触发剪藏 |
| Notion Token | 是（本地存储）| 认证 Notion API |
| 用户设置 | 是（本地存储）| 个性化体验 |
| 标签/备注 | 是（本地存储）| 剪藏分类 |

---

## Notes for Certification（提交审核时填写）

如需测试 ClipMate 的剪藏功能：
1. 在 Options 页面填写有效的 Notion Integration Token（可在 https://www.notion.so/my-integrations 创建）
2. 填写目标 Notion Page ID
3. 在任意网页点击 ClipMate 图标触发剪藏
