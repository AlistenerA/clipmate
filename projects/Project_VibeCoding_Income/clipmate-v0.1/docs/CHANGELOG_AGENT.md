# CHANGELOG_AGENT.md — ClipMate v0.1 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

---

## Session 2：实现 shared 基础层与 Content Script 提取 (2026-06-10)

### 新增文件
- `src/shared/types/clip.types.ts` — ClipMode, ExtractedContent, ClipDraft, ClipMetadata
- `src/shared/types/settings.types.ts` — ClipMateSettings 接口
- `src/shared/types/message.types.ts` — 消息协议类型（ClipMateMessage, ExtractPageResponse 等）
- `src/shared/constants/messageTypes.ts` — 6 种消息类型常量
- `src/shared/constants/defaults.ts` — DEFAULT_SETTINGS, STORAGE_KEYS
- `src/shared/storage/storage.ts` — chrome.storage.local Promise 封装（getSettings/saveSettings/getLastClipDraft/saveLastClipDraft/clearLastClipDraft）
- `src/shared/messaging/sendMessage.ts` — sendToActiveTab / sendToRuntime 消息工具
- `src/shared/utils/logger.ts` — 日志工具（仅输出模式+字数，绝不出全文/Token）
- `src/shared/utils/errors.ts` — ClipMateError 类 + ErrorCodes 常量
- `src/shared/utils/formatMarkdown.ts` — countWords / snippet 工具函数
- `src/content/extractors/readabilityExtractor.ts` — @mozilla/readability 全文提取
- `src/content/extractors/selectionExtractor.ts` — 用户选区提取（组合 getSelectionHtml + getSelectionText）
- `src/content/extractors/fallbackExtractor.ts` — Readability 失败时降级到 body.innerText
- `src/content/parser/metaParser.ts` — 元数据解析（OG + 标准 meta）
- `src/content/parser/htmlToMarkdown.ts` — turndown HTML→Markdown（h1-h6/p/a/img/ul/ol/li/code/del/s）
- `src/content/parser/contentCleaner.ts` — 移除 script/style/noscript/iframe
- `src/content/selection/getSelectionHtml.ts` — 获取选区 HTML
- `src/content/selection/getSelectionText.ts` — 获取选区纯文本
- `tests/shared-utils.test.ts` — 14 个单元测试（countWords/snippet/errors/constants）

### 修改文件
- `src/content/index.ts` — 从占位空壳重写为完整消息处理：监听 EXTRACT_CURRENT_PAGE 和 GET_SELECTION，协调提取器/解析器/Sanitizer
- `src/shared/types/index.ts` — 改为 barrel re-export
- `src/shared/constants/index.ts` — 改为 barrel re-export
- `src/shared/utils/index.ts` — 改为 barrel re-export
- `src/shared/storage/index.ts` — 改为 barrel re-export
- `src/shared/messaging/index.ts` — 改为 barrel re-export

### 新增依赖
- `@mozilla/readability` (dependencies) — Mozilla 正文提取
- `turndown` (dependencies) — HTML → Markdown 转换
- `@types/turndown` (devDependencies) — turndown 类型定义
- `jsdom` (devDependencies) — Vitest 运行环境

### 改动摘要
- 完整的 shared 基础层：类型系统、消息协议、chrome.storage Promise 封装、日志/错误工具
- Content Script 提取链路：clone document → clean → Readability → fail? → fallback → Markdown
- 选区提取：检查 selection → 返回 html+text → 无选区返回 { success: false, error: 'NO_SELECTION' }
- 构建：`npm run build` 通过，Content Script bundle 47.73KB (gzip 16.24KB)
- 测试：`npm run test` 通过，14 个测试
- 安全：Token 不在日志中输出，日志仅输出模式和字数

---

## Session 1：创建 Vite + React + MV3 插件脚手架 (2026-06-10)

