# DECISIONS.md — ClipMate v0.1 / v0.2 技术决策记录

> 所有重要技术取舍必须记录在此，附带原因。后续轮次不能随意推翻。

---

## v0.2 Session 6 决策

### D-073：包名版本号在 Session 6 升级到 0.2.0

- **原因**：D-045 已决策「package.json 和 manifest 版本号在 Session 6 才改为 0.2.0」。Session 6 是文档和打包 Session，版本号在此升级最合适。Session 0-5.2 完成所有功能开发和测试，代码稳定。
- **影响**：`package.json` version = `0.2.0`，`manifest.config.ts` version = `0.2.0`，`dist/manifest.json` version = `0.2.0`。
- **可反转性**：高。可随时改回。

### D-072：zip 文件名使用 clipmate-v0.2.zip

- **原因**：`npm run zip` 打包脚本输出文件名应与版本号一致，方便辨识 v0.2 产物。v0.1 使用 `clipmate-v0.1.zip`。
- **影响**：zip 脚本中输出文件名改为 `clipmate-v0.2.zip`。
- **可反转性**：高。可随时改名。

### D-071：v0.2 文档明确本地历史记录存储完整 Markdown

- **原因**：D-040 已决策「历史记录保存 markdown」。Session 6 的隐私政策、权限说明、README 中需明确声明历史记录包含完整 Markdown、以及其用途（重新复制和重试保存），提升透明度。
- **影响**：PRIVACY_POLICY_DRAFT.md 详细列出历史记录包含的数据字段。README 增加历史记录说明章节。
- **可反转性**：高。文档可随时调整。

### D-070：v0.2 不新增 manifest 权限（在文档中重申）

- **原因**：D-036 已决策「v0.2 不新增 manifest 权限」。Session 6 在 PERMISSION_JUSTIFICATION.md 和 STORE_LISTING_DRAFT.md 中明确声明 v0.2 权限与 v0.1 完全一致，并增加权限对比表。商店上架时为审核人员提供清晰说明。
- **影响**：无代码变更。
- **可反转性**：不适用（为已有决策的文档化）。

---

## v0.2 Session 5.2 决策

### D-069：摘要优先级修正 — description 优先，备注不作为摘要首位

- **原因**：备注是用户个人笔记，不应占据主摘要位置。页面描述（description）更能代表网页内容，应作为第一优先级。
- **影响**：`getHistorySummary` 优先级从 `notePreview > contentPreview > body > url` 改为 `descriptionPreview > contentPreview > body > url`。备注匹配信息仍通过"备注匹配" tag 独立显示。
- **可反转性**：高。

### D-068：真实 favicon 优先，域名首字母仅作为 fallback

- **原因**：Session 5.1 的域名首字母头像方案给所有网站显示相同风格的首字母，无法区分同一域名但不同网站。真实 favicon 能提供更好的视觉识别。
- **影响**：Content Script 新增 `extractSiteIconUrl`（从 `<link rel>` 提取，优先级 `apple-touch-icon` > `icon` > `shortcut icon` > `mask-icon` > `/favicon.ico`）。HistoryItem 渲染 `<img src={siteIconUrl}>`，`onError` 隐藏图片并 fallback 域名首字母。旧历史无 `siteIconUrl` 字段时直接显示首字母。
- **可反转性**：高。可回退到仅首字母方案。

### D-067：图标 URL 来自当前页面 DOM，不调用第三方 favicon 服务

- **原因**：D-038 已决策「v0.2 不新增第三方 API」。通过 `document.querySelectorAll('link')` 遍历 DOM 提取图标无需网络请求，无需新增权限。
- **影响**：不依赖 Google favicon、FaviconKit 等第三方服务。相对路径用 `new URL(href, baseUrl)` 解析。无法获取的网站 fallback 到 `/favicon.ico`。
- **可反转性**：中。若未来需要更准确的图标，可添加缓存服务。

