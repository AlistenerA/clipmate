# CHANGELOG_AGENT.md — ClipMate v0.1 / v0.2 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

---

## v0.2 Session 6：文档、QA、版本号、打包 (2026-06-11)

### 修改文件
- `package.json` — version 从 `0.1.0` 升级为 `0.2.0`；zip 脚本输出文件名改为 `clipmate-v0.2.zip`
- `manifest.config.ts` — version 从 `0.1.0` 升级为 `0.2.0`；权限不变
- `README.md` — 重写为 v0.2：新增多 Notion 目标、本地剪藏历史（搜索/复制/删除/清空/重试）、真实 favicon/fallback 头像、图片开篇摘要清理、同站自动刷新、历史记录说明、隐私说明扩展；更新项目结构（321 tests, 13 files）；更新 Edge 加载路径为 clipmate-v0.2/dist/
- `docs/TEST_PLAN.md` — 重写为 v0.2：从 16 项扩展为 40 项测试用例，覆盖安装/Options 多目标管理/Popup 目标选择与保存/历史搜索复制删除清空重试/History UI 体验（favicon/摘要/色条/自动刷新）/设置与存储/错误提示/隐私与打包
- `docs/MANUAL_QA_RESULT_TEMPLATE.md` — 重写为 v0.2：40 项可勾选测试模板，按分类组织（安装/Options/Popup/历史/History UI/设置/错误/打包），补充测试信息字段
- `docs/PRIVACY_POLICY_DRAFT.md` — 更新 v0.2 数据流：新增本地剪藏历史存储内容说明（标题/URL/标签/Markdown/字数/保存状态/站点元数据）、不调用第三方 favicon API 声明、用户控制项（清空历史/关闭记录）、数据安全补充（控制台不输出敏感内容）
- `docs/PERMISSION_JUSTIFICATION.md` — 更新 v0.2：补充 storage 存储历史记录和多目标配置说明、v0.2 权限对比表（确认无新增权限）、favicon 从 DOM 读取无需 host_permissions 说明、content_scripts 功能补充
- `docs/STORE_LISTING_DRAFT.md` — 更新 v0.2：核心功能新增多目标管理/本地剪藏历史/重试保存/真实网站图标；权限说明补充 v0.2 未新增权限；Data Usage 新增剪藏历史行；截图建议补充 History UI 和 Options 多目标管理
- `docs/RELEASE_CHECKLIST.md` — 重写为 v0.2：更新版本检查（0.2.0）、权限检查（新增对比）、打包检查（clipmate-v0.2.zip）、隐私检查（v0.2 历史记录存储 + 第三方 favicon）、文档检查（8 份）、40 项功能验证清单、素材/文案/Partner Center 清单
- `docs/CURRENT_STATUS.md` — 更新当前阶段为 Session 6 已完成，Session 6 标记完成，下一阶段改为 Session 7
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 6 运行记录（见下）
- `docs/ISSUES.md` — Session 6 无新增 blocker
- `docs/DECISIONS.md` — 新增 Session 6 决策（版本号/zip 文件名/文档声明/权限不变）

### 改动摘要
- 版本号升级：package.json / manifest.config.ts 从 0.1.0 → 0.2.0
- zip 脚本输出改为 clipmate-v0.2.zip
- 8 份文档更新为 v0.2 范围（功能说明、安全声明、测试清单、发布清单）
- 未修改 manifest 权限、host_permissions、content_scripts matches
- 未修改 src/ 和 tests/ 业务代码
- 未新增依赖
- 未修改 clipmate-v0.1/
- Lint：0 errors, 0 warnings
- 测试：预期 321 passed（13 files）
- 构建：成功
- Zip：clipmate-v0.2.zip

---

## v0.2 Session 5.2：图片摘要跳过 + 真实网站图标 (2026-06-11)

### 新增文件
无

