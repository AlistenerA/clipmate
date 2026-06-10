# CHANGELOG_AGENT.md — ClipMate v0.1 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

---

## Session 5.1：图标资源应用与重新打包 (2026-06-10)

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
