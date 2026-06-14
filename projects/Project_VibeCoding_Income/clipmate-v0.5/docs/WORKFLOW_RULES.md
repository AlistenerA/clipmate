# WORKFLOW_RULES.md — ClipMate 跨版本 Agent 工作流规则

> 本文件适用于 ClipMate v0.2、v0.2.x、v0.3、v0.4 及后续版本开发。
> 
> 本文件是通用规则，不是具体 Session 任务。后续用户发送的专用 Session Prompt、Bug Prompt、Commit Prompt 优先级高于本文件。
> 
> 但安全底线永远不能被覆盖。

---

## 1. 规则定位

本文件是 ClipMate 项目跨版本通用工作流规则。每次新版本启动时，应从上一个稳定版本复制本文件到新版本目录。

本文件提供统一的开发、审查、提交规范，降低多轮 agent 开发中上下文丢失和跑偏风险。

---

## 2. 优先级规则

优先级从高到低：

1. 用户当前明确指令
2. 当前专用 Session Prompt / Bug Prompt / Commit Prompt
3. 当前版本文档，例如 V0.2_PLAN.md、V0.3_HANDOFF.md
4. WORKFLOW_RULES.md
5. 历史文档和 agent 记忆

当通用规则与具体任务冲突时：
- 功能范围、文件范围、实现顺序、测试重点，以具体任务为准；
- 隐私、安全、提交范围、真实 Token、禁止 push、禁止 git add . 等底线，以安全底线为准。

---

## 3. 永久安全底线

- 不写入、提交、打印真实 Notion Token、API Key、账号密码、真实 Page ID。
- 不提交 .env、node_modules、dist、build、zip、.git、真实用户数据。
- 不修改 .wolf、.opencode、.playwright-mcp，除非用户明确要求。
- 不在 console/logger/docs/tests 中输出 Token、正文全文、备注全文、完整 Markdown、完整 settings 对象、完整 message request。
- 不使用 git add .
- 不 push。
- 不为了通过测试而删除测试、降低测试、隐藏失败。
- 不在未授权情况下新增 manifest 权限。
- 不远程加载或执行 JavaScript。
- 不一次性重构全项目。

---

## 4. 版本目录隔离规则

- `clipmate-v0.1/` 是 v0.1 冻结快照，除非用户明确要求修补 v0.1，否则禁止修改。
- `clipmate-v0.2/` 是 v0.2 版本目录。
- `clipmate-v0.2.1/`、`clipmate-v0.3/` 等后续目录只在用户明确要求新版本启动时创建。
- 不要每个 Session 创建一个新目录，只在版本号变化时创建新目录。
- 新版本应从上一个稳定版本复制，而不是直接在旧版本目录中混写。
- 新版本创建后，必须更新 AGENT_CONTEXT、CURRENT_STATUS、CHANGELOG_AGENT、TEST_LOG、ISSUES、DECISIONS 和对应版本计划文档。

---

## 5. 每轮开始规则

每轮开始必须先做：

```bash
git branch --show-current
git status --short
git log --oneline -5
```

并读取当前版本目录下的必要文档：

```text
docs/AGENT_CONTEXT.md
docs/CURRENT_STATUS.md
docs/DECISIONS.md
docs/CHANGELOG_AGENT.md
docs/TEST_LOG.md
docs/ISSUES.md
```

如涉及版本规划，还要读：

```text
docs/V0.2_PLAN.md
docs/V0.3_HANDOFF.md
docs/WORKFLOW_RULES.md
```

不要读取无关大目录：

```text
node_modules/
dist/
build/
.git/
```

---

## 6. 每轮结束规则

每轮结束必须更新：

```text
CURRENT_STATUS.md
CHANGELOG_AGENT.md
TEST_LOG.md
ISSUES.md
DECISIONS.md
```

如果涉及版本规划，还要更新对应版本计划文档。

结束输出必须包含：

```text
【当前分支】
【本轮完成情况】
【修改文件列表】
【新增/更新测试】
【运行命令和结果】
【是否影响 manifest 权限】
【是否修改 package/manifest 版本号】
【是否误生成或误提交 dist/build/zip/node_modules/.env/工具目录】
【当前 git status --short】
【是否需要人工测试】
【是否建议 commit】
【建议 commit message】
```

---

## 7. Git commit 规则

默认不 commit。只有用户明确要求 git commit 时才允许 commit。

commit 前必须执行：

```bash
git status --short
git diff --stat
git diff --cached --stat
```

必须精确 stage，不允许使用：

```bash
git add .
```

禁止提交：

```text
dist/
build/
node_modules/
.env
.env.*
*.zip
.git/
.wolf/
.opencode/
.playwright-mcp/
真实 Token
真实 API Key
真实用户数据
```

commit 后必须执行：

```bash
git status --short
git log --oneline -5
```

不要 push。

---

## 8. 通用 Prompt 1：Session 修复 / Bug 修复

用途：用于修复已经发现的问题，不用于新增功能。

流程：

1. 读取当前版本交接文档。
2. 输出当前版本、当前阶段、相关模块、允许修改的最小文件范围。
3. 对问题做分类：

   * Content Script / 正文提取
   * Selection / 选区提取
   * Markdown 转换 / 复制格式
   * Popup UI / 状态管理
   * Options 设置 / storage
   * Background Service Worker / 消息路由
   * Notion API / blocks 转换 / 错误映射
   * Manifest / 权限 / Edge 加载
   * 打包 / zip / 上架材料
   * 其他

