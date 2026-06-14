# TEST_PLAN.md — ClipMate v0.3 测试计划

> 本轮为 v0.3 Session 7 发布候选 QA，目标：确认 v0.3 所有功能可用，打包产物可正常加载。
> v0.2 继承的 40 项测试 (TC-01~TC-40) 仍然有效；v0.3 新增内容保真 QA (TC-41~TC-58)。

---

## 测试环境

| 项目 | 要求 |
|------|------|
| 浏览器 | Microsoft Edge >= 126 / Chrome >= 126（Chromium 内核）|
| 扩展模式 | 开发者模式，加载解压缩的扩展 |
| 加载路径 | `clipmate-v0.3/dist/` |
| Notion Token | 有效的 Integration Token（[创建地址](https://www.notion.so/my-integrations)）|
| 目标 Page | Token 有写入权限的 Notion 页面 |
| 测试页面 | 见各用例说明 |

---

## v0.2 继承测试用例 (TC-01 ~ TC-40)

> 以下测试用例继承自 v0.2 测试计划，在 v0.3 版本中同样需要验证。
> 版本号引用已更新为 v0.3 (0.3.0)。

### 一、安装与加载

#### TC-01：安装测试
**目标**：确认构建产物可被浏览器加载。
1. 打开 `edge://extensions`，开启「开发人员模式」
2. 点击「加载解压缩的扩展」，选择 `clipmate-v0.3/dist/`
3. 预期：扩展出现在列表中，名称为「ClipMate」，版本 `0.3.0`，无红色错误提示

#### TC-02：加载验证
**目标**：确认扩展所有入口页面可正常打开。
1. 确认工具栏出现 ClipMate 图标
2. 点击图标，Popup 正常弹出显示
3. 右键点击图标 →「扩展选项」，Options 页在标签页中打开

### 二、Options 设置页

- **TC-03** Notion Token 保存
- **TC-04** 添加 Notion 目标
- **TC-05** 编辑 Notion 目标
- **TC-06** 删除 Notion 目标
- **TC-07** 设置默认目标

### 三、Popup 剪藏

- **TC-08** Popup 默认目标选中
- **TC-09** Popup 切换目标保存
- **TC-10** 全文剪藏保存到 Notion
- **TC-11** 选区剪藏保存到 Notion
- **TC-12** 标签保存
- **TC-13** 备注保存
- **TC-14** 复制 Markdown

### 四、本地剪藏历史

- **TC-15** 保存成功写入历史
- **TC-16** 保存失败写入 failed 历史
- **TC-17** 历史搜索标题
- **TC-18** 历史搜索 URL/域名
- **TC-19** 历史搜索标签
- **TC-20** 历史搜索正文 — "正文匹配"
- **TC-21** 历史搜索备注 — "备注匹配"
- **TC-22** 历史复制 Markdown
- **TC-23** 历史删除单条
- **TC-24** 历史清空全部
- **TC-25** failed/unsaved 历史重试保存

### 五、History UI 体验

- **TC-26** favicon 真实图标优先
- **TC-27** favicon fallback 域名首字母
- **TC-28** 图片开篇摘要不显示 `![](...)`
- **TC-29** 同站多条历史左侧色条一致
- **TC-30** 同站不同文章 Popup 自动刷新
- **TC-31** 同页重复打开不丢失标签/备注

### 六、设置与存储

- **TC-32** 关闭历史记录后不写新历史
- **TC-33** historyLimit 裁剪逻辑

### 七、错误提示

- **TC-34** Token 缺失提示
- **TC-35** 目标缺失提示
- **TC-36** Notion API 失败提示

### 八、隐私与打包 (v0.3)

- **TC-37** 隐私检查：控制台无敏感信息
- **TC-38** Build 测试（dist/manifest.json version = 0.3.0）
- **TC-39** Zip 测试（clipmate-v0.3.zip）
- **TC-40** Zip 内容检查

---

## 九、v0.3 新增：内容保真 QA (TC-41 ~ TC-58)

### Markdown Target Profiles

#### TC-41：Markdown Target Selector
**目标**：确认 Popup 中可切换 Markdown 输出格式。
1. 打开任意文章页，点击 ClipMate 图标
2. 在 Popup 中点击 Markdown Target 下拉选择器
3. 依次选择 Notion / Obsidian / Typora / Generic
4. 预期：每个选项可正常选中，默认选中 Notion

#### TC-42：Notion profile 复制 Markdown
**目标**：确认 Notion profile 输出与 v0.2 一致。
1. 选择 Notion target，提取全文
2. 点击「复制 Markdown」
3. 粘贴到编辑器
4. 预期：标题 + URL + 标签 + 备注 + 分割线 + 正文，无 YAML frontmatter

#### TC-43：Obsidian profile 复制 Markdown (frontmatter)
1. 选择 Obisidian target，提取全文
2. 点击「复制 Markdown」
3. 预期：开头为 YAML frontmatter（`---\ntitle: ...\nsource: ...`），正文正常

#### TC-44：Typora profile 复制 Markdown
1. 选择 Typora target，提取全文
2. 预期：使用标准 Markdown 链接格式 `[text](url)`，无 YAML frontmatter

#### TC-45：Generic profile 复制 Markdown
1. 选择 Generic target，提取全文
2. 预期：最通用的 Markdown 格式，无特殊标记

### LaTeX 公式保留

#### TC-46：$...$ 内联公式保留
1. 打开含 `$E=mc^2$` 的数学页面（如维基百科数学条目）
2. 提取全文，查看 Markdown 输出
3. 预期：`$E=mc^2$` 完整保留，未变 `**` 或丢失

#### TC-47：$$...$$ 块级公式保留
1. 打开含 `$$\sum_{i=1}^n x_i$$` 的页面
2. 提取全文
3. 预期：`$$...$$` 块公式完整保留，双 `$` 未变身单 `$`

### Code Block Cleaner

#### TC-48：技术博客代码块语言保留
1. 打开一篇含代码块的 CSDN 或掘金技术博客
2. 提取全文，查看 Markdown 代码块
3. 预期：fenced code block 开头有语言名（如 ` ```python `），代码内容正常
4. 预期：无「Copy」「复制代码」「展开」「收起」等 UI 按钮文字混入

#### TC-49：代码块行号清理
1. 打开一篇含行号的代码块页面
2. 预期：行号前缀已被移除，代码逻辑正确

### Image / Link / Table Normalization

#### TC-50：图片 alt 和 URL 保留
1. 打开一篇含图文的文章（如微信公众号转载的博客）
2. 提取全文，查看 Markdown 图片语法
3. 预期：`![alt](url)` 格式，包含 alt 和图片 URL，无 `javascript:` 协议

#### TC-51：链接安全过滤
1. 打开包含 `javascript:void(0)` 链接的页面
2. 预期：不安全链接只保留链接文本，不生成 `[text](javascript:...)` 

#### TC-52：简单表格转 Markdown table
1. 打开一篇含简单表格（无合并单元格）的页面
2. 预期：输出 `| col1 | col2 |` 格式的 Markdown table

#### TC-53：复杂表格保守提示
1. 打开一篇含 colspan/rowspan 合并单元格的表格页面
2. 预期：显示 `*表格已简化*` 提示 + 纯文本

### Safe Markdown Preview

#### TC-54：原文 ↔ 预览切换
1. 在 Popup 中提取一篇文章
2. 点击预览/切换按钮
3. 预期：在 Markdown 原文和渲染预览之间切换，预览为纯文本渲染

#### TC-55：预览不执行 HTML
1. 提取含 `<script>alert(1)</script>` 或 `<img onerror>` 的页面
2. 在预览模式下查看
3. 预期：无弹窗，无远程图片加载，无 HTML 执行

### Article Boundary Guard

#### TC-56：导航/推荐/评论过滤
1. 打开一篇网易新闻文章页（含相关推荐、评论区）
2. 提取全文，查看正文和 markdown
3. 预期：正文中不包含导航栏文字、相关推荐文章标题、评论内容

#### TC-57：Markdown 尾部截断
1. 打开一篇底部含「责任编辑：xxx」「打开 App 阅读更多」「分享到微博」的新闻页
2. 提取全文
3. 预期：正文尾部不包含责任编辑、App 推荐、分享提示等噪音

#### TC-58：低置信页面提示
1. 打开一个导航页、搜索页或无正文的列表页
2. 触发提取
3. 预期：显示低置信提示，不输出大量无关链接

---

## 真实网页人工 QA 建议

| 网站 | 重点测试 | 对应 TC |
|------|----------|:---:|
| 网易新闻文章页 | 正文提取 + 尾部截断 + 推荐过滤 | TC-56, TC-57 |
| 新浪新闻文章页 | 广告/推荐过滤 | TC-56 |
| CSDN 技术博客 | 代码块清理 + 行号 | TC-48, TC-49 |
| 掘金技术博客 | 代码块语言保留 | TC-48 |
| GitHub README/Markdown 文档 | 表格 + 图片 + 链接 | TC-50~TC-53 |
| 维基百科数学页面 | LaTeX 公式保留 | TC-46, TC-47 |
| 百度搜索结果页 | 低置信提示 | TC-58 |

---

## 测试结果汇总表

| 编号 | 测试项 | 结果 | 备注 |
|------|--------|:---:|------|
| TC-01 | 安装测试 | ⬜ | v0.3 dist 加载 |
| TC-02 | 加载验证 | ⬜ | |
| TC-03 | Notion Token 保存 | ⬜ | |
| TC-04 | 添加 Notion 目标 | ⬜ | |
| TC-05 | 编辑 Notion 目标 | ⬜ | |
| TC-06 | 删除 Notion 目标 | ⬜ | |
| TC-07 | 设置默认目标 | ⬜ | |
| TC-08 | Popup 默认目标选中 | ⬜ | |
| TC-09 | Popup 切换目标保存 | ⬜ | |
| TC-10 | 全文剪藏保存到 Notion | ⬜ | |
| TC-11 | 选区剪藏保存到 Notion | ⬜ | |
| TC-12 | 标签保存 | ⬜ | |
| TC-13 | 备注保存 | ⬜ | |
| TC-14 | 复制 Markdown | ⬜ | |
| TC-15 | 保存成功写入历史 | ⬜ | |
| TC-16 | 保存失败写入 failed | ⬜ | |
| TC-17 | 历史搜索标题 | ⬜ | |
| TC-18 | 历史搜索 URL/域名 | ⬜ | |
| TC-19 | 历史搜索标签 | ⬜ | |
| TC-20 | 历史搜索正文 — 正文匹配 | ⬜ | |
| TC-21 | 历史搜索备注 — 备注匹配 | ⬜ | |
| TC-22 | 历史复制 Markdown | ⬜ | |
| TC-23 | 历史删除单条 | ⬜ | |
| TC-24 | 历史清空全部 | ⬜ | |
| TC-25 | failed/unsaved 重试保存 | ⬜ | |
| TC-26 | favicon 真实图标 | ⬜ | |
| TC-27 | favicon fallback 首字母 | ⬜ | |
| TC-28 | 图片开篇摘要清理 | ⬜ | |
| TC-29 | 同站色条一致 | ⬜ | |
| TC-30 | 同站不同文章自动刷新 | ⬜ | |
| TC-31 | 同页重复打开不丢失标签 | ⬜ | |
| TC-32 | 关闭历史不写新记录 | ⬜ | |
| TC-33 | historyLimit 裁剪 | ⬜ | |
| TC-34 | Token 缺失提示 | ⬜ | |
| TC-35 | 目标缺失提示 | ⬜ | |
| TC-36 | Notion API 失败提示 | ⬜ | |
| TC-37 | 控制台无敏感信息 | ⬜ | |
| TC-38 | Build 测试 | ⬜ | version=0.3.0 |
| TC-39 | Zip 测试 | ⬜ | clipmate-v0.3.zip |
| TC-40 | Zip 内容检查 | ⬜ | |
| TC-41 | Markdown Target Selector | ⬜ | v0.3 新增 |
| TC-42 | Notion profile 复制 Markdown | ⬜ | v0.3 新增 |
| TC-43 | Obisidian profile 复制（frontmatter）| ⬜ | v0.3 新增 |
| TC-44 | Typora profile 复制 | ⬜ | v0.3 新增 |
| TC-45 | Generic profile 复制 | ⬜ | v0.3 新增 |
| TC-46 | $...$ 内联公式保留 | ⬜ | v0.3 新增 |
| TC-47 | $$...$$ 块级公式保留 | ⬜ | v0.3 新增 |
| TC-48 | 代码块语言保留 + 噪音清理 | ⬜ | v0.3 新增 |
| TC-49 | 代码块行号清理 | ⬜ | v0.3 新增 |
| TC-50 | 图片 alt 和 URL 保留 | ⬜ | v0.3 新增 |
| TC-51 | 链接安全过滤 | ⬜ | v0.3 新增 |
| TC-52 | 简单表格转 Markdown table | ⬜ | v0.3 新增 |
| TC-53 | 复杂表格保守提示 | ⬜ | v0.3 新增 |
| TC-54 | 原文 ↔ 预览切换 | ⬜ | v0.3 新增 |
| TC-55 | 预览不执行 HTML | ⬜ | v0.3 新增 |
| TC-56 | 导航/推荐/评论过滤 | ⬜ | v0.3 新增 |
| TC-57 | Markdown 尾部截断 | ⬜ | v0.3 新增 |
| TC-58 | 低置信页面提示 | ⬜ | v0.3 新增 |
