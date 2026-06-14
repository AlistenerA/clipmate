# ISSUES.md — ClipMate v0.5 已知问题追踪

---

## v0.5 Session 6 状态（发布候选）

v0.5 Release Readiness 完成。所有 major 问题已修复，其余为已知限制。

- 1922 个测试全部通过
- lint 0 errors, 0 warnings
- build 成功
- 安全扫描通过
- manifest 权限无变更

---

## 文章图片保存问题状态

| 编号 | 问题 | 级别 | 状态 |
|:---:|------|:---:|:---:|
| IS22 | 懒加载图片 (data-src / loading="lazy") 可能无 src 属性 | major | ✅ Turndown img rule 正确处理 |
| IS23 | srcset 归一化可能丢失多倍图或分辨率信息 | minor | ✅ Session 1 处理 |
| IS24 | 跨域图片 URL 可能在 Notion 无法正常显示 | major | ⚠️ 已实现 image block；待人工真实 Notion save QA 验证 |
| IS25 | 失效外链图片显示 broken image | minor | 已知限制，不处理 |
| IS26 | base64/blob 图片 URL 处理策略 | minor | ✅ 全链路过滤 |
| IS27 | 图片数量过多影响 Notion block 保存性能 | minor | ✅ 默认 maxImages=20 |
| IS28 | 噪声图片误保留 | medium | ✅ 全链路过滤 |
| IS29 | extractArticleImages 不处理 data-src 懒加载属性 | minor | Turndown 正确补偿 |
| IS30 | markdownToContentBlocks 仅输出 paragraph/image blocks | minor | 功能正确 |
| IS31 | "ad-banner" class 不在已知噪声 class 列表中 | minor | 已知局限 |
| IS32 | Sina 推荐区/热搜区图片污染 | major | ✅ Session 5.1 修复 |
| IS33 | Sina resize/proxy 图片 URL 在 Notion 无法渲染 | major | ✅ Session 5.1 修复 |
| IS34 | 图片题注与 Markdown 粘连 | major | ✅ Session 5.2 修复 |
| IS35 | Notion image block 未正确吸收 caption | major | ✅ Session 5.2 修复 |
| IS36 | Markdown/Notion 图片居中 | minor | 已知限制：Notion API 不支持 |

---

## v0.3 继承问题（后续单独评估，不混入 v0.5）

详见 `clipmate-v0.4/docs/ISSUES.md`：
- CSDN/LaTeX 渲染残留
- 搜索页/导航页分类体验
- 本地 .md 保存
- 复制历史
- Bilibili selection-generic 降级
- Notion raw markdown 输出
