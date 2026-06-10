# CHANGELOG_AGENT.md — ClipMate v0.1 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

---

## Session 4.2.1：复测问题二次修复 (2026-06-10)

### 修改文件
- `src/platforms/notion/blocks.ts` — 长备注切分后所有 chunk 都生成 callout block（📝图标），不再将后续 chunk 变为普通 paragraph
- `src/content/parser/htmlToMarkdown.ts` — 新增 `mergeAdjacentBold` 函数，在 turndown 转换前合并相邻 `<strong>` / `<b>` 标签，从源头消除 `****` 异常
- `src/shared/utils/formatMarkdown.ts` — 重写 `cleanMarkdown` 为迭代合并相邻粗体（`**A****B**` → `**AB**`），不再做简单的 `\*{4,}→**` 替换
- `tests/notion-blocks.test.ts` — 重写长备注测试：验证所有 chunk 均为 callout、均有 📝 图标、无 note paragraph 泄露
- `tests/shared-utils.test.ts` — 重写 cleanMarkdown 测试（10 tests），新增用户提供的三种真实中文引号场景、多段相邻粗体合并、空格分隔不合并、正常文本保留
- `docs/CURRENT_STATUS.md` — 更新阶段状态
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 4.2.1 运行记录
- `docs/ISSUES.md` — 新增 I-014（长备注 paragraph 泄露）、I-015（粗体合并不完整），标记 ✅
- `docs/DECISIONS.md` — 新增 D-032、D-033

### 改动摘要
- **长备注 callout**：`chunkText` 切分后每个 chunk 均生成独立 callout block，`icon: { emoji: '📝' }`，不再混用 paragraph
- **粗体合并根因修复**：在 `htmlToMarkdown.ts` 中新增 `mergeAdjacentBold(html)`，用正则 `<\/(strong|b)>\s*<\1>` 合并相邻同类型粗体标签，防止 turndown 产生 `****`；`cleanMarkdown` 改为迭代正则 `\*\*(.*?)\*\*\*\*(.*?)\*\*` → `**$1$2**`，支持中文引号和多段相邻粗体
- 构建：80 modules, 776ms
- Lint：0 errors, 0 warnings
- 测试：80 passed（+4 cleanMarkdown，+1 notion-blocks 重写）

---

## Session 4.2：真机测试问题修复 (2026-06-10)

### 新增功能
- `countWords` 支持 CJK 字符逐个计数：汉字/日文/韩文每字算 1，英文按空白分词，混合文本正确累加
- `formatCopyMarkdown` 生成完整复制内容：标题 → URL → 标签 → 备注 → 分割线 → 正文
- `cleanMarkdown` 清理 turndown 产出的异常 `****` 粗体标记

### 修改文件
- `src/shared/utils/formatMarkdown.ts` — 新增 `countWords` CJK 支持、`cleanMarkdown`、`formatCopyMarkdown`
- `src/shared/utils/logger.ts` — 移除 `err` 参数，防止敏感数据泄露（Token/正文/备注）
- `src/content/parser/htmlToMarkdown.ts` — turndown 输出后调用 `cleanMarkdown` 清理
- `src/content/index.ts` — 移除 `logger.error` 的 err 参数（2 处）
- `src/background/index.ts` — 统一使用 logger（移除直接 console.log/console.error），不输出 err 详情
- `src/background/handlers/notionHandler.ts` — 日志只输出错误码，不输出 err 对象
- `src/shared/storage/storage.ts` — 5 处 `logger.error` 移除 err 参数，不泄露 settings/draft 内容
- `src/platforms/notion/blocks.ts` — 长备注 >2000 字时首段用 callout（📝），后续段用 paragraph
- `src/popup/App.tsx` — 复制 Markdown 改用 `formatCopyMarkdown`，含标题/URL/标签/备注
- `docs/CURRENT_STATUS.md` — 更新为 Session 4.2 阶段状态
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 4.2 运行记录
- `docs/ISSUES.md` — 新增 I-009 ~ I-013，更新 I-008（callout 图标不一致）
- `docs/DECISIONS.md` — 新增 D-028 ~ D-031

