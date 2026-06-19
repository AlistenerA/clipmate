# MANUAL_QA_RESULT_TEMPLATE.md — ClipMate v0.3 手动测试记录

> 逐项手动测试后填写。通过标记 [x]，失败标记 [ ] 并记录现象。
> v0.2 继承 40 项 (TC-01~TC-40) + v0.3 新增 18 项内容保真 QA (TC-41~TC-58)。

---

## 测试信息

- **测试日期**：2026.6.13
- **测试人员**：lu sir
- **Edge/Chrome 版本**：截图见用户本地 QA 记录，未提交到仓库。
- **构建产物**：`clipmate-v0.3/dist/`
- **Notion Token**：已配置
- **测试页面 1**：________
- **测试页面 2**：________

---

## 一、安装与加载

- [x] **TC-01 安装测试**：浏览器加载 `dist/` 成功，名称「ClipMate」，版本 `0.3.0`
  > 备注：(截图见用户本地 QA 记录，未提交到仓库)

- [x] **TC-02 加载验证**：工具栏图标正常，Popup 可打开，Options 可打开
  > 备注：(截图见用户本地 QA 记录，未提交到仓库)

---

## 二、Options 设置页

- [x] **TC-03 Notion Token 保存**：填写 Token → 保存 → 关闭重开 → Token 不丢失

> Session 8-B 修复：persistTargets 保存 Target 时同步保存 notionToken/defaultTags。**已复测通过。**

### TC-10 补充：Notion 富文本样式

> Session 8-C 新增：Notion 保存支持 Markdown inline 样式（**bold**/italic/`code`/[link](url)）转 Notion rich_text annotations。**需复测。**
>
> 修复前：第一次连续填写integration token和notion 保存目标后关闭设置页再打开只保存了notion保存目标
>
> (截图见用户本地 QA 记录，未提交到仓库)

- [x] **TC-04 添加 Notion 目标**：添加 → 填名称 + Page ID → 保存 → 出现在列表
- [x] **TC-05 编辑 Notion 目标**：编辑 → 修改名称/ID → 保存 → 更新正确
- [x] **TC-06 删除 Notion 目标**：删除非默认 → 成功；删默认 → 自动选新默认
- [x] **TC-07 设置默认目标**：设默认 → 标记转移 → 仅一个 isDefault=true

---

## 三、Popup 剪藏（TC-10有重要事项需修改）

- [x] **TC-08 Popup 默认目标选中**：Popup 目标下拉框默认选中默认目标
- [x] **TC-09 Popup 切换目标保存**：切换目标 → 保存 → 内容到正确 Notion 页面
- [x] **TC-10 全文剪藏保存**：全文 → 加标签/备注 → 保存成功 → Notion 内容完整
  - 保存耗时：约0.x秒

  - > Session 8-B 修复：assessArticleConfidence 重写，不再因高 linkDensity 单条件误判新闻页为低置信。需真实网页复测。
    >
    > 修复前：v0.3 读取不到正文，Popup 出现大量链接摘要；v0.2 读取正常。
    >
    > (截图见用户本地 QA 记录，未提交到仓库)
- [x] **TC-11 选区剪藏保存**：选中文字 → 选区模式 → 保存成功

  - 选中字数：450字

  - > Session 8-B 修复：选区模式 Markdown 复制和 Notion 保存均新增"网页选区摘录"提示（> 注：以下内容为网页选区摘录，并非全文。）。**需复测。**
    >
    > 修复前反馈：(截图见用户本地 QA 记录，未提交到仓库)
    >
    > (截图见用户本地 QA 记录，未提交到仓库)
- [x] **TC-12 标签保存**：添加标签 → 保存 → Notion 中蓝色标签文字正确

> (截图见用户本地 QA 记录，未提交到仓库)

- [x] **TC-13 备注保存**：填写备注 → 保存 → Notion 中 callout 正确

