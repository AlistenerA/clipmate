# CHANGELOG_AGENT.md — ClipMate v0.1 / v0.2 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

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