### D-068：新增字段均为可选，旧历史记录无需迁移

- **原因**：`siteName` / `siteIconUrl` / `themeColor` / `descriptionPreview` 均为可选字段。旧 `ClipHistoryItem` 不含这些字段时，UI 自动 fallback 到现有逻辑（首字母头像、contentPreview 摘要等）。
- **影响**：无破坏性变更。`addHistoryItem` 和 `CreateHistoryItemInput` 新增可选字段，不传时 storage 中不存储 undefined。
- **可反转性**：低（字段一旦写入历史，移除需清理存储，但可选字段不影响旧数据读取）。

### D-066：历史摘要跳过 Markdown/HTML 图片，不显示图片语法

- **原因**：文章开篇图片导致摘要显示 `![](url)` 等 Markdown 语法，非常难看。`stripMarkdownImages` 纯函数在取摘要前移除所有 `![]()` / `[![]()]()` / `<img>` 标签。多张连续图片开篇会继续向后寻找文本。全图片内容则回退 URL/domain。
- **影响**：`getHistorySummary` 在取 contentPreview 和 markdown body 时均先过 `stripMarkdownImages` + `normalizeSummaryText`。
- **可反转性**：高。

---

## v0.2 Session 5.1 决策

### D-066：搜索高亮不展示完整正文，只显示匹配 tag

- **原因**：正文可能长达数万字，展示全文会撑爆 UI 且泄露隐私。正文匹配通过"正文匹配" tag 提示用户即可。搜索命中 notePreview 显示"备注匹配" tag，命中 targetName 显示"目标匹配" tag。
- **影响**：HistoryItem 在匹配正文但未命中标题/URL 时显示橙色"正文匹配" tag。
- **可反转性**：高。

### D-065：网站图标使用域名首字母圆形头像 + getStableSiteColor 同色

- **原因**：不调用第三方 favicon API（禁止新增外部调用），本地生成域名首字母头像是最安全方案。头像颜色与左侧色条使用同一颜色（getStableSiteColor）。域名首字母通过 `getSiteInitial` 取域名第一个 Unicode code point 大写。
- **影响**：每条历史卡片左侧显示域名首字母圆形头像，不依赖任何外部服务。
- **可反转性**：高。后续可扩展为 favicon 缓存。

### D-064：同站统一色条使用 domain hash + 固定 12 色调色板

- **原因**：同一域名必须稳定得到同一颜色（用户预期的视觉分组），不允许随机色。djb2 hash(domain) % 12 取色盘索引，保证确定性。空 domain 返回灰色 `#6B7280`。
- **影响**：HistoryItem 左侧 `borderLeftColor` 由 `getStableSiteColor(getHostname(item.url))` 决定，替换旧的 saveStatus 颜色色条（状态仍由 badge 显示）。
- **可反转性**：高。调色板可扩展。

### D-063：Popup draft 恢复前比较 active tab URL，不同则 auto-extract

- **原因**：用户在同一网站切换文章后打开 Popup，不应恢复旧文章的 title/content/markdown。判断粒度为完整 URL（非 domain），避免同站不同文章被错误恢复。
- **影响**：`App.tsx` 的 `useEffect` 中 `Promise.all([getLastClipDraft(), chrome.tabs.query()])` 比较后决定。URL 相同 → 恢复全量（含 tags/note）；URL 不同 → 不恢复内容，触发 auto-extract。无 draft → auto-extract 不变。
- **可反转性**：中。需要同步改 Popup 启动流程。

---

## v0.2 Session 5 决策

### D-062：retry 保存复用现有 Background SAVE_TO_NOTION 链路

