# DECISIONS.md — ClipMate v0.7 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

---

## v0.5 Session 0 决策

### D-v0.5-001：v0.5 从 v0.4 稳定基线复制创建独立目录

- **原因**：保持版本目录独立，不污染已发布版本。clipmate-v0.4/ 保持 1850c64 不变。
- **影响**：clipmate-v0.5/ 是独立的开发目录，从 v0.4 复制后拥有独立的 node_modules、dist、测试。
- **可反转性**：低。一旦提交 v0.5 代码，不应回退到 v0.4 目录。

### D-v0.5-002：文章图片保存优先使用 external image URL，不下载/上传图片

- **原因**：下载图片需要处理权限、存储、跨域等复杂问题。external URL 方式利用已有公开资源，实现简单、无需新增权限。
- **影响**：v0.5.0 不下载图片，不调用 Notion File Upload API。Notion image block 使用 external URL。图片链接可能因源站变化而失效。
- **可反转性**：中。后续可在 v0.5.x 或 v0.6 实现 File Upload 作为补充方案。

### D-v0.5-003：v0.5.0 不新增 manifest 权限

- **原因**：遵循项目安全原则，任何新增权限需先经过审查。现有权限（storage, activeTab, scripting, notion API host）已满足 v0.5.0 需求。
- **影响**：不能使用 downloads API 下载图片，不能使用扩展原生网络请求。
- **可反转性**：中。如后续确需权限，必须先审查。

---

## v0.5 Session 1 决策

### D-v0.5-004：图片提取核心为纯函数，不访问网络/storage/chrome API

- **原因**：Content Script 中提取图片应无副作用，不发起网络请求（避免隐私风险），不写 storage（避免竞态），不调 chrome API（避免依赖扩展运行时）。纯函数设计便于测试，62 个测试无需 mock。
- **影响**：extractArticleImages 只读 DOM，不验证图片可达性。图片 URL 可能指向 404、跨域禁止等。
- **可反转性**：高。后续如需验证图片可达性，可新增可选参数或包装函数。

### D-v0.5-005：默认过滤 data/blob/base64/tracking/icon/avatar/logo/emoji 等噪声图

- **原因**：文章正文图片与 UI 装饰图片在 DOM 中混杂，需在提取阶段区分。噪声图片进入 Markdown 会降低可读性、增大保存负担、可能触发 Notion 审核。
- **影响**：avator/icon/logo/badge/emoji/sprite/tracking pixel/data URI/blob URI 等默认过滤。allowDataUri 选项可选择性保留 data URI。
- **可反转性**：高。噪声规则可扩展或禁用。

### D-v0.5-006：单次遍历 img 元素，通过祖先元素 determineOrigin 识别 figure/picture

- **原因**：避免多次遍历 DOM 导致重复 counting 和图片顺序混乱。figure/picture 内 img 通过检查 parentElement 链识别 origin，一次 querySelectorAll 完成。
- **影响**：totalFound 计数准确（不会重复计算 figure 和 picture 内图片）。
- **可反转性**：中。如需更复杂的 origin 判断（如多层嵌套），可增强 determineOrigin。

### D-v0.5-007：本轮不接入 ExtractedContent / Markdown / Notion

- **原因**：Session 1 目标只做提取核心和测试。接入 Markdown 是 Session 2 任务，接入 Notion 是 Session 3 任务。
- **影响**：extractArticleImages 是独立纯函数，未被 index.ts 调用。Session 2/3 再接入。
- **可反转性**：N/A（按规划执行）。

---

## v0.5 Session 2 决策

### D-v0.5-008：Markdown 图片保留只使用 external http/https URL，不下载/上传图片

- **原因**：遵循 D-v0.5-002，v0.5.0 不下载、不上传、不缓存图片。Turndown img rule 和 extractArticleImages 均只保留 http/https external URL，过滤 data:/blob: URI。
- **影响**：功能受限于源站图片可访问性。失效 URL 显示 broken image（IS25）。
- **可反转性**：中。后续版本可增加 File Upload 作为补充方案。

