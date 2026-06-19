# AGENT_CONTEXT.md - ClipMate v0.8

更新日期：2026-06-19

## 当前开发版本

- 目录：`clipmate-v0.8/`
- 版本：`0.8.1`
- 当前分支：`codex/clipmate-v0.8-asset-picker`
- 状态：Asset Picker 人工测试阻断已在 v0.8.1 修复并通过自动化；正在处理 v0.8.2 教程结构问题。

## 冻结版本

- `clipmate-v0.1/` 到 `clipmate-v0.4/`：历史快照。
- `clipmate-v0.6/`：Asset Pipeline 稳定快照。
- `clipmate-v0.7/`：Tutorial Mode 0.7.3 稳定基线，本轮禁止修改。

## v0.8 主目标

Asset Picker：

- Popup 发起带 session id 的短生命周期图片选择会话。
- content script 在当前页提供 Shadow DOM 覆盖层。
- 选择结果安全合并到当前草稿、Markdown 与 Notion blocks。
- Popup 支持预览、移除、排序和数量上限。
- 不新增权限，不下载或上传图片，不读取 cookie，不建立站点级缓存。

## 关键实现

- `src/content/assetPicker/assetPickerController.ts`：候选收集、覆盖层、事件与会话清理。
- `src/features/assets/selectedImages.ts`：URL 安全、去重、排序、Markdown 幂等合并。
- `src/popup/hooks/useAssetPicker.ts`：Popup 启动、恢复、取消和结果消费。
- `src/popup/components/AssetPickerPanel.tsx`：图片列表管理 UI。
- `src/platforms/notion/blocks.ts`：教程 ClipDocument 与手选图片合并去重。
- `tests/v080-asset-picker.test.ts`：V0.8 核心自动化覆盖。
- `manual-fixtures/asset-picker.html`：离线人工验收页。
- `docs/V0.8_TEST_DOCUMENT.md`：完整测试与验收文档。

## 续作规则

- V0.7 及更早目录继续冻结，任何修复只进入 V0.8。
- 首先完成 Chrome、Edge 和真实 Notion 人工测试，发现 P0 问题后在 V0.8 独立修复。
- 所有提交继续留在 `codex/clipmate-v0.8-asset-picker`，显式 stage V0.8 路径。
- 不得提交 `node_modules`、`dist`、zip、测试截图、token 或用户内容。
