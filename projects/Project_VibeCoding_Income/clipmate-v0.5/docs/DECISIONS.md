# DECISIONS.md — ClipMate v0.5 技术决策记录

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
