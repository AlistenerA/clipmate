# AGENT_CONTEXT.md — ClipMate v0.5

## 当前开发版本

**clipmate-v0.5/** — 当前唯一开发目录。

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
