# TEST_LOG.md — ClipMate v0.7 测试记录

---

## v0.7.3 自动验证（2026-06-19）

- `npm run lint`：通过，0 errors。
- 定向回归：4 files / 53 tests 通过。
- `npm run test`：56 files / 1984 tests 通过。
- `npm run build`：通过，136 modules transformed。
- Browser Plugin：Windows 沙箱拒绝启动，未完成真实扩展 UI 与真实 Notion 自动化。
- 安全边界：诊断仅记录资源 kind、短 label、HTTP(S) URL；不记录资源内容，不进入保存 blocks。
- 威胁检查：页面 DOM 视为不可信输入；provider 使用精确 host 后缀，资源最多 12 条、label 最长 120 字，React 默认转义；未使用 HTML 注入、cookie、长期 storage 或新增网络权限。
- `npm run zip`：通过，候选包 160440 bytes；`dist/manifest.json` 为 0.7.3，权限仍为 `storage`、`activeTab` 和 Notion API host。

---

## v0.7.2 Notion Save Resilience (2026-06-19)

### 自动化命令

```pwsh
npm run test -- --run tests/v072-notion-resilience.test.ts tests/tutorial-notion-blocks.test.ts tests/notion-blocks.test.ts tests/notion-client.test.ts tests/notion-errors.test.ts tests/history-save-flow.test.ts tests/history-retry-flow.test.ts
npm run lint
npm run test
npm run build
npm run zip
```

### 结果

- 定向测试：7 files / 83 tests 通过。
- lint：通过，0 errors。
- 完整测试：55 files / 1979 tests 全部通过。
- build：通过，132 modules transformed，`dist/manifest.json` version = 0.7.2。
- zip：通过，`clipmate-v0.7.zip` 为 158029 bytes，仅包含构建产物；zip 保持 untracked。
- 官方文档页面 HTTP 200：block、append children、status codes 三页均成功读取并核对相关契约。

### 新增/更新测试

- 标准作者、发布日期元数据提取。
- Notion 合并元数据 callout 的来源、作者、日期、模式与标签。
- 205 行数据表拆成 3 张表，任一 nested children 不超过 100。
- 无题注图片 caption 为空。
- Popup 短错误文案包含 code / batch / HTTP status。
- 400 response 只保留安全 `code`，不把响应 message 带入错误对象或 UI。

### 人工测试状态

- 未使用真实 Token/Page ID，未向用户 Notion 写入数据。
- 待复测 BBC 文章保存失败时的新错误摘要；该摘要可判断是 block schema、权限、限流还是服务端问题。

## v0.7.1 Tutorial Fidelity & Preview Fixes (2026-06-19)

### 自动化命令

```pwsh
npm run test -- --run tests/v071-tutorial-fidelity.test.ts tests/clip-document.test.ts tests/markdown-preview.test.ts
npm run lint
npm run test
npm run build
npm run zip
```

### 结果

- 定向测试：3 files / 49 tests 通过。
- 首次全量测试发现题注规范误影响普通站点；收窄为 BBC 无障碍前缀后，5 files / 186 个受影响回归测试通过。
- lint：通过，0 errors。
- 完整测试：54 files / 1971 tests 全部通过。
- build：通过，132 modules transformed，`dist/manifest.json` version = 0.7.1。
- zip：通过，`clipmate-v0.7.zip` 为 156899 bytes，仅包含构建产物；zip 保持 untracked。
- Vitest/Vite 在 Windows 沙箱内仍因父目录读取权限失败，使用相同命令在批准环境重跑；未把沙箱失败记为测试失败。

### 新测试

- Runoob TypeScript `example_code` 转 fenced code。
- LaTeX 代码语言推断与换行保真。
- BBC 图片题注无障碍前缀规范。
- `* * *` 分隔线在预览和 `ClipDocument` 中一致识别。
- 图片预览仅接受 HTTP(S)，拒绝 `data:` / `javascript:`。

### 人工测试状态

