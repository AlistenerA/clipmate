import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  detectPageType,
  extractSignalsFromDocument,
  detectPageTypeFromDocument,
  type PageTypeDetectionSignals,
} from '../src/shared/utils/pageTypeDetector'

function makeDom(bodyHtml: string, url = 'https://example.com/', title?: string): Document {
  const titleTag = title ? `<title>${title}</title>` : ''
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head>${titleTag}</head><body>${bodyHtml}</body></html>`,
    { url },
  )
  return dom.window.document
}

function makeSignals(overrides: Partial<PageTypeDetectionSignals> = {}): PageTypeDetectionSignals {
  return {
    url: 'https://example.com/',
    title: '',
    domain: 'example.com',
    linkCount: 0,
    linkDensity: 0,
    textLength: 0,
    headingCount: 0,
    paragraphCount: 0,
    listCount: 0,
    formCount: 0,
    videoCount: 0,
    iframeCount: 0,
    articleLikeScore: 0,
    commentLikeCount: 0,
    hasSearchInput: false,
    hasSearchRole: false,
    hasConversationPattern: false,
    hasCodeBlock: false,
    mainTextLength: 0,
    ...overrides,
  }
}

// ============= article detection =============

describe('detectPageType - article', () => {
  it('detects article with long text, multiple paragraphs, low link density', () => {
    const signals = makeSignals({
      textLength: 1500,
      paragraphCount: 5,
      linkDensity: 0.1,
      headingCount: 3,
      articleLikeScore: 3,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('article')
    expect(result.confidence).toBeGreaterThan(0.5)
  })

  it('detects article from DOM with semantic elements', () => {
    const doc = makeDom(`
      <article>
        <h1>Article Title</h1>
        <p>${'First paragraph with enough text content for classification. '.repeat(6)}</p>
        <p>${'Second paragraph also with sufficient text length here. '.repeat(6)}</p>
        <p>${'Third paragraph with more detailed information content. '.repeat(6)}</p>
        <p>${'Fourth paragraph continuing the discussion. '.repeat(6)}</p>
      </article>
    `)
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('article')
    expect(result.confidence).toBeGreaterThan(0.5)
  })

  it('detects article with og:type=article meta', () => {
    const fullHtml = `<!DOCTYPE html><html><head>
      <meta property="og:type" content="article">
      <meta name="description" content="A detailed article description with enough text length to contribute to article-like score metrics">
    </head><body>
      <main>
        <h2>Section</h2>
        <p>${'Content paragraph with substantial text. '.repeat(6)}</p>
        <p>${'Another substantial paragraph. '.repeat(6)}</p>
        <p>${'Third substantial paragraph. '.repeat(6)}</p>
      </main>
    </body></html>`
    const dom = new JSDOM(fullHtml, { url: 'https://example.com/post/1' })
    const result = detectPageTypeFromDocument(dom.window.document)
    expect(result.type).toBe('article')
  })

  it('detects article with medium link density and good content', () => {
    const signals = makeSignals({
      textLength: 2000,
      paragraphCount: 4,
      linkDensity: 0.35,
      headingCount: 2,
      articleLikeScore: 2,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('article')
  })
})

// ============= search-results detection =============

describe('detectPageType - search-results', () => {
  it('detects search results from URL and input signals', () => {
    const signals = makeSignals({
      url: 'https://www.google.com/search?q=hello',
      title: 'hello - 搜索',
      linkCount: 12,
      paragraphCount: 1,
      linkDensity: 0.7,
      textLength: 600,
      hasSearchInput: true,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('search-results')
    expect(result.confidence).toBeGreaterThan(0.4)
  })

  it('detects search results from role=search and URL', () => {
    const signals = makeSignals({
      url: 'https://example.com/search?keyword=test',
      title: 'Search Results',
      linkCount: 8,
      paragraphCount: 2,
      linkDensity: 0.6,
      textLength: 800,
      hasSearchRole: true,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('search-results')
  })

  it('detects search results from DOM', () => {
    const doc = makeDom(`
      <input type="search" name="q" value="test">
      <div role="search">
        <a href="/r1">Result Title One</a>
        <a href="/r2">Result Title Two</a>
        <a href="/r3">Result Title Three</a>
        <a href="/r4">Result Title Four</a>
        <a href="/r5">Result Title Five</a>
        <a href="/r6">Result Title Six</a>
      </div>
    `, 'https://search.example.com/?s=test', 'test - Search Results')
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('search-results')
  })

  it('detects search results with result-like structure', () => {
    const signals = makeSignals({
      url: 'https://example.com/find?q=test',
      linkCount: 15,
      paragraphCount: 2,
      linkDensity: 0.8,
      textLength: 500,
      hasSearchInput: true,
      hasSearchRole: false,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('search-results')
  })
})

// ============= navigation detection =============

describe('detectPageType - navigation', () => {
  it('detects navigation page with many links and few paragraphs', () => {
    const signals = makeSignals({
      linkCount: 30,
      paragraphCount: 1,
      linkDensity: 0.9,
      textLength: 500,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('navigation')
    expect(result.confidence).toBeGreaterThan(0.4)
  })

  it('detects navigation from DOM with link list', () => {
    const doc = makeDom(`
      <div>
        ${Array.from({ length: 25 }, (_, i) => `<a href="/page${i}">Link ${i}</a>`).join('')}
      </div>
    `, 'https://example.com/')
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('navigation')
  })

  it('detects navigation with moderate links and short text', () => {
    const signals = makeSignals({
      linkCount: 12,
      paragraphCount: 2,
      linkDensity: 0.6,
      textLength: 400,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('navigation')
  })

  it('returns article over navigation when article signals are strong', () => {
    const signals = makeSignals({
      linkCount: 15,
      paragraphCount: 5,
      linkDensity: 0.2,
      textLength: 2500,
      headingCount: 4,
      articleLikeScore: 4,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('article')
  })
})

// ============= forum-or-comment detection =============

describe('detectPageType - forum-or-comment', () => {
  it('detects forum/comment page from comment-like elements', () => {
    const doc = makeDom(`
      <div class="comments-area">
        <div class="comment"><p>User comment text here</p></div>
        <div class="comment"><p>Another user comment</p></div>
        <div class="comment"><p>Third comment</p></div>
        <div class="comment"><p>Fourth comment</p></div>
        <div class="comment"><p>Fifth comment</p></div>
        <div class="reply"><p>Reply to a comment</p></div>
        <div class="reply"><p>Another reply</p></div>
        <div class="thread"><p>Thread discussion</p></div>
        <div class="thread"><p>Another thread</p></div>
      </div>
    `)
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('forum-or-comment')
  })

  it('detects forum from many short blocks with low article score', () => {
    const signals = makeSignals({
      linkCount: 3,
      paragraphCount: 10,
      linkDensity: 0.1,
      textLength: 800,
      commentLikeCount: 6,
      articleLikeScore: 0,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('forum-or-comment')
  })

  it('detects comment page with 评论 class', () => {
    const doc = makeDom(`
      <div class="评论列表">
        <div class="评论">Comment one</div>
        <div class="评论">Comment two</div>
        <div class="回复">Reply one</div>
        <div class="跟帖">Follow one</div>
        <div class="留言">Message one</div>
        <div class="楼层">Floor one</div>
        <div class="楼层">Floor two</div>
        <div class="楼层">Floor three</div>
        <div class="楼层">Floor four</div>
      </div>
    `)
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('forum-or-comment')
  })

  it('prefers article when article score is high despite comments', () => {
    const signals = makeSignals({
      linkCount: 3,
      paragraphCount: 6,
      linkDensity: 0.15,
      textLength: 3000,
      headingCount: 3,
      articleLikeScore: 4,
      commentLikeCount: 5,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('article')
  })
})

// ============= video detection =============

describe('detectPageType - video', () => {
  it('detects video page from video element and URL', () => {
    const signals = makeSignals({
      url: 'https://example.com/watch?v=abc',
      title: 'My Video Title',
      videoCount: 1,
      textLength: 200,
      paragraphCount: 1,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('video')
  })

  it('detects video page from DOM', () => {
    const doc = makeDom(`
      <video controls>
        <source src="video.mp4" type="video/mp4">
      </video>
      <h1>Video Title</h1>
      <p>Short description.</p>
    `, 'https://video.example.com/watch/123', 'Watch: Video Title')
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('video')
  })

  it('detects video from URL pattern without video element', () => {
    const signals = makeSignals({
      url: 'https://site.com/video/12345',
      title: 'Video Title Here',
      videoCount: 0,
      iframeCount: 1,
      textLength: 300,
      paragraphCount: 2,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('video')
  })

  it('detects video with play/watch keywords in URL', () => {
    const signals = makeSignals({
      url: 'https://live.example.com/playing/some-stream',
      title: 'Live Stream',
      videoCount: 1,
      textLength: 150,
      paragraphCount: 1,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('video')
    expect(result.confidence).toBeGreaterThan(0.5)
  })

  it('does not classify as video without any video signals', () => {
    const signals = makeSignals({
      url: 'https://example.com/normal-page',
      title: 'Normal Page',
      videoCount: 0,
      iframeCount: 0,
      textLength: 2000,
      paragraphCount: 5,
    })
    const result = detectPageType(signals)
    expect(result.type).not.toBe('video')
  })
})

// ============= ai-answer detection =============

describe('detectPageType - ai-answer', () => {
  it('detects AI answer page from conversation pattern', () => {
    const doc = makeDom(`
      <div class="conversation">
        <div class="user-message"><p>What is TypeScript?</p></div>
        <div class="assistant-message"><p>TypeScript is a typed superset of JavaScript.</p></div>
        <div class="user-message"><p>Show me an example.</p></div>
        <div class="assistant-message"><p>Here is an example:</p><pre><code>const x: number = 1;</code></pre></div>
      </div>
    `, 'https://chat.example.com/', 'Chat - AI Assistant')
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('ai-answer')
  })

  it('detects AI answer from title keywords', () => {
    const signals = makeSignals({
      url: 'https://example.com/chat',
      title: 'ChatGPT - Conversation',
      hasConversationPattern: true,
      hasCodeBlock: true,
      textLength: 1000,
      paragraphCount: 8,
      articleLikeScore: 0,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('ai-answer')
  })

  it('detects AI answer with data-role attributes', () => {
    const fullHtml = `<!DOCTYPE html><html><body>
      <div data-message-author-role="user"><p>Hello</p></div>
      <div data-message-author-role="assistant"><p>Hi there!</p></div>
      <div data-message-author-role="user"><p>Help me</p></div>
      <div data-message-author-role="assistant"><p>Sure!</p><pre><code class="language-python">print("ok")</code></pre></div>
    </body></html>`
    const dom = new JSDOM(fullHtml, { url: 'https://ai.example.com/' })
    const result = detectPageTypeFromDocument(dom.window.document)
    expect(result.type).toBe('ai-answer')
  })
})

// ============= unknown detection =============

describe('detectPageType - unknown', () => {
  it('returns unknown for page with insufficient signals', () => {
    const signals = makeSignals({
      url: 'https://example.com/',
      title: '',
      textLength: 50,
      paragraphCount: 1,
      linkCount: 2,
      linkDensity: 0.1,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('unknown')
  })

  it('returns unknown for truly ambiguous pages', () => {
    const doc = makeDom('<body><p>Just a short page with minimal content.</p></body>')
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('unknown')
  })

  it('returns unknown when all confidence scores below threshold', () => {
    const signals = makeSignals({
      linkCount: 2,
      paragraphCount: 1,
      linkDensity: 0.2,
      textLength: 100,
      articleLikeScore: 0,
    })
    const result = detectPageType(signals)
    expect(result.type).toBe('unknown')
    expect(result.confidence).toBeGreaterThan(0)
  })
})

// ============= mixed page scenarios =============

describe('detectPageType - mixed scenarios', () => {
  it('article with few comments still returns article', () => {
    const doc = makeDom(`
      <article>
        <h1>Article</h1>
        <p>${'Article content. '.repeat(10)}</p>
        <p>${'More article text. '.repeat(10)}</p>
        <p>${'Conclusion paragraph. '.repeat(10)}</p>
      </article>
      <div class="comments-area">
        <div class="comment">Nice article!</div>
      </div>
    `)
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('article')
  })

  it('link-heavy page with little text returns navigation', () => {
    const doc = makeDom(`
      <nav>
        ${Array.from({ length: 30 }, (_, i) => `<a href="/cat${i}">Category ${i}</a>`).join('')}
      </nav>
      <p>Welcome to our site.</p>
    `)
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('navigation')
  })

  it('search-like page with article content returns article', () => {
    const doc = makeDom(`
      <article>
        <h1>How to Search Effectively</h1>
        <p>${'This is an article about search techniques. '.repeat(6)}</p>
        <p>${'The second paragraph discusses methods. '.repeat(6)}</p>
        <p>${'The third paragraph gives examples. '.repeat(6)}</p>
        <p>${'The fourth paragraph concludes. '.repeat(6)}</p>
      </article>
    `, 'https://blog.example.com/how-to-search', 'How to Search Effectively')
    const result = detectPageTypeFromDocument(doc)
    expect(result.type).toBe('article')
  })
})

// ============= reasons sanitization =============

describe('detectPageType - reasons sanitization', () => {
  it('reasons do not contain full page text content', () => {
    const signals = makeSignals({
      textLength: 5000,
      paragraphCount: 10,
      headingCount: 5,
      linkDensity: 0.05,
      articleLikeScore: 5,
    })
    const result = detectPageType(signals)
    for (const reason of result.reasons) {
      expect(reason.length).toBeLessThan(200)
    }
  })

  it('signals do not contain raw content text', () => {
    const signals = makeSignals({
      textLength: 3000,
      paragraphCount: 6,
      headingCount: 3,
    })
    expect(typeof signals.url).toBe('string')
    expect(typeof signals.title).toBe('string')
    expect(typeof signals.domain).toBe('string')
    expect(typeof signals.linkDensity).toBe('number')
    expect(typeof signals.textLength).toBe('number')
  })

  it('each type detection includes descriptive reasons', () => {
    const types = ['article', 'search-results', 'navigation', 'forum-or-comment', 'video', 'ai-answer'] as const
    for (const type of types) {
      let signals: PageTypeDetectionSignals
      switch (type) {
        case 'article':
          signals = makeSignals({ textLength: 2000, paragraphCount: 5, headingCount: 3, articleLikeScore: 4, linkDensity: 0.1 })
          break
        case 'search-results':
          signals = makeSignals({ url: 'https://example.com/search?q=test', title: 'Search Results', hasSearchInput: true, linkCount: 12, paragraphCount: 1, linkDensity: 0.8, textLength: 500 })
          break
        case 'navigation':
          signals = makeSignals({ linkCount: 25, paragraphCount: 1, linkDensity: 0.9, textLength: 300 })
          break
        case 'forum-or-comment':
          signals = makeSignals({ commentLikeCount: 10, paragraphCount: 12, textLength: 1000, articleLikeScore: 0 })
          break
        case 'video':
          signals = makeSignals({ url: 'https://example.com/watch?v=123', title: 'Video', videoCount: 2, textLength: 200, paragraphCount: 1 })
          break
        case 'ai-answer':
          signals = makeSignals({ url: 'https://chat.example.com/', title: 'Chat - AI', hasConversationPattern: true, hasCodeBlock: true, articleLikeScore: 0 })
          break
      }
      const result = detectPageType(signals!)
      expect(result.type).toBe(type)
      expect(result.reasons.length).toBeGreaterThan(0)
    }
  })
})

// ============= extractSignalsFromDocument =============

describe('extractSignalsFromDocument', () => {
  it('extracts URL and title', () => {
    const doc = makeDom('<body><p>content</p></body>', 'https://example.com/path', 'Page Title')
    const signals = extractSignalsFromDocument(doc)
    expect(signals.url).toBe('https://example.com/path')
    expect(signals.title).toBe('Page Title')
    expect(signals.domain).toBe('example.com')
  })

  it('extracts link density', () => {
    const doc = makeDom(`<body>pure text</body>`)
    const signals = extractSignalsFromDocument(doc)
    expect(signals.linkDensity).toBe(0)
  })

  it('extracts heading and list counts', () => {
    const doc = makeDom(`
      <h1>Title</h1>
      <h2>Subtitle</h2>
      <ul><li>Item</li></ul>
      <ol><li>Ordered</li></ol>
    `)
    const signals = extractSignalsFromDocument(doc)
    expect(signals.headingCount).toBe(2)
    expect(signals.listCount).toBe(2)
  })

  it('extracts video and iframe counts', () => {
    const doc = makeDom(`
      <video></video>
      <video></video>
      <iframe src="https://embed.example.com"></iframe>
    `)
    const signals = extractSignalsFromDocument(doc)
    expect(signals.videoCount).toBe(2)
    expect(signals.iframeCount).toBe(1)
  })

  it('extracts article-like score from semantic elements', () => {
    const doc = makeDom(`
      <article>
        <h1>Title</h1>
        <p>${'Content paragraph. '.repeat(10)}</p>
        <p>${'Another paragraph. '.repeat(10)}</p>
        <p>${'Third paragraph. '.repeat(10)}</p>
      </article>
    `)
    const signals = extractSignalsFromDocument(doc)
    expect(signals.articleLikeScore).toBeGreaterThan(0)
  })

  it('detects search input and role', () => {
    const doc = makeDom(`
      <input type="search" name="q" value="test">
    `, 'https://example.com/search')
    const signals = extractSignalsFromDocument(doc)
    expect(signals.hasSearchInput).toBe(true)
    expect(signals.hasSearchRole).toBe(false)
  })

  it('detects conversation patterns', () => {
    const doc = makeDom(`
      <div class="assistant-message">Hello</div>
      <div class="user-message">Hi</div>
      <div class="assistant-message">How can I help?</div>
      <div class="user-message">Question here</div>
    `)
    const signals = extractSignalsFromDocument(doc)
    expect(signals.hasConversationPattern).toBe(true)
  })

  it('detects code blocks', () => {
    const doc = makeDom(`
      <pre><code class="language-typescript">const x = 1;</code></pre>
    `)
    const signals = extractSignalsFromDocument(doc)
    expect(signals.hasCodeBlock).toBe(true)
  })

  it('handles comments with Chinese class names', () => {
    const doc = makeDom(`
      <div class="评论">C1</div>
      <div class="回复">R1</div>
      <div class="跟帖">F1</div>
      <div class="留言">M1</div>
    `)
    const signals = extractSignalsFromDocument(doc)
    expect(signals.commentLikeCount).toBeGreaterThanOrEqual(4)
  })
})
