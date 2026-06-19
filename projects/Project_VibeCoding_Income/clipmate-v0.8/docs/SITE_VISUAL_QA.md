# SITE_VISUAL_QA.md — ClipMate v0.4 Site Visual 人工测试

> 本文档用于 v0.4 Session 5 Site Icon / Theme Cache 的人工 QA。
> 测试人员：用户（请勿填写真实姓名）
> 测试日期：____年__月__日

---

## 1. 测试目标

验证 `siteVisualExtractor` 的安全提取逻辑和 `siteVisualCache` 的合并策略在真实浏览器中行为正确：

- favicon URL 按正确优先级提取
- themeColor 安全归一化
- 危险协议被拒绝
- cache strategy 的 merge 和 TTL 逻辑正确

---

## 2. 加载扩展

### Edge

1. 打开 `edge://extensions/`
2. 开启"开发人员模式"
3. 点击"加载解压缩的扩展"
4. 选择 `clipmate-v0.4/dist/` 目录
5. 确认 ClipMate 图标出现在工具栏

### Chrome

1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `clipmate-v0.4/dist/` 目录
5. 确认 ClipMate 图标出现在工具栏

---

## 3. 隐私注意事项

- 不得记录真实 Token、Page ID、API Key
- 不得记录账号信息
- 测试结果截图如包含 URL，检查是否包含敏感参数
- 本文档不包含任何用户真实数据

---

## 4. 手动测试场景

### 场景 1：有 `<link rel="icon">` 的普通文章页

**操作步骤：**
1. 打开一个包含 `<link rel="icon" href="...">` 的博客或文档页（如 GitHub README、Medium 等）
2. 点击 ClipMate 图标 → 选择"提取全文"
3. 打开浏览器开发者工具 Console

**预期结果：**
- 剪藏成功，Markdown 中无异常
- siteIconUrl 字段为有效的 https URL
- 不出现 `javascript:` / `data:` / `blob:` 协议

**不应出现：**
- siteIconUrl 为 `javascript:void(0)`
- siteIconUrl 为 `data:image/png;base64,...`
- 剪藏失败

**结果：** [ ] 通过  [ ] 失败，记录：

---

### 场景 2：只有 `<link rel="shortcut icon">` 的页面

**操作步骤：**
1. 打开一个较老的网站（或使用 fixture 页面）
2. 剪藏全文

**预期结果：**
- siteIconUrl 提取到 shortcut icon 的 href
- 如无 shortcut icon 也无其他 icon，fallback 到 `/favicon.ico`

**结果：** [ ] 通过  [ ] 失败，记录：

---

### 场景 3：有 `<link rel="apple-touch-icon">` 的页面

**操作步骤：**
1. 打开同时包含 icon 和 apple-touch-icon 的页面（如大多数现代网站）
2. 剪藏全文

**预期结果：**
- siteIconUrl 优先使用 apple-touch-icon（优先级最高）

**结果：** [ ] 通过  [ ] 失败，记录：

---

### 场景 4：有 `<meta name="theme-color">` 的页面

**操作步骤：**
1. 打开设置了 theme-color meta 的页面（如 GitHub、Twitter/X）
2. 剪藏全文

**预期结果：**
- themeColor 字段为 `#rrggbb` 格式
- 不是 `javascript:...` 或 `url(...)` 等异常值

**结果：** [ ] 通过  [ ] 失败，记录：

---

### 场景 5：无 icon 定义的页面，fallback `/favicon.ico`

**操作步骤：**
1. 打开一个没有 `<link rel="icon">` 的简单页面
2. 剪藏全文

**预期结果：**
- siteIconUrl 为 `https://<domain>/favicon.ico`
- 不因 icon 缺失导致剪藏失败

**结果：** [ ] 通过  [ ] 失败，记录：

---

### 场景 6：非法 icon URL（本地 fixture 或测试页）

**操作步骤：**
1. 如果有本地测试页面，构造包含不安全 icon 的 HTML（如 `<link rel="icon" href="javascript:alert(1)">`）
2. 如果没有本地测试页，可信任单元测试覆盖

**预期结果：**
- 不安全 icon 被拒绝
- siteIconUrl fallback 到 `/favicon.ico`

**结果：** [ ] 通过（单元测试已覆盖） [ ] 跳过

---

### 场景 7：fullpage 剪藏

**操作步骤：**
1. 在任意文章页剪藏全文

**预期结果：**
- siteIconUrl 和 themeColor 正常出现在结果中
- 不改变正文内容提取
- 文章内容完整

**结果：** [ ] 通过  [ ] 失败，记录：

---

### 场景 8：selection 剪藏

**操作步骤：**
1. 在任意页面选中一段文字
2. 右键 → ClipMate → 提取选区

**预期结果：**
- selection 剪藏正常
- metadata 中仍有 siteIconUrl 和 themeColor（来自 metaParser）
- 不因 icon/theme 提取失败导致 selection 失败

**结果：** [ ] 通过  [ ] 失败，记录：

---

## 5. 隐私检查

| 检查项 | 状态 |
|--------|:---:|
| 不抓取目标链接内容 | [ ] |
| 不访问网络 fetch/XHR | [ ] |
| 不保存完整 DOM/HTML | [ ] |
| 不保存 Token/Page ID/Settings | [ ] |
| cache record 不含 title/url/description/contentText/markdown/body | [ ] |

---

## 6. 已知限制

| 编号 | 限制 | 说明 |
|:---:|------|------|
| IS05 | 不验证 favicon 是否真实存在 | extractor 只读取 DOM，不发起网络请求。siteIconUrl 可能指向 404 |
| IS06 | 不承诺所有站点都有 theme-color | 部分站点未设置 `meta name="theme-color"`，themeColor 可能为 undefined |
| IS07 | Cache persistence 本轮未实现 | cache strategy 为纯函数，未实际写入 chrome.storage。后续 Session 或 v0.5 可接入 |
