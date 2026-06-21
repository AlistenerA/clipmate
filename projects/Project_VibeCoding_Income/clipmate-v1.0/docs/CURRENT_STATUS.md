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
- 新增 Windows PowerShell 管理脚本，可通过 SSH 在生产服务器生成 Key，并安全写回当前 Windows 用户的受限文件。
- 升级方案入口改为爱发电，并在插件内明确提示服务器网站仍在开发中。
- Windows License 管理新增 Python CLI 与原生 Tkinter GUI；PowerShell 方式继续保留。

## 当前验证

- ESLint：通过。
- TypeScript `--noEmit`：通过。
- 全量测试：69 files / 2060 tests 全部通过。
- v1.0.1 定向测试：License API、权限、Onboarding storage 和 Background lifecycle 共 15 tests，通过。
- staging build：183 modules，通过；manifest 1.0.1，host 仅 `https://cydl.site/*`。
- production build：183 modules，通过；manifest 1.0.1，host 仅 `https://license.cydl.site/*`。
- 正式域名 `https://license.cydl.site/api` 已启用独立证书，完整线上 smoke 通过。
- Chrome for Testing 148 与 Edge 149 均加载 production `dist`，首次引导、无效/有效激活、刷新和取消激活通过，控制台与 service worker 0 error。
- Chrome 额外验证离线保留路径、原始 License Key 不落盘和 Options 横向无溢出。
- 同一 extension ID/profile 的 v0.9.3→v1.0.1 重启升级不触发 Onboarding。
- `npm audit --omit=dev`：0 vulnerabilities。完整开发树 5 项仅影响 Vite/Vitest/jsdom 工具链，单独跟踪大版本迁移。
- Windows 远程 Key 脚本：PowerShell 5.1 语法、参数拒绝、真实 Pro/Lifetime 生成、Windows ACL、远程吊销与临时文件清理均验证通过。
- Python License 管理：服务端全量 19 tests 通过，其中 Windows Python CLI/GUI 共享核心 5 tests；`compileall`、CLI help 和无 SSH 的非法参数门禁通过。
- Codex 捆绑 Python 的 Tcl 初始化不完整，Tkinter 窗口无法在当前沙箱做视觉启动；需使用勾选 Tcl/Tk 的标准 Windows Python 做一次人工 GUI smoke。
- 本地 `clipmate-v1.0.1.zip` 已刷新：35 entries、单一根 manifest、0 unsafe paths、SHA-256 `03E3FCA5D3AF847C5C504D12E471122F3A06EF2D4203A3E1D03A40E93C6FC7CD`。
