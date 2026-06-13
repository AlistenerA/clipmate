import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  isLikelyNoiseElement,
  calculateLinkDensity,
  hasEnoughArticleText,
  preCleanDocument,
  trimArticleBody,
  assessArticleConfidence,
  buildLowConfidenceSummary,
  classifyPageType,
} from '../src/content/extractors/articleBoundaryGuard'

function makeDom(bodyHtml: string): Document {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><body>${bodyHtml}</body></html>`,
    { url: 'https://example.com/' },
  )
  return dom.window.document
}

function firstEl(doc: Document, selector: string): Element {
  const el = doc.querySelector(selector)
  if (!el) throw new Error(`Element not found: ${selector}`)
  return el
}

function makeEl(tag: string, attrs: Record<string, string> = {}, innerHTML = ''): Element {
  const dom = new JSDOM(
    '<!DOCTYPE html><html><body></body></html>',
    { url: 'https://example.com/' },
  )
  const doc = dom.window.document
  const el = doc.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }
  el.innerHTML = innerHTML
  return el
}

describe('isLikelyNoiseElement', () => {
  it('marks script as noise', () => {
    const el = makeEl('script', {}, 'var x=1')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks style as noise', () => {
    const el = makeEl('style', {}, '.a{}')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks noscript as noise', () => {
    const el = makeEl('noscript', {}, 'no js')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks form as noise', () => {
    const el = makeEl('form')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks button as noise', () => {
    const el = makeEl('button', {}, 'click')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks input as noise', () => {
    const el = makeEl('input')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks nav as noise', () => {
    const el = makeEl('nav', {}, '<a>link</a>')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks footer as noise', () => {
    const el = makeEl('footer', {}, 'footer text')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks aside as noise', () => {
    const el = makeEl('aside', {}, 'sidebar')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks [role="navigation"] as noise', () => {
    const el = makeEl('div', { role: 'navigation' }, 'nav')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks [role="banner"] as noise', () => {
    const el = makeEl('div', { role: 'banner' }, 'banner')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks [role="complementary"] as noise', () => {
    const el = makeEl('div', { role: 'complementary' }, 'aside')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks [role="contentinfo"] as noise', () => {
    const el = makeEl('div', { role: 'contentinfo' }, 'footer')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks [role="search"] as noise', () => {
    const el = makeEl('div', { role: 'search' }, 'search')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks [role="dialog"] as noise', () => {
    const el = makeEl('div', { role: 'dialog' }, 'popup')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks [role="alert"] as noise', () => {
    const el = makeEl('div', { role: 'alert' }, 'alert')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with ad class as noise', () => {
    const el = makeEl('div', { class: 'ad-banner' }, 'ad')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with share class as noise', () => {
    const el = makeEl('div', { class: 'social-share' }, 'share')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with comment class as noise', () => {
    const el = makeEl('div', { class: 'comments-area' }, 'comments')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with related class as noise', () => {
    const el = makeEl('div', { class: 'related-posts' }, 'related')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with recommend class as noise', () => {
    const el = makeEl('div', { class: 'recommended-articles' }, 'recommended')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with login class as noise', () => {
    const el = makeEl('div', { class: 'login-box' }, 'login')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with qrcode class as noise', () => {
    const el = makeEl('div', { class: 'qrcode-wrap' }, 'qrcode')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with 广告 class as noise', () => {
    const el = makeEl('div', { class: '广告位' }, 'ad')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with 分享 class as noise', () => {
    const el = makeEl('div', { class: '分享栏' }, 'share')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with 评论 class as noise', () => {
    const el = makeEl('div', { class: '评论列表' }, 'comments')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with 相关推荐 class as noise', () => {
    const el = makeEl('div', { class: '相关推荐wrap' }, 'related')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('marks elements with 责任编辑 class as noise', () => {
    const el = makeEl('div', { class: '责任编辑框' }, 'editor')
    expect(isLikelyNoiseElement(el)).toBe(true)
  })

  it('preserves article element', () => {
    const el = makeEl('article', {}, '<p>content</p>')
    expect(isLikelyNoiseElement(el)).toBe(false)
  })

  it('preserves main element', () => {
    const el = makeEl('main', {}, '<p>content</p>')
    expect(isLikelyNoiseElement(el)).toBe(false)
  })

  it('preserves div with article-body class', () => {
    const el = makeEl('div', { class: 'article-body' }, '<p>Long article content here</p>')
    expect(isLikelyNoiseElement(el)).toBe(false)
  })

  it('preserves p element', () => {
    const el = makeEl('p', {}, 'a paragraph')
    expect(isLikelyNoiseElement(el)).toBe(false)
  })

  it('preserves h1/h2/h3 elements', () => {
    expect(isLikelyNoiseElement(makeEl('h1', {}, 'Title'))).toBe(false)
    expect(isLikelyNoiseElement(makeEl('h2', {}, 'Subtitle'))).toBe(false)
    expect(isLikelyNoiseElement(makeEl('h3', {}, 'Sub-subtitle'))).toBe(false)
  })

  it('preserves pre/code elements', () => {
    expect(isLikelyNoiseElement(makeEl('pre', {}, 'code'))).toBe(false)
    expect(isLikelyNoiseElement(makeEl('code', {}, 'code'))).toBe(false)
  })

  it('preserves table element', () => {
    const el = makeEl('table', {}, '<tr><td>data</td></tr>')
    expect(isLikelyNoiseElement(el)).toBe(false)
  })

  it('preserves img element', () => {
    const el = makeEl('img')
    expect(isLikelyNoiseElement(el)).toBe(false)
  })

  it('preserves figure element', () => {
    const el = makeEl('figure', {}, '<img><figcaption>caption</figcaption>')
    expect(isLikelyNoiseElement(el)).toBe(false)
  })

  it('preserves blockquote element', () => {
    const el = makeEl('blockquote', {}, 'quote')
    expect(isLikelyNoiseElement(el)).toBe(false)
  })

  it('preserves nav with long text (possibly content)', () => {
    const longText = 'Paragraph '.repeat(60)
    const el = makeEl('nav', {}, `<p>${longText}</p>`)
    expect(isLikelyNoiseElement(el)).toBe(false)
  })

  it('preserves div with noise class but long text', () => {
    const longText = 'Content paragraph. '.repeat(40)
    const el = makeEl('div', { class: 'ad-container' }, `<p>${longText}</p>`)
    expect(isLikelyNoiseElement(el)).toBe(false)
  })
})

describe('calculateLinkDensity', () => {
  it('returns 0 for element with no links', () => {
    const doc = makeDom('<div>pure text without links</div>')
    const el = firstEl(doc, 'div')
    expect(calculateLinkDensity(el)).toBe(0)
  })

  it('returns low density for element with text and few links', () => {
    const doc = makeDom('<div><p>AAAA BBBB CCCC DDDD EEEE</p><a href="a">short</a></div>')
    const el = firstEl(doc, 'div')
    expect(calculateLinkDensity(el)).toBeLessThan(0.5)
  })

  it('returns 1.0 when all text is links', () => {
    const doc = makeDom('<div><a href="a">all links</a></div>')
    const el = firstEl(doc, 'div')
    expect(calculateLinkDensity(el)).toBeCloseTo(1.0, 1)
  })

  it('returns <0.5 for article with few links', () => {
    const doc = makeDom(
      '<div><p>long article paragraph with enough words to make the link ratio low</p>' +
      '<p>second paragraph of the article content</p>' +
      '<a href="a">short</a></div>',
    )
    const el = firstEl(doc, 'div')
    expect(calculateLinkDensity(el)).toBeLessThan(0.5)
  })

  it('returns high density for navigation', () => {
    const doc = makeDom(
      '<nav><a href="a">Link One</a> <a href="b">Link Two</a> <a href="c">Link Three</a> <a href="d">Link Four</a></nav>',
    )
    const el = firstEl(doc, 'nav')
    expect(calculateLinkDensity(el)).toBeGreaterThan(0.8)
  })
})

describe('hasEnoughArticleText', () => {
  it('returns false for empty string', () => {
    expect(hasEnoughArticleText('')).toBe(false)
  })

  it('returns false for very short text', () => {
    expect(hasEnoughArticleText('hello world')).toBe(false)
  })

  it('returns false for text with only one long paragraph', () => {
    const text = 'A'.repeat(300)
    expect(hasEnoughArticleText(text)).toBe(false)
  })

  it('returns true for text with multiple paragraphs', () => {
    const p1 = 'First paragraph with enough content to be considered substantial text. '.repeat(5)
    const p2 = 'Second paragraph also needs to be long enough for the detection. '.repeat(5)
    expect(hasEnoughArticleText(p1 + '\n\n' + p2)).toBe(true)
  })

  it('returns true for Chinese article with multiple paragraphs', () => {
    const p1 = '第一段正文内容，包含足够的中文文字来满足正文检测的最小长度要求，需要更多的字符才能通过检测标准。'.repeat(4)
    const p2 = '第二段正文内容，同样需要足够的文字长度来通过文章的检测标准，确保内容足够丰富。'.repeat(4)
    expect(hasEnoughArticleText(p1 + '\n\n' + p2)).toBe(true)
  })
})

describe('preCleanDocument', () => {
  it('removes form elements', () => {
    const doc = makeDom('<div>keep</div><form><input></form>')
    const count = preCleanDocument(doc)
    expect(count).toBeGreaterThanOrEqual(1)
    expect(doc.querySelector('form')).toBeNull()
    expect(doc.querySelector('input')).toBeNull()
    expect(doc.querySelector('div')?.textContent).toContain('keep')
  })

  it('removes button elements', () => {
    const doc = makeDom('<div>keep</div><button>click</button>')
    preCleanDocument(doc)
    expect(doc.querySelector('button')).toBeNull()
    expect(doc.querySelector('div')?.textContent).toContain('keep')
  })

  it('removes [role="navigation"]', () => {
    const doc = makeDom(
      '<div role="navigation"><a>nav link</a></div><p>content</p>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('[role="navigation"]')).toBeNull()
    expect(doc.querySelector('p')?.textContent).toContain('content')
  })

  it('removes [role="search"]', () => {
    const doc = makeDom(
      '<div role="search"><input></div><article>content</article>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('[role="search"]')).toBeNull()
    expect(doc.querySelector('article')?.textContent).toContain('content')
  })

  it('removes [role="dialog"]', () => {
    const doc = makeDom(
      '<div role="dialog">popup</div><main>content</main>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('[role="dialog"]')).toBeNull()
    expect(doc.querySelector('main')?.textContent).toContain('content')
  })

  it('removes nav element', () => {
    const doc = makeDom(
      '<nav><ul><li><a>Home</a></li></ul></nav><article>body</article>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('nav')).toBeNull()
    expect(doc.querySelector('article')?.textContent).toContain('body')
  })

  it('removes footer element', () => {
    const doc = makeDom(
      '<footer>copyright 2024</footer><article>body</article>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('footer')).toBeNull()
    expect(doc.querySelector('article')?.textContent).toContain('body')
  })

  it('removes aside element', () => {
    const doc = makeDom(
      '<aside>sidebar links</aside><main>main content</main>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('aside')).toBeNull()
    expect(doc.querySelector('main')?.textContent).toContain('main content')
  })

  it('removes div with ad class', () => {
    const doc = makeDom(
      '<div class="ad-banner">sponsored</div><p>real content</p>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('.ad-banner')).toBeNull()
    expect(doc.querySelector('p')?.textContent).toContain('real content')
  })

  it('removes div with share-bar class', () => {
    const doc = makeDom(
      '<div class="share-bar"><button>share</button></div><p>content</p>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('.share-bar')).toBeNull()
  })

  it('removes div with comments class', () => {
    const doc = makeDom(
      '<div class="comments-area">user comments here</div><article>article</article>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('.comments-area')).toBeNull()
  })

  it('removes div with related-recommend class', () => {
    const doc = makeDom(
      '<div class="related-recommend">more articles</div><main>main</main>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('.related-recommend')).toBeNull()
  })

  it('removes div with 广告 class', () => {
    const doc = makeDom(
      '<div class="广告位">ad content</div><article>article</article>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('.广告位')).toBeNull()
  })

  it('removes div with 分享 class', () => {
    const doc = makeDom(
      '<div class="分享栏">share buttons</div><section>content</section>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('.分享栏')).toBeNull()
  })

  it('removes div with 相关推荐 class', () => {
    const doc = makeDom(
      '<div class="相关推荐wrap">recommended</div><div class="article-body">content</div>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('.相关推荐wrap')).toBeNull()
  })

  it('preserves article element', () => {
    const doc = makeDom('<article><h1>Title</h1><p>body</p></article>')
    preCleanDocument(doc)
    expect(doc.querySelector('article')).not.toBeNull()
    expect(doc.querySelector('h1')?.textContent).toContain('Title')
  })

  it('preserves main element', () => {
    const doc = makeDom('<main><p>content</p></main>')
    preCleanDocument(doc)
    expect(doc.querySelector('main')).not.toBeNull()
    expect(doc.querySelector('p')?.textContent).toContain('content')
  })

  it('preserves pre and code elements', () => {
    const doc = makeDom(
      '<div class="post-content"><pre><code>const x = 1;</code></pre></div>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('pre')).not.toBeNull()
    expect(doc.querySelector('code')).not.toBeNull()
  })

  it('preserves img inside figure', () => {
    const doc = makeDom(
      '<article><figure><img alt="photo"><figcaption>caption</figcaption></figure></article>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('img')).not.toBeNull()
    expect(doc.querySelector('figure')).not.toBeNull()
  })

  it('preserves table element', () => {
    const doc = makeDom(
      '<div class="article-body"><table><tr><td>data</td></tr></table></div>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('table')).not.toBeNull()
  })

  it('preserves blockquote element', () => {
    const doc = makeDom(
      '<article><blockquote><p>quoted text</p></blockquote></article>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('blockquote')).not.toBeNull()
  })

  it('preserves h1/h2/h3 headings inside article', () => {
    const doc = makeDom(
      '<article><h1>T1</h1><h2>T2</h2><h3>T3</h3><p>body</p></article>',
    )
    preCleanDocument(doc)
    expect(doc.querySelector('h1')?.textContent).toContain('T1')
    expect(doc.querySelector('h2')?.textContent).toContain('T2')
    expect(doc.querySelector('h3')?.textContent).toContain('T3')
  })

  it('handles news page with ads, share, nav, footer, recommendations', () => {
    const doc = makeDom(`
      <nav class="top-nav"><ul><li><a>Home</a></li><li><a>News</a></li></ul></nav>
      <div class="ad-banner">sponsored ad</div>
      <article class="news-content">
        <h1>Breaking News Title</h1>
        <p class="author">By Author Name | 2024-01-15</p>
        <p>First paragraph of the news article with substantial content.</p>
        <p>Second paragraph continuing the story.</p>
        <p>Third paragraph with more details.</p>
        <figure><img alt="photo"><figcaption>Image caption</figcaption></figure>
        <p>Fourth paragraph after the image.</p>
        <blockquote><p>Related quote from source.</p></blockquote>
        <p>Final paragraph wrapping up the story.</p>
      </article>
      <div class="share-bar"><button>Share to Weibo</button><button>Share to WeChat</button></div>
      <div class="comments-area">user comments here</div>
      <div class="related-recommend">
        <h3>Related Articles</h3>
        <ul><li><a>Link 1</a></li><li><a>Link 2</a></li></ul>
      </div>
      <footer class="site-footer">Copyright 2024</footer>
    `)

    preCleanDocument(doc)

    expect(doc.querySelector('nav.top-nav')).toBeNull()
    expect(doc.querySelector('.ad-banner')).toBeNull()
    expect(doc.querySelector('.share-bar')).toBeNull()
    expect(doc.querySelector('.comments-area')).toBeNull()
    expect(doc.querySelector('.related-recommend')).toBeNull()
    expect(doc.querySelector('footer')).toBeNull()

    expect(doc.querySelector('article.news-content')).not.toBeNull()
    expect(doc.querySelector('h1')?.textContent).toContain('Breaking')
    expect(doc.querySelector('figure')).not.toBeNull()
    expect(doc.querySelector('blockquote')).not.toBeNull()
  })

  it('handles tech blog with code blocks and navbar removed', () => {
    const doc = makeDom(`
      <nav class="blog-nav"><a>Home</a><a>Archive</a></nav>
      <div class="login-box">Login</div>
      <main class="post-content">
        <h1>Tutorial Title</h1>
        <p>Introduction paragraph.</p>
        <h2>Step 1</h2>
        <p>Explanation of step 1.</p>
        <pre><code class="language-python">print("hello world")</code></pre>
        <h2>Step 2</h2>
        <p>Explanation of step 2.</p>
        <table><tr><th>Key</th><th>Value</th></tr><tr><td>a</td><td>1</td></tr></table>
        <p>Conclusion.</p>
      </main>
      <div class="comment-list">comments</div>
      <footer>Blog footer</footer>
    `)

    preCleanDocument(doc)

    expect(doc.querySelector('nav.blog-nav')).toBeNull()
    expect(doc.querySelector('.login-box')).toBeNull()
    expect(doc.querySelector('.comment-list')).toBeNull()
    expect(doc.querySelector('footer')).toBeNull()

    expect(doc.querySelector('main.post-content')).not.toBeNull()
    expect(doc.querySelector('pre code')).not.toBeNull()
    expect(doc.querySelector('table')).not.toBeNull()
    expect(doc.querySelector('h2')).not.toBeNull()
  })

  it('preserves CSDN LaTeX tutorial content with tables/pre/code', () => {
    const doc = makeDom(`
      <div class="blog-container-for-me">
        <nav class="blog-nav">Navigation</nav>
        <div class="recommend-right">Related Articles</div>
        <article class="baidu_pl">
          <div id="content_views" class="markdown_views">
            <h1>LaTeX Math Symbols</h1>
            <h2>Greek Letters</h2>
            <p>Here are the Greek letters in LaTeX:</p>
            <table>
              <tr><th>Symbol</th><th>Command</th></tr>
              <tr><td>α</td><td>\\alpha</td></tr>
              <tr><td>β</td><td>\\beta</td></tr>
            </table>
            <h2>Matrices</h2>
            <pre><code class="language-latex">\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}</code></pre>
            <p>This produces the matrix above.</p>
          </div>
        </article>
        <div class="article-bar-bottom">likes/comments/share</div>
        <div class="copyright-box">copyright notice</div>
        <div class="blog-tags-box">tags here</div>
        <div class="comment-list">comments</div>
      </div>
    `)

    preCleanDocument(doc)

    expect(doc.querySelector('nav.blog-nav')).toBeNull()
    expect(doc.querySelector('.recommend-right')).toBeNull()
    expect(doc.querySelector('.article-bar-bottom')).toBeNull()
    expect(doc.querySelector('.copyright-box')).toBeNull()
    expect(doc.querySelector('.blog-tags-box')).toBeNull()
    expect(doc.querySelector('.comment-list')).toBeNull()

    expect(doc.querySelector('article')).not.toBeNull()
    expect(doc.querySelector('h1')).not.toBeNull()
    expect(doc.querySelector('h2')).not.toBeNull()
    expect(doc.querySelector('table')).not.toBeNull()
    expect(doc.querySelector('pre code')).not.toBeNull()
    const bodyText = doc.querySelector('#content_views')?.textContent ?? ''
    expect(bodyText).toContain('LaTeX')
    expect(bodyText).toContain('Greek')
  })
})

describe('trimArticleBody', () => {
  it('returns empty string unchanged', () => {
    expect(trimArticleBody('')).toBe('')
  })

  it('returns content without tail patterns unchanged', () => {
    const md = '# Title\n\nParagraph one.\n\nParagraph two.'
    expect(trimArticleBody(md)).toBe(md)
  })

  it('cuts at 责任编辑 in latter half', () => {
    const md = '# Title\n\nParagraph one.\n\nParagraph two.\n\nParagraph three.\n\nParagraph four.\n\n责任编辑：张三\n\n多余内容'
    const result = trimArticleBody(md)
    expect(result).not.toContain('责任编辑')
    expect(result).not.toContain('多余内容')
    expect(result).toContain('Paragraph four')
  })

  it('cuts at 相关推荐 in latter half', () => {
    const md = '# Title\n\nLong paragraph one with enough text.\n\nLong paragraph two.\n\nLong paragraph three.\n\n相关推荐\n\n推荐链接列表'
    const result = trimArticleBody(md)
    expect(result).not.toContain('相关推荐')
    expect(result).not.toContain('推荐链接列表')
    expect(result).toContain('Long paragraph three')
  })

  it('cuts at 分享到 in latter half', () => {
    const md = '# Title\n\nParagraph one.\n\nParagraph two.\n\n分享到 微博 微信'
    const result = trimArticleBody(md)
    expect(result).not.toContain('分享到')
    expect(result).toContain('Paragraph two')
  })

  it('cuts at 免责声明', () => {
    const md = '# Title\n\nContent here.\n\nMore content.\n\n免责声明：本文仅供参考'
    const result = trimArticleBody(md)
    expect(result).not.toContain('免责声明')
  })

  it('cuts at 广告', () => {
    const md = '# Title\n\nArticle content.\n\nMore article.\n\n广告：推广内容'
    const result = trimArticleBody(md)
    expect(result).not.toContain('广告')
    expect(result).toContain('More article')
  })

  it('does not cut short content with 评论 in first half', () => {
    const md = '# 评论文章\n\n这篇文章评论了某个事件。\n\n正文继续。'
    const result = trimArticleBody(md)
    expect(result).toContain('评论')
  })

  it('does not cut when pattern is in very long line', () => {
    const longLine = 'A'.repeat(120) + ' 责任编辑：'
    const md = `# Title\n\nParagraph.\n\n${longLine}\n\nMore content.`
    const result = trimArticleBody(md)
    expect(result).toContain('More content')
  })

  it('cuts at 上一篇 in latter half', () => {
    const md = '# Title\n\nPara 1.\n\nPara 2.\n\nPara 3.\n\n上一篇：other article\n\n下一篇：next'
    const result = trimArticleBody(md)
    expect(result).not.toContain('上一篇')
  })

  it('cuts at 打开app', () => {
    const md = '# Title\n\nContent.\n\nMore.\n\n打开app阅读全文'
    const result = trimArticleBody(md)
    expect(result).not.toContain('打开app')
  })
})

