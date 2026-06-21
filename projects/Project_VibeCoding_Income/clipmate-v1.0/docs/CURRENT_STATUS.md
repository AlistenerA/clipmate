# ClipMate v1.0.1 当前状态

更新日期：2026-06-21

## 版本边界

- `clipmate-v0.9/`：冻结的 v0.9.3 基线，不修改。
- `clipmate-v1.0/`：从 v0.9.3 隔离创建的 v1.0.1 开发目录。
- 当前分支：`codex/clipmate-v1-license`。

## 已实现

- 独立 `src/pro/` 权限模块、短期 Token、本地七天离线宽限和严格 API 响应校验。
- Background 统一处理激活、刷新和取消激活；Alarm 每六小时检查到期窗口。
- Options 激活卡显示套餐、有效期和设备数量，不持久化完整 License Key。
- 首次安装后的第一次 Popup 显示三步 Onboarding；升级安装不显示。
- staging/production 构建分别绑定 `cydl.site` 与 `license.cydl.site`，权限不混用。
- Manifest 1.0.1 新增 `alarms` 与一个构建模式对应的 License HTTPS host。

## 当前验证

- ESLint：通过。
- TypeScript `--noEmit`：通过。
- 全量测试：68 files / 2058 tests 全部通过。
- v1.0.1 定向测试：License API、权限、Onboarding storage 和 Background lifecycle 共 15 tests，通过。
- staging build：182 modules，通过；manifest 1.0.1，host 仅 `https://cydl.site/*`。
- production build：182 modules，通过；manifest 1.0.1，host 仅 `https://license.cydl.site/*`。
- 正式域名 `https://license.cydl.site/api` 已启用独立证书，完整线上 smoke 通过。
- Chrome for Testing 148 与 Edge 149 均加载 production `dist`，首次引导、无效/有效激活、刷新和取消激活通过，控制台与 service worker 0 error。
- Chrome 额外验证离线保留路径、原始 License Key 不落盘和 Options 横向无溢出。
- 同一 extension ID/profile 的 v0.9.3→v1.0.1 重启升级不触发 Onboarding。
- `npm audit --omit=dev`：0 vulnerabilities。完整开发树 5 项仅影响 Vite/Vitest/jsdom 工具链，单独跟踪大版本迁移。
