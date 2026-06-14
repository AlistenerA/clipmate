import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  extractArticleImages,
  isNoiseByAncestor,
  isNoiseUrl,
} from '../src/content/extractors/articleImages'
import { htmlToMarkdown } from '../src/content/parser/htmlToMarkdown'
import { markdownToContentBlocks } from '../src/platforms/notion/blocks'

function createDocument(bodyHtml: string, url = 'https://example.com/article'): Document {
  const dom = new JSDOM(`<!DOCTYPE html><html><head><title>Test</title></head><body>${bodyHtml}</body></html>`, { url })
  return dom.window.document
}

// =============================================================================
// Sina-like full page fixture
// =============================================================================

const SINA_FULL_PAGE = `
<article class="article" id="article">
  <h1>Breaking News: Major Policy Change</h1>
  <p>Opening paragraph about the policy.</p>

  <!-- Body image 1: legitimate content image -->
  <figure>
    <img src="https://k.sinaimg.cn/n/news/crawl/20260614/abc123_w700d1q75cms.jpg?by=cms_fixed_width"
         alt="Policy announcement ceremony" width="700" height="467">
    <figcaption>The policy was announced at a press conference</figcaption>
  </figure>

  <p>Second paragraph with analysis.</p>

  <!-- Body image 2: content image with different CDN -->
  <img src="https://k.sinaimg.cn/n/news/transform/20260614/def456_w600h400.jpg"
       alt="Data chart showing trends" width="600" height="400">

  <p>Third paragraph with further details.</p>

  <!-- Body image 3: another content image -->
  <img src="https://k.sinaimg.cn/n/news/crawl/20260614/ghi789_w1024d1q75cms.jpg?by=cms_fixed_width"
       alt="On-site report photo" width="1024" height="683">

  <p>Fourth paragraph.</p>

  <!-- Body image 4: PNG content image -->
  <img src="https://k.sinaimg.cn/n/news/infographic/20260614/jkl012_w800h600.png"
       alt="Infographic timeline" width="800" height="600">

  <p>Fifth concluding paragraph.</p>
</article>

<!-- Recommend section: should NOT be included in images -->
<div class="bottom-recommend">
  <h3>Recommended Reading</h3>
  <div class="feed-card">
    <img class="thumb" src="https://n.sinaimg.cn/default/393/w253h140/20260614/recommend-thumb-1.jpg"
         alt="Recommend 1" width="253" height="140">
  </div>
  <div class="feed-card">
    <img src="https://n.sinaimg.cn/sinakd/20260614/w150h100/recommend-thumb-2.jpg"
         alt="Recommend 2" width="150" height="100">
  </div>
</div>

<!-- Hot news section: should NOT be included -->
<section class="hot-news">
  <h3>Hot Topics</h3>
  <div class="news-list">
    <img src="https://n.sinaimg.cn/default/393/w180h119/20260614/hot-thumb-1.jpg"
         alt="Hot 1" width="180" height="119">
    <img src="https://n.sinaimg.cn/sinakd/20260614/w252h140/hot-thumb-2.jpg"
         alt="Hot 2" width="252" height="140">
  </div>
</section>

<!-- Sidebar: should NOT be included -->
<aside class="sidebar">
  <img src="https://n.sinaimg.cn/default/393/w326h183/sidebar-ad-1.jpg"
       alt="Sidebar ad" width="326" height="183">
  <img src="https://n.sinaimg.cn/sinakd/20260614/w253h140/sidebar-thumb-2.jpg"
       alt="Sidebar thumb" width="253" height="140">
</aside>

<!-- Related articles: should NOT be included -->
<div class="related-articles">
  <img src="https://n.sinaimg.cn/default/393/w252h140/related-1.jpg"
       alt="Related 1" width="252" height="140">
</div>
`

// =============================================================================
// Readability-extracted content HTML (simulating what readability returns)
// =============================================================================

