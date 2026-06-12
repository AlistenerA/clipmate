# RELEASE_CHECKLIST.md — ClipMate v0.1 发布检查清单

> 上架 Edge Add-ons 前逐项检查。

---

## 上架前自检

### 代码质量
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 0 errors, 0 warnings
- [ ] `npm run test` 全部通过（80 tests, 6 files）
- [ ] 所有 TS 类型错误已修复
- [ ] 无 console.log 泄露用户数据（Token / 正文 / 备注）
- [ ] 无硬编码 API Key / Token
- [ ] 无 .env 文件提交到仓库

### 功能验证（按 TEST_PLAN.md 逐项执行）
- [ ] TC-01 安装测试：Edge 加载 dist 成功
- [ ] TC-02 加载验证：Popup / Options 可打开
- [ ] TC-03 Popup 打开：UI 元素正常渲染
- [ ] TC-04 Options 保存配置：读写正常
- [ ] TC-05 Fullpage 正文提取：博客文章提取正确
- [ ] TC-06 Selection 选区剪藏：选中文字提取正确
- [ ] TC-07 复制 Markdown：含标题/URL/标签/备注/正文，无异常粗体
- [ ] TC-08 保存到 Notion：内容完整追加到目标页面
- [ ] TC-09 无选区错误：显示中文提示
- [ ] TC-10 Token 缺失：显示中文提示
- [ ] TC-11 Token 错误：显示授权失败提示，Token 不泄露
- [ ] TC-12 Page ID 错误：显示友好提示
- [ ] TC-13 Integration 未授权：显示友好提示
- [ ] TC-14 受保护页面：不崩溃
- [ ] TC-15 隐私与日志：DevTools Console 无敏感信息泄露

### 权限合理性（实际 manifest.config.ts）
| 权限 | 是否必需 |
|------|:---:|
| `activeTab` | 是 — 获取当前页 URL/标题 |
| `storage` | 是 — 保存设置和草稿 |
| `host_permissions: https://api.notion.com/*` | 是 — 调用 Notion API |
| `content_scripts matches <all_urls>` | 是 — 支持在任意网页剪藏 |

### 素材准备
- [ ] 图标：16×16, 32×32, 48×48, 128×128（PNG 格式）
- [ ] 商店截图（最多 6 张，640×480 或 1280×800）
- [ ] 宣传图：440×280（小）、1400×560（大）
- [ ] Extension logo：300×300px（最小 128×128）

### 文案准备
- [ ] 扩展名称：ClipMate - 网页剪藏助手
- [ ] 简短描述（132 字符以内）
- [ ] 详细描述（250-10,000 字符）
- [ ] 隐私政策 URL（必填，建议 GitHub Pages 托管）
- [ ] 搜索关键词（最多 7 个，每个 ≤30 字）
- [ ] 权限使用说明（来自 PERMISSION_JUSTIFICATION.md）

### Partner Center 填写
- [ ] Category：Productivity
- [ ] Visibility：Public
- [ ] Markets：全球或选定市场
- [ ] Support contact detail
- [ ] Single Purpose Description
- [ ] Permission Justification
- [ ] Remote Code 声明（ClipMate 应声明无远程代码）
- [ ] Data Usage 说明
- [ ] Notes for certification（含测试步骤说明）

---

## 审核等待期

- [ ] 准备 Chrome Web Store 同步提交
- [ ] 建立用户反馈渠道（GitHub Issues / 邮箱）
- [ ] 准备营销文案（Twitter / V2EX / 即刻 / Reddit）
- [ ] 准备 Product Hunt 发布文案
