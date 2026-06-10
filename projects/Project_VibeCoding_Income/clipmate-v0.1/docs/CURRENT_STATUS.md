# CURRENT_STATUS.md — ClipMate v0.1 当前进度

> 每轮 agent 从这里续接。

---

## 当前阶段

**Session 2 已完成** — shared 基础层与 Content Script 提取能力已实现。

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| 项目脚手架 | ✅ 已完成 | Vite + React + TS + MV3 + Tailwind |
| shared 类型 | ✅ 已完成 | clip/settings/message 类型 |
| shared 常量 | ✅ 已完成 | messageTypes, defaults |
| shared storage | ✅ 已完成 | chrome.storage.local Promise 封装 |
| shared messaging | ✅ 已完成 | sendToActiveTab / sendToRuntime |
| shared utils | ✅ 已完成 | logger, errors, formatMarkdown |
| Content Script | ✅ 已完成 | 全文提取 + 选区提取 + fallback |
| 正文提取 (Readability) | ✅ 已完成 | @mozilla/readability 集成 |
| 选区提取 | ✅ 已完成 | 用户选中文字 + HTML |
| Fallback 提取 | ✅ 已完成 | Readability 失败时降级到 body.innerText |
| 元数据解析 | ✅ 已完成 | title/description/og:title/og:description/og:site_name |
| HTML → Markdown | ✅ 已完成 | turndown 转换（h1-h6/p/a/img/ul/ol/li/code） |
| 内容清洗 | ✅ 已完成 | 移除 script/style/noscript/iframe |
| Popup UI | 🟡 空壳 | Popup 可显示，功能待实现 |
| Options 设置页 | 🟡 空壳 | 页面可打开，功能待实现 |
| Background SW | 🟡 空壳 | 基础消息监听（STUB） |
| Notion API | ⬜ 未开始 | 保存到 Notion |
| 测试 | 🟡 基础 | 14 个测试（shared utils + 占位） |
| 上架材料 | ⬜ 未开始 | 隐私政策/商店文案草稿已有 |

---

## 已完成

- [x] Session 0：项目规划和续接文档创建
- [x] Session 1：Vite + React + TS + Manifest V3 插件脚手架
  - npm 项目初始化，335 个依赖安装成功
  - `npm run build` 成功
- [x] Session 2：shared 基础层与 Content Script 提取
  - 类型定义：ClipMode, ExtractedContent, ClipDraft, ClipMateSettings
  - 消息协议：6 种消息类型
  - Storage：chrome.storage.local Promise 封装（get/save settings + last clip）
  - Content Script：fullpage（Readability + fallback）+ selection
  - HTML → Markdown：turndown，支持标题/段落/链接/图片/列表/代码/删除线
  - 元数据：Open Graph + 标准 meta 标签
  - 测试：14 个测试全部通过
  - 构建：`npm run build` 成功

---

## 未完成（按优先级）

1. Session 3：实现 Popup 和 Options，本地闭环可用
2. 人工验收 A：整理材料交给 ChatGPT 审查
3. Session 4：实现 Notion 保存与完整链路
4. Session 5：测试、修复、打包和上架材料
5. 人工验收 B：最终发布前审查

---

## 下一阶段建议

**Session 3** — 实现 Popup 和 Options UI，本地闭环可用。

具体任务：
1. 实现 Popup 页面 UI：剪藏模式切换、标签输入、备注输入、复制 Markdown 按钮
2. 实现 Options 页面 UI：Notion Token、Notion Page ID 配置表单
3. Popup → Content Script 消息通信：触发提取并接收结果
4. Popup 中展示提取内容摘要（标题、字数）
5. 复制 Markdown 到剪贴板
6. 标签和备注本地保存到 chrome.storage
