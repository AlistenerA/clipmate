# CHANGELOG_AGENT.md — ClipMate v0.1 / v0.2 / v0.3 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

---

## v0.3 Session 5：Markdown Preview (2026-06-13)

> 异常中断后续接：旧对话在 test 阶段卡住，根因为 parseMarkdownPreview 死循环。

### 新增文件
- `src/shared/markdown/markdownPreview.ts` — 6 个导出函数：isSafePreviewHref、sanitizePreviewText、parseImageLine、parseMarkdownPreview（主解析器，heading/paragraph/blockquote/list/code/table/image/hr blocks + inline bold/italic/code/link/image/formula segments）
- `src/popup/components/MarkdownPreview.tsx` — React 组件，纯文本节点渲染 blocks，无 dangerouslySetInnerHTML
- `tests/markdown-preview.test.ts` — 41 项新测试

### 修改文件
- `src/shared/markdown/index.ts` — barrel export 新增 markdownPreview
- `src/popup/App.tsx` — 新增 `showPreview` state，原文/预览切换按钮

### 卡住根因与修复
- **根因**：`![xss](javascript:alert(1))` URL 含括号，旧正则 `[^)]+` 不匹配；`collectParagraphLines` 的 `/^!\[/` break 返回 `next===i` 导致主循环死循环。
- **修复**：新增 `parseImageLine()` 宽松正则 `(.*)`；`collectParagraphLines` 改用 `parseImageLine()`；主循环增加 `next<=i` fallback 兜底。

### 改动摘要
- 未修改 Notion 保存链路、未新增依赖、未新增权限、未修改版本号
- lint: 0 errors / test: 604 passed (+41 new) / build: success

---

## v0.3 Session 4：Image / Link / Table Normalization (2026-06-12)

### 新增文件
- `src/shared/markdown/mediaLinkTableNormalizer.ts` — 7 个纯函数：isSafeLinkHref（链接安全过滤）、isLikelyImageUrl（图片 URL 判断）、sanitizeMarkdownCell（表格单元清理）、normalizeImageMarkdown（图片 Markdown 输出）、normalizeLinkMarkdown（链接 Markdown 输出）、normalizeTableMarkdown（表格 Markdown 输出）
- `tests/markdown-media-link-table.test.ts` — 83 项新测试

### 修改文件
- `src/content/parser/htmlToMarkdown.ts` — 新增 4 个 Turndown rules：
  - **img rule**：多候补 src 提取（src / currentSrc / data-src / data-original / data-lazy-src / data-lazy），输出 `![alt](url)`，过滤 javascript:/data:image，空 alt 输出 `![](url)`
  - **figure rule**：检测 figcaption，将 caption 文本包裹为 `*caption*` 斜体
  - **anchor rule**：isSafeLinkHref 过滤 javascript:/data:/void(0) 后生成 `[text](href)`，不安全链接只保留文本
  - **table rule**：简单表格转 `| col |` Markdown table，复杂表格走 `*表格已简化*` fallback，新增 cellTextWithBreaks 处理 `<br>` 空格
- `src/shared/markdown/index.ts` — barrel export 新增 mediaLinkTableNormalizer

### 未修改文件
- `clipmate-v0.1/` — 未修改
- `clipmate-v0.2/` — 未修改
- `clipmate-v0.3/src/platforms/notion/` — 未修改（未改 Notion API 保存链路）
- `clipmate-v0.3/src/background/` — 未修改
- `clipmate-v0.3/src/popup/` — 未修改
- `clipmate-v0.3/src/shared/storage/` — 未修改
- `clipmate-v0.3/src/shared/utils/formatMarkdown.ts` — 未修改
- `clipmate-v0.3/src/shared/markdown/formulaPreserve.ts` — 未修改
- `clipmate-v0.3/src/shared/markdown/codeBlockCleaner.ts` — 未修改
- `clipmate-v0.3/package.json` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/manifest.config.ts` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/package-lock.json` — 未修改

### 改动摘要
- 新增 mediaLinkTableNormalizer.ts：7 个纯函数覆盖图片/链接/表格规范化
- 图片：多候补 src 提取、alt 保留、javascript:/data:image 过滤、空 src 返回 alt
- 链接：安全过滤 javascript:/data:/void(0)，保留 http/https/mailto/tel/相对路径/锚点
- 表格：简单表格转 Markdown table（th 优先作 header，| 转义，换行压空格）；复杂表格（colspan/rowspan）走 `*表格已简化*` fallback
- 集成在 htmlToMarkdown 转换阶段（4 个 Turndown rules），不影响 Notion API 保存链路
- 与 Session 2 公式保护和 Session 3 代码块清理兼容：公式在 Turndown 前预处理，代码块在 Markdown 后处理阶段清理，表格/链接/图片在 Turndown 中间阶段规范化
- 未修改 manifest 权限
- 未新增依赖
- 未修改版本号
- 未修改 package-lock.json
- lint: 0 errors / test: 563 passed (+83 new) / build: success

