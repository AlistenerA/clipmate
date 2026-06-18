# LINK_CARD_QA.md — ClipMate v0.4 Link Card Preview 手动 QA

## 测试目标

验证 Link Card Preview Core 功能的安全性、正确性和隐私合规性。

## 加载扩展

1. 在 Edge/Chrome 中打开 `edge://extensions` 或 `chrome://extensions`
2. 开启"开发者模式"
3. 点击"加载解压缩的扩展"，选择 `clipmate-v0.4/dist/` 目录

## 隐私注意事项

- 不记录真实 token、page id、账号信息
- 不在测试报告中保存真实页面内容
- 不保存完整 Markdown、正文、评论、选区

## 手动测试场景

### 场景 1：当前页面 link card

- 操作：在任意文章页点击 ClipMate 图标
- 预期：Popup 正常打开，不崩溃
- 不应出现：Link Card 自动弹出或改变现有保存行为

### 场景 2：选中链接 link card

- 操作：在页面选中一个链接文本
- 预期：选区行为正常，不崩溃
- 不应出现：自动抓取链接目标内容

### 场景 3：导航页 link card

- 操作：在搜索页或导航页使用 ClipMate
- 预期：现有行为不变（navigation summary 正常触发）
- 不应出现：Link Card 取代 navigation summary

### 场景 4：manual input link card

- 操作：通过代码直接调用 `buildLinkCardDraft({ url, source: 'manual-input' })`
- 预期：返回安全的 LinkCardDraft
- 不应出现：访问网络

### 场景 5：非法 URL

- 操作：调用 `buildLinkCardDraft({ url: 'javascript:alert(1)', source: 'manual-input' })`
- 预期：返回 null
- 不应出现：异常抛出

### 场景 6：缺少 title/description

- 操作：调用 `buildLinkCardDraft({ url: 'https://example.com', source: 'current-page' })`
- 预期：title 为 domain
- 不应出现：空 title

### 场景 7：有 siteIcon/themeColor

- 操作：调用带 siteIconUrl 和 themeColor 的 draft
- 预期：安全值保留
- 不应出现：接受不安全的值（javascript: 等）

### 场景 8：无 siteIcon/themeColor

- 操作：调用不带 visual 数据的 draft
- 预期：字段缺失
- 不应出现：自动生成值

## 隐私检查

- [ ] 不访问目标链接内容
- [ ] 不抓取远程页面内容
- [ ] 不保存完整 DOM/HTML
- [ ] 不保存正文/选区/评论全文
- [ ] 不保存完整 Markdown/settings/request
- [ ] 不访问 chrome.storage
- [ ] 不访问网络 (fetch/XMLHttpRequest)
- [ ] 不创建 iframe/img 预加载

## 已知限制

- Popup UI 未实现 Link Card 展示
- Notion 专用 card block 未实现
- History UI 未集成
- 不做远程 URL preview
- 不访问目标 URL 做网页抓取
- siteIconUrl/themeColor 来自 parseMetadata 或手动输入，不验证远程可访问性

## QA 结果记录表

| 场景 | 通过 | 备注 |
|------|:---:|------|
| 场景 1：当前页面 link card | | |
| 场景 2：选中链接 link card | | |
| 场景 3：导航页 link card | | |
| 场景 4：manual input link card | | |
| 场景 5：非法 URL | | |
| 场景 6：缺少 title/description | | |
| 场景 7：有 siteIcon/themeColor | | |
| 场景 8：无 siteIcon/themeColor | | |
| 隐私检查 | | |
