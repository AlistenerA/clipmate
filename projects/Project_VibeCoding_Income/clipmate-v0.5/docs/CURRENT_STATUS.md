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

**v0.5 Session 4 已完成** — Popup / History Lightweight Image Metadata。

在 Popup 和 History 中轻量展示文章图片信息：
- `ExtractedContent` 和 `ClipHistoryItem` 新增 `imageCount` / `firstImageUrl` / `skippedImageCount` 可选字段
- fullpage 提取路径自动附加 image 元数据（通过 `attachImageMetadata()`）
- selection / comment-context mode：imageCount=0，不显示图片信息
- Popup StatusBar：图片>0 时显示紫色「图片 N」徽章
- HistoryItem：fullpage 且 imageCount>0 时显示紫色「图片 N」标签
- 保存/重试/失败路径均保留 image 元数据（updateHistoryItem merge 自动保留）
- 18 个新测试。lint 0 / 1828 tests pass / build success。

*下一步：v0.5 Session 5 — Manual QA and Site Cases。*

---

## v0.5 Session 进度

| Session | 状态 | 描述 |
|:---:|:---:|------|
| Session 0 | ✅ 已完成 | 版本交接、目录创建、规划 |
| Session 1 | ✅ 已完成 | Article Image Extraction Core |
| Session 2 | ✅ 已完成 | Markdown Image Preservation |
| Session 3 | ✅ 已完成 | Notion External Image Blocks |
| Session 4 | ✅ 已完成 | Popup/History Lightweight Image Metadata |
| Session 5 | ⏳ 待开始 | Manual QA and Site Cases |
| Session 6 | ⏳ 待开始 | Release Readiness |

---

## 已完成

- [x] v0.5 Session 0：版本交接、目录创建、文档更新
- [x] v0.5 Session 1：Article Image Extraction Core
- [x] v0.5 Session 2：Markdown Image Preservation
- [x] v0.5 Session 3：Notion External Image Blocks
- [x] v0.5 Session 4：Popup/History Lightweight Image Metadata
