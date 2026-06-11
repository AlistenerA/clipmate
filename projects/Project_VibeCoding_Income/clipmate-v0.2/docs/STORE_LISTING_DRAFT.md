# STORE_LISTING_DRAFT.md — ClipMate v0.2 商店文案定稿

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

一键保存网页到 Notion。支持全文/选区剪藏、多目标管理、本地剪藏历史、Markdown 复制。比官方剪藏更好用的替代品。

---

## 简短描述（英文备选，≤132 字符）

Save web pages to Notion in one click. Full-page & selection clipping, multiple targets, local history, Markdown copy. A better alternative to the official clipper.

---

## 详细描述（中文）

### 简介

ClipMate 是一款轻量级浏览器扩展，帮你把任何网页内容快速保存到 Notion。基于 Mozilla Readability 引擎自动提取正文，支持全页和选区两种模式，剪藏时可添加标签和备注，还可一键复制 Markdown 到剪贴板。

### 核心功能

- **智能剪藏**：基于 Mozilla Readability 引擎，自动提取网页正文，去除广告和侧边栏。支持全文和选区两种模式。
- **多 Notion 目标管理**：可在 Options 中管理多个 Notion 目标页面，Popop 保存时下拉选择目标，不同内容保存到不同页面。
- **本地剪藏历史**：自动记录每次剪藏的标题、URL、标签、正文。可搜索、复制 Markdown、删除单条或清空全部。
- **重试保存**：保存失败的历史记录可重新选择目标保存，避免内容丢失。
- **真实网站图标**：历史条目优先显示页面真实 favicon，便于快速识别来源站点。
- **标签和备注**：剪藏时可添加标签和备注，保存后在 Notion 中清晰分类。
- **复制 Markdown**：一键将剪藏内容转为完整 Markdown（含标题、来源 URL、标签、备注、分割线、正文），粘贴到任何编辑器。
- **轻量无侵入**：不收集任何用户数据，所有设置和历史本地存储，无远程服务器。

### 为什么选择 ClipMate？

Notion 官方 Web Clipper 有 100 万+ 用户，但评分仅 3.3 分 — 用户普遍抱怨：
- 不支持选区剪藏（必须保存全页再手动删）
- 不能添加标签
- 正文提取经常失败或混入广告
- 只能保存到单一 Notion 页面
- 没有历史记录和重试

ClipMate 专为解决这些痛点而生。

### 使用方法

1. 安装扩展后，右键点击图标进入选项
2. 填写你的 Notion Integration Token
3. 添加 Notion 目标页面（可添加多个，设置默认目标）
4. 打开任意网页，点击图标剪藏全文，或选中文字剪藏片段

### 隐私

ClipMate 不收集任何个人数据，不使用远程服务器，不调用 AI 服务，所有数据仅存储在浏览器本地。详见隐私政策。

### v0.2 当前限制

- 仅支持 Notion，不支持飞书、语雀等平台
- 正文保存到 Notion 为纯文本段落，不保留 Markdown 行内格式（粗体/斜体）；可通过「复制 Markdown」获取完整格式
- 使用手动 Token 配置（需去 Notion 创建 Integration），不支持 OAuth 一键登录
- 不含 AI 摘要、AI 标签、OCR、截图回退等高级功能
- 不支持 Notion Database 属性映射

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
| `storage` | 本地保存 Token、Notion 目标配置、默认标签、剪藏草稿、历史记录 |
| `host_permissions: https://api.notion.com/*` | 仅用于调用 Notion API 保存剪藏内容 |
| `content_scripts matches <all_urls>` | 在用户访问的任何网页注入提取脚本（仅在用户点击图标时执行） |

**v0.2 未新增权限**。多目标管理、本地历史、搜索、重试、favicon 提取等功能均在现有权限内实现。网站图标从页面 DOM 读取，不调用第三方 favicon API。

---

## Single Purpose Description

ClipMate 的唯一目的是帮助用户将网页内容保存到 Notion 笔记平台。所有权限均围绕这一目的：访问网页内容以提取正文（activeTab / content_scripts）、保存用户设置和历史数据（storage）、调用 Notion API 完成保存（host_permissions）。

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
| 剪藏历史 | 存储本地 | 包含标题/URL/标签/正文/保存状态等，不发送到任何服务器 |

---

## Notes for Certification（提交审核时填写）

如需测试 ClipMate 的完整功能：

1. 在 Options 页面填写有效的 Notion Integration Token（可在 https://www.notion.so/my-integrations 创建）
2. 添加 Notion 目标页面（可粘贴完整 Notion URL，自动提取 Page ID）
3. 确保 Integration 已添加为目标页面的 Connection（页面右上角 `⋯` → 连接 → 添加）
4. 在任意公开网页点击 ClipMate 图标，选择目标后点击「保存到 Notion」
5. 在 Options →「剪藏历史」标签页可查看保存记录、搜索、复制 Markdown、删除
6. 可使用无效 Token 测试失败保存和重试流程

---

## 截图建议

建议准备 4-6 张截图展示核心流程：

1. **Popup 主界面**：展示全文模式下提取的正文、标签、备注、目标选择下拉框、操作按钮
2. **Options 设置页 - 多目标管理**：展示 Notion Target 列表、添加/编辑/删除/设默认操作
3. **剪藏历史 UI**：展示历史列表（含 favicon、搜索、状态标签、左右色条、匹配 tag）
4. **Notion 保存结果**：展示内容成功保存到 Notion 页面后的效果（callout 备注、标签、分段正文）
5. **复制 Markdown 结果**：展示粘贴到编辑器后的完整 Markdown 结构
6. **错误提示**：展示 Token 缺失或授权失败时的友好中文提示

截图尺寸：640×480 或 1280×800（仅 PNG 格式）