### D-v0.5-009：Notion image block 延后到 Session 3，Session 2 不改变 Notion 保存链路

- **原因**：Session 2 只做 Markdown 图片保留，不修改 Notion API 调用、blocks 构建或 rich_text 转换。Notion 侧图片处理（external image block）留给 Session 3。
- **影响**：当前保存到 Notion 时，Markdown 中 `![alt](url)` 图片语法会作为普通 rich_text 显示为 `![alt](url)` 文本，不会渲染为图片。Session 3 将修复此问题。
- **可反转性**：N/A（按规划执行）。

### D-v0.5-010：Turndown img rule 复用 extractArticleImages 的噪声过滤逻辑

- **原因**：避免两套图片过滤规则不一致。增强 Turndown img rule 使用 isNoiseByClassName / isNoiseByAttribute / isNoiseUrl / isTrackingPixel / isDataUri / isBlobUri 与 extractArticleImages 保持一致。
- **影响**：Turndown 处理的图片与 extractArticleImages 提取的图片过滤标准一致。部分原有测试中可能通过但无噪声的图片仍然通过。
- **可反转性**：中。过滤规则可在 articleImages.ts 中统一调优。

### D-v0.5-011：htmlToMarkdown 支持 pageUrl 参数解析相对图片 URL

- **原因**：Turndown 输出的 Markdown 中图片 URL 保持原始格式（相对路径可能不被 Notion/阅读器解析）。提供 pageUrl 可解析相对 URL 为绝对 URL。
- **影响**：`htmlToMarkdown` 签名从 `(html)` 变为 `(html, pageUrl?)`。兼容所有现有调用方（无 pageUrl 时行为不变）。buildContent 和 fallback 路径已传入 pageUrl。
- **可反转性**：低。签名已公开，但 pageUrl 为可选参数。

### D-v0.5-012：injectMissingImages 作为安全网，在 Fullpage 末尾补充遗漏图片

- **原因**：Readability 或 Turndown 可能因 HTML 结构遗漏部分正文图片（Strategy B）。使用 extractArticleImages 在原始 DOM 上提取，与 Markdown 对比，将缺失图片追加到末尾 `## Images` 区块。
- **影响**：仅当 extractArticleImages 发现 Markdown 中不存在的图片 URL 时生效。不改变已有图片位置。末尾区块格式为 `\n---\n\n## Images\n![alt](url)\n*caption*`。
- **可反转性**：高。如发现误追加，可增强 URL 匹配逻辑或移除安全网。

v0.4 决策文档见 `clipmate-v0.4/docs/DECISIONS.md`。与本轮相关的继承决策：

- D-v0.4-039：comment-context 主链路以 resolveCommentContext 为入口（v0.5 继承此实现）
- D-v0.4-040：不修改 Popup/Copy/Notion/History wrapper 策略

---

## v0.5 Session 3 决策

### D-v0.5-013：Markdown 图片转 Notion image block 使用段落级检测

- **原因**：沿用现有 `splitParagraphs()` 的段落分割逻辑（按双换行分割，内部合并空格），对每个段落检测是否为独立图片行 `![alt](url)`。避免大重构现有 blocks 构建链路，影响范围最小。
- **影响**：只有用双换行分隔的独立图片行会转为 image block；段落内部混入的图片语法保持为 paragraph 文本。image block 使用 `{ type: 'external', external: { url } }` 结构。
- **可反转性**：高。可在后续 Session 增强为更细粒度的行级解析。

### D-v0.5-014：v0.5.0 不接入 Notion File Upload API

- **原因**：遵循 D-v0.5-002，external URL 策略已满足 v0.5.0 图片保存需求。File Upload 需要处理二进制、跨域、存储等复杂问题，且可能需新增 manifest 权限。
- **影响**：图片依赖源站 URL 可访问性；失效或防盗链 URL 会在 Notion 显示 broken image。不调用 Notion File Upload endpoint。
- **可反转性**：中。后续版本可实现 File Upload 作为补充方案。

