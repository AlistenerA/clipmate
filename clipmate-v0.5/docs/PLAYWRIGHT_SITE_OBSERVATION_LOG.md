# PLAYWRIGHT_SITE_OBSERVATION_LOG.md — ClipMate v0.4 站点结构观察日志

> 记录 v0.4 Session 8.3 通过 Playwright 对真实公开页面结构的观察结果。
> 不包含真实正文、评论、弹幕、账号信息。

---

## 观察日期
2026-06-14

## 浏览器
Playwright bundled Chromium (Headless)

---

## 1. Bilibili 视频页

- **URL 类别**：`/video/BVxxx`
- **是否可访问**：✅ 可访问
- **页面类型**：video（视频页），title 包含 "哔哩哔哩_bilibili"
- **正文候选 selector**：
  - `.video-desc-container`：✅ 1 个匹配（视频简介容器）
  - `.video-info-detail`：❌ 0 个匹配（已不存在）
- **评论候选 selector**：
  - `.reply-list`：❌ 0 个匹配（动态加载）
  - `.comment-list`：❌ 0 个匹配（动态加载）
  - `[class*="comment"]`：❌ 0 个匹配（初始 DOM）
- **噪声/弹幕/播放器 selector**：
  - `.bpx-player-video-wrap`：✅ 1 个匹配（播放器容器）
  - `.bpx-player-danmaku`：❌ 0 个匹配（渲染方式已变）
  - `.bpx-player-sending-bar`：✅ 1 个匹配（发弹幕栏）
  - `.danmaku-wrap`：✅ 1 个匹配（弹幕容器）
  - `.danmaku-container`：❌ 0 个匹配
  - `.danmu-wrap`：❌ 0 个匹配
  - `.danmu-container`：❌ 0 个匹配
  - `.danmaku-info-row`：❌ 0 个匹配（已不存在）
  - `.player-danmaku`：❌ 0 个匹配（已不存在）
  - `[class*="danmaku"]`：14 个匹配
- **与当前 profile 是否一致**：
  - `contentContainer`：✅ `.video-desc-container` 有效
  - `commentContainer`：⚠️ 动态加载，初始 DOM 不可见
  - `videoPlayer`：⚠️ `#bilibiliPlayer` 已不存在，`.bpx-player-video-wrap` 有效
  - `excludeSelector`：⚠️ 含 2 个已不存在的 stale selector（`.danmaku-info-row`, `.player-danmaku`），已移除
- **风险**：低。弹幕/噪声过滤机制正确，stale selector 已清理。

---

## 2. 微博详情页

- **URL 类别**：`/用户ID/帖子ID`
- **是否可访问**：✅ 可访问（详情页），首页需登录
- **页面类型**：forum-or-comment（帖子页），bodyText ~3K 字符
- **正文候选 selector**：
  - `.WB_feed`：❌ 0 个匹配（已不存在，使用 CSS Modules 随机类名）
  - `<main>`：✅ 1 个匹配（主内容区）
- **评论候选 selector**：
  - `.comment_list`：❌ 0 个匹配（已不存在，使用 `_contentItem_` 等随机类名）
  - `[class*="comment"]`：❌ 0 个匹配（CSS Modules 无法通过语义关键词匹配）
- **噪声 selector**：React root (`#app`)，CSS Modules 随机类名 (`_full_`, `_main_`, `_card_`)
- **与当前 profile 是否一致**：
  - `contentContainer`：❌ `.WB_feed` 已完全失效 → 已更新为 `main`
  - `commentContainer`：❌ `.comment_list` 已完全失效 → 已更新为 `[class*="comment"], [class*="reply"]`
  - domain 匹配仍然有效
- **风险**：⚠️ medium。Weibo 使用 CSS Modules 随机类名，精确 comment container selector 无法确定。profile 更新为更通用的 selector。

---

## 3. 小红书

- **URL 类别**：`/explore`
- **是否可访问**：❌ Blocked（IP 存在风险 / 反爬拦截）
- **结论**：无法自动验证。保留现有 profile 不做修改。
- **风险**：低（profile 为 seed 级别，不影响核心行为）

---

## 4. 抖音

