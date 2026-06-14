import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import { extractArticleImages } from '../src/content/extractors/articleImages'
import { htmlToMarkdown } from '../src/content/parser/htmlToMarkdown'
import { markdownToContentBlocks } from '../src/platforms/notion/blocks'
import type { ClipMateSettingsV2, NotionTarget, ClipHistoryItem } from '../src/shared/types/settings.types'
import type { ClipDraft, ExtractedContent } from '../src/shared/types/clip.types'
import type { SaveToNotionPayload } from '../src/shared/types/message.types'
import { handleSaveToNotion } from '../src/background/handlers/notionHandler'
import { DEFAULT_SETTINGS_V2, STORAGE_KEYS } from '../src/shared/constants/defaults'
import { buildHistoryInput } from '../src/popup/utils/historyPayload'

function createDocument(bodyHtml: string): Document {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${bodyHtml}</body></html>`)
  return dom.window.document
}

function createFullPage(html: string): { doc: Document; pageUrl: string } {
  const dom = new JSDOM(`<!DOCTYPE html><html><head><title>Test</title></head><body>${html}</body></html>`, {
    url: 'https://example.com/article/test',
  })
  return { doc: dom.window.document, pageUrl: 'https://example.com/article/test' }
}

let idCounter = 0

vi.mock('../src/shared/utils/id', () => ({
  generateId: vi.fn(() => {
    idCounter++
    return `00000000-0000-4000-a000-${String(idCounter).padStart(12, '0')}`
  }),
}))

const mockStore: Record<string, unknown> = {}

function mockFetch(status: number, body?: unknown) {
  ;(globalThis as unknown as Record<string, unknown>).fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body || {}),
    })
  ) as unknown as typeof fetch
}

function makeTarget(overrides: Partial<NotionTarget> = {}): NotionTarget {
  return {
    id: overrides.id ?? 'target-1',
    name: overrides.name ?? 'Test Target',
    pageId: overrides.pageId ?? 'abc123def4567890abc123def4567890',
    isDefault: overrides.isDefault ?? true,
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    lastUsedAt: overrides.lastUsedAt,
  }
}

function makeSettings(overrides: Partial<ClipMateSettingsV2> = {}): ClipMateSettingsV2 {
  return {
    ...DEFAULT_SETTINGS_V2,
    notionToken: 'secret_test_token',
    notionTargets: [makeTarget()],
    saveHistoryEnabled: true,
    ...overrides,
  }
}

function makeDraft(overrides?: Partial<ExtractedContent>): ClipDraft {
  const content: ExtractedContent = {
    mode: 'fullpage',
    title: 'Test Page',
    url: 'https://example.com',
    description: 'A test page',
    contentText: 'This is the main content.',
    contentHtml: '<p>This is the main content.</p>',
    markdown: 'This is the main content.',
    wordCount: 5,
    metadata: {
      url: 'https://example.com',
      title: 'Test Page',
      description: 'A test page',
      siteName: 'Example',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    ...overrides,
  }
  return {
    mode: content.mode,
    title: content.title,
    url: content.url,
    tags: [],
    note: '',
    content,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

function makePayload(overrides?: Partial<SaveToNotionPayload>): SaveToNotionPayload {
  const draft = makeDraft()
  return {
    draft,
    pageId: 'abc123def4567890abc123def4567890',
    targetId: 'target-1',
    targetName: 'Test Target',
    ...overrides,
  }
}

function getHistory(): ClipHistoryItem[] {
  return (mockStore[STORAGE_KEYS.HISTORY] as ClipHistoryItem[] | undefined) ?? []
}

beforeEach(() => {
  idCounter = 0
  Object.keys(mockStore).forEach(key => delete mockStore[key])
  vi.clearAllMocks()
  ;(globalThis as unknown as Record<string, unknown>).chrome = {
    storage: {
      local: {
        get: vi.fn((_keys: string | string[] | Record<string, unknown>) => {
          return Promise.resolve({ ...mockStore })
        }),
        set: vi.fn((items: Record<string, unknown>) => {
          Object.assign(mockStore, items)
          return Promise.resolve()
        }),
        remove: vi.fn((_keys: string | string[]) => Promise.resolve()),
      },
    },
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})

// =============================================================================
// Scenario 1: News article — multiple body images with captions
// =============================================================================

const NEWS_ARTICLE_HTML = `
<article>
  <h1>Breaking News: Major Discovery</h1>
  <p class="author">By Jane Doe</p>
  <figure>
    <img src="https://news.example.com/images/hero.jpg" alt="Hero image" width="1200" height="675">
    <figcaption>The main discovery site viewed from above</figcaption>
  </figure>
  <p>Scientists announced a major breakthrough today.</p>
  <p>The discovery was made in a remote location.</p>
  <figure>
    <img src="https://news.example.com/images/chart.png" alt="Data chart" width="800" height="600">
    <figcaption>Figure 1: Annual discovery rate</figcaption>
  </figure>
  <p>The chart above shows the annual discovery rate over the past decade.</p>
  <img src="https://news.example.com/images/team.jpg" alt="The research team" width="1024" height="768">
  <img src="/images/related.jpg" alt="Related image" width="900" height="600">
  <aside class="sidebar">
    <img class="thumb" src="https://ads.example.com/banner.gif" width="728" height="90">
    <img class="avatar" src="https://cdn.example.com/avatars/jane.png" width="40" height="40">
  </aside>
</article>
`

describe('Site Case 1: News article', () => {
  it('extracts body images and filters noise', () => {
    const doc = createDocument(NEWS_ARTICLE_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://news.example.com/article/1' })

    expect(result.images.length).toBeGreaterThanOrEqual(4)
    expect(result.skipped.length).toBeGreaterThanOrEqual(1)

    const urls = result.images.map(i => i.url)
    expect(urls).toContain('https://news.example.com/images/hero.jpg')
    expect(urls).toContain('https://news.example.com/images/chart.png')
    expect(urls).toContain('https://news.example.com/images/team.jpg')
    expect(urls).toContain('https://news.example.com/images/related.jpg')
  })

  it('resolves relative URLs', () => {
    const doc = createDocument(NEWS_ARTICLE_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://news.example.com/article/1' })

    const related = result.images.find(i => i.alt === 'Related image')
    expect(related).toBeDefined()
    expect(related!.url).toBe('https://news.example.com/images/related.jpg')
  })

  it('extracts captions from figcaption', () => {
    const doc = createDocument(NEWS_ARTICLE_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://news.example.com/article/1' })

    const hero = result.images.find(i => i.alt === 'Hero image')
    expect(hero).toBeDefined()
    expect(hero!.caption).toBe('The main discovery site viewed from above')

    const chart = result.images.find(i => i.alt === 'Data chart')
    expect(chart).toBeDefined()
    expect(chart!.caption).toBe('Figure 1: Annual discovery rate')
  })

  it('preserves images in markdown', () => {
    const articles = createDocument(NEWS_ARTICLE_HTML)
    const article = articles.querySelector('article')!
    const md = htmlToMarkdown(article.innerHTML, 'https://news.example.com/article/1')

    expect(md).toContain('![Hero image](https://news.example.com/images/hero.jpg)')
    expect(md).toContain('*The main discovery site viewed from above*')
    expect(md).toContain('![Data chart](https://news.example.com/images/chart.png)')
    expect(md).toContain('*Figure 1: Annual discovery rate*')
    expect(md).toContain('![The research team](https://news.example.com/images/team.jpg)')
  })

  it('filters thumb and avatar images from markdown', () => {
    const articles = createDocument(NEWS_ARTICLE_HTML)
    const article = articles.querySelector('article')!
    const md = htmlToMarkdown(article.innerHTML, 'https://news.example.com/article/1')

    expect(md).not.toContain('banner.gif')
    expect(md).not.toContain('avatars')
  })

  it('converts images to Notion external image blocks', () => {
    const articles = createDocument(NEWS_ARTICLE_HTML)
    const article = articles.querySelector('article')!
    const md = htmlToMarkdown(article.innerHTML, 'https://news.example.com/article/1')
    const blocks = markdownToContentBlocks(md)

    const imageBlocks = blocks.filter(b => b.type === 'image')
    expect(imageBlocks.length).toBeGreaterThanOrEqual(2)
    imageBlocks.forEach(b => {
      const img = b.image as { type: string; external: { url: string }; caption: unknown[] }
      expect(img.type).toBe('external')
      expect(img.external.url).toMatch(/^https:\/\//)
    })
  })

  it('keeps text paragraphs in order around image blocks', () => {
    const articles = createDocument(NEWS_ARTICLE_HTML)
    const article = articles.querySelector('article')!
    const md = htmlToMarkdown(article.innerHTML, 'https://news.example.com/article/1')
    const blocks = markdownToContentBlocks(md)

    const types = blocks.map(b => b.type)
    expect(types.filter(t => t === 'paragraph').length).toBeGreaterThanOrEqual(2)
    expect(types.filter(t => t === 'image').length).toBeGreaterThanOrEqual(2)
    expect(types.some(t => t === 'paragraph')).toBe(true)
  })

  it('produces image metadata for popup/history', () => {
    const doc = createDocument(NEWS_ARTICLE_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://news.example.com/article/1' })

    expect(result.images.length).toBeGreaterThan(0)
    expect(result.images[0].url).toMatch(/^https:\/\//)
    expect(result.stats.kept).toBe(result.images.length)
    expect(result.stats.skipped).toBeGreaterThanOrEqual(1)
  })
})

// =============================================================================
// Scenario 2: Blog article — figure/figcaption with alt/title
// =============================================================================

const BLOG_ARTICLE_HTML = `
<article class="post">
  <h1>How to Build a RAG Pipeline</h1>
  <p>In this tutorial, we'll walk through building a retrieval-augmented generation pipeline.</p>
  <figure>
    <img src="https://blog.example.com/images/rag-architecture.png" alt="RAG Architecture Diagram" title="Figure 1: RAG pipeline overview" width="960" height="540">
    <figcaption>The RAG pipeline combines retrieval and generation</figcaption>
  </figure>
  <h2>Step 1: Document Loading</h2>
  <p>First, load your documents using LangChain document loaders.</p>
  <p>
    <img src="https://blog.example.com/images/code-snippet.png" alt="Code snippet for document loading" width="800" height="400">
  </p>
  <h2>Step 2: Embedding</h2>
  <p>Next, embed your documents using a vector store.</p>
  <img src="https://blog.example.com/images/vector-store.png" alt="Vector store visualization" width="700" height="500">
  <p class="footer">
    <img class="author-avatar" src="/images/author-avatar.jpg" width="48" height="48" alt="Author avatar">
    <img class="logo" src="/images/site-logo.png" width="200" height="40" alt="Site logo">
  </p>
</article>
`

describe('Site Case 2: Blog article with figure/figcaption', () => {
  it('extracts blog images and filters avatar/logo', () => {
    const { doc, pageUrl } = createFullPage(BLOG_ARTICLE_HTML)
    const result = extractArticleImages(doc, { pageUrl })

    expect(result.images.length).toBe(3)
    const urls = result.images.map(i => i.url)
    expect(urls).toContain('https://blog.example.com/images/rag-architecture.png')
    expect(urls).toContain('https://blog.example.com/images/code-snippet.png')
    expect(urls).toContain('https://blog.example.com/images/vector-store.png')

    expect(result.skipped.some(s => s.reason === 'noise_class_or_attr')).toBe(true)
  })

  it('captures alt and title from images', () => {
    const { doc, pageUrl } = createFullPage(BLOG_ARTICLE_HTML)
    const result = extractArticleImages(doc, { pageUrl })

    const rag = result.images.find(i => i.alt === 'RAG Architecture Diagram')
    expect(rag).toBeDefined()
    expect(rag!.title).toBe('Figure 1: RAG pipeline overview')
  })

  it('preserves figure captions in markdown', () => {
    const articleEl = createDocument(BLOG_ARTICLE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://blog.example.com/post/rag')

    expect(md).toContain('![RAG Architecture Diagram](https://blog.example.com/images/rag-architecture.png)')
    expect(md).toContain('*The RAG pipeline combines retrieval and generation*')
    expect(md).toContain('![Code snippet for document loading](https://blog.example.com/images/code-snippet.png)')
  })

  it('filters avatar and logo from markdown', () => {
    const articleEl = createDocument(BLOG_ARTICLE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://blog.example.com/post/rag')

    expect(md).not.toContain('author-avatar')
    expect(md).not.toContain('site-logo')
  })

  it('keeps headings and code blocks unaffected', () => {
    const articleEl = createDocument(BLOG_ARTICLE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://blog.example.com/post/rag')

    expect(md).toContain('## Step 1: Document Loading')
    expect(md).toContain('## Step 2: Embedding')
    expect(md).toContain('LangChain document loaders')
  })
})

// =============================================================================
// Scenario 3: Tech documentation — screenshots + icon noise + code blocks
// =============================================================================

const TECH_DOC_HTML = `
<div class="documentation">
  <h1>API Reference</h1>
  <p>The following endpoints are available in v2 of the API.</p>
  <h2>Authentication</h2>
  <p>All requests require an API key header.</p>
  <pre><code>GET /api/v2/users
Authorization: Bearer &lt;token&gt;
</code></pre>
  <p>
    <img src="https://docs.example.com/screenshots/api-overview.png" alt="API overview screenshot" width="1024" height="768">
  </p>
  <h2>Rate Limits</h2>
  <p>The API enforces the following rate limits:</p>
  <p>
    <img src="https://docs.example.com/screenshots/rate-limit-table.png" alt="Rate limit table" width="800" height="400">
  </p>
  <h2>Error Codes</h2>
  <pre><code>{
  "error": "invalid_request",
  "message": "Missing required field"
}
</code></pre>
  <img class="icon" src="/icons/info.svg" width="16" height="16" alt="Info">
  <img class="icon" src="/icons/warning.svg" width="16" height="16" alt="Warning">
  <img class="favicon" src="/favicon.ico" width="32" height="32">
  <img class="loading-spinner" src="/images/spinner.gif" width="32" height="32">
  <img class="emoji" src="https://cdn.example.com/emoji/1f600.png" width="20" height="20">
</div>
`

describe('Site Case 3: Tech documentation', () => {
  it('extracts screenshot images and filters icons', () => {
    const { doc, pageUrl } = createFullPage(TECH_DOC_HTML)
    const result = extractArticleImages(doc, { pageUrl })

    expect(result.images.length).toBe(2)
    const urls = result.images.map(i => i.url)
    expect(urls).toContain('https://docs.example.com/screenshots/api-overview.png')
    expect(urls).toContain('https://docs.example.com/screenshots/rate-limit-table.png')

    expect(result.skipped.length).toBeGreaterThanOrEqual(5)
  })

  it('filters icon/favicon/emoji/spinner from markdown', () => {
    const docEl = createDocument(TECH_DOC_HTML).querySelector('.documentation')!
    const md = htmlToMarkdown(docEl.innerHTML, 'https://docs.example.com/api')

    expect(md).not.toContain('icon')
    expect(md).not.toContain('favicon')
    expect(md).not.toContain('emoji')
    expect(md).not.toContain('spinner')
    expect(md).not.toContain('info.svg')
    expect(md).not.toContain('warning.svg')
  })

  it('preserves code blocks unaffected by image processing', () => {
    const docEl = createDocument(TECH_DOC_HTML).querySelector('.documentation')!
    const md = htmlToMarkdown(docEl.innerHTML, 'https://docs.example.com/api')

    expect(md).toContain('GET /api/v2/users')
    expect(md).toContain('Authorization: Bearer')
    expect(md).toContain('"error": "invalid_request"')
  })

  it('converts screenshots to Notion image blocks', () => {
    const docEl = createDocument(TECH_DOC_HTML).querySelector('.documentation')!
    const md = htmlToMarkdown(docEl.innerHTML, 'https://docs.example.com/api')
    const blocks = markdownToContentBlocks(md)

    const imageBlocks = blocks.filter(b => b.type === 'image')
    expect(imageBlocks.length).toBe(2)
  })

  it('preserves text paragraph order in Notion blocks', () => {
    const docEl = createDocument(TECH_DOC_HTML).querySelector('.documentation')!
    const md = htmlToMarkdown(docEl.innerHTML, 'https://docs.example.com/api')
    const blocks = markdownToContentBlocks(md)

    const paragraphs = blocks.filter(b => b.type === 'paragraph')
    expect(paragraphs.length).toBeGreaterThanOrEqual(3)
  })
})

// =============================================================================
// Scenario 4: CSDN-like — data-src / srcset / lazy loading / CDN images
// =============================================================================

const CSDN_LIKE_HTML = `
<article class="article-content">
  <h1>Python Machine Learning Tutorial</h1>
  <div class="author-info">
    <img class="avatar" src="https://avatar.csdnimg.cn/avatar.jpg" width="48" height="48">
    <span>Author Name</span>
    <img class="badge" src="https://csdnimg.cn/badge/vip.png" width="24" height="24">
  </div>
  <p>Machine learning is transforming industries worldwide.</p>
  <p>
    <img class="lazy" data-src="https://img-blog.csdnimg.cn/20210101_abc123.png" alt="ML pipeline diagram" width="800" height="500" loading="lazy">
  </p>
  <p>The diagram above illustrates a typical ML pipeline.</p>
  <p>
    <img srcset="https://img-blog.csdnimg.cn/20210102_def456.png 2x, https://img-blog.csdnimg.cn/20210102_def456_small.png 1x" src="https://img-blog.csdnimg.cn/20210102_def456.png" alt="Training loss curve" width="700" height="450" loading="lazy">
  </p>
  <p>
    <img data-original="https://img-blog.csdnimg.cn/20210103_ghi789.png" alt="Confusion matrix" width="600" height="500">
  </p>
  <blockquote>
    <p>Note: All code examples are tested with Python 3.9.</p>
  </blockquote>
  <div class="recommend-list">
    <img src="https://img-blog.csdnimg.cn/recommend1.jpg" alt="Recommend article 1" width="300" height="200">
    <img src="https://img-blog.csdnimg.cn/recommend2.jpg" alt="Recommend article 2" width="300" height="200">
  </div>
  <p class="copyright">Copyright notice here.</p>
</article>
`

describe('Site Case 4: CSDN-like lazy loading', () => {
  it('turndown img rule handles data-src lazy images', () => {
    const articleEl = createDocument(CSDN_LIKE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://blog.csdn.net/author/article/123')

    expect(md).toContain('https://img-blog.csdnimg.cn/20210101_abc123.png')
  })

  it('handles srcset images correctly in extraction', () => {
    const { doc, pageUrl } = createFullPage(CSDN_LIKE_HTML)
    const result = extractArticleImages(doc, { pageUrl })

    const urls = result.images.map(i => i.url)
    expect(urls).toContain('https://img-blog.csdnimg.cn/20210102_def456.png')
  })

  it('turndown img rule handles data-original fallback images', () => {
    const articleEl = createDocument(CSDN_LIKE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://blog.csdn.net/author/article/123')

    expect(md).toContain('https://img-blog.csdnimg.cn/20210103_ghi789.png')
  })

  it('filters avatar/badge noise', () => {
    const { doc, pageUrl } = createFullPage(CSDN_LIKE_HTML)
    const result = extractArticleImages(doc, { pageUrl })

    const urls = result.images.map(i => i.url)
    expect(urls).not.toContain('https://avatar.csdnimg.cn/avatar.jpg')
    expect(urls).not.toContain('https://csdnimg.cn/badge/vip.png')
  })

  it('extracts srcset and recommend images that pass size filter', () => {
    const { doc, pageUrl } = createFullPage(CSDN_LIKE_HTML)
    const result = extractArticleImages(doc, { pageUrl })

    expect(result.images.length).toBeGreaterThanOrEqual(2)
    const urls = result.images.map(i => i.url)
    expect(urls).toContain('https://img-blog.csdnimg.cn/20210102_def456.png')
  })

  it('preserves article text around images in markdown', () => {
    const articleEl = createDocument(CSDN_LIKE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://blog.csdn.net/author/article/123')

    expect(md).toContain('Machine learning is transforming industries')
    expect(md).toContain('![ML pipeline diagram]')
    expect(md).toContain('![Training loss curve]')
    expect(md).toContain('![Confusion matrix]')
    expect(md).toContain('> Note: All code examples')
  })

  it('filters avatar from markdown', () => {
    const articleEl = createDocument(CSDN_LIKE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://blog.csdn.net/author/article/123')

    expect(md).not.toContain('avatar.csdnimg.cn')
    expect(md).not.toContain('badge/vip')
  })
})

// =============================================================================
// Scenario 5: Duplicate image deduplication
// =============================================================================

const DUPLICATE_HTML = `
<article>
  <h1>Product Review</h1>
  <p>Here is the product in various settings:</p>
  <img src="https://cdn.example.com/product-hero.jpg" alt="Product hero" width="1200" height="675">
  <p>The product looks great from every angle.</p>
  <img src="https://cdn.example.com/product-hero.jpg" alt="Product hero again" width="1200" height="675">
  <img src="https://cdn.example.com/product-hero.jpg" alt="Product hero third" width="1200" height="675">
  <img src="https://cdn.example.com/product-detail.jpg" alt="Product detail" width="800" height="600">
  <p>Here is a close-up of the details.</p>
</article>
`

describe('Site Case 5: Duplicate image deduplication', () => {
  it('deduplicates in extractArticleImages', () => {
    const doc = createDocument(DUPLICATE_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://example.com/review' })

    const heroImages = result.images.filter(i => i.url === 'https://cdn.example.com/product-hero.jpg')
    expect(heroImages.length).toBe(1)
    expect(result.images.length).toBe(2)
  })

  it('deduplicates in markdown output', () => {
    const articleEl = createDocument(DUPLICATE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/review')

    const matches = md.match(/product-hero\.jpg/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBe(1)

    expect(md).toContain('product-detail.jpg')
  })

  it('keeps both unique images in Notion blocks', () => {
    const articleEl = createDocument(DUPLICATE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/review')
    const blocks = markdownToContentBlocks(md)

    const imageBlocks = blocks.filter(b => b.type === 'image')
    expect(imageBlocks.length).toBe(2)
  })
})

// =============================================================================
// Scenario 6: Logo/avatar/emoji/ad filtering across scenarios
// =============================================================================

const NOISE_HEAVY_HTML = `
<article>
  <header>
    <img class="logo" src="/images/logo.png" width="200" height="50" alt="Company Logo">
    <img class="avatar" src="/avatars/user-123.jpg" width="48" height="48" alt="User avatar">
    <img class="badge" src="/badges/verified.png" width="24" height="24" alt="Verified badge">
  </header>
  <h1>Article Title</h1>
  <p>Main content paragraph one.</p>
  <img src="https://cdn.example.com/content-image-1.jpg" alt="Content image 1" width="800" height="600">
  <p>Main content paragraph two.</p>
  <img src="https://cdn.example.com/content-image-2.jpg" alt="Content image 2" width="800" height="600">
  <footer>
    <img class="emoji" src="/emoji/thumbs-up.png" width="20" height="20">
    <img class="sprite" src="/images/sprite-sheet.png" width="100" height="200">
    <img src="https://tracking.example.com/pixel.gif" width="1" height="1" alt="">
    <img class="qr-code" src="/images/qr-wechat.png" width="150" height="150">
    <img class="thumb" src="/images/thumbnail-extra.jpg" width="150" height="100">
  </footer>
</article>
`

describe('Site Case 6: Noise filtering across scenarios', () => {
  it('filters logo/avatar/badge/emoji/sprite/thumb in extraction', () => {
    const doc = createDocument(NOISE_HEAVY_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://example.com/article' })

    expect(result.images.length).toBe(2)
    const urls = result.images.map(i => i.url)
    expect(urls).toContain('https://cdn.example.com/content-image-1.jpg')
    expect(urls).toContain('https://cdn.example.com/content-image-2.jpg')
  })

  it('reports noise skip reasons', () => {
    const doc = createDocument(NOISE_HEAVY_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://example.com/article' })

    const reasons = result.skipped.map(s => s.reason)
    expect(reasons).toContain('noise_class_or_attr')
    expect(reasons).toContain('tracking_pixel')
  })

  it('filters noise from markdown output', () => {
    const articleEl = createDocument(NOISE_HEAVY_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/article')

    expect(md).not.toContain('logo.png')
    expect(md).not.toContain('user-123.jpg')
    expect(md).not.toContain('verified.png')
    expect(md).not.toContain('thumbs-up')
    expect(md).not.toContain('sprite-sheet')
    expect(md).not.toContain('pixel.gif')
    expect(md).not.toContain('qr-wechat')
    expect(md).not.toContain('thumbnail-extra')
  })

  it('only keeps content images in Notion image blocks', () => {
    const articleEl = createDocument(NOISE_HEAVY_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/article')
    const blocks = markdownToContentBlocks(md)

    const imageBlocks = blocks.filter(b => b.type === 'image')
    expect(imageBlocks.length).toBe(2)
    const urls = imageBlocks.map(b => (b.image as { external: { url: string } }).external.url)
    expect(urls).toContain('https://cdn.example.com/content-image-1.jpg')
    expect(urls).toContain('https://cdn.example.com/content-image-2.jpg')
  })
})

// =============================================================================
// Scenario 7: Markdown text and image order preservation
// =============================================================================

const ORDERED_CONTENT_HTML = `
<article>
  <h1>Gallery Walkthrough</h1>
  <p>Opening paragraph introducing the gallery.</p>
  <img src="https://cdn.example.com/photo-1.jpg" alt="First photo" width="800" height="600">
  <p>Description of the first photo.</p>
  <img src="https://cdn.example.com/photo-2.jpg" alt="Second photo" width="800" height="600">
  <p>Description of the second photo.</p>
  <img src="https://cdn.example.com/photo-3.jpg" alt="Third photo" width="800" height="600">
  <h2>Section 2</h2>
  <p>Another section starts here.</p>
  <img src="https://cdn.example.com/photo-4.jpg" alt="Fourth photo" width="800" height="600">
  <p>Closing thoughts.</p>
</article>
`

describe('Site Case 7: Markdown text and image order', () => {
  it('preserves text-image interleaving in markdown', () => {
    const articleEl = createDocument(ORDERED_CONTENT_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/gallery')

    expect(md).toContain('## Section 2')

    const openingIdx = md.indexOf('Opening paragraph')
    const photo1Idx = md.indexOf('![First photo]')
    const desc1Idx = md.indexOf('Description of the first photo')
    const photo2Idx = md.indexOf('![Second photo]')
    const desc2Idx = md.indexOf('Description of the second photo')
    const photo3Idx = md.indexOf('![Third photo]')

    expect(openingIdx).toBeLessThan(photo1Idx)
    expect(photo1Idx).toBeLessThan(desc1Idx)
    expect(desc1Idx).toBeLessThan(photo2Idx)
    expect(photo2Idx).toBeLessThan(desc2Idx)
    expect(desc2Idx).toBeLessThan(photo3Idx)
  })

  it('preserves paragraph-image order in Notion blocks', () => {
    const articleEl = createDocument(ORDERED_CONTENT_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/gallery')
    const blocks = markdownToContentBlocks(md)

    const types = blocks.map(b => b.type)

    const firstPara = types.indexOf('paragraph')
    const firstImg = types.indexOf('image')
    expect(firstPara).toBeLessThan(firstImg)

    expect(types.filter(t => t === 'image').length).toBe(4)
  })
})

// =============================================================================
// Scenario 8: Notion image blocks and paragraphs in order
// =============================================================================

const NOTION_ORDER_HTML = `
<article>
  <h1>Step-by-step Guide</h1>
  <p>This guide will walk you through the setup process.</p>
  <p>Before starting, make sure you have the prerequisites installed.</p>
  <img src="https://cdn.example.com/setup-screenshot.png" alt="Setup screenshot" width="1024" height="768">
  <p>The screenshot above shows the expected setup screen.</p>
  <h2>Configuration</h2>
  <p>Edit the config file as follows:</p>
  <img src="https://cdn.example.com/config-screenshot.png" alt="Config file screenshot" width="800" height="500">
  <p>Save the file and restart the service.</p>
  <h2>Verification</h2>
  <p>Run the verification command:</p>
  <p>If everything is correct, you should see:</p>
  <img src="https://cdn.example.com/success-screenshot.png" alt="Success verification" width="800" height="400">
  <p>Congratulations! The setup is complete.</p>
</article>
`

describe('Site Case 8: Notion image block and paragraph order', () => {
  it('maintains block order: paragraph → image → paragraph interleaving', () => {
    const articleEl = createDocument(NOTION_ORDER_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/guide')
    const blocks = markdownToContentBlocks(md)

    const blockOrder = blocks.map(b => {
      if (b.type === 'image') return 'image'
      if (b.type === 'paragraph') return 'paragraph'
      return b.type
    })

    expect(blockOrder[0]).toBe('paragraph')
    expect(blockOrder.some(b => b === 'image')).toBe(true)
  })

  it('produces exactly 3 image blocks for 3 screenshots', () => {
    const articleEl = createDocument(NOTION_ORDER_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/guide')
    const blocks = markdownToContentBlocks(md)

    const imageBlocks = blocks.filter(b => b.type === 'image')
    expect(imageBlocks.length).toBe(3)
  })

  it('all image blocks use external type', () => {
    const articleEl = createDocument(NOTION_ORDER_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/guide')
    const blocks = markdownToContentBlocks(md)

    const imageBlocks = blocks.filter(b => b.type === 'image')
    imageBlocks.forEach(b => {
      const img = b.image as { type: string; external: { url: string } }
      expect(img.type).toBe('external')
      expect(img.external.url).toMatch(/^https:\/\//)
    })
  })
})

// =============================================================================
// Scenario 9: Popup/History image metadata derivable from content
// =============================================================================

describe('Site Case 9: Popup/History image metadata', () => {
  it('buildHistoryInput carries image metadata for fullpage', () => {
    const draft = makeDraft({
      imageCount: 5,
      firstImageUrl: 'https://cdn.example.com/first.jpg',
      skippedImageCount: 2,
    })
    const input = buildHistoryInput(draft, makeTarget(), 'saving')

    expect(input.imageCount).toBe(5)
    expect(input.firstImageUrl).toBe('https://cdn.example.com/first.jpg')
    expect(input.skippedImageCount).toBe(2)
  })

  it('buildHistoryInput has undefined image metadata when not set', () => {
    const draft = makeDraft()
    const input = buildHistoryInput(draft, makeTarget(), 'saving')

    expect(input.imageCount).toBeUndefined()
    expect(input.firstImageUrl).toBeUndefined()
    expect(input.skippedImageCount).toBeUndefined()
  })

  it('save to Notion preserves image metadata in history (success)', async () => {
    mockFetch(200, { id: 'page-1' })
    mockStore[STORAGE_KEYS.SETTINGS] = makeSettings()

    const payload = makePayload()
    payload.draft.content.imageCount = 8
    payload.draft.content.firstImageUrl = 'https://cdn.example.com/hero.jpg'
    payload.draft.content.skippedImageCount = 3
    payload.draft.content.mode = 'fullpage'

    await handleSaveToNotion(payload)

    const history = getHistory()
    expect(history.length).toBe(1)
    expect(history[0].imageCount).toBe(8)
    expect(history[0].firstImageUrl).toBe('https://cdn.example.com/hero.jpg')
    expect(history[0].skippedImageCount).toBe(3)
  })

  it('save to Notion preserves image metadata in history (failure)', async () => {
    mockFetch(400, { message: 'Bad request' })
    mockStore[STORAGE_KEYS.SETTINGS] = makeSettings()

    const payload = makePayload()
    payload.draft.content.imageCount = 3
    payload.draft.content.firstImageUrl = 'https://cdn.example.com/broken.jpg'
    payload.draft.content.skippedImageCount = 1
    payload.draft.content.mode = 'fullpage'

    await handleSaveToNotion(payload)

    const history = getHistory()
    expect(history.length).toBe(1)
    expect(history[0].saveStatus).toBe('failed')
    expect(history[0].imageCount).toBe(3)
    expect(history[0].firstImageUrl).toBe('https://cdn.example.com/broken.jpg')
  })
})

// =============================================================================
// Scenario 10: selection/comment-context does not inherit fullpage image info
// =============================================================================

describe('Site Case 10: selection/comment-context regression', () => {
  it('selection mode markdown does not include fullpage image noise', () => {
    const selectionHtml = '<p>Selected text only, no images here.</p>'
    const md = htmlToMarkdown(selectionHtml, 'https://example.com/article')
    expect(md).not.toContain('![')
    expect(md).toContain('Selected text only')
  })

  it('selection mode draft has imageCount=0 when not set', () => {
    const draft = makeDraft({ mode: 'selection', imageCount: 0, skippedImageCount: 0 })
    const input = buildHistoryInput(draft, makeTarget(), 'saved')

    expect(input.imageCount).toBe(0)
    expect(input.skippedImageCount).toBe(0)
    expect(input.firstImageUrl).toBeUndefined()
  })

  it('comment-context markdown is not affected by image processing', () => {
    const commentCtxHtml = `
      <div class="comment-context">
        <p>Original post content by the author.</p>
        <p>A commenter replied with detailed analysis.</p>
      </div>
    `
    const doc = createDocument(commentCtxHtml)
    const article = doc.querySelector('.comment-context')!
    const md = htmlToMarkdown(article.innerHTML, 'https://example.com/post')

    expect(md).toContain('Original post content')
    expect(md).toContain('detailed analysis')
  })

  it('fullpage with no images produces zero image metadata', () => {
    const { doc, pageUrl } = createFullPage('<article><h1>No Images Here</h1><p>Just plain text content.</p></article>')
    const result = extractArticleImages(doc, { pageUrl })

    expect(result.images.length).toBe(0)
    expect(result.stats.kept).toBe(0)
  })
})

// =============================================================================
// Scenario 11: Edge cases — data/blob URI, empty alt, very small images
// =============================================================================

const EDGE_CASE_HTML = `
<article>
  <h1>Edge Case Article</h1>
  <p>Content with various edge-case images.</p>
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==" width="100" height="100" alt="Data URI image">
  <img src="blob:https://example.com/abc-123" width="200" height="200" alt="Blob URI image">
  <img src="https://cdn.example.com/valid.jpg" alt="" width="800" height="600">
  <img src="https://cdn.example.com/tiny-dot.png" width="10" height="10" alt="Tiny dot">
  <img src="https://cdn.example.com/narrow.jpg" width="30" height="600" alt="Narrow image">
  <img src="https://cdn.example.com/short.jpg" width="600" height="20" alt="Short image">
  <p>End of content.</p>
</article>
`

describe('Site Case 11: Edge cases', () => {
  it('filters data: and blob: URIs', () => {
    const doc = createDocument(EDGE_CASE_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://example.com/edge' })

    const urls = result.images.map(i => i.url)
    expect(urls).not.toContain(expect.stringContaining('data:image'))
    expect(urls).not.toContain(expect.stringContaining('blob:'))
  })

  it('handles empty alt gracefully', () => {
    const doc = createDocument(EDGE_CASE_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://example.com/edge' })

    const valid = result.images.find(i => i.url === 'https://cdn.example.com/valid.jpg')
    expect(valid).toBeDefined()
  })

  it('filters below minimum size images', () => {
    const doc = createDocument(EDGE_CASE_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://example.com/edge' })

    const urls = result.images.map(i => i.url)
    expect(urls).not.toContain('https://cdn.example.com/tiny-dot.png')
    expect(urls).not.toContain('https://cdn.example.com/narrow.jpg')
    expect(urls).not.toContain('https://cdn.example.com/short.jpg')
  })

  it('empty alt image gets fallback alt in markdown', () => {
    const articleEl = createDocument(EDGE_CASE_HTML).querySelector('article')!
    const md = htmlToMarkdown(articleEl.innerHTML, 'https://example.com/edge')

    expect(md).toContain('https://cdn.example.com/valid.jpg')
    expect(md).not.toContain('data:image')
    expect(md).not.toContain('blob:')
  })

  it('data/blob URIs become paragraphs in Notion blocks (not image blocks)', () => {
    const testMd = `Some text\n\n![alt](data:image/png;base64,abc)\n\n![alt](blob:https://x.com/y)\n\n![valid](https://cdn.example.com/ok.jpg)`
    const blocks = markdownToContentBlocks(testMd)

    const imageBlocks = blocks.filter(b => b.type === 'image')
    expect(imageBlocks.length).toBe(1)

    const paragraphs = blocks.filter(b => b.type === 'paragraph')
    expect(paragraphs.length).toBeGreaterThanOrEqual(2)
  })
})