- **原因**：避免在 Options 中直接调用 Notion API，保持保存逻辑集中在 Background。通过在 `SaveToNotionPayload` 中增加 `sourceHistoryId` 和 `historyWriteMode` 两个可选字段实现 retry 的差异化行为。
- **影响**：Background `handleSaveToNotion` 在收到 `historyWriteMode='update'` 时调用 `updateHistoryItem` 而非 `addHistoryItem`。普通 Popup 保存不传这两个字段，行为不变。
- **可反转性**：中。需同步改 message types 和 Background handler。

### D-061：retry 更新原历史记录而非新增重复

- **原因**：D-044 已决策「重试保存时使用用户选择的目标」。retry 的成功/失败应更新同一条原历史记录（saveStatus/savedAt/errorCode/targetId/targetName），避免历史列表中重复出现同一次剪藏的多次记录。
- **影响**：`historyWriteMode='update'` 通过 `updateHistoryItem(sourceHistoryId, ...)` 更新原记录。普通 Popup 保存仍通过 `addHistoryItem` 新增记录。
- **可反转性**：低。如果改为新增模式，历史列表会膨胀。

### D-060：History UI 放在 Options tab 内，不新增独立页面

- **原因**：继承 D-046 决策「History UI 放在 Options 页面内」。通过顶部 tab 切换（设置 / 剪藏历史），不修改 manifest，不新增 options_ui 入口。
- **影响**：App.tsx 新增 `activeTab` 状态和 tab 切换 UI。HistoryTab 组件独立渲染，与设置表单解耦。
- **可反转性**：高。后续可改为独立页面。

---

## v0.2 Session 4.1 决策

### D-059：Popup TargetSelector 不显示 Page ID 预览

- **原因**：用户只需通过名称区分目标，Page ID 预览增加视觉噪音。Session 4 的 `(maskPageId)` 显示对日常使用无意义。Options 管理页仍保留脱敏 Page ID 用于辨认。
- **影响**：`TargetSelector.tsx` 移除 `maskPageId` 调用和导入，option 文案只有 `t.name`。Popup 纯函数 `maskPageId` 保留供其他用途。
- **可反转性**：高。

### D-058：extractNotionPageId 自动忽略 URL hash

- **原因**：Notion 页面 URL 中 # 后是块定位 ID（如 `#37c5fa028348810a9305d7476a1bd017`），不应作为目标页面 ID。`new URL().pathname` 天然排除 hash，安全可靠。
- **影响**：`extractNotionPageId` 通过 URL 解析忽略 hash，用户粘贴含 # 的链接时自动取正确页面 ID。
- **可反转性**：高。若未来需要支持块定位，可扩展返回结构。

### D-057：extractNotionPageId 集成到 addTarget/updateTarget 验证层

- **原因**：pageId 归一化应发生在数据入口（addTarget/updateTarget），确保存储中始终是 32 位 hex。TargetEditor 作为 UI 层也做预归一化（提前显示错误），但最终验证以 targetManager 为准。
- **影响**：`addTarget`/`updateTarget` 不再接受任意短字符串作为 pageId。不合法的输入抛出明确错误消息。已有测试中所有短 pageId 字符串（`'page-work'`、`'new-page'` 等）替换为合法 32 位 hex。
- **可反转性**：低。回退需要同时修改 targetManager 验证、TargetEditor 归一化、所有相关测试。

---

## v0.2 Session 4 决策

### D-056：历史写入在 Background Service Worker 中执行

- **原因**：Background 是保存链路的终点，同时拥有 settings（控制 saveHistoryEnabled）和 Notion API 结果（成功/失败/errorCode）。在 Popup 中写入需要额外传递结果状态，增加消息往返和重复写入风险。
- **影响**：`notionHandler.ts` 负责在 Notion API 调用后调用 `addHistoryItem`。Popup 不感知历史写入。
- **可反转性**：中。若需支持"复制 Markdown"写入 unsaved 历史，可在 Popup 中直接调 `addHistoryItem`。

### D-055：SaveToNotionPayload 改为包含 target 信息的接口，不再只是 ClipDraft 别名

