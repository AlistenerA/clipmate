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
| F03 | 导航页摘要模式 | Session 3 规划中 |
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

## v0.4 Blocker

当前无 blocker。

---

*（v0.4 之前版本的问题见 clipmate-v0.3/docs/ISSUES.md）*
