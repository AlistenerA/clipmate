# ISSUES.md — ClipMate v0.8 已知问题追踪

---

## v0.8.5 交互与 History 修复

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS89 | 页面滚动时悬停蓝框固定在视口而不跟随图片 | medium | 已重算候选 rect，离开图片时隐藏 |
| IS90 | History 无法区分复制 Markdown 与保存 Notion | medium | 已新增行为和 Markdown target 字段 |
| IS91 | Notion 成功历史缺少目标页面入口 | minor | 已增加安全的 Notion 页面链接 |

---

## v0.8.4 代码识别修复

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS85 | 一行/两行短代码在 Readability 后退化成正文 | major | Readability 前规范为 `pre/code`，自动化通过 |
| IS86 | SyntaxHighlighter 用布局 table 表示代码，被误识别为数据表 | major | 已按 code cell 行提取并移除 gutter |
| IS87 | 无语言短代码仅靠少量正则，JS/TS 等相似语言不稳定 | major | highlight.js fast path + 本地 ML 低置信度复核 |
| IS88 | ML 浏览器包包含未使用 Node loader，Vite 给出 externalization 警告 | minor | 自定义 loader 已构建，待浏览器运行时复测 |

---

## v0.8.3 人工测试修复

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS81 | 全文预览有表格，但保存 Notion 后退化为普通段落 | major | 已统一走结构化 block 转换，定向回归通过 |
| IS82 | 图片真实题注重复进入正文与 caption | major | 已去重，原题注只保留一次 |
| IS83 | “在这里插入图片描述”等占位 alt 被保存为题注 | medium | 已过滤，空题注保持空数组 |
| IS84 | Notion metadata callout 固定显示书签 emoji | minor | 已优先使用安全的网站图标 URL |

---

## v0.8.2 人工测试修复

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS75 | Runoob 代码 class 在 Readability 后丢失，代码压成普通段落 | major | 已修复并覆盖完整 Readability 链路 |
| IS76 | 数字标题显示为 `1\.` | medium | 已修复，定向回归通过 |
| IS77 | 教程列表在 Notion 变成斜体并残留 `*` | major | 已输出原生列表 block |
| IS78 | 无题注图片显示 `image` | medium | 已改为空 alt/caption |
| IS79 | AP-09/AP-11/AP-12 等人工步骤难以执行 | medium | 已补专用 fixture 与逐步说明 |
| IS80 | 视频页模式应按页面类型智能推荐/显隐 | feature | 规划到 v0.9，不进入 v0.8.x |

---

## v0.8.1 人工测试修复

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS70 | completed picker 在草稿恢复前被消费，Popup 重开显示 0/20 | blocker | 已修复，自动化通过，待 Chrome/Edge 复测 |
| IS71 | 启动选图后 Popup 不自动关闭 | medium | 已修复，启动成功后关闭 Popup |
| IS72 | VCG-like 图片卡片有候选但遮罩层导致无法点击 | major | 已增加候选矩形坐标回落，待真实站点复测 |
| IS73 | Runoob 正文 TypeScript logo 被通用 logo 规则过滤 | medium | 正文大图手选例外已实现，站点 logo 仍过滤 |
| IS74 | active picker 状态下切换模式不清理页面工具条 | major | 已修复，切换前取消会话 |

---

## v0.8.0 Asset Picker

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS63 | 页面图片无法由用户手动点选补入草稿 | major | v0.8.0 已实现，待真实浏览器/Notion QA |
| IS65 | 页面覆盖层可能在取消或导航后残留 | major | 完成/取消/Escape/pagehide/popstate/hashchange 均清理；待 SPA 真实页 QA |
| IS66 | 旧 Popup 会话结果污染新页面草稿 | major | session id + page URL 双重门禁，自动化通过 |
| IS67 | 手选图片与自动提取图片重复 | medium | Markdown 与教程 Notion URL 去重，自动化通过 |
| IS68 | Chrome 控制在当前 Windows 沙箱无法启动 | minor | 提供离线 fixture 与人工测试文档 |
| IS69 | 目标 V0.8 Git 分支未创建 | release | 已创建 `codex/clipmate-v0.8-asset-picker`，关闭 |

---

## v0.7.3 视频与诊断修复

| 编号 | 问题 | 级别 | 状态 |
|:---:|---|:---:|:---:|
| IS60 | Bilibili 等视频页把推荐链接正文一并保存 | major | v0.7.3 改为四字段摘要 |
| IS61 | Popup 视频链接没有独立视觉层级 | medium | v0.7.3 显示 provider 视频卡片 |
| IS62 | 未知互动资源无法在测试中定位 | minor | v0.7.3 教程模式诊断面板；不进入保存链路 |
| IS63 | 页面图片无法由用户手动点选补入草稿 | major | v0.8 P0 Asset Picker，见 `V0.8_PLAN.md` |
| IS64 | Bilibili 等非 Notion 原生 provider 无法页内播放 | medium | v0.7.3 bookmark 降级；待 v0.8 真实支持矩阵 |

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
