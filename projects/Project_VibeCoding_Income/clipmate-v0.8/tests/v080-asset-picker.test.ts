import { afterEach, describe, expect, it } from 'vitest'
import {
  applySelectedImagesToContent,
  formatSelectedImagesMarkdown,
  moveSelectedImage,
  normalizeSelectedImages
} from '../src/features/assets'
import { AssetPickerController, collectAssetPickerCandidates } from '../src/content/assetPicker'
import { buildNotionBlocks } from '../src/platforms/notion/blocks'
import { createClipDocument } from '../src/features/document'
import type {
  ClipDraft,
  ExtractedContent,
  SelectedImageAsset
} from '../src/shared/types/clip.types'

function makeImage(url: string, index = 0): SelectedImageAsset {
  return {
    id: `selected-${index}`,
    url,
    alt: `Image ${index + 1}`,
    index,
    origin: 'img'
  }
}

function makeContent(overrides: Partial<ExtractedContent> = {}): ExtractedContent {
  return {
    mode: 'fullpage',
    title: 'Asset picker note',
    url: 'https://example.com/article',
    description: '',
    contentText: 'Body',
    contentHtml: '<p>Body</p>',
    markdown: 'Body\n\n![Existing](https://cdn.example.com/existing.jpg)',
    wordCount: 1,
    metadata: {
      url: 'https://example.com/article',
      title: 'Asset picker note',
      description: '',
      siteName: 'Example',
      createdAt: '2026-06-19T00:00:00.000Z'
    },
    imageCount: 1,
    ...overrides
  }
}

function setVisibleRect(element: Element, left = 10): void {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left,
      top: 20,
      right: left + 320,
      bottom: 220,
      width: 320,
      height: 200,
      x: left,
      y: 20,
      toJSON: () => ({})
    })
  })
}

function preparePage(): HTMLImageElement[] {
  document.head.innerHTML = '<title>Picker</title>'
  document.body.innerHTML = `
    <article>
      <img src="https://cdn.example.com/a.jpg" alt="A" width="640" height="360">
      <img data-src="https://cdn.example.com/b.jpg" src="https://example.com/spacer.gif" alt="B" width="640" height="360">
      <img src="data:image/png;base64,abc" width="640" height="360">
      <img hidden src="https://cdn.example.com/hidden.jpg" width="640" height="360">
    </article>
  `
  const images = Array.from(document.querySelectorAll('img'))
  images.forEach((image, index) => setVisibleRect(image, 10 + index * 20))
  return images
}

afterEach(() => {
  document.documentElement.querySelector('#clipmate-asset-picker-overlay')?.remove()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('v0.8 selected image draft integration', () => {
  it('normalizes safe URLs, removes duplicates, and enforces the limit', () => {
    const images = normalizeSelectedImages(
      [
        makeImage('https://cdn.example.com/a.jpg'),
        makeImage('javascript:alert(1)', 1),
        makeImage('https://cdn.example.com/a.jpg', 2),
        makeImage('https://cdn.example.com/b.jpg', 3)
      ],
      2
    )

    expect(images.map((image) => image.url)).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.jpg'
    ])
    expect(images.map((image) => image.index)).toEqual([0, 1])
  })

  it('appends only missing images and restores base Markdown after removal', () => {
    const existing = makeImage('https://cdn.example.com/existing.jpg')
    const added = makeImage('https://cdn.example.com/added.jpg', 1)
    const selected = applySelectedImagesToContent(makeContent(), [existing, added])

    expect(selected.markdown.match(/existing\.jpg/g)).toHaveLength(1)
    expect(selected.markdown).toContain('## 已选图片')
    expect(selected.markdown).toContain('added.jpg')
    expect(selected.imageCount).toBe(2)

    const cleared = applySelectedImagesToContent(selected, [])
    expect(cleared.markdown).toBe(makeContent().markdown)
    expect(cleared.selectedImages).toEqual([])
  })

  it('keeps user ordering in generated Markdown', () => {
    const first = makeImage('https://cdn.example.com/first.jpg')
    const second = makeImage('https://cdn.example.com/second.jpg', 1)
    const reordered = moveSelectedImage([first, second], 1, 0)
    const markdown = formatSelectedImagesMarkdown(reordered)

    expect(markdown.indexOf('second.jpg')).toBeLessThan(markdown.indexOf('first.jpg'))
    expect(reordered.map((image) => image.index)).toEqual([0, 1])
  })

  it('adds selected images to tutorial Notion blocks without duplicating document figures', () => {
    const existingUrl = 'https://cdn.example.com/existing.jpg'
    const addedUrl = 'https://cdn.example.com/added.jpg'
    const markdown = `Tutorial\n\n![Existing](${existingUrl})`
    const content = applySelectedImagesToContent(
      makeContent({
        mode: 'tutorial',
        markdown,
        clipDocument: createClipDocument({
          title: 'Tutorial',
          url: 'https://example.com/article',
          markdown
        })
      }),
      [makeImage(existingUrl), makeImage(addedUrl, 1)]
    )
    const draft: ClipDraft = {
      title: content.title,
      tags: [],
      note: '',
      mode: 'tutorial',
      content
    }
    const blocks = buildNotionBlocks(draft)
    const imageUrls = blocks
      .filter((block) => block.type === 'image')
      .map((block) => (block.image as { external: { url: string } }).external.url)

    expect(imageUrls.filter((url) => url === existingUrl)).toHaveLength(1)
    expect(imageUrls.filter((url) => url === addedUrl)).toHaveLength(1)
  })
})

describe('v0.8 page asset picker session', () => {
  it('collects visible safe candidates using lazy image resolution', () => {
    preparePage()
    const candidates = collectAssetPickerCandidates(document)

    expect(candidates.map((candidate) => candidate.asset.url)).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.jpg'
    ])
  })

  it('selects an image, completes, and only consumes a matching session', () => {
    const [first] = preparePage()
    const controller = new AssetPickerController()
    const started = controller.start({
      sessionId: 'session-current',
      maxSelection: 20
    })

    expect(started?.status).toBe('active')
    expect(document.querySelector('#clipmate-asset-picker-overlay')).not.toBeNull()

    first.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(controller.getState()?.selectedImages.map((image) => image.url)).toEqual([
      'https://cdn.example.com/a.jpg'
    ])

    const doneButton = document
      .querySelector<HTMLElement>('#clipmate-asset-picker-overlay')
      ?.shadowRoot?.querySelector<HTMLButtonElement>('#done')
    doneButton?.click()
    expect(controller.getState()?.status).toBe('completed')
    expect(document.querySelector('#clipmate-asset-picker-overlay')).toBeNull()
    expect(controller.consume('session-old')).toBe(false)
    expect(controller.getState()?.sessionId).toBe('session-current')
    expect(controller.consume('session-current')).toBe(true)
    expect(controller.getState()).toBeNull()
  })

  it('cancels with Escape and rejects stale cancellation IDs', () => {
    preparePage()
    const controller = new AssetPickerController()
    controller.start({ sessionId: 'session-new', maxSelection: 20 })

    expect(controller.cancel('session-old')).toBe(false)
    expect(controller.getState()?.status).toBe('active')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(controller.getState()?.status).toBe('cancelled')
    expect(document.querySelector('#clipmate-asset-picker-overlay')).toBeNull()
  })
})
