# CHANGELOG_AGENT.md — ClipMate v0.5 每轮修改记录

---

## v0.5 Session 5：Manual QA and Site Cases (2026-06-14)

### 性质

使用 12 个站点场景的 fixture QA 验证 v0.5 文章图片保存全链路（提取→Markdown→Notion blocks→Popup/History 元数据）。未执行真实网页 QA、未执行真实 Notion save。不开发新功能，只做 QA + 测试补充 + 文档更新。

### 新增文件

- `tests/image-site-cases.test.ts` — 52 个 QA 场景测试

### 测试覆盖

| 场景 | 测试数 | 覆盖 |
|------|:---:|------|
| 新闻文章 | 7 | 多图 + caption + figure/figcaption + 相对 URL + 噪声过滤 + 元数据 |
| 博客文章 | 5 | figure/figcaption + alt/title + avatar/logo 过滤 + heading/code block 保持 |
| 技术文档 | 5 | 截图 + icon/favicon/emoji/spinner 过滤 + code block 不受影响 |
| CSDN-like | 7 | 懒加载（Turndown data-src/data-original）+ srcset + avatar/badge 过滤 |
| 图片去重 | 3 | extractArticleImages + Markdown + Notion blocks 去重 |
| 噪声过滤 | 4 | logo/avatar/badge/emoji/sprite/thumb/qr/pixel 全过滤 |
| Markdown 图文顺序 | 2 | 文本-图片交错顺序保持 |
| Notion blocks 顺序 | 3 | paragraph-image 交替 + external type 校验 |
| Popup/History 元数据 | 4 | buildHistoryInput + 成功/失败保存路径 |
| selection 回归 | 4 | selection/comment-context 不继承 fullpage 图片信息 |
| 边缘情况 | 5 | data:/blob: URI / 过小尺寸 / 空 alt |
| 全链路 smoke | 2 | extract→markdown→blocks→metadata 集成 |

### QA 发现

- `extractArticleImages.getBestSrc` 不处理 data-src/data-original 懒加载属性（Turndown img rule 正确处理）
- `markdownToContentBlocks` 当前仅输出 paragraph/image blocks（不处理 heading_2 等）
- "ad-banner" class 不在已知噪声 class 列表中（广告图类名多样性，已知局限）

### 修改文件

- `docs/CURRENT_STATUS.md` — Session 5 完成 + Session 进度更新
- `docs/CHANGELOG_AGENT.md` — 本轮记录
- `docs/TEST_LOG.md` — 新增测试记录
- `docs/ISSUES.md` — QA 发现记录
- `docs/DECISIONS.md` — 新增 D-v0.5-018 / D-v0.5-019

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改 `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未修改源码（`src/` 目录无变更）
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未执行真实 Notion save
- 未修改已有测试

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：46 files, 1880 tests pass（新增 52 个）
- `npm run build`：成功

---

## v0.5 Session 4：Popup / History Lightweight Image Metadata (2026-06-14)

### 性质

在 Popup 和 History 中轻量展示文章图片信息（imageCount / firstImageUrl / skippedImageCount），不下载/上传/缓存图片，不保存完整图片 URL 列表。

### 修改文件

- `src/shared/types/clip.types.ts` — `ExtractedContent` 新增 `imageCount?` / `firstImageUrl?` / `skippedImageCount?`
- `src/shared/types/settings.types.ts` — `ClipHistoryItem` 新增 `imageCount?` / `firstImageUrl?` / `skippedImageCount?`
- `src/shared/storage/storage.ts` — `CreateHistoryItemInput` 和 `addHistoryItem()` 新增 image 元数据字段
- `src/popup/utils/historyPayload.ts` — `HistoryInput` 和 `buildHistoryInput()` 新增 image 元数据字段
- `src/background/handlers/notionHandler.ts` — 成功/失败保存路径传递 image 元数据到历史记录；retry update 通过 merge 保留已有 image 元数据
- `src/content/index.ts` — `buildContent()` 默认 selection mode imageCount=0；新增 `attachImageMetadata()` 在 fullpage 路径注入 image 元数据；低信心路径 imageCount=0
- `src/popup/components/StatusBar.tsx` — 新增 `imageCount?` prop，图片>0 时显示紫色「图片 N」徽章
- `src/popup/App.tsx` — 传递 `content.imageCount` 到 StatusBar
- `src/options/components/HistoryItem.tsx` — fullpage mode 下 imageCount>0 时显示紫色「图片 N」标签

### 新增文件

- `tests/image-metadata.test.ts` — 18 个测试

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改 `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未修改 Notion image block 核心逻辑
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未修改 selection / comment-context 图片逻辑
- 未记录完整图片 URL 列表到 history

