# AGENT_CONTEXT.md — ClipMate v0.6

## 当前开发版本

**clipmate-v0.6/** — 当前唯一开发目录。v0.5 已按用户要求迁移为 v0.6 目录；不修改 v0.1-v0.4。

## 历史/稳定版本（禁止修改）

- `clipmate-v0.1/` — 冻结快照
- `clipmate-v0.2/` — 稳定公开发布
- `clipmate-v0.3/` — 稳定公开发布
- `clipmate-v0.4/` — v0.4 稳定基线（Site Profiles and Scenario Modes）
- `clipmate-v0.5/` — 已迁移为 `clipmate-v0.6/`，不再作为独立目录存在

## v0.6 主目标

**Asset Pipeline Foundation（图片资源保存底座）**

在 v0.5 文章图片保存能力上，建立 `ClipAsset` / `FigureAsset` / `ImageSaveStrategy` / `assetReport`，为后续更可靠的图片保存、教程模式和导出适配器打底。

## v0.6 版本定位

v0.6.0 仍优先使用 public image URL + Notion external image block。
不下载图片、不上传图片、不做截图、不做 OCR；Notion File Upload 仅作为候选策略记录。

## v0.6+ 续作规则

每个新的可发布 0.x 大版本必须新建 `codex/` 分支和新的版本目录，从上一稳定目录复制后开发；旧目录冻结。

- 每完成一个可验证大版本，版本号递增 0.1.0
- 旧版本目录 `clipmate-v0.1/` 到 `clipmate-v0.4/` 仍禁止修改
- v0.7 起保留 `clipmate-v0.6/` 冻结目录，并在新分支中创建 `clipmate-v0.7/`
- Save to Notion 参考项目只作为架构参考，不能无审查复制第三方代码
- 不采用非官方 Notion 私有接口、cookie 依赖或新增权限，除非先完成安全/隐私评估
- 当前 v0.6.0 已建立 `features/capture`、`features/session`、`features/notion`、`features/assets` 四个底座模块；`NotionSavePlan` 携带图片质量报告，但实际保存仍沿用现有 external URL / paragraph fallback 行为

## Session 规划

| Session | 内容 | 代码 |
|:---:|------|:---:|
| 0 | 版本交接、目录创建、规划 | 仅文档 |
| 1 | Article Image Extraction Core | 提取/过滤 image candidates |
| 2 | Markdown Image Preservation | Markdown 图片语法 |
| 3 | Notion External Image Blocks | external URL image block |
| 4 | Popup/History Lightweight Image Metadata | 图片数量/首图 |
| 5 | Manual QA and Site Cases | QA |
| 6 | Release Readiness | 版本号/build/审查 |
| v0.5.1 | Architecture Foundation | capture/session/notion 分层底座 |
| v0.5.2 | Image Source Recovery & Markdown Profile Compatibility | 图片候选统一、video poster、粗体边界空格 |
| v0.5.3 | Popup Save Summary & Duplicate Save Hints | 保存摘要、可编辑标题、同 URL history 提示 |
| v0.6.0 | Asset Pipeline Foundation | ClipAsset/FigureAsset/ImageSaveStrategy/assetReport |
