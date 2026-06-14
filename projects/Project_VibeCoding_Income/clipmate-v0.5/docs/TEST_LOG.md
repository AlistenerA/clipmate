# TEST_LOG.md — ClipMate v0.5 测试记录

---

## v0.5 Session 2 (2026-06-14)

### 性质

Markdown 图片保留测试。验证 Turndown `img` rule 的噪声过滤、去重、alt 兜底、相对 URL 解析，以及 `injectMissingImages` 安全网行为。不修改已有测试。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：43 个测试文件，1781 个测试，全部通过（新增 28 个）
- `npm run build`：构建成功

### 新增测试覆盖 (tests/markdown-images.test.ts, 28 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| 噪声过滤 | 11 | data/blob URI、avatar/icon/logo/emoji class、tracking pixel 1x1、noise id、noise URL pattern、small size |
| 去重 | 1 | 重复 URL 只保留首次出现 |
| alt fallback | 3 | 空 alt→"image"、给定 alt、空白 trim |
| 相对 URL 解析 | 4 | pageUrl 解析、协议相对、绝对保留、无 pageUrl |
| 无回归 | 5 | 文本段落、headings、links、空 HTML、纯空白 |
| figure 支持 | 2 | 有效 figure 保留、噪声 figure 过滤 |
| 非影响性 | 2 | 纯文本无图片语法、混合文本图片 |

### 已有测试

- 1753 个已有测试全部通过，无新增失败、无删除、无降低

---

## v0.5 Session 1 (2026-06-14)

### 性质

新增文章图片候选提取模块测试，覆盖提取、过滤、去重、限制等全部功能路径。不修改已有测试。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：42 个测试文件，1753 个测试，全部通过（新增 62 个）
- `npm run build`：构建成功

### 新增测试覆盖 (tests/article-images.test.ts, 62 tests)

| 分类 | 测试数 | 覆盖 |
|------|:---:|------|
| 基本提取 | 3 | 普通 img、无图片页面、空页面 |
| 相对 URL 解析 | 4 | pageUrl 转换、协议相对、绝对保留、无 pageUrl |
| srcset 支持 | 1 | srcset 存在时取 src |
| figure/figcaption | 3 | caption 提取、无 img 跳过、混合场景 |
| alt/title | 3 | alt 保留、title 去重、无 title |
| 噪声过滤 - pixel | 2 | 1x1 pixel、URL pattern |
| 噪声过滤 - class/id | 8 | avatar/icon/logo/favicon/emoji/sprite/badge/id |
| data/blob URI | 3 | data 默认过滤、allowDataUri、blob 过滤 |
| 去重 | 2 | 相同 URL、解析后去重 |
| maxImages | 3 | 默认 20、自定义限制、未达限制 |
| 最小尺寸 | 2 | 小于默认 min、零尺寸保留 |
| stats | 1 | 混合结果统计 |
| index | 1 | 顺序索引 |
| sourceUrl | 2 | jsdom 环境、字段存在性 |
| picture | 1 | picture 元素提取 |
| resolveUrl 单元 | 4 | 相对、绝对、协议相对、无效 base |
| isNoiseUrl 单元 | 8 | pixel/beacon/1x1/spacer/transparent/data/blob/正常 |
| isTrackingPixel 单元 | 4 | 1x1/小尺寸+关键词/正常/小尺寸无关键词 |
| getBestSrc 单元 | 3 | src、无 src、data/blob 通过 |
| extractCaption 单元 | 3 | figure caption、无 figure、长文本截断 |

### 已有测试

- 1691 个已有测试全部通过，无新增失败、无删除、无降低

---

## v0.5 Session 0 (2026-06-14)

### 性质

从 clipmate-v0.4 稳定基线 (1850c64) 复制创建 clipmate-v0.5 开发目录。基线测试，未新增功能代码。

### 运行命令

```bash
npm run lint
npm run test
npm run build
```

### 结果

- `npm run lint`：0 errors, 0 warnings
- `npm run test`：41 个测试文件，1691 个测试，全部通过
- `npm run build`：构建成功

### 检查项

- clipmate-v0.5/ 从 v0.4 基线复制 ✅
- node_modules 已安装 ✅
- 基线测试全部通过 ✅
- 未修改 v0.1/v0.2/v0.3/v0.4 ✅
- 未修改 ../../opencode.json ✅
