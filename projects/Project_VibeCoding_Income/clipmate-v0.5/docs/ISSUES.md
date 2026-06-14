# ISSUES.md — ClipMate v0.5 已知问题追踪

---

## v0.5 Session 0 状态

- clipmate-v0.5 从 v0.4 稳定基线 (1850c64) 创建
- 所有 v0.4 已完成修复继续有效
- v0.3 继承问题详见 `clipmate-v0.3/docs/ISSUES.md` 和 `clipmate-v0.4/docs/ISSUES.md`

---

## 潜在风险：文章图片保存

| 编号 | 问题 | 级别 | 状态 |
|:---:|------|:---:|:---:|
| IS22 | 懒加载图片 (data-src / loading="lazy") 可能无 src 属性 | major | 待 Session 1 处理 |
| IS23 | srcset 归一化可能丢失多倍图或分辨率信息 | minor | 待 Session 1 处理 |
| IS24 | 跨域图片 URL 可能在 Notion 无法正常显示 | major | 待 Session 3 验证 |
| IS25 | 失效外链图片显示 broken image | minor | 已知限制 |
| IS26 | base64/blob 图片 URL 处理策略未定 | minor | 待 Session 1 决定 |
| IS27 | 图片数量过多影响 Notion block 保存性能 | minor | 限制 max 20 |
| IS28 | 噪声图片 (icon/avatar/logo/tracking/pixel/emoji) 误保留 | medium | 待 Session 1 过滤 |

---

## v0.3 继承问题（后续单独评估，不混入 v0.5 Session 0）

详见 `clipmate-v0.4/docs/ISSUES.md`：
- CSDN/LaTeX 渲染残留
- 搜索页/导航页分类体验
- 本地 .md 保存
- 复制历史
- Bilibili selection-generic 降级
- Notion raw markdown 输出
