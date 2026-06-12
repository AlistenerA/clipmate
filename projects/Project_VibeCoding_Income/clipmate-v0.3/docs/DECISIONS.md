# DECISIONS.md — ClipMate v0.3 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

---

## v0.3 Session 4 决策

### D-v0.3-020：图片 src 使用多候补提取策略

- **原因**：网页图片的真实 URL 可能存储在 `src`、`currentSrc`、`data-src`、`data-original`、`data-lazy-src`、`data-lazy` 等多个属性中。单一读取 `src` 会丢失懒加载图片、响应式图片的真实地址。
- **影响**：img Turndown rule 遍历 8 个候补属性，选择第一个通过 `isLikelyImageUrl` 验证的 URL。不会发起网络请求。
- **可反转性**：高。可增减候补属性列表。

### D-v0.3-021：Figure/Figcaption 通过独立 figure rule 处理

- **原因**：img 和 figcaption 是 figure 的子元素。如果只在 img rule 中处理 caption，figcaption 文本仍会被 Turndown 独立处理并重复输出。需要独立 figure rule 接收已处理的 content 并将 figcaption 文本包裹为 `*caption*` 斜体。
- **影响**：figure rule 查找 content 中匹配 figcaption 文本的行，包裹为 `*...*`。img rule 不再检查 figure 父元素。
- **可反转性**：高。可调整 caption 格式风格。

### D-v0.3-022：链接安全过滤策略

- **原因**：网页中的 `javascript:` 和 `data:` 协议链接在执行或渲染时存在安全风险。mailto/tel/相对路径/锚点是合法的导航链接。
- **影响**：`isSafeLinkHref` 拒绝 `javascript:`、`data:`、`void(0)`、`#null`。anchor rule 遇到不安全 href 时只保留链接文本，不生成 Markdown 链接。
- **可反转性**：高。白名单可扩展。

### D-v0.3-023：简单表格转 Markdown table，复杂表格走简化 fallback

- **原因**：Markdown table 不支持 rowspan/colspan。强行展开会丢失合并结构，产生歧义。采用保守 fallback：复杂表格（含 colspan/rowspan）输出 `*表格已简化*` 提示 + 纯文本管道符行。
- **影响**：table Turndown rule 检测 `[colspan]`、`[rowspan]` 属性标记为 complex。简单表格正常输出 `| col |`. 表格单元文本通过 `cellTextWithBreaks` 保留 `<br>` 空格。
- **可反转性**：高。后续可引入更智能的 colspan/rowspan 展开策略。

### D-v0.3-024：cellTextWithBreaks 递归提取含 BR 的表格单元文本

- **原因**：`cell.textContent` 不保留 `<br>` 标签的空格分隔效果，`<td>hello<br>world</td>` 会得到 `helloworld`。需要遍历子节点并将 `<br>` 替换为空格。
- **影响**：新增 `cellTextWithBreaks` 内部函数，递归处理 DOM 子节点，保留文本节点内容，将 BR 元素替换为空格。
- **可反转性**：高。可扩展处理其他内联格式标签。

### D-v0.3-025：Image/Link/Table 规范化在 htmlToMarkdown 中通过 Turndown rules 接入

- **原因**：与 Session 2 公式保护（HTML 预处理阶段）和 Session 3 代码块清理（Markdown 后处理阶段）不同，图片/链接/表格规范化最适合在 Turndown HTML→Markdown 转换阶段直接处理。
- **影响**：4 个新 Turndown rules（img / figure / anchor / table）覆盖所有 HTML→Markdown 产出路径。formatMarkdownWithProfile 和 formatCopyMarkdown 自动受益。
- **可反转性**：高。可随时调整 Turndown rule 实现。

---

## v0.3 Session 3 决策

### D-v0.3-015：cleanMarkdownCodeBlocks 在 htmlToMarkdown 末尾执行而非 formatMarkdownWithProfile

- **原因**：htmlToMarkdown 是所有 Markdown 产出路径的共同上游（复制 Markdown、保存到 Notion 的 markdown 字段、历史记录 markdown）。在此处集成 cleanMarkdownCodeBlocks 可使所有下游路径自动受益，无需修改 popup、background 或 notion handler。
- **影响**：htmlToMarkdown 末尾调用链变为 Turndown → cleanMarkdown → cleanMarkdownCodeBlocks。formatMarkdownWithProfile 和 formatCopyMarkdown 无需额外修改。
- **可反转性**：高。可随时调整集成点。

### D-v0.3-014：Code Block Cleaner 只处理 fenced code block 内部内容

