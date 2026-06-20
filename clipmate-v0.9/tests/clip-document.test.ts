import { describe, expect, it } from 'vitest'
import {
  appendVideoLinkMetadata,
  createClipDocument,
} from '../src/features/document'

describe('ClipDocument tutorial model', () => {
  it('preserves tutorial structure and media metadata', () => {
    const markdown = [
      '# Course title',
      '',
      '## Step one',
      '',
      'Install the package.',
      '',
      '```ts',
      'const answer = 42',
      '```',
      '',
      '$$',
      'E = mc^2',
      '$$',
      '',
      '| Name | Value |',
      '| --- | --- |',
      '| answer | 42 |',
      '',
      '> [!TIP] Keep this command nearby.',
      '',
      '![Diagram](https://cdn.example.com/diagram.png)',
      '*System diagram*',
    ].join('\n')

    const document = createClipDocument({
      title: 'Course title',
      url: 'https://example.com/course',
      markdown,
      videoLinks: [{
        url: 'https://www.youtube.com/embed/tutorial',
        title: 'Walkthrough',
        provider: 'YouTube',
        source: 'iframe',
      }],
    })

    expect(document.schemaVersion).toBe(1)
    expect(document.mode).toBe('tutorial')
    expect(document.stats).toEqual({
      headingCount: 2,
      listCount: 0,
      codeBlockCount: 1,
      formulaCount: 1,
      tableCount: 1,
      calloutCount: 1,
      figureCount: 1,
      videoCount: 1,
    })
    expect(document.blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'heading', level: 2, text: 'Step one' }),
      expect.objectContaining({ type: 'code', language: 'ts', code: 'const answer = 42' }),
      expect.objectContaining({ type: 'formula', expression: 'E = mc^2', display: true }),
      expect.objectContaining({ type: 'callout', kind: 'tip' }),
      expect.objectContaining({ type: 'figure', caption: 'System diagram' }),
      expect.objectContaining({ type: 'video', provider: 'YouTube', source: 'iframe' }),
    ]))
  })

  it('deduplicates and rejects unsafe video links', () => {
    const document = createClipDocument({
      title: 'Videos',
      url: 'https://example.com',
      markdown: '[Video link](https://www.youtube.com/watch?v=one)',
      videoLinks: [
        { url: 'https://www.youtube.com/watch?v=one', source: 'iframe' },
        { url: 'javascript:alert(1)', source: 'iframe' },
      ],
    })

    expect(document.stats.videoCount).toBe(1)
    expect(document.blocks.filter((block) => block.type === 'video')).toHaveLength(1)
  })

  it('adds missing video metadata to copied Markdown', () => {
    const markdown = appendVideoLinkMetadata('## Lesson', [
      {
        url: 'https://player.vimeo.com/video/123',
        title: 'Demo video',
        provider: 'Vimeo',
        source: 'iframe',
      },
    ])

    expect(markdown).toContain('## Video links')
    expect(markdown).toContain('[Demo video](https://player.vimeo.com/video/123)')
  })
})
