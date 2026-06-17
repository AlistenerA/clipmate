# CURRENT_STATUS.md — ClipMate v0.5 当前进度

> 每轮 agent 从这里续接。
>
> **版本目录**：
> - `clipmate-v0.1/` = v0.1 冻结快照，禁止修改
> - `clipmate-v0.2/` = v0.2 稳定快照，禁止修改
> - `clipmate-v0.3/` = v0.3 稳定快照，禁止修改
> - `clipmate-v0.4/` = v0.4 稳定基线，禁止修改
> - `clipmate-v0.5/` = 当前 v0.5 开发目录

---

## 当前阶段

**v0.5.1 已完成** — v0.5.x Architecture Foundation。

架构底座完成：
- 新增 `src/features/capture`：统一 ClipDraft 创建、正文读取、可保存判断
- 新增 `src/features/session`：引入 ClipSession、保存生命周期纯函数和 session → Notion payload 转换
- 新增 `src/features/notion`：集中生成 NotionSavePlan，把校验和 blocks 构建从 background IO 中拆出
- Popup 保存和草稿缓存入口已改用新 capture/session 边界
- Background Notion handler 已改用 save plan，行为保持兼容
- 版本号统一：package.json / manifest.config.ts / package-lock.json → 0.5.1
- lint 0 / test 1930 pass / build 成功，dist/manifest.json version = 0.5.1

*下一步：沿 v0.5.x 继续逐个功能接入新底座；每完成一个功能点递增 patch 版本 0.0.1。*

---

## v0.5 Session 进度

| Session | 状态 | 描述 |
|:---:|:---:|------|
| Session 0 | ✅ 已完成 | 版本交接、目录创建、规划 |
| Session 1 | ✅ 已完成 | Article Image Extraction Core |
| Session 2 | ✅ 已完成 | Markdown Image Preservation |
| Session 3 | ✅ 已完成 | Notion External Image Blocks |
| Session 4 | ✅ 已完成 | Popup/History Lightweight Image Metadata |
| Session 5 | ✅ 已完成 | Manual QA and Site Cases |
| Session 5.1 | ✅ 已完成 | Sina Image Pollution Guard & Notion Image URL Compatibility |
| Session 5.2 | ✅ 已完成 | Image Caption Placement & Markdown Image Layout Polish |
| Session 6 | ✅ 已完成 | Release Readiness |
| v0.5.1 | ✅ 已完成 | Architecture Foundation |

---

## 已完成

- [x] v0.5 Session 0：版本交接、目录创建、文档更新
- [x] v0.5 Session 1：Article Image Extraction Core
- [x] v0.5 Session 2：Markdown Image Preservation
- [x] v0.5 Session 3：Notion External Image Blocks
- [x] v0.5 Session 4：Popup/History Lightweight Image Metadata
- [x] v0.5 Session 5：Manual QA and Site Cases
- [x] v0.5 Session 5.1：Sina Image Pollution Guard & Notion Image URL Compatibility
- [x] v0.5 Session 5.2：Image Caption Placement & Markdown Image Layout Polish
- [x] v0.5 Session 6：Release Readiness
- [x] v0.5.1：Architecture Foundation
