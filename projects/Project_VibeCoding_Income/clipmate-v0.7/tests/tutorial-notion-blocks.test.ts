import { describe, expect, it } from 'vitest'
import { createClipDocument } from '../src/features/document'
import { buildNotionBlocks, clipDocumentToNotionBlocks } from '../src/platforms/notion/blocks'
import type { ClipDraft } from '../src/shared/types/clip.types'

const markdown = [
  '## Configure',
  '',
  '```js',
  'console.log("ready")',
  '```',
  '',
  '$$x^2 + y^2$$',
  '',
  '| Key | Value |',
  '| --- | --- |',
  '| mode | tutorial |',
  '',
  '> [!WARNING] Review before running.',
  '',
  '![Preview](https://cdn.example.com/preview.png)',
  '*Expected result*',
  '',
  '[Video demo](https://www.youtube.com/watch?v=demo)',
].join('\n')

describe('tutorial Notion blocks', () => {
  it('maps structured tutorial blocks to native Notion block types', () => {
    const document = createClipDocument({
      title: 'Tutorial',
      url: 'https://example.com/tutorial',
      markdown,
    })
    const blocks = clipDocumentToNotionBlocks(document)
    const types = blocks.map((block) => block.type)

    expect(types).toEqual(expect.arrayContaining([
      'heading_2',
      'code',
      'equation',
      'table',
      'callout',
      'image',
      'video',
    ]))
    expect(JSON.stringify(blocks)).toContain('Expected result')
    expect(JSON.stringify(blocks)).toContain('Video demo')
  })

  it('uses ClipDocument only for tutorial drafts', () => {
    const clipDocument = createClipDocument({
      title: 'Tutorial',
      url: 'https://example.com/tutorial',
      markdown,
    })
    const draft: ClipDraft = {
      title: 'Tutorial',
      tags: [],
      note: '',
      mode: 'tutorial',
      content: {
        mode: 'tutorial',
        title: 'Tutorial',
        url: 'https://example.com/tutorial',
        description: '',
        contentText: 'Tutorial',
        contentHtml: '',
        markdown,
        wordCount: 1,
        metadata: {
          title: 'Tutorial',
          url: 'https://example.com/tutorial',
          description: '',
          siteName: 'Example',
          createdAt: '2026-06-18T00:00:00.000Z',
        },
        clipDocument,
      },
    }

    const types = buildNotionBlocks(draft).map((block) => block.type)
    expect(types).toContain('code')
    expect(types).toContain('equation')
    expect(types).toContain('table')
  })

  it('falls back unknown code languages to plain text', () => {
    const document = createClipDocument({
      title: 'Custom language',
      url: 'https://example.com',
      markdown: '```unknown-language\nhello\n```',
    })
    const block = clipDocumentToNotionBlocks(document).find((item) => item.type === 'code')
    const code = (block as Record<string, unknown>).code as Record<string, unknown>

    expect(code.language).toBe('plain text')
  })

  it('splits long table cells into Notion-safe rich text chunks', () => {
    const longCell = 'A'.repeat(4500)
    const document = createClipDocument({
      title: 'Long table',
      url: 'https://example.com',
      markdown: `| Key | Value |\n| --- | --- |\n| body | ${longCell} |`,
    })
    const block = clipDocumentToNotionBlocks(document).find((item) => item.type === 'table')
    const table = (block as Record<string, unknown>).table as Record<string, unknown>
    const children = table.children as Array<Record<string, unknown>>
    const row = children[1].table_row as Record<string, unknown>
    const cells = row.cells as Array<Array<Record<string, unknown>>>
    const chunks = cells[1]

    expect(chunks.length).toBeGreaterThanOrEqual(3)
    for (const chunk of chunks) {
      const text = chunk.text as Record<string, unknown>
      expect((text.content as string).length).toBeLessThanOrEqual(2000)
    }
  })
})
