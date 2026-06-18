# ISSUES.md — ClipMate v0.7 已知问题追踪

---

## v0.7.2 Notion 保存修复

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS56 | 来源、作者、日期、标签头部散落且可能重复 | medium | v0.7.2 合并为单一 metadata callout |
| IS57 | 大表可能超过 Notion 单数组 100 children 限制 | major | v0.7.2 自动拆表并重复表头 |
| IS58 | 无题注图片用 alt 作为 Notion caption | minor | v0.7.2 教程 figure 已修复 |
| IS59 | Notion 400/409/5xx 均显示 `NOTION_SAVE_FAILED` | major | v0.7.2 已结构化；待真实 BBC 保存复测 |

---

## v0.7.1 人工测试修复

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS51 | Runoob `example_code` 被压成普通段落，代码换行与语言丢失 | major | v0.7.1 已修复，待真实页面复测 |
| IS52 | `* * *` 分隔线在 Popup 显示为杂点 | medium | v0.7.1 已修复 |
| IS53 | Popup 图片只显示 `image` 文本 | major | v0.7.1 已修复；防盗链仍按文字降级 |
| IS54 | BBC 题注包含“图像加注文字”无障碍前缀 | minor | v0.7.1 已规范为“题注：” |
| IS55 | 教程保存 History 偶发显示为全文 | major | v0.7.1 显式绑定 UI mode，待扩展复测 |

---

## v0.7.0 待人工验证

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS46 | 教程模式真实页面结构可能被 Readability 或站点 DOM 差异影响 | major | 待 Chrome/Edge 人工 QA |
| IS47 | Notion equation/table/bookmark 对边界输入的实际 API 接受度 | major | v0.7.2 增加 table limit/错误定位，待真实 Notion QA |
| IS48 | 外部图片防盗链或失效 URL 可能导致 Notion 图片不显示 | major | v0.6 已知限制，正文不得受阻 |
| IS49 | 视频链接仅保存元数据，不下载视频或抓取字幕 | minor | 设计边界 |
| IS50 | 当前浏览器自动化连接受 Windows 沙箱限制 | minor | 已提供人工 fixture 与风险测试文档 |

---

## v0.6.0 状态（Asset Pipeline foundation）

v0.6.0 完成图片 asset pipeline 底座和 Notion save plan 图片质量报告。File Upload external import 仅作为候选策略评估，不默认启用。

- 1959 个测试全部通过
- lint 0 errors, 0 warnings
- build 成功
- dist/manifest.json version = 0.6.0
- manifest 权限无变更
- 当前目录已迁移为 `clipmate-v0.6/`

---

## 文章图片保存问题状态

| 编号 | 问题 | 级别 | 状态 |
|:---:|------|:---:|:---:|
| IS22 | 懒加载图片 (data-src / loading="lazy") 可能无 src 属性 | major | ✅ v0.5.2 统一候选读取 |
| IS23 | srcset 归一化可能丢失多倍图或分辨率信息 | minor | ✅ Session 1 处理 |
| IS24 | 跨域图片 URL 可能在 Notion 无法正常显示 | major | ⚠️ 已实现 image block；待人工真实 Notion save QA 验证 |
| IS25 | 失效外链图片显示 broken image | minor | 已知限制，不处理 |
| IS26 | base64/blob 图片 URL 处理策略 | minor | ✅ 全链路过滤 |
| IS27 | 图片数量过多影响 Notion block 保存性能 | minor | ✅ 默认 maxImages=20 |
| IS28 | 噪声图片误保留 | medium | ✅ 全链路过滤 |
| IS29 | extractArticleImages 不处理 data-src 懒加载属性 | minor | ✅ v0.5.2 修复 |
| IS30 | markdownToContentBlocks 仅输出 paragraph/image blocks | minor | 功能正确 |
| IS31 | "ad-banner" class 不在已知噪声 class 列表中 | minor | 已知局限 |
| IS32 | Sina 推荐区/热搜区图片污染 | major | ✅ Session 5.1 修复 |
| IS33 | Sina resize/proxy 图片 URL 在 Notion 无法渲染 | major | ✅ Session 5.1 修复 |
| IS34 | 图片题注与 Markdown 粘连 | major | ✅ Session 5.2 修复 |
| IS35 | Notion image block 未正确吸收 caption | major | ✅ Session 5.2 修复 |
| IS36 | Markdown/Notion 图片居中 | minor | 已知限制：Notion API 不支持 |
| IS37 | ClipSession 生命周期暂未持久化，也未替换现有 popup hook 状态 | minor | v0.5.1 底座限制，后续功能接入时推进 |
| IS38 | CCTV-like 页面正文图片因 placeholder src / lazy source / video poster 丢失 | major | ✅ v0.5.2 修复 |
| IS39 | Obsidian/Typora 中 `**加粗**正文` 紧贴导致渲染兼容问题 | medium | ✅ v0.5.2 修复 |
| IS40 | Popup 有限正文预览与主 Markdown 预览重复 | medium | ✅ v0.5.3 替换为保存摘要 |
| IS41 | 保存前不能编辑剪藏标题 | medium | ✅ v0.5.3 修复 |
| IS42 | 同一 URL 重复保存前缺少提醒 | minor | ✅ v0.5.3 基于 saved history 提示 |
| IS43 | 图片保存缺少统一 asset / strategy / quality report 抽象 | major | ✅ v0.6.0 建立底座 |
| IS44 | Notion proxy/resize 图片 URL 缺少 File Upload 候选评估 | medium | ✅ v0.6.0 只做候选策略，不启用 |
| IS45 | v0.6 是否新建目录可能导致一次性大规模复制和依赖重装 | minor | ✅ 用户要求后已迁移为 clipmate-v0.6 |

---

## v0.3 继承问题（后续单独评估，不混入 v0.5）

详见 `clipmate-v0.4/docs/ISSUES.md`：
- CSDN/LaTeX 渲染残留
- 搜索页/导航页分类体验
- 本地 .md 保存
- 复制历史
- Bilibili selection-generic 降级
- Notion raw markdown 输出
