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

**v0.5 Session 2 已完成** — Markdown Image Preservation。

将 Session 1 的图片提取能力接入 Markdown 生成链路：
- 增强 Turndown `img` rule：噪声 class/id/URL/尺寸过滤、tracking pixel 过滤、data/blob URI 拦截、alt 默认 "image"
- 去重：`deduplicateImageMarkdown()` 后处理，基于 URL 去除重复图片
- 相对 URL 解析：`htmlToMarkdown` 接受 `pageUrl` 参数，解析相对/协议相对 URL
- 安全网：`injectMissingImages()` 在 Fullpage 提取末尾补充 Markdown 遗漏的图片（Images 区块）
- 28 个新测试。lint 0 / 1781 tests pass / build success。

*下一步：v0.5 Session 3 — Notion External Image Blocks。*

---

## v0.5 Session 进度

| Session | 状态 | 描述 |
|:---:|:---:|------|
| Session 0 | ✅ 已完成 | 版本交接、目录创建、规划 |
| Session 1 | ✅ 已完成 | Article Image Extraction Core |
| Session 2 | ✅ 已完成 | Markdown Image Preservation |
| Session 3 | ⏳ 待开始 | Notion External Image Blocks |
| Session 4 | ⏳ 待开始 | Popup/History Lightweight Image Metadata |
| Session 5 | ⏳ 待开始 | Manual QA and Site Cases |
| Session 6 | ⏳ 待开始 | Release Readiness |

---

## 已完成

- [x] v0.5 Session 0：版本交接、目录创建、文档更新
- [x] v0.5 Session 1：Article Image Extraction Core
- [x] v0.5 Session 2：Markdown Image Preservation
