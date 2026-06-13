# ISSUES.md — ClipMate v0.4 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

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
| F05 | 标签搜索 UX | Session 5 规划中 |
| F06 | 站点图标/主题缓存 | Session 6 规划中 |
| F07 | 链接卡片预览 | Session 7 规划中 |

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

## v0.4 Blocker

当前无 blocker。

### Session 3.2 已修复

| 编号 | 问题 | 级别 | 修复 Session |
|:---:|------|:---:|:---:|
| ✅ IS01 | low-confidence+high-linkDensity 路径未从 content/index.ts 触发 | minor | Session 3.2 |

**IS01 修复详情：** `content/index.ts` 两个调用点现在传递 `confidenceToNumeric(report.confidence)` 和 `report.linkDensity`。同时新增 guard 防止 video/forum/ai-answer 页面误触发。修复验证：1084 tests，lint 0，build success。

### Session 3.1 已知限制

| 编号 | 限制 | 级别 | 说明 |
|:---:|------|:---:|------|
| IS01 | low-confidence+high-linkDensity 路径未从 content/index.ts 触发 | minor | `buildLowConfidenceSummary` 已支持 articleConfidence/linkDensity 参数，但 content/index.ts 尚未传递报告值。navigation/search-results pageType 路径已完成闭环。 |

### Session 2.3 已修复问题

| 编号 | 问题 | 级别 | 修复 Session |
|:---:|------|:---:|:---:|
| ✅ B1 | Build 失败：intentSignalCollector 缺少 SelectionContext 类型导入 (TS2304) | blocker | Session 2.3.1 |
| ✅ M1 | intentSignalCollector.ts 硬编码视频站点 iframe selector（youtube/bilibili/youku）| major | Session 2.3.1 |

---

*（v0.4 之前版本的问题见 clipmate-v0.3/docs/ISSUES.md）*
