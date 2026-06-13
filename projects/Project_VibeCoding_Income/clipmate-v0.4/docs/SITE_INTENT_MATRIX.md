# SITE_INTENT_MATRIX.md — ClipMate v0.4 站点意图矩阵

> 本文档为 v0.4 Session 2 (Site Profile Engine) 及后续 Session 提供站点适配和用户意图判断的设计规划。
> **本文档不包含代码实现。** 所有站点规则必须通过结构化 Site Profile Engine 管理，禁止散落 domain if 硬编码。

---

## 1. 设计目标

在无 AI 功能介入前，ClipMate v0.4 通过以下 5 类信号综合判断用户意图：

1. **Page Type**：article / search-results / navigation / forum-or-comment / video / ai-answer / unknown（Session 1 已实现）
2. **Site Profile**：domain / hostname / URL pattern / selector hints（Session 2 实现）
3. **Selection Context**：用户选区所在 DOM 祖先、role、tag、class/id 关键词、选区在页面中的位置（如视口滚动比例）
4. **Visible Context**：当前视口内是否存在视频播放器、评论区、搜索结果列表、正文区域
5. **Recent Interaction Snapshot**：最近一次点击/选区/滚动位置，仅当前 tab 内存，不持久化

### 隐私边界（强制）

- 不保存完整正文
- 不保存完整评论
- 不保存完整用户对话
- 不保存完整 Markdown
- 不上传任何用户内容
- 不能准确判断时返回 `unknown` 或 `needs-ai-later`，不强行猜

---

## 2. 重点站点 Seed Profile 范围

以下站点列表仅作为规划参考，**不在此文档中编写任何代码**。后续 Session 2.2 将基于此列表创建结构化 profile 数据。

### 搜索 / 结果页

| 站点 | domain | 备注 |
|------|--------|------|
| Google | `google.com` | `#search`, `#rso`, `a h3` |
| Bing | `bing.com` | `#b_results`, `.b_algo` |
| Baidu | `baidu.com` | `#content_left`, `.result` |

### 视频 / 教程 / 长视频

| 站点 | domain | 备注 |
|------|--------|------|
| YouTube | `youtube.com`, `youtu.be` | `#below`, `#comments`, `ytd-comments` |
| Bilibili | `bilibili.com` | `.reply-list`, `.comment-list` |
| iQiyi | `iqiyi.com` | 评论区 DOM |
| Youku | `youku.com` | 评论区 DOM |
| Tencent Video | `v.qq.com` | 评论区 DOM |

### 短视频 / 内容流

| 站点 | domain | 备注 |
|------|--------|------|
| TikTok | `tiktok.com` | 动态 DOM，caption + comment |
| Douyin | `douyin.com` | 等同于 TikTok 中文版 |
| Xiaohongshu | `xiaohongshu.com` | `.note-content`, `.comment-container` |
| Kuaishou | `kuaishou.com` | 短视频评论 |

### 问答 / 社区 / 评论密集

| 站点 | domain | 备注 |
|------|--------|------|
| Zhihu | `zhihu.com` | `.QuestionAnswer-content`, `.Comments-container` |
| Reddit | `reddit.com` | `shreddit-comment`, `[slot="comment"]` |
| Weibo | `weibo.com` | `.WB_feed`, `.comment_list` |

### AI 对话页（仅页面类型判断，不接 API）

| 站点 | domain | 备注 |
|------|--------|------|
| ChatGPT | `chatgpt.com` | `[data-message-author-role]` |
| Claude | `claude.ai` | assistant/user message blocks |
| Gemini | `gemini.google.com` | conversation patterns |
| Copilot | `copilot.microsoft.com` | message turn patterns |

### 注意事项

1. 以上站点适配禁止写成散落 `if (domain === 'xxx.com')`。
2. 后续 Session 2 必须通过结构化 Site Profile Engine 加载这些规则。
3. 每个 profile 应是数据配置（domain pattern + selector hints），不是业务逻辑硬编码。
4. 没有 profile 的站点降级为通用 PageType + 通用 extractor。
5. 短视频和评论密集站点是 v0.4 高风险场景，DOM 高度动态，需 Intent Snapshot 辅助判断。

---

## 3. 用户意图分类

