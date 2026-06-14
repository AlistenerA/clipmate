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

**v0.5 Session 5 已完成** — Manual QA and Site Cases。

使用 12 个场景（52 个 fixture QA 测试）验证了 v0.5 文章图片保存全链路：
- 新闻文章：多图片 + caption + figure/figcaption + 噪声过滤 ✅
- 博客文章：figure/figcaption + alt/title + avatar/logo 过滤 ✅
- 技术文档：截图 + icon/favicon/emoji/spinner 过滤 + code block 不受影响 ✅
- CSDN-like：懒加载（Turndown img rule 处理 data-src/data-original）+ srcset + avatar/badge 过滤 ✅
- 重复图片去重 ✅
- logo/avatar/badge/emoji/sprite/thumb/qr-code/tracking pixel 噪声过滤 ✅
- Markdown 中图文顺序保持 ✅
- Notion image block 与 paragraph 顺序保持 ✅
- Popup/History 图片元数据传递 ✅
- selection/comment-context 不错误继承 fullpage 图片信息 ✅
- data:/blob: URI / 过小尺寸图片 / 空 alt 边缘处理 ✅
- 全链路 smoke test ✅

**QA 发现**：
- `extractArticleImages.getBestSrc` 不处理 data-src/data-original 懒加载属性（Turndown img rule 正确处理）
- `markdownToContentBlocks` 当前仅输出 paragraph/image blocks（不处理 heading）
- "ad-banner" class 不在已知噪声 class 列表中（广告图类名多样性是已知局限）

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
| Session 6 | ⏳ 待开始 | Release Readiness |

---

## 已完成

- [x] v0.5 Session 0：版本交接、目录创建、文档更新
- [x] v0.5 Session 1：Article Image Extraction Core
- [x] v0.5 Session 2：Markdown Image Preservation
- [x] v0.5 Session 3：Notion External Image Blocks
- [x] v0.5 Session 4：Popup/History Lightweight Image Metadata
- [x] v0.5 Session 5：Manual QA and Site Cases