- **原因**：Turndown 配置 `codeBlockStyle: 'fenced'` 已将 `<pre><code>` 转换为 ``` ```...```` 格式。Markdown 后处理阶段只需匹配 fenced code block 的内部清书。不对非 fenced 的 inline code `...` 做清理，避免误伤。
- **影响**：cleanMarkdownCodeBlocks 使用正则 `/^```(\w*)[ \t]*\r?\n([\s\S]*?)\r?\n```/gm` 匹配。不匹配 inline code 或缩进代码块。
- **可反转性**：高。后续可扩展支持缩进代码块。

### D-v0.3-016：行号清理使用"多数原则"

- **原因**：代码中的数字非常常见（`const x = 1`、`array[0]`、`status 404`）。只有当前缀行号模式覆盖 >50% 的非空行时才批量移除，避免误删代码中的数字。
- **影响**：stripLineNumbers 函数检查前缀行号占比，低于阈值不做清理。
- **可反转性**：高。阈值可调整。

### D-v0.3-017：独立行号列需形成连续序列才清理

- **原因**：代码中孤立的数字行（如结果输出 `42`）不应被误删。只有当至少 3 个连续递增的数字行且与代码行交替出现时，才视为行号列并移除。
- **影响**：stripLineNumbers 中 isolated 模式需满足 sequential + interleaved 两个条件。
- **可反转性**：高。

---

## v0.3 Session 2 决策

### D-v0.3-010：公式保护使用占位-还原模式而非正则跳过

- **原因**：cleanMarkdown 的 bold 合并正则 `/\*\*(.*?)\*\*\*\*(.*?)\*\*/g` 可能跨公式区域匹配。在公式中 `**` 可能表示某种运算（如 convolution），直接对含有公式的文本运行 cleanMarkdown 会导致公式内部 `*` 被误处理。占位-还原模式先把公式替换为不包含特殊字符的占位符，清理完成后再还原。
- **影响**：protectLatexSegments 返回 `{ protected, restore }` 模式；cleanMarkdown 内部调用 protectLatexSegments 包装原始文本。
- **可反转性**：高。纯函数接口，可随时替换占位策略。

### D-v0.3-011：MathJax script 提取发生在 cleanDocument 之前

- **原因**：cleanDocument 使用 `doc.querySelectorAll('script')` 删除所有 script 元素。MathJax 的 `<script type="math/tex">` 源码在此时丢失。必须在 cleanDocument 之前提取并替换为可见的文本 span。
- **影响**：content/index.ts 新增 extractMathJaxFormulas 函数，在 clone → clean 之间执行。
- **可反转性**：高。独立函数，不影响其他提取逻辑。

### D-v0.3-012：preserveMathHtml 只恢复可可靠识别的公式标记

- **原因**：HTML 公式标注格式多样（KaTeX annotation、data-latex、MathJax script 标签、alttext 属性），但不是所有数学网站都以标准方式标注。保守策略：只匹配明确标注的 LaTeX 源码，不对未知 HTML 做启发式猜测。
- **影响**：preserveMathHtml 使用有序正则替换链：script[type="math/tex"] → annotation[encoding="application/x-tex"] → data-latex → data-katex-src → alttext（需含 LaTeX 特征）。未标注的公式元素保留原 HTML。
- **可反转性**：高。可随时增加匹配模式。

### D-v0.3-013：$ 符号的 replacement 安全处理

- **原因**：JS String.replace 第二个参数中的 `$` 有特殊含义（`$&`、`$1`、`$$` 等）。数学公式包含大量 `$` 符号，直接用作 replacement 字符串会导致 `$$` 被折叠为 `$`。本次修复将 restore 函数改为 callback 模式（`() => seg`），避免 replacement 字符串中的特殊字符被解释。
- **影响**：restore 函数内部改为 callback replacer；normalizeLatexDelimiters 同样改为 callback 模式。
- **可反转性**：不可逆转（修复后行为才是正确的）。

---

## v0.3 Session 1 决策

### D-v0.3-006：MarkdownTarget 默认值采用 notion 以保证向后兼容

- **原因**：现有用户使用 formatCopyMarkdown 的 Notion 风格输出作为默认复制格式。Session 1 的 formatMarkdownWithProfile('notion') 输出与 formatCopyMarkdown 完全一致。将默认值设为 'notion' 确保现有用户体验不变。
- **影响**：App.tsx 中 mdTarget 状态默认值为 'notion'，normalizeMarkdownTarget 对非法值 fallback 到 'notion'。
- **可反转性**：高。后续可随时更改默认值。

### D-v0.3-007：Markdown Target Profiles 不持久化到 storage

- **原因**：Session 1 范围内不做 settings 持久化。Profile 选择是纯前端状态，每次打开 Popup 重置为默认 'notion'。避免 settings 结构膨胀（R03 风险）和数据迁移复杂度。
- **影响**：MarkdownTarget 不存入 ClipMateSettingsV2，不修改 storage module、migration 逻辑。
- **可反转性**：高。后续 Session 如需持久化用户偏好，可扩展 settings 类型并添加迁移。

