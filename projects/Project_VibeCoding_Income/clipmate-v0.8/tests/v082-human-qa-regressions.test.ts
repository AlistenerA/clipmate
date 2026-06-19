import { describe, expect, it } from 'vitest'
import { extractFullpage } from '../src/content/extractors/readabilityExtractor'
import { htmlToMarkdown } from '../src/content/parser/htmlToMarkdown'
import { createClipDocument } from '../src/features/document'
import { clipDocumentToNotionBlocks, markdownToContentBlocks } from '../src/platforms/notion/blocks'

describe('v0.8.2 human QA regressions', () => {
  it('keeps Runoob code classes through Readability and emits fenced code', () => {
    const page = document.implementation.createHTMLDocument('TypeScript tutorial')
    page.body.innerHTML = `
      <article>
        <h1>TypeScript tutorial</h1>
        <p>${'Tutorial introduction with enough article text. '.repeat(20)}</p>
        <div class="example_code">
          <div class="hl-main"><span>const hello: string = "Hello"</span><br><span>console.log(hello)</span></div>
        </div>
      </article>
    `

    const extracted = extractFullpage(page)
    expect(extracted?.content).toContain('example_code')
    expect(htmlToMarkdown(extracted?.content || '')).toContain(
      '```typescript\nconst hello: string = "Hello"\nconsole.log(hello)\n```'
    )
  })

  it('removes Turndown escaping from numbered headings only', () => {
    const markdown = htmlToMarkdown('<h2>1. 声明部分（Declarations）</h2><p>正文</p>')

    expect(markdown).toContain('## 1. 声明部分（Declarations）')
    expect(markdown).not.toContain('1\\. 声明部分')
  })

  it('maps tutorial bullet and numbered lists to native Notion list blocks', () => {
    const clipDocument = createClipDocument({
      title: 'Lists',
      url: 'https://example.com/tutorial',
      markdown: [
        '## TypeScript 的主要优势',
        '',
        '* **静态类型检查：** 在编译时发现类型错误',
        '* **IDE 支持：** 智能代码补全',
        '',
        '1. 安装 TypeScript',
        '2. 运行编译器'
      ].join('\n')
    })

    expect(clipDocument.stats.listCount).toBe(2)
    expect(clipDocument.blocks).toEqual(expect.arrayContaining([
      {
        type: 'list',
        ordered: false,
        items: ['**静态类型检查：** 在编译时发现类型错误', '**IDE 支持：** 智能代码补全']
      },
      { type: 'list', ordered: true, items: ['安装 TypeScript', '运行编译器'] }
    ]))

    const blocks = clipDocumentToNotionBlocks(clipDocument)
    expect(blocks.filter((block) => block.type === 'bulleted_list_item')).toHaveLength(2)
    expect(blocks.filter((block) => block.type === 'numbered_list_item')).toHaveLength(2)
    expect(JSON.stringify(blocks)).not.toContain('content":"*')
  })

  it('keeps images without source captions empty in Markdown and Notion', () => {
    const markdown = htmlToMarkdown('<img src="https://example.com/photo.jpg">')
    const blocks = markdownToContentBlocks(markdown)
    const image = blocks[0].image as { caption: unknown[] }

    expect(markdown).toBe('![](https://example.com/photo.jpg)')
    expect(image.caption).toEqual([])
  })
})