const EXTRACTED_CONTENT_HTML = `
<article class="article" id="article">
  <h1>Breaking News: Major Policy Change</h1>
  <p>Opening paragraph about the policy.</p>
  <figure>
    <img src="https://k.sinaimg.cn/n/news/crawl/20260614/abc123_w700d1q75cms.jpg?by=cms_fixed_width"
         alt="Policy announcement ceremony" width="700" height="467">
    <figcaption>The policy was announced at a press conference</figcaption>
  </figure>
  <p>Second paragraph with analysis.</p>
  <img src="https://k.sinaimg.cn/n/news/transform/20260614/def456_w600h400.jpg"
       alt="Data chart showing trends" width="600" height="400">
  <p>Third paragraph with further details.</p>
  <img src="https://k.sinaimg.cn/n/news/crawl/20260614/ghi789_w1024d1q75cms.jpg?by=cms_fixed_width"
       alt="On-site report photo" width="1024" height="683">
  <p>Fourth paragraph.</p>
  <img src="https://k.sinaimg.cn/n/news/infographic/20260614/jkl012_w800h600.png"
       alt="Infographic timeline" width="800" height="600">
  <p>Fifth concluding paragraph.</p>
</article>
`

// =============================================================================
// Tests: Problem A — Image Pollution Guard
// =============================================================================

describe('Sina image pollution guard', () => {
  it('extractArticleImages from full document returns only body images after noise filtering', () => {
    const doc = createDocument(SINA_FULL_PAGE, 'https://news.sina.com.cn/w/article/1')
    const result = extractArticleImages(doc.body, { pageUrl: 'https://news.sina.com.cn/w/article/1' })

    const urls = result.images.map(i => i.url)

    // Body images should be kept
    expect(urls).toContain('https://k.sinaimg.cn/n/news/crawl/20260614/abc123_w700d1q75cms.jpg?by=cms_fixed_width')
    expect(urls).toContain('https://k.sinaimg.cn/n/news/transform/20260614/def456_w600h400.jpg')
    expect(urls).toContain('https://k.sinaimg.cn/n/news/crawl/20260614/ghi789_w1024d1q75cms.jpg?by=cms_fixed_width')
    expect(urls).toContain('https://k.sinaimg.cn/n/news/infographic/20260614/jkl012_w800h600.png')
  })

  it('extractArticleImages filters recommend section thumbnails', () => {
    const doc = createDocument(SINA_FULL_PAGE, 'https://news.sina.com.cn/w/article/1')
    const result = extractArticleImages(doc.body, { pageUrl: 'https://news.sina.com.cn/w/article/1' })

    const urls = result.images.map(i => i.url)

    // Recommend thumbnails should NOT appear
    expect(urls).not.toContain(expect.stringContaining('default/393/w253h140'))
    expect(urls).not.toContain(expect.stringContaining('sinakd'))
    expect(urls).not.toContain(expect.stringContaining('w150h100'))
    expect(urls).not.toContain(expect.stringContaining('w180h119'))
    expect(urls).not.toContain(expect.stringContaining('w252h140'))
    expect(urls).not.toContain(expect.stringContaining('w326h183'))
  })

  it('extractArticleImages with just article HTML returns only 4 body images', () => {
    const doc = createDocument(SINA_FULL_PAGE, 'https://news.sina.com.cn/w/article/1')
    const articleEl = doc.querySelector('#article')!

    const result = extractArticleImages(articleEl, { pageUrl: 'https://news.sina.com.cn/w/article/1' })

    expect(result.images.length).toBe(4)
    expect(result.skipped.length).toBe(0)
  })

  it('extractArticleImages from extracted content fragment yields exactly 4 images', () => {
    const result = extractArticleImages(
      createDocument(EXTRACTED_CONTENT_HTML).body,
      { pageUrl: 'https://news.sina.com.cn/w/article/1' },
    )

    expect(result.images.length).toBe(4)
  })

  it('filters n.sinaimg.cn/default thumbnail URLs via noiseUrl patterns', () => {
    expect(isNoiseUrl('https://n.sinaimg.cn/default/393/w253h140/recommend.jpg')).toBe(true)
    expect(isNoiseUrl('https://n.sinaimg.cn/default/393/w180h119/hot.jpg')).toBe(true)
    expect(isNoiseUrl('https://n.sinaimg.cn/default/393/w326h183/sidebar.jpg')).toBe(true)
    expect(isNoiseUrl('https://n.sinaimg.cn/default/393/w252h140/related.jpg')).toBe(true)
  })

  it('filters sina sinakd recommend thumbnail URLs via noiseUrl patterns', () => {
    expect(isNoiseUrl('https://n.sinaimg.cn/sinakd/20260614/w150h100/recommend.jpg')).toBe(true)
    expect(isNoiseUrl('https://n.sinaimg.cn/sinakd/20260614/w253h140/hot.jpg')).toBe(true)
  })

  it('keeps legitimate content image URLs (k.sinaimg.cn news crawl)', () => {
    expect(isNoiseUrl('https://k.sinaimg.cn/n/news/crawl/20260614/abc_w700d1q75cms.jpg?by=cms_fixed_width')).toBe(false)
    expect(isNoiseUrl('https://k.sinaimg.cn/n/news/transform/20260614/def_w600h400.jpg')).toBe(false)
    expect(isNoiseUrl('https://k.sinaimg.cn/n/news/infographic/20260614/jkl_w800h600.png')).toBe(false)
  })
})