### D-v0.5-015：图片 block 转换失败不阻塞正文保存

- **原因**：图片是增强功能，不应因图片 URL 无效或 Notion API 限制而阻止正文保存。data/blob/非 http URL 降级为 paragraph block，保留 markdown 原文。
- **影响**：`tryImageBlock()` 返回 null 时，`markdownToContentBlocks` 回退到 paragraphBlock 输出。确保正文段落完整保存。
- **可反转性**：低。此设计是安全底线。

---

## v0.5 Session 4 决策

### D-v0.5-016：History 只记录 imageCount / firstImageUrl / skippedImageCount，不记录完整图片 URL 列表

- **原因**：遵循安全底线，不将完整图片 URL 列表写入 history storage（可能包含大量 URL）。仅记录轻量统计信息（count、首图 URL、跳过计数）满足 Popup/History 展示需求。
- **影响**：`ClipHistoryItem` 新增 `imageCount?` / `firstImageUrl?` / `skippedImageCount?` 可选字段。不保存 `imageUrls[]` 数组。History 展示仅显示图片数量和首图域名提示。
- **可反转性**：高。如后续需要完整列表，可新增可选字段。

### D-v0.5-017：Popup / History 图片提示只做轻量展示，不下载、不缓存、不代理图片

- **原因**：遵循 D-v0.5-002 和 D-v0.5-003，v0.5.0 不下载、不上传、不缓存图片。Popup/History 图像提示仅使用外部 URL（不代理），通过 `firstImageUrl` 字段透传，不发起额外网络请求。
- **影响**：首图预览仅作为 URL 引用，不通过 `<img>` 标签在 Popup 内渲染（避免计数式请求）。StatusBar 和 HistoryItem 仅显示数字徽章。
- **可反转性**：高。后续 Session 可在不破坏安全底线的前提下增加缩略图预览。

---

## v0.5 Session 5 决策

### D-v0.5-018：v0.5 发布前 QA 以新闻/博客/技术文档/CSDN-like/comment-context 五类场景为最低覆盖

- **原因**：Session 5 fixture QA 覆盖了新闻多图、博客 figure/figcaption、技术文档截图+icon噪声、CSDN-like 懒加载、selection/comment-context 回归五类典型场景。真实网页 QA 需要人工登录和网络访问，不适合在本轮自动化。
- **影响**：52 个 fixture QA 测试验证全链路。IS29/IS30/IS31 记录为 minor。IS24（跨域图片）和真实 Notion save 仍需人工验证。
- **可反转性**：中等。Session 6 或后续版本可补充真实网页 Playwright QA。

### D-v0.5-019：无法访问真实站点时，使用本地 fixture QA，但不得冒充真实网页 QA

- **原因**：遵循安全底线和 Session 5 规则要求。未执行真实 Notion save，未登录真实账号，未抓取真实网页内容。
- **影响**：本轮 QA 结果标记为 fixture QA，非真实网页 QA。文档中明确说明"未执行真实网页 QA / 未执行真实 Notion save"。
- **可反转性**：不适用。后续若执行真实 QA，应更新文档以反映。

---

## v0.5 Session 5.1 决策

### D-v0.5-020：injectMissingImages 只基于正文 HTML fragment，不基于整个 document

- **原因**：用户真实测试 Sina 新闻页发现，全文 document 提取会将推荐区/热搜区/侧栏缩略图追加到 `## Images`。Readability 提取的内容 HTML 已限定为正文区域，用其创建 fragment document 后提取图片可避免污染。
- **影响**：`createFragmentDocument(contentHtml)` 用 DOMParser.parseFromString 创建临时 document。fallback 路径也使用 fallbackResult.content fragment。提取范围收窄后，正文外的噪声图片不再进入 `## Images`。理论上可能遗漏 Readability 遗漏的正文图片，但这种情况极少且 Readability 的图片保留已足够。
- **可反转性**：中。如果 Readability 遗漏大量正文图片且需要安全网，可恢复 document 级别提取并增强噪声过滤。

