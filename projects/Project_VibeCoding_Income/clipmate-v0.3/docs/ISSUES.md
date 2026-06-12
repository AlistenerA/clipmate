# ISSUES.md — ClipMate v0.3 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## v0.3 开放问题

### v0.3 Session 1 — 已确认问题（Q1-Q5 已由用户决策）

1. ~~**Q1**：Markdown Target Profiles 优先级~~ → 已确认：Notion > Obsidian > Typora > Generic Markdown
2. ~~**Q2**：Obsidian / Typora 是否需要 downloads 权限~~ → 已确认：本轮不需要
3. ~~**Q3**：LaTeX 公式在 Notion 中的目标形态~~ → 已确认：保留公式文本，预留结构给 Session 2
4. ~~**Q4**：v0.2 QA 是否阻塞 v0.3~~ → 已确认：不阻塞
5. ~~**Q5**：v0.3 版本号~~ → 已确认：0.3.0，Session 7 统一修改

### v0.3 Session 1 完成状态

- Session 1 Markdown Target Profiles 已完成：4 profiles + 纯函数 + Popup 接入 + 58 新测试
- lint 0 errors / test 379 passed / build success

### v0.3 待决策问题（非 blocker）

无。Q1-Q5 已全部确认。

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
