# DECISIONS.md — ClipMate v0.1 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

---

## Session 5 决策

### D-034：打包方式使用 PowerShell `Compress-Archive`，不引入 Node 打包依赖

- **原因**：避免引入 `archiver`、`jszip`、`bestzip` 等第三方依赖，减少 `node_modules` 体积和供应链风险。`Compress-Archive` 是 Windows 内置 PowerShell cmdlet，无需额外安装。若未来需要跨平台打包，可添加平台检测和 fallback。
- **影响**：`npm run zip` 仅在 Windows PowerShell 下可用。macOS/Linux 需要手动 zip 或其他方式。
- **可反转性**：高。后续可替换为 Node.js 打包库。

---

## Session 4.2.1 决策

### D-033：cleanMarkdown 使用迭代正则合并相邻粗体

- **原因**：此前简单替换导致 `**A**B**` 孤儿，改为自定义 regex 精确匹配。HTML 预合并已从源头解决 6 星号边缘情况。
- **可反转性**：高。

### D-032：htmlToMarkdown 转换前合并相邻粗体标签

- **原因**：turndown 将相邻 `<strong>A</strong><strong>B</strong>` 转为 `**A****B**`，Markdown 后处理难以完美恢复。从 HTML 源头合并标签是更干净的方案。
- **可反转性**：高。

---

## Session 4.2 决策

### D-028~D-031

（详见 Session 4.2 CHANGELOG）

---

## Session 4.1 决策

### D-025~D-027

（详见 Session 4.1 CHANGELOG）

---

## Session 4 决策

### D-021~D-024

（详见 Session 4 CHANGELOG）

---

## Session 3.1 决策

### D-018~D-020

（详见 Session 3.1 CHANGELOG）

---

## Session 3 决策

### D-014~D-017

（详见 Session 3 CHANGELOG）

---

## Session 2 决策

### D-010~D-013

（详见 Session 2 CHANGELOG）

---

## Session 0 决策

### D-001~D-009

| 编号 | 决策 | 状态 |
|------|------|------|
| D-001 | v0.1 仅支持 Notion | 仍在遵守 |
| D-002 | 手动 Token + Page ID | 仍在遵守 |
| D-003 | fullpage + selection 两种模式 | 仍在遵守 |
| D-004 | 支持复制 Markdown | 仍在遵守 |
| D-005 | chrome.storage.local | 仍在遵守 |
| D-006 | 不做付费 | 仍在遵守 |
| D-007 | 不做 AI | 仍在遵守 |
| D-008 | 不做 OCR 和截图回退 | 仍在遵守 |
| D-009 | Vite + React + TS + Tailwind + crxjs | 仍在遵守 |