describe('assessArticleConfidence', () => {
  it('returns high confidence for substantial article', () => {
    const text = 'Paragraph one with enough text. '.repeat(5) + '\n\n' +
      'Paragraph two with more text. '.repeat(5) + '\n\n' +
      'Paragraph three continues the article. '.repeat(5)
    const html = '<p>P1</p><p>P2</p><p>P3</p>'
    const report = assessArticleConfidence(text, html)
    expect(report.confidence).toBe('high')
    expect(report.paragraphCount).toBeGreaterThanOrEqual(2)
  })

  it('returns low confidence for very short text with no paragraphs', () => {
    const text = 'Short text.'
    const html = '<p>Short text.</p>'
    const report = assessArticleConfidence(text, html)
    expect(report.confidence).toBe('low')
    expect(report.reasonCodes).toContain('INSUFFICIENT_CONTENT')
  })

  it('returns medium confidence for long single-paragraph text', () => {
    const text = 'A'.repeat(300)
    const html = '<p>' + 'A'.repeat(300) + '</p>'
    const report = assessArticleConfidence(text, html)
    expect(report.confidence).toBe('medium')
  })

  it('returns medium for substantial text with high link density', () => {
    const p1 = 'Content paragraph with enough text to count. '.repeat(5)
    const p2 = 'Another paragraph also with enough text. '.repeat(5)
    const p3 = 'Third paragraph with more details. '.repeat(5)
    const text = [p1, p2, p3].join('\n\n')
    let linkHtml = ''
    for (let i = 0; i < 30; i++) {
      linkHtml += `<a href="/${i}">Link Title ${i} with some extra words for proportion</a>`
    }
    const html = '<p>' + p1 + '</p><p>' + p2 + '</p><p>' + p3 + '</p>' + linkHtml
    const report = assessArticleConfidence(text, html)
    expect(report.confidence).toBe('medium')
    expect(report.reasonCodes).toContain('HIGH_LINK_DENSITY')
  })

  it('returns low for short single-paragraph text with high link density', () => {
    const text = 'A'.repeat(100)
    const html = '<p>A</p>' + Array.from({ length: 20 }, (_, i) => `<a href="/${i}">Link Title ${i} with words</a>`).join('')
    const report = assessArticleConfidence(text, html)
    expect(report.confidence).toBe('low')
  })

  it('returns medium confidence for moderate link density', () => {
    const p1 = 'Content paragraph with enough text to count properly. '.repeat(4)
    const p2 = 'Second paragraph also with sufficient text length. '.repeat(4)
    const text = p1 + '\n\n' + p2
    let linkHtml = ''
    for (let i = 0; i < 10; i++) {
      linkHtml += `<a href="/${i}">Link ${i}</a>`
    }
    const html = '<p>' + p1 + '</p><p>' + p2 + '</p>' + linkHtml
    const report = assessArticleConfidence(text, html)
    expect(['medium', 'high']).toContain(report.confidence)
  })

  it('reports textLength and paragraphCount', () => {
    const p1 = 'Para one with enough text. '.repeat(5)
    const p2 = 'Para two with sufficient words. '.repeat(5)
    const text = p1 + '\n\n' + p2
    const html = '<p>p1</p><p>p2</p>'
    const report = assessArticleConfidence(text, html)
    expect(report.textLength).toBeGreaterThan(100)
    expect(report.paragraphCount).toBeGreaterThanOrEqual(2)
    expect(typeof report.linkDensity).toBe('number')
  })

  it('returns low for list-like page with many links and short paragraphs', () => {
    const text = 'link1\n\nlink2\n\nlink3\n\nlink4\n\nlink5\n\nlink6'
    const html = Array.from({ length: 20 }, (_, i) => `<a href="/${i}">Link Title with some words ${i}</a>`).join('')
    const report = assessArticleConfidence(text, html)
    expect(report.confidence).toBe('low')
    expect(report.reasonCodes).toContain('INSUFFICIENT_CONTENT')
  })

  it('returns low for search result page', () => {
    const text = Array.from({ length: 3 }, (_, i) => `Result ${i} title`).join('\n\n')
    let html = '<input type="search" name="q">'
    for (let i = 0; i < 15; i++) {
      html += `<a href="/result${i}">Search Result Title ${i}</a>`
    }
    const report = assessArticleConfidence(text, html)
    expect(report.confidence).toBe('low')
    expect(report.reasonCodes.some(c => c === 'LIST_PAGE' || c === 'HIGH_LINK_DENSITY' || c === 'INSUFFICIENT_CONTENT')).toBe(true)
  })
})

