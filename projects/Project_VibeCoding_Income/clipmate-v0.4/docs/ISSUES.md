# ISSUES.md — ClipMate v0.4 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## v0.4 Session 8.1 状态

- 当前无 blocker
- 人工 QA C2（B 站视频页全文抓弹幕 / 选区异常）已修复，待用户复测
- I10（B 站弹幕）+ I11（B 站选区）已修复

---

## v0.4 Session 7 状态

- 当前无 blocker
- 所有已知限制为 minor/non-blocker
- 手动 QA 全部待用户真实浏览器验证（未执行）
- ZIP-QA-01：zip 内容逐文件审计推迟到 Session 8 Release Robustness Review（当前仅基于打包脚本逻辑检查，未逐文件解压列出）

---

## v0.4 当前已知问题（从 v0.3 继承）

| 编号 | 问题 | 关联 Session |
|:---:|------|:--:|
| I01 | CSDN / LaTeX 站点渲染公式残留 | Session 2 (Site Profile Engine) |
| I02 | 搜索页/导航页分类体验已改善（Session 1 通用启发式），但仍需 Site Profile Engine 和 Navigation Summary Mode 增强 | Session 1 (已改善) / Session 2 / Session 3 |
| I03 | 本地 .md 保存按钮（含目录选择与记忆）| v0.4+ |
| I04 | 最近复制历史模块 | v0.4+ |
| I05 | Typora / Obsidian 上次保存目录记忆 | v0.4+ |

---

## v0.4 待评估需求

| 编号 | 需求 | 状态 |
|:---:|------|:---:|
| F01 | 页面类型检测增强 | ✅ Session 1 已完成，已提交 |
| F02 | 站点规则引擎 | ✅ Session 2 已完成 |
| F03 | 导航页摘要模式 | ✅ Session 3 Draft Builder 已完成，Session 3.1 Markdown + Minimal Integration 已完成 |
| F04 | 评论选区模式 | Session 4 规划中 |
| F05 | 标签搜索 UX | 🔄 deferred to v0.5 History UX |
| F06 | 站点图标/主题缓存 | Session 5 规划中 |
| F07 | 链接卡片预览 | Session 6 规划中 |
| F08 | Better History Config | 🔄 deferred to v0.5 Settings / History Refactor |

---

## v0.4 Session 1.1 新识别的风险

| 编号 | 风险 | 关联 Session |
|:---:|------|:--:|
| R-v0.4-intent-001 | 短视频和视频评论区 DOM 动态变化（TikTok/Douyin/Bilibili 等），PageType 检测可能不准，需 Intent Snapshot 辅助判断 | Session 2.2 / Session 4 |
| R-v0.4-intent-002 | 高访问站点适配若散落硬编码（domain if），会导致 vibe slop 和技术债务累积 | Session 2（必须通过 profile engine 管理）|
| R-v0.4-intent-003 | 无法判断用户意图时应降级 unknown / needs-ai-later，不应强行猜 | Session 2.1 / 全局 |

---

## v0.4 Session 2 新识别的风险

| 编号 | 风险 | 关联 Session |
|:---:|------|:--:|
| R-v0.4-profile-001 | Seed profiles 只能提供结构化匹配和 selector hints，真实站点 DOM 仍需后续手动 QA | Session 2.2 / Session 8 |
| R-v0.4-profile-002 | 短视频站点 DOM 变化快（TikTok/Douyin/Kuaishou），不能只依赖 selector hints | Session 2.1 / Session 4 |

---

## v0.4 Session 2.1 新识别的风险

| 编号 | 风险 | 关联 Session |
|:---:|------|:--:|
| R-v0.4-intent-004 | DOM 语义 hint 对真实站点准确率有限，classifyElementContext 依赖 class/id 关键词匹配，非标准站点可能误判或漏判，需要后续手动 QA | Session 2.2 / Session 8 |
| R-v0.4-intent-005 | 短视频评论区动态加载可能导致 visible context 统计滞后（初次加载时不包含异步评论），Session 4 Comment Mode 需结合人工测试 | Session 2.2 / Session 4 |

---

## v0.4 Session 3.0 新识别风险