### D-v0.5-021：Notion image block 只使用直接托管、兼容性较高的 external image URL；代理/resize/api 型 URL 降级为 paragraph

- **原因**：Sina 使用的 `img.mix.sina.com.cn/api/auto/resize` 等代理 URL 在 Notion 中无法渲染为 image block。直接 CDN 图片 URL（如 `k.sinaimg.cn/n/news/crawl/.../photo.jpg`）通常兼容。降级到 paragraph 不会阻断正文保存。
- **影响**：`isLikelyDirectImageHosting()` 检查 URL path 是否包含 `/api/auto/resize`、`/api/` 代理路径、`/resize`/`/crop`/`/thumbnail`/`/thumb` 路径段、`?img=` 代理查询参数。不兼容 URL 降级为 paragraph block（保留原 Markdown 格式）。不影响直接 CDN 图片 URL。
- **可反转性**：中。后续可增强为多策略（如尝试 multiple Notion image block 格式、或提示用户手动修复）。

### D-v0.5-022：v0.5.0 优先保证正文保存稳定，图片 block 作为增强能力不能污染正文或阻断保存

- **原因**：Session 5.1 修复的两个问题都源自同一原则：图片保存是增强功能，不能破坏核心的正文剪藏到 Notion 体验。
- **影响**：正文污染通过 fragment 限定解决；不兼容 URL 通过 paragraph 降级解决。两种机制都保证正文段落完整保存，图片功能作为 best-effort。
- **可反转性**：低。此设计是核心底线，不应被后续版本推翻。

---

## v0.5 Session 5.2 决策

### D-v0.5-023：图片题注必须作为 caption 输出，不与图片 Markdown 粘连

- **原因**：用户真实测试发现 Sina 新闻页的 `![alt](url)caption` 粘连在同一行。`htmlToMarkdown` 管道新增 `splitImageCaptionGlue()` 后处理，当 trailing text 与 alt 匹配时，拆分为 `![alt](url)\n\n*caption*`。
- **影响**：纯 Markdown 输出中图片和题注分行；Notion blocks 可进一步识别 `*caption*` 并合并到 image.caption。仅当 trailing text 精确匹配或开头匹配 alt 时才拆分，不影响正常正文。
- **可反转性**：中。如果后续出现误拆分，可调整为更严格的 matching 条件。

### D-v0.5-024：Notion image block 使用 image.caption 表达题注，不额外输出重复题注 paragraph

- **原因**：`markdownToContentBlocks` 原逻辑将 `![alt](url)` 和 `*caption*` 作为两个独立 block。现在 indexed loop 识别图片后紧跟的 italic caption（`*caption*`），合并为单一 image block 的 `image.caption`。
- **影响**：Notion 中图片题注正确呈现为图片下方的 caption 文字，不再重复输出 paragraph。caption 长度限制 200 字符，超出回退使用 alt。
- **可反转性**：低。合并为单一 image block 是 Notion API 的最佳实践。

### D-v0.5-025：Notion API 不设置图片居中；复制 Markdown 的居中展示若实现，必须与 Notion 保存链路隔离

- **原因**：Notion API 不支持稳定设置 image block 的 align/center 字段。复制 Markdown 的 HTML 居中包装可与 Notion 保存链路分离，但本轮未实现（P2 优先级，会引发兼容性风险）。
- **影响**：IS36 记录为 minor 已知限制。后续版本可在 copy markdown profile 中实现可选 HTML 居中，但不影响 Notion blocks 生成逻辑。
- **可反转性**：高。后续可按需实现独立的 copy markdown 居中 profile。

### D-v0.5-026：用户测试文档目录仅用于复现和抽取最小 fixture，不提交原始测试文档