// =============================================================================
// Tests: isNoiseByAncestor
// =============================================================================

describe('isNoiseByAncestor', () => {
  it('detects recommend ancestor', () => {
    const doc = createDocument('<div class="bottom-recommend"><img src="https://example.com/a.jpg"></div>')
    const img = doc.querySelector('img')!
    expect(isNoiseByAncestor(img)).toBe(true)
  })

  it('detects hot-news ancestor', () => {
    const doc = createDocument('<section class="hot-news"><img src="https://example.com/b.jpg"></section>')
    const img = doc.querySelector('img')!
    expect(isNoiseByAncestor(img)).toBe(true)
  })

  it('detects sidebar ancestor', () => {
    const doc = createDocument('<aside class="sidebar"><img src="https://example.com/c.jpg"></aside>')
    const img = doc.querySelector('img')!
    expect(isNoiseByAncestor(img)).toBe(true)
  })

  it('detects related-articles ancestor', () => {
    const doc = createDocument('<div class="related-articles"><img src="https://example.com/d.jpg"></div>')
    const img = doc.querySelector('img')!
    expect(isNoiseByAncestor(img)).toBe(true)
  })

  it('detects feed-card ancestor', () => {
    const doc = createDocument('<div class="feed-card"><img src="https://example.com/e.jpg"></div>')
    const img = doc.querySelector('img')!
    expect(isNoiseByAncestor(img)).toBe(true)
  })

  it('detects trending ancestor', () => {
    const doc = createDocument('<div class="trending"><img src="https://example.com/f.jpg"></div>')
    const img = doc.querySelector('img')!
    expect(isNoiseByAncestor(img)).toBe(true)
  })

  it('does not flag normal article content', () => {
    const doc = createDocument(`
      <article class="article-content">
        <figure><img src="https://example.com/body.jpg"></figure>
      </article>
    `)
    const img = doc.querySelector('img')!
    expect(isNoiseByAncestor(img)).toBe(false)
  })

  it('detects ranking ancestor', () => {
    const doc = createDocument('<div class="ranking"><img src="https://example.com/g.jpg"></div>')
    const img = doc.querySelector('img')!
    expect(isNoiseByAncestor(img)).toBe(true)
  })
})

// =============================================================================
// Tests: Problem B — Notion Image URL Compatibility
// =============================================================================

