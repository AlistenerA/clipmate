# CURRENT_STATUS.md — ClipMate v0.1 当前进度

> 每轮 agent 从这里续接。

---

## 当前阶段

**Session 4.2.1 已完成** — 复测问题二次修复：长备注 callout 全部保持 📝、相邻粗体合并。

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| 项目脚手架 | ✅ 已完成 | Vite + React + TS + MV3 + Tailwind |
| shared 类型 | ✅ 已完成 | clip/settings/message 类型 |
| shared 常量 | ✅ 已完成 | messageTypes, defaults, ERROR_MESSAGES |
| shared storage | ✅ 已完成 | chrome.storage.local Promise 封装 |
| shared messaging | ✅ 已完成 | sendToActiveTab / sendToRuntime |
| shared utils | ✅ 已完成 | logger, errors, formatMarkdown (含 countWords/CJK、cleanMarkdown、formatCopyMarkdown) |
| Content Script | ✅ 已完成 | 全文提取 + 选区提取 + fallback + Markdown 清理 |
| 正文提取 (Readability) | ✅ 已完成 | @mozilla/readability 集成 |
| 选区提取 | ✅ 已完成 | 用户选中文字 + HTML |
| Fallback 提取 | ✅ 已完成 | Readability 失败时降级到 body.innerText |
| 元数据解析 | ✅ 已完成 | title/description/og:title/og:description/og:site_name |
| HTML → Markdown | ✅ 已完成 | turndown + cleanMarkdown 清理 **** 异常 |
| 中文字数统计 | ✅ 已完成 | CJK 字符逐个计数 + 英文按空格分词 |
| 复制 Markdown 完整格式 | ✅ 已完成 | 标题/URL/标签/备注/分割线/正文 |
| Popup UI | ✅ 已完成 | 完整 UI：模式切换/内容预览/标签/备注/复制MD/打开设置 |
| Options 设置页 | ✅ 已完成 | Notion 配置/默认标签/历史开关/调试面板 |
| Background SW | ✅ 完成 | 消息路由：SAVE_TO_NOTION |
| Popup 剪藏草稿持久化 | ✅ 已完成 | 自动保存/恢复 clip draft |
| Notion 平台层 | ✅ 已完成 | client.ts + blocks.ts（含 callout + paragraph 分片） |
| Notion 保存链路 | ✅ 已完成 | Popup → Background → Notion API 完整链路 |
| 日志安全 | ✅ 已审查 | logger.error 移除 err 参数，不输出 Token/正文/备注 |
| 测试 | ✅ 76 tests | 6 test files, all pass |
| 上架材料 | 🟡 草稿已有 | 隐私政策/商店文案草稿已有 |

---

## 已完成

- [x] Session 0：项目规划和续接文档创建
- [x] Session 1：Vite + React + TS + Manifest V3 插件脚手架
- [x] Session 2：shared 基础层与 Content Script 提取
- [x] Session 3：Popup 和 Options UI，本地闭环可用
- [x] Session 3.1：基础链路审查与修复
- [x] Session 4：Notion API 集成与完整保存链路
- [x] Session 4.1：Notion 保存链路小补测与安全检查
- [x] Session 4.2：真机测试问题修复（5 项）

- [x] Session 4.2.1：复测问题二次修复（本轮）

---

## 未完成（按优先级）

1. Session 5：真机二次验证、最终打包和上架材料
2. 人工验收 A：整理材料交给 ChatGPT 审查
3. 人工验收 B：最终发布前审查

---

## 下一阶段建议

**Session 5** — 真机二次验证修复结果、最终打包和上架准备。

> Session 4.2 已验证：76 tests 全部通过，Lint 0 errors，Build 成功。可以安全进入 Session 5。
