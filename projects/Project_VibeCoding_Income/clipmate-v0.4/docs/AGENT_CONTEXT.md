# AGENT_CONTEXT.md — ClipMate v0.4 每轮 Agent 可读取的最低上下文

> 每轮 agent 开始时优先读取此文件，获取版本概览和当前进度。

---

## 版本概览

| 项目 | 值 |
|------|-----|
| 当前版本 | v0.4 |
| 版本定位 | Site Profiles and Scenario Modes（站点适配与场景模式版）|
| 来源版本 | clipmate-v0.3 |
| v0.3 最终 commit | d5d771d fix(clipmate): finalize v0.3 manual qa fixes |
|当前分支 | feature/clipmate-v0.4-site-profiles |
| 开发目录 | clipmate-v0.4/ |
| package.json version | 0.3.0（继承 v0.3，release 前升 0.4.0）|
| manifest.config.ts version | 0.3.0（继承 v0.3，release 前升 0.4.0）|

## 目录结构

```
clipmate-v0.4/
├── docs/           ← 本文件所在目录
├── src/            ← 业务代码
├── tests/          ← 测试代码
├── public/         ← 静态资源
├── package.json
├── manifest.config.ts
└── ...
```

## 多版本共存

| 版本目录 | 状态 |
|----------|------|
| clipmate-v0.1/ | 冻结快照，禁止修改 |
| clipmate-v0.2/ | 稳定公开历史版本，禁止修改 |
| clipmate-v0.3/ | 当前公开快照，禁止功能修改 |
| clipmate-v0.4/ | v0.4 唯一开发目录 |

## v0.4 核心目标

让插件更懂"当前页面是什么类型"，并根据页面类型选择更安全的剪藏策略。

### 7 大 Session 方向

1. Page Type Detector
2. Site Profile Engine
3. Navigation Summary Mode
4. Comment / Selection Clip Mode
5. Tag Search UX
6. Site Icon / Theme Cache
7. Link Card Preview

### 严格非目标

- 不做登录系统
- 不做后端服务器
- 不做 AI API
- 不做 OCR
- 不做云同步
- 不做付费
- 不下载媒体
- 不新增 manifest 权限
- 不新增依赖
- 不远程加载或执行 JavaScript

## 跨版本工作流

详细规则见 `docs/WORKFLOW_RULES.md`。

## Playwright QA 辅助

当前项目允许在 QA 阶段使用 Playwright 作为观察和复现辅助工具，但默认不作为功能开发入口。涉及页面访问、截图、DOM 观察时，必须遵守 `docs/PLAYWRIGHT_QA_WORKFLOW.md`。Playwright 不替代用户最终人工 QA。

## 当前阶段

v0.4 Session 0 — 工作区创建与规划（已完成）。
Session 8.2 — Playwright QA Workflow Integration（本轮）。

下一步：ChatGPT 审查后，用户重新加载 dist/ 并结合 Playwright 辅助和真实浏览器操作复测 B 站视频页。
