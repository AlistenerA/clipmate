# STORE_LISTING_DRAFT.md — ClipMate v0.1 商店文案定稿

> 上架 Edge Add-ons / Chrome Web Store 时填写。所有字段需最终确认。

---

## 基本信息

| 字段 | 内容 |
|------|------|
| Extension Name | ClipMate - 网页剪藏助手 |
| English Name | ClipMate - Web Clipper for Notion |
| Category | Productivity |
| Visibility | Public |
| Default Locale | zh_CN |

---

## 简短描述（中文，≤132 字符）

一键保存网页到 Notion。支持正文提取、选中剪藏、标签备注、Markdown 复制。比官方剪藏更好用。

---

## 简短描述（英文备选，≤132 字符）

Save web pages to Notion in one click. Full-page extraction, selection clipping, tags & notes, and Markdown copy. A better alternative to the official clipper.

---

## 详细描述（中文）

### 简介

ClipMate 是一款轻量级浏览器扩展，帮你把任何网页内容快速保存到 Notion。基于 Mozilla Readability 引擎自动提取正文，支持全页和选区两种模式，剪藏时可添加标签和备注，还可一键复制 Markdown 到剪贴板。

### 核心功能

- **一键剪藏**：点击工具栏图标，自动提取网页正文，保存到你的 Notion 页面。
- **智能正文提取**：基于 Mozilla Readability 引擎，自动识别文章标题和正文，去除广告和侧边栏。
- **选择性剪藏**：选中网页上的任意文字，一键提取到 Notion。告别「全页保存再手动删除」。
- **标签和备注**：剪藏时可以添加标签和备注，保存后在 Notion 中清晰分类。
- **复制 Markdown**：一键将剪藏内容转为完整 Markdown（含标题、来源 URL、标签、备注、分割线、正文），粘贴到任何编辑器。
- **轻量无侵入**：不收集任何用户数据，所有设置本地存储，无远程服务器。

### 为什么选择 ClipMate？

Notion 官方 Web Clipper 有 100 万+ 用户，但评分仅 3.3 分 — 用户普遍抱怨：
- 不支持选区剪藏（必须保存全页再手动删）
- 不能添加标签
- 正文提取经常失败或混入广告

ClipMate 专为解决这些痛点而生。

### 使用方法

1. 安装扩展后，右键点击图标进入选项
2. 填写你的 Notion Integration Token 和目标页面的 Page ID
3. 打开任意网页，点击图标剪藏全文，或选中文字剪藏片段

### 隐私

ClipMate 不收集任何个人数据，不使用远程服务器，所有数据仅存储在浏览器本地。详见隐私政策。

### v0.1 当前限制

- 仅支持 Notion，不支持飞书、语雀等平台
- 正文保存到 Notion 为纯文本段落，不保留 Markdown 行内格式（粗体/斜体）；可通过「复制 Markdown」获取完整格式
- 使用手动 Token 配置（需去 Notion 创建 Integration），不支持 OAuth 一键登录
- 不含 AI 摘要、AI 标签、OCR、截图回退等高级功能

---

## 搜索关键词（最多 7 个，每个 ≤30 字）

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
| `activeTab` | 用户点击图标时获取当前标签页的 URL 和标题 |
| `storage` | 本地保存 Token、Page ID、默认标签、剪藏草稿等设置 |
| `host_permissions: https://api.notion.com/*` | 仅用于调用 Notion API 保存剪藏内容 |
| `content_scripts matches <all_urls>` | 在用户访问的任何网页注入提取脚本（仅在用户点击图标时执行） |

---

## Single Purpose Description

ClipMate 的唯一目的是帮助用户将网页内容保存到 Notion 笔记平台。所有权限均围绕这一目的：访问网页内容以提取正文（activeTab / content_scripts）、保存用户设置（storage）、调用 Notion API 完成保存（host_permissions）。

---

## Remote Code Declaration

ClipMate 不包含、不执行、不加载任何远程代码。所有 JavaScript 代码均打包在扩展内，完全在用户浏览器本地运行。

---

## Data Usage

| 数据类型 | 是否收集 | 说明 |
|----------|:---:|------|
| 个人信息 | 否 | - |
| 网页内容 | 否 | 仅在用户主动触发时直接发送到 Notion API |
| Notion Token | 存储本地 | 仅用于认证 Notion API，不出站到其他服务器 |
| 用户设置 | 存储本地 | 个性化体验 |
| 标签/备注 | 存储本地 | 剪藏分类 |

---

## Notes for Certification（提交审核时填写）

如需测试 ClipMate 的剪藏功能：

1. 在 Options 页面填写有效的 Notion Integration Token（可在 https://www.notion.so/my-integrations 创建）
2. 填写目标 Notion 页面的 Page ID（从页面 URL 中提取的 32 位十六进制 ID）
3. 确保 Integration 已添加为目标页面的 Connection（页面右上角 `⋯` → 连接 → 添加）
4. 在任意公开网页（如博客文章）点击 ClipMate 图标，填写标签和备注后点击「保存到 Notion」

---

## 截图建议

建议准备 4-6 张截图展示核心流程：

1. **Popup 界面**：展示全文模式下提取的正文、标签、备注、操作按钮
2. **选区模式**：展示在网页选中文字后的 Popup 状态
3. **Notion 保存结果**：展示内容成功保存到 Notion 页面后的效果（callout 备注、标签、分段正文）
4. **设置页面**：展示 Options 页面的 Token、Page ID、默认标签等配置项
5. **复制 Markdown 结果**：展示粘贴到编辑器后的完整 Markdown 结构
6. **错误提示**：展示 Token 缺失或授权失败时的友好中文提示

截图尺寸：640×480 或 1280×800（仅 PNG 格式）
