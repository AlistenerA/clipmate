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

v0.4 决策文档见 `clipmate-v0.4/docs/DECISIONS.md`。与本轮相关的继承决策：

- D-v0.4-039：comment-context 主链路以 resolveCommentContext 为入口（v0.5 继承此实现）
- D-v0.4-040：不修改 Popup/Copy/Notion/History wrapper 策略
