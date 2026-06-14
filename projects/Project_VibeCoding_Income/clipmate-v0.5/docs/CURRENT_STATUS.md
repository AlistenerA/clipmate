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

**v0.5 Session 3 已完成** — Notion External Image Blocks。

将 Markdown 中的图片语法 `![alt](url)` 转换为 Notion `image` block (type: external)：
- 新增 `markdownToContentBlocks()` 替换 `chunkedParagraphBlocks`，逐段落检测图片语法
- 只接受 http/https external URL；data/blob/非 http URL 降级为 paragraph block
- image block 使用 Notion external URL，alt 文本作为 caption
- 图片转换失败不影响正文段落保存
- 29 个新测试。lint 0 / 1810 tests pass / build success。

*下一步：v0.5 Session 4 — Popup/History Lightweight Image Metadata。*

---

## v0.5 Session 进度

| Session | 状态 | 描述 |
|:---:|:---:|------|
| Session 0 | ✅ 已完成 | 版本交接、目录创建、规划 |
| Session 1 | ✅ 已完成 | Article Image Extraction Core |
| Session 2 | ✅ 已完成 | Markdown Image Preservation |
| Session 3 | ✅ 已完成 | Notion External Image Blocks |
| Session 4 | ⏳ 待开始 | Popup/History Lightweight Image Metadata |
| Session 5 | ⏳ 待开始 | Manual QA and Site Cases |
| Session 6 | ⏳ 待开始 | Release Readiness |

---

## 已完成

- [x] v0.5 Session 0：版本交接、目录创建、文档更新
- [x] v0.5 Session 1：Article Image Extraction Core
- [x] v0.5 Session 2：Markdown Image Preservation
- [x] v0.5 Session 3：Notion External Image Blocks