| 编号 | 风险 | 关联 Session |
|:---:|------|:--:|
| R-v0.4-nav-001 | 导航页链接噪声高，可能超过候选链接处理能力，需限制每个 domain 3 条、总数 15 条、过滤噪音容器 | Session 3 |
| R-v0.4-nav-002 | 搜索页 DOM 结构差异大，`searchResultCard` selector 为 seed/hint 级别，需有 fallback 到全页面提取 | Session 3 / Session 8 手动 QA |
| R-v0.4-nav-003 | 低置信正文 fallback 可能覆盖用户本意保存的页面，须保证 selection-first 永远优先 | Session 3.1 |
| R-v0.4-nav-004 | 搜索引擎结果页可能有 captcha/登录墙遮挡，DOM 受限时仅返回空列表，降级为安全 fallback | Session 3 |
| R-v0.4-nav-005 | 搜索页动态加载结果（infinite scroll），首次 DOM 不完整，Session 3 仅基于首次 DOM 快照 | Session 3 / IS03（记录为后续版本考虑） |

---

## v0.4 Session 2.2 新识别风险 / 待 QA

| 编号 | 风险/待QA | 关联 Session |
|:---:|------|:--:|
| QA01 | 长视频站点（iqiyi/youku/tencent）commentContainer selector 需真实站点 DOM 验证（`.iqp-comment`, `.comment-box`, `.mod_comment` 等）| Session 8 手动 QA |
| QA02 | 短视频站点（tiktok/douyin/kuaishou）contentContainer / commentContainer selector 依赖高度动态 DOM，需以实际加载后 DOM 为准 | Session 4 / Session 8 手动 QA |
| QA03 | claude.ai / gemini.google.com / copilot.microsoft.com 的 contentContainer selector 为通用猜测（`[data-message-author-role]` / `.chat-turn` / `.chat-message`），需在真实站点上确认匹配 | Session 8 手动 QA |
| QA04 | reddit-community.contentContainer `shreddit-post, [slot="post"]` 依赖新版 Reddit Web Components，旧版 reddit 不适用 | Session 8 手动 QA |
| QA05 | tiktok data-e2e selector（`[data-e2e="video-desc"]`, `[data-e2e="comment"]`）可能随版本变化，建议后续定期复查 | Session 7 / Session 9 |

---

## v0.4 Session 7 新增限制

| 编号 | 限制 | 级别 | 说明 |
|:---:|------|:---:|------|
| ZIP-QA-01 | zip 内容逐文件审计未完成 | minor | 当前 zip 检查基于打包脚本逻辑（仅压缩 dist/），逐文件解压列出内容推迟到 Session 8 Release Robustness Review |

---

## v0.4 Session 6 新增限制

| 编号 | 限制 | 级别 | 说明 |
|:---:|------|:---:|------|
| IS08 | Link Card 不访问目标 URL | minor | Link Card 基于当前页面 metadata 或用户输入构建，不抓取目标链接内容 |
| IS09 | Link Card UI 未实现 | minor | 核心 builder/serializer 已实现，Popup/Options/History UI 接入延后到 v0.5 |

## v0.4 Session 5 新增限制

| 编号 | 限制 | 级别 | 说明 |
|:---:|------|:---:|------|
| IS05 | 不验证 favicon 是否真实存在 | minor | extractor 只读取 DOM 中 link/meta 标签，不发起网络请求验证图标 URL 可访问性 |
| IS06 | 不承诺所有站点都有 theme-color | minor | 部分站点未设置 `meta name="theme-color"`，themeColor 可能为 undefined |
| IS07 | Cache persistence 本轮未实现 | minor | cache strategy 为纯函数，未实际写入 chrome.storage；后续 Session 或 v0.5 可接入 |

## v0.4 Blocker

当前无 blocker。

### Session 4 Comment / Selection Clip Core 已知限制

| 编号 | 限制 | 级别 | 说明 |
|:---:|------|:---:|------|
| IS02 | SelectionContext 归类依赖 DOM class 关键词，非标准站点可能误判 | minor | `classifyElementContext` 基于 ancestor 遍历关键词匹配，真实非标准站点可能将评论区误判为 unknown → selection-generic |
| IS03 | 评论区真实站点 DOM 需人工 QA | minor | 选区 context 判断正确性依赖 `classifyElementContext` 的准确率，真实评论页面需手动测试（QA06-QA10）|
| IS04 | 短视频/AI 对话页选区行为未在真实浏览器验证 | minor | 依赖 seed profile selector hints 作为辅助，但真实页面 DOM 可能不同 |

