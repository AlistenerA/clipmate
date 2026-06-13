# CURRENT_STATUS.md — ClipMate v0.4 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，除非用户明确要求 patch，否则不修改
> - `clipmate-v0.3/` = v0.3 公开快照，禁止功能修改
> - `clipmate-v0.4/` = 当前 v0.4 开发目录

---

## 当前阶段

**v0.4 Session 0 已完成** — 工作区创建与规划审查

- 从稳定 `clipmate-v0.3/` 创建独立 `clipmate-v0.4/` 工作目录
- 创建 `feature/clipmate-v0.4-site-profiles` 开发分支
- 建立 v0.4 规划文档
- 版本号策略：当前 package.json / manifest.config.ts 仍为 0.3.0，v0.4 release 前统一升级到 0.4.0

---

## 进度总览

| 模块 | 状态 | 备注 |
|------|:---:|------|
| v0.4 工作区创建 | ✅ 已完成 | Session 0 |
| v0.4 分支创建 | ✅ 已完成 | feature/clipmate-v0.4-site-profiles |
| v0.4 规划文档 | ✅ 已完成 | V0.4_PLAN / AGENT_CONTEXT / CURRENT_STATUS 等 |
| Session 1 Page Type Detector | ⏳ 待启动 | 等待 ChatGPT 审查后进入 |
| Session 2 Site Profile Engine | ⏳ 待启动 | |
| Session 3 Navigation Summary Mode | ⏳ 待启动 | |
| Session 4 Comment / Selection Clip Mode | ⏳ 待启动 | |
| Session 5 Tag Search UX | ⏳ 待启动 | |
| Session 6 Site Icon / Theme Cache | ⏳ 待启动 | |
| Session 7 Link Card Preview | ⏳ 待启动 | |
| Session 8 Docs, QA, Version, Package | ⏳ 待启动 | |
| Session 9 Robustness Check and Release | ⏳ 待启动 | |

---

## 已完成

- [x] v0.4 Session 0：工作区创建与规划审查

---

## 未完成（按优先级）

1. Session 1：Page Type Detector — 页面类型识别增强
2. Session 2：Site Profile Engine — 站点规则引擎
3. Session 3：Navigation Summary Mode — 导航页摘要模式
4. Session 4：Comment / Selection Clip Mode — 评论选区模式
5. Session 5：Tag Search UX — 标签搜索
6. Session 6：Site Icon / Theme Cache — 站点图标/主题缓存
7. Session 7：Link Card Preview — 链接卡片预览
8. Session 8：Docs, QA, Version, Package
9. Session 9：Robustness Check and Release Candidate Review

---

## v0.3 已知问题（继承到 v0.4）

1. CSDN/LaTeX 站点渲染残留 → v0.4 Session 2 可能涉及
2. 搜索页/导航页分类体验 → v0.4 Session 1/3
3. 本地 .md 保存按钮 → v0.4+
4. 最近复制历史 → v0.4+
5. Typora/Obsidian 目录记忆 → v0.4+

---

## 下一阶段建议

**ChatGPT 审查本 Session 0 输出 → 进入 Session 1 Page Type Detector**
