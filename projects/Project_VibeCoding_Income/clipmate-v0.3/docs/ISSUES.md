# ISSUES.md — ClipMate v0.3 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## v0.3 开放问题

### v0.3 Session 7 完成状态

- Session 7 已完成：版本号 0.3.0，发布文档更新，QA 清单 58 项，lint/test/build/zip 全部通过
- 下一步：Session 8 鲁棒性检查与修复

### v0.3 待决策问题（非 blocker）

无。Q1-Q5 已全部确认。

### v0.3 内容保真增强已知风险

| 编号 | 风险 | 严重度 | 状态 |
|:---:|------|:---:|:---:|
| R01 | LaTeX 公式在 Notion 无原生 equation block 支持 | 🟢 低 | 已降级 — Markdown 复制链路已保留公式文本 |
| R02 | 代码块清理可能误删有效内容 | 🟢 低 | 已降级 — 覆盖常见噪音模式；需真实网页验证 |
| R03 | Markdown Target Profiles 导致 settings 结构膨胀 | 🟢 低 | 开放 |
| R04 | 复杂表格转 Markdown table 可能丢失信息 | 🟡 中 | 已降级 — 简单表格支持 Markdown table；复杂表格采用保守简化策略（`*表格已简化*` + 纯文本）|
| R05 | Markdown Preview 需防范 XSS 安全风险 | 🟢 低 | 已降级 — 已采用 React 文本节点和轻量 parser，不使用 dangerouslySetInnerHTML，不加载远程图片 |
| R06 | Article Boundary Guard 误删有效正文 | 🟡 中 | 已降级 — 已加入 DOM 噪音清理（tag/role/class 3 层）、正文候选评分（confidence 三级）、尾部截断（17 个模式）和低置信页面兜底（免责提示 + 最多 10 条链接）；长文本（>500 字）和正文元素（article/main/pre/code/table/img/figure/blockquote/h1-h3/p）受保护；仍需通过真实网易新闻、新浪、腾讯、澎湃、CSDN、掘金等页面进行人工验证，防止误删正文 |

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
