# CURRENT_STATUS.md - ClipMate v0.9 当前状态

更新日期：2026-06-20

## 版本边界

- `clipmate-v0.1/` 到 `clipmate-v0.8/`：历史冻结目录。
- `clipmate-v0.9/`：v0.9.3 冻结源码目录；不再新增功能。
- `release-submissions/clipmate-v0.9.3-submission/`：Chrome/Edge 审核提交版归档。
- 当前分支：`codex/clipmate-v0.9-page-aware`。

## v0.9.1-v0.9.3 交付

- v0.9.1：有状态 fenced code 语言增强；关闭围栏不再被改写；相邻 HTML/CSS/JS 代码、正文和 Notion blocks 保序。
- v0.9.1：草稿新增可选 `sourceTabId`，同 URL 双标签页不再互相恢复选区草稿；旧版无 tab id 的选区草稿不自动恢复。
- v0.9.1：状态栏统一显示全文、选区、自适应，删除重复推荐提示；真实 table 与 HTML 源代码继续分别保存为 table/code。
- v0.9.2：页面检测改为主类型加多特征候选，支持站点/路由、DOM、代码容器、选区和可读性信号；跨层只保留脱敏候选。
- v0.9.2：新增 ChatGPT、DeepSeek、豆包完整对话与角色选区提取，过滤输入区、按钮栏、推荐问题和临时思考；新增 GitHub Issue/PR/Discussion 路由。
- v0.9.2：置信度至少 0.75 的技术文章可首次进入自适应；选区、草稿、手动覆盖优先，单个偶然代码片段不触发。
- v0.9.3：全文增加站点正文、保守 Readability、旧提取三候选与质量门禁；旧结果始终兜底，受保护结构不得减少。
- v0.9.3：噪声清理使用精确 token/角色规则，正文根、长内容和代码、表格、图片、公式等结构不会因宽泛子串被删除。
- 未新增 manifest 权限、远程分类服务、遥测、Cookie、字幕、下载、私有站点 API、WASM 或分类模型。

## 自动化与构建

- `npm run lint`：通过，0 errors。
- `npm run test`：64 files / 2043 tests 全部通过。
- `npm run build`：通过，171 modules transformed；`dist/manifest.json` 为 0.9.3。
- 定向测试覆盖 v0.9.1 35 项、v0.9.2 6 项、v0.9.3 5 项，并保留 PA、REG、OUT、HIST、Asset Picker 全量回归。
- Runoob、DeepSeek、豆包使用脱敏最小 fixture；ChatGPT 与 GitHub 使用稳定 DOM/路由结构测试。
- Playwright 隔离 QA：视频页首次显示“模式：自适应”，推荐只显示一次，展开全部模式后手动全文覆盖保持；控制台 0 error / 0 warning。
- `release-submissions/clipmate-v0.9.3-submission/extension/`：由最新生产构建生成；入口 HTML 规范到包根目录，移除非运行必需图标源文件。
- `release-submissions/clipmate-v0.9.3-submission/clipmate-v0.9.3.zip`：924131 bytes / 26 entries，SHA-256 `CE507BAF3E80E07F6EE778FDCCD6DDA0264F0651924FD67BCCFB5DA966318226`。
- zip 根目录直接包含唯一 `manifest.json`；禁止目录、source map、日志、敏感凭据和危险路径条目均为 0。

## 人工验收门禁

- 当前环境无法连接用户真实 Chrome 会话，因此尚未完成 Chrome/Edge 解压扩展双浏览器验证。
- 同 URL 双标签页、Bilibili、Runoob、GitHub Issue、Bing、三种 AI 对话及真实 Notion 页面仍需按人工文档复测。
- v0.9.3 已按用户指令冻结、归档并进入提交版；后续只接受阻断发布的缺陷修复。
- Chrome/Edge 精确提交包加载与真实 Notion 保存仍是商店上传前人工门禁。