### 测试变更
- `tests/shared-utils.test.ts` — +21 tests（countWords CJK 5 + cleanMarkdown 5 + formatCopyMarkdown 7），更新 CJK 期望值
- `tests/notion-blocks.test.ts` — +1 test（长备注 callout+paragraph 分片 + 图标验证），原有 callout 测试增加 icon 断言

### 改动摘要
- **字数统计**：CJK 字符按 Unicode 范围逐个计数（含全角标点），英文按空格分词，混合文本正确累计。解决中文选区选中的 8 字只显示 1 字问题
- **复制 Markdown**：新增 `formatCopyMarkdown` 函数，按固定顺序拼接 # 标题 → 来源 URL → 标签 → > 引用备注 → --- 分割线 → 正文
- **异常粗体修复**：`cleanMarkdown` 将 `****` 及更多连续星号规范化为 `**`，移除空粗体行
- **安全审查**：`logger.error` 移除 `err` 参数，全项目 9 处调用不再输出可能包含 Token/正文/备注的原始对象。`background/index.ts` 从 `console.log/error` 统一改用 `logger`。明确 DevTools Storage 可见 ≠ console 泄露
- **Callout 图标**：长备注首段 callout（📝），后续段落用普通 paragraph block，不再出现 💡 图标
- 构建：80 modules, 783ms
- Lint：0 errors, 0 warnings
- 测试：76 passed（+19，shared-utils +18, notion-blocks +1）

---

## Session 4.1：Notion 保存链路小补测与安全检查 (2026-06-10)

### 新增文件
- `tests/notion-client.test.ts` — appendBlocks 单元测试（10 tests），mock fetch 覆盖 401/403/404/429/500/网络异常 + 分批请求
- `docs/PERMISSION_JUSTIFICATION.md` — 上架权限使用说明（activeTab/storage/host_permissions/content_scripts）

### 修改文件
- `src/platforms/notion/blocks.ts` — 修复 rich_text 超 2000 字未切分的风险：标题截断、URL 显示文本截断、标签文本截断、备注按 2000 字切分为多个 callout
- `docs/CURRENT_STATUS.md` — 更新为 Session 4.1 阶段状态
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 4.1 运行记录
- `docs/ISSUES.md` — 新增 I-007/I-008，更新 I-001 状态
- `docs/DECISIONS.md` — 新增 D-025 决策记录

### 改动摘要
- **客户端测试**：add 10 个 mock fetch 测试，覆盖全部 6 种 HTTP 错误映射（401/403 → AUTH_FAILED、404 → PAGE_NOT_FOUND、429 → RATE_LIMITED、500 → SAVE_FAILED、fetch reject → NETWORK_ERROR）+ 4 个分批测试（≤100 单次、150 两次、250 三次精确验证、中途失败停止）
- **rich_text 长度**：标题/URL/标签/备注均加 2000 字限制。备注超长时按 chunkText 切分为多个 callout block（首个带📝图标）
- **日志安全**：审查全部 19 处 console/logger 调用，确认无 Token/正文/备注泄露
- **权限说明**：创建 PERMISSION_JUSTIFICATION.md，覆盖 activeTab、storage、host_permissions、content_scripts、不执行远程代码、不收集数据
- 构建：80 modules, 732ms
- Lint：0 errors, 0 warnings
- 测试：57 passed（+10，新增 notion-client.test.ts）

---

## Session 4：Notion API 集成与完整保存链路 (2026-06-10)

### 新增文件
- `src/platforms/types.ts` — 平台适配器通用类型（SaveResult）
- `src/platforms/notion/client.ts` — Notion API 封装（Bearer 鉴权、分批 append、HTTP 错误码映射）
- `src/platforms/notion/blocks.ts` — ClipDraft → Notion Blocks 转换（标题/URL/标签/备注/divider/段落、2000 字切分）
- `src/background/handlers/notionHandler.ts` — SAVE_TO_NOTION 消息处理（校验 Token/Page ID、调用 API、错误返回）
- `src/popup/hooks/useSaveToNotion.ts` — Popup 保存 hook（loading/error/saved 状态管理）
- `tests/notion-blocks.test.ts` — blocks.ts 单元测试（12 tests）
- `tests/notion-errors.test.ts` — 错误码/错误消息单元测试（9 tests）

