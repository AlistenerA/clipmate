# CURRENT_STATUS.md — ClipMate v0.2 当前进度

> 每轮 agent 从这里续接。
> 
> **版本目录**：`clipmate-v0.1/` = v0.1 冻结快照 | `clipmate-v0.2/` = 当前 v0.2 开发目录

---

## 当前阶段

**v0.2 Session 6 已完成** — 文档更新、QA 材料、版本号升级到 0.2.0、打包。

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
| Content Script | ✅ 已完成 | 全文提取 + 选区提取 + fallback + Markdown 清理 + favicon/主题色提取 |
| 正文提取 (Readability) | ✅ 已完成 | @mozilla/readability 集成 |
| 选区提取 | ✅ 已完成 | 用户选中文字 + HTML |
| Fallback 提取 | ✅ 已完成 | Readability 失败时降级到 body.innerText |
| 元数据解析 | ✅ 已完成 | title/description/og:title/og:description + favicon/themeColor |
| HTML → Markdown | ✅ 已完成 | turndown + cleanMarkdown + mergeAdjacentBold |
| 中文字数统计 | ✅ 已完成 | CJK 字符逐个计数 + 英文按空格分词 |
| 复制 Markdown 完整格式 | ✅ 已完成 | 标题/URL/标签/备注/分割线/正文 |
| Popup UI | ✅ 已完成 | 完整 UI + TargetSelector + 同站自动刷新 |
| Options 设置页 | ✅ 已完成 | Notion 配置/多目标管理/历史管理/调试面板 |
| Background SW | ✅ 已完成 | 消息路由 + 历史写入 + retry update |
| Popup 剪藏草稿持久化 | ✅ 已完成 | 自动保存/恢复 clip draft |
| Notion 平台层 | ✅ 已完成 | client.ts + blocks.ts |
| Notion 保存链路 | ✅ 已完成 | Popup → Background → Notion API + 目标选择 + 历史写入 |
| 日志安全 | ✅ 已审查 | 无 Token/正文/备注/Markdown 泄露 |
| 测试 | ✅ 321 tests | 13 test files, all pass |
| v0.2 Session 1 数据结构升级 | ✅ 已完成 | types 扩展 + 迁移逻辑 + storage CRUD + 34 tests |
| v0.2 Session 2 版本目录隔离 | ✅ 已完成 | clipmate-v0.2/ 独立目录，clipmate-v0.1/ 冻结快照 |
| v0.2 Session 3 Options 多目标管理 | ✅ 已完成 | TargetList / TargetEditor UI + targetManager 纯函数 + 32 tests |
| v0.2 Session 4 Popup 目标选择与历史写入 | ✅ 已完成 | TargetSelector + 保存链路改造 + 历史写入 + 32 tests |
| v0.2 Session 4.1 小修复 | ✅ 已完成 | alert 对齐 ERROR_MESSAGES + Notion URL 提取 Page ID + 移除 Page ID 预览 + 13 tests |
| v0.2 Session 5 History UI | ✅ 已完成 | 搜索/复制Markdown/删除/清空/重试 + Options tab 切换 + retry 更新原历史 + 43 tests |
| v0.2 Session 5.1 History UI 体验增强 | ✅ 已完成 | 搜索高亮/匹配标签/网站图标+摘要预览/同站统一色条/Popup 同站自动刷新 + 46 tests |
| v0.2 Session 5.2 图片摘要与真实图标 | ✅ 已完成 | 跳过 markdown/HTML 图片语法、content script 提取 favicon、description 优先摘要 + 41 tests |
| v0.2 Session 6 文档、版本号、打包 | ✅ 已完成 | README/TEST_PLAN/QA模板/隐私政策/权限说明/商店文案/发布清单更新，版本号 0.2.0，clipmate-v0.2.zip |

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
- [x] v0.2 Session 4：Popup 目标选择与历史写入
- [x] v0.2 Session 4.1：小修复
- [x] v0.2 Session 5：History UI（搜索/复制/删除/清空/重试）
- [x] v0.2 Session 5.1：History UI 体验增强 + Popup 同站自动刷新
- [x] v0.2 Session 5.2：图片摘要跳过 + 真实网站图标优先显示
- [x] v0.2 Session 6：文档更新、版本号升级到 0.2.0、打包

---

## 未完成（按优先级）

1. v0.2 Session 7：鲁棒性检查与修复
2. 人工验收 A：按 TEST_PLAN.md 和 MANUAL_QA_RESULT_TEMPLATE.md 逐项测试（40 项）
3. 人工验收 B：最终发布前审查（由用户或 ChatGPT 审查）
4. 创建 GitHub Pages 托管隐私政策页面（获取公开 URL）
5. 提交 Edge Add-ons Partner Center

---

## 下一阶段建议

**v0.2 Session 7** — 鲁棒性检查与修复。全量回归测试、lint、build、zip、边界场景修复。确认所有 321 tests 通过后，对代码做最后的鲁棒性检查和修复。

> v0.2 Session 6 交付：版本号升级到 0.2.0（package.json + manifest.config.ts），8 份文档更新（README/TEST_PLAN/MANUAL_QA_RESULT_TEMPLATE/PRIVACY_POLICY_DRAFT/PERMISSION_JUSTIFICATION/STORE_LISTING_DRAFT/RELEASE_CHECKLIST/交接文档），zip 打包为 clipmate-v0.2.zip。未修改 src/ 和 tests/ 业务代码。`clipmate-v0.1/` 未修改。
