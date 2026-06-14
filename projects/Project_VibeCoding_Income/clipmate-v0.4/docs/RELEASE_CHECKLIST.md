# RELEASE_CHECKLIST.md — ClipMate v0.4 发布检查清单

> 上架 Edge Add-ons / Chrome Web Store 前逐项检查。v0.4 发布候选。

---

## 上架前自检

### 代码质量
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 0 errors, 0 warnings
- [ ] `npm run test` 全部通过（1383 tests, 32 files）
- [ ] 所有 TS 类型错误已修复
- [ ] 无 console.log 泄露用户数据（Token / 正文 / 备注 / 完整 Markdown）
- [ ] 无硬编码 API Key / Token
- [ ] 无 .env 文件提交到仓库

### 版本检查
- [ ] `package.json` version = `0.4.0`
- [ ] `manifest.config.ts` version = `0.4.0`
- [ ] `dist/manifest.json` version = `0.4.0`
- [ ] zip 文件名：`clipmate-v0.4.zip`

### 权限检查
- [ ] 权限列表与 v0.1/v0.2/v0.3 完全一致：`activeTab` / `storage` / `host_permissions api.notion.com` / `content_scripts all_urls`
- [ ] **v0.4 未新增权限**
- [ ] 权限说明文档与 manifest 一致

### 打包检查
- [ ] `npm run zip` 成功
- [ ] zip 文件名为 `clipmate-v0.4.zip`
- [ ] zip 只包含 dist 构建产物（基于打包脚本逻辑：`CreateFromDirectory('dist', $zip)`）
- [ ] zip 不包含：src/ 源码（.ts/.tsx）、tests/、docs/、node_modules/、.env、package.json、README.md、.git/
- [ ] 逐文件解压列出 zip 内容审计 — 推迟到 Session 8

### 隐私检查
- [ ] 隐私政策已更新 v0.4
- [ ] 隐私政策已明确不接入 AI API
- [ ] 隐私政策已明确 v0.4 新增隐私边界（IntentSnapshot 不持久化、Site Visual 不访问网络、Link Card 不访问目标 URL）
- [ ] 没有真实 Token/API Key 写入代码或文档
- [ ] 控制台不输出 Token / 正文全文 / 备注全文 / 完整 Markdown

### 文档检查
- [ ] README.md 已更新 v0.4 功能列表
- [ ] PRIVACY.md 已创建并更新 v0.4 隐私边界
- [ ] STORE_SUBMISSION.md 已创建 v0.4 商店提交材料
- [ ] V0.4_RELEASE_NOTES.md 已创建
- [ ] RELEASE_CHECKLIST.md 本文件已更新
- [ ] MANUAL_QA.md 已创建
- [ ] CURRENT_STATUS.md 已更新 Session 7 完成
- [ ] V0.4_PLAN.md 已更新进度
- [ ] CHANGELOG_AGENT.md 已更新 Session 7 记录
- [ ] TEST_LOG.md 已更新 Session 7 命令结果
- [ ] ISSUES.md 已更新
- [ ] DECISIONS.md 已新增 D-v0.4-035 / D-v0.4-036

### 人工 QA（待用户执行）
- [ ] Navigation Summary QA（7 场景）
- [ ] Comment / Selection QA（7 场景）
- [ ] Site Visual QA（8 场景）
- [ ] Link Card QA（8 场景）
- [ ] Notion 保存基础 QA
- [ ] Markdown 复制基础 QA
- [ ] Edge/Chrome 加载扩展

### v0.4 新增功能 QA（待用户执行）
- [ ] VQ-01 Page Type Detector：不同页面类型识别准确
- [ ] VQ-02 Site Profile Engine：搜索引擎/视频/社区站点匹配
- [ ] VQ-03 Intent Signal Collector：意图检测不干扰 normal 流程
- [ ] VQ-04 Navigation Summary：搜索页/导航页不提取全文
- [ ] VQ-05 Comment Selection：选区位于评论区时触发 warning
- [ ] VQ-06 Site Visual：favicon/themeColor 安全提取
- [ ] VQ-07 Link Card Preview：builder/serializer 正确

### 鲁棒性检查
- [ ] Session 8 鲁棒性检查待执行
- [ ] 确认 lint 0 errors / test 全部通过 / build 成功
- [ ] 确认 manifest 权限无变更
- [ ] 确认无依赖新增
- [ ] 确认 Notion API 保存链路无变更
- [ ] 确认 storage 结构无变更
- [ ] 确认 4 次 Anti-Slop Review 全部通过

### Playwright 辅助 QA 检查
- [ ] 是否只访问用户允许页面
- [ ] 是否未记录 token/page id
- [ ] 是否未保存完整 DOM/正文/评论
- [ ] 是否未把 Playwright 结果误写成商店审核通过
- [ ] 详情见 `docs/PLAYWRIGHT_QA_WORKFLOW.md`

---

## 提交前 Git Checklist

- [ ] `git status --short` 仅包含允许修改的文件
- [ ] 不包含 dist/、build/、zip、node_modules/、.env
- [ ] 不包含 clipmate-v0.1/、clipmate-v0.2/、clipmate-v0.3/
- [ ] 不包含 .wolf/、.opencode/、.playwright-mcp/
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
