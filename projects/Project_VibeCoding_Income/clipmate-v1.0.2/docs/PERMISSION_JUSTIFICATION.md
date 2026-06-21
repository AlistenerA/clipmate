# ClipMate v1.0.2 权限说明

## 实际清单

| 权限 | 类型 | 用途 |
|---|---|---|
| `storage` | permissions | 本地设置、草稿、历史、Onboarding 和短期 License 状态 |
| `activeTab` | permissions | 用户打开 Popup 时读取当前活动页 |
| `alarms` | permissions | 定时检查 24 小时 License Token 是否临近到期 |
| `https://api.notion.com/*` | host_permissions | 用户主动保存时调用 Notion API |
| `https://license.cydl.site/*` | host_permissions | 激活、刷新、取消 License；仅 production 包 |
| `<all_urls>` | content_scripts.matches | 在用户可能剪藏的网页中运行本地提取逻辑 |

Staging 构建将 License host 替换为 `https://cydl.site/*`，输出到独立
`dist-staging/`，不得上传商店。生产包不会同时申请两个 License 域名。

## `alarms`

MV3 Background Service Worker 不保证长期存活，不能依赖 `setInterval`。
ClipMate 每六小时唤醒检查一次，只有 Token 距离到期不足六小时时才联网；
未激活时不发送 License 请求。

## License host permission

网络请求集中在 Background Service Worker，base URL 是构建时固定的 HTTPS
地址，不允许用户或网页控制请求目标。请求不携带 Cookie，不启用 CORS，
不发送网页内容、Notion Token、历史或设置对象。

## 最小权限保证

- 不申请 `tabs`、`cookies`、`identity`、`downloads` 或 `scripting`。
- Onboarding 是扩展内部页面，不作为 web accessible resource 暴露。
- 不加载远程 JavaScript，不使用 `eval` 或 `new Function`。
- Content Script 不直接调用 License API。
