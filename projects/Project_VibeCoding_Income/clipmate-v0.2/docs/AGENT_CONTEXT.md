# AGENT_CONTEXT.md — ClipMate v0.2 项目总上下文

> 每一轮 OpenCode agent 必须先读此文件，了解项目边界和规则。
> 
> **版本目录说明**：`clipmate-v0.1/` 是 v0.1 冻结快照，不再修改。所有 v0.2 开发在 `clipmate-v0.2/` 中进行。

---

## 1. ClipMate 项目目标

开发一款轻量级 **Microsoft Edge / Chrome 浏览器扩展**，核心功能是将网页内容一键剪藏到 **Notion**。

定位：**比 Notion 官方 Web Clipper（3.3分/100万+用户）更好用的替代品**，专注「正文提取 + 标签备注 + Markdown 复制 + Notion 保存」四个核心场景。

目标周期：6-7 天完成 MVP，上架 Edge Add-ons。

---

## 2. v0.1 必做功能

| 编号 | 功能 | 说明 |
|------|------|------|
| 1 | Manifest V3 插件基础结构 | Edge MV3 兼容 |
| 2 | Popup 页面 | React UI，点击工具栏图标弹出 |
| 3 | Options 设置页 | Notion Token、Page ID 等配置 |
| 4 | Background Service Worker | 消息路由、剪藏处理 |
| 5 | Content Script | 注入页面，提取和操作 DOM |
| 6 | Fullpage 正文提取 | 基于 Mozilla Readability 提取文章正文 |
| 7 | Selection 选中文字剪藏 | 用户选中文字后右键或 Popup 触发剪藏 |
| 8 | 标签和备注 | 剪藏时可添加标签和备注 |
| 9 | 复制 Markdown | 将提取内容转为 Markdown 并复制到剪贴板 |
| 10 | 保存到 Notion 页面 | 通过 Notion API 创建页面 |
| 11 | 本地 Storage 保存设置 | chrome.storage.local 持久化 |
| 12 | 基础测试 | 功能手动测试 |
| 13 | 打包说明和上架材料草稿 | 隐私政策、商店文案 |

---

## 3. v0.1 禁止做的功能

| 编号 | 禁止项 | 原因 |
|------|--------|------|
| 1 | AI 摘要 | 超范围 |
| 2 | AI 标签 | 超范围 |
| 3 | 飞书 / 语雀集成 | 超范围，v0.1 仅 Notion |
| 4 | OCR | 超范围 |
| 5 | 截图回退 | 超范围 |
| 6 | License Key / 付费系统 | 超范围 |
| 7 | 订阅系统 | 超范围 |
| 8 | 团队功能 | 超范围 |
| 9 | 复杂站点规则库 | 超范围 |
| 10 | OAuth 登录 | 超范围，v0.1 仅手动 Token |

---

## 4. 推荐技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| 语言 | TypeScript | 类型安全，竞品均用 TS |
| UI 框架 | React 18 | web-clipper 已验证可用 |
| 打包工具 | Vite + @crxjs/vite-plugin | 支持 HMR，比 Webpack 体验好 |
| 样式 | Tailwind CSS | 快速开发，体积小 |
| 状态管理 | React Context + useReducer | 轻量，适合插件场景 |
| 代码规范 | ESLint + Prettier | 保持一致性 |
| 测试框架 | Vitest | 与 Vite 生态兼容 |
| 正文提取 | @mozilla/readability | 业界标准 |

---

## 2-1. v0.2 必做功能

| 编号 | 功能 | 说明 |
|------|------|------|
| F01 | 本地剪藏历史记录 | chrome.storage.local 中保存剪藏历史 |
| F02 | 历史记录可搜索/复制/删除/清空 | 完整的本地历史管理 |
| F03 | 多 Notion 目标页面配置 | Options 中管理多个 Notion 目标 |
| F04 | Popup 保存时可选择目标 | 下拉选择器，默认选中默认目标 |
| F05 | 保存状态记录与重试 | saved / failed / unsaved + 重试按钮 |
| F06 | v0.1 settings 兼容迁移 | 自动检测并迁移旧 settings |

