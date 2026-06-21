# RELEASE_CHECKLIST.md - ClipMate v0.9.0

更新日期：2026-06-19

## 版本

- [x] package、lockfile、manifest 均为 0.9.0。
- [x] 从 v0.8.5 冻结提交创建独立分支和 `clipmate-v0.9/`。
- [x] v0.8 及更早目录未修改。

## 功能

- [x] 页面类型驱动模式推荐和固定理由。
- [x] 主要模式显隐，“更多模式”可恢复全部模式。
- [x] 高置信度视频/AI 页首次自动采用。
- [x] 选区、恢复草稿和用户手动选择禁止自动覆盖。
- [x] detector/推荐失败保持全文降级。

## 安全与隐私

- [x] 页面感知不包含原始 DOM、正文、选区文本、URL 或 detector signals。
- [x] 无新增权限、host permission、远程 API、依赖或 storage schema。
- [x] React 正常文本渲染，测试确认固定理由即使被篡改也会转义。
- [ ] 正式发布前使用测试凭据完成真实 Notion 冒烟。

## 验证

- [x] lint 通过。
- [x] 62 files / 2028 tests 通过。
- [x] build 通过，168 modules transformed。
- [x] Playwright 验证视频推荐、自动采用、更多模式和用户覆盖。
- [ ] Chrome 与 Edge 分别加载 unpacked `dist` 做商店前冒烟。

## 发布

- [x] `npm audit --omit=dev` 为 0 漏洞；开发工具链告警已记录。
- [x] 生成并核验 `clipmate-v0.9.zip`：948206 bytes / 28 entries。
- [x] 显式 stage v0.9 与项目级交接文档。
- [x] commit `codex/clipmate-v0.9-page-aware`。
- [ ] push `codex/clipmate-v0.9-page-aware`（本地发布提交已完成，等待远端网络权限恢复）。
