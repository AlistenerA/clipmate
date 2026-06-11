# RELEASE_CHECKLIST.md — ClipMate v0.2 发布检查清单

> 上架 Edge Add-ons 前逐项检查。

---

## 上架前自检

### 代码质量
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 0 errors, 0 warnings
- [ ] `npm run test` 全部通过（321 tests, 13 files）
- [ ] 所有 TS 类型错误已修复
- [ ] 无 console.log 泄露用户数据（Token / 正文 / 备注 / 完整 Markdown）
- [ ] 无硬编码 API Key / Token
- [ ] 无 .env 文件提交到仓库

### 版本检查
- [ ] `package.json` version = `0.2.0`
- [ ] `manifest.config.ts` version = `0.2.0`
- [ ] `dist/manifest.json` version = `0.2.0`
- [ ] zip 文件名：`clipmate-v0.2.zip`

### 权限检查
- [ ] 权限列表与 v0.1 完全一致：`activeTab` / `storage` / `host_permissions api.notion.com` / `content_scripts all_urls`
- [ ] v0.2 未新增权限
- [ ] 权限说明文档（PERMISSION_JUSTIFICATION.md）与 manifest 一致

### 打包检查
- [ ] `npm run zip` 成功
- [ ] zip 文件名为 `clipmate-v0.2.zip`
- [ ] zip 只包含 dist 构建产物
- [ ] zip 不包含：src/ 源码（.ts/.tsx）、tests/、docs/、node_modules/、.env、package.json、README.md、.git/

### 隐私检查
- [ ] 隐私政策已更新 v0.2 历史记录存储说明
- [ ] 隐私政策已更新不调用第三方 favicon API 声明
- [ ] 隐私政策已更新时间戳
- [ ] 没有真实 Token/API Key 写入代码或文档
- [ ] 控制台不输出 Token / 正文全文 / 备注全文 / 完整 Markdown

### 文档检查
- [ ] README.md 已更新 v0.2 功能列表
- [ ] TEST_PLAN.md 已更新 40 项 v0.2 测试用例
- [ ] MANUAL_QA_RESULT_TEMPLATE.md 已更新 40 项可勾选模板
- [ ] PRIVACY_POLICY_DRAFT.md 已更新 v0.2
- [ ] PERMISSION_JUSTIFICATION.md 已更新 v0.2 权限对比表
- [ ] STORE_LISTING_DRAFT.md 已更新 v0.2 功能亮点
- [ ] CURRENT_STATUS.md 已更新 Session 6 完成
- [ ] CHANGELOG_AGENT.md 已更新 Session 6 记录
- [ ] DECISIONS.md 已更新 Session 6 决策

### 人工 QA
- [ ] 依据 TEST_PLAN.md 完成 40 项测试（TC-01 ~ TC-40）
- [ ] MANUAL_QA_RESULT_TEMPLATE.md 逐项填写
- [ ] 确认无阻塞问题

---

## 功能验证（按 TEST_PLAN.md 逐项执行）

### 安装与加载
- [ ] TC-01 安装测试：Edge 加载 dist 成功，版本 0.2.0
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
- [ ] TC-15 保存成功写入历史
- [ ] TC-16 保存失败写入 failed 历史
- [ ] TC-17 历史搜索标题
- [ ] TC-18 历史搜索 URL/域名
- [ ] TC-19 历史搜索标签
- [ ] TC-20 历史搜索正文 — "正文匹配"
- [ ] TC-21 历史搜索备注 — "备注匹配"
- [ ] TC-22 历史复制 Markdown
- [ ] TC-23 历史删除单条
- [ ] TC-24 历史清空全部
- [ ] TC-25 failed/unsaved 历史重试保存

### History UI 体验
- [ ] TC-26 favicon 真实图标优先
- [ ] TC-27 favicon fallback 域名首字母
- [ ] TC-28 图片开篇摘要不显示 ![](...)
- [ ] TC-29 同站多条历史左侧色条一致
- [ ] TC-30 同站不同文章 Popup 自动刷新
- [ ] TC-31 同页重复打开不丢失标签/备注

### 设置与存储
- [ ] TC-32 关闭历史记录后不写新历史
- [ ] TC-33 historyLimit 裁剪逻辑

### 错误提示
- [ ] TC-34 Token 缺失提示
- [ ] TC-35 目标缺失提示
- [ ] TC-36 Notion API 失败提示

### 隐私与打包
- [ ] TC-37 隐私检查：控制台无敏感信息
- [ ] TC-38 Build 测试
- [ ] TC-39 Zip 测试
- [ ] TC-40 Zip 内容检查

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
- [ ] Remote Code 声明（ClipMate 应声明无远程代码）
- [ ] Data Usage 说明
- [ ] Notes for certification（含测试步骤说明）

---

## 审核等待期
- [ ] 准备 Chrome Web Store 同步提交
- [ ] 建立用户反馈渠道（GitHub Issues / 邮箱）
- [ ] 准备营销文案（Twitter / V2EX / 即刻 / Reddit）
- [ ] 准备 Product Hunt 发布文案