### 修改文件
- `src/content/parser/metaParser.ts` — 新增 3 个纯函数：`resolveIconUrl`（相对/绝对 URL 解析）、`extractThemeColor`（从 meta 标签提取）、`extractSiteIconUrl`（从 link 标签提取 favicon，优先级 apple-touch-icon > icon > shortcut icon > mask-icon > /favicon.ico fallback）；重写为遍历所有 link 元素后按优先级取最优；`PageMeta` 新增 `siteIconUrl?` / `themeColor?` 可选字段；`parseMetadata` 调用 favicon 提取
- `src/shared/types/clip.types.ts` — `ClipMetadata` 新增 `siteIconUrl?` / `themeColor?` 可选字段
- `src/shared/types/settings.types.ts` — `ClipHistoryItem` 新增 `siteName?` / `siteIconUrl?` / `themeColor?` / `descriptionPreview?` 可选字段（旧历史记录无感知兼容）
- `src/content/index.ts` — `buildContent` 将 meta 中的 favicon 字段写入 ExtractedContent.metadata
- `src/shared/storage/storage.ts` — `CreateHistoryItemInput` 和 `addHistoryItem` 新增上述 4 个可选字段
- `src/popup/utils/historyPayload.ts` — `HistoryInput` 和 `buildHistoryInput` 新增 `siteName` / `siteIconUrl` / `themeColor` / `descriptionPreview` 字段，从 metadata 透传
- `src/background/handlers/notionHandler.ts` — 两处 `addHistoryItem` 调用（成功/失败）均从 `draft.content.metadata` 传入新增字段
- `src/options/utils/historyView.ts` — 新增 `stripMarkdownImages`（移除 `![]()` / `[![]()]()` / `<img>` 语法）、`normalizeSummaryText`（压缩空白）；`getHistorySummary` 优先级改为：`descriptionPreview` → 清理后的 `contentPreview` → 清理后的 markdown body → URL/标题（备注不再作为摘要首位）
- `src/options/components/HistoryItem.tsx` — 图标区域新增真实 favicon 渲染：有 `siteIconUrl` 时显示 `<img>`，`onError` 后隐藏图片并显示域名首字母 fallback；无 `siteIconUrl` 时直接显示首字母
- `tests/history-polish.test.ts` — 导入新函数；更新 `getHistorySummary` 测试（11 项，新增描述优先/图片跳过/多图/链接图/HTML img/全图回退）；新增 `stripMarkdownImages` 测试（8 项）；新增 `normalizeSummaryText` 测试（4 项）；`makeHistoryItem` 新增可选字段支持
- `tests/content-parser.test.ts` — 新增 `resolveIconUrl` 测试（4 项）、`extractThemeColor` 测试（2 项）、`extractSiteIconUrl` 测试（9 项，含优先级/相对路径/baseURI/fallback/mask-icon/parseMetadata集成）
- `tests/popup-target-selection.test.ts` — 新增 `buildHistoryInput` 携带 siteIconUrl/themeColor/siteName/descriptionPreview 测试（4 项）
- `tests/history-save-flow.test.ts` — 新增 descriptionPreview 写入、siteName+siteIconUrl 写入、无新字段兼容测试（3 项）

### 改动摘要
- 两个人工测试问题修复：
  1. 文章开篇图片导致摘要显示 `![](url)` 的修复：`stripMarkdownImages` 纯函数移除 markdown/HTML 图片语法，`normalizeSummaryText` 归一化空白
  2. 网站图标只有域名首字母：Content Script 从页面 DOM 提取真实 favicon（`<link rel>` / `<meta name="theme-color">`），优先级 `apple-touch-icon` > `icon` > `shortcut icon` > `mask-icon` > `/favicon.ico` fallback
- 摘要优先级修正：`descriptionPreview`（页面描述）> 清理后 `contentPreview` > 清理后 markdown body > URL/domain
- 新增 4 个可选字段（`siteName` / `siteIconUrl` / `themeColor` / `descriptionPreview`），数据流从 `metaParser` → `buildContent` → `buildHistoryInput` / `notionHandler` → `addHistoryItem` → `ClipHistoryItem`
- 真实图标渲染：`<img src={siteIconUrl}>` 带 `onError` → fallback 域名首字母；旧历史无新字段时直接显示首字母
- 不新增 manifest 权限、不调用第三方 favicon API、不修改版本号
- 构建：90 modules，961ms
- Lint：0 errors, 0 warnings
- 测试：321 passed（+41），13 files

---

## v0.2 Session 5.1：History UI 体验增强 + Popup 同站自动刷新 (2026-06-11)

### 新增文件
- `tests/history-polish.test.ts` — Session 5.1 纯函数测试（46 tests）

