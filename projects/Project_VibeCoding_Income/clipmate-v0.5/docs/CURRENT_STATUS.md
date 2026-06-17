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

**v0.6.0 已完成** — Asset Pipeline Foundation。

本轮修复：
- 新增 `features/assets`，建立 `ClipAsset` / `FigureAsset` / `ImageSaveStrategy` / `ImageAssetQualityReport`
- 支持从 article image candidates 和 Markdown 图片语法生成 figure assets
- Notion save plan 现在携带 `assetReport`，可报告 ready / candidate / blocked 图片数量和失败原因
- Notion File Upload external import 仅作为候选策略评估，不默认启用、不新增 manifest 权限
- v0.6.0 继续在 `clipmate-v0.5/` 目录推进，避免为 minor foundation 做不可审查的大规模目录复制
- 版本号统一：package.json / manifest.config.ts / package-lock.json → 0.6.0
- lint 0 / test 1959 pass / build 成功，dist/manifest.json version = 0.6.0

*下一步：执行 v0.7 Tutorial Mode foundation，建立 ClipMode / ClipDocument，并保留标题层级、公式、代码块、表格、callout、图片题注、视频链接元数据。*

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
| v0.6.0 | ✅ 已完成 | Asset Pipeline foundation |

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
- [x] v0.6.0：Asset Pipeline Foundation