- 内置浏览器连接仍被 Windows 沙箱拒绝，未冒充真实 Popup / Edge QA。
- 待重新加载 v0.7.1 unpacked 扩展验证：远程图片成功、图片防盗链失败降级、教程 History 标签。

## v0.7.0 Tutorial Mode (2026-06-18)

### 自动化命令

```pwsh
npm run lint
npm run test -- --run tests/clip-document.test.ts tests/tutorial-notion-blocks.test.ts
npm run test
npm run build
npm run zip
```

### 结果

- lint：通过，0 errors。
- 定向测试：2 files / 5 tests 通过。
- 完整测试：53 files / 1966 tests 通过。
- build：通过，132 modules transformed。
- zip：通过，`clipmate-v0.7.zip` 为 156088 bytes / 23 entries，含 manifest，不含 src/tests/docs/node_modules/package/.env。
- `qa:tutorial` fixture：本地 HTTP 200，标题、公式和视频测试节点均存在；验证后服务已停止。
- 首次定向 Vitest 在 Windows 沙箱内因父目录读取权限失败；按项目规则在批准的沙箱外重跑后通过，未把失败误判为测试结果。
- 首次 build 发现 History mode 未包含 `tutorial`；同步共享 `ClipMode` 后重跑通过。

### 新测试

- `tests/clip-document.test.ts`：结构保真、视频去重/协议安全、Markdown 视频元数据。
- `tests/tutorial-notion-blocks.test.ts`：教程结构到 Notion 原生 block、教程草稿接入。

### 人工测试状态

- 本地浏览器自动化连接被 Windows 沙箱拒绝，未完成真实 Popup 点击与截图。
- Chrome/Edge、真实 Notion 保存、外部图片与视频链接表现：待用户按 `V0.7_MANUAL_RISK_QA.md` 验收。

---

## v0.6.0 Folder Promotion (2026-06-17)

### 性质

版本目录迁移验证。确认 `clipmate-v0.5/` 已迁移为 `clipmate-v0.6/`，版本号保持 0.6.0，并生成本地 v0.6 zip 归档。

### 运行命令

