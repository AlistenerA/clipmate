# DECISIONS.md — ClipMate v0.1 / v0.2 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

---

## v0.2 Session 0 决策

### D-046：History UI 放在 Options 页面内，不新增独立 history page

- **原因**：避免 manifest 变化（不新增 options_ui / action 入口）。Options 页面已有 tab 结构基础，新增"剪藏历史" tab 即可承载全部 UI。
- **影响**：History 在 Options 页面内访问，非 Popup 内。用户需打开 Options 查看历史。
- **可反转性**：高。后续可改为独立 page 或在 Popup 中嵌入。

### D-045：package.json 和 manifest 版本号在 Session 5 才改为 0.2.0

- **原因**：避免开发过程中半成品混淆。Session 0-4 代码仍在 0.1.0 标记下开发。
- **影响**：npm run build 产出的 manifest 版本仍为 0.1.0，直到 S5。
- **可反转性**：高。

### D-044：重试保存时原目标不存在，要求用户重新选择目标

- **原因**：避免保存到错误目标。历史记录中 targetId 对应的目标可能已被用户删除。
- **影响**：重试流程多一步用户交互。
- **可反转性**：高。后续可改为自动选择默认目标。

### D-043：历史记录保留 targetName 快照

- **原因**：目标被删除后仍可查看历史记录的来源目标名称，提升数据可读性。
- **影响**：ClipHistoryItem 增加 targetName 字段，storage 占用略增。
- **可反转性**：高。名称快照是冗余字段，可移除。

### D-042：删除 Notion 目标时，不删除历史记录

- **原因**：历史记录是用户剪藏数据，不应因目标管理操作而丢失。
- **影响**：删除目标后，历史记录中 targetId 悬空，UI 显示"目标已删除"。
- **可反转性**：低。一旦实现删除级联，恢复困难。本决策为正向设计。

### D-041：单条历史 markdown 建议限制约 50000 字符

- **原因**：防止单条记录过大（超长文章）占用过多 storage。超出截断并标记 markdownTruncated = true。
- **影响**：超长文章可能丢失尾部内容，但用户可从原始网页重新剪藏。
- **可反转性**：高。阈值可调整。

### D-040：历史记录保存 markdown

- **原因**：用于重新复制 Markdown 到剪贴板和重试保存。不保存 markdown 则无法实现这两个核心功能。
- **影响**：storage 占用增加，需在隐私政策中声明。
- **可反转性**：低。如果移除 markdown 存储，需重新设计复制和重试机制。

### D-039：historyLimit 默认 100

- **原因**：平衡用户需求（足够的历史记录）与 storage 压力（chrome.storage.local 约 5MB+）。用户可在 Options 中调整（最小 10，最大 500）。
- **影响**：默认保留 100 条，超出自动清理最早记录。
- **可反转性**：高。默认值和范围可调整。

### D-038：v0.2 继续只调用 Notion API，不新增第三方 API

- **原因**：保持最小外部依赖。历史记录全存本地，无新增网络请求。
- **影响**：无。
- **可反转性**：高。

### D-037：v0.2 继续使用 chrome.storage.local

- **原因**：历史记录可能超过 sync 100KB 限制；clipmate 无云同步需求。
- **影响**：数据仅在本地浏览器可用，换设备后历史不跟随。
- **可反转性**：中。可后续添加 sync 用于轻量配置同步。

### D-036：v0.2 不新增 manifest 权限

- **原因**：所有功能基于现有权限（activeTab / storage / host_permissions api.notion.com / content_scripts all_urls）完成。新增权限增加 Edge Add-ons 审核风险。
- **影响**：v0.2 manifest 权限与 v0.1 完全一致。
- **可反转性**：中。若未来确实需要新权限，需提交审核。

---

## Session 5.1 决策

### D-035：zip 脚本改用 .NET ZipFile API，不再依赖 PowerShell Archive 模块

- **原因**：`Import-Module Microsoft.PowerShell.Archive` 在执行策略 Restricted 的系统上不可用。改用 `[System.IO.Compression.ZipFile]::CreateFromDirectory()` 是 .NET Framework 内置 API，无需加载外部模块，不受执行策略限制。
- **影响**：`npm run zip` 在所有 Windows 系统上可用（.NET Framework 3.0+ 内置）。macOS/Linux 不可用。
- **可反转性**：高。可后续添加跨平台方案。

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
