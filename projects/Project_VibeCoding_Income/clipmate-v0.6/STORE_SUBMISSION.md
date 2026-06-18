# STORE_SUBMISSION.md — ClipMate v0.4 商店提交材料

> 上架 Edge Add-ons / Chrome Web Store 时填写。v0.4 发布候选。

---

## 基本信息

| 字段 | 内容 |
|------|------|
| Extension Name | ClipMate - 网页剪藏助手 |
| English Name | ClipMate - Web Clipper for Notion |
| Version | 0.4.0 |
| Category | Productivity |
| Visibility | Public |
| Default Locale | zh_CN |

---

## 简短描述（中文，≤132 字符）

一键保存网页到 Notion。支持全文/选区剪藏、多目标管理、Markdown 多格式输出、站点适配与场景模式、本地历史。

---

## 简短描述（英文备选，≤132 字符）

Save web pages to Notion in one click. Full-page & selection clipping, multiple targets, Markdown profiles, site profiles & scenario modes, local history.

---

## 详细描述（中文）

### 简介

ClipMate 是一款轻量级浏览器扩展，帮你把网页内容快速保存到 Notion，或复制为 Markdown。v0.4 定位为站点适配与场景模式版，新增页面类型检测、站点规则引擎、意图信号采集、导航摘要、评论选区、站点视觉元数据、链接卡片预览等能力。

### 核心功能

- **智能剪藏**：基于 Mozilla Readability 引擎，自动提取正文。支持全文和选区两种模式。v0.3 起新增 Article Boundary Guard、内容保真增强。
- **站点适配与场景模式 (v0.4)**：
  - Page Type Detector：自动识别文章/搜索/导航/论坛/视频/AI 对话 7 种页面类型
  - Site Profile Engine：19 个站点结构化规则，按 domain/URL pattern 匹配
  - Navigation Summary：搜索结果页/导航页生成安全摘要而非噪音提取
  - Comment Selection：7 种选区上下文识别，不抓取整页评论
  - Site Visual：favicon/themeColor 安全提取与缓存
  - Link Card Preview：链接卡片 builder 与 Markdown 序列化
- **内容保真增强 (v0.3)**：Markdown Target Profiles、LaTeX 公式保留、Code Block Cleaner、Image/Link/Table Normalization、Safe Markdown Preview。
- **多 Notion 目标管理**：管理多个 Notion 目标页面，保存时下拉选择。
- **本地剪藏历史**：自动记录、搜索、复制、重试。可关闭历史记录。
- **标签和备注**：剪藏时可添加，Notion 中清晰分类。
- **轻量无侵入**：不收集用户数据，不接入 AI API，所有数据本地存储。

### 隐私

ClipMate 不收集任何个人数据，不使用远程服务器，不接入 AI API，所有数据仅存储在浏览器本地。不远程加载或执行 JavaScript。详见隐私政策。

### v0.4 当前限制

- 仅支持 Notion，不支持飞书、语雀等平台
- 手动 Token 配置（非 OAuth 登录）
- 不含 AI 摘要、AI 标签、OCR、截图回退
- 不支持 Notion Database 属性映射
- Link Card Popup UI / History UI 未实现（deferred to v0.5）
- Tag Search UX / Better History Config 延后到 v0.5
- SiteVisual cache 未实际持久化到 chrome.storage

---

## 搜索关键词（最多 7 个）

1. 网页剪藏
2. Notion
3. Markdown
4. 剪藏
5. Web Clipper
6. 内容提取
7. 笔记

---

## 权限使用说明

| 权限 | 用途 |
|------|------|
| `storage` | 本地保存 Token、设置、历史记录 |
| `activeTab` | 用户点击图标时获取当前标签页 URL |
| `https://api.notion.com/*` | 调用 Notion API 保存剪藏内容 |
| `<all_urls>` (content_scripts) | 在用户访问的页面注入 Content Script 提取正文 |

**v0.4 无权限变更。** 所有新增功能（Page Type Detector、Site Profile Engine、Intent Signal Collector、Navigation Summary、Comment Selection、Site Visual、Link Card Preview）均在现有权限范围内实现。

---

## Remote Code 声明

**不远程加载或执行 JavaScript。** 所有扩展代码打包在本地 dist/ 中，无远程 `<script>` 标签，无 `eval()` 加载远程代码，无 CDN 依赖。

---

## Data Usage 说明

- 用户数据（Token、设置、历史记录）仅存储在浏览器本地 `chrome.storage.local`
- 剪藏内容仅在用户主动触发时发送到 Notion 官方 API (`https://api.notion.com`)
- 不收集分析数据、遥测、崩溃报告
- v0.4 IntentSnapshot 在 tab 内存中计算，不持久化
- v0.4 Site Visual 仅读取当前页面 DOM，不发起网络请求
- v0.4 Link Card 基于当前页面 metadata 构建，不访问目标 URL
- v0.4 Navigation Summary 仅提取当前页面 DOM 中 `<a href>`，不抓取目标链接内容

---

## Testing Notes（认证测试指引）

1. 安装扩展后，首次打开需要配置 Notion Integration Token（在 Options 页面）
2. 如需测试 Notion 保存，请使用测试用 Notion Integration Token 和 Page ID
3. 不依赖登录系统
4. 不依赖外部服务器
5. 所有功能离线可用（Notion 保存除外）

---

## Known Limitations（已知限制）

- 仅支持 Notion 平台
- 手动 Token 配置，不支持 OAuth
- 不含 AI/OCR/付费功能
- Link Card Popup UI 未实现
- Tag Search UX 延后到 v0.5
- 部分站点 DOM 适配依赖 seed profile selector hints，需真实浏览器手动验证

---

## Manual QA Status

⚠️ **待用户真实浏览器验证**。自动化测试 1383 tests 全部通过，lint 0，build success。手动 QA 清单见 `docs/MANUAL_QA.md`。各项尚未执行真实浏览器测试。

## 隐私政策 URL

待托管到 GitHub Pages 后填写。

## Support Contact

GitHub Issues: https://github.com/AlistenerA/clipmate/issues
