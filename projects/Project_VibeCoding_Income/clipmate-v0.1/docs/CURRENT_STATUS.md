# CURRENT_STATUS.md — ClipMate v0.1 当前进度

> 每轮 agent 从这里续接。

---

## 当前阶段

**Session 4.1 已完成** — Notion 保存链路小补测与安全检查，确认进入 Session 5 前的稳定性。

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
| Content Script | ✅ 已完成 | 全文提取 + 选区提取 + fallback |
| 正文提取 (Readability) | ✅ 已完成 | @mozilla/readability 集成 |
| 选区提取 | ✅ 已完成 | 用户选中文字 + HTML |
| Fallback 提取 | ✅ 已完成 | Readability 失败时降级到 body.innerText |
| 元数据解析 | ✅ 已完成 | title/description/og:title/og:description/og:site_name |
| HTML → Markdown | ✅ 已完成 | turndown 转换 |
| 内容清洗 | ✅ 已完成 | 移除 script/style/noscript/iframe |
| Popup UI | ✅ 已完成 | 完整 UI：模式切换/内容预览/标签/备注/复制MD/打开设置 |
| Options 设置页 | ✅ 已完成 | Notion 配置/默认标签/历史开关/调试面板 |
| Background SW | ✅ 完成 | 消息路由：SAVE_TO_NOTION |
| Popup 剪藏草稿持久化 | ✅ 已完成 | 自动保存/恢复 clip draft |
| Notion 平台层 | ✅ 已完成 | client.ts（API 调用）+ blocks.ts（内容→Blocks 转换） |
| Notion 保存链路 | ✅ 已完成 | Popup → Background → Notion API 完整链路 |
| 测试 | ✅ 47 tests | 5 test files, all pass |
| 上架材料 | 🟡 草稿已有 | 隐私政策/商店文案草稿已有 |

---

## 已完成

- [x] Session 0：项目规划和续接文档创建
- [x] Session 1：Vite + React + TS + Manifest V3 插件脚手架
- [x] Session 2：shared 基础层与 Content Script 提取
- [x] Session 3：Popup 和 Options UI，本地闭环可用
- [x] Session 3.1：基础链路审查与修复
- [x] Session 4：Notion API 集成与完整保存链路
  - Notion 平台层：client.ts（API 封装）+ blocks.ts（ClipDraft→Blocks）
  - Background handler：notionHandler.ts（校验+调用+错误处理）
  - Popup save hook：useSaveToNotion.ts（loading/error/success 状态）
  - 错误码：8 个新错误码（Token/Page/授权/404/限流/网络/保存失败/空内容）
  - 权限：host_permissions 增加 https://api.notion.com/*
  - 测试：+21 tests（blocks 12 + errors 9）
  - 构建：80 modules, 760ms，Lint 0 errors

---

## 未完成（按优先级）

1. Session 5：真机测试、修复、打包和上架材料
2. 人工验收 A：整理材料交给 ChatGPT 审查
3. 人工验收 B：最终发布前审查

---

## 下一阶段建议

**Session 5** — 真机加载测试、端到端验证、最终打包和上架准备。

具体任务：
1. 真机加载测试（Edge/Chrome 加载 dist/）
2. 端到端功能验证（提取→编辑→保存到 Notion）
3. 修复发现的 Bug
4. 隐私政策正式页面（GitHub Pages）
5. 商店文案定稿
6. 图标资源制作
7. 发布检查清单逐项完成

> Session 4.1 已验证：57 tests 全部通过，Lint 0 errors，日志无敏感泄露，权限说明已就绪。可以安全进入 Session 5。
