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

**v0.5 Session 5.2 已完成** — Image Caption Placement & Markdown Image Layout Polish。

用户真实测试发现图片题注粘连问题：`![△特朗普（资料图）](url)△特朗普（资料图）` 在同一行。

修复：
- `htmlToMarkdown.ts`：新增 `splitImageCaptionGlue()` 后处理，将 `![alt](url)caption` 粘连拆分为 `![alt](url)\n\n*caption*`
- `blocks.ts`：`markdownToContentBlocks` 增强为识别 `*caption*` 紧接图片后的模式，将题注合并为 `image.caption`，不再额外输出 caption paragraph
- caption 长度限制 200 字符，超出回退为 alt
- 新增 14 个图片题注布局测试

*下一步：v0.5 Session 6 — Release Readiness。*

---

## v0.5 Session 进度

| Session | 状态 | 描述 |
|:---:|:---:|------|
| Session 0 | ✅ 已完成 | 版本交接、目录创建、规划 |
| Session 1 | ✅ 已完成 | Article Image Extraction Core |
| Session 2 | ✅ 已完成 | Markdown Image Preservation |
| Session 3 | ✅ 已完成 | Notion External Image Blocks |
| Session 4 | ✅ 已完成 | Popup/History Lightweight Image Metadata |
| Session 5 | ✅ 已完成 | Manual QA and Site Cases |
| Session 5.1 | ✅ 已完成 | Sina Image Pollution Guard & Notion Image URL Compatibility |
| Session 5.2 | ✅ 已完成 | Image Caption Placement & Markdown Image Layout Polish |
| Session 6 | ⏳ 待开始 | Release Readiness |

---

## 已完成

- [x] v0.5 Session 0：版本交接、目录创建、文档更新
- [x] v0.5 Session 1：Article Image Extraction Core
- [x] v0.5 Session 2：Markdown Image Preservation
- [x] v0.5 Session 3：Notion External Image Blocks
- [x] v0.5 Session 4：Popup/History Lightweight Image Metadata
- [x] v0.5 Session 5：Manual QA and Site Cases
- [x] v0.5 Session 5.1：Sina Image Pollution Guard & Notion Image URL Compatibility
- [x] v0.5 Session 5.2：Image Caption Placement & Markdown Image Layout Polish
