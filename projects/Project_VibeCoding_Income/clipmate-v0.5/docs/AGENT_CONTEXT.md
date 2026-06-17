# AGENT_CONTEXT.md — ClipMate v0.5

## 当前开发版本

**clipmate-v0.5/** — 当前唯一开发目录。v0.6.0 继续在该目录推进，以保持可测试小步提交；不修改 v0.1-v0.4。

## 历史/稳定版本（禁止修改）

- `clipmate-v0.1/` — 冻结快照
- `clipmate-v0.2/` — 稳定公开发布
- `clipmate-v0.3/` — 稳定公开发布
- `clipmate-v0.4/` — v0.4 稳定基线（Site Profiles and Scenario Modes）

## v0.5 主目标

**Article Image Saving（文章图片保存）**

让 ClipMate 在剪藏文章时更好保留正文中的关键图片，生成可读的 Markdown 图片语法，在 Notion 中显示为 external image block。

## v0.5 版本定位

v0.5.0 优先使用 public image URL + Notion external image block。
不下载图片、不上传图片、不做截图、不做 OCR。

## v0.5.x 续作规则

v0.5.0 发布准备完成后，架构级更新继续留在 `clipmate-v0.5/` 目录下，以 v0.5.x patch 版本推进。

- 每完成一个可验证功能点，版本号递增 0.0.1
- 旧版本目录 `clipmate-v0.1/` 到 `clipmate-v0.4/` 仍禁止修改
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
