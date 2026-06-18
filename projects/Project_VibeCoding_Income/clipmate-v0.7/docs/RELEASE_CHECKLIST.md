# RELEASE_CHECKLIST.md - ClipMate v0.7 发布检查清单

更新日期：2026-06-18

## 自动化门禁

- [x] `npm run lint`：0 errors。
- [x] `npm run test`：53 files / 1966 tests。
- [x] `npm run build`：成功，132 modules transformed。
- [x] `npm run zip`：生成 `clipmate-v0.7.zip`。
- [x] `dist/manifest.json` version = `0.7.0`。
- [x] zip 仅包含 dist 构建产物（23 entries）。

## 版本一致性

- [x] `package.json` version = `0.7.0`。
- [x] `package-lock.json` version = `0.7.0`。
- [x] `manifest.config.ts` version = `0.7.0`。
- [x] 当前分支为 `codex/clipmate-v0.7-tutorial-mode`。
- [x] v0.6 目录冻结，本版本只修改 `clipmate-v0.7/` 与项目级交接文档。

## 权限与隐私

- [x] permissions 仍为 `storage`、`activeTab`。
- [x] host_permissions 仍仅为 `https://api.notion.com/*`。
- [x] 未新增 tabs/scripting/downloads/identity/cookies。
- [x] 未新增依赖、远程代码、AI API、OCR、视频下载或字幕抓取。
- [x] README、PRIVACY、STORE_SUBMISSION、PERMISSION_JUSTIFICATION 已更新 v0.7 行为。
- [ ] 提交前敏感信息扫描无 Token/API Key/真实 Page ID/真实用户数据。

## v0.7 教程模式人工 QA

完整步骤见 `docs/V0.7_MANUAL_RISK_QA.md`。

- [ ] Chrome 完成 T07-01 至 T07-07。
- [ ] Edge 完成 T07-01、T07-02、T07-04、T07-07。
- [ ] 真实 Notion 验证 heading/code/equation/table/callout/image/bookmark。
- [ ] 普通全文模式无回归。
- [ ] 选区和评论上下文无回归。
- [ ] History 显示“教程”，重试保存可用。
- [ ] Popup、content script、service worker 无未处理错误。

## 打包与 Git

- [ ] `git status --short` 只包含 v0.7 和有意更新的项目级文档。
- [ ] 不提交 dist、node_modules、zip、.env、.wolf、.opencode、.playwright-mcp、测试原始资料。
- [ ] 精确 stage，不使用 `git add .`。
- [ ] 提交信息：`feat: add tutorial mode document model`。
- [ ] 本地保留 `clipmate-v0.7.zip`。
- [ ] 人工 QA 结果已回填 `TEST_LOG.md` 和 `CURRENT_STATUS.md`。

## 发布判定

自动化门禁全部通过但人工 QA 未完成时，状态为“自动化候选版”。P0 人工用例全部通过后，才可标记 v0.7 人工验收完成并推送发布分支。
