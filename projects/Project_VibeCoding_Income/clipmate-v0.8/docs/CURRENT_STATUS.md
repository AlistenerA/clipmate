# CURRENT_STATUS.md - ClipMate v0.8 冻结状态

更新日期：2026-06-19

## 版本边界

- `clipmate-v0.1/` 到 `clipmate-v0.7/`：历史冻结目录。
- `clipmate-v0.8/`：v0.8.5 发布快照，完成提交和推送后冻结。
- 发布分支：`codex/clipmate-v0.8-asset-picker`。

## 最终交付

- v0.8.3：全文标题、列表、表格、代码映射为原生 Notion block；清理占位图片描述并消除题注重复；metadata callout 支持安全站点图标。
- v0.8.4：在 Readability 前恢复短代码和 SyntaxHighlighter 容器；采用 DOM 提示、限定 highlight.js fast path、本地 VS Code 语言模型的混合识别；模型失败时不阻断剪藏。
- v0.8.5：Asset Picker 悬停框随视口变化正确更新或隐藏；History 区分复制与 Notion 保存，记录复制格式，并提供校验后的 Notion 页面链接。
- 评论上下文继续维持纯段落协议，但独立图片仍输出 Notion image block；全文模式继续使用结构化转换。
- 未新增 manifest 权限、host permission、远程 API 或存储迁移。

## 最终验证

- `npm run lint`：通过，0 errors。
- `npm run test`：61 files / 2010 tests 全部通过。
- `npm run build`：通过，166 modules transformed；`dist/manifest.json` 为 0.8.5。
- `npm audit --omit=dev`：生产依赖 0 漏洞。
- 完整 `npm audit`：8 项仅开发工具链告警；不进入发布包，不运行 Vitest UI 或对外暴露 Vite 开发服务器。
- `npm run zip`：生成 `clipmate-v0.8.zip`，946315 bytes / 28 entries；仅包含 dist，并包含本地语言模型与权重。

## 已知限制

- `@vscode/vscode-languagedetection` 只发布包含 Node 默认加载器的单一 UMD 入口，Vite 会给出 Node 模块外部化警告；运行时使用显式本地模型加载器，异常时降级到 highlight.js。
- 当前执行环境无法启动受控 Chromium，Chrome/Edge 真实交互未自动化复测。
- 未使用用户 Notion 凭据，因此真实 Notion 页面渲染仍属于人工验收项。

以上限制不阻断代码冻结，但首次分发前仍应按 `docs/V0.8_TEST_DOCUMENT.md` 完成浏览器与真实 Notion 冒烟。
