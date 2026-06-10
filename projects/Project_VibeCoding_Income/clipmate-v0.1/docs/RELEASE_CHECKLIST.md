# RELEASE_CHECKLIST.md — ClipMate v0.1 发布检查清单

> 上架 Edge Add-ons 前逐项检查。

---

## 上架前自检

### 代码质量
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 无严重警告
- [ ] 所有 TS 类型错误已修复
- [ ] 无 console.log 泄露用户数据
- [ ] 无硬编码 API Key / Token

### 功能验证
- [ ] Popup 页面正常打开
- [ ] Fullpage 正文提取正确
- [ ] Selection 选中文字剪藏正确
- [ ] 复制 Markdown 正常
- [ ] 保存到 Notion 成功
- [ ] Options 设置页保存/加载正常
- [ ] 错误状态有用户友好的提示

### 权限合理性
- [ ] 只申请了实际使用的 permissions
- [ ] host_permissions 仅覆盖需要的域名
- [ ] 无过度权限申请

### 素材准备
- [ ] 图标：16×16, 32×32, 48×48, 128×128
- [ ] 商店截图（最多 6 张，640×480 或 1280×800）
- [ ] 宣传图：440×280（小）、1400×560（大）
- [ ] Extension logo：300×300px（最小 128×128）

### 文案准备
- [ ] 扩展名称（中文 + 英文）
- [ ] 简短描述（132字符以内）
- [ ] 详细描述（250-10,000 字符）
- [ ] 隐私政策 URL（必填）
- [ ] 搜索关键词（最多 7 个，每个 30 字以内）

### Partner Center 填写
- [ ] Category：Productivity
- [ ] Visibility：Public
- [ ] Markets：全球或选定市场
- [ ] Support contact detail
- [ ] Single Purpose Description
- [ ] Permission Justification
- [ ] Remote Code 声明（应声明无远程代码）
- [ ] Data Usage 说明
- [ ] Notes for certification（含测试账号等）

---

## 审核等待期

- [ ] 准备 Chrome Web Store 同步提交
- [ ] 建立用户反馈渠道（GitHub Issues / 邮箱）
- [ ] 准备营销文案（Twitter / V2EX / 即刻 / Reddit）
- [ ] 准备 Product Hunt 发布文案