### 修改文件
- `src/options/utils/historyView.ts` — 新增 8 个纯函数：`highlightText`（文本高亮切分）、`getHistoryMatchInfo`（匹配信息查询）、`getDomainFromUrl`、`getSiteInitial`（域名首字母）、`getHistorySummary`（摘要生成）、`extractMarkdownBodyPreview`、`getStableSiteColor`（domain hash → 固定 12 色调色板）、`shouldAutoExtractForActiveTab`（URL 比较决策）；`filterHistoryLocally` 扩展支持 markdown 正文搜索
- `src/options/components/HistoryItem.tsx` — 全面重设计：左侧站点颜色色条（getStableSiteColor）、网站图标/头像（域名首字母圆形 badge）、摘要预览（getHistorySummary 优先级：notePreview → contentPreview → markdown body → URL）、搜索高亮（highlightText render match token，非 dangerouslySetInnerHTML）、匹配标签（标签命中黄底、目标/备注/正文匹配 tag）；移除旧 notePreview/contentPreview 灰底预览区
- `src/options/components/HistoryTab.tsx` — 传递 `query` prop 给 HistoryItem
- `src/popup/App.tsx` — 修复 draft 恢复逻辑：`Promise.all([getLastClipDraft(), chrome.tabs.query()])` 比较 draft URL 与 active tab URL；相同则恢复草稿，不同则 auto-extract；同一页面不丢失 tags/note

### 改动摘要
- 搜索高亮：使用 `highlightText` 切分文本为 `string | { match }` token 数组，React `<mark>` 渲染，不使用 dangerouslySetInnerHTML
- 匹配标签：标签命中 query → 黄底样式；目标匹配 → "目标匹配" 紫色 tag；备注匹配 → "备注匹配" 青色 tag；正文匹配（仅当标题/URL 未匹配） → "正文匹配" 橙色 tag
- 网站图标：每条历史左侧显示域名首字母圆形头像，颜色与左侧色条一致（同站同色）
- 摘要预览：优先 notePreview → contentPreview → markdown body 前 120 字 → URL/标题兜底
- 同站统一色条：`getStableSiteColor` 对 domain 做 djb2 hash，在 12 色调色板中取色，同 domain 稳定一致
- Popup 自动刷新：draft.url !== active tab.url → 不恢复旧内容，触发 auto-extract；draft.url === active tab.url → 恢复全部（包括 tags/note）；无 draft → auto-extract
- 搜索扩展：`filterHistoryLocally` 新增 `extractBodyMarkdown` 匹配，搜索可命中 `---` 分隔符后的正文
- 构建：90 modules，934ms
- Lint：0 errors, 0 warnings
- 测试：280 passed（+46），13 files

---

## v0.2 Session 5：History UI — 搜索、复制、删除、清空、重试 (2026-06-11)

### 修改文件
- `src/popup/App.tsx` — alert 消息改用 `ERROR_MESSAGES` 常量（NOTION_TOKEN_MISSING / NOTION_TARGETS_EMPTY / NOTION_TARGET_NOT_FOUND），消除硬编码文案不一致
- `src/popup/components/TargetSelector.tsx` — 移除 Page ID 预览（不再显示 `(maskPageId)`），仅显示 target.name
- `src/options/utils/targetManager.ts` — 新增 `extractNotionPageId()` 函数（支持纯 32 位 hex / UUID / 完整 Notion URL / #hash 忽略）；`addTarget` 和 `updateTarget` 改用语义化错误消息：名称空 → `'名称不能为空'`，pageId 无法识别 → `'无法识别 Notion 页面 ID...'`
- `src/options/components/TargetEditor.tsx` — `handleSave` 调用 `extractNotionPageId` 提前归一化 pageId；新增提示文案"可粘贴完整 Notion 页面链接；如链接包含 #，# 后通常是块定位"
- `src/shared/constants/defaults.ts` — `NOTION_TARGET_NOT_FOUND` 消息从 `'所选目标已不存在'` 改为 `'所选 Notion 目标不存在'`
- `tests/options-targets.test.ts` — 新增 `extractNotionPageId` 测试套件（10 tests）+ 归一化集成测试（3 tests）；所有 pageId 测试值切换为合法 32 位 hex；对齐新错误消息
- `tests/notion-errors.test.ts` — 对齐 `NOTION_TARGET_NOT_FOUND` 新文案