### 修改文件
- `src/shared/constants/messageTypes.ts` — 新增 `SAVE_TO_NOTION` 消息类型
- `src/shared/constants/defaults.ts` — 新增 8 条 Notion 相关错误中文提示
- `src/shared/utils/errors.ts` — 新增 8 个 Notion 错误码
- `src/shared/types/message.types.ts` — 新增 `SaveToNotionPayload`、`SaveToNotionResponse` 类型
- `manifest.config.ts` — 新增 `host_permissions: ['https://api.notion.com/*']`
- `src/background/index.ts` — 从纯日志占位重写为 SAVE_TO_NOTION 消息路由
- `src/popup/App.tsx` — 接入 useSaveToNotion hook，保存按钮从 alert 占位改为真实调用
- `src/popup/components/ActionButtons.tsx` — 新增 saving prop，显示"保存中..."状态

### 改动摘要
- **Notion 平台层**：client.ts 封装 Notion API v1 append block children，支持 Bearer Token 鉴权、Notion-Version 头、401/403/404/429 错误映射；blocks.ts 负责将 ClipDraft 转为 Notion blocks（heading_2 标题、带链接的 URL paragraph、蓝色标签 paragraph、callout 备注、divider 分隔线、正文 paragraph），支持 2000 字切分和双换行分段
- **Background 保存链路**：notionHandler.ts 处理 SAVE_TO_NOTION 消息，校验 Token/Page ID/内容非空，调用 Notion API，返回成功/错误码
- **Popup 保存交互**：ActionButtons 新增 saving 禁用态 + "保存中..."文字；useSaveToNotion hook 管理 loading/error/saved 状态，错误码自动映射中文提示
- **权限更新**：host_permissions 增加 `https://api.notion.com/*`，确保 Background SW 可 fetch Notion API
- **错误系统完善**：新增 8 个错误码 + 8 条中文提示，覆盖 Token 缺失/Page ID 缺失/授权失败/页面不存在/限流/网络错误/保存失败/空内容
- 构建：80 modules, 760ms
- Lint：0 errors, 0 warnings
- 测试：47 passed（+21，新增 notion-blocks.test.ts + notion-errors.test.ts）

---

## Session 3.1：基础链路审查与修复 (2026-06-10)

### 新增文件
- `tests/content-parser.test.ts` — contentCleaner / parseMetadata / 错误码 / 常量 单元测试（12 tests）

### 修改文件
- `src/popup/App.tsx` — 新增剪藏草稿自动保存/恢复
- `src/popup/hooks/useExtractContent.ts` — 移除私有 translateError，改用共享 ERROR_MESSAGES
- `src/shared/constants/defaults.ts` — 新增 ERROR_MESSAGES 常量
- `src/background/index.ts` — 清理消息监听器

### 改动摘要
- 剪藏草稿持久化、竞态处理、Background SW 安全、错误码统一
- 构建：76 modules, 822ms，Lint 0，测试 26 passed

---

## Session 3：实现 Popup 和 Options UI，本地闭环可用 (2026-06-10)

（省略详细信息，参见 Session 3.1 CHANGELOG）

---

## Session 2：shared 基础层与 Content Script 提取 (2026-06-10)

（省略详细信息，参见 Session 3 CHANGELOG）

---

## Session 1：创建 Vite + React + MV3 插件脚手架 (2026-06-10)

（省略详细信息，参见 Session 1 CHANGELOG）

---

## Session 0 文档修补 (2026-06-10)

（省略详细信息，参见 Session 0 CHANGELOG）

---

## Session 0 初始创建 (2026-06-10)

（省略详细信息，参见 Session 0 CHANGELOG）