- **原因**：v0.1 的 `SaveToNotionPayload = ClipDraft` 无法携带目标信息。Popop 需要把 `targetId`、`targetName`、`pageId` 传给 Background。改为接口 `{ draft, targetId?, targetName?, pageId }` 是最小侵入方案。
- **影响**：Popup 的 `useSaveToNotion.save()` 和 Background 的 `handleSaveToNotion()` 签名变更。旧 `SaveToNotionPayload` 类型引用已全部更新。
- **可反转性**：中。需要同步改 Popup 和 Background 两端。

### D-054：resolveSelectedTarget 用纯函数实现，空 defaultTargetId 回退首个 target

- **原因**：`defaultTargetId` 可能为空字符串（未设置）或指向已删除的目标。纯函数方便测试（7 tests）。回退逻辑简单明确：有匹配则用匹配，否则用首个。
- **影响**：Popup 在 `getSettings()` 后调用 `resolveSelectedTarget(s.notionTargets, s.defaultTargetId)` 确定初始选中。若用户首次使用且无 target，显示提示而非下拉。
- **可反转性**：高。

---

## v0.2 Session 3 决策

### D-053：目标操作即时持久化，不依赖全局保存按钮

- **原因**：add/edit/delete/setDefault 是原子操作，用户完成操作后应立即生效。Token 和标签修改频率低，仍使用全局保存按钮。
- **影响**：App.tsx 中对目标操作单独调用 `saveSettings` 写入 storage，不使用 `handleSave`。
- **可反转性**：高。可改为统一全局保存。

### D-052：抽出 targetManager 纯函数

- **原因**：目标 CRUD 逻辑不依赖 React 和 chrome API，抽出为纯函数方便单元测试。32 项测试覆盖所有核心逻辑和边界场景。
- **影响**：`src/options/utils/targetManager.ts` 不导入 React/chrome，所有函数输入输出纯数据。
- **可反转性**：高。可合并回组件内部。

---

## v0.2 Session 2 决策

### D-051：clipmate-v0.1/ 作为 v0.1 冻结快照，clipmate-v0.2/ 作为 v0.2 开发目录

- **原因**：v0.2 Session 0 和 Session 1 的开发成果位于 `clipmate-v0.1/` 目录内，混淆了 v0.1 和 v0.2 代码。创建独立 `clipmate-v0.2/` 目录，允许 v0.1 和 v0.2 并行存在且互不干扰。v0.1 冻结快照可供后续参考和回退。
- **影响**：后续所有 v0.2 开发在 `clipmate-v0.2/` 中进行。v0.2.1、v0.3 等后续版本将各自独立复制工作区。Session 编号因插入 S2（版本目录隔离与迁移）而全部顺延 1 位。
- **可反转性**：低。一旦后续 Session 在 clipmate-v0.2/ 中开发，合并回 clipmate-v0.1/ 成本高。本决策为正向设计。

---

## v0.2 Session 1 决策

### D-050：SaveStatus 类型放 clip.types.ts 而非 settings.types.ts

- **原因**：`SaveStatus` 与剪藏数据语义更近（clipping 生命周期），且 `ClipHistoryItem` 导入 from clip.types。后续 Popup 和 Content Script 也可能引用 SaveStatus。
- **影响**：`settings.types.ts` 导入 `SaveStatus` from `clip.types.ts`。
- **可反转性**：高。

### D-049：historyLimit 在 saveSettings 中 clamp 到 [10, 500]

- **原因**：防止用户误设极端值（0 或 10000）。10 保证历史记录有意义，500 防止 storage 压力过大。
- **影响**：用户设置 3 会被自动调整为 10。`addHistoryItem` 中也有安全阀。
- **可反转性**：高。范围可调整。

### D-048：notionTargets 存在 settings 内部存储，非独立 key