### 改动摘要
- Popup alert 消息与 ERROR_MESSAGES 常量统一（Token 缺失 / 目标为空 / 目标失效）
- Options Page ID 输入框支持粘贴完整 Notion URL（自动提取 # 前的 32 位页面 ID）
- Popup 目标下拉框不再显示脱敏 Page ID，UI 更简洁
- `extractNotionPageId` 处理三种格式：纯 hex32 / UUID / Notion URL（忽略 #hash）
- 新增 13 项测试（45 → 58 tests 在 options-targets），总测试数 178 → 191
- 构建：87 modules, 931ms
- Lint：0 errors, 0 warnings

---

## v0.2 Session 4：Popup 目标选择与历史写入 (2026-06-11)

### 新增文件
- `src/popup/utils/targetSelection.ts` — 目标选择纯函数（resolveSelectedTarget / maskPageId）
- `src/popup/utils/historyPayload.ts` — 历史 payload 构建纯函数（buildHistoryInput）
- `src/popup/components/TargetSelector.tsx` — Popup 目标下拉选择器组件
- `tests/popup-target-selection.test.ts` — 目标选择 + history input 纯函数测试（19 tests）
- `tests/history-save-flow.test.ts` — Background 保存链路 + 历史写入集成测试（13 tests）

### 修改文件
- `src/popup/App.tsx` — 状态类型升级为 `ClipMateSettingsV2`；`notionConfigured` 替换为 `settings`；新增 `selectedTargetId` 状态；`handleSaveToNotion` 按 token→targets→pageId 逐级校验；错误提示从"配置 Page ID"改为"添加 Notion 目标页面"
- `src/popup/hooks/useSaveToNotion.ts` — `save` 函数签名从 `(draft: ClipDraft)` 改为 `(payload: SaveToNotionPayload)`
- `src/background/handlers/notionHandler.ts` — 接收新 `SaveToNotionPayload`（含 targetId/targetName/pageId）；使用 payload.pageId 调用 Notion API（不再依赖 settings.notionPageId）；保存成功/失败后通过 `addHistoryItem` 写入本地历史；遵循 `saveHistoryEnabled` 开关
- `src/background/index.ts` — 消息处理器改为传递 `SaveToNotionPayload` 类型（替换旧 `ClipDraft`）
- `src/shared/types/message.types.ts` — `SaveToNotionPayload` 从 `ClipDraft` 别名改为包含 `draft`/`targetId`/`targetName`/`pageId` 的接口
- `src/shared/constants/defaults.ts` — 新增 `NOTION_TARGETS_EMPTY` 和 `NOTION_TARGET_NOT_FOUND` 错误消息；`NOTION_PAGE_ID_MISSING` 消息从"填写 Notion Page ID"改为"添加 Notion 目标页面"
- `tests/notion-errors.test.ts` — 对齐 `NOTION_PAGE_ID_MISSING` 新消息文案

### 改动摘要
- Popup 不再依赖旧 `notionPageId` 判断配置状态，改用 `notionTargets` + `defaultTargetId`
- 修复核心痛点：Options 已配置 Token 和目标，但 Popup 仍提示"请配置 Page ID"
- TargetSelector 组件：默认选中 defaultTargetId → 回退第一个目标；支持 target 间切换；无目标时显示配置提示
- Background 保存后自动写入 `clipmate_history`：saved 含 savedAt，failed 含 errorCode
- `saveHistoryEnabled=false` 时不写历史
- 复制 Markdown 暂不写 unsaved 历史（留待 History UI 或鲁棒性阶段完善）
- 未修改 Content Script / Options 多目标管理 UI / 数据结构
- 构建：87 modules（+2），916ms
- Lint：0 errors, 0 warnings
- 测试：178 passed（+32），10 files

---

## v0.2 Session 3：Options 多 Notion 目标管理 (2026-06-11)

### 新增文件
- `src/options/utils/targetManager.ts` — 目标管理纯函数（addTarget / updateTarget / deleteTarget / setDefaultTarget / maskPageId）
- `src/options/components/TargetList.tsx` — 目标列表展示组件（含空状态、默认标记、编辑/删除/设为默认按钮）
- `src/options/components/TargetEditor.tsx` — 目标新增/编辑表单组件（含名称、Page ID、设为默认复选框、内联验证）
- `tests/options-targets.test.ts` — 目标管理纯函数测试（32 tests）

