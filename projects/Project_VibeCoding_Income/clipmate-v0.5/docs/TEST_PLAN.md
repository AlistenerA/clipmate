# TEST_PLAN.md — ClipMate v0.5 测试计划

> 本轮为 v0.5 Session 6 发布候选 QA，目标：确认 v0.5 所有功能可用，打包产物可正常加载。
> v0.2~v0.4 继承的测试用例仍然有效；v0.5 新增文章图片保存 QA (TC-59~TC-73)。

---

## 测试环境

| 项目 | 要求 |
|------|------|
| 浏览器 | Microsoft Edge >= 126 / Chrome >= 126（Chromium 内核）|
| 扩展模式 | 开发者模式，加载解压缩的扩展 |
| 加载路径 | `clipmate-v0.5/dist/` |
| Notion Token | 有效的 Integration Token（[创建地址](https://www.notion.so/my-integrations)）|
| 目标 Page | Token 有写入权限的 Notion 页面 |
| 测试页面 | 见各用例说明 |

---

## v0.2~v0.4 继承测试用例 (TC-01 ~ TC-58)

> 以下测试用例继承自 v0.2/v0.3/v0.4 测试计划，在 v0.5 版本中同样需要验证。
> 版本号引用已更新为 v0.5 (0.5.0)。

### 一、安装与加载

#### TC-01：安装测试
**目标**：确认构建产物可被浏览器加载。
1. 打开 `edge://extensions`，开启「开发人员模式」
2. 点击「加载解压缩的扩展」，选择 `clipmate-v0.5/dist/`
3. 预期：扩展出现在列表中，名称为「ClipMate」，版本 `0.5.0`，无红色错误提示

#### TC-02：加载验证
**目标**：确认扩展所有入口页面可正常打开。
1. 确认工具栏出现 ClipMate 图标
2. 点击图标，Popup 正常弹出显示
3. 右键点击图标 →「扩展选项」，Options 页在标签页中打开

### 二~八、继承测试（TC-03 ~ TC-58）

> TC-03~TC-58 同 v0.4 TEST_PLAN.md 中列出的测试用例，包括：
> - Options 设置页（TC-03~TC-07）
> - Popup 剪藏（TC-08~TC-14）
> - 本地剪藏历史（TC-15~TC-25）
> - History UI 体验（TC-26~TC-31）
> - 设置与存储（TC-32~TC-33）
> - 错误提示（TC-34~TC-36）
> - 隐私与打包（TC-37~TC-40）
> - Markdown Target Profiles（TC-41~TC-45）
> - LaTeX 公式保留（TC-46~TC-47）
> - Code Block Cleaner（TC-48~TC-49）
> - Image/Link/Table Normalization（TC-50~TC-53）
> - Safe Markdown Preview（TC-54~TC-55）
> - Article Boundary Guard（TC-56~TC-58）

---

## 九、v0.5 新增：文章图片保存 QA (TC-59 ~ TC-73)

### 文章图片提取

#### TC-59：正文图片保留到 Markdown
**目标**：确认新闻文章的正文图片保留在 Markdown 输出中。
1. 打开一篇含多张正文图片的新闻文章（如新浪/网易新闻）
2. 提取全文，查看 Markdown 输出
3. 预期：Markdown 中包含 `![alt](url)` 图片语法，正文图片按原顺序排列

#### TC-60：噪声图片过滤
**目标**：确认 avatar/icon/logo/favicon/emoji/tracking pixel 等噪声图片被正确过滤。
1. 打开一篇含用户头像、网站 logo、社交媒体图标的技术博客
2. 提取全文
3. 预期：Markdown 中不包含头像/logo/图标/1x1 像素等噪声图片

#### TC-61：图片去重
**目标**：确认重复图片 URL 只保留一次。
1. 打开一篇多处引用同一图片的页面
2. 提取全文
3. 预期：重复图片 URL 只出现一次

#### TC-62：图片题注（caption）
**目标**：确认 figure/figcaption 的题注正确保留。
1. 打开一篇含 `<figure><img><figcaption>说明文字</figcaption></figure>` 的博客
2. 提取全文，查看 Markdown
3. 预期：图片题注作为独立斜体文本 `*说明文字*` 出现在图片下方

### Notion External Image Block

#### TC-63：Notion 保存含图片
**目标**：确认图片以 external image block 方式保存到 Notion。
1. 打开一篇新闻文章，提取全文
2. 点击「保存到 Notion」
3. 打开 Notion 目标页面
4. 预期：正文图片在 Notion 中显示为 image block（external URL），图片和文字交错排列

#### TC-64：不兼容 URL 降级
**目标**：确认代理/resize 型图片 URL 降级为文本链接，不影响正文保存。
1. 打开一篇使用图片代理服务的文章（如 Sina 的 img.mix.sina.com.cn 代理 URL）
2. 保存到 Notion
3. 预期：正文完整保存，不兼容 URL 降级为文本链接而非 broken image

#### TC-65：图片 block 失败不阻断正文
**目标**：确认即使图片转换失败，正文段落也完整保存。
1. 保存含 data: URI 图片的页面到 Notion
2. 预期：正文段落完整保存，data: URI 图片降级为文本

### Popup/History 图片元数据

#### TC-66：Popup 图片数量徽章
**目标**：确认 Popup 中显示图片数量。
1. 打开一篇含多张图片的文章，点击图标
2. 预期：Popup 底部 StatusBar 显示紫色「图片 N」徽章

#### TC-67：选区模式不显示图片
**目标**：确认选区/评论模式不显示图片数量。
1. 选中一段文字后点击图标
2. 预期：Popup 不显示图片数量徽章，imageCount=0

#### TC-68：History 图片数量标签
**目标**：确认 History 中显示图片数量。
1. 保存一篇含图片的文章到 Notion
2. 打开 Options →「剪藏历史」
3. 预期：该条历史记录显示紫色「图片 N」标签

### 图片边缘情况

#### TC-69：无图片页面
**目标**：确认纯文字页面不影响正常功能。
1. 打开一篇纯文字文章（无图片）
2. 提取全文、保存到 Notion
3. 预期：功能正常，无图片相关异常

#### TC-70：懒加载图片
**目标**：确认 CSDN-like 页面懒加载图片正确处理。
1. 打开一篇 CSDN 或掘金技术博客（含懒加载图片）
2. 提取全文，查看 Markdown
3. 预期：正文图片 URL 正确提取（Turndown img rule 处理 data-src）

#### TC-71：Data/blob URI 图片过滤
**目标**：确认 data: / blob: URI 图片被过滤，不进入 Markdown/Notion。
1. 打开含 data: URI 或 blob: URI 图片的页面
2. 提取全文
3. 预期：Markdown 中不包含 data:/blob: URI，Notion 保存正常

#### TC-72：selection 模式回归
**目标**：确认 selection 和 comment-context 模式不受图片功能影响。
1. 选中一段含图区域文字，点击图标
2. 预期：选区正文正确提取，不含图片语法

#### TC-73：图片数量过多页面
**目标**：确认图片超过 maxImages=20 限制时功能正常。
1. 打开一篇含 30+ 图片的页面
2. 提取全文
3. 预期：最多保留 20 张图片，功能正常，不报错

---

## 真实网页人工 QA 建议

| 网站 | 重点测试 | 对应 TC |
|------|----------|:---:|
| 新浪新闻文章页 | 正文图片提取 + 噪声过滤 + Notion external image block | TC-59, TC-60, TC-63 |
| 网易新闻文章页 | 正文提取 + 尾部截断 + 图片保留 | TC-56, TC-57, TC-59 |
| CSDN 技术博客 | 懒加载图片 + 代码块清理 | TC-48, TC-49, TC-70 |
| Medium/博客 | figure/figcaption 图片 + 题注 | TC-62 |
| 掘金技术博客 | 头像/logo 噪声过滤 | TC-60 |
| GitHub README | 文档图片 + 表格 + 链接 | TC-50~TC-53 |
| 维基百科 | LaTeX 公式 + 图片 | TC-46, TC-47 |
| 百度搜索结果页 | 低置信提示 | TC-58 |

---

## 测试结果汇总表

| 编号 | 测试项 | 结果 | 备注 |
|------|--------|:---:|------|
| TC-01 | 安装测试 | ⬜ | v0.5 dist 加载 |
| TC-02 | 加载验证 | ⬜ | |
| — | TC-03~TC-58 | ⬜ | 继承 v0.2~v0.4 测试 |
| TC-59 | 正文图片保留到 Markdown | ⬜ | v0.5 新增 |
| TC-60 | 噪声图片过滤 | ⬜ | v0.5 新增 |
| TC-61 | 图片去重 | ⬜ | v0.5 新增 |
| TC-62 | 图片题注 caption | ⬜ | v0.5 新增 |
| TC-63 | Notion 保存含图片 | ⬜ | v0.5 新增 |
| TC-64 | 不兼容 URL 降级 | ⬜ | v0.5 新增 |
| TC-65 | 图片 block 失败不阻断正文 | ⬜ | v0.5 新增 |
| TC-66 | Popup 图片数量徽章 | ⬜ | v0.5 新增 |
| TC-67 | 选区模式不显示图片 | ⬜ | v0.5 新增 |
| TC-68 | History 图片数量标签 | ⬜ | v0.5 新增 |
| TC-69 | 无图片页面 | ⬜ | v0.5 新增 |
| TC-70 | 懒加载图片 | ⬜ | v0.5 新增 |
| TC-71 | Data/blob URI 图片过滤 | ⬜ | v0.5 新增 |
| TC-72 | selection 模式回归 | ⬜ | v0.5 新增 |
| TC-73 | 图片数量过多页面 | ⬜ | v0.5 新增 |
| TC-37 | 控制台无敏感信息 | ⬜ | |
| TC-38 | Build 测试 | ⬜ | version=0.5.0 |
| TC-39 | Zip 测试 | ⬜ | clipmate-v0.5.zip |
| TC-40 | Zip 内容检查 | ⬜ | |
