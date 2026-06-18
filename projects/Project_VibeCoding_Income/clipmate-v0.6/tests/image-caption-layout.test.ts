import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { htmlToMarkdown } from '../src/content/parser/htmlToMarkdown'
import { markdownToContentBlocks } from '../src/platforms/notion/blocks'

// =============================================================================
// Sina-like `<img>caption` glue pattern (from user test doc minimal fixture)
// =============================================================================

const SINA_IMG_CAPTION_GLUE = `
<div>
  <p>
    <img src="https://k.sinaimg.cn/n/news/crawl/117/w550h367/20260614/7e23-example.jpg" alt="△特朗普（资料图）">△特朗普（资料图）
  </p>
  <p>正文段落，内容在此。</p>
  <p>
    <img src="https://k.sinaimg.cn/n/news/crawl/126/w550h376/20260614/25ab-example2.jpg" alt="△巴基斯坦副总理兼外交部长达尔与沙特阿拉伯外交大臣费萨尔通电话">　△巴基斯坦副总理兼外交部长达尔与沙特阿拉伯外交大臣费萨尔通电话
  </p>
  <p>另一个正文段落。</p>
</div>
`

const SINA_FIGURE_CAPTION = `
<div>
  <figure>
    <img src="https://k.sinaimg.cn/n/news/crawl/117/w550h367/20260614/abc.jpg" alt="△特朗普（资料图）" width="550" height="367">
    <figcaption>△特朗普（资料图）</figcaption>
  </figure>
  <p>正文文本。</p>
</div>
`

const SINA_IMG_NO_CAPTION = `
<div>
  <p>
    <img src="https://k.sinaimg.cn/n/news/photo.jpg" alt="Photo of event" width="550" height="367">
  </p>
  <p>正文文本，图片没有题注。</p>
</div>
`

describe('Image caption layout — Markdown', () => {
  it('Sina-like <img> followed by identical caption text: splits into image line + italic caption', () => {
    const md = htmlToMarkdown(SINA_IMG_CAPTION_GLUE, 'https://news.sina.com.cn/article/1')

    expect(md).not.toMatch(/\]\(https:\/\/[^)]+\)△/)
    expect(md).not.toMatch(/\]\(https:\/\/[^)]+\)　△/)

    expect(md).toContain('![△特朗普（资料图）]')
    expect(md).toContain('*△特朗普（资料图）*')

    expect(md).toContain('![△巴基斯坦副总理兼外交部长达尔与沙特阿拉伯外交大臣费萨尔通电话]')
    expect(md).toContain('*△巴基斯坦副总理兼外交部长达尔与沙特阿拉伯外交大臣费萨尔通电话*')
  })

  it('Sina-like image and caption appear on separate lines', () => {
    const md = htmlToMarkdown(SINA_IMG_CAPTION_GLUE, 'https://news.sina.com.cn/article/1')

    const imgLineIndex = md.indexOf('![△特朗普（资料图）]')
    const captionIndex = md.indexOf('*△特朗普（资料图）*')
    const between = md.slice(imgLineIndex, captionIndex)

    expect(between).toContain('\n')
    expect(between).not.toContain('△特朗普（资料图）△') // no glue
  })

  it('body text paragraphs are preserved between images', () => {
    const md = htmlToMarkdown(SINA_IMG_CAPTION_GLUE, 'https://news.sina.com.cn/article/1')

    expect(md).toContain('正文段落')
    expect(md).toContain('另一个正文段落')
  })

  it('figure > img + figcaption: image + italic caption preserved', () => {
    const md = htmlToMarkdown(SINA_FIGURE_CAPTION, 'https://news.sina.com.cn/article/1')

    expect(md).toContain('![△特朗普（资料图）]')
    expect(md).toContain('*△特朗普（资料图）*')
  })

  it('alt and caption identical: captions not duplicated as extra paragraph', () => {
    const md = htmlToMarkdown(SINA_IMG_CAPTION_GLUE, 'https://news.sina.com.cn/article/1')

    const allImgOccurrences = (md.match(/△特朗普（资料图）/g) || []).length
    // alt appears in ![...], caption appears in *...*. No extra paragraph.
    // One image syntax + one italic caption = 2 occurrences
    expect(allImgOccurrences).toBeGreaterThanOrEqual(2)
  })

  it('image without caption: alt is "Photo of event", no italic caption generated', () => {
    const md = htmlToMarkdown(SINA_IMG_NO_CAPTION, 'https://news.sina.com.cn/article/1')

    expect(md).toContain('![Photo of event]')
    expect(md).not.toContain('*Photo of event*')
    expect(md).toContain('正文文本')
  })
})