### 修改文件
- `src/options/App.tsx` — 状态类型从 `ClipMateSettings` 升级到 `ClipMateSettingsV2`；替换旧 `pageId` 输入为 TargetList/TargetEditor 多目标管理；新增 add/edit/delete/setDefault handler；目标操作即时持久化到 storage；handleClear 增加 V2 字段清理
- `src/options/components/NotionSettingsForm.tsx` — 移除 `pageId` / `onChangePageId` props（Page ID 现由多目标管理）
- `src/options/components/StorageDebugPanel.tsx` — 类型升级到 `ClipMateSettingsV2`；显示目标数量/名称列表/历史记录上限

### 改动摘要
- Options 页面从单 Page ID 输入切换为多 Notion 目标列表管理
- 目标 CRUD 操作即时持久化到 chrome.storage.local（不依赖全局保存按钮）
- Token 和标签仍通过全局保存按钮持久化
- 纯函数 targetManager 不依赖 React/chrome API，方便测试
- 首目标自动设为默认；删除默认目标自动选择新默认；只有一个 isDefault=true
- 旧 notionPageId 字段保留兼容，不再作为主要输入
- 构建：85 modules（+3），877ms
- Lint：0 errors, 0 warnings
- 测试：146 passed（+32），8 files

---

## v0.2 Session 2：版本目录隔离与迁移 (2026-06-11)

### 新增文件
- `clipmate-v0.2/` 目录（完整复制 clipmate-v0.1 含 v0.2 S0+S1 成果）

### 修改文件
- `clipmate-v0.2/docs/AGENT_CONTEXT.md` — 标题更新为 v0.2，新增版本目录说明、v0.2 必做功能列表
- `clipmate-v0.2/docs/CURRENT_STATUS.md` — 更新当前阶段为 Session 2 完成，下一阶段改为 Session 3
- `clipmate-v0.2/docs/V0.2_PLAN.md` — Session 拆分插入 S2（版本目录隔离），后续全部顺延（S2→S7），更新状态/依赖/测试节点/风险
- `clipmate-v0.2/docs/CHANGELOG_AGENT.md` — 本条记录
- `clipmate-v0.2/docs/TEST_LOG.md` — Session 2 运行记录
- `clipmate-v0.2/docs/DECISIONS.md` — 新增 D-051（版本目录隔离策略）

### 恢复/回退文件（clipmate-v0.1/）
- `clipmate-v0.1/` 恢复为 v0.1 冻结快照（基于 commit `cc5c89f`）
- 移除 `clipmate-v0.1/docs/V0.2_PLAN.md`
- 移除 `clipmate-v0.1/src/shared/utils/id.ts`
- 移除 `clipmate-v0.1/src/shared/utils/migration.ts`
- 移除 `clipmate-v0.1/tests/storage-migration.test.ts`
- 恢复 `clipmate-v0.1/` 所有 v0.2 Session 0/1 修改的源码文件

### 改动摘要
- 创建独立 `clipmate-v0.2/` 开发目录，copy 时排除 `node_modules/`、`dist/`、`build/`、`*.zip`、`.env`
- `clipmate-v0.1/` 恢复为 v0.1 冻结快照，基于 git commit `cc5c89f`
- v0.1 冻结基线判断：`V0.2_PLAN.md` 在 `af5e324` 中首次新增，其父提交 `cc5c89f` 即为 v0.1 冻结基线
- 未修改任何业务代码（src/、tests/ 内容未变，仅目录迁移）
- 未修改 package.json / manifest.config.ts 版本号
- Session 编号调整：原 S2→S3, S3→S4, S4→S5, S5→S6, S6→S7
- 构建：82 modules（在 clipmate-v0.2/ 验证）
- Lint：0 errors, 0 warnings
- 测试：114 passed (7 files)

---

## v0.2 Session 1：数据结构升级与兼容迁移 (2026-06-11)

### 新增文件
- `src/shared/utils/id.ts` — UUID 生成工具函数（crypto.randomUUID + fallback）
- `src/shared/utils/migration.ts` — V1→V2 settings 纯函数迁移逻辑
- `tests/storage-migration.test.ts` — 迁移 + storage CRUD 34 项测试

