# DECISIONS.md — ClipMate v0.5 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

---

## v0.5 Session 0 决策

### D-v0.5-001：v0.5 从 v0.4 稳定基线复制创建独立目录

- **原因**：保持版本目录独立，不污染已发布版本。clipmate-v0.4/ 保持 1850c64 不变。
- **影响**：clipmate-v0.5/ 是独立的开发目录，从 v0.4 复制后拥有独立的 node_modules、dist、测试。
- **可反转性**：低。一旦提交 v0.5 代码，不应回退到 v0.4 目录。

### D-v0.5-002：文章图片保存优先使用 external image URL，不下载/上传图片

- **原因**：下载图片需要处理权限、存储、跨域等复杂问题。external URL 方式利用已有公开资源，实现简单、无需新增权限。
- **影响**：v0.5.0 不下载图片，不调用 Notion File Upload API。Notion image block 使用 external URL。图片链接可能因源站变化而失效。
- **可反转性**：中。后续可在 v0.5.x 或 v0.6 实现 File Upload 作为补充方案。

### D-v0.5-003：v0.5.0 不新增 manifest 权限

- **原因**：遵循项目安全原则，任何新增权限需先经过审查。现有权限（storage, activeTab, scripting, notion API host）已满足 v0.5.0 需求。
- **影响**：不能使用 downloads API 下载图片，不能使用扩展原生网络请求。
- **可反转性**：中。如后续确需权限，必须先审查。

---

## 继承自 v0.4 的决策

v0.4 决策文档见 `clipmate-v0.4/docs/DECISIONS.md`。与本轮相关的继承决策：

- D-v0.4-039：comment-context 主链路以 resolveCommentContext 为入口（v0.5 继承此实现）
- D-v0.4-040：不修改 Popup/Copy/Notion/History wrapper 策略