### 核心能力

- fullpage extraction 自动附加 imageCount / firstImageUrl / skippedImageCount
- selection / comment-context mode：imageCount=0，不显示图片信息
- Popup StatusBar：图片>0 时显示紫色「图片 N」徽章
- HistoryItem：fullpage 且 imageCount>0 时显示紫色「图片 N」标签
- History 存储：save/retry/failed 路径均保留 image 元数据
- updateHistoryItem merge 机制自动保留 retry 时的 image 元数据

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：45 files, 1828 tests pass（新增 18 个）
- `npm run build`：成功

---

## v0.5 Session 3：Notion External Image Blocks (2026-06-14)

### 性质

将 Markdown 图片语法 `![alt](url)` 转换为 Notion `image` block（type: external）。替换 `chunkedParagraphBlocks` 为 `markdownToContentBlocks`，逐段落检测图片并生成 image block。不接入 Notion File Upload API，不下载/上传/缓存图片。

### 修改文件

- `src/platforms/notion/blocks.ts` — 新增 `IMAGE_MARKDOWN_RE`、`isValidExternalImageUrl()`、`tryImageBlock()`、`markdownToContentBlocks()`（导出）；移除未使用的 `chunkedParagraphBlocks`；`buildNotionBlocks()` 使用 `markdownToContentBlocks()`

### 新增文件

- `tests/notion-image-blocks.test.ts` — 29 个测试

### 未修改

- 未修改 `clipmate-v0.1/` / `clipmate-v0.2/` / `clipmate-v0.3/` / `clipmate-v0.4/`
- 未修改 `../../opencode.json`
- 未修改 `package.json` / `manifest.config.ts` version
- 未新增依赖、未新增权限
- 未修改 Popup/History UI
- 未接入 Notion File Upload API
- 未下载/上传/缓存图片
- 未新增 FileReader/canvas/toDataURL/createObjectURL

### 核心能力

- `markdownToContentBlocks()`：替换 `chunkedParagraphBlocks`，逐段落检测 `![alt](url)` 语法
- 仅接受 http/https external URL；data:/blob:/非 http URL 降级为 paragraph block
- image block 使用 `{ type: 'external', external: { url } }` 结构
- alt 文本作为 caption（空 alt → 空 caption）
- 图片转换失败不影响正文段落保存
- comment-context 模式同步受益（共用 `markdownToContentBlocks`）

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：44 files, 1810 tests pass（新增 29 个）
- `npm run build`：成功

### 性质

将 Session 1 的图片提取能力接入 Markdown 生成链路。增强 Turndown `img` rule 的噪声过滤，添加去重后处理，在 Fullpage article clipping 的 Markdown 中保留正文图片语法 `![alt](url)`。

### 修改文件

- `src/content/extractors/articleImages.ts` — 导出 `isNoiseByClassName` / `isNoiseByAttribute` / `isDataUri` / `isBlobUri` 供 Markdown 层复用
- `src/content/parser/htmlToMarkdown.ts` — 增强 `img` Turndown rule（噪声过滤 + 尺寸过滤 + 去重 + alt 兜底 + 相对 URL 解析）；新增 `deduplicateImageMarkdown()` 后处理；新增 `pageUrl` 参数
- `src/content/index.ts` — 引入 `extractArticleImages`；新增 `injectMissingImages()` 安全网（将 Markdown 遗漏的图片追加到末尾 Images 区块）；`buildContent` 和 fallback 路径传递 `pageUrl`

### 新增文件

- `tests/markdown-images.test.ts` — 28 个测试

### 未修改

- 未修改 selection / comment-context 链路
- 未修改 Notion blocks 保存链路
- 未修改 Popup/History UI
- 未新增依赖/权限/版本号

### 测试

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：43 files, 1781 tests pass（新增 28 个）
- `npm run build`：成功

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