describe('buildLowConfidenceSummary', () => {
  it('builds summary with title and disclaimer', () => {
    const doc = makeDom('<body><p>some content</p></body>')
    const result = buildLowConfidenceSummary(doc, 'Test Page', 'https://example.com')
    expect(result).toContain('当前页面可能不是文章页')
    expect(result).toContain('Test Page')
    expect(result).toContain('https://example.com')
  })

  it('includes up to 10 links', () => {
    const links = Array.from({ length: 15 }, (_, i) =>
      `<a href="/page${i}">Link Title ${i}</a>`,
    ).join('')
    const doc = makeDom(`<body>${links}</body>`)
    const result = buildLowConfidenceSummary(doc, 'Links', 'https://x.com')

    const linkCount = (result.match(/\[Link Title/g) || []).length
    expect(linkCount).toBeLessThanOrEqual(10)
  })

  it('excludes noise links', () => {
    const doc = makeDom(`
      <body>
        <a href="/login" class="login-btn">登录</a>
        <a href="/share" class="share-link">分享</a>
        <a href="/real-article">Real Article Title Here</a>
        <a href="/ad" class="ad-banner">广告推广</a>
        <a href="/real-2">Another Article</a>
      </body>
    `)
    const result = buildLowConfidenceSummary(doc, 'Page', 'https://x.com')

    expect(result).not.toContain('登录')
    expect(result).not.toContain('分享')
    expect(result).not.toContain('广告')
    expect(result).toContain('Real Article Title Here')
    expect(result).toContain('Another Article')
  })

  it('deduplicates repeated links', () => {
    const doc = makeDom(`
      <body>
        <a href="/same">Same Link</a>
        <a href="/same">Same Link</a>
        <a href="/diff">Different Link</a>
      </body>
    `)
    const result = buildLowConfidenceSummary(doc, 'Page', 'https://x.com')

    const matchCount = (result.match(/Same Link/g) || []).length
    expect(matchCount).toBe(1)
    expect(result).toContain('Different Link')
  })

  it('excludes javascript: links', () => {
    const doc = makeDom(`
      <body>
        <a href="javascript:void(0)">No-op</a>
        <a href="/real">Real Link</a>
      </body>
    `)
    const result = buildLowConfidenceSummary(doc, 'Page', 'https://x.com')
    expect(result).not.toContain('No-op')
    expect(result).toContain('Real Link')
  })

  it('excludes anchor links', () => {
    const doc = makeDom(`
      <body>
        <a href="#section">Jump</a>
        <a href="/page">Page Link</a>
      </body>
    `)
    const result = buildLowConfidenceSummary(doc, 'Page', 'https://x.com')
    expect(result).not.toContain('Jump')
    expect(result).toContain('Page Link')
  })

  it('handles empty document gracefully', () => {
    const doc = makeDom('<body></body>')
    const result = buildLowConfidenceSummary(doc, 'Empty', 'https://x.com')
    expect(result).toContain('当前页面可能不是文章页')
    expect(result).toContain('Empty')
  })

  it('handles missing title/url gracefully', () => {
    const doc = makeDom('<body><a href="/a">Link</a></body>')
    const result = buildLowConfidenceSummary(doc, '', '')
    expect(result).toContain('当前页面可能不是文章页')
    expect(result).toContain('Link')
  })

  it('uses search results message for search page type', () => {
    const doc = makeDom('<body><a href="/a">Link</a></body>')
    const result = buildLowConfidenceSummary(doc, '', '', 'search-results')
    expect(result).toContain('搜索结果页')
    expect(result).toContain('少量主要结果链接')
  })

  it('uses navigation message for navigation page type', () => {
    const doc = makeDom('<body><a href="/a">Link</a></body>')
    const result = buildLowConfidenceSummary(doc, '', '', 'navigation')
    expect(result).toContain('导航或聚合页')
    expect(result).toContain('无关链接')
  })
})

describe('classifyPageType', () => {
  it('identifies Bing-like search results page', () => {
    const doc = makeDom(`
      <title>hello world - 搜索</title>
      <input name="q" value="hello">
      <div role="main">
        <a href="/r1">Result One Title</a>
        <span>Description of result one with some text content here.</span>
        <a href="/r2">Result Two Title</a>
        <span>Description of result two with more text.</span>
        <a href="/r3">Result Three Title</a>
      </div>
    `)
    expect(classifyPageType(doc)).toBe('search-results')
  })

  it('identifies Baidu-like search results page', () => {
    const doc = makeDom(`
      <title>搜索结果_百度搜索</title>
      <input type="text" id="kw">
      <div>
        <a href="http://example1.com">结果标题一</a>
        <a href="http://example2.com">结果标题二</a>
        <a href="http://example3.com">结果标题三</a>
        <a href="http://example4.com">结果标题四</a>
      </div>
    `)
    expect(classifyPageType(doc)).toBe('search-results')
  })

  it('identifies navigation/card page', () => {
    const doc = makeDom(`
      <title>New Tab</title>
      <div>
        <a href="/shortcut1">S1</a>
        <a href="/shortcut2">S2</a>
        <a href="/shortcut3">S3</a>
        <a href="/shortcut4">S4</a>
        <a href="/shortcut5">S5</a>
        <a href="/shortcut6">S6</a>
        <a href="/shortcut7">S7</a>
        <a href="/shortcut8">S8</a>
        <a href="/shortcut9">S9</a>
      </div>
    `)
    expect(classifyPageType(doc)).toBe('navigation')
  })

  it('identifies article page', () => {
    const doc = makeDom(`
      <article>
        <h1>Article Title</h1>
        <p>First paragraph with enough text content for classification. `.repeat(5) + `</p>
        <p>Second paragraph also with sufficient text length here. `.repeat(5) + `</p>
        <p>Third paragraph with more detailed information content. `.repeat(5) + `</p>
      </article>
    `)
    expect(classifyPageType(doc)).toBe('article')
  })

  it('identifies page with role=search as search-results', () => {
    const doc = makeDom(`
      <title>Search</title>
      <div role="search"><input name="q"></div>
      <a href="/r1">Result 1</a>
      <a href="/r2">Result 2</a>
      <a href="/r3">Result 3</a>
    `)
    expect(classifyPageType(doc)).toBe('search-results')
  })

  it('returns unknown for ambiguous page', () => {
    const doc = makeDom('<body><p>Just a short page.</p></body>')
    expect(classifyPageType(doc)).toBe('unknown')
  })
})