> (截图见用户本地 QA 记录，未提交到仓库)

- [x] **TC-14 复制 Markdown**：复制 → 粘贴 → 标题/URL/标签/备注/分割线/正文完整

> Session 8-B 修复：(1) normalizeSelectionHtml 确保选区首段块级包裹，改善首段换行；(2) useCopyMarkdown.resetCopy 在切换 profile/重新提取时重置复制状态。**需复测。**
>
> 修复前反馈：选区复制后导入typora第一段没有正确换行；切换obsidian输出时复制按钮仍显示"已复制"。

---

## 四、本地剪藏历史

- [x] **TC-15 保存成功写入历史** ~ **TC-25 failed/unsaved 历史重试保存**

> 写入到notion的历史保存了，但是全文写入typora和obsidian的没写入（不是说要把选区和全文混在一起，只是说现阶段如果用户以typora或者obsidian格式复制了md全文时需要记录，可以在用户选择输出typora或者obsidian个时候改变保存到notion这个按钮，改为保存文档按钮，点击后可选择windows目录，分别记忆之前一次的该模式下typora或者obsidian目录，并在用户选定后直接在该目录保存为md文件），还有历史中没有选区写入记录（这个可以另立一栏，比如最近复制历史，这里面要有全文复制和选区复制的最近历史）
>
> (截图见用户本地 QA 记录，未提交到仓库)

---

## 五、History UI 体验

- [x] **TC-26 favicon 真实图标优先** ~ **TC-31 同页重复打开不丢失标签/备注**

---

## 六、设置与存储

- [x] **TC-32 关闭历史不写新记录** / **TC-33 historyLimit 裁剪**

---

## 七、错误提示

- [x] **TC-34 Token 缺失** / **TC-35 目标缺失** / **TC-36 Notion API 失败**

---

## 八、隐私与打包

- [x] **TC-37 隐私检查**：Console 无 Token / 正文全文 / 备注全文 / 完整 Markdown
- [x] **TC-38 Build 测试**：`npm run build` 成功，dist/manifest.json version=0.3.0
- [x] **TC-39 Zip 测试**：`npm run zip` 成功，clipmate-v0.3.zip 生成
- [x] **TC-40 Zip 内容检查**：zip 仅含 dist，无源码/测试/文档/node_modules/.env

---

## 九、v0.3 新增：内容保真 QA

### Markdown Target Profiles

- [x] **TC-41 Markdown Target Selector**：Popup 中可切换 Notion/Obsidian/Typora/Generic
  > 备注：(截图见用户本地 QA 记录，未提交到仓库)

- [ ] **TC-42 Notion profile 复制 Markdown**：选择 Notion → 复制 → 格式与 v0.2 一致
  > 备注：v0.2格式没有仔细研究，但是实测下来复制的格式有点小问题，详见TC-10和TC-14等

- [x] **TC-43 Obsidian profile 复制（YAML frontmatter）**：选择 Obsidian → 复制 → 含 `---\ntitle: ...`

  > 备注：(截图见用户本地 QA 记录，未提交到仓库)

- [x] **TC-44 Typora profile 复制**：选择 Typora → 标准链接格式
  > 备注：(截图见用户本地 QA 记录，未提交到仓库)

- [x] **TC-45 Generic profile 复制**：选择 Generic → 最通用格式
  > 备注：

### LaTeX 公式保留：Session 8-B 已修复表格 cell 公式去重 + 块公式 trailing digits 清理

