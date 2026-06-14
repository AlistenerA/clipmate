# CURRENT_STATUS.md — ClipMate v0.5 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，禁止修改
> - `clipmate-v0.3/` = v0.3 稳定快照，禁止修改
> - `clipmate-v0.4/` = v0.4 稳定基线，禁止修改
> - `clipmate-v0.5/` = 当前 v0.5 开发目录

---

## 当前阶段

**v0.5 Session 1 已完成** — Article Image Extraction Core。

实现了纯函数文章图片候选提取模块 `src/content/extractors/articleImages.ts`，支持 img/picture/figure 图片提取、srcset 解析、相对 URL 归一化、alt/title/caption 保留、噪声过滤（avatar/icon/logo/emoji/tracking/data/blob）、去重和数量限制。62 个新测试。lint 0 / 1753 tests pass / build success。

*下一步：v0.5 Session 2 — Markdown Image Preservation。*

---

## v0.5 Session 进度

| Session | 状态 | 描述 |
|:---:|:---:|------|
| Session 0 | ✅ 已完成 | 版本交接、目录创建、规划 |
| Session 1 | ✅ 已完成 | Article Image Extraction Core |
| Session 2 | ⏳ 待开始 | Markdown Image Preservation |
| Session 3 | ⏳ 待开始 | Notion External Image Blocks |
| Session 4 | ⏳ 待开始 | Popup/History Lightweight Image Metadata |
| Session 5 | ⏳ 待开始 | Manual QA and Site Cases |
| Session 6 | ⏳ 待开始 | Release Readiness |

---

## 已完成

- [x] v0.5 Session 0：版本交接、目录创建、文档更新
- [x] v0.5 Session 1：Article Image Extraction Core
