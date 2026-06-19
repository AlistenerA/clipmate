# CURRENT_STATUS.md - ClipMate v0.8 当前进度

更新日期：2026-06-19

## 版本边界

- `clipmate-v0.1/` 到 `clipmate-v0.4/`：历史冻结目录。
- `clipmate-v0.6/`：v0.6 稳定冻结目录。
- `clipmate-v0.7/`：v0.7.3 Tutorial Mode 冻结基线，本轮零修改。
- `clipmate-v0.8/`：当前唯一 V0.8 开发与候选发布目录。
- 当前分支：`codex/clipmate-v0.8-asset-picker`。

## 当前阶段

**v0.8.0 Asset Picker 自动化候选完成，等待 Chrome、Edge 和真实 Notion 人工验收。**

已完成：

- Popup 可启动一次性页面图片选择会话，协议包含随机 session id。
- content script 使用 Shadow DOM 工具条和独立定位框，不改写页面图片样式。
- 悬停仅高亮安全候选；点击切换选择；完成、取消、Escape、pagehide、popstate、hashchange 均清理 DOM 与监听器。
- 候选复用现有 lazy/srcset/picture 解析、噪声过滤和 Asset Pipeline。
- 拒绝 data/blob/javascript、隐藏元素、追踪像素、头像和重复 URL。
- Popup 重开后消费当前页最新会话；旧 session id 或其他 URL 结果不能污染草稿。
- Popup 支持缩略图预览、移除、上下排序和 20 张上限。
- 选择结果随当前草稿持久化，不建立站点级长期缓存。
- Markdown 只追加自动提取缺失的图片，移除后恢复原始 Markdown。
- 教程模式 Notion blocks 追加手选图片，同时对 ClipDocument 已有 figure 去重。
- 新增离线人工 fixture、启动脚本和 `docs/V0.8_TEST_DOCUMENT.md`。
- 版本号统一为 0.8.0；未增加依赖、manifest 权限或 host permission。

## 自动化验证

- `npm run lint`：通过，0 errors。
- V0.8 定向测试：1 file / 7 tests 通过。
- `npm run test`：57 files / 1991 tests 全部通过。
- `npm run build`：通过，141 modules transformed。
- `dist/manifest.json`：version = 0.8.0。
- `npm run zip`：通过，生成 `clipmate-v0.8.zip`（166351 bytes / 25 entries，仅 dist 产物）。

## 人工验收

按 `docs/V0.8_TEST_DOCUMENT.md` 执行。发布前必须完成：

- Chrome 与 Edge：点选、取消、Escape、Popup 重开、页面导航清理。
- BBC、Runoob、CCTV-like、Bilibili 站点矩阵。
- 真实 Notion：全文和教程模式 external image blocks、失败降级与 History。
- 全文、选区、教程、Options、History 和重试回归。

当前环境无法启动受控 Chrome 进程，也未使用真实 Notion 凭据，因此不能把这些项目标为已验证。

## 发布阻断

- Git 分支隔离已完成；commit/push 在本轮发布收口中执行。
- Chrome/Edge/真实 Notion 人工验收未执行。
- 本地 fixture 启动进程验证同样受当前执行审批额度限制；fixture 源码已检查，HTTP smoke test 未执行。