原网页：[Latex数学公式符号大全（超详细）_latex数学符号-CSDN博客](https://blog.csdn.net/Yushan_Ji/article/details/134322574)

- [x] **TC-46 $...$ 内联公式保留**：打开数学页面 → `$E=mc^2$` 完整保留
  - 测试页面：________
  > 备注：Session 8-B 已修复 CSDN LaTeX 表格 cell 公式粘连问题（α\alphaα → α）。**需复测。**

- [x] **TC-47 $$...$$ 块级公式保留**：`$$\sum...$$` 双 $ 不变单 $
  - 测试页面：________
  > 备注：Session 8-B 已修复块公式 trailing digits（$$\begin{bmatrix}...\end{bmatrix}$$3→无3）。**需复测。**

### Code Block Cleaner：Session 8-B 已增强 CSDN 噪音过滤

- [x] **TC-48 代码块语言保留 + 噪音清理**：技术博客 → fenced code block 有语言名 + 无 Copy/复制代码

  - 测试页面：________
  > 备注：Session 8-B 扩展 NOISE_CSS_KEYWORDS（article-bar-bottom/copyright-box/blog-tags-box/目录/版权）。**需复测。**

- [x] **TC-49 代码块行号清理**：行号前缀已移除
  > 备注：**需复测。**

### Image / Link / Table Normalization：根据文档自动审查，所有审查项如果缺失请告知我，我会补充

- [ ] **TC-50 图片 alt 和 URL 保留**：`![alt](url)` 格式，无 javascript: 协议
- [ ] **TC-51 链接安全过滤**：`javascript:void(0)` 只保留文本
- [ ] **TC-52 简单表格转 Markdown table**：`| col |` 格式正常
- [ ] **TC-53 复杂表格保守提示**：含 colspan/rowspan → `*表格已简化*` 提示

### Safe Markdown Preview

- [x] **TC-54 原文 ↔ 预览切换**：正常切换，预览为纯文本渲染

> Session 8-B 修复：默认优先显示预览模式（showPreview=true），仍可切换原文。**需复测。**

- [x] **TC-55 预览不执行 HTML**：无弹窗、无远程图片加载

### Article Boundary Guard

- [x] **TC-56 导航/推荐/评论过滤**：新闻页 → 无导航栏/推荐标题/评论污染
  - 测试页面：[Latex数学公式符号大全（超详细）_latex数学符号-CSDN博客](https://blog.csdn.net/Yushan_Ji/article/details/134322574)
  > 备注：Session 8-B 新增 CSDN 噪音关键词（article-bar-bottom/copyright-box/blog-tags-box/column-group/second-recommend/目录/版权）。**需复测。**

- [x] **TC-57 Markdown 尾部截断**：无「责任编辑」「打开 App」「分享到」等噪音
  - 测试页面：[Latex数学公式符号大全（超详细）_latex数学符号-CSDN博客](https://blog.csdn.net/Yushan_Ji/article/details/134322574)
  > 备注：Session 8-B assessArticleConfidence 重写 + CSDN 噪音扩展，正文完整性应改善。**需复测。**

- [x] **TC-58 低置信页面提示**：导航页/搜索页 → 显示提示，无大量链接
  - 测试页面：
  > 备注：Session 8-C 新增 classifyPageType 区分搜索/导航/文章页 + 差异化低置信提示。搜索页/导航页分类效果仍不理想，**挂起到 v0.4+**，不阻塞 v0.3。需复测。

---

## 十一、Session 8-D 选区优先模式补充

- [x] **TC-11b 选区优先模式**：有选区时打开 Popup 自动进入选区模式
  > 备注：Session 8-D 修复 Popup 初始化逻辑，每次打开先检查 selection，有选区则优先 selection（不被旧 fullpage draft 覆盖）。**需复测。**

---

## 十二、总体评估

- 通过 / 未通过的用例：____ / 58
- 阻塞问题：无
- Session 8-D 已完成 Popup 选区优先 + 已知问题归档 + 文档脱敏
- CSDN/LaTeX 站点渲染残留 → v0.4+
- 搜索页/导航页分类优化 → v0.4+
- 本地保存 .md / 复制历史 → v0.4+
- 是否可以提交 Edge Add-ons 审核：待选区优先复测后决定

> 签名：________  日期：____年__月__日
