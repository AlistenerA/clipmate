# CURRENT_STATUS.md - ClipMate v0.7 当前进度

更新日期：2026-06-19

## 版本边界

- `clipmate-v0.1/` 到 `clipmate-v0.4/`：历史冻结目录。
- `clipmate-v0.6/`：v0.6 稳定冻结目录，本轮未修改。
- `clipmate-v0.7/`：当前唯一开发与候选发布目录。
- 当前分支：`codex/clipmate-v0.7-tutorial-mode`。

## 当前阶段

**v0.7.1 结构保真修复完成，继续推进 v0.7.x 人工测试修复线。**

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

## 自动化验证

- `npm run lint`：通过，0 errors。
- 定向测试：2 files / 5 tests 通过。
- `npm run test`：54 files / 1971 tests 全部通过。
- `npm run build`：通过，132 modules transformed。
- `dist/manifest.json`：version = 0.7.1。
- `npm run zip`：通过，生成本地 `clipmate-v0.7.zip`（156899 bytes，仅 dist 产物）。

## 人工验收

按 `docs/V0.7_MANUAL_RISK_QA.md` 执行。发布前至少完成：

- Chrome：教程模式提取、复制、Notion 保存、History。
- Edge：教程模式提取、Notion 保存。
- 真实 Notion：heading/code/equation/table/callout/image/bookmark 类型核对。
- 普通全文、选区、评论上下文回归。

当前环境的浏览器自动化连接被 Windows 沙箱拒绝，因此不能把真实扩展 UI 或真实 Notion 标为已验证。

## 下一步

本轮后续：

1. v0.7.2 修复 Notion 原生块兼容、元数据头部与短错误码。
2. v0.7.3 收敛视频页输出和测试专用未知资源诊断，并评估手动图片插入边界。
3. 人工通过后冻结 v0.7；v0.8 另建分支和 `clipmate-v0.8/`。