```bash
npm run lint
npm run test
npm run build
npm run zip
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：51 个测试文件，1959 个测试，全部通过
- `npm run build`：构建成功，dist/manifest.json version = 0.6.0
- `npm run zip`：成功，生成本地 `clipmate-v0.6.zip`

### 沙箱说明

Vitest 和 Vite build 在当前 Windows 沙箱中读取 `vite.config.ts` 时可能触发 `Access is denied`，需按规则用同一命令在沙箱外重跑。

---

## v0.6.0 (2026-06-17)

### 性质

Asset Pipeline Foundation 测试。覆盖 article image candidates → figure assets、Markdown 图片去重、Notion/Markdown 保存策略、File Upload external import 候选状态、失败原因和 Notion save plan `assetReport`。

### 运行命令

```bash
npx vitest run tests/asset-pipeline.test.ts tests/architecture-foundation.test.ts
npm run lint
npm run test
npm run build
```

### 结果

- `npx vitest run tests/asset-pipeline.test.ts tests/architecture-foundation.test.ts`：2 个测试文件，18 个测试，全部通过
- `npm run lint`：0 errors, 0 warnings
- `npm run test`：51 个测试文件，1959 个测试，全部通过
- `npm run build`：构建成功，dist/manifest.json version = 0.6.0

### 新增测试覆盖

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| Asset creation | 2 | article image candidates、Markdown 图片去重 |
| Image save strategy | 5 | Notion external ready、proxy/resize candidate、data/blob/relative blocked、Markdown reference、direct URL predicate |
| Quality report | 1 | ready / candidate / blocked 统计与 issue reason |
| Notion save plan assetReport | 2 | assetReport 挂载、File Upload candidate 报告 |

### 沙箱说明

Vitest 和 Vite build 在当前 Windows 沙箱中读取 `vite.config.ts` 时触发 `Access is denied`，已按规则用同一命令在沙箱外重跑并通过。

---

## v0.5.3 (2026-06-17)

### 性质

Popup Save Summary & Duplicate Save Hints 测试。覆盖同 URL saved history 检索、失败记录过滤、最近保存排序、重复保存时间提示，以及全量回归。

### 运行命令

```bash
npx vitest run tests/popup-recent-history.test.ts
npm run lint
npm run test
npm run build
```

### 结果

- `npx vitest run tests/popup-recent-history.test.ts`：1 个测试文件，8 个测试，全部通过
- `npm run lint`：0 errors, 0 warnings
- `npm run test`：50 个测试文件，1949 个测试，全部通过
- `npm run build`：构建成功，dist/manifest.json version = 0.5.3

### 新增测试覆盖

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| Recent history lookup | 4 | 空 URL、无匹配、失败记录过滤、最近 saved 记录排序 |
| Duplicate hint formatting | 4 | 刚刚、分钟、小时、天数提示 |

### 沙箱说明

Vitest 和 Vite build 在当前 Windows 沙箱中读取 `vite.config.ts` 时触发 `Access is denied`，已按规则用同一命令在沙箱外重跑并通过。

---

## v0.5.2 (2026-06-17)

### 性质

CCTV-like Image Source Recovery & Markdown Profile Compatibility 测试。覆盖懒加载图片候选统一、video poster fallback、推荐区图片过滤、Obsidian/Typora 加粗边界空格兼容，以及全量回归。

### 运行命令

```bash
npx vitest run tests/article-images.test.ts tests/markdown-images.test.ts tests/markdown-profiles.test.ts
npm run lint
npm run test
npm run build
```

### 结果

- `npx vitest run tests/article-images.test.ts tests/markdown-images.test.ts tests/markdown-profiles.test.ts`：3 个测试文件，169 个测试，全部通过
- `npm run lint`：0 errors, 0 warnings
- `npm run test`：49 个测试文件，1941 个测试，全部通过
- `npm run build`：构建成功，dist/manifest.json version = 0.5.2

### 新增/更新测试覆盖

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| Article image source candidates | 5 | placeholder `src` + `data-src/data-original`、`srcset`、`picture source`、`video poster` |
| Markdown CCTV-like images | 3 | lazy article image、video poster fallback、推荐区 ancestor 过滤 |
| Markdown profile spacing | 3 | CJK/Latin 粗体边界空格、fenced code block 不改写 |

### 沙箱说明

Vitest 和 Vite build 在当前 Windows 沙箱中读取 `vite.config.ts` 时触发 `Access is denied`，已按规则用同一命令在沙箱外重跑并通过。

---

## v0.5.1 (2026-06-17)

### 性质

Architecture Foundation 测试。覆盖 capture/session/notion 三个新 feature 边界，以及全量回归。

### 运行命令

```bash
npx vitest run tests/architecture-foundation.test.ts
npm run lint
npm run test
npm run build
```

### 结果

- `npx vitest run tests/architecture-foundation.test.ts`：1 个测试文件，8 个测试，全部通过
- `npm run lint`：0 errors, 0 warnings
- `npm run test`：49 个测试文件，1930 个测试，全部通过
- `npm run build`：构建成功，dist/manifest.json version = 0.5.1

### 新增测试覆盖 (tests/architecture-foundation.test.ts, 8 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| Capture draft | 3 | createClipDraft、正文读取 fallback、空正文不可保存 |
| Clip session | 3 | 创建 session、状态转换、session → SaveToNotionPayload |
| Notion save plan | 2 | token/page/content 校验、有效 payload 生成 blocks 和 retry metadata |

### 沙箱说明

Vitest 和 Vite build 在当前 Windows 沙箱中读取 `vite.config.ts` 时触发 `Access is denied`，已按规则用同一命令在沙箱外重跑并通过。

---

## v0.5 Session 6 (2026-06-14)

### 性质

Release Readiness 测试。验证版本号变更后的构建和全量测试。

### 运行命令

```bash
npm run lint
npm run test
npm run build
npm run zip
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：48 个测试文件，1922 个测试，全部通过
- `npm run build`：构建成功，dist/manifest.json version = 0.5.0
- `npm run zip`：成功，clipmate-v0.5.zip (146KB)

