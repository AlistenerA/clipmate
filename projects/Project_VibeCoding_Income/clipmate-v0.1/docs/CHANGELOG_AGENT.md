# CHANGELOG_AGENT.md — ClipMate v0.1 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

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