---

## 5. 项目结构

```text
clipmate-v0.2/
├── docs/                     # 项目交接文档（本目录）
├── public/
│   └── icons/                # 图标资源 (16/32/48/128)
├── src/
│   ├── manifest.ts           # Manifest V3 配置
│   ├── background/           # Service Worker
│   │   ├── index.ts
│   │   └── handlers/         # 消息处理器
│   ├── content/              # Content Script
│   │   ├── index.ts
│   │   ├── extractors/       # 正文提取器
│   │   ├── parser/           # 页面元数据解析
│   │   └── selection/        # 选区剪藏
│   ├── popup/                # Popup (React)
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/       # UI 组件
│   │   └── hooks/            # React Hooks
│   ├── options/              # Options 设置页 (React)
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── components/       # UI 组件
│   ├── platforms/            # 平台适配器
│   │   └── notion/           # Notion API 封装
│   │       ├── client.ts     # API 调用
│   │       └── blocks.ts     # HTML → Notion Blocks
│   └── shared/               # 共享代码
│       ├── types/            # 类型定义
│       ├── storage/          # chrome.storage 封装
│       ├── messaging/        # 消息通信
│       └── utils/            # 工具函数（Markdown 转换等）
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

> 新增文件必须服务于当前 Session 任务，禁止创建 v0.1 范围外模块。

---

## 6. 每轮开发必须遵守的安全规则

1. **不要修改 `.opencode/`、`.playwright-mcp/`、`.wolf/`**，除非用户明确要求。
2. **不要读取 node_modules、dist、build、.git 中的大量内容**。
3. **不要把真实 Notion Token、API Key、账号密码写入代码或文档**。
4. **不要远程加载或执行 JavaScript 代码**。
5. **不要在 console 输出用户正文全文或 Token**。
6. **不要一次性重构全项目**。
7. **不要修改已有 README.md 和其他项目文件**。

---

## 7. 每轮结束必须更新哪些文档

| 文档 | 更新内容 |
|------|----------|
| `CURRENT_STATUS.md` | 当前完成到哪一步、下一轮应该做什么 |
| `CHANGELOG_AGENT.md` | 本轮修改文件、改动摘要 |
| `TEST_LOG.md` | 运行过的命令、结果、错误 |
| `ISSUES.md` | 未解决问题，不要隐藏失败 |
| `DECISIONS.md` | 如果本轮做了技术取舍，必须记录原因 |

---

## 8. 如何避免上下文丢失

1. 每轮开始时先读取 `AGENT_CONTEXT.md` 和 `CURRENT_STATUS.md`。
2. 不要在单轮内读取不相关的文件。
3. 每轮结束时更新所有交接文档。
4. 不要跨轮记住细节——依赖文档，不依赖记忆。

---

## 9. 如何避免模型幻觉

1. 不确定 API 用法时，查阅 Context7 或 GitHub 搜索真实代码。
2. 不确定 Notion API 返回格式时，查阅官方文档。
3. 不确定 chrome.* API 签名时，搜索真实代码示例。
4. 所有技术决策记录在 DECISIONS.md 中，后续轮次不能推翻。

---

## 10. 跨版本工作流规则入口

1. **后续 agent 必须优先读取 `WORKFLOW_RULES.md`**，了解跨版本通用开发、审查、提交规范。
2. **v0.3 启动前必须读取 `V0.3_HANDOFF.md`**，了解版本交接和规划草案。
3. `WORKFLOW_RULES.md` 是通用规则，后续专用 Session Prompt 优先级更高。
4. **安全底线不可覆盖**：不提交 Token/API Key/用户数据，不使用 git add .，不 push。

---

## 11. 如何控制 Token

- **禁止**读取 `node_modules/`、`dist/`、`build/`、`.git/` 目录
- **禁止**读取大于 500 行的非相关文件
- 优先使用 Grep 和 Glob 搜索定位，再按需读取
- 每轮只读与本轮任务相关的文件
- 使用 anatomy 摘要代替全文件读取
