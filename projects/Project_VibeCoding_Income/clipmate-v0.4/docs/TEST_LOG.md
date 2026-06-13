# TEST_LOG.md — ClipMate v0.4 测试记录

> 记录每轮运行过的命令、结果、错误。不隐藏失败。

---

## v0.4 Session 2 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 23 文件 861 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：通过（无输出）
- `npm run test`：23 个测试文件，861 个测试，全部通过
- `npm run build`：构建成功，102 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| site-profile-engine.test.ts | 62 | ✅ 全部通过（新增）|
| 其余 22 个测试文件 | 799 | ✅ 全部通过（无退化）|

### 产出

- `src/shared/siteProfiles/siteProfile.types.ts` — ~40 lines
- `src/shared/siteProfiles/seedProfiles.ts` — ~160 lines
- `src/shared/siteProfiles/siteProfileEngine.ts` — ~120 lines
- `src/shared/siteProfiles/index.ts` — ~5 lines
- `tests/site-profile-engine.test.ts` — ~330 lines

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 861 tests pass ✅
- build success ✅

### 错误/失败

无。

---

## v0.4 Session 1 (2026-06-13)

### 运行命令

```bash
npm run lint    # eslint src --ext .ts,.tsx
npm run test    # vitest run (完整 22 文件 799 tests)
npm run build   # tsc --noEmit && vite build
```

### 结果

- `npm run lint`：通过（无输出）
- `npm run test`：22 个测试文件，799 个测试，全部通过
- `npm run build`：构建成功，102 modules，dist/ 产出正常

### 测试详情

| 测试文件 | 测试数 | 结果 |
|----------|:---:|:---:|
| article-boundary-guard.test.ts | 111 | ✅ 全部通过 |
| page-type-detector.test.ts | 42 | ✅ 全部通过（新增）|
| 其余 20 个测试文件 | 646 | ✅ 全部通过（无退化）|

### 调试/修复历史

- linkCount 字段遗漏：PageTypeDetectionSignals 接口和 extractSignalsFromDocument 缺少 linkCount，已补充
- 信号权重 bug：assessor 在信号缺失时未增加 weightSum 分母，导致 confidence 虚高，已修复为所有信号始终计入 weight
- 导航过度检测：linkCount < 3 时仍可能命中 navigation，已添加 early return guard
- 搜索信号被导航压制：hasSearchInput / title 搜索关键词不在导航评估中考虑，已添加搜索标题信号降权
- 视频被文章压制：视频信号存在时文章仍可高分，已添加视频/iframe 检测对文章的降权
- 短文本被误判 article：textLength < 50 时 article confidence 异常，已添加降权
- makeDom 不支持 title 参数：旧 article-boundary-guard 测试中 makeDom 只接受 bodyHtml，已修改支持 title 参数

### 产出

- `src/shared/utils/pageTypeDetector.ts` — 289 lines
- `tests/page-type-detector.test.ts` — ~550 lines

### 检查项

- 未修改 clipmate-v0.1/ ✅
- 未修改 clipmate-v0.2/ ✅
- 未修改 clipmate-v0.3/ ✅
- 未修改 .wolf/.opencode/.playwright-mcp ✅
- 未修改 package.json version ✅
- 未修改 manifest.config.ts version ✅
- 未新增依赖 ✅
- 未新增 manifest 权限 ✅
- 未运行 npm install ✅
- 未运行 npm run zip ✅
- lint 0 ✅
- 799 tests pass ✅
- build success ✅

### 错误/失败

无。

---

## v0.4 Session 0 (2026-06-13)

### 运行命令

本轮为 docs/workspace setup only 任务。未修改业务代码。
未运行 npm run lint / test / build（本轮无代码变更，不需要）。

---

*（v0.4 之前版本的测试记录见 clipmate-v0.3/docs/TEST_LOG.md）*