以下 intent 类型为文档规划，Session 2.1 (Intent Signal Collector) 将基于此设计。

| Intent | 含义 | 触发条件 |
|--------|------|----------|
| `clip-article` | 全文剪藏 | article + 无选区 或 选区在正文内 |
| `clip-search-result` | 搜索结果摘要 | search-results + 选中结果卡片 |
| `clip-navigation-summary` | 导航页安全摘要 | navigation + 无选区 |
| `clip-video-page` | 视频页摘要 | video + 无选区 |
| `clip-video-description` | 视频描述/标题区 | video + 选区位描述/标题 |
| `clip-video-comment` | 视频评论区选区 | video + 选区在评论区 |
| `clip-short-video-caption` | 短视频标题/字幕 | 短视频页 + 选区位 caption |
| `clip-short-video-comment` | 短视频评论区 | 短视频页 + 选区在评论区 |
| `clip-forum-thread` | 论坛帖子 | forum-or-comment + 选区位帖子本体 |
| `clip-comment` | 评论区选区 | 选区位于评论区 DOM 祖先 |
| `clip-ai-answer` | AI 对话回答 | ai-answer + 选区位 assistant message |
| `clip-selection-generic` | 通用选区剪藏 | 有选区但无法定位上下文 |
| `unknown` | 无法判断 | 信号不足或冲突严重 |
| `needs-ai-later` | 需未来 AI 介入 | 当前信号无法可靠判断 |

---

## 4. 判断优先级

推荐优先级，从高到低：

1. **用户明确选区优先于页面整体类型。** 无论页面是什么 PageType，只要用户划选了内容，优先按选区上下文判断。
2. **选区祖先位于评论区** → `clip-comment` / `clip-video-comment` / `clip-short-video-comment` 优先。
3. **选区祖先位于视频描述或标题区** → `clip-video-description` / `clip-short-video-caption` 优先。
4. **页面是 video + 无选区** → `clip-video-page`。
5. **页面是 search-results + 选中结果卡片** → `clip-search-result`。
6. **页面是 article + 选区在正文内** → `clip-article`（或 `clip-selection-generic`）。
7. **信号冲突时降级 `unknown`**，不强行判断。
8. **无法判断但未来 AI 可能有帮助的场景标记 `needs-ai-later`**。

---

## 5. IntentSnapshot 概念规划

规划一个未来代码层概念（Session 2.1 可能实现），不在此文档中写代码：

```ts
// 概念定义，非可执行代码
interface IntentSnapshot {
  pageType: PageType
  siteProfileId?: string
  selectionPresent: boolean
  selectionTextLength: number
  selectionContext?:
    | 'article'
    | 'comment'
    | 'video-description'
    | 'search-result'
    | 'navigation'
    | 'ai-answer'
    | 'unknown'
  selectionRectArea?: number
  nearestRole?: string
  nearestTag?: string
  nearestClassHints?: string[]
  visibleVideoCount: number
  visibleCommentLikeCount: number
  lastPointerContext?: string
  confidence: number
  reasons: string[]
}
```

### 隐私约束（强制）

- `nearestClassHints` 必须过滤：只保留通用语义 hint（如 `comment`, `reply`, `description`），不保存完整 className。
- 不保存完整 selected text（只记录 `selectionTextLength` 统计量）。
- 不持久化到 storage（仅当前 tab 内存）。
- `reasons` 必须是短句，不包含正文全文或完整 className。
- `lastPointerContext` 只保留脱敏 tag/role（如 "last clicked: BUTTON role=menu"），不保留具体文本内容。

---

## 6. 与 PageType 的关系

Intent 判断建立在 PageType 之上但不取代：

| PageType | 可能 Intent |
|----------|------------|
| `article` | clip-article, clip-selection-generic |
| `search-results` | clip-search-result, clip-selection-generic |
| `navigation` | clip-navigation-summary, clip-selection-generic |
| `forum-or-comment` | clip-forum-thread, clip-comment |
| `video` | clip-video-page, clip-video-description, clip-video-comment |
| `ai-answer` | clip-ai-answer, clip-selection-generic |
| `unknown` | unknown, needs-ai-later |

---

*（此文档随 Session 2/2.1/2.2 迭代更新）*
