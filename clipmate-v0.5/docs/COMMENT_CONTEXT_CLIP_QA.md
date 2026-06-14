# COMMENT_CONTEXT_CLIP_QA.md — ClipMate v0.4 评论上下文剪藏 QA

> Session 8.6：评论上下文剪藏基础能力。

## 测试场景

### CQ01：Weibo 类平台评论选区

- 操作：在微博详情页选中一条评论
- 预期：
  - sourceTitle 为 "微博：{原微博正文摘要前 50 字}"，而非 "微博正文" 或 "微博正文 - 微博"
  - 若无法提取原微博摘要，标题显示为 fallback 并出现 source-title-unresolved warning
  - sourceMedia 包含原微博图片，不包含评论头像
  - selectedComment.author 可识别（如 strong/b 标签内的用户名）
  - selectedComment.text 仅包含选中评论内容
  - 不包含同级其它评论
- 手动测试方式：真实 Edge 微博详情页，划选评论内容，点击 ClipMate Popup 选区按钮
- 注意：手动选区时建议包含评论者用户名以提升识别准确率

### CQ02：Bilibili 视频评论选区

- 操作：在 Bilibili 视频页选中一条评论
- 预期：
  - sourceTitle 为视频标题
  - sourceMedia 可获取视频封面 / og:image
  - selectedComment.author 可识别
- 手动测试方式：真实 Edge B 站视频页

### CQ03：普通博客/论坛评论选区

- 操作：在带评论的博客页选中一条评论
- 预期：
  - sourceTitle 为文章标题
  - 有来源 URL 和平台名
  - sourceExcerpt 可为文章正文前若干字

### CQ04：识别不到评论作者

- 操作：在无作者标识的评论区域选中评论
- 预期：
  - 不崩溃
  - Markdown 输出显示 "评论者：未识别"
  - warnings 包含 author-unresolved
  - 降级说明提示用户手动选区时包含用户名

### CQ05：无媒体

- 操作：在无图片/封面的页面选中评论
- 预期：
  - 不崩溃
  - 不输出空图片语法
  - warnings 包含 no-media
  - 降级说明提示未检测到媒体

### CQ06：选区不含其他评论

- 操作：在有多条评论的页面仅选中其中一条
- 预期：
  - selectedComment.text 仅包含选中的那条评论
  - markdown 输出不包含同级其他评论内容

### CQ07：普通 selection-generic 不受影响

- 操作：在普通文章页选中文本
- 预期：
  - mode 为 selection-generic
  - 不触发 comment context 路径
  - 使用原有 selection markdown 输出

## 降级说明

- **作者识别是 best-effort**：基于选区祖先元素的 DOM 结构分析，无法保证 100% 识别。识别不到时不会崩溃，仅标记 warning。
- **媒体只使用页面已有链接**：不下载、不转存、不访问远程验证图片是否真实可访问。
- **当前不支持远程图片下载/上传**。

## 已知限制

| 编号 | 限制 | 级别 |
|:---:|------|:---:|
| CQ-01 | Weibo CSS Modules 随机类名导致评论区定位不可靠，作者识别依赖通用 heuristics | minor |
| CQ-02 | 部分平台（小红书/TikTok/Douyin）因反爬无法自动验证 DOM 结构 | minor |
| CQ-03 | sourceExcerpt 基于 textContent 提取，可能包含内容容器中的导航/按钮文字 | minor |
| CQ-04 | 非标准 DOM 结构的站点作者识别可能失败 | minor |
| CQ-05 | 微博无 article 结构时 sourceContainer 回退到 main，textContent 可能含部分界面文字 | minor |
| CQ-06 | 微博 CSS Modules 类名不可见，classifyElementContext 回退到 pageType 判断 | minor (Session 8.6.2 已修复) |

## 后续扩展

- 图片化分享模块可基于 `CommentClipContext` 的 `sourceMedia` 和 `selectedComment` 字段扩展
- `CommentClipContext` 数据结构已为后续版本打好基础，不包含正文全文、评论全文、完整 DOM