- **原因**：`测试文档/` 目录包含完整中文新闻正文、真实图片 URL 和 Notion 链接。测试中只抽取最小必要结构（如一个 `<img>` + caption 片段）构造 fixture。
- **影响**：测试文件不包含真实记者姓名、完整新闻正文、真实 Notion 页面链接。`测试文档/` 目录未纳入 git tracked 范围。
- **可反转性**：不适用。

---

## v0.5 Session 6 决策

### D-v0.5-027：v0.5 版本号统一为 0.5.0，与 v0.4 基线版本号不冲突

- **原因**：package.json / manifest.config.ts / package-lock.json 统一 bump 到 0.5.0，zip 文件名同步为 clipmate-v0.5.zip。不修改依赖版本。
- **影响**：dist/manifest.json 版本为 0.5.0。所有发布文档（README/STORE_LISTING/PRIVACY_POLICY/PERMISSION_JUSTIFICATION/TEST_PLAN/RELEASE_CHECKLIST）更新到 v0.5。
- **可反转性**：低。版本号一旦发布不应回退。

### D-v0.5-028：v0.5 发布前不做源码修改，不新增功能

- **原因**：Session 6 是发布前审查和文档更新。任何代码修复应记录为 ISSUES（IS24 待人工验证），不在本轮顺手修复。
- **影响**：`src/` 目录零变更。安全扫描覆盖 src/tests/docs 但均为已有代码。lint/test/build/zip 均在已有代码基础上通过。
- **可反转性**：不适用。后续版本可独立处理 ISSUES。

---

## v0.5.1 决策

### D-v0.5-029：架构级续作留在 v0.5.x patch 线推进

- **原因**：用户明确要求本次架构级更新命名为 v0.5.x，并且每完成一个功能点递增 0.0.1。v0.5.0 已作为发布候选完成，后续底座优化不需要创建 v0.6 目录。
- **影响**：`clipmate-v0.5/` 继续作为当前开发目录；本轮根版本从 0.5.0 bump 到 0.5.1。后续每个可验证功能点继续递增 patch 版本。
- **可反转性**：低。版本线一旦开始推进，不应混用 v0.6 命名。

### D-v0.5-030：先建立 capture/session/notion 三个 feature 边界，再逐步迁移业务流

- **原因**：现有 popup/background 链路已经稳定，直接大规模重写风险高。先引入薄模块：capture 统一草稿创建，session 描述一次保存，notion 生成保存计划；IO 和 UI 状态暂保留在原模块中。
- **影响**：`src/features/capture`、`src/features/session`、`src/features/notion` 成为后续架构接入点。`handleSaveToNotion()` 继续负责 Notion API 调用和 history 写入，避免本轮扩大行为面。
- **可反转性**：中。若后续发现 feature 边界不够，可在不改用户行为的情况下调整模块内部 API。

### D-v0.5-031：参考 Save to Notion 的会话/编排思路，但不采用私有接口、cookie 依赖或权限扩张

- **原因**：Save to Notion 参考项目中有可借鉴的保存会话、目标元数据、保存前计划化思想；但 ClipMate 的安全底线是官方 Notion API、最小权限、透明数据流。
- **影响**：本轮只吸收架构形态，不复制第三方代码，不新增依赖，不引入非官方 Notion API，不扩大 manifest 权限。后续如接入 File Upload，必须先在 plan 层评估权限、隐私和失败降级策略。
- **可反转性**：低。安全/隐私边界不应被后续便利性需求绕过。

---

## v0.5.2 决策

### D-v0.5-032：图片候选读取统一到 `getBestSrc()`

- **原因**：用户测试 CCTV 新闻页发现正文图片全部丢失。根因是 `extractArticleImages()` 只读取 `src/currentSrc`，而部分新闻站使用 placeholder `src` + `data-src/data-original/srcset/picture source/video poster` 等真实图片来源。
- **影响**：`getBestSrc()` 统一候选读取，Markdown 转换和图片元数据共享同一逻辑。placeholder/noise `src` 会让位给真实懒加载图片；data/blob 仍由下游安全过滤处理。
- **可反转性**：中。候选顺序可继续调优，但统一入口应保留。

