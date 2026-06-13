# QUALITY_GUARDRAILS.md — ClipMate v0.4 质量门禁

> 定义 v0.4 开发过程中的 vibe slop 防范规则、模块边界、审查节点和后续 Session 命名建议。
> **本文档不包含代码。**

---

## 1. Vibe Slop 定义

本项目中的 vibe slop 指以下行为：

1. **重复实现同一逻辑**：同一判断（如"是否搜索页"）在 PageType detector、extractor、content script 中各有独立版本。
2. **职责混杂**：页面类型判断、站点 profile、用户 intent 判断互相混杂在同一函数/文件中。
3. **散落硬编码**：大量 `if (domain === 'xxx.com')` 散落在 extractor / content script 中，绕过 profile engine。
4. **单文件过长且职责不清**：超过 400 行的文件包含多个不相关模块的逻辑。
5. **测试退化**：为通过测试而删除测试、降低断言、隐藏失败。
6. **敏感信息泄露**：console / log / docs / tests 泄露正文、备注、Markdown、Token、完整 settings。
7. **临时代码残留**：TODO 注释、debug 日志、临时变量长期保留在生产代码中。
8. **目录失控**：随意创建新目录而不遵循现有结构规范。
9. **未经审查的变更**：新增权限、依赖、API 调用没有设计审查。

---

## 2. 模块边界建议（规划，不写代码）

以下模块边界为架构规划，Session 2 及后续 Session 应遵循：

### pageTypeDetector
- **职责**：只判断页面类型（article / search-results / navigation / forum-or-comment / video / ai-answer / unknown）
- **原则**：纯函数优先，不访问 chrome API、网络、storage
- **位置**：`src/shared/utils/pageTypeDetector.ts`（Session 1 已实现）

### siteProfileEngine
- **职责**：只做 domain / URL pattern / selector hints 的结构化匹配，不做剪藏策略
- **原则**：配置文件驱动，不写散落 if
- **位置**：`src/shared/siteProfiles/`（Session 2 实现）

### intentDetector
- **职责**：综合 PageType + SiteProfile + SelectionContext + VisibleContext + RecentInteraction，输出用户意图
- **原则**：不持久化用户内容，不接 API
- **位置**：`src/content/intent/`（Session 2.1 实现）

### clipStrategy
- **职责**：根据 intent 决定摘要、选区、评论、视频页、导航页如何剪藏
- **原则**：策略模式，不硬编码站点
- **位置**：`src/content/strategy/`（Session 3/4 实现）

### extractors
- **职责**：负责实际内容提取（Readability、Markdown 转换等）
- **原则**：不写站点散落 if，不保存完整用户内容
- **位置**：`src/content/extractors/`（已有）

---

## 3. 质量门禁时机

建议在以下节点执行 Anti-Slop Review，每次审查对照 Section 4 的检查项：

| 节点 | 时机 | 审查重点 |
|------|------|----------|
| A-SR-1 | Session 2 完成 Site Profile Engine 后 | 无散落 domain if；profile 引擎结构清晰 |
| A-SR-2 | Session 4 完成 Comment / Selection Clip Mode 后 | 评论/选区逻辑不侵入 PageType detector |
| A-SR-3 | Session 7 完成 Link Card Preview 后 | 新增模块边界清晰；无重复实现 |
| A-SR-4 | Session 8 release docs/package 前 | 全面审计：测试、日志、权限、版本 |
| A-SR-5 | 任何新增权限/依赖/外部 API 前 | 变更必要性审查 |

---

## 4. 每次 Anti-Slop Review 检查项

1. **重复定义检查**：是否出现重复的 PageType / Intent / Profile 类型定义？
2. **散落硬编码检查**：extractor / content script 是否有 `if (hostname === 'xxx.com')` 绕过 profile engine？
3. **单文件长度检查**：是否有新增文件超过 400 行且包含多个不相关模块？
4. **循环依赖检查**：是否有循环 import 或跨层 import（如 extractor → popup）？
5. **测试完整性检查**：是否删除/降低/隐藏了任何测试断言？
6. **敏感信息日志检查**：console / error message / test snapshot 是否包含正文、备注、Markdown、settings、Token？
7. **权限/依赖检查**：是否新增了 manifest 权限、npm 依赖、外部 API 调用？
8. **版本目录检查**：是否修改了 `clipmate-v0.1/`、`clipmate-v0.2/`、`clipmate-v0.3/`？
9. **构建产物检查**：是否提交了 `dist/`、`build/`、`*.zip`、`node_modules/`、`.env`？
10. **工具目录检查**：是否修改了 `.wolf/`、`.opencode/`、`.playwright-mcp/`？

---

## 5. 后续 Session 命名建议

在 V0.4_PLAN.md 原有计划基础上，建议增加以下 Session：

| Session | 名称 | 说明 |
|---------|------|------|
| 2 | Site Profile Engine | 核心引擎：domain/URL pattern/selector hints 结构化匹配 |
| 2.1 | Intent Signal Collector | 综合 PageType + SiteProfile + Selection + Visible + Interaction |
| 2.2 | Seed Site Profiles | 基于 SITE_INTENT_MATRIX.md 创建重点站点 profile 种子数据 |
| 2.3 | Anti-Slop Review | Profile + Intent 完成后质量审查 |
| 3 | Navigation Summary Mode | 导航页安全摘要 |
| 4 | Comment / Selection Clip Mode | 评论/选区剪藏 |
| 4.1 | Anti-Slop Review | Comment Mode 后质量审查 |

原有 Session 5-9 延后编号或保持与 V0.4_PLAN.md 一致。

---

## 6. 临时代码标记规范

为避免临时代码残留，使用以下标记：

| 标记 | 含义 | 生命周期 |
|------|------|----------|
| `// @SLOP-TODO` | vibe slop 需重构的点 | 当前 Session 内解决 |
| `// @NEEDS-AI` | 当前版本无法处理，需未来 AI 版 | 标记到 v0.5+ |
| `// @DEBUG-REMOVE` | 临时 debug 代码 | 提交前必须删除 |

---

*（此文档随每次 Anti-Slop Review 迭代更新）*
