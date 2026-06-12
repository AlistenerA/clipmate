import { describe, it, expect } from 'vitest'
import { buildNotionBlocks } from '../src/platforms/notion/blocks'
import type { ClipDraft } from '../src/shared/types/clip.types'

function makeDraft(overrides: Partial<ClipDraft> = {}): ClipDraft {
  return {
    title: '测试文章',
    tags: ['技术', '笔记'],
    note: '这是一条备注',
    mode: 'fullpage',
    content: {
      mode: 'fullpage',
      title: '测试文章',
      url: 'https://example.com/article/1',
      description: '文章简介',
      contentText: '正文内容第一段',
      contentHtml: '<p>正文内容第一段</p>',
      markdown: '正文内容第一段\n\n正文内容第二段',
      wordCount: 10,
      metadata: {
        url: 'https://example.com/article/1',
        title: '测试文章',
        description: '文章简介',
        siteName: 'Example Site',
        createdAt: '2026-06-10T00:00:00.000Z',
      },
    },
    ...overrides,
  }
}

describe('buildNotionBlocks', () => {
  it('generates a heading_2 block for the title', () => {
    const draft = makeDraft({ title: '我的标题' })
    const blocks = buildNotionBlocks(draft)

    const heading = blocks.find((b) => b.type === 'heading_2')
    expect(heading).toBeDefined()
    expect((heading as Record<string, unknown>).heading_2).toBeDefined()
  })

  it('uses fallback title when title is empty', () => {
    const draft = makeDraft({ title: '' })
    draft.content.title = ''
    const blocks = buildNotionBlocks(draft)

    const heading = blocks.find((b) => b.type === 'heading_2') as Record<string, unknown>
    const heading2 = heading?.heading_2 as Record<string, unknown>
    const richText = heading2?.rich_text as Array<Record<string, unknown>>
    expect(richText[0].text).toEqual({ content: '未命名剪藏' })
  })

  it('generates a source URL block with link', () => {
    const draft = makeDraft()
    const blocks = buildNotionBlocks(draft)

    const urlBlock = blocks.find(
      (b) =>
        b.type === 'paragraph' &&
        JSON.stringify(b).includes('https://example.com/article/1'),
    )
    expect(urlBlock).toBeDefined()
  })

  it('skips URL block when url is empty', () => {
    const draft = makeDraft()
    draft.content.url = ''
    const blocks = buildNotionBlocks(draft)

    const hasUrlBlock = blocks.some(
      (b) =>
        b.type === 'paragraph' &&
        JSON.stringify(b).includes('来源：'),
    )
    expect(hasUrlBlock).toBe(false)
  })

  it('generates a tag block', () => {
    const draft = makeDraft({ tags: ['技术', '笔记'] })
    const blocks = buildNotionBlocks(draft)

    const tagBlock = blocks.find(
      (b) =>
        b.type === 'paragraph' &&
        JSON.stringify(b).includes('#技术'),
    )
    expect(tagBlock).toBeDefined()
  })

  it('skips tag block when tags are empty', () => {
    const draft = makeDraft({ tags: [] })
    const blocks = buildNotionBlocks(draft)

    const hasTagBlock = blocks.some(
      (b) =>
        b.type === 'paragraph' &&
        JSON.stringify(b).includes('标签：'),
    )
    expect(hasTagBlock).toBe(false)
  })

  it('generates a note callout block', () => {
    const draft = makeDraft({ note: '重要备注' })
    const blocks = buildNotionBlocks(draft)

    const noteBlock = blocks.find((b) => b.type === 'callout')
    expect(noteBlock).toBeDefined()
    const callout = (noteBlock as Record<string, unknown>).callout as Record<string, unknown>
    expect(callout.icon).toEqual({ emoji: '📝' })
  })

  it('splits long note into multiple callout blocks, all with 📝 icon', () => {
    const longNote = 'A'.repeat(4500)
    const draft = makeDraft({ note: longNote, tags: [] })
    draft.content.url = ''
    const blocks = buildNotionBlocks(draft)

    const callouts = blocks.filter((b) => b.type === 'callout')
    expect(callouts.length).toBeGreaterThanOrEqual(3)

    for (const calloutBlock of callouts) {
      const callout = (calloutBlock as Record<string, unknown>).callout as Record<string, unknown>
      expect(callout.icon).toEqual({ emoji: '📝' })
      const richText = callout.rich_text as Array<Record<string, unknown>>
      for (const rt of richText) {
        const content = (rt.text as Record<string, unknown>).content as string
        expect(content.length).toBeLessThanOrEqual(2000)
      }
    }

    const paragraphs = blocks.filter((b) => b.type === 'paragraph')
    const hasANoteParagraph = paragraphs.some((b) => {
      const json = JSON.stringify(b)
      return json.includes('AAAA') && !json.includes('来源：') && !json.includes('标签：')
    })
    expect(hasANoteParagraph).toBe(false)
  })

  it('skips note block when note is empty', () => {
    const draft = makeDraft({ note: '   ' })
    const blocks = buildNotionBlocks(draft)

    const hasNoteBlock = blocks.some((b) => b.type === 'callout')
    expect(hasNoteBlock).toBe(false)
  })

  it('generates a divider block', () => {
    const draft = makeDraft()
    const blocks = buildNotionBlocks(draft)

    const divider = blocks.find((b) => b.type === 'divider')
    expect(divider).toBeDefined()
  })

  it('generates paragraph blocks for content', () => {
    const draft = makeDraft()
    draft.content.markdown = '第一段\n\n第二段\n\n第三段'
    const blocks = buildNotionBlocks(draft)

    const paragraphs = blocks.filter((b) => b.type === 'paragraph')
    // URL block + tag block + 3 content paragraphs
    expect(paragraphs.length).toBeGreaterThanOrEqual(3)
  })

  it('splits long text into chunks of max 2000 chars', () => {
    const longText = 'A'.repeat(5000)
    const draft = makeDraft()
    draft.content.markdown = longText
    const blocks = buildNotionBlocks(draft)

    const paragraphs = blocks.filter((b) => b.type === 'paragraph')
    // The long text should split into at least 3 chunks (5000 / 2000 = 2.5 -> 3)
    const contentParagraphs = paragraphs.filter(
      (p) => !JSON.stringify(p).includes('来源：') && !JSON.stringify(p).includes('标签：'),
    )
    expect(contentParagraphs.length).toBeGreaterThanOrEqual(3)
  })

  it('handles empty content text', () => {
    const draft = makeDraft()
    draft.content.markdown = ''
    draft.content.contentText = ''
    const blocks = buildNotionBlocks(draft)

    // Should still have heading, divider, but no content paragraphs
    const hasContentParagraphs = blocks.some(
      (b) =>
        b.type === 'paragraph' &&
        !JSON.stringify(b).includes('来源：') &&
        !JSON.stringify(b).includes('标签：'),
    )
    expect(hasContentParagraphs).toBe(false)
    expect(blocks.some((b) => b.type === 'heading_2')).toBe(true)
    expect(blocks.some((b) => b.type === 'divider')).toBe(true)
  })
})
