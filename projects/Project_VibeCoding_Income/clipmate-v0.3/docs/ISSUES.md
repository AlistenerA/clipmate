# ISSUES.md — ClipMate v0.3 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## v0.3 开放问题

### v0.3 Session 0 — 待决策问题（非 blocker，需用户确认）

以下问题必须在 v0.3 功能开发启动前由用户确认：

1. **Q1**：v0.3 的唯一主线方向？（AI 摘要与 AI 标签 / Notion Database 属性映射 / Obsidian/本地 Markdown 导出）
2. **Q2**：是否接受用户内容发送到外部 LLM API？
3. **Q3**：如果做 AI，首选模型供应商？（OpenAI / DeepSeek / 智谱 / Claude）
4. **Q4**：AI 功能是否默认关闭？（推荐：默认关闭，用户主动开启）
5. **Q5**：是否先完成 v0.2 人工 QA 和 Edge Add-ons 发布再启动 v0.3？
6. **Q6**：是否需要先做 v0.2.1 patch？
7. **Q7**：v0.3 正式版本号用 0.3.0 还是 0.2.x？

---

## v0.3 blocker

当前无 blocker。Session 0 为纯规划任务，未发现阻塞问题。

---

## v0.2 已知问题

*（以下为 v0.2 继承问题，仅作参考。完整内容见 clipmate-v0.2/docs/ISSUES.md）*

### I-018：复制 Markdown 暂不写入 unsaved 历史

- **状态**：🟡 已确认保留（v0.2 已知，不影响 v0.3）

### I-006：ClipDraft 恢复与自动提取存在潜在竞态

- **状态**：🟡 已缓解（v0.2 Session 3.1 已缓解，不影响 v0.3）

### I-005：Bundle 体积偏大

- **状态**：🟡 待评估（Content Script 47.61KB gzip 16.21KB，v0.2 不优化）
