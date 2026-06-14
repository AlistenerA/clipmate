# ISSUES.md — ClipMate v0.5 已知问题追踪

---

## v0.5 Session 1 状态

- 实现 `src/content/extractors/articleImages.ts`
- 62 个新测试覆盖图片提取、噪声过滤、去重、限制
- lint 0 / 1753 tests pass / build success

---

## 文章图片保存问题状态

| 编号 | 问题 | 级别 | 状态 |
|:---:|------|:---:|:---:|
| IS22 | 懒加载图片 (data-src / loading="lazy") 可能无 src 属性 | major | ✅ Session 1 处理：getBestSrc 检查 src/currentSrc/el.src，配合 Session 5 QA 验证 |
| IS23 | srcset 归一化可能丢失多倍图或分辨率信息 | minor | ✅ Session 1 处理：srcset 候选取最高 descriptor，getSrcsetCandidate 辅助函数已实现 |
| IS24 | 跨域图片 URL 可能在 Notion 无法正常显示 | major | ⏳ 待 Session 3 验证 |
| IS25 | 失效外链图片显示 broken image | minor | 已知限制，不处理 |
| IS26 | base64/blob 图片 URL 处理策略未定 | minor | ✅ Session 1 决定：默认过滤 data/blob URI，allowDataUri 选项可保留 data URI |
| IS27 | 图片数量过多影响 Notion block 保存性能 | minor | ✅ Session 1 处理：默认 maxImages=20，可配置 |
| IS28 | 噪声图片 (icon/avatar/logo/tracking/pixel/emoji) 误保留 | medium | ✅ Session 1 处理：class/id 关键词过滤 + URL 模式过滤 + tracking pixel 检测 + minWidth/minHeight 过滤 |

---

## v0.3 继承问题（后续单独评估，不混入 v0.5 Session 0）

详见 `clipmate-v0.4/docs/ISSUES.md`：
- CSDN/LaTeX 渲染残留
- 搜索页/导航页分类体验
- 本地 .md 保存
- 复制历史
- Bilibili selection-generic 降级
- Notion raw markdown 输出