---

## v0.3 Session 3：Code Block Cleaner (2026-06-12)

### 新增文件
- `src/shared/markdown/codeBlockCleaner.ts` — 5 个纯函数：normalizeCodeLanguage（语言别名映射）、extractCleanLanguage（从 HTML class 提取语言名）、cleanCodeBlock（清理单个代码块噪音）、cleanMarkdownCodeBlocks（Markdown 后处理 fenced code block）、preserveCodeFenceLanguage
- `tests/markdown-code-block-cleaner.test.ts` — 59 项新测试

### 修改文件
- `src/content/parser/htmlToMarkdown.ts` — htmlToMarkdown 末尾调用 cleanMarkdownCodeBlocks，在 Turndown + cleanMarkdown 之后对 fenced code block 做后处理清理
- `src/shared/markdown/index.ts` — barrel export 新增 codeBlockCleaner

### 未修改文件
- `clipmate-v0.1/` — 未修改
- `clipmate-v0.2/` — 未修改
- `clipmate-v0.3/src/platforms/notion/` — 未修改（未改 Notion API 保存链路）
- `clipmate-v0.3/src/background/` — 未修改
- `clipmate-v0.3/src/popup/` — 未修改
- `clipmate-v0.3/src/shared/storage/` — 未修改
- `clipmate-v0.3/src/shared/utils/formatMarkdown.ts` — 未修改（cleanMarkdown 不改动）
- `clipmate-v0.3/package.json` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/manifest.config.ts` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/package-lock.json` — 未修改

### 改动摘要
- 新增 codeBlockCleaner.ts：cleanCodeBlock 清理代码块内 UI 噪音（Copy/Copied/复制/复制代码 按钮文字、standalone 语言标签、show more/expand/collapse/展开/收起、连续行号前缀、独立行号列）
- normalizeCodeLanguage 映射语言别名（js→javascript、ts→typescript、py→python 等）
- extractCleanLanguage 从 HTML class 提取干净语言名（language-xxx / lang-xxx / highlight-source-xxx / brush: xxx）
- cleanMarkdownCodeBlocks 在 Markdown 层匹配 fenced code block 并调用 cleanCodeBlock
- 保守策略：保留 shell prompt（$ / >>> / PS>）、保留代码内数字/字符串/注释中的 "copy"、保留真实缩进空行、不清除不连续的行号
- 集成在 htmlToMarkdown 末尾（Turndown → cleanMarkdown → cleanMarkdownCodeBlocks），不影响 Notion API 保存链路
- 与 Session 2 LaTeX 公式保护兼容：公式先被 cleanMarkdown 保护还原，code block cleaner 仅在 fenced code block 内操作
- 未修改 manifest 权限
- 未新增依赖
- 未修改版本号
- 未修改 package-lock.json
- lint: 0 errors / test: 480 passed (+59 new) / build: success

---

## v0.3 Session 2：LaTeX / 数学公式保留 (2026-06-12)

### 新增文件
- `src/shared/markdown/formulaPreserve.ts` — 4 个纯函数：protectLatexSegments（保护公式片段免遭清理破坏）、normalizeLatexDelimiters（统一公式分隔符）、preserveMathHtml（从 MathJax/KaTeX HTML 恢复 LaTeX）
- `tests/markdown-formula-preserve.test.ts` — 42 项新测试

### 修改文件
- `src/shared/markdown/index.ts` — barrel export 新增 formulaPreserve
- `src/shared/utils/formatMarkdown.ts` — cleanMarkdown 内部使用 protectLatexSegments 保护公式，新增内部 doCleanText 函数
- `src/content/index.ts` — 新增 extractMathJaxFormulas 函数，在 cleanDocument 前提取 script[type^="math/tex"] 并替换为可见文本 span
- `src/content/parser/htmlToMarkdown.ts` — htmlToMarkdown 中先用 preserveMathHtml 恢复 KaTeX/data-latex 公式再进入 Turndown

### 未修改文件
- `clipmate-v0.1/` — 未修改
- `clipmate-v0.2/` — 未修改
- `clipmate-v0.3/src/platforms/notion/` — 未修改（未改 Notion API 保存链路）
- `clipmate-v0.3/src/background/` — 未修改
- `clipmate-v0.3/src/popup/` — 未修改（formatMarkdownWithProfile 已自动受益于 cleanMarkdown 公式保护）
- `clipmate-v0.3/src/shared/storage/` — 未修改
- `clipmate-v0.3/package.json` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/manifest.config.ts` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/package-lock.json` — 未修改