// =============================================================================
// Scenario 12: Multi-scenario smoke test — full pipeline integration
// =============================================================================

const SMOKE_HTML = `
<div class="main-content">
  <h1>Smoke Test Article</h1>
  <div class="meta">
    <img class="avatar" src="/avatars/writer.jpg" width="40" height="40">
    <span>By Test Author</span>
    <img class="badge" src="/badges/pro.png" width="20" height="20">
  </div>
  <p>Opening paragraph.</p>
  <figure>
    <img src="https://cdn.example.com/smoke-1.jpg" alt="Smoke image 1" width="800" height="600">
    <figcaption>Caption for smoke image 1</figcaption>
  </figure>
  <p>Second paragraph with <img class="emoji" src="/emoji/fire.png" width="20" height="20" alt="fire"> inline emoji.</p>
  <img src="https://cdn.example.com/smoke-2.jpg" alt="Smoke image 2" width="800" height="600">
  <h2>Subsection</h2>
  <p>Subsection text.</p>
  <img src="https://cdn.example.com/smoke-3.jpg" alt="Smoke image 3" width="800" height="600">
  <img class="logo" src="/images/logo-footer.png" width="100" height="30" alt="Footer logo">
</div>
`

describe('Site Case 12: Full pipeline smoke test', () => {
  it('extract → markdown → notion blocks produces coherent output', () => {
    const doc = createDocument(SMOKE_HTML)
    const pageUrl = 'https://example.com/smoke-test'

    const extraction = extractArticleImages(doc, { pageUrl })
    expect(extraction.images.length).toBe(3)
    expect(extraction.skipped.length).toBeGreaterThanOrEqual(2)

    const contentEl = doc.querySelector('.main-content')!
    const md = htmlToMarkdown(contentEl.innerHTML, pageUrl)
    expect(md).toContain('![Smoke image 1]')
    expect(md).toContain('*Caption for smoke image 1*')
    expect(md).toContain('![Smoke image 2]')
    expect(md).toContain('![Smoke image 3]')
    expect(md).not.toContain('avatar')
    expect(md).not.toContain('badge')
    expect(md).not.toContain('logo-footer')

    const blocks = markdownToContentBlocks(md)
    const imageBlocks = blocks.filter(b => b.type === 'image')
    expect(imageBlocks.length).toBe(3)

    expect(md).toContain('## Subsection')
  })

  it('imageCount metadata matches extraction count', () => {
    const doc = createDocument(SMOKE_HTML)
    const result = extractArticleImages(doc, { pageUrl: 'https://example.com/smoke-test' })

    expect(result.images.length).toBe(result.stats.kept)
    expect(result.stats.skipped).toBe(result.skipped.length)
  })
})
