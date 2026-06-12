# CURRENT_STATUS.md — ClipMate v0.1 当前进度

> 每轮 agent 从这里续接。

---

## 当前阶段

**Session 5.1 已完成** — 图标资源应用与重新打包。I-016 已解决。

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| 项目脚手架 | ✅ 已完成 | Vite + React + TS + MV3 + Tailwind |
| shared 类型 | ✅ 已完成 | clip/settings/message 类型 |
| shared 常量 | ✅ 已完成 | messageTypes, defaults, ERROR_MESSAGES |
| shared storage | ✅ 已完成 | chrome.storage.local Promise 封装 |
| shared messaging | ✅ 已完成 | sendToActiveTab / sendToRuntime |
| shared utils | ✅ 已完成 | logger, errors, formatMarkdown |
| Content Script | ✅ 已完成 | 全文提取 + 选区提取 + fallback + Markdown 清理 |
| 正文提取 (Readability) | ✅ 已完成 | @mozilla/readability 集成 |
| 选区提取 | ✅ 已完成 | 用户选中文字 + HTML |
| Fallback 提取 | ✅ 已完成 | Readability 失败时降级到 body.innerText |
| 元数据解析 | ✅ 已完成 | title/description/og:title/og:description |
| HTML → Markdown | ✅ 已完成 | turndown + cleanMarkdown + mergeAdjacentBold |
| 中文字数统计 | ✅ 已完成 | CJK 字符逐个计数 + 英文按空格分词 |
| 复制 Markdown 完整格式 | ✅ 已完成 | 标题/URL/标签/备注/分割线/正文 |
| Popup UI | ✅ 已完成 | 完整 UI |
| Options 设置页 | ✅ 已完成 | Notion 配置/默认标签/历史开关/调试面板 |
| Background SW | ✅ 已完成 | 消息路由：SAVE_TO_NOTION |
| Popup 剪藏草稿持久化 | ✅ 已完成 | 自动保存/恢复 clip draft |
| Notion 平台层 | ✅ 已完成 | client.ts + blocks.ts |
| Notion 保存链路 | ✅ 已完成 | Popup → Background → Notion API |
| 日志安全 | ✅ 已审查 | 无 Token/正文/备注泄露 |
| 测试 | ✅ 80 tests | 6 test files, all pass |
| 上架材料 | ✅ 定稿 | TEST_PLAN / QA 模板 / 隐私政策 / 商店文案 / 权限说明 / 发布清单 |
| 打包 | ✅ 已就绪 | npm run zip（PowerShell） + 手动打包说明 |
| README | ✅ 已完善 | 开发命令 / 加载步骤 / Notion 配置 / 隐私 / 已知限制 |
| 图标资源 | ✅ 已完成 | icon-16/32/48/128/512 PNG + SVG source |

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
- [x] Session 4.2.1：复测问题二次修复
- [x] Session 5：最终测试计划、发布材料定稿、打包脚本、README 完善
- [x] Session 5.1：图标资源应用与重新打包（本轮）

---

## 未完成（按优先级）

1. 人工验收 A：按 TEST_PLAN.md 和 MANUAL_QA_RESULT_TEMPLATE.md 逐项测试
2. 人工验收 B：最终发布前审查（由用户或 ChatGPT 审查）
3. 创建 GitHub Pages 托管隐私政策页面（获取公开 URL）
4. 提交 Edge Add-ons Partner Center

---

## 下一阶段建议

**人工验收 A** — 用户按 TEST_PLAN.md 逐项手动测试，填写 MANUAL_QA_RESULT_TEMPLATE.md，确认所有 16 项测试通过后进入人工验收 B。

> Session 5.1 已验证：80 tests 全部通过，Lint 0 errors，Build 成功，Zip 打包成功（111KB），图标已部署到 dist 和 zip。