- **原因**：notionTargets 是 settings 的一部分（属于 V2 新增字段），与 notionToken/notionPageId/defaultTags 在同一层。分拆存储会增加读写次数和一致性风险。
- **影响**：任何 settings 的读写操作都会同时携带 targets 数据。当前 targets 数据量极小（每个 target < 200 字节），无性能问题。
- **可反转性**：中。如果 targets 未来变大（>1000 条），可拆分为独立 key。

### D-047：本 Session 不修改 message.types.ts 中的 SaveSettingsPayload

- **原因**：`SaveSettingsPayload = Partial<ClipMateSettings>` 在 v0.2 中仍然可用，因为 `ClipMateSettingsV2 extends ClipMateSettings`，所以 `Partial<ClipMateSettingsV2>` 赋值给 `Partial<ClipMateSettings>` 兼容。等 Session 2/3 需要新字段时再调整。
- **影响**：当前 Popup/Options 的 `saveSettings` 调用不感知 V2 字段，类型编译通过。
- **可反转性**：高。

---

## v0.2 Session 0 决策

### D-046：History UI 放在 Options 页面内，不新增独立 history page

- **原因**：避免 manifest 变化（不新增 options_ui / action 入口）。Options 页面已有 tab 结构基础，新增"剪藏历史" tab 即可承载全部 UI。
- **影响**：History 在 Options 页面内访问，非 Popup 内。用户需打开 Options 查看历史。
- **可反转性**：高。后续可改为独立 page 或在 Popup 中嵌入。

### D-045：package.json 和 manifest 版本号在 Session 5 才改为 0.2.0

- **原因**：避免开发过程中半成品混淆。Session 0-4 代码仍在 0.1.0 标记下开发。
- **影响**：npm run build 产出的 manifest 版本仍为 0.1.0，直到 S5。
- **可反转性**：高。

### D-044：重试保存时原目标不存在，要求用户重新选择目标

- **原因**：避免保存到错误目标。历史记录中 targetId 对应的目标可能已被用户删除。
- **影响**：重试流程多一步用户交互。
- **可反转性**：高。后续可改为自动选择默认目标。

### D-043：历史记录保留 targetName 快照

- **原因**：目标被删除后仍可查看历史记录的来源目标名称，提升数据可读性。
- **影响**：ClipHistoryItem 增加 targetName 字段，storage 占用略增。
- **可反转性**：高。名称快照是冗余字段，可移除。

### D-042：删除 Notion 目标时，不删除历史记录

- **原因**：历史记录是用户剪藏数据，不应因目标管理操作而丢失。
- **影响**：删除目标后，历史记录中 targetId 悬空，UI 显示"目标已删除"。
- **可反转性**：低。一旦实现删除级联，恢复困难。本决策为正向设计。

### D-041：单条历史 markdown 建议限制约 50000 字符

- **原因**：防止单条记录过大（超长文章）占用过多 storage。超出截断并标记 markdownTruncated = true。
- **影响**：超长文章可能丢失尾部内容，但用户可从原始网页重新剪藏。
- **可反转性**：高。阈值可调整。

### D-040：历史记录保存 markdown

- **原因**：用于重新复制 Markdown 到剪贴板和重试保存。不保存 markdown 则无法实现这两个核心功能。
- **影响**：storage 占用增加，需在隐私政策中声明。
- **可反转性**：低。如果移除 markdown 存储，需重新设计复制和重试机制。

### D-039：historyLimit 默认 100

- **原因**：平衡用户需求（足够的历史记录）与 storage 压力（chrome.storage.local 约 5MB+）。用户可在 Options 中调整（最小 10，最大 500）。
- **影响**：默认保留 100 条，超出自动清理最早记录。
- **可反转性**：高。默认值和范围可调整。

### D-038：v0.2 继续只调用 Notion API，不新增第三方 API

- **原因**：保持最小外部依赖。历史记录全存本地，无新增网络请求。
- **影响**：无。
- **可反转性**：高。

### D-037：v0.2 继续使用 chrome.storage.local