### 测试文件列表（48 files, 1922 tests）

所有已有测试全部通过，无新增失败、无删除、无降低。

### 安全扫描
- Token/API Key 扫描：0 真实泄露
- 危险 API 扫描：0 发现
- 远程代码风险扫描：0 发现

---

## v0.5 Session 5.2 (2026-06-14)

### 性质

Image Caption Placement & Markdown Image Layout Polish 测试。覆盖 Markdown 题注拆分、Notion image.caption 合并、selection 回归。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：48 个测试文件，1922 个测试，全部通过（新增 14 个）
- `npm run build`：构建成功

### 新增测试覆盖 (tests/image-caption-layout.test.ts, 14 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| Markdown 题注拆分 | 6 | Sina-like glue 拆分、分行、正文保留、figure+figcaption、去重、无题注图片 |
| Notion image.caption | 7 | 合并 caption、alt fallback、无题注、长 caption 截断、不紧跟图片的 italic 保留、混合场景 |
| 回归 | 1 | selection/comment-context 不受影响 |

### 已有测试

- 1908 个已有测试全部通过，无新增失败、无删除、无降低

---

## v0.5 Session 5.1 (2026-06-14)

### 性质

Sina Image Pollution Guard & Notion Image URL Compatibility 测试。覆盖正文防污染、祖先噪声检测、Notion URL 兼容性过滤、selection 回归。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：47 个测试文件，1908 个测试，全部通过（新增 28 个）
- `npm run build`：构建成功

### 新增测试覆盖 (tests/sina-image-pollution.test.ts, 28 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| 正文图片保留 | 3 | Sina 全页 4 张正文图 + article-only 提取 + fragment 提取 |
| 噪声过滤 | 7 | n.sinaimg.cn/default 过滤、sinakd 过滤、k.sinaimg.cn 正文图保留、isNoiseUrl 单元测试 |
| 祖先噪声检测 | 8 | recommend/hot-news/sidebar/related-articles/feed-card/trending 检测 + article 不应检测 + ranking |
| Notion URL 兼容性 | 7 | body CDN 图片转 image block、api/resize URL 降级为 paragraph、混合场景、降级不阻断 |
| Markdown 纯净度 | 2 | 正文 HTML 无污染 URL、article element 只含正文图 |
| selection 回归 | 2 | selection 无图片语法、零图片 fragment 返回空 |

### 已有测试

- 1880 个已有测试全部通过，无新增失败、无删除、无降低

### 已有测试调整

- `image-site-cases.test.ts`：CSDN 推荐图期望从 >=2 调整为 >=1（推荐图现在被 ancestor 噪声检测正确过滤）
- `sina-image-pollution.test.ts`：维度查询参数 URL 期望从 paragraph 改为 image（CDN 直接参数兼容）

---

## v0.5 Session 5 (2026-06-14)

### 性质

Manual QA and Site Cases — fixture QA 测试。未执行真实网页 QA、未执行真实 Notion save。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：46 个测试文件，1880 个测试，全部通过（新增 52 个）
- `npm run build`：构建成功

### 新增测试覆盖 (tests/image-site-cases.test.ts, 52 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| 新闻文章 | 7 | 多图 + caption + figure/figcaption + 相对 URL + 噪声过滤 + Markdown + Notion blocks + 元数据 |
| 博客文章 | 5 | figure/figcaption + alt/title + avatar/logo 过滤 + heading 保持 |
| 技术文档 | 5 | 截图 + icon/favicon/emoji/spinner 过滤 + code block 不受影响 + Notion blocks |
| CSDN-like | 7 | 懒加载 Turndown（data-src/data-original）+ srcset + avatar/badge 过滤 + Markdown 顺序 |
| 图片去重 | 3 | extractArticleImages 去重 + Markdown 去重 + Notion blocks 去重 |
| 噪声过滤 | 4 | logo/avatar/badge/emoji/sprite/thumb/qr-code/pixel 全过滤 + skip reasons |
| Markdown 图文顺序 | 2 | 文本-图片交错顺序 + Notion blocks paragraph-image 顺序 |
| Notion blocks 顺序 | 3 | paragraph-image 交替 + 精确数量 + external type 校验 |
| Popup/History 元数据 | 4 | buildHistoryInput + 成功保存 + 失败保存 + undefined handling |
| selection 回归 | 4 | selection 无图片语法 + imageCount=0 + comment-context 不受影响 + 零图片页面 |
| 边缘情况 | 5 | data:/blob: URI 过滤 + 空 alt + 过小尺寸 + Markdown 降级 + Notion paragraph 降级 |
| 全链路 smoke | 2 | extract→markdown→blocks→metadata 集成 |

