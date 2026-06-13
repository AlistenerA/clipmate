# MANUAL_QA_RESULT_TEMPLATE.md — ClipMate v0.3 手动测试记录

> 逐项手动测试后填写。通过标记 [x]，失败标记 [ ] 并记录现象。
> v0.2 继承 40 项 (TC-01~TC-40) + v0.3 新增 18 项内容保真 QA (TC-41~TC-58)。

---

## 测试信息

- **测试日期**：____年__月__日
- **测试人员**：________
- **Edge/Chrome 版本**：________
- **构建产物**：`clipmate-v0.3/dist/`
- **Notion Token**：已配置 / 未配置
- **测试页面 1**：________
- **测试页面 2**：________

---

## 一、安装与加载

- [ ] **TC-01 安装测试**：浏览器加载 `dist/` 成功，名称「ClipMate」，版本 `0.3.0`
  > 备注：

- [ ] **TC-02 加载验证**：工具栏图标正常，Popup 可打开，Options 可打开
  > 备注：

---

## 二、Options 设置页

- [ ] **TC-03 Notion Token 保存**：填写 Token → 保存 → 关闭重开 → Token 不丢失
- [ ] **TC-04 添加 Notion 目标**：添加 → 填名称 + Page ID → 保存 → 出现在列表
- [ ] **TC-05 编辑 Notion 目标**：编辑 → 修改名称/ID → 保存 → 更新正确
- [ ] **TC-06 删除 Notion 目标**：删除非默认 → 成功；删默认 → 自动选新默认
- [ ] **TC-07 设置默认目标**：设默认 → 标记转移 → 仅一个 isDefault=true

---

## 三、Popup 剪藏

- [ ] **TC-08 Popup 默认目标选中**：Popup 目标下拉框默认选中默认目标
- [ ] **TC-09 Popup 切换目标保存**：切换目标 → 保存 → 内容到正确 Notion 页面
- [ ] **TC-10 全文剪藏保存**：全文 → 加标签/备注 → 保存成功 → Notion 内容完整
  - 保存耗时：约____秒
- [ ] **TC-11 选区剪藏保存**：选中文字 → 选区模式 → 保存成功
  - 选中字数：________
- [ ] **TC-12 标签保存**：添加标签 → 保存 → Notion 中蓝色标签文字正确
- [ ] **TC-13 备注保存**：填写备注 → 保存 → Notion 中 callout 正确
- [ ] **TC-14 复制 Markdown**：复制 → 粘贴 → 标题/URL/标签/备注/分割线/正文完整

---

## 四、本地剪藏历史

- [ ] **TC-15 保存成功写入历史** ~ **TC-25 failed/unsaved 历史重试保存**

---

## 五、History UI 体验

- [ ] **TC-26 favicon 真实图标优先** ~ **TC-31 同页重复打开不丢失标签/备注**

---

## 六、设置与存储

- [ ] **TC-32 关闭历史不写新记录** / **TC-33 historyLimit 裁剪**

---

## 七、错误提示

- [ ] **TC-34 Token 缺失** / **TC-35 目标缺失** / **TC-36 Notion API 失败**

---

## 八、隐私与打包

- [ ] **TC-37 隐私检查**：Console 无 Token / 正文全文 / 备注全文 / 完整 Markdown
- [ ] **TC-38 Build 测试**：`npm run build` 成功，dist/manifest.json version=0.3.0
- [ ] **TC-39 Zip 测试**：`npm run zip` 成功，clipmate-v0.3.zip 生成
  - Zip 大小：________
- [ ] **TC-40 Zip 内容检查**：zip 仅含 dist，无源码/测试/文档/node_modules/.env

---

## 九、v0.3 新增：内容保真 QA

### Markdown Target Profiles

- [ ] **TC-41 Markdown Target Selector**：Popup 中可切换 Notion/Obsidian/Typora/Generic
  > 备注：

- [ ] **TC-42 Notion profile 复制 Markdown**：选择 Notion → 复制 → 格式与 v0.2 一致
  > 备注：

- [ ] **TC-43 Obsidian profile 复制（YAML frontmatter）**：选择 Obsidian → 复制 → 含 `---\ntitle: ...`
  > 备注：

- [ ] **TC-44 Typora profile 复制**：选择 Typora → 标准链接格式
  > 备注：

- [ ] **TC-45 Generic profile 复制**：选择 Generic → 最通用格式
  > 备注：

### LaTeX 公式保留

- [ ] **TC-46 $...$ 内联公式保留**：打开数学页面 → `$E=mc^2$` 完整保留
  - 测试页面：________
  > 备注：

- [ ] **TC-47 $$...$$ 块级公式保留**：`$$\sum...$$` 双 $ 不变单 $
  - 测试页面：________
  > 备注：

### Code Block Cleaner

- [ ] **TC-48 代码块语言保留 + 噪音清理**：技术博客 → fenced code block 有语言名 + 无 Copy/复制代码
  - 测试页面：________
  > 备注：

- [ ] **TC-49 代码块行号清理**：行号前缀已移除
  > 备注：

### Image / Link / Table Normalization

- [ ] **TC-50 图片 alt 和 URL 保留**：`![alt](url)` 格式，无 javascript: 协议
- [ ] **TC-51 链接安全过滤**：`javascript:void(0)` 只保留文本
- [ ] **TC-52 简单表格转 Markdown table**：`| col |` 格式正常
- [ ] **TC-53 复杂表格保守提示**：含 colspan/rowspan → `*表格已简化*` 提示

### Safe Markdown Preview

- [ ] **TC-54 原文 ↔ 预览切换**：正常切换，预览为纯文本渲染
- [ ] **TC-55 预览不执行 HTML**：无弹窗、无远程图片加载

### Article Boundary Guard

- [ ] **TC-56 导航/推荐/评论过滤**：新闻页 → 无导航栏/推荐标题/评论污染
  - 测试页面：________
  > 备注：

- [ ] **TC-57 Markdown 尾部截断**：无「责任编辑」「打开 App」「分享到」等噪音
  - 测试页面：________
  > 备注：

- [ ] **TC-58 低置信页面提示**：导航页/搜索页 → 显示提示，无大量链接
  - 测试页面：________
  > 备注：

---

## 十、总体评估

- 通过 / 未通过的用例：____ / 58
- 阻塞问题：有 / 无
- 是否可以进入 v0.3 Session 8 鲁棒性检查：是 / 否
- 是否可以提交 Edge Add-ons 审核：是 / 否

> 签名：________  日期：____年__月__日
