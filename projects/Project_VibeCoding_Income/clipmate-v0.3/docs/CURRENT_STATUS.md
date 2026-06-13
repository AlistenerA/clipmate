# CURRENT_STATUS.md — ClipMate v0.3 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，除非用户明确要求 patch，否则不修改
> - `clipmate-v0.3/` = 当前 v0.3 规划与开发目录

---

## 当前阶段

**v0.3 Session 5 已完成** — Markdown Preview：新增安全的 Markdown 原文/预览切换功能。

- v0.3 主线：内容保真增强版。
- Session 5 交付：
  - Preview parser：`parseMarkdownPreview` 纯函数，解析 heading/paragraph/blockquote/list/code/table/image/hr 为类型化 blocks，内联支持 text/bold/italic/code/link/image/formula
  - `parseImageLine`：安全函数处理 URL 含括号的图片 Markdown
  - `markdownPreview.ts`：6 个导出函数（isSafePreviewHref / sanitizePreviewText / parseImageLine / parseMarkdownPreview + 类型）
  - Preview component：`MarkdownPreview.tsx` React 组件，纯文本节点渲染，无 dangerouslySetInnerHTML
  - Popup 接入：原文/预览切换按钮，useMemo 确保 Markdown Target Profile 同步
  - 41 项新测试
- 卡住根因与修复：图片语法 URL 含括号时（如 `javascript:alert(1)`），旧正则 `[^)]+` 不匹配，`collectParagraphLines` 的 `/^!\[/` break 返回 `next===i` 导致死循环。修复：新增 `parseImageLine` 宽松正则 + `next<=i` fallback 兜底。
- 未修改 Notion API 保存链路、未新增权限、未新增依赖、未修改版本号。

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| v0.3 版本目录创建 | ✅ 已完成 | Session 0 |
| v0.3 分支创建 | ✅ 已完成 | feature/clipmate-v0.3-planning |
| v0.3 方向评估（初版AI方向） | ✅ 已完成 | Session 0，已被 Session 0.1 重规划替代 |
| v0.3 重规划修正 | ✅ 已完成 | Session 0.1 — 主线调整为内容保真增强 |
| v0.3 功能开发 | ✅ 进行中 | Session 1-4 已完成 |
| Markdown Target Profiles | ✅ 已完成 | Session 1 — 4 profiles + 纯函数 + 测试 + Popup 接入 |
| LaTeX 公式保留 | ✅ 已完成 | Session 2 — formulaPreserve 纯函数 + cleanMarkdown 保护 + HTML 恢复 |
| Code Block Cleaner | ✅ 已完成 | Session 3 — codeBlockCleaner 纯函数 + 后处理清理 + 59 tests |
| Image / Link / Table Normalization | ✅ 已完成 | Session 4 — mediaLinkTableNormalizer 纯函数 + Turndown rules + 83 tests |
| Markdown Preview | ✅ 已完成 | Session 5 |
| Article Boundary Guard | ⬜ 待开始 | Session 6 |
| 文档、QA、版本号、打包 | ⬜ 待开始 | Session 7 |
| 鲁棒性检查与修复 | ⬜ 待开始 | Session 8 |
| package.json 版本号 | 0.2.0 | 未修改，留待 Session 7 |
| manifest.config.ts 版本号 | 0.2.0 | 未修改，留待 Session 7 |
| manifest 权限 | 未变 | storage / activeTab / host_permissions api.notion.com |

---

## 已完成

- [x] v0.3 Session 0：版本目录隔离与启动前评估
- [x] v0.3 Session 0.1：重规划修正 — 主线调整为内容保真增强（docs-only）
- [x] v0.3 Session 1：Markdown Target Profiles — 数据结构、纯函数、测试、Popup 接入
- [x] v0.3 Session 2：LaTeX 公式保留 — formulaPreserve 纯函数、cleanMarkdown 保护、Content Script MathJax 提取、htmlToMarkdown 预处理
- [x] v0.3 Session 3：Code Block Cleaner — codeBlockCleaner 纯函数、htmlToMarkdown 后处理、59 tests
- [x] v0.3 Session 4：Image / Link / Table Normalization — mediaLinkTableNormalizer 纯函数、Turndown rules 增强、83 tests
- [x] v0.3 Session 5：Markdown Preview — parseMarkdownPreview 纯函数、MarkdownPreview 安全组件、Popup 切换、41 tests（含卡住修复）

---

## 未完成（按优先级）

1. v0.3 Session 6：Article Boundary Guard
2. v0.3 Session 7：文档、QA、版本号、打包
3. v0.3 Session 8：鲁棒性检查与修复
5. v0.2 人工 QA（独立于 v0.3，由用户决定何时执行）
6. v0.2 发布到 Edge Add-ons（独立于 v0.3，由用户决定何时执行）

---

## 下一阶段建议

**由 ChatGPT 审查 Session 5 交付** → 用户确认 → 发送 v0.3 Session 6 专用 Prompt（Article Boundary Guard）。
