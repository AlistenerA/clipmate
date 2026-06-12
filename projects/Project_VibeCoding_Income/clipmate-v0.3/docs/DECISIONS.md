# DECISIONS.md — ClipMate v0.3 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

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
