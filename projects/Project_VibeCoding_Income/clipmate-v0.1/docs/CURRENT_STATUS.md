# CURRENT_STATUS.md — ClipMate v0.1 当前进度

> 每轮 agent 从这里续接。

---

## 当前阶段

**Session 1** — 已完成 Vite + React + TypeScript + MV3 插件脚手架创建。

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| 项目脚手架 | ✅ 已完成 | Vite + React + TS + MV3 + Tailwind |
| Content Script | ⬜ 未开始 | 正文提取 + 选中文字 |
| Popup UI | 🟡 空壳 | Popup 可显示，功能待实现 |
| Options 设置页 | 🟡 空壳 | 页面可打开，功能待实现 |
| Background SW | 🟡 空壳 | Service Worker 可启动 |
| Notion API | ⬜ 未开始 | 保存到 Notion |
| Markdown 转换 | ⬜ 未开始 | HTML → Markdown |
| 测试 | ⬜ 未开始 | Vitest 已配置，仅占位测试 |
| 上架材料 | ⬜ 未开始 | 隐私政策/商店文案草稿已有 |

---

## 已完成

- [x] Session 0：项目规划和续接文档创建
- [x] Session 1：Vite + React + TS + Manifest V3 插件脚手架
  - npm 项目初始化，335 个依赖安装成功
  - Vite + @crxjs/vite-plugin 配置完成
  - TypeScript、Tailwind CSS、ESLint、Prettier、Vitest 配置完成
  - Manifest V3 配置完成（popup/options/background/content）
  - 所有入口文件创建完成（空壳）
  - `npm run build` 成功，dist/ 目录生成

---

## 未完成（按优先级）

1. Session 2：实现 shared 基础层与 Content Script 提取
2. Session 3：实现 Popup 和 Options，本地闭环可用
3. 人工验收 A：整理材料交给 ChatGPT 审查
4. Session 4：实现 Notion 保存与完整链路
5. Session 5：测试、修复、打包和上架材料
6. 人工验收 B：最终发布前审查

---

## 下一阶段建议

**Session 2** — 实现 shared 基础层与 Content Script 提取。

具体任务：
1. 实现 chrome.storage 封装（shared/storage）
2. 实现消息通信封装（shared/messaging）
3. 实现 Chrome Extension 类型定义（shared/types）
4. 实现 Content Script：HTML → Markdown（引入 turndown）
5. 实现 Content Script：Mozilla Readability 正文提取
6. 实现 Content Script：用户选中文字提取
7. 实现 Content Script：页面元数据解析（标题、URL、favicon）
8. 实现 Popup → Content Script 消息通信验证
9. 编写单元测试
