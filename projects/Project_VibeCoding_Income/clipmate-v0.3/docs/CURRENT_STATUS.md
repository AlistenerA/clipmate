# CURRENT_STATUS.md — ClipMate v0.3 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，除非用户明确要求 patch，否则不修改
> - `clipmate-v0.3/` = 当前 v0.3 规划与开发目录

---

## 当前阶段

**v0.3 Session 7 已完成** — 文档、QA、版本号、打包：版本号升级到 0.3.0，更新所有发布文档和 QA 清单，lint/test/build/zip 全部通过。

- v0.3 主线：内容保真增强版。
- Session 6 交付：
  - `articleBoundaryGuard.ts`：7 个导出纯函数（preCleanDocument / isLikelyNoiseElement / calculateLinkDensity / hasEnoughArticleText / trimArticleBody / assessArticleConfidence / buildLowConfidenceSummary）
  - DOM 噪音预清理：3 层清理（tag/role/class），移除 form/button/input/nav/footer/aside + noise role + 46 个中英文噪音 class 关键词
  - 正文候选评分：confidence high/medium/low，基于文本长度、段落数、linkDensity
  - 链接密度：calculateLinkDensity 计算链接文本/总文本比
  - 正文尾部截断：trimArticleBody 在 markdown 尾部检测 17 个截断模式（责任编辑/相关推荐/打开app 等）
  - 低置信页面兜底：buildLowConfidenceSummary 生成免责提示 + 最多 10 条去重链接
  - 改进 fallback 提取：fallbackExtract 优先查找 article/main/.article-content 等内容容器
  - 99 项新测试
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
| Article Boundary Guard | ✅ 已完成 | Session 6 |
| 文档、QA、版本号、打包 | ✅ 已完成 | Session 7 — 版本号 0.3.0，所有发布文档更新，lint/test/build/zip 通过 |
| 鲁棒性检查与修复 | ⬜ 待开始 | Session 8 |
| package.json 版本号 | 0.3.0 | Session 7 已升级 |
| manifest.config.ts 版本号 | 0.3.0 | Session 7 已升级 |
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
- [x] v0.3 Session 6：Article Boundary Guard — DOM 噪音预清理、正文候选评分、尾部截断、低置信兜底、99 tests
- [x] v0.3 Session 7：文档、QA、版本号、打包 — 版本号 0.3.0，README/隐私/权限/商店/测试计划/QA 清单更新，lint 0 errors / test 703 passed / build success / zip 129KB

---

## 未完成（按优先级）

1. v0.3 Session 8：鲁棒性检查与修复
5. v0.2 人工 QA（独立于 v0.3，由用户决定何时执行）
6. v0.2 发布到 Edge Add-ons（独立于 v0.3，由用户决定何时执行）

---

## 下一阶段建议

**由 ChatGPT 审查 Session 7 交付** → 用户确认 → 发送 v0.3 Session 8 专用 Prompt（鲁棒性检查与修复）。
