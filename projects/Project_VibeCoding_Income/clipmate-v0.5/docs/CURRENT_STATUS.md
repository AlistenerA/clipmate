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

**v0.5.3 已完成** — Popup Save Summary & Duplicate Save Hints。

本轮修复：
- Popup 支持保存前编辑剪藏标题，复制 Markdown 和保存 Notion 均使用编辑后的标题
- 旧的有限正文预览区替换为保存摘要区：站点 icon、来源、字数、图片数和重复保存提示
- 保留原文 / 预览主区域作为 Markdown 主预览，避免重复 UI
- 重复保存提示基于本地 saved history 中的同 URL 最近记录，不扩大存储范围
- 版本号统一：package.json / manifest.config.ts / package-lock.json → 0.5.3
- lint 0 / test 1949 pass / build 成功，dist/manifest.json version = 0.5.3

*下一步：进入 v0.6 Asset Pipeline foundation，建立 ClipAsset / FigureAsset / ImageSaveStrategy 与图片保存质量报告底座。*

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
| Session 6 | ✅ 已完成 | Release Readiness |
| v0.5.1 | ✅ 已完成 | Architecture Foundation |
| v0.5.2 | ✅ 已完成 | CCTV-like 图片候选修复与 Markdown profile 兼容 |
| v0.5.3 | ✅ 已完成 | Popup 保存摘要、可编辑标题与重复保存提示 |

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
- [x] v0.5 Session 6：Release Readiness
- [x] v0.5.1：Architecture Foundation
- [x] v0.5.2：CCTV-like Image Source Recovery & Markdown Profile Compatibility
- [x] v0.5.3：Popup Save Summary & Duplicate Save Hints
