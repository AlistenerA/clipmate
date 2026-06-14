# ISSUES.md — ClipMate v0.5 已知问题追踪

---

## v0.5 Session 5.1 状态

- 28 个 Sina 防污染测试全部通过
- 推荐区/热搜区/侧栏图片不再污染 ## Images
- 不兼容 Notion external image URL 降级为 paragraph
- ~~IS29（extraction 不处理 data-src）~~ — 仍为 minor，Turndown 正确处理
- ~~IS32（Sina 图片污染）~~ — Session 5.1 修复 → ✅
- ~~IS33（Notion URL 不兼容）~~ — Session 5.1 修复 → ✅

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
| IS32 | Sina 推荐区/热搜区/侧栏缩略图进入 ## Images 区块 | major | ✅ Session 5.1 修复：injectMissingImages 改为基于正文 HTML fragment + ancestor 噪声检测 |
| IS33 | Sina resize/proxy 图片 URL 在 Notion 无法渲染 | major | ✅ Session 5.1 修复：isLikelyDirectImageHosting() 过滤不兼容 URL 并降级为 paragraph |
| IS34 | 图片题注与 Markdown 图片语法粘连在同一行 | major | ✅ Session 5.2 修复：splitImageCaptionGlue() 拆分 + markdownToContentBlocks 合并 caption |
| IS35 | Notion image block 未正确吸收 `*caption*` 题注 | major | ✅ Session 5.2 修复：indexed loop 识别图片后紧跟 italic 并合并为 image.caption |
| IS36 | Markdown/Notion 图片居中 | minor | 已知限制：Notion API 不支持稳定设置 image block align。复制 Markdown 居中 HTML 暂缓（P2，会引发兼容性风险）|

---

## v0.3 继承问题（后续单独评估，不混入 v0.5 Session 0）

详见 `clipmate-v0.4/docs/ISSUES.md`：
- CSDN/LaTeX 渲染残留
- 搜索页/导航页分类体验
- 本地 .md 保存
- 复制历史
- Bilibili selection-generic 降级
- Notion raw markdown 输出
