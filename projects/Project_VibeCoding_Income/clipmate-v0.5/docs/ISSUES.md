# ISSUES.md — ClipMate v0.5 已知问题追踪

---

## v0.5 Session 4 状态

- Popup StatusBar 和 HistoryItem 新增轻量图片数量展示（紫色「图片 N」徽章）
- image metadata (imageCount / firstImageUrl / skippedImageCount) 通过 save/retry/failed 路径完整保留
- 18 个新测试 / lint 0 / 1828 tests pass / build success

---

## 文章图片保存问题状态

| 编号 | 问题 | 级别 | 状态 |
|:---:|------|:---:|:---:|
| IS22 | 懒加载图片 (data-src / loading="lazy") 可能无 src 属性 | major | ✅ Session 1 处理 + Session 2 Turndown img rule 检查 data-src/data-original/data-lazy-src/data-lazy |
| IS23 | srcset 归一化可能丢失多倍图或分辨率信息 | minor | ✅ Session 1 处理 |
| IS24 | 跨域图片 URL 可能在 Notion 无法正常显示 | major | ⚠️ Session 3 已实现 image block，但跨域/防盗链 URL 可能仍无法在 Notion 渲染；待 Session 5 QA 验证 |
| IS25 | 失效外链图片显示 broken image | minor | 已知限制，不处理 |
| IS26 | base64/blob 图片 URL 处理策略未定 | minor | ✅ Session 1+2+3 处理：Turndown img rule / extractArticleImages / markdownToContentBlocks 均过滤 |
| IS27 | 图片数量过多影响 Notion block 保存性能 | minor | ✅ Session 1 处理：默认 maxImages=20 |
| IS28 | 噪声图片 (icon/avatar/logo/tracking/pixel/emoji) 误保留 | medium | ✅ Session 1+2 处理：Turndown img rule 使用相同噪声过滤规则 |

---

## v0.3 继承问题（后续单独评估，不混入 v0.5 Session 0）

详见 `clipmate-v0.4/docs/ISSUES.md`：
- CSDN/LaTeX 渲染残留
- 搜索页/导航页分类体验
- 本地 .md 保存
- 复制历史
- Bilibili selection-generic 降级
- Notion raw markdown 输出
