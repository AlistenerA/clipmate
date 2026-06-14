import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import type { SiteProfileMatch, SiteProfile } from '../src/shared/siteProfiles'
import type { PageType } from '../src/shared/utils/pageTypeDetector'
import type { CommentSelectionMode } from '../src/content/commentSelection'
import {
  extractSourceTitle,
  extractSourceExcerpt,
  extractSourceMedia,
  resolveCommentAuthor,
  buildCommentClipContext,
  isGenericPlatformTitle,
} from '../src/content/commentSelection'

function makeDom(headHtml: string, bodyHtml: string): { dom: JSDOM; doc: Document } {
  const fullHtml = `<!DOCTYPE html><html>
<head>${headHtml}</head>
<body>${bodyHtml}</body>
</html>`
  const dom = new JSDOM(fullHtml, { url: 'https://weibo.com/status/12345' })
  return { dom, doc: dom.window.document }
}

function makeSiteProfileMatch(
  overrides: Partial<SiteProfileMatch> = {},
): SiteProfileMatch {
  return {
    profile: {
      id: 'weibo-social',
      label: 'Weibo',
      category: 'social',
      domains: ['weibo.com'],
      pageTypes: ['forum-or-comment'] as PageType[],
      priority: 20,
      selectorHints: { contentContainer: 'main' },
    } as SiteProfile,
    matchedDomain: 'weibo.com',
    matchedPageType: 'forum-or-comment' as PageType,
    confidence: 0.9,
    reasons: ['test'],
    ...overrides,
  }
}

function makeVideoProfileMatch(): SiteProfileMatch {
  return {
    profile: {
      id: 'bilibili-video',
      label: 'Bilibili',
      category: 'video',
      domains: ['bilibili.com'],
      pageTypes: ['video'] as PageType[],
      priority: 20,
      selectorHints: { contentContainer: '.video-info-detail' },
    } as SiteProfile,
    matchedDomain: 'bilibili.com',
    matchedPageType: 'video' as PageType,
    confidence: 0.9,
    reasons: ['test'],
  }
}

// ========== isGenericPlatformTitle ==========

describe('isGenericPlatformTitle', () => {
  it('recognizes 微博正文', () => {
    expect(isGenericPlatformTitle('微博正文')).toBe(true)
  })

  it('recognizes 微博正文 - 微博', () => {
    expect(isGenericPlatformTitle('微博正文 - 微博')).toBe(true)
  })

  it('recognizes 微博', () => {
    expect(isGenericPlatformTitle('微博')).toBe(true)
  })

  it('recognizes Weibo', () => {
    expect(isGenericPlatformTitle('Weibo')).toBe(true)
  })

  it('recognizes site name matching title', () => {
    expect(isGenericPlatformTitle('weibo.com', 'Weibo')).toBe(true)
  })

  it('does not flag normal titles', () => {
    expect(isGenericPlatformTitle('Today\'s Weather Report')).toBe(false)
  })

  it('does not flag empty string', () => {
    expect(isGenericPlatformTitle('')).toBe(false)
  })

  it('recognizes 微博 - 随时随地发现新鲜事', () => {
    expect(isGenericPlatformTitle('微博 - 随时随地发现新鲜事')).toBe(true)
  })
})

// ========== extractSourceTitle ==========

