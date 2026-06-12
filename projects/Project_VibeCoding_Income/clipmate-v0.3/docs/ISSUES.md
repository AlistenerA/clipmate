# ISSUES.md — ClipMate v0.3 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## v0.3 开放问题

### v0.3 Session 0.1 — 待决策问题（非 blocker，需用户确认）

以下问题必须在 v0.3 功能开发启动前由用户确认：

1. **Q1**：Markdown Target Profiles 的优先级顺序？（Notion > Obsidian > Typora > Generic Markdown / 其他）
2. **Q2**：Obsidian / Typora 的 Markdown 导出是否需要 `downloads` 权限？（仅剪贴板复制 / 同时支持下载）
3. **Q3**：LaTeX 公式在 Notion 中的目标形态？（保留公式文本 / 尝试转换为 Notion equation block）
4. **Q4**：是否先完成 v0.2 人工 QA 和 Edge Add-ons 发布再进入 v0.3 功能开发？
5. **Q5**：v0.3 正式版本号用 0.3.0 还是 0.2.x？

### v0.3 内容保真增强已知风险

| 编号 | 风险 | 严重度 | 状态 |
|:---:|------|:---:|:---:|
| R01 | LaTeX 公式在 Notion 无原生 equation block 支持 | 🟡 中 | 开放 |
| R02 | 代码块清理可能误删有效内容 | 🟡 中 | 开放 |
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