### 修改文件
- `src/shared/types/clip.types.ts` — 新增 `SaveStatus` 类型
- `src/shared/types/settings.types.ts` — 新增 `NotionTarget`、`ClipHistoryItem`、`ClipMateSettingsV2` 接口
- `src/shared/constants/defaults.ts` — 新增 `DEFAULT_SETTINGS_V2`、`MAX_MARKDOWN_LENGTH`、`DEFAULT/MIN/MAX_HISTORY_LIMIT`、`STORAGE_KEYS.HISTORY`
- `src/shared/utils/index.ts` — 导出 `id.ts` 和 `migration.ts`
- `src/shared/storage/storage.ts` — 新增 `migrateSettingsIfNeeded`、`getNotionTargets`、`saveNotionTargets`、`getDefaultNotionTarget`、`addHistoryItem`、`updateHistoryItem`、`deleteHistoryItem`、`clearHistory`、`searchHistory`、`getHistory`；`getSettings` 返回 `ClipMateSettingsV2`（含自动迁移）；`saveSettings` 接受 `Partial<ClipMateSettingsV2>` 并自动 clamp historyLimit 到 [10, 500]

### 改动摘要
- v0.2 数据结构已就绪：`ClipMateSettingsV2` extends `ClipMateSettings`，新增 `version: 2`、`notionTargets`、`defaultTargetId`、`historyLimit`
- v0.1→v0.2 兼容迁移：`getSettings()` 检测旧 settings（无 version 或 version < 2），自动创建默认 NotionTarget（若 pageId 有值），写入 v2 结构后返回
- 历史记录规则：单条 markdown 限 50000 字符，超出截断并标 `markdownTruncated: true`；`historyLimit` 默认 100，最小 10，最大 500；添加新记录时自动裁剪最旧记录
- `searchHistory` 支持 title/url/tags 大小写不敏感搜索
- `saveNotionTargets` 写整个 targets 数组（会覆盖旧列表）
- `getDefaultNotionTarget` 返回 `isDefault: true` 的目标，无默认时返回第一个
- `notionTargets` 存于 settings 内部，非独立 storage key
- `history` 存于独立 storage key `clipmate_history`
- 未修改 Popup / Options / Background / Content Script / Notion 平台层代码
- 未修改 package.json / manifest.config.ts 版本号
- 构建：82 modules, 907ms
- Lint：0 errors, 0 warnings
- 测试：34 tests added, total 114 passed (7 files)

### 新增文件
- `docs/V0.2_PLAN.md` — v0.2 迭代规划文档（产品定位/功能清单/数据结构草案/迁移策略/Session 拆分/风险清单）

### 修改文件
- `docs/CURRENT_STATUS.md` — 更新为 v0.2 Session 0 完成状态
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — v0.2 S0 记录（无代码运行）
- `docs/DECISIONS.md` — 新增 D-036~D-046（v0.2 关键技术决策）

### 改动摘要
- 创建 V0.2_PLAN.md，明确 v0.2 范围：本地剪藏历史 + 多 Notion 目标 + 保存失败重试
- 确认不新增权限、不新增外部 API、不引入 AI/多平台/付费/OAuth
- 数据结构草案已拟定（NotionTarget / ClipHistoryItem / ClipMateSettingsV2）
- v0.1 → v0.2 settings 迁移策略已制定
- Session 拆分：S0→S6，严格顺序执行
- 未修改任何业务代码、package.json、manifest.config.ts

---

## v0.1 Session 5.1：图标资源应用与重新打包 (2026-06-10)

### 新增文件
- `public/icons/icon-16.png` — 16×16 工具栏图标
- `public/icons/icon-32.png` — 32×32 图标
- `public/icons/icon-48.png` — 48×48 图标
- `public/icons/icon-128.png` — 128×128 扩展管理图标
- `public/icons/icon-512.png` — 512×512 商店展示图标
- `public/icons/icon-source.svg` — SVG 源文件

### 修改文件
- `manifest.config.ts` — 新增 `icons` 字段，声明 16/32/48/128 图标路径
- `package.json` — 修复 `zip` 脚本：改用 .NET ZipFile API 替代依赖执行策略的 PowerShell Archive 模块
- `docs/CURRENT_STATUS.md` — 更新为 Session 5.1 完成状态
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 5.1 运行记录
- `docs/ISSUES.md` — I-016 标记为已解决
- `docs/DECISIONS.md` — 新增 D-035（zip 脚本 .NET API）

