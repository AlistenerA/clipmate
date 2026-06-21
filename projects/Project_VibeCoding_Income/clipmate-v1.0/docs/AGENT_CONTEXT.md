# ClipMate v1.0.1 Agent Context

更新日期：2026-06-21

## 当前版本

- 目录：`clipmate-v1.0/`
- 版本：`1.0.1`
- 分支：`codex/clipmate-v1-license`
- 基线：冻结的 v0.9.3

## 核心入口

- `src/pro/proAuth.ts`：`hasFeature`、`isPro`、activate/refresh/deactivate。
- `src/pro/licenseApi.ts`：固定 HTTPS base、无 Cookie、严格响应校验。
- `src/background/handlers/licenseHandler.ts`：授权状态机和终止/暂时错误处理。
- `src/background/licenseLifecycle.ts`：install/startup/alarm 生命周期。
- `src/options/components/LicenseActivationCard.tsx`：激活 UI。
- `src/onboarding/`：独立三步首次引导。
- `vite.config.ts` / `manifest.config.ts`：staging/production 地址与权限同源生成。

## 不变量

- v0.9.3 现有能力保持免费和向后兼容。
- Pro 仅预置 `batch_save`、`ai_summary` entitlement，本版本不实现功能本身。
- License 服务不得接收网页内容、Notion Token、历史或完整设置。
- 网络失败可使用七天离线宽限；明确吊销、过期、设备失效立即清理授权。
- production 包不得包含 `cydl.site` 临时 host permission。

## 发布状态

- `license.cydl.site` HTTPS、线上 smoke、Chrome 148 / Edge 149 QA 已通过。
- production 依赖 audit 为 0 vulnerabilities。
- v1.0.0 API contract 和 v1.0.1 entitlement/storage schema 进入冻结状态。
- Vite/Vitest 大版本升级属于后续独立兼容迁移，不混入当前版本。
