# ISSUES.md — ClipMate v0.5 已知问题追踪

---

## v0.5 Session 5 状态

- 52 个 fixture QA 测试全部通过，覆盖 12 个站点场景
- extractArticleImages / Markdown / Notion blocks / Popup/History 全链路验证通过

---

## 文章图片保存问题状态

| 编号 | 问题 | 级别 | 状态 |
|:---:|------|:---:|:---:|
| IS22 | 懒加载图片 (data-src / loading="lazy") 可能无 src 属性 | major | ✅ Session 1+2：Turndown img rule 处理 data-src/data-original；extractArticleImages 不处理（IS29） |
| IS23 | srcset 归一化可能丢失多倍图或分辨率信息 | minor | ✅ Session 1 处理 |
| IS24 | 跨域图片 URL 可能在 Notion 无法正常显示 | major | ⚠️ Session 3 已实现 image block；未执行真实 Notion save QA，待人工验证 |
| IS25 | 失效外链图片显示 broken image | minor | 已知限制，不处理 |
| IS26 | base64/blob 图片 URL 处理策略未定 | minor | ✅ Session 1+2+3 全链路过滤 |
| IS27 | 图片数量过多影响 Notion block 保存性能 | minor | ✅ Session 1：默认 maxImages=20 |
| IS28 | 噪声图片 (icon/avatar/logo/tracking/pixel/emoji) 误保留 | medium | ✅ Session 1+2 全链路过滤 |
| IS29 | extractArticleImages.getBestSrc 不处理 data-src/data-original 等懒加载属性 | minor | 🆕 Session 5 QA 发现：Turndown img rule 正确处理，extraction 层面仅处理 src/currentSrc/el.src |
| IS30 | markdownToContentBlocks 当前仅输出 paragraph/image blocks，不处理 heading | minor | 🆕 Session 5 QA 发现：heading markdown 作为 paragraph block 输出，功能正确但不精确 |
| IS31 | "ad-banner" class 不在已知噪声 class 列表中 | minor | 🆕 Session 5 QA 发现：广告图类名多样性（ad-banner/ad-bnr/ad-image 等），已知局限 |

---

## v0.3 继承问题（后续单独评估，不混入 v0.5 Session 0）

详见 `clipmate-v0.4/docs/ISSUES.md`：
- CSDN/LaTeX 渲染残留
- 搜索页/导航页分类体验
- 本地 .md 保存
- 复制历史
- Bilibili selection-generic 降级
- Notion raw markdown 输出