### 已有测试

- 1828 个已有测试全部通过，无新增失败、无删除、无降低

### QA 发现（记录到 ISSUES.md）

- `extractArticleImages.getBestSrc` 不处理 data-src/data-original 懒加载属性（Turndown img rule 正确处理）— IS29
- `markdownToContentBlocks` 当前仅输出 paragraph/image blocks — IS30
- "ad-banner" class 不在已知噪声 class 列表中 — IS31

---

## v0.5 Session 4 (2026-06-14)

### 性质

Popup / History Lightweight Image Metadata 测试。验证 imageCount / firstImageUrl / skippedImageCount 从提取到存储到展示的完整链路。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：45 个测试文件，1828 个测试，全部通过（新增 18 个）
- `npm run build`：构建成功

### 新增测试覆盖 (tests/image-metadata.test.ts, 18 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| extractArticleImages 元数据 | 5 | imageCount、skippedImageCount、firstImageUrl、空页面、全噪声页面 |
| buildHistoryInput 元数据 | 3 | 有 image 元数据、无元数据、selection mode imageCount=0 |
| handleSaveToNotion 历史记录 | 5 | 成功保存带 image 元数据、失败保存带 image 元数据、无元数据、selection imageCount=0、retry 保留 image 元数据 |
| type safety | 3 | firstImageUrl 不是长文本 blob、imageCount 安全整数、仅记录首图不记录全部 URL |
| selection safety | 2 | selection 不含 fullpage 图片计数、fullpage 正确显示元数据 |

### 已有测试

- 1810 个已有测试全部通过，无新增失败、无删除、无降低

---

## v0.5 Session 3 (2026-06-14)

### 性质

Notion External Image Blocks 测试。验证 `markdownToContentBlocks` 和 `buildNotionBlocks` 将 Markdown 图片语法 `![alt](url)` 转换为 Notion `image` block (type: external) 的能力，以及降级和兼容性。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：44 个测试文件，1810 个测试，全部通过（新增 29 个）
- `npm run build`：构建成功

### 新增测试覆盖 (tests/notion-image-blocks.test.ts, 29 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| image block 基本转换 | 2 | standalone image → external block、external URL |
| caption | 3 | alt → caption、空 alt → 空 caption、纯空白 alt → 空 caption |
| 段落保持 | 2 | 纯文本段落、段落顺序保持（文本+图片交错） |
| 多图片 | 2 | 3 张独立图片、重复图片均转换 |
| data/blob URI 降级 | 2 | data: URI → paragraph、blob: URI → paragraph |
| 非 http URL 降级 | 2 | 相对 URL → paragraph、协议相对 URL → paragraph |
| 行内图片 | 1 | 段落内图片保持为 paragraph |
| URL 边界 | 3 | 超长 URL 降级、空 URL 降级、带 query params |
| 特殊字符 alt | 1 | 中文 + 括号 + 数字 |
| 空内容 | 2 | 空字符串、纯空白 |
| 降级不影响周围 | 1 | 失败的图片两侧段落不受影响 |
| 纯文本无图片 | 1 | 无 image block 生成 |
| fullpage 集成 | 4 | image blocks + chrome blocks 并存、selection callout、无图片时零 image、多图片 |
| comment-context 集成 | 2 | image blocks 生成、无 chrome outer blocks |
| data URI in fullpage | 1 | fullpage data URI 降级为 paragraph |