### 改动摘要
- 从 `clipmate-icons.zip` 解压 6 个图标文件并复制到 `public/icons/`
- manifest 新增 `icons` 配置，路径指向 `icons/icon-{16,32,48,128}.png`
- 未修改任何业务代码（Popup / Options / Content Script / Background / Notion）
- 构建：80 modules, 844ms
- Lint：0 errors, 0 warnings
- 测试：80 passed
- Zip：clipmate-v0.1.zip (111KB)，含 6 个图标文件
- I-016 图标缺失问题已解决

---

## Session 5：最终测试计划、发布材料定稿、打包 (2026-06-10)

### 新增文件
- `docs/TEST_PLAN.md` — 16 项测试用例（安装/加载/UI/提取/复制/Notion 保存/错误/隐私/打包）
- `docs/MANUAL_QA_RESULT_TEMPLATE.md` — 可勾选手动测试记录模板
- `README.md` — 项目 README（简介/功能/开发命令/加载步骤/Notion 配置/隐私/已知限制/打包）

### 修改文件
- `docs/RELEASE_CHECKLIST.md` — 重写：对齐实际 manifest 权限、按 TEST_PLAN 组织测试项、增加打包待办
- `docs/PRIVACY_POLICY_DRAFT.md` — 重写：详细说明数据收集/发送/存储/第三方/不做事项，中英双语
- `docs/STORE_LISTING_DRAFT.md` — 重写：修正权限清单对齐实际 manifest、增加 v0.1 限制声明、截图建议、审核说明
- `docs/PERMISSION_JUSTIFICATION.md` — 重写：对齐实际 manifest 权限配置、区分 content_scripts 和 host_permissions、增加审核话术
- `package.json` — 新增 `"zip"` 脚本（PowerShell 打包 dist 为 clipmate-v0.1.zip）
- `docs/CURRENT_STATUS.md` — 更新为 Session 5 完成状态
- `docs/CHANGELOG_AGENT.md` — 本条记录
- `docs/TEST_LOG.md` — Session 5 运行记录
- `docs/ISSUES.md` — 新增 I-016（图标缺失），更新 I-003（隐私政策已定稿）
- `docs/DECISIONS.md` — 新增 D-034（打包方式选择）

### 改动摘要
- **测试计划**：创建 16 项测试用例（TC-01~TC-16）覆盖安装/UI/提取/复制/Notion/错误/隐私/打包全流程
- **QA 模板**：可勾选模板，按测试分类组织，方便手动填写结果
- **隐私政策**：详细说明数据流向（Token 仅本地存储、剪藏内容直接发 Notion API）、明确 6 项「不做事项」、中英双语
- **商店文案**：修正权限说明、增加 v0.1 限制声明、截图建议、审核 Notes for Certification
- **权限说明**：对齐 manifest.config.ts 实际权限（activeTab/storage/host_permissions api.notion.com/content_scripts all_urls）、区分 content_scripts 和 host_permissions、增加审核话术
- **README**：含项目简介/v0.1 功能/开发命令/Edge 加载步骤/Notion 配置/隐私/已知限制/打包说明
- **打包**：`npm run zip` 生成 clipmate-v0.1.zip（77.7KB），仅含 dist 产物，不包含源码/测试/文档/node_modules
- **图标警告**：public/icons/ 为空，上架前需补充 PNG 图标
- 构建：80 modules, 756ms
- Lint：0 errors, 0 warnings
- 测试：80 passed
- Zip：clipmate-v0.1.zip (77.7KB)

---

## Session 4.2.1：复测问题二次修复 (2026-06-10)

### 修改文件
- `src/platforms/notion/blocks.ts` — 长备注切分后所有 chunk 都生成 callout block（📝图标）
- `src/content/parser/htmlToMarkdown.ts` — 新增 `mergeAdjacentBold` 函数
- `src/shared/utils/formatMarkdown.ts` — 重写 `cleanMarkdown` 为迭代合并相邻粗体
- `tests/notion-blocks.test.ts` — 重写长备注测试
- `tests/shared-utils.test.ts` — 重写 cleanMarkdown 测试（10 tests）
- 构建：80 modules, 776ms | Lint：0 | 测试：80 passed

---

## Session 4.2 ~ Session 0

（详见 CHANGELOG_AGENT.md 历史记录）