### D-v0.5-033：video poster 作为图片 fallback 保存，不下载视频

- **原因**：新闻站常把视频首帧或封面作为正文视觉内容。用户需要保存可读图文结果，但 v0.5.x 不做视频下载。
- **影响**：`video[poster]` 会作为 `poster` origin 图片候选进入 Markdown / 元数据。仍只保存 external URL，不下载、不上传、不缓存视频或图片二进制。
- **可反转性**：高。后续 Tutorial Mode 可将 video poster 升级为 VideoEmbed/Asset 节点。

### D-v0.5-034：Markdown profile 输出层修复粗体边界空格

- **原因**：Obsidian/Typora 对 `**加粗**正文` 的渲染兼容不一致。复制 Markdown 需要比 Notion block 保存更严格地满足编辑器解析习惯。
- **影响**：`formatMarkdownWithProfile()` 在 fenced code block 外将 `**bold**text` 标准化为 `**bold** text`。不修改源网页提取的语义，不影响代码块内容。
- **可反转性**：中。如某些目标不希望插入空格，可后续做 profile 级开关。

---

## v0.5.3 决策

### D-v0.5-035：保存前标题编辑只覆盖本次 ClipDraft 标题

- **原因**：用户需要在保存前调整剪藏标题，但不应反写网页提取器或污染原始页面 metadata。
- **影响**：Popup 中的 `draftTitle` 作为 `createClipDraft()` 的 title override，复制 Markdown 和 Save to Notion 都使用编辑后的标题；正文内容、URL 和原始 metadata 仍保持提取结果。
- **可反转性**：高。后续若需要 profile 级标题模板，可在 draft 层扩展。

### D-v0.5-036：重复保存提示只读取本地 saved history，不新增持久化字段

- **原因**：同 URL 重复保存提醒可以从现有 history 推导，不需要新增 storage schema 或记录额外浏览行为。
- **影响**：Popup 按当前内容 URL 查找最近一条 `saveStatus === "saved"` 的 history；失败/未保存记录不触发提醒。不会新增权限，也不会发起网络请求。
- **可反转性**：中。如后续需要跨设备或更复杂去重，可扩展为 URL normalize/hash 策略。

### D-v0.5-037：保存摘要替代有限正文预览，主 Markdown 预览保留为唯一正文预览

- **原因**：旧 `ContentPreview` 与下方原文/预览主区域信息重复，占用 Popup 空间却不能帮助保存决策。保存前更需要标题、来源、字数、图片数和重复保存状态。
- **影响**：删除 `ContentPreview` 组件，新增 `SaveSummary`。Popup 仍保留下方 Markdown 原文/预览切换作为完整正文检查入口。
- **可反转性**：中。如果后续需要更强摘要，可在 `SaveSummary` 中增加折叠字段，而不是恢复重复预览区。

---

## v0.6.0 决策

### D-v0.6-001：v0.6.0 继续在 `clipmate-v0.5/` 目录小步推进

- **原因**：v0.5.3 已干净提交，但新建 `clipmate-v0.6/` 会产生 200+ tracked files 的复制提交，并需要重新安装依赖才能跑 lint/test/build，反而降低本轮架构底座的可审查性。
- **影响**：v0.6.0 版本号已 bump 到 0.6.0，但开发目录仍是 `clipmate-v0.5/`。旧目录 `clipmate-v0.1/` 到 `clipmate-v0.4/` 继续冻结不改。
- **可反转性**：中。若后续进入发布归档或大规模 UI 重构，可以在单独提交中创建 `clipmate-v0.6/` 或后续版本目录。

### D-v0.6-002：Asset Pipeline 先做纯函数 foundation，不改变保存主链路

- **原因**：现有 v0.5 图片保存链路已稳定，v0.6 需要建立 `ClipAsset` / `FigureAsset` / `ImageSaveStrategy` 抽象，但不应在同一提交中改变实际 Notion blocks 行为。
- **影响**：新增 `features/assets`，支持从 article image candidates 和 Markdown 生成 figure assets，并生成质量报告。`buildNotionBlocks()` 仍按现有 external image / paragraph fallback 行为输出。
- **可反转性**：高。后续可逐步让 Popup、History 或 Notion handler 消费 asset report。

