import { htmlToMarkdown } from '../src/content/parser/htmlToMarkdown'
import { buildNotionBlocks, markdownToContentBlocks } from '../src/platforms/notion/blocks'
import type { ClipDraft } from '../src/shared/types/clip.types'

function makeDraft(markdown: string, siteIconUrl?: string): ClipDraft {
  return {
    title: '结构测试',
    tags: [],
    note: '',
    mode: 'fullpage',
    content: {
      mode: 'fullpage',
      title: '结构测试',
      url: 'https://example.com/article',
      description: '',
      contentText: '结构测试',
      contentHtml: '',
      markdown,
      wordCount: 4,
      metadata: {
        url: 'https://example.com/article',
        title: '结构测试',
        description: '',
        siteName: 'Example',
        createdAt: '2026-06-19T00:00:00.000Z',
        siteIconUrl,
      },
    },
  }
}

describe('v0.8.3 human QA regressions', () => {
  it('saves fullpage Markdown tables as native Notion table blocks', () => {
    const blocks = buildNotionBlocks(makeDraft('| A | B |\n| --- | --- |\n| 1 | 2 |'))
    const table = blocks.find((block) => block.type === 'table')

    expect(table).toBeDefined()
    expect((table?.table as { table_width: number }).table_width).toBe(2)
  })

  it('keeps one real figure caption and removes placeholder descriptions', () => {
    const real = htmlToMarkdown(
      '<figure><img src="https://example.com/a.jpg" alt="新闻图片"><figcaption>真实题注</figcaption></figure>',
    )
    expect(real.match(/真实题注/g)).toHaveLength(1)
    expect(markdownToContentBlocks(real)).toHaveLength(1)

    const placeholder = htmlToMarkdown(
      '<p><img src="https://example.com/b.jpg" alt="在这里插入图片描述"></p>',
    )
    expect(placeholder).toBe('![](https://example.com/b.jpg)')
    const image = markdownToContentBlocks(placeholder)[0].image as { caption: unknown[] }
    expect(image.caption).toEqual([])
  })

  it('uses a safe site icon for the Notion metadata callout', () => {
    const blocks = buildNotionBlocks(makeDraft('正文', 'https://example.com/favicon.ico'))
    const callout = blocks.find((block) => block.type === 'callout')

    expect((callout?.callout as { icon: unknown }).icon).toEqual({
      type: 'external',
      external: { url: 'https://example.com/favicon.ico' },
    })
  })

  it('falls back to the bookmark emoji for unsafe icon URLs', () => {
    const blocks = buildNotionBlocks(makeDraft('正文', 'javascript:alert(1)'))
    const callout = blocks.find((block) => block.type === 'callout')

    expect((callout?.callout as { icon: unknown }).icon).toEqual({
      type: 'emoji',
      emoji: '🔖',
    })
  })
})
