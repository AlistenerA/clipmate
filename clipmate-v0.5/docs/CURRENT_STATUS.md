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

**v0.5 Session 6 已完成** — Release Readiness。

发布前准备工作完成：
- 版本号统一：package.json / manifest.config.ts / package-lock.json → 0.5.0
- zip 脚本更新为 clipmate-v0.5.zip
- 发布文档更新：README / STORE_LISTING / PRIVACY_POLICY / PERMISSION_JUSTIFICATION / TEST_PLAN / RELEASE_CHECKLIST
- 安全扫描通过（无 Token/API Key 泄露、无危险 API、无远程代码风险）
- lint 0 / test 1922 pass / build 成功 / zip 生成 clipmate-v0.5.zip (146KB)
- 已知限制记录完整（external image URL、Notion File Upload 未接入、image block 居中不支持等）

*下一步：等待用户 ChatGPT 审查，审查通过后由用户决定 commit 和 push。*

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