describe('extractSourceTitle', () => {
  it('prefers og:title when available', () => {
    const { doc } = makeDom(
      '<meta property="og:title" content="Real Title">',
      '<h1>Page Heading</h1>',
    )
    const result = extractSourceTitle(doc, null, null, 'Default')
    expect(result).toBe('Real Title')
  })

  it('falls back to twitter:title', () => {
    const { doc } = makeDom(
      '<meta name="twitter:title" content="Twitter Title">',
      '<h1>Heading</h1>',
    )
    const result = extractSourceTitle(doc, null, null, 'Default')
    expect(result).toBe('Twitter Title')
  })

  it('uses heading from content container', () => {
    const { doc } = makeDom(
      '<title>Page Title</title>',
      '<article><h2>Article Heading</h2><p>Text</p></article>',
    )
    const body = doc.body
    const article = body.querySelector('article')
    const result = extractSourceTitle(doc, article!, null, 'Page Title')
    expect(result).toBe('Article Heading')
  })

  it('uses content container text with Weibo prefix when title is generic', () => {
    const { doc } = makeDom(
      '<title>微博正文 - 微博</title>',
      `<main>
        <article class="feed-content">
          <p>今天天气真好，适合出去走走看看风景。</p>
          <img src="/photos/1.jpg" alt="photo" />
        </article>
        <div class="comment-list"><div class="comment-item">nice!</div></div>
      </main>`,
    )
    const result = extractSourceTitle(doc, null, makeSiteProfileMatch(), '微博正文')
    expect(result).toContain('微博：')
    expect(result).toContain('今天天气真好')
    expect(result).not.toBe('微博正文')
    expect(result).not.toBe('微博正文 - 微博')
  })

  it('strips platform suffix from document title', () => {
    const { doc } = makeDom(
      '<title>Some Article - 知乎</title>',
      '<p>Content</p>',
    )
    const result = extractSourceTitle(doc, null, null, 'Fallback')
    expect(result).toBe('Some Article')
    expect(result).not.toContain('知乎')
  })

  it('falls back to pageTitle param when everything else fails', () => {
    const { doc } = makeDom(
      '',
      '<p>Content</p>',
    )
    const result = extractSourceTitle(doc, null, null, 'Provided Title')
    expect(result).toBe('Provided Title')
  })

  it('returns Untitled when no title available', () => {
    const { doc } = makeDom('', '')
    const result = extractSourceTitle(doc, null, null, '')
    expect(result).toBe('Untitled')
  })

  it('strips Bilibili suffix', () => {
    const { doc } = makeDom(
      '<title>My Video - Bilibili</title>',
      '<p>Content</p>',
    )
    const result = extractSourceTitle(doc, null, null, 'Fallback')
    expect(result).not.toContain('Bilibili')
  })
})

// ========== extractSourceExcerpt ==========

describe('extractSourceExcerpt', () => {
  it('extracts first 50 chars from content container', () => {
    const { doc } = makeDom(
      '<title>T</title>',
      `<main><div class="content">${'A'.repeat(60)}</div></main>`,
    )
    const result = extractSourceExcerpt(doc, null, null, 50)
    expect(result).toBeDefined()
    expect(result!.length).toBeLessThanOrEqual(53)
    expect(result).toContain('…')
  })

  it('returns full text when shorter than maxLength', () => {
    const { doc } = makeDom(
      '<title>T</title>',
      '<main><div>Short content here.</div></main>',
    )
    const result = extractSourceExcerpt(doc, null, null, 50)
    expect(result).toBe('Short content here.')
  })

  it('cleans excessive whitespace', () => {
    const { doc } = makeDom(
      '<title>T</title>',
      '<main><div>Hello   world\n\n  extra</div></main>',
    )
    const result = extractSourceExcerpt(doc, null, null, 100)
    expect(result).toContain('Hello')
    expect(result).not.toContain('  ')
    expect(result).not.toContain('\n')
  })

  it('no content container returns undefined', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    const result = extractSourceExcerpt(dom.window.document, null, null)
    expect(result).toBeUndefined()
  })
})

// ========== extractSourceMedia ==========