- **URL 类别**：首页
- **是否可访问**：❌ Blocked（验证码中间页）
- **结论**：无法自动验证。保留现有 profile 不做修改。
- **风险**：低（profile 为 seed 级别，不影响核心行为）

---

## 5. GitHub Issue / PR 页

- **URL 类别**：`/org/repo/issues/NNN` 或 `/org/repo/pull/NNN`
- **是否可访问**：✅ 可访问
- **页面类型**：forum-or-comment（issue/PR 讨论页），bodyText ~22K
- **正文候选 selector**：
  - `.timeline-comment`：✅ 4 个匹配（实际评论）
  - `.comment-body`：✅ 4 个匹配
- **评论候选 selector**：
  - `[class*="comment"]`：⚠️ 53 个匹配（过宽，含导航/标签）
  - `[class*="discussion"]`：⚠️ 20 个匹配
- **噪声 selector**：sidebar、timeline 导航、header
- **风险**：`[class*="comment"]` 过宽会夸大 commentLikeCount，但 forum-or-comment 检测阈值高（需 >8），不会造成显著误判。

---

## 6. Bing 搜索结果页

- **URL 类别**：`/search?q=`
- **是否可访问**：✅ 可访问
- **页面类型**：search-results
- **正文候选 selector**：
  - `#b_results`：✅ 1 个匹配
  - `.b_algo`：✅ 10 个匹配（搜索卡片）
  - `.b_caption`：✅ 10 个匹配
- **与当前 profile 是否一致**：✅ `searchResultCard: '#b_results .b_algo'` 完全匹配
- **风险**：低

---

## 7. Wikipedia 文章页

- **URL 类别**：`/wiki/ArticleName`
- **是否可访问**：✅ 可访问
- **页面类型**：article，bodyText ~55K，187 段落
- **正文候选 selector**：`<main>` ✅, `.mw-parser-output` ✅, `#mw-content-text` ✅
- **风险**：低。文章检测正常。

---

## 8. MDN 文档页

- **URL 类别**：`/docs/Web/...`
- **是否可访问**：✅ 可访问
- **页面类型**：article，bodyText ~24K，66 段落
- **正文候选 selector**：`<main>` ✅
- **风险**：低。文章检测正常。

---

## 9. Rust Blog 文章页

- **URL 类别**：`/YYYY/MM/DD/title.html`
- **是否可访问**：✅ 可访问
- **页面类型**：article，bodyText ~7K，24 段落
- **评论选择器**：`[class*="comment"]` 0 个（无虚假匹配）
- **风险**：低。普通文章页不会被误判为评论区。

---

## 总结

| 平台 | 状态 | profile 修复 | 风险 |
|------|:---:|:---:|:---:|
| Bilibili | ✅ | 保留旧 selector 兼容 | low |
| Weibo | ✅ | contentContainer → main，无 commentContainer | medium (CSS Modules) |
| Xiaohongshu | ❌ 反爬 | 保留现有 | low |
| Douyin | ❌ 验证码 | 保留现有 | low |
| GitHub | ✅ | 无需修改 | low |
| Bing Search | ✅ | 无需修改 | low |
| Wikipedia | ✅ | 无需修改 | low |
| MDN | ✅ | 无需修改 | low |
| Rust Blog | ✅ | 无需修改 | low |

## S8.3.1 变更记录

- **Bilibili**：恢复 `#bilibiliPlayer` 至 videoPlayer（兼容旧版播放器/AB 实验）；恢复 `.danmaku-info-row` / `.player-danmaku` 至 excludeSelector（无害，保留兼容）
- **Weibo**：移除 `[class*="comment"], [class*="reply"]` 过宽 commentContainer selector；Weibo 使用 React + CSS Modules 随机类名，评论区无法可靠自动定位
- **测试**：新增 4 个 site-profile-engine test + 3 个 article-boundary-guard test

**阻塞平台**：Xiaohongshu（反爬拦截）、Douyin（验证码）、Google（reCAPTCHA）无法自动验证，需用户人工验证。

**阻塞平台**：Xiaohongshu（反爬拦截）、Douyin（验证码）、Google（reCAPTCHA）无法自动验证，需用户人工验证。
