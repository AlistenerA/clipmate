# ClipMate v1.0.2 Agent Context

更新日期：2026-06-21

## 当前版本

- 目录：`clipmate-v1.0.2/`
- 版本：`1.0.2`
- 基线：已验证的 v1.0.1 工作区快照
- 分支：`codex/clipmate-v1-license`

## 核心入口

- `src/pro/proAuth.ts`：`hasFeature`、`isPro`、activate/refresh/deactivate。
- `src/pro/licenseApi.ts`：固定 HTTPS base、无 Cookie、严格响应校验。
- `src/background/handlers/licenseHandler.ts`：授权状态机和终止/暂时错误处理。
- `src/background/licenseLifecycle.ts`：install/startup/alarm 生命周期。
- `src/options/components/LicenseActivationCard.tsx`：激活 UI。
- `src/onboarding/`：独立三步首次引导。
- `src/content/socialPost/`：小红书/贴吧专用 DOM 提取、评论上限和语义化输出。
- `src/content/index.ts`：`EXTRACT_CURRENT_PAGE` 优先接入专用提取，非目标路由沿用通用链路。
- `vite.config.ts` / `manifest.config.ts`：staging/production 地址与权限同源生成。
- `../license-server-v1.0.0/scripts/New-ClipMateLicense.ps1`：Windows 通过 SSH 生成 Key 并写入 ACL 受限文件。
- `../license-server-v1.0.0/scripts/clipmate_license_admin.py`：推荐的 Windows Python CLI/Tkinter GUI，复用同一 SSH 与失败吊销边界。

## 不变量

- v0.9.3 现有能力保持免费和向后兼容。
- Pro 仅预置 `batch_save`、`ai_summary` entitlement，本版本不实现功能本身。
- License 服务不得接收网页内容、Notion Token、历史或完整设置。
- 网络失败可使用七天离线宽限；明确吊销、过期、设备失效立即清理授权。
- production 包不得包含 `cydl.site` 临时 host permission。
- 社区站点提取只读取当前 DOM，不调用私有 API、不读取 Cookie；评论/回复总数不得超过 50。
- Playwright 观察必须有头运行，登录由用户本人完成，产物不得记录账号或带凭证的完整 URL。

## 发布状态

- `license.cydl.site` HTTPS、线上 smoke、Chrome 148 / Edge 149 QA 已通过。
- production 依赖 audit 为 0 vulnerabilities。
- v1.0.0 API contract 和 v1.0.1 entitlement/storage schema 进入冻结状态。
- Vite/Vitest 大版本升级属于后续独立兼容迁移，不混入当前版本。
- Windows 管理脚本已完成 PowerShell 5.1 与生产 SSH smoke；测试 Key 已吊销，脚本默认不打印完整 Key。
- 临时购买入口固定为 `https://ifdian.net/a/ClipMate/plan`；服务器网站开发完成前不再跳转 `cydl.site` 页面。
- v1.0.2 lint、TypeScript、70 files / 2067 tests、production/staging build 与归档校验已通过；真实 built-extension/Notion 保存按产品负责人要求保留为后续抽查，不阻塞后续版本开发。
