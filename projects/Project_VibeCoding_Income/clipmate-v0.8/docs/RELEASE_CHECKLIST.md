# RELEASE_CHECKLIST.md - ClipMate v0.8 发布检查清单

更新日期：2026-06-19

## 自动化门禁

- [x] `npm run lint`：0 errors。
- [x] `npm run test`：58 files / 1998 tests。
- [x] `npm run build`：成功，142 modules transformed。
- [x] v0.8.1 Asset Picker 定向测试：10 tests。
- [x] v0.8.2 人工问题定向测试：4 tests。
- [x] `dist/manifest.json` version = `0.8.2`。
- [x] `npm run zip`：`clipmate-v0.8.zip`，166989 bytes / 25 entries，仅 dist 产物。

## 版本一致性

- [x] `package.json` version = `0.8.2`。
- [x] `package-lock.json` version = `0.8.2`。
- [x] `manifest.config.ts` version = `0.8.2`。
- [x] `clipmate-v0.7/` 保持冻结，本轮代码只进入 `clipmate-v0.8/`。
- [x] 切换到 `codex/clipmate-v0.8-asset-picker`。

## 权限、隐私与威胁检查

- [x] permissions 仍为 `storage`、`activeTab`。
- [x] host_permissions 仍仅为 `https://api.notion.com/*`。
- [x] 未新增 tabs/scripting/downloads/identity/cookies。
- [x] 未新增依赖、远程代码、AI API、OCR、图片下载/上传或视频抓取。
- [x] 只允许 HTTP(S) 图片；data/blob/javascript 和噪声图片双重过滤。
- [x] session id 与 page URL 防止旧 Popup 结果跨页污染。
- [x] 覆盖层使用 Shadow DOM，不修改宿主图片样式；退出路径清理 DOM/监听器。
- [x] 不读取 cookie、登录态或私有 API，不建立站点级长期缓存。
- [x] 提交前敏感信息扫描无真实 Token/API Key/Page ID/用户数据；命中项均为明确测试占位符。

## 人工 QA

完整步骤见 `docs/V0.8_TEST_DOCUMENT.md`。

- [ ] Chrome 完成 AP-01 至 AP-12、UI-01 至 UI-06。
- [ ] Edge 完成点选、取消、Popup 重开、页面导航清理。
- [ ] BBC、Runoob、CCTV-like、Bilibili 站点矩阵通过。
- [ ] 真实 Notion 验证全文/教程 external image 与失败降级。
- [ ] 全文、选区、教程、Options、History、重试无回归。
- [ ] Popup、content script、service worker 无新增控制台错误。

## 打包与 Git

- [ ] `git status --short` 只包含 V0.8 和有意更新的项目级文档。
- [ ] 不提交 dist、node_modules、zip、.env、测试截图或原始用户资料。
- [ ] 精确 stage，不使用 `git add .`。
- [ ] 提交信息：`fix: preserve v0.8.2 tutorial structure`。
- [x] 本地保留 `clipmate-v0.8.zip`。
- [ ] 人工 QA 结果回填 `TEST_LOG.md` 和 `CURRENT_STATUS.md`。

## 发布判定

自动化门禁通过但人工 QA 未完成时，状态为“自动化候选版”。P0 人工用例全部通过后，才可冻结为 v0.8 正式发布。