// =============================================================================
// Notion image.caption
// =============================================================================

describe('Image caption layout — Notion blocks', () => {
  it('image + italic caption merged into single image block with caption', () => {
    const md = `![△特朗普（资料图）](https://k.sinaimg.cn/n/news/photo.jpg)\n\n*△特朗普（资料图）*`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(1)
    expect(blocks[0].type).toBe('image')
    const imgData = blocks[0].image as Record<string, unknown>
    const ext = imgData.external as Record<string, string>
    expect(ext.url).toBe('https://k.sinaimg.cn/n/news/photo.jpg')
    const caption = imgData.caption as Array<Record<string, unknown>>
    expect(caption).toBeDefined()
    expect(caption.length).toBeGreaterThan(0)
    expect(caption[0].text.content).toBe('△特朗普（资料图）')
  })

  it('image without following caption uses alt as caption', () => {
    const md = `![Photo](https://example.com/img.jpg)`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(1)
    expect(blocks[0].type).toBe('image')
    const imgData = blocks[0].image as Record<string, unknown>
    const caption = imgData.caption as Array<Record<string, unknown>>
    expect(caption).toBeDefined()
    expect(caption.length).toBeGreaterThan(0)
    expect(caption[0].text.content).toBe('Photo')
  })

  it('caption merged: no extra paragraph block for caption', () => {
    const md = `![△巴加埃（资料图）](https://example.com/img.png)\n\n*△巴加埃（资料图）*\n\n正文段落`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(2)
    expect(blocks[0].type).toBe('image')
    expect(blocks[1].type).toBe('paragraph')
  })

  it('image without caption (no italic following): works normally', () => {
    const md = `![Event photo](https://example.com/img.jpg)\n\nFollowing text paragraph.`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(2)
    expect(blocks[0].type).toBe('image')
    expect(blocks[1].type).toBe('paragraph')
  })

  it('long caption (>200 chars) uses alt as caption instead', () => {
    const longText = 'A'.repeat(250)
    const md = `![Alt text](https://example.com/img.jpg)\n\n*${longText}*`
    const blocks = markdownToContentBlocks(md)

    expect(blocks.length).toBe(2)
    expect(blocks[0].type).toBe('image')
    const imgData = blocks[0].image as Record<string, unknown>
    const caption = imgData.caption as Array<Record<string, unknown>>
    expect(caption[0].text.content).toBe('Alt text')
  })

  it('italic text that does not follow image block stays as paragraph', () => {
    const md = `![Test](https://example.com/1.jpg)\n\nNormal paragraph text.\n\n*Not a caption*`
    const blocks = markdownToContentBlocks(md)

    // Image block at start, then normal paragraph, then italic paragraph
    expect(blocks.length).toBe(3)
    expect(blocks[0].type).toBe('image')
    expect(blocks[1].type).toBe('paragraph')
    expect(blocks[2].type).toBe('paragraph')
  })
})

// =============================================================================
// Selection/comment-context regression
// =============================================================================

describe('Image caption layout — regression', () => {
  it('selection mode html without images produces no image syntax', () => {
    const md = htmlToMarkdown('<p>Selected text only.</p>', 'https://example.com/article')
    expect(md).not.toContain('![')
    expect(md).not.toContain('*Selected*')
    expect(md).toContain('Selected text only.')
  })

  it('text with italic emphasis not mistaken for image caption', () => {
    const md = htmlToMarkdown(
      '<p>Regular text with <em>emphasis</em> here.</p>',
      'https://example.com/article',
    )
    expect(md).not.toContain('![')
    expect(md).toContain('*emphasis*')
  })
})
