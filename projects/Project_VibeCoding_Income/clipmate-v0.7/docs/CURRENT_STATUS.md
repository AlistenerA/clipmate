# CURRENT_STATUS.md - ClipMate v0.7 当前进度

更新日期：2026-06-19

## 版本边界

- `clipmate-v0.1/` 到 `clipmate-v0.4/`：历史冻结目录。
- `clipmate-v0.6/`：v0.6 稳定冻结目录，本轮未修改。
- `clipmate-v0.7/`：当前唯一开发与候选发布目录。
- 当前分支：`codex/clipmate-v0.7-tutorial-mode`。

## 当前阶段

**v0.7.3 小版本修复线完成，进入真实浏览器与 Notion 候选验收。**

已完成：

- 新增 Popup“教程”模式，切换模式后立即重新提取并清空旧内容。
- 建立 `ClipMode` 的 `tutorial` 分支和 schema version 1 的 `ClipDocument`。
- 结构化保留标题层级、代码块与语言、块级公式、Markdown 表格、callout、图片题注、视频链接元数据。
- 教程模式在 Markdown 尾部补充缺失的视频链接，不下载视频。
- Notion 保存映射为 heading/code/equation/table/callout/image/bookmark block。
- History 支持 `tutorial` mode，并显示“教程”。旧全文/选区记录继续兼容。
- 新增本地人工测试页、启动脚本和风险测试文档。
- 版本号统一为 0.7.0；manifest 权限和依赖均未增加。
- v0.7.1 识别 Runoob `example_code` 代码容器，保留 TypeScript/LaTeX 换行并推断语言。
- v0.7.1 兼容 `* * *` 分隔线，BBC 无障碍图片题注统一为“题注：”。
- v0.7.1 Popup 预览渲染安全 HTTP(S) 图片，失败时显示文字降级。
- v0.7.1 草稿持久化与 Notion 保存显式使用当前 UI mode，修复教程 History 误记全文的竞态。
- v0.7.2 标准 author / published time 元数据进入统一的 Notion `🔖` 头部，来源、站点、模式、剪藏时间和标签不再散落。
- v0.7.2 教程大表按 Notion 100 children 限制拆分，空公式降级为文本，无题注图片不再用 alt 冒充 caption。
- v0.7.2 区分 Notion 400/409/429/5xx，并向 Popup/History 返回短错误码、HTTP 状态和失败批次。
- v0.7.3 已知视频播放页改为标题、原视频链接、精简描述和评论数摘要，不再保存推荐链接正文。
- v0.7.3 Popup 将独立视频链接显示为视频卡片；YouTube/Vimeo/direct video 映射为 Notion video，其余 provider 安全降级为 bookmark。
- v0.7.3 未知 iframe/embed/object/canvas 仅显示在教程模式测试诊断面板，不进入复制、Notion blocks 或 History 正文。
- 手动图片点选因涉及页面覆盖层与跨 Popup 会话状态，已作为 v0.8 P0 Asset Picker 独立规划。

## 自动化验证

- `npm run lint`：通过，0 errors。
- 定向测试：4 files / 53 tests 通过。
- `npm run test`：56 files / 1984 tests 全部通过。
- `npm run build`：通过，136 modules transformed。
- `dist/manifest.json`：version = 0.7.3。
- `npm run zip`：通过，生成 `clipmate-v0.7.zip`（160440 bytes，仅 dist 产物）。

## 人工验收

按 `docs/V0.7_MANUAL_RISK_QA.md` 执行。发布前至少完成：

- Chrome：教程模式提取、复制、Notion 保存、History。
- Edge：教程模式提取、Notion 保存。
- 真实 Notion：heading/code/equation/table/callout/image/bookmark 类型核对。
- 普通全文、选区、评论上下文回归。

当前环境的浏览器自动化连接被 Windows 沙箱拒绝，因此不能把真实扩展 UI 或真实 Notion 标为已验证。

## 下一步

本轮后续：

1. 用真实 Notion 测试页复测 heading/code/equation/table/image/video、BBC 保存和新错误码。
2. Chrome/Edge 人工通过后冻结 v0.7。
3. v0.8 按 `docs/V0.8_PLAN.md` 另建分支和目录，先实现 Asset Picker。