describe('Notion image URL compatibility', () => {
  it('converts direct CDN body image URLs to Notion image blocks', () => {
    const md = `![Photo](https://k.sinaimg.cn/n/news/crawl/20260614/abc123_w700d1q75cms.jpg?by=cms_fixed_width)`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(1)
    expect(blocks[0].type).toBe('image')
  })

  it('converts simple .jpg URLs to Notion image blocks', () => {
    const md = `![Photo](https://k.sinaimg.cn/n/news/transform/20260614/def456_w600h400.jpg)`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(1)
    expect(blocks[0].type).toBe('image')
  })

  it('converts .png direct CDN URLs to Notion image blocks', () => {
    const md = `![Timeline](https://k.sinaimg.cn/n/news/infographic/20260614/jkl012_w800h600.png)`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(1)
    expect(blocks[0].type).toBe('image')
  })

  it('downgrades img.mix.sina.com.cn/api/auto/resize URLs to paragraph', () => {
    const md = `![Resized](https://img.mix.sina.com.cn/api/auto/resize?img=http://example.com/photo.jpg&w=400&h=300)`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(1)
    expect(blocks[0].type).toBe('paragraph')
    expect(blocks[0].paragraph).toBeDefined()
  })

  it('downgrades /api/ path URLs to paragraph', () => {
    const md = `![Image](https://cdn.example.com/api/v1/image/resize?id=123&width=400)`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(1)
    expect(blocks[0].type).toBe('paragraph')
  })

  it('allows CDN URLs with dimension query params as image blocks', () => {
    const md = `![Image](https://img.example.com/photo?w=400&h=300)`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(1)
    // Dimension-only query params on direct CDN URLs are common and valid
    expect(blocks[0].type).toBe('image')
  })

  it('downgraded paragraph does not block surrounding content', () => {
    const md = `Some text here.\n\n![bad](https://img.mix.sina.com.cn/api/auto/resize?img=x.jpg)\n\nMore text after.`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(3)
    expect(blocks[0].type).toBe('paragraph')
    expect(blocks[1].type).toBe('paragraph')
    expect(blocks[2].type).toBe('paragraph')
  })

  it('mixed good and bad URLs: good ones become image blocks, bad ones paragraphs', () => {
    const md = `![Good](https://k.sinaimg.cn/n/news/photo.jpg)\n\n![Bad](https://img.mix.sina.com.cn/api/auto/resize?img=x.jpg)\n\n![Good2](https://cdn.example.com/chart.png)`
    const blocks = markdownToContentBlocks(md)

    const imageBlocks = blocks.filter(b => b.type === 'image')
    const paragraphBlocks = blocks.filter(b => b.type === 'paragraph')

    expect(imageBlocks.length).toBe(2)
    expect(paragraphBlocks.length).toBe(1)
  })

  it('keeps simple CDN URL with query params that are not resize indicators', () => {
    const md = `![Photo](https://k.sinaimg.cn/n/news/20260614/photo.jpg?by=cms_fixed_width)`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(1)
    expect(blocks[0].type).toBe('image')
  })
})

// =============================================================================
// Tests: Markdown pollution from fragments
// =============================================================================

describe('Markdown image cleanliness', () => {
  it('markdown from extracted content HTML has no sidebar images', () => {
    const md = htmlToMarkdown(EXTRACTED_CONTENT_HTML, 'https://news.sina.com.cn/w/article/1')

    expect(md).toContain('Policy announcement ceremony')
    expect(md).toContain('Data chart showing trends')
    expect(md).toContain('On-site report photo')
    expect(md).toContain('Infographic timeline')

    expect(md).not.toContain('default/393')
    expect(md).not.toContain('sinakd')
    expect(md).not.toContain('bottom-recommend')
    expect(md).not.toContain('hot-news')
    expect(md).not.toContain('sidebar')
    expect(md).not.toContain('related-articles')
  })

  it('markdown from full page has only body images when using extractArticleImages on #article', () => {
    const doc = createDocument(SINA_FULL_PAGE, 'https://news.sina.com.cn/w/article/1')
    const articleEl = doc.querySelector('#article')!
    const result = extractArticleImages(articleEl, { pageUrl: 'https://news.sina.com.cn/w/article/1' })

    const urls = result.images.map(i => i.url)
    expect(urls.length).toBe(4)
  })
})

// =============================================================================
// Tests: selection/comment-context regression
// =============================================================================

describe('selection/comment-context regression', () => {
  it('selection mode markdown has no image syntax', () => {
    const md = htmlToMarkdown('<p>Selected text only, no images.</p>', 'https://example.com/article')
    expect(md).not.toContain('![')
    expect(md).toContain('Selected text only')
  })

  it('extractArticleImages with selection fragment returns zero images', () => {
    const result = extractArticleImages(
      createDocument('<p>Plain text selection.</p>').body,
      { pageUrl: 'https://example.com/article' },
    )
    expect(result.images.length).toBe(0)
  })
})
