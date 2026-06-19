import { AssetPickerController } from '../src/content/assetPicker'
import { buildNotionPageUrl } from '../src/platforms/notion/pageUrl'
import { buildHistoryInput } from '../src/popup/utils/historyPayload'
import {
  getHistoryActionLabel,
  getSafeNotionPageUrl,
} from '../src/options/utils/historyView'
import type { ClipDraft } from '../src/shared/types/clip.types'
import type { ClipHistoryItem } from '../src/shared/types/settings.types'

function rectAt(top: number) {
  return {
    left: 10,
    top,
    right: 330,
    bottom: top + 200,
    width: 320,
    height: 200,
    x: 10,
    y: top,
    toJSON: () => ({}),
  }
}

function makeDraft(): ClipDraft {
  return {
    title: 'History test',
    tags: ['test'],
    note: '',
    mode: 'fullpage',
    content: {
      mode: 'fullpage',
      title: 'History test',
      url: 'https://example.com/article',
      description: '',
      contentText: 'Body',
      contentHtml: '<p>Body</p>',
      markdown: 'Body',
      wordCount: 1,
      metadata: {
        url: 'https://example.com/article',
        title: 'History test',
        description: '',
        siteName: 'Example',
        createdAt: '2026-06-19T00:00:00.000Z',
      },
    },
  }
}

function makeHistoryItem(overrides: Partial<ClipHistoryItem> = {}): ClipHistoryItem {
  return {
    id: 'history-1',
    title: 'History test',
    url: 'https://example.com/article',
    mode: 'fullpage',
    tags: [],
    notePreview: '',
    contentPreview: 'Body',
    markdown: 'Body',
    markdownTruncated: false,
    wordCount: 1,
    saveStatus: 'unsaved',
    createdAt: '2026-06-19T00:00:00.000Z',
    updatedAt: '2026-06-19T00:00:00.000Z',
    ...overrides,
  }
}

describe('v0.8.5 asset picker hover lifecycle', () => {
  it('moves the hover box with the image and hides it after the pointer leaves on scroll', () => {
    document.body.innerHTML = '<article><img src="https://cdn.example.com/a.jpg" width="640" height="360"></article>'
    const image = document.querySelector('img')!
    let top = 20
    Object.defineProperty(image, 'getBoundingClientRect', {
      configurable: true,
      value: () => rectAt(top),
    })

    const controller = new AssetPickerController()
    controller.start({ sessionId: 'hover-scroll', maxSelection: 20 })
    image.dispatchEvent(new MouseEvent('mouseover', {
      bubbles: true,
      clientX: 30,
      clientY: 40,
    }))

    const hover = document
      .querySelector<HTMLElement>('#clipmate-asset-picker-overlay')
      ?.shadowRoot?.querySelector<HTMLElement>('#hover')
    expect(hover?.hidden).toBe(false)
    expect(hover?.style.top).toBe('20px')

    top = 30
    window.dispatchEvent(new Event('scroll'))
    expect(hover?.hidden).toBe(false)
    expect(hover?.style.top).toBe('30px')

    top = 80
    window.dispatchEvent(new Event('scroll'))
    expect(hover?.hidden).toBe(true)
    controller.cancel('hover-scroll')
  })
})

describe('v0.8.5 history action metadata', () => {
  it('records the copied Markdown target and formatted output', () => {
    const input = buildHistoryInput(makeDraft(), undefined, 'unsaved', {
      action: 'markdown-copy',
      markdownTarget: 'obsidian',
      markdown: '# Obsidian output',
    })

    expect(input).toMatchObject({
      action: 'markdown-copy',
      markdownTarget: 'obsidian',
      markdown: '# Obsidian output',
    })
    expect(getHistoryActionLabel(makeHistoryItem(input))).toBe('已复制 Obsidian Markdown')
  })

  it('builds and accepts only safe Notion page links', () => {
    const url = buildNotionPageUrl('abc123de-f456-7890-abc1-23def4567890')
    expect(url).toBe('https://www.notion.so/abc123def4567890abc123def4567890')
    expect(getSafeNotionPageUrl(url)).toBe(url)
    expect(buildNotionPageUrl('not-a-page-id')).toBeUndefined()
    expect(getSafeNotionPageUrl('javascript:alert(1)')).toBeUndefined()
    expect(getSafeNotionPageUrl('https://evil.example/notion.so')).toBeUndefined()
  })
})