describe('extractSourceMedia', () => {
  it('finds images in content container not in comment area', () => {
    const { doc } = makeDom(
      '',
      `<main>
        <div class="post-content">
          <img src="/photo1.jpg" alt="Photo 1" width="200" height="200" />
          <img src="/photo2.jpg" alt="Photo 2" width="300" height="300" />
        </div>
        <div class="comment-list">
          <div class="comment-item">
            <img src="/avatar.jpg" class="avatar" width="24" height="24" alt="avatar" />
            <span class="author-name">Commenter</span>
            <p>Nice post!</p>
          </div>
        </div>
      </main>`,
    )
    const body = doc.body
    const mainEl = body.querySelector('main')
    const result = extractSourceMedia(doc, mainEl, null)
    expect(result.length).toBe(2)
    for (const m of result) {
      expect(m.type).toBe('image')
    }
  })

  it('skips avatar images by class/alt/size', () => {
    const { doc } = makeDom(
      '',
      `<main>
        <img src="/avatar.jpg" class="avatar" width="24" height="24" alt="avatar" />
        <img src="/photo.jpg" width="200" height="200" alt="nice photo" />
      </main>`,
    )
    const result = extractSourceMedia(doc, null, null)
    const urls = result.map((m) => m.url)
    expect(urls.some((u) => u && u.includes('photo.jpg'))).toBe(true)
    const avatarResult = result.find((m) => m.url && m.url.includes('avatar.jpg'))
    expect(avatarResult).toBeUndefined()
  })

  it('skips images with avatar in src', () => {
    const { doc } = makeDom(
      '',
      '<main><img src="https://cdn.example.com/avatar/user123.jpg" width="200" height="200" /></main>',
    )
    const result = extractSourceMedia(doc, null, null)
    const avatarResult = result.find((m) => m.url?.includes('avatar'))
    expect(avatarResult).toBeUndefined()
  })

  it('includes og:image when no content container images', () => {
    const { doc } = makeDom(
      '<meta property="og:image" content="https://example.com/og.jpg" />',
      '<main><p>Text only content</p></main>',
    )
    const result = extractSourceMedia(doc, null, null)
    const ogResult = result.find((m) => m.url === 'https://example.com/og.jpg')
    expect(ogResult).toBeDefined()
  })

  it('respects max 5 media items', () => {
    const imgs = Array.from({ length: 7 }, (_, i) =>
      `<img src="/img${i}.jpg" width="200" height="200" alt="img" />`,
    ).join('')
    const { doc } = makeDom('', `<main>${imgs}</main>`)
    const result = extractSourceMedia(doc, null, null)
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('includes video poster when present', () => {
    const { doc } = makeDom(
      '',
      '<main><video poster="/poster.jpg"><source src="/video.mp4" /></video></main>',
    )
    const result = extractSourceMedia(doc, null, null)
    const poster = result.find((m) => m.type === 'poster')
    expect(poster).toBeDefined()
    expect(poster!.url).toBe('/poster.jpg')
  })

  it('returns empty array when no media', () => {
    const { doc } = makeDom('', '<main><p>Plain text</p></main>')
    const result = extractSourceMedia(doc, null, null)
    expect(result).toEqual([])
  })
})

// ========== resolveCommentAuthor ==========

describe('resolveCommentAuthor', () => {
  it('finds author from strong tag in comment item', () => {
    const { doc } = makeDom(
      '',
      `<main>
        <div class="post-content">Original post text</div>
        <div class="comment-list">
          <div class="comment-item" id="c1">
            <strong>Alice</strong>
            <p>This is a great comment!</p>
          </div>
        </div>
      </main>`,
    )
    const commentP = doc.querySelector('#c1 p')
    const result = resolveCommentAuthor(doc, commentP)
    expect(result).toBe('Alice')
  })

  it('finds author from b tag', () => {
    const { doc } = makeDom(
      '',
      `<div class="comment-item">
        <b>Bob</b>
        <p id="comment-text">Another comment</p>
      </div>`,
    )
    const commentText = doc.querySelector('#comment-text')
    const result = resolveCommentAuthor(doc, commentText)
    expect(result).toBe('Bob')
  })

  it('walks up to find comment container then author', () => {
    const { doc } = makeDom(
      '',
      `<div class="comment-list">
        <div class="comment-item">
          <div class="comment-header">
            <a class="comment-author" href="/users/123">Charlie</a>
          </div>
          <div class="comment-body">
            <p id="inner-text">The actual comment content here</p>
          </div>
        </div>
      </div>`,
    )
    const innerText = doc.querySelector('#inner-text')
    const result = resolveCommentAuthor(doc, innerText)
    expect(result).toBe('Charlie')
  })

  it('finds author from class-based selectors', () => {
    const { doc } = makeDom(
      '',
      `<div class="reply-item">
        <span class="username">Diana</span>
        <p id="reply-text">Reply content</p>
      </div>`,
    )
    const replyText = doc.querySelector('#reply-text')
    const result = resolveCommentAuthor(doc, replyText)
    expect(result).toBe('Diana')
  })

  it('parses @username prefix from text', () => {
    const { doc } = makeDom(
      '',
      `<div><p id="text">@Eve 说得对</p></div>`,
    )
    const text = doc.querySelector('#text')
    const result = resolveCommentAuthor(doc, text)
    expect(result).toBe('Eve')
  })

  it('ignores action text like reply/delete', () => {
    const { doc } = makeDom(
      '',
      `<div class="comment-item">
        <strong>回复</strong>
        <p id="comment-content">Actual comment</p>
      </div>`,
    )
    const commentContent = doc.querySelector('#comment-content')
    const result = resolveCommentAuthor(doc, commentContent)
    expect(result).toBeUndefined()
  })

  it('ignores timestamps', () => {
    const { doc } = makeDom(
      '',
      `<div class="comment-item">
        <span class="username">12:30:45</span>
        <p id="comment">Content</p>
      </div>`,
    )
    const comment = doc.querySelector('#comment')
    const result = resolveCommentAuthor(doc, comment)
    expect(result).toBeUndefined()
  })

  it('ignores date strings', () => {
    const { doc } = makeDom(
      '',
      `<div class="comment-item">
        <span class="username">2024-01-15</span>
        <p id="comment">Content</p>
      </div>`,
    )
    const comment = doc.querySelector('#comment')
    const result = resolveCommentAuthor(doc, comment)
    expect(result).toBeUndefined()
  })

  it('returns undefined when no author identifiable', () => {
    const { doc } = makeDom(
      '',
      '<main><p id="text">Just some text without author context</p></main>',
    )
    const text = doc.querySelector('#text')
    const result = resolveCommentAuthor(doc, text)
    expect(result).toBeUndefined()
  })

  it('returns undefined when selectionRoot is null', () => {
    const { doc } = makeDom('', '<p>text</p>')
    const result = resolveCommentAuthor(doc, null)
    expect(result).toBeUndefined()
  })

  it('finds author from aria-label on comment item', () => {
    const { doc } = makeDom(
      '',
      `<div class="comment-item" aria-label="Frank 的评论">
        <span class="display-name">Frank</span>
        <p id="comment-text">The comment</p>
      </div>`,
    )
    const commentText = doc.querySelector('#comment-text')
    const result = resolveCommentAuthor(doc, commentText)
    expect(result).toBe('Frank')
  })
})

// ========== buildCommentClipContext ==========

describe('buildCommentClipContext', () => {
  it('builds context with site name from profile', () => {
    const { doc } = makeDom(
      '<title>Test Page</title>',
      '<main><p>Content</p><div class="comment-item"><strong>Alice</strong><p id="sel">Nice</p></div></main>',
    )
    const sel = doc.querySelector('#sel')
    const profileMatch = makeSiteProfileMatch()
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'Test Page',
      pageUrl: 'https://weibo.com/status/12345',
      siteProfileMatch: profileMatch,
      selectionText: 'Nice',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: ['selection-first'],
    })
    expect(context.siteName).toBe('Weibo')
    expect(context.sourceTitle).toBe('Test Page')
    expect(context.selectedComment.author).toBe('Alice')
    expect(context.selectedComment.text).toBe('Nice')
  })

  it('Weibo case: uses 微博： prefix as source title, excludes comment text', () => {
    const { doc } = makeDom(
      '<title>微博正文 - 微博</title>',
      `<main>
        <article class="feed-content">
          <p>今天天气真好适合出去走走看看风景感受春天的气息</p>
          <img src="/photo.jpg" alt="photo" />
        </article>
        <div class="comment-list">
          <div class="comment-item">
            <strong>Alice</strong>
            <p id="sel">确实不错</p>
          </div>
        </div>
      </main>`,
    )
    const sel = doc.querySelector('#sel')
    const profileMatch = makeSiteProfileMatch()
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/status/12345',
      siteProfileMatch: profileMatch,
      selectionText: '确实不错',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: ['selection-first'],
    })
    expect(context.siteName).toBe('Weibo')
    expect(context.sourceTitle).toContain('微博：')
    expect(context.sourceTitle).toContain('今天天气真好')
    expect(context.sourceTitle).not.toBe('微博正文')
    expect(context.sourceTitle).not.toBe('微博正文 - 微博')
    expect(context.selectedComment.author).toBe('Alice')
    expect(context.sourceMedia.length).toBeGreaterThan(0)
  })

  it('Bilibili case: uses heading from content container', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html>
<head><meta property="og:title" content="Video Title - Bilibili" /></head>
<body>
  <main>
    <div class="video-info-detail">
      <h2>My Awesome Video</h2>
      <p>Video description here.</p>
    </div>
    <div class="comment-list">
      <div class="comment-item">
        <strong>Bob</strong>
        <p id="sel">Great video!</p>
      </div>
    </div>
  </main>
</body></html>`,
      { url: 'https://bilibili.com/video/BV123' },
    )
    const doc = dom.window.document
    const sel = doc.querySelector('#sel')
    const profileMatch = makeVideoProfileMatch()
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'My Awesome Video',
      pageUrl: 'https://bilibili.com/video/BV123',
      siteProfileMatch: profileMatch,
      selectionText: 'Great video!',
      selectionRoot: sel,
      mode: 'video-comment-selection',
      reasons: ['selection-first'],
    })
    expect(context.siteName).toBe('Bilibili')
    expect(context.sourceTitle).toBe('My Awesome Video')
    expect(context.selectedComment.author).toBe('Bob')
  })

  it('includes sourceExcerpt from content container', () => {
    const { doc } = makeDom(
      '<title>Article</title>',
      '<main><div>This is the source article body text. It provides context for the comment.</div><div class="comment-item"><strong>C</strong><p id="sel">OK</p></div></main>',
    )
    const sel = doc.querySelector('#sel')
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'Article',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'OK',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: ['selection-first'],
    })
    expect(context.sourceExcerpt).toBeDefined()
    expect(context.sourceExcerpt).toContain('source article')
  })

  it('no author identifiable sets undefined and adds warning', () => {
    const { doc } = makeDom(
      '<title>Page</title>',
      '<div class="comment-item"><p id="sel">Comment</p></div>',
    )
    const sel = doc.querySelector('#sel')
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'Comment',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: ['selection-first'],
    })
    expect(context.selectedComment.author).toBeUndefined()
    expect(context.warnings).toContain('author-unresolved')
  })

  it('no media adds no-media warning', () => {
    const { doc } = makeDom(
      '<title>Page</title>',
      '<main><p>Plain text</p><div class="comment-item"><p id="sel">C</p></div></main>',
    )
    const sel = doc.querySelector('#sel')
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'C',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.warnings).toContain('no-media')
  })

  it('comment text is only user-selected text', () => {
    const { doc } = makeDom(
      '<title>Page</title>',
      `<main>
        <p>Original post</p>
        <div class="comment-list">
          <div class="comment-item"><strong>A</strong><p id="sel">Selected comment only</p></div>
          <div class="comment-item"><strong>B</strong><p>Other comment</p></div>
        </div>
      </main>`,
    )
    const sel = doc.querySelector('#sel')
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'Selected comment only',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: ['selection-first'],
    })
    expect(context.selectedComment.text).toBe('Selected comment only')
    expect(context.selectedComment.text).not.toContain('Other comment')
  })

  it('does not contain full DOM references in output', () => {
    const { doc } = makeDom(
      '<title>Page</title>',
      '<div class="comment-item"><p id="sel">Comment</p></div>',
    )
    const sel = doc.querySelector('#sel')
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'Comment',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: [],
    })
    const json = JSON.stringify(context)
    expect(json).not.toContain('<!DOCTYPE')
    expect(json).not.toContain('<html')
    expect(json).not.toContain('<body')
    expect(json).not.toContain('document')
    expect(json).not.toContain('innerHTML')
  })

  it('Weibo source excerpt excludes comment text', () => {
    const { doc } = makeDom(
      '<title>微博正文 - 微博</title>',
      `<main>
        <article class="feed-content">
          <p>Original weibo post text for testing.</p>
        </article>
        <div class="comment-list">
          <div class="comment-item">
            <strong>Alice</strong>
            <p id="sel">Comment reply text</p>
          </div>
          <div class="comment-item">
            <strong>Bob</strong>
            <p>Another unrelated comment</p>
          </div>
        </div>
      </main>`,
    )
    const sel = doc.querySelector('#sel')
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/status/12345',
      siteProfileMatch: makeSiteProfileMatch(),
      selectionText: 'Comment reply text',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.sourceTitle).toContain('Original weibo')
    expect(context.sourceTitle).not.toContain('Comment reply')
    expect(context.sourceTitle).not.toContain('Alice')
    expect(context.sourceTitle).not.toContain('Bob')
    expect(context.sourceTitle).not.toContain('unrelated comment')
  })

  it('adds source-title-unresolved warning when title is still generic', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html>
<head><title>Weibo</title></head>
<body></body></html>`,
      { url: 'https://weibo.com/status/12345' },
    )
    const doc = dom.window.document
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'Weibo',
      pageUrl: 'https://weibo.com/status/12345',
      siteProfileMatch: makeSiteProfileMatch(),
      selectionText: 'comment text',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.warnings).toContain('source-title-unresolved')
  })

  it('Bilibili case still works with video heading', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html>
<head><meta property="og:title" content="Video Title - Bilibili" /></head>
<body>
  <main>
    <div class="video-info-detail">
      <h2>My Awesome Video</h2>
      <p>Video description here.</p>
    </div>
    <div class="comment-list">
      <div class="comment-item">
        <strong>Bob</strong>
        <p id="sel">Great video!</p>
      </div>
    </div>
  </main>
</body></html>`,
      { url: 'https://bilibili.com/video/BV123' },
    )
    const doc = dom.window.document
    const sel = doc.querySelector('#sel')
    const profileMatch = makeVideoProfileMatch()
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'My Awesome Video',
      pageUrl: 'https://bilibili.com/video/BV123',
      siteProfileMatch: profileMatch,
      selectionText: 'Great video!',
      selectionRoot: sel,
      mode: 'video-comment-selection',
      reasons: ['selection-first'],
    })
    expect(context.siteName).toBe('Bilibili')
    expect(context.sourceTitle).toBe('My Awesome Video')
    expect(context.selectedComment.author).toBe('Bob')
    expect(context.warnings).not.toContain('source-title-unresolved')
  })

  it('reasons are preserved', () => {
    const { doc } = makeDom(
      '<title>Page</title>',
      '<div class="comment-item"><p id="sel">C</p></div>',
    )
    const sel = doc.querySelector('#sel')
    const context = buildCommentClipContext({
      document: doc,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'C',
      selectionRoot: sel,
      mode: 'forum-selection',
      reasons: ['selection-first', 'context=comment'],
    })
    expect(context.reasons).toEqual(['selection-first', 'context=comment'])
  })
})
