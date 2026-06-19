# CONTENT_SCRIPT_CONNECTION_QA.md — ClipMate v0.4 内容脚本连接问题

> 记录 v0.4 Session 8.5 发现并修复的 content script 连接失败问题。
> 本文档用于用户手动复测和后续排查。

---

## 问题现象

在真实 Edge 浏览器中打开微博详情页，点击 ClipMate Popup 的提取按钮后显示：

```
提取异常：Could not establish connection. Receiving end does not exist.
```

## 根因

Chrome/Edge 扩展的 Popup 通过 `chrome.tabs.sendMessage` 向当前标签页的 content script 发送提取请求。
当 content script 未能正确注入或已被销毁时，浏览器抛出 "Could not establish connection. Receiving end does not exist." 错误。

常见触发场景：
1. 扩展被重新加载后，已打开的网页上旧的 content script 失效，需刷新页面重新注入
2. 某些页面的 CSP 或安全策略阻止了 content script 注入
3. 浏览器扩展加载状态异常

## 修复方案（v0.4 Session 8.5）

1. **友好错误提示**：捕获连接失败错误后，显示中文友好提示：
   > ClipMate 未能连接到当前页面。请刷新当前网页后重试；如刚重新加载过扩展，需刷新当前网页以使内容脚本生效。

2. **纯函数抽出**：
   - `isContentScriptUnavailableError(error)`: 检测是否为连接失败错误
   - `normalizeContentScriptConnectionError(error)`: 将 Chrome 底层错误转换为友好提示

3. **早期检测**：在 `tryExtractPrioritizeSelection` 中也检测连接失败，避免无意义的 fullpage 回退提取。

## 用户复测步骤

### 前置条件
- 卸载旧版扩展
- 加载 `clipmate-v0.4/dist/` 目录
- 打开一个测试网页（推荐普通文章页先验证基本连通性）

### 测试场景

| 场景 | 操作 | 预期结果 |
|------|------|----------|
| 1. 正常提取 | 打开任意网页 → 点 ClipMate → 全文提取 | 正常显示 Markdown |
| 2. 选区提取 | 选中文字 → 点 ClipMate → 选区模式自动触发 | 正常显示选区 Markdown |
| 3. 扩展 reload 后 | Edge `edge://extensions` → 重新加载 ClipMate → 回到之前打开的网页 → 点 ClipMate 提取 | 显示 "ClipMate 未能连接到当前页面。请刷新..." |
| 4. 刷新后恢复 | 场景 3 中刷新网页 → 再次点 ClipMate 提取 | 正常提取 |
| 5. 微博详情页 | 打开微博详情页 → 点 ClipMate 提取 | 正常提取或显示刷新提示 |

### 不应出现的行为
- 不应显示英文 Chrome 底层错误
- 不应泄露 token/settings/pageId
- 不应崩溃

## 隐私检查

| 检查项 | 状态 |
|------|:---:|
| 不保存完整 DOM | ✅ |
| 不保存评论全文 | ✅ |
| 不保存正文全文到非预期位置 | ✅ |
| 不泄露 Token/API Key/Page ID | ✅ |
| 不发起非授权网络请求 | ✅ |
| 不新增 chrome.scripting 权限 | ✅ |
| 不新增 manifest permissions | ✅ |

## 已知限制

- 扩展 reload 后旧页面必须刷新（浏览器限制，无法绕过）
- 未实现自动检测 + 自动刷新（需要 `chrome.scripting` 权限）
