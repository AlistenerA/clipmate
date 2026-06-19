import { describe, expect, it } from 'vitest'
import { htmlToMarkdown } from '../src/content/parser/htmlToMarkdown'
import { createClipDocument } from '../src/features/document'
import {
  isSafePreviewImageSrc,
  parseMarkdownPreview,
} from '../src/shared/markdown/markdownPreview'

describe('v0.7.1 tutorial fidelity fixes', () => {
  it('converts Runoob-style TypeScript code containers into fenced code', () => {
    const markdown = htmlToMarkdown(`
      <div class="example_code">
        <div class="hl-main"><span>const hello : string = "Hello"</span><br><span>console.log(hello)</span></div>
      </div>
    `)

    expect(markdown).toContain('```typescript')
    expect(markdown).toContain('const hello : string = "Hello"\nconsole.log(hello)')
  })

  it('infers LaTeX code without flattening line breaks', () => {
    const markdown = htmlToMarkdown(`
      <div class="example_code"><span>\\documentclass{article}</span><br><span>\\begin{document}</span><br><span>\\end{document}</span></div>
    `)

    expect(markdown).toContain('```latex')
    expect(markdown).toContain('\\documentclass{article}\n\\begin{document}\n\\end{document}')
  })

  it('normalizes BBC accessibility caption text to a concise label', () => {
    const markdown = htmlToMarkdown(`
      <figure>
        <img src="https://example.com/photo.jpg" alt="coast guard">
        <figcaption><span>图像加注文字，</span><span data-testid="caption-paragraph">台湾海巡署人员观测海警船</span></figcaption>
      </figure>
    `)

    expect(markdown).toContain('*题注：台湾海巡署人员观测海警船*')
    expect(markdown).not.toContain('图像加注文字')
  })

  it('parses spaced thematic breaks as dividers instead of stray punctuation', () => {
    const preview = parseMarkdownPreview('上文\n\n* * *\n\n## 下文')
    const document = createClipDocument({
      title: '教程',
      url: 'https://example.com/tutorial',
      markdown: '上文\n\n* * *\n\n## 下文',
    })

    expect(preview.map((block) => block.type)).toEqual(['paragraph', 'hr', 'heading'])
    expect(document.blocks.map((block) => block.type)).toEqual(['paragraph', 'divider', 'heading'])
  })

  it('allows only HTTP(S) images in the rendered preview model', () => {
    expect(isSafePreviewImageSrc('https://example.com/image.png')).toBe(true)
    expect(isSafePreviewImageSrc('http://example.com/image.png')).toBe(true)
    expect(isSafePreviewImageSrc('data:image/png;base64,abc')).toBe(false)
    expect(isSafePreviewImageSrc('javascript:alert(1)')).toBe(false)

    const preview = parseMarkdownPreview('![diagram](https://example.com/image.png)')
    expect(preview).toEqual([
      {
        type: 'image',
        alt: 'diagram',
        url: 'https://example.com/image.png',
        safe: true,
      },
    ])
  })
})
