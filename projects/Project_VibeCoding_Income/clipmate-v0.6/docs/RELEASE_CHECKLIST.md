# RELEASE_CHECKLIST.md — ClipMate v0.5 发布检查清单

> 上架 Edge Add-ons / Chrome Web Store 前逐项检查。v0.5 发布候选。

---

## 上架前自检

### 代码质量
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 0 errors, 0 warnings
- [ ] `npm run test` 全部通过（1922 tests, 48 files）
- [ ] 所有 TS 类型错误已修复
- [ ] 无 console.log 泄露用户数据（Token / 正文 / 备注 / 完整 Markdown / 完整图片 URL 列表）
- [ ] 无硬编码 API Key / Token
- [ ] 无 .env 文件提交到仓库

### 版本检查
- [ ] `package.json` version = `0.5.0`
- [ ] `manifest.config.ts` version = `0.5.0`
- [ ] `package-lock.json` version = `0.5.0`
- [ ] `dist/manifest.json` version = `0.5.0`
- [ ] zip 文件名：`clipmate-v0.5.zip`

### 权限检查
- [ ] 权限列表与 v0.1/v0.2/v0.3/v0.4 完全一致：`activeTab` / `storage` / `host_permissions api.notion.com` / `content_scripts all_urls`
- [ ] **v0.5 未新增权限**
- [ ] 未误加 tabs/scripting/downloads/identity/cookies
- [ ] 权限说明文档与 manifest 一致

### 打包检查
- [ ] `npm run zip` 成功
- [ ] zip 文件名为 `clipmate-v0.5.zip`
- [ ] zip 只包含 dist 构建产物
- [ ] zip 不包含：src/ 源码、tests/、docs/、node_modules/、.env、package.json、README.md、.git/

### 隐私检查
- [ ] 隐私政策已更新 v0.5（含图片 external URL 策略、不保存完整图片 URL 列表说明）
- [ ] 隐私政策已明确不接入 AI API
- [ ] 隐私政策已明确不下载/上传/缓存图片
- [ ] 隐私政策已明确 History 只保存轻量图片元数据（imageCount/firstImageUrl/skippedImageCount），不保存完整图片 URL 列表
- [ ] 没有真实 Token/API Key 写入代码或文档
- [ ] 控制台不输出 Token / 正文全文 / 备注全文 / 完整 Markdown / 完整图片 URL 列表

### 文档检查
- [ ] README.md 已更新 v0.5 功能列表
- [ ] STORE_LISTING_DRAFT.md 已更新 v0.5 文案
- [ ] PRIVACY_POLICY_DRAFT.md 已更新 v0.5 隐私边界
- [ ] PERMISSION_JUSTIFICATION.md 已更新 v0.5 权限说明
- [ ] TEST_PLAN.md 已更新 v0.5 测试计划
- [ ] RELEASE_CHECKLIST.md 本文件已更新
- [ ] CURRENT_STATUS.md 已更新 Session 6 完成
- [ ] V0.5_PLAN.md 已更新进度
- [ ] CHANGELOG_AGENT.md 已更新 Session 6 记录
- [ ] TEST_LOG.md 已更新 Session 6 命令结果
- [ ] ISSUES.md 已更新
- [ ] DECISIONS.md 已更新

### v0.5 图片功能 QA（待用户执行）
- [ ] 新闻文章页：正文图片正确提取并保存到 Notion
- [ ] 博客文章页：figure/figcaption 图片和题注正确
- [ ] 技术文档页：icon/favicon/emoji 等噪声图片被过滤
- [ ] CSDN-like 页：懒加载图片正确处理
- [ ] Notion 保存结果：external image block 正确显示
- [ ] Popup 显示图片数量徽章
- [ ] History 显示图片数量标签
- [ ] selection/comment-context 模式不受图片功能影响

### v0.5 已知限制确认
- [ ] external image URL 依赖源站可访问性
- [ ] 代理/resize/API 型图片 URL 在 Notion 中可能无法显示（v0.5 尽量过滤或降级）
- [ ] 不接入 Notion File Upload API
- [ ] Notion API 不支持本扩展稳定设置 image block 居中
- [ ] 不上传图片到 Notion 托管

### 鲁棒性检查
- [ ] 确认 lint 0 errors / test 全部通过 / build 成功
- [ ] 确认 manifest 权限无变更
- [ ] 确认无依赖新增
- [ ] 确认 Notion API 保存链路兼容 image block
- [ ] 确认 storage 结构向后兼容（新增 image 元数据可选字段）
- [ ] 确认不使用 FileReader/canvas/toDataURL/createObjectURL

---

## 提交前 Git Checklist

- [ ] `git status --short` 仅包含允许修改的文件（clipmate-v0.5/ 内）
- [ ] 不包含 dist/、build/、zip、node_modules/、.env
- [ ] 不包含 clipmate-v0.1/、clipmate-v0.2/、clipmate-v0.3/、clipmate-v0.4/
- [ ] 不包含 .wolf/、.opencode/、.playwright-mcp/
- [ ] 不包含 测试文档/
- [ ] 不包含 ../../opencode.json
- [ ] 不使用 `git add .`
- [ ] 精确 stage 允许的文件
- [ ] commit message 符合规范

---

## 素材准备
- [ ] 图标：16×16, 32×32, 48×48, 128×128（PNG 格式）
- [ ] 商店截图（最多 6 张，640×480 或 1280×800）
- [ ] 宣传图：440×280（小）、1400×560（大）
- [ ] Extension logo：300×300px（最小 128×128）

## 文案准备
- [ ] 扩展名称：ClipMate - 网页剪藏助手
- [ ] 简短描述（≤132 字符）
- [ ] 详细描述
- [ ] 隐私政策 URL
- [ ] 搜索关键词（最多 7 个）
- [ ] 权限使用说明

## Partner Center 填写
- [ ] Category：Productivity
- [ ] Visibility：Public
- [ ] Remote Code 声明（无远程代码）
- [ ] Data Usage 说明
- [ ] Notes for certification
