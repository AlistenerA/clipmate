# AGENT_CONTEXT.md — ClipMate v0.3 项目总上下文

> 每一轮 OpenCode agent 必须先读此文件，了解项目边界和规则。
>
> **版本目录说明**：
> - `clipmate-v0.1/` 是 v0.1 冻结快照，禁止修改。
> - `clipmate-v0.2/` 是 v0.2 稳定快照，除非用户明确要求 patch，否则不修改。
> - `clipmate-v0.3/` 是当前 v0.3 规划与开发目录。

---

## 1. ClipMate 项目目标

开发一款轻量级 **Microsoft Edge / Chrome 浏览器扩展**，核心功能是将网页内容一键剪藏到 **Notion**。

定位：**比 Notion 官方 Web Clipper（3.3分/100万+用户）更好用的替代品**，专注「正文提取 + 标签备注 + Markdown 复制 + Notion 保存」四个核心场景。

---

## 2. v0.1 已实现能力（冻结基线）

| 编号 | 功能 | 说明 |
|------|------|------|
| 1 | Manifest V3 插件基础结构 | Edge MV3 兼容 |
| 2 | Popup 页面 | React UI，点击工具栏图标弹出 |
| 3 | Options 设置页 | Notion Token 等配置 |
| 4 | Background Service Worker | 消息路由、剪藏处理 |
| 5 | Content Script | 注入页面，提取和操作 DOM |
| 6 | Fullpage 正文提取 | 基于 Mozilla Readability 提取文章正文 |
| 7 | Selection 选中文字剪藏 | 用户选中文字后 Popup 触发剪藏 |
| 8 | 标签和备注 | 剪藏时可添加标签和备注 |
| 9 | 复制 Markdown | 将提取内容转为 Markdown 并复制到剪贴板 |
| 10 | 保存到 Notion 页面 | 通过 Notion API 创建页面 |
| 11 | 本地 Storage 保存设置 | chrome.storage.local 持久化 |
| 12 | 基础测试 | 321 tests, 13 files |
| 13 | 打包和上架材料 | 隐私政策、商店文案草稿 |

---

## 3. v0.2 已实现能力（从 v0.3 继承基线）

| 编号 | 功能 | 说明 |
|------|------|------|
| F01 | 本地剪藏历史记录 | chrome.storage.local 中保存剪藏历史 |
| F02 | 历史记录可搜索/复制/删除/清空 | 完整的本地历史管理 |
| F03 | 多 Notion 目标页面配置 | Options 中管理多个 Notion 目标 |
| F04 | Popup 保存时可选择目标 | 下拉选择器，默认选中默认目标 |
| F05 | 保存状态记录与重试 | saved / failed / unsaved + 重试按钮 |
| F06 | v0.1 settings 兼容迁移 | 自动检测并迁移旧 settings |
| F07 | History UI 体验增强 | 搜索高亮、域名首字母头像、同站色条、favicon 图标 |
| F08 | 版本号升级到 0.2.0 | package.json / manifest.config.ts |

---

## 4. v0.3 当前阶段

**v0.3 Session 0** — 版本目录隔离与启动前评估。

v0.3 当前处于规划阶段，**不实现任何功能**。v0.3 首轮只做评估，不写功能代码。不允许一次性实现 AI、多平台、OCR、付费。

---

## 5. 推荐技术栈（继承 v0.2）

| 层 | 选型 | 说明 |
|----|------|------|
| 语言 | TypeScript | 类型安全 |
| UI 框架 | React 18 | Popup / Options |
| 打包工具 | Vite + @crxjs/vite-plugin | 支持 HMR |
| 样式 | Tailwind CSS | 快速开发 |
| 测试框架 | Vitest | 与 Vite 生态兼容 |
| 正文提取 | @mozilla/readability | 业界标准 |
| 状态管理 | React Context + useReducer | 轻量 |

---

## 6. 项目结构

```text
clipmate-v0.3/
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

---

## 7. 每轮开发必须遵守的安全规则

1. **不要修改 `.opencode/`、`.playwright-mcp/`、`.wolf/`**，除非用户明确要求。
2. **不要读取 node_modules、dist、build、.git 中的大量内容**。
3. **不要把真实 Notion Token、API Key、账号密码写入代码或文档**。
4. **不要远程加载或执行 JavaScript 代码**。
5. **不要在 console 输出用户正文全文或 Token**。
6. **不要一次性重构全项目**。
7. **不要修改已有 README.md 和其他项目文件**。

---

## 8. 每轮结束必须更新哪些文档

| 文档 | 更新内容 |
|------|----------|
| `CURRENT_STATUS.md` | 当前完成到哪一步、下一轮应该做什么 |
| `CHANGELOG_AGENT.md` | 本轮修改文件、改动摘要 |
| `TEST_LOG.md` | 运行过的命令、结果、错误 |
| `ISSUES.md` | 未解决问题，不要隐藏失败 |
| `DECISIONS.md` | 如果本轮做了技术取舍，必须记录原因 |

---

## 9. 如何避免上下文丢失

1. 每轮开始时先读取 `AGENT_CONTEXT.md` 和 `CURRENT_STATUS.md`。
2. 不要在单轮内读取不相关的文件。
3. 每轮结束时更新所有交接文档。
4. 不要跨轮记住细节——依赖文档，不依赖记忆。

---

## 10. 如何避免模型幻觉

1. 不确定 API 用法时，查阅 Context7 或 GitHub 搜索真实代码。
2. 不确定 Notion API 返回格式时，查阅官方文档。
3. 不确定 chrome.* API 签名时，搜索真实代码示例。
4. 所有技术决策记录在 DECISIONS.md 中，后续轮次不能推翻。

---

## 11. 跨版本工作流规则入口

1. **后续 agent 必须优先读取 `WORKFLOW_RULES.md`**，了解跨版本通用开发、审查、提交规范。
2. **v0.3 启动前已读取 `V0.3_HANDOFF.md`**，方向评估记录在 `V0.3_PLAN.md`。
3. `WORKFLOW_RULES.md` 是通用规则，后续专用 Session Prompt 优先级更高。
4. **安全底线不可覆盖**：不提交 Token/API Key/用户数据，不使用 git add .，不 push。

---

## 12. v0.3 特别规则

1. v0.3 不允许一次性实现 AI、多平台、OCR、付费。
2. v0.3 Session 0 只做目录创建和评估，不写功能代码。
3. v0.3 首条主线由用户确认 V0.3_PLAN.md 后决定。
4. v0.3 不直接修改 clipmate-v0.2/ 作为 v0.3（已通过复制解决）。

---

## 13. 如何控制 Token

- **禁止**读取 `node_modules/`、`dist/`、`build/`、`.git/` 目录
- **禁止**读取大于 500 行的非相关文件
- 优先使用 Grep 和 Glob 搜索定位，再按需读取
- 每轮只读与本轮任务相关的文件
- 使用 anatomy 摘要代替全文件读取
