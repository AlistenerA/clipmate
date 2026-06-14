# MANUAL_QA.md — ClipMate v0.4 手动 QA 汇总

> 汇总 v0.4 所有手动测试场景。默认全部待测（⬜），不要写已通过。
> 测试人员：用户
> 测试日期：____年__月__日

---

## 加载扩展

### Edge
1. 打开 `edge://extensions/`
2. 开启"开发人员模式"
3. 点击"加载解压缩的扩展"
4. 选择 `clipmate-v0.4/dist/` 目录

### Chrome
1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `clipmate-v0.4/dist/` 目录

---

## 1. Navigation Summary QA

> 详细场景见 `docs/NAVIGATION_SUMMARY_QA.md`

| 场景 | 结果 | 备注 |
|------|:---:|------|
| A — 搜索引擎结果页 | ⬜ | |
| B — 导航/目录页 | ⬜ | |
| C — 低正文高链接页面 | ⬜ | |
| D — 普通文章页（不触发） | ⬜ | |
| E — 视频页（不触发） | ⬜ | |
| F — 有选区页面（selection-first） | ⬜ | |
| G — 论坛/评论区（不触发） | ⬜ | |
| 隐私检查 | ⬜ | |

---

## 2. Comment / Selection QA

> 详细场景见 `docs/COMMENT_SELECTION_QA.md`

| 场景 | Edge | Chrome | 备注 |
|:---:|:---:|:---:|:---:|
| 1. 普通文章选区 | ⬜ | ⬜ | |
| 2. 论坛/评论区选区 | ⬜ | ⬜ | |
| 3. 视频简介选区 | ⬜ | ⬜ | |
| 4. 视频评论区选区 | ⬜ | ⬜ | |
| 5. 短视频标题选区 | ⬜ | ⬜ | |
| 6. AI 对话选区 | ⬜ | ⬜ | |
| 7. 无选区 | ⬜ | ⬜ | |

---

## 3. Site Visual QA

> 详细场景见 `docs/SITE_VISUAL_QA.md`

| 场景 | 结果 | 备注 |
|------|:---:|------|
| 1. 有 `<link rel="icon">` 的页面 | ⬜ | |
| 2. 只有 shortcut icon | ⬜ | |
| 3. 有 apple-touch-icon | ⬜ | |
| 4. 有 theme-color meta | ⬜ | |
| 5. 无 icon（fallback /favicon.ico） | ⬜ | |
| 6. 非法 icon URL | ⬜ | |
| 7. fullpage 剪藏 | ⬜ | |
| 8. selection 剪藏 | ⬜ | |

---

## 4. Link Card QA

> 详细场景见 `docs/LINK_CARD_QA.md`

| 场景 | 结果 | 备注 |
|------|:---:|------|
| 1. 当前页面 link card | ⬜ | |
| 2. 选中链接 link card | ⬜ | |
| 3. 导航页 link card | ⬜ | |
| 4. manual input link card | ⬜ | |
| 5. 非法 URL → null | ⬜ | |
| 6. 缺少 title/description | ⬜ | |
| 7. 有 siteIcon/themeColor | ⬜ | |
| 8. 无 siteIcon/themeColor | ⬜ | |
| 隐私检查 | ⬜ | |

---

## 5. Notion 保存基础 QA

| 操作 | 结果 | 备注 |
|------|:---:|------|
| 配置 Token 和 Page ID | ⬜ | |
| 全文剪藏保存到 Notion | ⬜ | |
| 选区剪藏保存到 Notion | ⬜ | |
| 多目标切换保存 | ⬜ | |
| Token 缺失提示 | ⬜ | |
| API 失败提示 | ⬜ | |

---

## 6. Markdown 复制基础 QA

| 操作 | 结果 | 备注 |
|------|:---:|------|
| 全文 Markdown 复制 | ⬜ | |
| 选区 Markdown 复制 | ⬜ | |
| Notion profile 输出 | ⬜ | |
| Obsidian profile 输出（YAML） | ⬜ | |
| Typora profile 输出 | ⬜ | |
| Generic profile 输出 | ⬜ | |
| 预览 ↔ 原文切换 | ⬜ | |

---

## 7. v0.4 新增功能 QA

| 检查项 | 结果 | 备注 |
|------|:---:|------|
| VQ-01：不同类型的页面剪藏行为有差异 | ⬜ | |
| VQ-02：搜索引擎结果页不提取全文 | ⬜ | |
| VQ-03：导航页生成链接摘要 | ⬜ | |
| VQ-04：评论区选区触发 warning | ⬜ | |
| VQ-05：视频页评论区选区触发 warning | ⬜ | |
| VQ-06：AI 对话页选区触发 warning | ⬜ | |
| VQ-07：favicon/themeColor 正常工作 | ⬜ | |
| VQ-08：复制 Markdown 正常 | ⬜ | |
| VQ-09：历史记录正常 | ⬜ | |
| VQ-10：Options 设置正常 | ⬜ | |

---

## 8. 隐私检查（汇总）

| 检查项 | 结果 |
|------|:---:|
| 不保存完整 DOM/HTML | ⬜ |
| 不保存评论全文 | ⬜ |
| 不保存正文全文到非预期位置 | ⬜ |
| 不泄露 Token/API Key/Page ID | ⬜ |
| 不发起非授权网络请求 | ⬜ |
| 不访问目标链接内容 | ⬜ |
| 不远程加载 JavaScript | ⬜ |

---

## 9. Session 8.1 B 站修复记录

| 检查项 | 修复状态 | 备注 |
|------|:---:|------|
| B 站全文剪藏不抓弹幕 | ✅ 已修复 | excludeSelectors + noise keywords |
| B 站选区剪藏正常检测 | ✅ 已修复 | 零宽字符剥离 + html 兜底 |
| 普通文章全文剪藏不受影响 | ✅ 自动化测试通过 | article-boundary-guard + content-parser tests |
| 普通文章选区剪藏不受影响 | ✅ 自动化测试通过 | selection-extractor tests |
| 弹幕通用过滤（非 B 站） | ✅ 已实现 | danmaku/danmu noise keywords |

---

## 已知限制

- Site Visual 不验证 favicon 可访问性
- Seed profile selector hints 为 seed 级别，可能不匹配所有站点
- 短视频/AI 对话页 DOM 高度动态
- Link Card Popup UI 未实现
- Tag Search UX 延后到 v0.5
- Better History Config 延后到 v0.5
- Playwright-assisted QA 是可选辅助链路，B 站复测仍以用户真实扩展操作为准
