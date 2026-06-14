# CHANGELOG_AGENT.md — ClipMate v0.5 每轮修改记录

---

## v0.5 Session 1：Article Image Extraction Core (2026-06-14)

### 性质

实现纯函数文章图片候选提取核心模块。只做提取+测试+文档，不做 Markdown/Notion/UI 接入。

### 新增文件

- `src/content/extractors/articleImages.ts` — 图片候选提取模块
- `tests/article-images.test.ts` — 62 个测试

### 核心能力

- 从 Document/Element 提取所有 `<img>` 元素
- 通过 `determineOrigin()` 单次遍历识别 `img` / `picture` / `figure` 来源
- `getBestSrc()` 从 src / currentSrc / `el.src` 取最优 URL
- `resolveUrl()` 把相对 URL、协议相对 URL 转绝对 URL
- `extractCaption()` 从 `<figcaption>` 提取 caption（最长 300 字截断）
- 噪声过滤：avatar/icon/logo/badge/emoji/sprite/thumb/favicon/qr/loading 等 class/id 和 URL 模式
- 过滤 tracking pixel（1x1 或小尺寸+关键词）
- 过滤 data: URI（可选保留）和 blob: URI
- 按 minWidth/minHeight 过滤过小图片
- 去重、maxImages 限制
- 纯函数，不访问网络/chrome API/storage
- 不下载/上传/缓存图片

### 修改文件

- 无（仅新增文件，未修改现有代码）

### 验证

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：42 文件，1753 测试全部通过（新增 62）
- `npm run build`：构建成功

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改 `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未接入 Markdown / Notion / Popup / History

---

## v0.5 Session 0：版本交接、目录创建与文章图片保存规划 (2026-06-14)

### 性质

从 clipmate-v0.4 稳定基线 (1850c64) 复制创建 clipmate-v0.5 开发目录。更新所有交接文档，制定 Article Image Saving 分 Session 规划。不实现功能代码。

### 操作

1. robocopy clipmate-v0.4 → clipmate-v0.5（排除 node_modules/dist/build/coverage/.git/.wolf/.opencode/.playwright-mcp/*.zip/.env）
2. npm install 在 v0.5 目录
3. 更新 AGENT_CONTEXT.md / CURRENT_STATUS.md / V0.5_PLAN.md / DECISIONS.md / CHANGELOG_AGENT.md / TEST_LOG.md / ISSUES.md
4. lint 0 / 1691 tests pass / build success

### 新增文件

- `clipmate-v0.5/` 整个目录（从 v0.4 复制）
- `clipmate-v0.5/docs/AGENT_CONTEXT.md`（重写）
- `clipmate-v0.5/docs/CURRENT_STATUS.md`（重写）
- `clipmate-v0.5/docs/V0.5_PLAN.md`（新增）
- `clipmate-v0.5/docs/DECISIONS.md`（重写）
- `clipmate-v0.5/docs/CHANGELOG_AGENT.md`（重写）
- `clipmate-v0.5/docs/TEST_LOG.md`（重写）
- `clipmate-v0.5/docs/ISSUES.md`（重写）

### 未修改

- `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- `../../opencode.json`
- `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未实现功能代码