### 改动摘要
- 新增 formulaPreserve.ts：protectLatexSegments（$...$ / $$...$$ / \(...\) / \[...\] 占位保护）、normalizeLatexDelimiters（统一为 $ 分隔符）、preserveMathHtml（script/math-tex、annotation/application-x-tex、data-latex、data-katex-src、alttext 恢复）
- cleanMarkdown 内部自动保护公式片段后再执行 bold 合并清理，确保公式内 `_`、`*`、`\` 不被破坏
- Content Script 在 cleanDocument 前提取 MathJax <script type="math/tex"> 源码，按 mode=display 区分 block/inline，替换为 text span（带 data-clipmate-formula 属性）
- htmlToMarkdown 调用 preserveMathHtml 在 Turndown 前预处理 HTML
- 未破坏现有复制 Markdown 行为
- 未修改 Notion API 保存链路
- 保守策略：不把 $10 等金额误判为公式，不编造无法恢复的公式文本
- 未新增 manifest 权限
- 未新增依赖
- 未修改版本号
- lint: 0 errors / test: 421 passed (+42 new) / build: success

### 修复问题
- String.replace 中 `$` 特殊字符导致的 $$ 块公式双 $ 变单 $ 问题（改用 callback replacer）

---

## v0.3 Session 1：Markdown Target Profiles (2026-06-12)

### 新增文件
- `src/shared/markdown/profiles.ts` — 4 个 MarkdownProfile 定义（notion/obsidian/typora/generic）+ getMarkdownProfile / listMarkdownProfiles / normalizeMarkdownTarget 纯函数
- `src/shared/markdown/formatWithProfile.ts` — formatMarkdownWithProfile 纯函数，支持 YAML frontmatter、标签风格、来源格式差异化
- `src/shared/markdown/index.ts` — barrel export
- `src/popup/components/MarkdownTargetSelector.tsx` — Popup 内 Markdown 格式选择器组件
- `tests/markdown-profiles.test.ts` — 58 项新测试

### 修改文件
- `src/shared/types/clip.types.ts` — 新增 MarkdownTarget 类型、MarkdownProfile 接口
- `src/popup/App.tsx` — 接入 formatMarkdownWithProfile + MarkdownTargetSelector（保持默认 notion 向后兼容）

### 未修改文件
- `clipmate-v0.1/` — 未修改
- `clipmate-v0.2/` — 未修改
- `clipmate-v0.3/src/platforms/notion/` — 未修改（未改 Notion API 保存链路）
- `clipmate-v0.3/src/background/` — 未修改
- `clipmate-v0.3/src/content/` — 未修改
- `clipmate-v0.3/package.json` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/manifest.config.ts` — 未修改（版本号保持 0.2.0）

### 改动摘要
- 新增 MarkdownTarget 四类输出目标：Notion（保持现有格式）、Obsidian（YAML frontmatter）、Typora（标准 Markdown link）、Generic（最通用）
- formatMarkdownWithProfile 纯函数按 profile 配置生成差异化 Markdown
- Popup 新增轻量级 MarkdownTargetSelector 下拉组件，默认 notion
- 未破坏现有复制 Markdown 行为（notion target 输出与 v0.2 formatCopyMarkdown 一致）
- 未修改 Notion API 保存链路
- 未新增 manifest 权限
- 未新增依赖
- 未修改版本号
- lint: 0 errors / test: 379 passed (+58 new) / build: success

## v0.3 Session 0.1：重规划修正 — 主线调整为内容保真增强 (2026-06-12)

### 修改文件
- `docs/V0.3_PLAN.md` — 全面重写：v0.3 定位从"AI 摘要与 AI 标签"改为"内容保真增强"；新增 8 个 Session 拆分（S1 Markdown Target Profiles → S8 鲁棒性检查）；6 项暂缓功能明确推迟到 v0.5+；更新风险清单
- `docs/CURRENT_STATUS.md` — 更新为 Session 0.1 完成状态；下一步指向 Session 1 Markdown Target Profiles
- `docs/DECISIONS.md` — 新增 D-v0.3-005：v0.3 主线调整为内容保真增强
- `docs/ISSUES.md` — 移除旧 AI 方向 Q1-Q7；新增内容保真增强 5 个待决策问题 + 6 个已知风险
- `docs/TEST_LOG.md` — Session 0.1 记录
- `docs/CHANGELOG_AGENT.md` — 本条记录

