# ISSUES.md — ClipMate v0.3 已知问题追踪

> 记录所有未解决问题，不要隐藏失败。已解决的问题标记为 ✅。

---

## v0.3 开放问题

### v0.3 Session 8-D 完成状态

- Session 8-D 已完成：Popup 选区优先模式最终修复 + 已知问题归档 + 文档脱敏，lint 0 errors / test 757 passed / build success
- 下一步：用户复测选区优先 → ChatGPT 审查 → commit

### v0.3 人工 QA 复测记录

- Notion rich_text 加粗/斜体/代码/链接：✅ 用户已验证通过
- CSDN/LaTeX 页面公式：⚠️ 站点渲染仍有残留问题 → **挂起到 v0.4+**，不阻塞 v0.3 发布
- 搜索页/导航页分类：⚠️ 效果仍不理想 → **挂起到 v0.4+**，不阻塞 v0.3 发布
- 选区优先模式：已修复（8-D），**需用户复测**
- 选区段落缩进：可接受（D-v0.3-046）

---

## v0.4 待评估 / 后续版本候选

| 编号 | 需求 | 状态 |
|:---:|------|:---:|
| F01 | 保存文档按钮（本地保存 .md 文件） | 暂缓到 v0.4+ |
| F02 | 选择 Windows 目录保存 .md 文件 | 暂缓到 v0.4+ |
| F03 | 记忆 Typora / Obsidian 上次保存目录 | 暂缓到 v0.4+ |
| F04 | 最近复制历史模块 | 暂缓到 v0.4+ |
| F05 | 全文复制和选区复制历史分离 | 暂缓到 v0.4+ |

### v0.3 待决策问题（非 blocker）

无。Q1-Q5 已全部确认。

### v0.3 内容保真增强已知风险

| 编号 | 风险 | 严重度 | 状态 |
|:---:|------|:---:|:---:|
| R01 | LaTeX 公式在 Notion 无原生 equation block 支持 | 🟢 低 | 已降级 — Markdown 复制链路已保留公式文本 |
| R02 | 代码块清理可能误删有效内容 | 🟢 低 | 已降级 — 需真实网页验证（TC-48/TC-49 需复测）|
| R03 | Markdown Target Profiles 导致 settings 结构膨胀 | 🟢 低 | 开放 |
| R04 | 复杂表格转 Markdown table 可能丢失信息 | 🟡 中 | 已降级 — 需真实网页验证（TC-52/TC-53 需复测）|
| R05 | Markdown Preview 需防范 XSS 安全风险 | 🟢 低 | 已降级 |
| R06 | Article Boundary Guard 误删有效正文 | 🟡 中 | Session 8-B 已修复 — assessArticleConfidence 重写 + CSDN 噪音扩展；需真实网页复测（TC-10/TC-56/TC-57/TC-58）|

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
