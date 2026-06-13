# CHANGELOG_AGENT.md — ClipMate v0.4 每轮修改记录

> 每轮 agent 结束后更新，记录修改文件清单和改动摘要。

---

## v0.4 Session 1：Page Type Detector (2026-06-13)

### 产出

- `src/shared/utils/pageTypeDetector.ts` — 通用页面类型检测器
- `tests/page-type-detector.test.ts` — 42 个单元测试

### 新增/修改文件

- `src/shared/utils/pageTypeDetector.ts` — 新增：纯函数检测模块
  - 导出 `PageType` 类型（7 类）
  - 导出 `PageTypeDetectionSignals` 接口
  - 导出 `PageTypeDetectionResult` 接口
  - 导出 `detectPageType(input)` 纯函数
  - 导出 `extractSignalsFromDocument(doc)` DOM 提取函数
  - 导出 `detectPageTypeFromDocument(doc)` 便捷包装
  - 6 个内部 assessor：assessArticle / assessSearchResults / assessNavigation / assessForumOrComment / assessVideo / assessAiAnswer
- `src/content/extractors/articleBoundaryGuard.ts` — 修改：
  - 导入新 detector，替换旧 `classifyPageType` 实现
  - 保持 `classifyPageType` 对外签名不变
  - `buildLowConfidenceSummary` 新增 forum-or-comment / video / ai-answer 的提示文案
- `src/shared/utils/index.ts` — 新增 `pageTypeDetector` 导出
- `tests/article-boundary-guard.test.ts` — 修改：
  - `makeDom` 函数新增 `title` 参数支持
  - Baidu 搜索测试适配新 detector（URL + title 参数）
- `tests/page-type-detector.test.ts` — 新增：42 个测试覆盖 7 类类型 + 混合场景 + 脱敏检查

### 改动摘要

- 实现通用页面类型检测器，从旧的 4 类扩展到 7 类
- 检测逻辑为纯函数，可独立单元测试，无外部依赖
- 旧 `classifyPageType` 已安全接入新 detector，保持向后兼容
- 检测结果作为 metadata/report 辅助，不改变保存策略
- 所有规则基于通用启发式（URL/title/DOM 结构），无站点硬编码
- lint 0，799 tests 全部通过，build 成功
- 未新增权限、未新增依赖、未修改版本号

---

## v0.4 Session 0：工作区创建与规划审查 (2026-06-13)

### 产出

- `clipmate-v0.4/` — 从 v0.3 复制的完整项目目录（排除 node_modules/dist/build/coverage/*.zip/.env/.wolf/.opencode/.playwright-mcp）
- `feature/clipmate-v0.4-site-profiles` — 新开发分支

---

*（v0.4 之前版本的修改记录见 clipmate-v0.3/docs/CHANGELOG_AGENT.md）*