### 未修改文件
- `clipmate-v0.1/` — 未修改
- `clipmate-v0.2/` — 未修改
- `clipmate-v0.3/src/` — 未修改
- `clipmate-v0.3/tests/` — 未修改
- `clipmate-v0.3/package.json` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/manifest.config.ts` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/docs/AGENT_CONTEXT.md` — 未修改（当前内容已兼容新方向，不需修正）

### 改动摘要
- v0.3 主线从 AI 摘要/AI 标签调整为内容保真增强
- 新主线聚焦：Markdown Target Profiles、LaTeX 保留、Code Block Cleaner、Image/Link/Table 规范化、Markdown Preview、Article Boundary Guard
- AI / 多平台 / OCR / 付费明确暂缓到 v0.5+ 或 v0.6+
- 本轮 docs-only，未修改任何业务代码
- 未修改 v0.1/v0.2
- 未新增/修改 manifest 权限
- 未新增依赖
- 未运行 lint/test/build（无代码变更）

---

## v0.3 Session 0：版本目录隔离与启动前评估 (2026-06-11)

### 新增文件
- `clipmate-v0.3/` — 从 v0.2 复制的新版本目录（排除 node_modules/dist/build/*.zip/.env）
- `docs/V0.3_PLAN.md` — v0.3 迭代规划文档（定位、候选方向评估、Session 拆分草案、待决策问题）

### 修改文件
- `docs/AGENT_CONTEXT.md` — 重写为 v0.3 版本上下文
- `docs/CURRENT_STATUS.md` — 更新为 v0.3 Session 0 完成状态
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 0 记录
- `docs/ISSUES.md` — 更新待决策问题
- `docs/DECISIONS.md` — 新增 D-v0.3-001~D-v0.3-004

### 未修改文件
- `clipmate-v0.1/` — 未修改
- `clipmate-v0.2/` — 未修改
- `clipmate-v0.3/src/` — 未修改
- `clipmate-v0.3/tests/` — 未修改
- `clipmate-v0.3/package.json` — 未修改（版本号保持 0.2.0）
- `clipmate-v0.3/manifest.config.ts` — 未修改（版本号保持 0.2.0）

### 改动摘要
- 基于稳定 v0.2（commit `6d6087c`）创建 clipmate-v0.3/ 独立目录
- 创建 feature/clipmate-v0.3-planning 分支
- 新建 V0.3_PLAN.md：6 个候选方向评估、影响分析、推荐优先级、Session 拆分草案、7 个待用户决策问题
- 更新所有 v0.3 docs 为 v0.3 上下文
- 未修改任何业务代码
- 未修改 v0.1/v0.2
- 未新增/修改 manifest 权限
- 未新增依赖
- 未运行 lint/test/build（本轮不需要）

---

## v0.2 Session 8：跨版本工作流规则录入 + v0.3 交接文档 (2026-06-11)

### 新增文件
- `docs/WORKFLOW_RULES.md` — ClipMate 跨版本 Agent 工作流规则（通用规则，适用于 v0.2、v0.2.x、v0.3、v0.4 及后续版本）
- `docs/V0.3_HANDOFF.md` — v0.3 版本交接与规划草案（候选方向评估、启动前置条件、禁止事项）

### 修改文件
- `docs/AGENT_CONTEXT.md` — 新增"跨版本工作流规则入口"章节，引导 agent 优先读取 WORKFLOW_RULES.md 和 V0.3_HANDOFF.md
- `docs/CURRENT_STATUS.md` — 更新当前阶段为 Session 8 已完成
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 8 记录（docs-only，无代码变更）
- `docs/ISSUES.md` — 确认无新增 blocker
- `docs/DECISIONS.md` — 新增 D-075/D-076/D-077

### 改动摘要
- 本轮为 docs-only 规则录入任务，未修改任何业务代码
- 未修改 clipmate-v0.1/
- 未修改 clipmate-v0.2/src/
- 未修改 clipmate-v0.2/tests/
- 未修改 package.json / manifest.config.ts 版本号
- WORKFLOW_RULES.md 覆盖：优先级规则、安全底线、版本目录隔离、每轮开始/结束规则、Git commit 规则、Bug 修复流程、功能开发规划流程、鲁棒性检查流程、人工测试与 ChatGPT 审查规则
- V0.3_HANDOFF.md 覆盖：当前状态、启动前置条件、5 个候选方向评估（AI/Database/多平台/OCR/付费）、推荐优先级、启动 Prompt 原则、禁止事项、ChatGPT 审查节点

---

*（以下为 v0.2 及更早版本的修改记录，完整内容见 clipmate-v0.2/docs/CHANGELOG_AGENT.md）*