### D-v0.6-003：Notion File Upload external import 只作为候选策略记录

- **原因**：Notion 官方文档支持 file upload 流程和 external URL 导入路径，但启用前仍需要评估 API 配额、失败状态、隐私提示、权限边界和真实 Notion QA。
- **影响**：proxy/resize 型图片会在 `assetReport` 中标记为 `notion-file-upload-external-import` candidate；不新增 `<all_urls>`、不下载二进制、不调用 File Upload API。
- **可反转性**：中。完成安全/隐私评估和真实 QA 后，可将 candidate 策略接入实际保存流程。

### D-v0.6-004：从 v0.6 起严格执行“大版本目录 + git 分支”隔离

- **原因**：用户要求每个可发布大版本都保留独立目录和分支，并保留足够人工测试和细节修改空间。
- **影响**：当前分支重命名为 `codex/clipmate-v0.6-release`，当前目录迁移为 `clipmate-v0.6/`。v0.7 将从 v0.6 新建分支和 `clipmate-v0.7/`，冻结 v0.6。
- **可反转性**：低。后续版本隔离应作为项目默认流程保留。

---

## v0.7.0 决策

### D-v0.7-001：教程模式使用持久化友好的 `ClipDocument` schema

- **原因**：仅保留 Markdown 字符串无法可靠区分标题、代码、公式、表格、callout、figure 和视频链接，也无法让 Notion adapter 做稳定映射。
- **影响**：`ExtractedContent.clipDocument` 作为可选字段，仅教程模式生成；schemaVersion 固定为 1。旧草稿和全文/选区无需迁移。
- **可反转性**：中。后续可新增 block 类型或 schemaVersion，但应保持 v1 读取兼容。

### D-v0.7-002：教程模式使用显式消息路由并复用全文正文边界

- **原因**：教程仍需要 Readability、站点 profile、图片过滤和低置信兜底，复制一套提取器会产生漂移；同时消息层必须能明确区分用户意图。
- **影响**：新增 `EXTRACT_TUTORIAL`，内部复用全文提取，再装配视频元数据与 ClipDocument。切换 Popup mode 会立即重新提取并清除旧内容。
- **可反转性**：高。未来可给教程模式增加专用 extractor，但消息契约可保留。

### D-v0.7-003：视频只保存当前 DOM 中的安全链接元数据

- **原因**：教程页面常包含视频，但下载、字幕抓取、cookie 或跨站请求会扩大权限、隐私和失败面。
- **影响**：只采集 `video/source` HTTP(S) URL 和受支持视频站 iframe URL；去重后写入 Markdown 与 ClipDocument，Notion 使用 bookmark。非视频 iframe 不采集。
- **可反转性**：低。除非后续单独完成权限和隐私审查，否则不扩展为下载或远程抓取。

### D-v0.7-004：教程结构映射为 Notion 原生 block，超限内容可降级但不可截断

- **原因**：发布版需要在实际保存结果中保留结构，而不只是内部模型。Notion 对 rich_text 与 equation 长度有边界。
- **影响**：heading/code/equation/table/callout/image/bookmark 使用原生 block；长段落和代码按 2000 字分块，超长公式降级为文本形式保存。
- **可反转性**：中。真实 Notion QA 后可细化语言映射和降级策略。

### D-v0.7-005：真实浏览器和 Notion QA 作为人工发布门禁

- **原因**：单元测试无法证明 content script 注入、Popup 状态、MV3 service worker、外链图片和 Notion 实际渲染。
- **影响**：自动化全绿时状态仍为“自动化候选版”；用户按 `V0.7_MANUAL_RISK_QA.md` 完成 P0 后才标记人工验收完成。
- **可反转性**：低。发布门禁应长期保留。
