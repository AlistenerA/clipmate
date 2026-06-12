# ISSUES.md — ClipMate v0.3 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## v0.3 开放问题

### v0.3 Session 2 完成状态

- Session 2 LaTeX / 数学公式保留已完成：formulaPreserve 纯函数 + cleanMarkdown 保护 + Content Script MathJax 提取 + htmlToMarkdown 预处理
- lint 0 errors / test 421 passed / build success
- R01 风险降级：LaTeX 公式在 Markdown 复制链路中已做文本保留；Notion equation block 仍暂不实现

### v0.3 待决策问题（非 blocker）

无。Q1-Q5 已全部确认。

### v0.3 内容保真增强已知风险

| 编号 | 风险 | 严重度 | 状态 |
|:---:|------|:---:|:---:|
| R01 | LaTeX 公式在 Notion 无原生 equation block 支持 | 🟢 低 | 已降级 — Markdown 复制链路已保留公式文本 |
| R02 | 代码块清理可能误删有效内容 | 🟡 中 | 开放 — Session 3 处理 |
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