### 新增文件
- `package.json` — npm 项目配置，含 react/vite/crxjs/tailwind/eslint/prettier/vitest
- `tsconfig.json` — TypeScript 配置（ES2020, react-jsx, bundler 模块解析）
- `vite.config.ts` — Vite 配置 + React 插件 + @crxjs/vite-plugin + Vitest
- `manifest.config.ts` — Manifest V3 声明（popup/options/background/content）
- `tailwind.config.js` — Tailwind CSS 配置
- `postcss.config.js` — PostCSS 配置（tailwindcss + autoprefixer）
- `.eslintrc.cjs` — ESLint 配置（TypeScript + React Hooks + Prettier）
- `.prettierrc` — Prettier 格式化配置
- `src/background/index.ts` — Service Worker 入口
- `src/content/index.ts` — Content Script 入口
- `src/popup/index.html` — Popup HTML 入口
- `src/popup/main.tsx` — Popup React 挂载点
- `src/popup/App.tsx` — Popup UI 组件（显示版本号 + 打开设置按钮）
- `src/options/index.html` — Options HTML 入口
- `src/options/main.tsx` — Options React 挂载点
- `src/options/App.tsx` — Options UI 组件（设置页占位）
- `src/styles/globals.css` — Tailwind 指令
- `src/shared/types/index.ts` — 类型定义占位
- `src/shared/constants/index.ts` — 常量占位
- `src/shared/messaging/index.ts` — 消息通信占位
- `src/shared/storage/index.ts` — 存储封装占位
- `src/shared/utils/index.ts` — 工具函数占位
- `tests/example.test.ts` — Vitest 占位测试
- `public/icons/` — 图标目录（空）

### 改动摘要
- 完成 Vite + React + TypeScript + Manifest V3 插件脚手架搭建
- `npm install` 成功安装 335 个包
- `npm run build`（tsc --noEmit + vite build）成功，生成 `dist/` 目录
- dist/ 包含：manifest.json, service-worker-loader.js, popup/options HTML+JS, content script assets
- 权限最小化：仅 storage + activeTab
- 所有 UI 入口均为空壳，功能待后续 Session 实现

---

## Session 0 文档修补 (2026-06-10)

### 修改文件
- `docs/AGENT_CONTEXT.md` — 项目结构改为分层目录，放宽目录创建限制
- `docs/CURRENT_STATUS.md` — 统一后续 Session 规划，加入人工验收节点
- `docs/TEST_LOG.md` — 补充实际执行的 `New-Item` 命令记录和未执行命令说明
- `docs/CHANGELOG_AGENT.md` — 本文档

### 改动摘要
- 将项目结构从扁平改为分层（允许 `handlers/`、`extractors/`、`parser/`、`selection/`、`components/`、`hooks/` 子目录）
- 删除"禁止创建以上未列出的目录和文件"的硬限制，改为"新增文件必须服务于当前 Session"
- Session 规划调整为 5 个开发 Session + 2 个人工验收点
- 测试日志补充了实际执行过的目录创建命令
- 明确标注 npm install / build / test / lint 均未执行

---

## Session 0 初始创建 (2026-06-10)

### 新增文件
- `docs/AGENT_CONTEXT.md` — 项目总上下文和固定规则
- `docs/CURRENT_STATUS.md` — 当前进度追踪
- `docs/DECISIONS.md` — 技术决策记录（9 条决策）
- `docs/CHANGELOG_AGENT.md` — 本文档
- `docs/TEST_LOG.md` — 测试记录
- `docs/ISSUES.md` — 已知问题追踪
- `docs/RELEASE_CHECKLIST.md` — 发布检查清单
- `docs/PRIVACY_POLICY_DRAFT.md` — 隐私政策草稿
- `docs/STORE_LISTING_DRAFT.md` — 商店文案草稿

### 改动摘要
- 创建了 `clipmate-v0.1/docs/` 目录和全部 9 个续接文档
- 明确了 v0.1 范围：13 项必做、10 项禁止
- 记录了 9 条技术决策
- 记录了 4 条已知风险
- 未安装任何依赖，未创建任何代码文件

