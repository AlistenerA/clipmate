# COMMENT_SELECTION_QA.md — ClipMate v0.4 Comment / Selection Clip Mode 人工测试

> 本文档用于手动验证 Comment / Selection Clip Mode 在真实浏览器中的行为。不包含自动化测试。

---

## 测试目标

验证 v0.4 Session 4 实现的 Comment / Selection Clip Core：
- 有选区时能正确判断选区 context（comment / forum / video / AI-answer / generic）
- 非 generic 模式输出结构化 Markdown（含 title、warning、Source、pageType、selectionContext、selectedTextLength、reasons）
- generic 模式不强行加 warning
- 不抓取整页评论、论坛楼层、完整 DOM
- selection-first 不变（无选区仍返回 NO_SELECTION）

---

## 测试环境

### 加载扩展步骤

1. 打开 Edge：`edge://extensions/`
2. 打开"开发人员模式"
3. 点击"加载解压缩的扩展"
4. 选择 `clipmate-v0.4/dist/` 目录
5. 确认扩展图标出现在工具栏

### 测试前隐私注意事项

- 不使用真实 Notion Token
- 不使用真实 Notion Page ID
- 不登录任何账号
- 不记录真实用户搜索内容
- 不在测试记录中写入真实 URL 参数或个人数据

---

## 手动测试场景

### 场景 1：普通文章选区

**操作步骤：**
1. 打开一篇普通博客文章或新闻页面
2. 在正文中划选一段文字
3. 点击 ClipMate 图标，触发选区剪藏

**预期结果：**
- 选区被正常保存
- Markdown 输出不包含 comment/forum/video/AI warning
- 页面类型为 article

**不应出现：**
- "当前选区位于评论相关区域" 等 warning
- 页面全部内容被保存

---

### 场景 2：论坛/评论区选区

**操作步骤：**
1. 打开一个论坛帖子页面（如结果页、评论区页面）
2. 在评论区中划选一条回复的文字
3. 点击 ClipMate 图标

**预期结果：**
- 选区被正常保存
- Markdown 输出包含 forum/thread 相关 warning
- selectionContext 为 comment
- pageType 为 forum-or-comment
- 仅保存用户选中的内容

**不应出现：**
- 整页楼层/评论被保存
- 选区外的大量内容被抓取

---

### 场景 3：视频简介选区

**操作步骤：**
1. 打开一个视频页面（如视频网站的视频详情页）
2. 在视频简介/描述区域划选文字
3. 点击 ClipMate 图标

**预期结果：**
- 选区被正常保存
- Markdown 输出包含 video description 相关 warning
- 仅保存用户选中的内容

**不应出现：**
- 视频评论列表被自动抓取
- 视频描述以外的内容被扩展捕捉

---

### 场景 4：视频评论区选区

**操作步骤：**
1. 打开一个视频页面
2. 在视频评论区中划选一条评论
3. 点击 ClipMate 图标

**预期结果：**
- 选区被正常保存
- Markdown 输出包含 video comment 相关 warning
- 仅保存用户选中的内容

**不应出现：**
- 多条评论被自动抓取
- 视频标题/简介被追加

---

### 场景 5：短视频标题/说明选区

**操作步骤：**
1. 打开一个短视频页面
2. 在视频标题/说明区域划选文字
3. 点击 ClipMate 图标

**预期结果：**
- 选区被正常保存
- Markdown 输出包含 short video caption 相关 warning
- 仅保存用户选中的内容

**不应出现：**
- 评论区被自动抓取
- 其他视频推荐被保存

---

### 场景 6：AI 对话回复选区

**操作步骤：**
1. 打开一个 AI 对话页面
2. 在 AI 回复区域划选一段文字
3. 点击 ClipMate 图标

**预期结果：**
- 选区被正常保存
- Markdown 输出包含 AI conversation 相关 warning
- 仅保存用户选中的内容

**不应出现：**
- 完整对话历史被保存
- 用户消息和 AI 回复的全部内容被自动抓取

---

### 场景 7：无选区

**操作步骤：**
1. 打开任意页面
2. 确保没有任何文字被选中
3. 尝试触发选区剪藏

**预期结果：**
- 返回 NO_SELECTION
- 不执行 comment selection draft 构建

**不应出现：**
- 自动抓取页面内容
- 自动抓取评论/论坛

---

## 隐私检查

### 不抓整页评论
- 所有场景下，仅保存用户选中的内容
- Markdown 输出中不包含选区外的评论/楼层/对话

### 不保存完整 DOM/HTML
- Markdown 输出不包含 `<html>`, `<head>`, `<body>`, `<script>`, `<style>` 等标签
- 不包含 `innerHTML`, `outerHTML` 引用

### 不保存 token/pageId/settings
- Markdown 输出不包含 `token`, `api_key`, `pageId`, `settings`, `message request` 等敏感词

### 不输出完整 message request
- console 输出不含完整 settings 对象或 message body

---

## 已知限制

| 编号 | 限制 | 说明 |
|:---:|------|------|
| L01 | SelectionContext 归类依赖 DOM class 关键词 | `classifyElementContext` 基于 ancestor 遍历关键词匹配（comment/reply/thread 等），非标准站点可能误判为 unknown → selection-generic |
| L02 | selector hints 仅为 seed/hint | 站点级 selector hints 基于对 DOM 结构的通用猜测，不经过真实浏览器自动化验证 |
| L03 | 短视频/AI 对话真实 DOM 需手动验证 | 此类站点 DOM 高度动态，selectors 可能因版本更新而变化 |
| L04 | 模式判断仅基于 selectionContext + pageType | 不分析选区具体文本内容、不访问网络 |

---

## QA 结果记录

| 场景 | Edge | Chrome | 备注 |
|:---:|:---:|:---:|:---:|
| 1. 普通文章选区 | ⬜ | ⬜ | |
| 2. 论坛/评论区选区 | ⬜ | ⬜ | |
| 3. 视频简介选区 | ⬜ | ⬜ | |
| 4. 视频评论区选区 | ⬜ | ⬜ | |
| 5. 短视频标题/说明选区 | ⬜ | ⬜ | |
| 6. AI 对话选区 | ⬜ | ⬜ | |
| 7. 无选区 | ⬜ | ⬜ | |
| 8. 评论上下文剪藏展示 (S8.6) | ⬜ | ⬜ | 详见 `COMMENT_CONTEXT_CLIP_QA.md` |

---

## v0.4 Session 8.6 更新

- 评论选区 Markdown 输出格式已增强，新增 CommentClipContext 结构
- 现在包含：平台名、sourceTitle、原内容摘要、媒体引用、评论作者、降级说明
- 详细信息见 `COMMENT_CONTEXT_CLIP_QA.md`
