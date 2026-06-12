# ISSUES.md — ClipMate v0.3 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## v0.3 开放问题

### v0.3 Session 3 完成状态

- Session 3 Code Block Cleaner 已完成：codeBlockCleaner 纯函数 + cleanMarkdownCodeBlocks 后处理 + 59 tests
- R02 风险降级：代码块清理已覆盖常见复制按钮、行号、语言标签和折叠提示；仍需在真实网页上观察误删有效代码的风险

### v0.3 待决策问题（非 blocker）

无。Q1-Q5 已全部确认。

### v0.3 内容保真增强已知风险

| 编号 | 风险 | 严重度 | 状态 |
|:---:|------|:---:|:---:|
| R01 | LaTeX 公式在 Notion 无原生 equation block 支持 | 🟢 低 | 已降级 — Markdown 复制链路已保留公式文本 |
| R02 | 代码块清理可能误删有效内容 | 🟢 低 | 已降级 — 覆盖常见噪音模式；需真实网页验证 |
| R03 | Markdown Target Profiles 导致 settings 结构膨胀 | 🟢 低 | 开放 |
| R04 | 复杂表格转 Markdown table 可能丢失信息 | 🟡 中 | 开放 |
| R05 | Markdown Preview 需防范 XSS 安全风险 | 🔴 高 | 开放 |
| R06 | Article Boundary Guard 误删有效正文 | 🟡 中 | 开放 |

---

## v0.3 blocker

当前无 blocker。

---

## v0.2 已知问题

*（以下为 v0.2 继承问题，仅作参考。完整内容见 clipmate-v0.2/docs/ISSUES.md）*

### I-018：复制 Markdown 暂不写入 unsaved 历史

- **状态**：🟡 已确认保留（v0.2 已知，不影响 v0.3）

### I-006：ClipDraft 恢复与自动提取存在潜在竞态

- **状态**：🟡 已缓解（v0.2 Session 3.1 已缓解，不影响 v0.3）

### I-005：Bundle 体积偏大

- **状态**：🟡 待评估（Content Script 47.61KB gzip 16.21KB，v0.2 不优化）
