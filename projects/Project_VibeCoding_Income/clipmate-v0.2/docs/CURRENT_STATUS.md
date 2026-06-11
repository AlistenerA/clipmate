# CURRENT_STATUS.md — ClipMate v0.2 当前进度

> 每轮 agent 从这里续接。
> 
> **版本目录**：`clipmate-v0.1/` = v0.1 冻结快照 | `clipmate-v0.2/` = 当前 v0.2 开发目录

---

## 当前阶段

**v0.2 Session 4.1 已完成** — Popup 目标选择与历史写入的小修复：alert 文案对齐 ERROR_MESSAGES、Options 支持完整 Notion URL 自动提取 Page ID、Popup 目标选择框不再显示 Page ID 预览。

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| 项目脚手架 | ✅ 已完成 | Vite + React + TS + MV3 + Tailwind |
| shared 类型 | ✅ 已完成 | clip/settings/message 类型 + v0.2 新增 NotionTarget/ClipHistoryItem/ClipMateSettingsV2/SaveStatus |
| shared 常量 | ✅ 已完成 | messageTypes, defaults v1+v2, ERROR_MESSAGES, STORAGE_KEYS, history limits |
| shared storage | ✅ 已完成 | chrome.storage.local Promise 封装 + v0.2 新增迁移/目标CRUD/历史CRUD |
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
| Popup UI | ✅ 已完成 | 完整 UI + v0.2 新增 TargetSelector + S4.1 移除 Page ID 预览 |
| Options 设置页 | ✅ 已完成 | Notion 配置/默认标签/历史开关/调试面板 + S4.1 URL 提取 Page ID |
| Background SW | ✅ 已完成 | 消息路由：SAVE_TO_NOTION + v0.2 历史写入 |
| Popup 剪藏草稿持久化 | ✅ 已完成 | 自动保存/恢复 clip draft |
| Notion 平台层 | ✅ 已完成 | client.ts + blocks.ts |
| Notion 保存链路 | ✅ 已完成 | Popup → Background → Notion API + 目标选择 + 历史写入 |
| 日志安全 | ✅ 已审查 | 无 Token/正文/备注泄露 |
| 测试 | ✅ 191 tests | 10 test files, all pass |
| v0.2 Session 1 数据结构升级 | ✅ 已完成 | types 扩展 + 迁移逻辑 + storage CRUD + 34 tests |
| v0.2 Session 2 版本目录隔离 | ✅ 已完成 | clipmate-v0.2/ 独立目录，clipmate-v0.1/ 冻结快照 |
| v0.2 Session 3 Options 多目标管理 | ✅ 已完成 | TargetList / TargetEditor UI + targetManager 纯函数 + 32 tests |
| v0.2 Session 4 Popup 目标选择与历史写入 | ✅ 已完成 | TargetSelector + 保存链路改造 + 历史写入 + 32 tests |
| v0.2 Session 4.1 小修复 | ✅ 已完成 | alert 对齐 ERROR_MESSAGES + Notion URL 提取 Page ID + 移除 Page ID 预览 + 13 tests |

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
- [x] v0.2 Session 0：范围确认与 V0.2_PLAN 创建
- [x] v0.2 Session 1：数据结构升级与兼容迁移
- [x] v0.2 Session 2：版本目录隔离与迁移
- [x] v0.2 Session 3：Options 多 Notion 目标管理
- [x] v0.2 Session 4：Popup 目标选择与历史写入（本轮）

---

## 未完成（按优先级）

1. v0.2 Session 5：History UI（搜索/复制/删除/清空/重试）
2. v0.2 Session 6：文档、QA、版本号、打包
3. v0.2 Session 7：鲁棒性检查与修复
4. 人工验收 A：按 TEST_PLAN.md 和 MANUAL_QA_RESULT_TEMPLATE.md 逐项测试
5. 人工验收 B：最终发布前审查（由用户或 ChatGPT 审查）
6. 创建 GitHub Pages 托管隐私政策页面（获取公开 URL）
7. 提交 Edge Add-ons Partner Center

---

## 下一阶段建议

**v0.2 Session 5** — History UI。按 `docs/V0.2_PLAN.md` 中 Session 5 范围执行：在 Options 中新增「剪藏历史」tab，实现历史列表展示、搜索、复制 Markdown、单条删除、清空全部、失败重试。

> v0.2 Session 4 交付：Popup 目标选择与历史写入完成。TargetSelector 组件 + 保存链路改造 + Background 历史写入。178 tests 全部通过（新增 32 tests），Lint 0 errors，Build 成功（87 modules）。`clipmate-v0.1/` 未修改。