4. 优先用 rg 定位，只读相关文件。
5. 先说明根因和拟修改文件列表，再最小修复。
6. 不新增产品功能。
7. 不扩大权限。
8. 不做 AI、飞书、语雀、OCR、截图回退、付费、OAuth、Database 属性映射，除非当前专用 Prompt 明确要求。
9. 必须补充或更新测试。
10. 必须运行 lint/test/build；如涉及打包，再运行 zip。
11. 必须更新交接文档。
12. 输出是否建议 commit，但不自动 commit，除非用户明确要求。

---

## 9. 通用 Prompt 2：插件维护 / 迭代 / 新功能开发规划

用途：用于评估新需求是否值得做，以及拆分版本和 Session。默认只做分析，不写代码。

流程：

1. 读取当前版本交接文档、发布文档、权限说明、隐私政策草稿。
2. 输出当前版本状态、已实现功能、禁止/暂缓功能、权限与隐私边界、开放问题。
3. 对需求分类：

   * v0.1.x / v0.2.x 维护修复
   * v0.2 小功能增强
   * v0.3 大功能
   * 不建议做

4. 评估影响：

   * 是否扩大版本范围
   * 是否需要新增 manifest 权限
   * 是否需要更新隐私政策
   * 是否需要更新商店文案
   * 是否需要新增外部 API
   * 是否保存或传输新的用户数据
   * 是否需要数据迁移
   * 是否影响 Notion 保存链路
   * 是否影响 Popup / Options / Content Script / Background
   * 是否增加审核风险

5. 至少输出：

   * 最小可行方案
   * 较完整方案
   * 暂不做或替代方案

6. 推荐目标版本：

   * v0.2.x：小修复、小优化
   * v0.3：AI、多平台、OAuth、复杂数据结构
   * v0.4+：付费、License、后端、团队功能

7. 如建议实现，拆成多个小 Session。
8. 输出后停止，不写代码，除非用户后续发送专用实现 Prompt。

---

## 10. 通用 Prompt 3：版本鲁棒性检查与修复

用途：用于发布前或阶段结束前做稳定性、安全性和发布一致性检查。

默认分两阶段：

阶段 A：只读审查，不修改文件。
阶段 B：只有用户明确回复"开始修复"后，才允许最小修复。

检查项目：

1. 基础命令：

   * npm run lint
   * npm run test
   * npm run build
   * npm run zip，如当前版本已有 zip 脚本

2. Manifest 与权限：

   * manifest_version 是否为 3
   * package.json 与 manifest 版本是否一致
   * permissions 是否只有必要项
   * host_permissions 是否只包含必要外部 API
   * 是否误加 tabs、scripting、downloads、identity、cookies 等权限
   * 是否存在远程代码加载风险

3. 隐私与安全：

   * 是否存在明文 Token、API Key、真实 Page ID
   * 是否存在 console.log 输出正文、备注、Token、settings 对象
   * logger 是否脱敏
   * storage 是否只保存必要字段
   * 隐私政策是否与实际行为一致

4. Notion API 鲁棒性：

   * Token 缺失提示
   * Page ID / target 缺失提示
   * 401/403/404/429/500/网络错误映射
   * rich_text 2000 字限制
   * blocks 分批限制
   * 空内容禁止保存

5. Content Script 与 Markdown：

   * Readability + fallback
   * selection 无选区提示
   * 清理 script/style/noscript/iframe
   * Markdown 粗体异常
   * CJK 字数统计
   * 复制 Markdown 完整格式

6. UI 与状态：

   * loading/error/saved 状态
   * saving 禁用态
   * Options 保存恢复
   * draft 恢复竞态
   * 错误信息中文化

7. 发布材料：

   * README 不承诺未实现功能
   * STORE_LISTING 不写未实现功能
   * PRIVACY_POLICY 与实际行为一致
   * PERMISSION_JUSTIFICATION 与 manifest 一致
   * TEST_PLAN 覆盖主要手动测试

---

## 11. 人工测试与 ChatGPT 审查规则

* 重要 Session 完成后，agent 不应自己判断直接进入下一阶段。
* 用户会把 agent 输出交给 ChatGPT 审查。
* 审查通过后，用户再发送 commit prompt。
* 如果人工测试发现问题，优先走"Session 修复 / Bug 修复"流程。
* 不要因为某个测试暂时无法自动化就删除需求，应记录到 TEST_LOG 或 ISSUES。

---

## 13. Playwright QA 辅助规则

- 只在用户明确允许时使用 Playwright
- 不访问隐私页面
- 不记录 token/page id/账号信息
- 不保存完整 DOM/正文/评论
- 不替代用户最终人工 QA
- 不修改 `.playwright-mcp` 配置
- 详情见 `docs/PLAYWRIGHT_QA_WORKFLOW.md`

---

## 12. 适用边界

本规则适用于所有 ClipMate 后续版本，但不是不可变法律。后续如果用户明确更改项目策略，可以更新本文件。

任何更新必须记录在 DECISIONS.md 和 CHANGELOG_AGENT.md。
