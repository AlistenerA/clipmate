# RELEASE_CHECKLIST.md — ClipMate v0.3 发布检查清单

> 上架 Edge Add-ons / Chrome Web Store 前逐项检查。v0.3 发布候选。

---

## 上架前自检

### 代码质量
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 0 errors, 0 warnings
- [ ] `npm run test` 全部通过（703 tests, 19 files）
- [ ] 所有 TS 类型错误已修复
- [ ] 无 console.log 泄露用户数据（Token / 正文 / 备注 / 完整 Markdown）
- [ ] 无硬编码 API Key / Token
- [ ] 无 .env 文件提交到仓库

### 版本检查
- [ ] `package.json` version = `0.3.0`
- [ ] `manifest.config.ts` version = `0.3.0`
- [ ] `dist/manifest.json` version = `0.3.0`
- [ ] zip 文件名：`clipmate-v0.3.zip`

### 权限检查
- [ ] 权限列表与 v0.1/v0.2 完全一致：`activeTab` / `storage` / `host_permissions api.notion.com` / `content_scripts all_urls`
- [ ] **v0.3 未新增权限**
- [ ] 权限说明文档（PERMISSION_JUSTIFICATION.md）与 manifest 一致

### 打包检查
- [ ] `npm run zip` 成功
- [ ] zip 文件名为 `clipmate-v0.3.zip`
- [ ] zip 只包含 dist 构建产物
- [ ] zip 不包含：src/ 源码（.ts/.tsx）、tests/、docs/、node_modules/、.env、package.json、README.md、.git/

### 隐私检查
- [ ] 隐私政策已标注 v0.3 草稿
- [ ] 隐私政策已明确不接入 AI API
- [ ] 没有真实 Token/API Key 写入代码或文档
- [ ] 控制台不输出 Token / 正文全文 / 备注全文 / 完整 Markdown

### 文档检查
- [ ] README.md 已更新 v0.3 功能列表
- [ ] TEST_PLAN.md 已更新 58 项测试用例（含 v0.3 内容保真 QA TC-41~TC-58）
- [ ] MANUAL_QA_RESULT_TEMPLATE.md 已更新 v0.3
- [ ] PRIVACY_POLICY_DRAFT.md 已标注 v0.3 草稿
- [ ] PERMISSION_JUSTIFICATION.md 已更新 v0.3 权限对比
- [ ] STORE_LISTING_DRAFT.md 已更新 v0.3 功能亮点
- [ ] CURRENT_STATUS.md 已更新 Session 7 完成
- [ ] CHANGELOG_AGENT.md 已更新 Session 7 记录
- [ ] DECISIONS.md 已更新 Session 7 决策

### 人工 QA
- [ ] 依据 TEST_PLAN.md 完成 58 项测试（TC-01 ~ TC-58）
- [ ] MANUAL_QA_RESULT_TEMPLATE.md 逐项填写
- [ ] 确认无阻塞问题

### 鲁棒性检查
- [ ] Session 8 鲁棒性检查待执行
- [ ] 确认 lint 0 errors / test 全部通过 / build 成功
- [ ] 确认 manifest 权限无变更
- [ ] 确认无依赖新增
- [ ] 确认 Notion API 保存链路无变更
- [ ] 确认 storage 结构无变更

---

## 功能验证（按 TEST_PLAN.md 逐项执行）

### 安装与加载
- [ ] TC-01 安装测试：Edge/Chrome 加载 dist 成功，版本 0.3.0
- [ ] TC-02 加载验证：Popup / Options 可打开

### Options 设置页
- [ ] TC-03 Token 保存
- [ ] TC-04 添加 Notion 目标
- [ ] TC-05 编辑 Notion 目标
- [ ] TC-06 删除 Notion 目标
- [ ] TC-07 设置默认目标

### Popup 剪藏
- [ ] TC-08 Popup 默认目标选中
- [ ] TC-09 Popup 切换目标保存
- [ ] TC-10 全文剪藏保存到 Notion
- [ ] TC-11 选区剪藏保存到 Notion
- [ ] TC-12 标签保存
- [ ] TC-13 备注保存
- [ ] TC-14 复制 Markdown

### 本地剪藏历史
- [ ] TC-15 保存成功写入历史 ~ TC-25 重试保存

### History UI 体验
- [ ] TC-26 favicon ~ TC-31 同页重复打开

### 设置与存储
- [ ] TC-32 关闭历史 ~ TC-33 limit 裁剪

### 错误提示
- [ ] TC-34 Token 缺失 ~ TC-36 API 失败

### 隐私与打包
- [ ] TC-37 隐私检查 ~ TC-40 Zip 内容检查

### v0.3 内容保真 QA（新增）
- [ ] TC-41 Markdown Target Selector
- [ ] TC-42 Notion profile 复制 Markdown
- [ ] TC-43 Obisidian profile 复制（YAML frontmatter）
- [ ] TC-44 Typora profile 复制
- [ ] TC-45 Generic profile 复制
- [ ] TC-46 $...$ 内联公式保留
- [ ] TC-47 $$...$$ 块级公式保留
- [ ] TC-48 代码块语言保留 + 噪音清理
- [ ] TC-49 代码块行号清理
- [ ] TC-50 图片 alt 和 URL 保留
- [ ] TC-51 链接安全过滤
- [ ] TC-52 简单表格转 Markdown table
- [ ] TC-53 复杂表格保守提示
- [ ] TC-54 原文 ↔ 预览切换
- [ ] TC-55 预览不执行 HTML
- [ ] TC-56 导航/推荐/评论过滤
- [ ] TC-57 Markdown 尾部截断
- [ ] TC-58 低置信页面提示

---

## 素材准备
- [ ] 图标：16×16, 32×32, 48×48, 128×128（PNG 格式）
- [ ] 商店截图（最多 6 张，640×480 或 1280×800）
- [ ] 宣传图：440×280（小）、1400×560（大）
- [ ] Extension logo：300×300px（最小 128×128）

## 文案准备
- [ ] 扩展名称：ClipMate - 网页剪藏助手
- [ ] 简短描述（132 字符以内）
- [ ] 详细描述（250-10,000 字符）
- [ ] 隐私政策 URL（必填，建议 GitHub Pages 托管）
- [ ] 搜索关键词（最多 7 个，每个 ≤30 字）
- [ ] 权限使用说明（来自 PERMISSION_JUSTIFICATION.md）

## Partner Center 填写
- [ ] Category：Productivity
- [ ] Visibility：Public
- [ ] Markets：全球或选定市场
- [ ] Support contact detail
- [ ] Single Purpose Description
- [ ] Permission Justification
- [ ] Remote Code 声明（无远程代码）
- [ ] Data Usage 说明
- [ ] Notes for certification

---

## 审核等待期
- [ ] 准备 Chrome Web Store 同步提交
- [ ] 建立用户反馈渠道（GitHub Issues / 邮箱）
- [ ] 准备营销文案