- **原因**：历史记录可能超过 sync 100KB 限制；clipmate 无云同步需求。
- **影响**：数据仅在本地浏览器可用，换设备后历史不跟随。
- **可反转性**：中。可后续添加 sync 用于轻量配置同步。

### D-036：v0.2 不新增 manifest 权限

- **原因**：所有功能基于现有权限（activeTab / storage / host_permissions api.notion.com / content_scripts all_urls）完成。新增权限增加 Edge Add-ons 审核风险。
- **影响**：v0.2 manifest 权限与 v0.1 完全一致。
- **可反转性**：中。若未来确实需要新权限，需提交审核。

---

## Session 5.1 决策

### D-035：zip 脚本改用 .NET ZipFile API，不再依赖 PowerShell Archive 模块

- **原因**：`Import-Module Microsoft.PowerShell.Archive` 在执行策略 Restricted 的系统上不可用。改用 `[System.IO.Compression.ZipFile]::CreateFromDirectory()` 是 .NET Framework 内置 API，无需加载外部模块，不受执行策略限制。
- **影响**：`npm run zip` 在所有 Windows 系统上可用（.NET Framework 3.0+ 内置）。macOS/Linux 不可用。
- **可反转性**：高。可后续添加跨平台方案。

---

## Session 5 决策

### D-034：打包方式使用 PowerShell `Compress-Archive`，不引入 Node 打包依赖

- **原因**：避免引入 `archiver`、`jszip`、`bestzip` 等第三方依赖，减少 `node_modules` 体积和供应链风险。`Compress-Archive` 是 Windows 内置 PowerShell cmdlet，无需额外安装。若未来需要跨平台打包，可添加平台检测和 fallback。
- **影响**：`npm run zip` 仅在 Windows PowerShell 下可用。macOS/Linux 需要手动 zip 或其他方式。
- **可反转性**：高。后续可替换为 Node.js 打包库。

---

## Session 4.2.1 决策

### D-033：cleanMarkdown 使用迭代正则合并相邻粗体

- **原因**：此前简单替换导致 `**A**B**` 孤儿，改为自定义 regex 精确匹配。HTML 预合并已从源头解决 6 星号边缘情况。
- **可反转性**：高。

### D-032：htmlToMarkdown 转换前合并相邻粗体标签

- **原因**：turndown 将相邻 `<strong>A</strong><strong>B</strong>` 转为 `**A****B**`，Markdown 后处理难以完美恢复。从 HTML 源头合并标签是更干净的方案。
- **可反转性**：高。

---

## Session 4.2 决策

### D-028~D-031

（详见 Session 4.2 CHANGELOG）

---

## Session 4.1 决策

### D-025~D-027

（详见 Session 4.1 CHANGELOG）

---

## Session 4 决策

### D-021~D-024

（详见 Session 4 CHANGELOG）

---

## Session 3.1 决策

### D-018~D-020

（详见 Session 3.1 CHANGELOG）

---

## Session 3 决策

### D-014~D-017

（详见 Session 3 CHANGELOG）

---

## Session 2 决策

### D-010~D-013

（详见 Session 2 CHANGELOG）

---

## Session 0 决策

### D-001~D-009

| 编号 | 决策 | 状态 |
|------|------|------|
| D-001 | v0.1 仅支持 Notion | 仍在遵守 |
| D-002 | 手动 Token + Page ID | 仍在遵守 |
| D-003 | fullpage + selection 两种模式 | 仍在遵守 |
| D-004 | 支持复制 Markdown | 仍在遵守 |
| D-005 | chrome.storage.local | 仍在遵守 |
| D-006 | 不做付费 | 仍在遵守 |
| D-007 | 不做 AI | 仍在遵守 |
| D-008 | 不做 OCR 和截图回退 | 仍在遵守 |
| D-009 | Vite + React + TS + Tailwind + crxjs | 仍在遵守 |