### 已有测试

- 1781 个已有测试全部通过，无新增失败、无删除、无降低
- `notion-blocks.test.ts` (21 tests) 全部通过，comment-context behavior 未改变

### 性质

Markdown 图片保留测试。验证 Turndown `img` rule 的噪声过滤、去重、alt 兜底、相对 URL 解析，以及 `injectMissingImages` 安全网行为。不修改已有测试。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：43 个测试文件，1781 个测试，全部通过（新增 28 个）
- `npm run build`：构建成功

### 新增测试覆盖 (tests/markdown-images.test.ts, 28 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| 噪声过滤 | 11 | data/blob URI、avatar/icon/logo/emoji class、tracking pixel 1x1、noise id、noise URL pattern、small size |
| 去重 | 1 | 重复 URL 只保留首次出现 |
| alt fallback | 3 | 空 alt→"image"、给定 alt、空白 trim |
| 相对 URL 解析 | 4 | pageUrl 解析、协议相对、绝对保留、无 pageUrl |
| 无回归 | 5 | 文本段落、headings、links、空 HTML、纯空白 |
| figure 支持 | 2 | 有效 figure 保留、噪声 figure 过滤 |
| 非影响性 | 2 | 纯文本无图片语法、混合文本图片 |

### 已有测试

- 1753 个已有测试全部通过，无新增失败、无删除、无降低

---

## v0.5 Session 1 (2026-06-14)

### 性质

新增文章图片候选提取模块测试，覆盖提取、过滤、去重、限制等全部功能路径。不修改已有测试。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：42 个测试文件，1753 个测试，全部通过（新增 62 个）
- `npm run build`：构建成功

### 新增测试覆盖 (tests/article-images.test.ts, 62 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| 基本提取 | 3 | 普通 img、无图片页面、空页面 |
| 相对 URL 解析 | 4 | pageUrl 转换、协议相对、绝对保留、无 pageUrl |
| srcset 支持 | 1 | srcset 存在时取 src |
| figure/figcaption | 3 | caption 提取、无 img 跳过、混合场景 |
| alt/title | 3 | alt 保留、title 去重、无 title |
| 噪声过滤 - pixel | 2 | 1x1 pixel、URL pattern |
| 噪声过滤 - class/id | 8 | avatar/icon/logo/favicon/emoji/sprite/badge/id |
| data/blob URI | 3 | data 默认过滤、allowDataUri、blob 过滤 |
| 去重 | 2 | 相同 URL、解析后去重 |
| maxImages | 3 | 默认 20、自定义限制、未达限制 |
| 最小尺寸 | 2 | 小于默认 min、零尺寸保留 |
| stats | 1 | 混合结果统计 |
| index | 1 | 顺序索引 |
| sourceUrl | 2 | jsdom 环境、字段存在性 |
| picture | 1 | picture 元素提取 |
| resolveUrl 单元 | 4 | 相对、绝对、协议相对、无效 base |
| isNoiseUrl 单元 | 8 | pixel/beacon/1x1/spacer/transparent/data/blob/正常 |
| isTrackingPixel 单元 | 4 | 1x1/小尺寸+关键词/正常/小尺寸无关键词 |
| getBestSrc 单元 | 3 | src、无 src、data/blob 通过 |
| extractCaption 单元 | 3 | figure caption、无 figure、长文本截断 |

### 已有测试

- 1691 个已有测试全部通过，无新增失败、无删除、无降低

---

## v0.5 Session 0 (2026-06-14)

### 性质

从 clipmate-v0.4 稳定基线 (1850c64) 复制创建 clipmate-v0.5 开发目录。基线测试，未新增功能代码。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：41 个测试文件，1691 个测试，全部通过
- `npm run build`：构建成功

### 检查项

- clipmate-v0.5/ 从 v0.4 基线复制 ✅
- node_modules 已安装 ✅
- 基线测试全部通过 ✅
- 未修改 v0.1/v0.2/v0.3/v0.4 ✅
- 未修改 ../../opencode.json ✅