### D-v0.3-008：formatMarkdownWithProfile 不接入 Notion API 保存链路

- **原因**：Notion API 保存使用 blocks 格式，与 Markdown 复制是不同的数据通路。Session 1 聚焦复制 Markdown 的格式差异化，保存到 Notion 仍走现有 blocks 转换逻辑。
- **影响**：background/handlers/notionHandler.ts 和 platforms/notion/ 不做任何修改。
- **可反转性**：高。后续 Session 如需 Notion 保存时使用 profile 配置的格式偏好，可扩展保存链路。

### D-v0.3-009：MarkdownProfile 预留 fields 供后续 Session 扩展

- **原因**：imageStyle / tableStyle / formulaStyle / codeBlockStyle 在 Session 1 中仅为占位字段。Session 2（LaTeX）、Session 3（Code Block Cleaner）、Session 4（Image/Link/Table）将基于这些字段实现差异化处理。
- **影响**：当前 profile 定义包含这些字段但未在 formatMarkdownWithProfile 中消费（仅 body 使用了 cleanMarkdown）。后续 Session 扩展时无需修改 profile 定义。
- **可反转性**：低。移除这些字段需跨 Session 协调。

---

## v0.3 Session 0.1 决策

### D-v0.3-005：v0.3 主线调整为内容保真增强

- **原因**：内容保真增强可在现有 v0.2 架构上低成本推进；不需要后端、登录、模型 API、额外隐私政策和费用系统；直接提升 ClipMate 与普通网页剪藏工具的差异化。
- **影响**：v0.3 优先优化 Markdown / Notion / Obsidian / Typora 输出质量。AI、登录、服务器、OCR、付费延后到 v0.5+ 或后续版本。
- **可反转性**：中等。后续版本仍可重新引入 AI，但 v0.3 不作为主线。

---

## v0.3 Session 0 决策

### D-v0.3-004：v0.3 不允许 AI、多平台、OCR、付费同时开工

- **原因**：多方向并行会导致范围膨胀、测试复杂度倍增、审核风险叠加。v0.3 应选取唯一主线，在主线完成后再评估扩展。
- **影响**：V0.3_PLAN.md 明确禁止同时做多个方向。后续 Session Prompt 只能选择一条主线。
- **可反转性**：中。如果用户明确要求两条方向并行，可推翻，但需更新本决策和规划文档。

### D-v0.3-003：v0.3 Session 0 只做评估，不实现功能

- **原因**：与 v0.2 Session 0 保持一致原则。在未确定主线方向前写代码会导致不可逆的架构选择。Session 0 产出的 V0.3_PLAN.md 需经过 ChatGPT 审查和用户确认后才能进入实现阶段。
- **影响**：Session 0 只修改 docs/，不修改 src/、tests/、package.json、manifest.config.ts。
- **可反转性**：不可逆转（Session 0 已完成，历史不可改）。

### D-v0.3-002：v0.3 从稳定 v0.2 复制，不直接在 clipmate-v0.2/ 开发

- **原因**：与 D-051 保持一致的版本目录隔离策略。clipmate-v0.2/ 已是稳定快照，v0.3 的变更不应污染 v0.2。复制后 v0.3 独立演进，v0.2 bug fix 可在 v0.2 目录单独进行。
- **影响**：clipmate-v0.3/ 独立存在，其 package.json 和 manifest 版本号当前保持 0.2.0（将在后续 release Session 中升级）。
- **可反转性**：低。合并回 v0.2 成本高。

### D-v0.3-001：v0.3 使用独立 clipmate-v0.3/ 目录

- **原因**：继承 v0.2 版本目录隔离策略（D-051）。v0.1 和 v0.2 各自独立，v0.3 同样独立。方便多版本并存、回退和并行维护。
- **影响**：后续所有 v0.3 开发在 clipmate-v0.3/ 中进行。
- **可反转性**：低。

---

## v0.2 继承决策（仅摘要，完整内容见 clipmate-v0.2/docs/DECISIONS.md）

以下 v0.2 决策在 v0.3 中继续遵守，除非后续 Session 明确推翻并记录新决策：

| 编号 | 决策 | 状态 |
|------|------|------|
| D-036 | v0.2 不新增 manifest 权限 → v0.3 同样最小权限原则 | 继续遵守 |
| D-037 | 继续使用 chrome.storage.local | 继续遵守 |
| D-038 | 继续只调用 Notion API（v0.3 内容保真增强主线不新增外部 API） | 继续遵守 |
| D-040 | 历史记录保存 markdown | 继续遵守 |
| D-042 | 删除 Notion 目标时不删除历史记录 | 继续遵守 |
| D-043 | 历史记录保留 targetName 快照 | 继续遵守 |
| D-046 | History UI 放在 Options 页面内 | 继续遵守 |
| D-051 | 版本目录隔离 | 继续遵守（D-v0.3-001 继承） |
