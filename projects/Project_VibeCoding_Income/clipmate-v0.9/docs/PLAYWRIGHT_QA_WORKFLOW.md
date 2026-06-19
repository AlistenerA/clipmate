# PLAYWRIGHT_QA_WORKFLOW.md — ClipMate v0.4 Playwright QA 辅助工作流

> 本文档定义 Playwright 在 ClipMate v0.4 QA 阶段的使用边界、执行流程和输出规范。
> Playwright 仅作为 QA 辅助工具，不替代用户最终人工确认。

---

## 1. 用途定位

Playwright 是 QA 辅助链路，用于：

- 观察公开网页 DOM / 截图 / 页面状态
- 辅助复现剪藏问题
- 辅助验证插件加载后的可见行为
- 辅助生成 bug 复现记录
- 辅助人工 QA，但不替代用户最终确认

Playwright 不用于：

- 功能开发
- 点击扩展 Popup 内部 UI（Playwright 无法直接访问 extension:// 页面）
- 自动化 extension 加载/卸载
- 商店提交材料生成

---

## 2. 允许使用场景

| 场景 | 说明 |
|------|------|
| 用户明确指定的公开测试网页 | 搜索引擎、公开博客、公开视频页等 |
| 本地 fixture 页面 | HTML 文件用于复现剪藏逻辑 |
| 页面 selection 验证 | 通过 Playwright 模拟选中文本 |
| DOM 噪声区域识别 | 观察 danmu/评论/导航/广告 容器 |
| 截图用于描述 UI 问题 | 但不得包含 token/page id/账号信息 |
| 页面类型检测验证 | 验证 classifyPageType 输出 |
| 正文边界验证 | 验证 Readability 提取结果是否包含预期内容 |

---

## 3. 禁止使用场景

1. 不访问用户私密页面
2. 不访问 Notion 私密页面
3. 不读取或截图 token/API key/page id
4. 不自动填写真实 token
5. 不自动提交 Notion 保存
6. 不自动提交 Edge/Chrome 商店审核
7. 不爬取大量页面
8. 不绕过登录/验证码/权限
9. 不访问或保存真实用户正文、评论、账号信息
10. 不作为商店审核通过的证据
11. 不修改 `.playwright-mcp` 配置
12. 不新增项目依赖（Playwright 由用户环境提供）

---

## 4. 执行链路

后续 agent 使用 Playwright 辅助 QA 时，按以下顺序工作：

```
Step 1：执行 git status 和版本检查，确认工作区干净。
Step 2：确认用户允许使用 Playwright 的页面 URL 或本地 fixture。
Step 3：使用 Playwright 观察页面结构或截图。
Step 4：记录只包含必要信息的复现摘要。
Step 5：不保存完整 DOM，不保存正文全文。
Step 6：如果发现问题，回到代码修复 Session。
Step 7：修复后仍需用户重新加载 dist/ 并人工确认。
```

**前置条件：**
- 用户已明确授权使用 Playwright 访问指定 URL
- Playwright 由用户环境提供，agent 不运行 `npx playwright install`
- 不修改 `.playwright-mcp` 配置

---

## 5. Bilibili QA 专项（v0.4 Session 8.1 修复复测）

### 复测目标

确认 S8.1 修复后 B 站视频页行为符合预期：
1. 全文剪藏不包含弹幕（danmaku/danmu）文本
2. 普通文本选区返回选区内容
3. 评论区选区只返回选中评论，不抓取整个评论区
4. selection-first 不变：有选区时优先选区

### 建议步骤

1. 打开用户指定的公开 B 站视频页
2. 通过 Playwright 观察弹幕容器是否存在 danmu/danmaku/bpx-player 等结构
3. 不保存真实弹幕全文
4. 让用户手动完成：
   - 全文剪藏 → 检查生成的 Markdown 不含弹幕文本
   - 普通文本选区 → 检查选区内容正确
   - 评论区选区 → 检查只返回选中评论
5. Playwright 观察结果只能作为辅助，最终以用户真实扩展操作结果为准

### 隐私注意

- 不记录 B 站视频的弹幕全文
- 不记录评论全文
- 不记录用户账号信息
- 截图如需保留，确认不包含 token/page id

---

## 6. 输出格式

agent 使用 Playwright 后必须输出以下格式：

```
【Playwright 使用范围】
- 页面：
- 是否公开页面：
- 是否涉及登录/隐私：
- 是否截图：
- 是否记录 DOM：
- 是否记录真实正文/评论：
- 是否发现 token/page id：

【观察结果】
- 页面类型：
- 关键 DOM 区域：
- 可能噪声区域：
- 与 ClipMate 相关的判断：

【仍需用户确认】
-
```

---

## 7. 安全底线

- 所有 Playwright 操作必须遵守 WORKFLOW_RULES.md 的永久安全底线
- 不记录、不截图、不存储 token/API key/page id/账号信息
- 不保存完整 DOM/正文/评论
- 不绕过用户授权
- 不替代用户最终人工 QA 判断