### 待 QA（Session 4 新增）

| 编号 | 待 QA | 关联 |
|:---:|------|:---:|
| QA06 | 论坛评论页（如 Reddit/Zhihu 等）选区 → 应触发 forum-selection 或 comment-selection | Session 4 / Session 8 手动 QA |
| QA07 | 视频页评论区选区（如 YouTube/Bilibili）→ 应触发 video-comment-selection | Session 4 / Session 8 手动 QA |
| QA08 | 视频简介区选区 → 应触发 video-description-selection | Session 4 / Session 8 手动 QA |
| QA09 | AI 对话页选区（ChatGPT/Claude 等）→ 应触发 ai-answer-selection | Session 4 / Session 8 手动 QA |
| QA10 | 普通文章页选区 → 应保持 selection-generic，不误触发 comment/forum warning | Session 4 / Session 8 手动 QA |

### Session 8.1 已修复

| 编号 | 问题 | 级别 | 修复 Session |
|:---:|------|:---:|:---:|
| ✅ I10 | B 站视频页全文剪藏抓取弹幕内容（danmaku/danmu DOM 被 Readability 误判为正文） | blocker | Session 8.1 |
| ✅ I11 | B 站选区检测不到（选区提取器零宽字符 + html 提取失败无兜底） | major | Session 8.1 |

**I10 修复详情：** `preCleanDocument` 新增 `excludeSelectors` 参数，bilibili-video profile 添加 danmaku/danmu 容器排除选择器（`.bpx-player-danmaku, .danmaku-wrap, .danmu-wrap` 等）。`NOISE_CSS_KEYWORDS` 新增 `danmaku`/`danmu`/`弹幕` 关键词作通用兜底。`handleExtractFullpage` 调用 `matchSiteProfile` 传递排除选择器到清洗管道。

**I11 修复详情：** `getSelectionText` 去除零宽字符（\u200B-\u200F、\uFEFF 等）后再判断是否为空。`getSelectionHtml` 添加 try-catch 包裹 `cloneContents`。`extractSelection` 在 html 提取失败时兜底为 `<p>{text}</p>`。

### Session 3.2 已修复

| 编号 | 问题 | 级别 | 修复 Session |
|:---:|------|:---:|:---:|
| ✅ IS01 | low-confidence+high-linkDensity 路径未从 content/index.ts 触发 | minor | Session 3.2 |

**IS01 修复详情：** `content/index.ts` 两个调用点现在传递 `confidenceToNumeric(report.confidence)` 和 `report.linkDensity`。同时新增 guard 防止 video/forum/ai-answer 页面误触发。修复验证：1084 tests，lint 0，build success。

### Session 3.1 已知限制

| 编号 | 限制 | 级别 | 说明 |
|:---:|------|:---:|------|
| IS01 | low-confidence+high-linkDensity 路径未从 content/index.ts 触发 | minor | `buildLowConfidenceSummary` 已支持 articleConfidence/linkDensity 参数，但 content/index.ts 尚未传递报告值。navigation/search-results pageType 路径已完成闭环。 |

### Session 5.1 Anti-Slop Review 已修复

| 编号 | 问题 | 级别 | 修复 Session |
|:---:|------|:---:|:---:|
| ✅ M2 | metaParser.extractSiteIconUrl 与 siteVisualExtractor.extractIconFromLinks 存在 link 迭代 + icon 优先级处理逻辑重复 | minor | Session 6 |

**M2 修复详情：** `extractIconFromLinks` 从 private 改为 public export。`extractSiteIconUrl` 移除内联 link 迭代逻辑，委托给 `extractIconFromLinks`，保留自身 `/favicon.ico` fallback 行为。27 tests（content-parser）+ 67 tests（site-visual-extractor）全部通过。

### Session 2.3 已修复问题

| 编号 | 问题 | 级别 | 修复 Session |
|:---:|------|:---:|:---:|
| ✅ B1 | Build 失败：intentSignalCollector 缺少 SelectionContext 类型导入 (TS2304) | blocker | Session 2.3.1 |
| ✅ M1 | intentSignalCollector.ts 硬编码视频站点 iframe selector（youtube/bilibili/youku）| major | Session 2.3.1 |

---

*（v0.4 之前版本的问题见 clipmate-v0.3/docs/ISSUES.md）*
