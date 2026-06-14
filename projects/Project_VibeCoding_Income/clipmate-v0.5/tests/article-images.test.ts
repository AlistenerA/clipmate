import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  extractArticleImages,
  resolveUrl,
  isNoiseUrl,
  isTrackingPixel,
  getBestSrc,
  extractCaption,
} from '../src/content/extractors/articleImages'

function createDocument(bodyHtml: string): Document {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${bodyHtml}</body></html>`)
  return dom.window.document
}

describe('extractArticleImages', () => {
  describe('basic image extraction', () => {
    it('extracts simple img elements with src', () => {
      const doc = createDocument(`
        <article>
          <p>Some text</p>
          <img src="https://example.com/photo.jpg" alt="A photo" />
          <img src="https://example.com/illustration.png" alt="Illustration" />
        </article>
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(2)
      expect(result.images[0].url).toBe('https://example.com/photo.jpg')
      expect(result.images[0].alt).toBe('A photo')
      expect(result.images[0].origin).toBe('img')
      expect(result.images[1].url).toBe('https://example.com/illustration.png')
      expect(result.stats.totalFound).toBe(2)
      expect(result.stats.kept).toBe(2)
      expect(result.stats.skipped).toBe(0)
    })

    it('returns empty result for page with no images', () => {
      const doc = createDocument('<article><p>No images here</p></article>')
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(0)
      expect(result.stats.totalFound).toBe(0)
      expect(result.stats.skipped).toBe(0)
    })

    it('returns empty result for empty page', () => {
      const doc = createDocument('')
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(0)
      expect(result.stats.totalFound).toBe(0)
      expect(result.stats.kept).toBe(0)
      expect(result.stats.skipped).toBe(0)
    })
  })

  describe('relative URL resolution', () => {
    it('resolves relative URLs with pageUrl', () => {
      const doc = createDocument('<img src="/images/photo.jpg" alt="Photo" />')
      const result = extractArticleImages(doc, {
        pageUrl: 'https://example.com/blog/post.html',
      })

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/images/photo.jpg')
    })

    it('resolves protocol-relative URLs', () => {
      const doc = createDocument('<img src="//cdn.example.com/photo.jpg" />')
      const result = extractArticleImages(doc, {
        pageUrl: 'https://example.com',
      })

      expect(result.images[0].url).toBe('https://cdn.example.com/photo.jpg')
    })

    it('keeps absolute URLs unchanged', () => {
      const doc = createDocument('<img src="https://cdn.example.com/photo.jpg" />')
      const result = extractArticleImages(doc, {
        pageUrl: 'https://example.com',
      })

      expect(result.images[0].url).toBe('https://cdn.example.com/photo.jpg')
    })

    it('leaves relative URL unresolved when no pageUrl', () => {
      const doc = createDocument('<img src="/images/photo.jpg" />')
      const result = extractArticleImages(doc)

      expect(result.images[0].url).toBe('/images/photo.jpg')
    })
  })

  describe('srcset support', () => {
    it('extracts src from img when srcset is present', () => {
      const doc = createDocument(`
        <img src="https://example.com/photo-800w.jpg"
             srcset="https://example.com/photo-400w.jpg 400w, https://example.com/photo-800w.jpg 800w" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/photo-800w.jpg')
    })
  })

  describe('figure/figcaption extraction', () => {
    it('extracts image from figure with figcaption', () => {
      const doc = createDocument(`
        <figure>
          <img src="https://example.com/chart.png" alt="Revenue chart" />
          <figcaption>Figure 1: Revenue growth over time</figcaption>
        </figure>
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/chart.png')
      expect(result.images[0].alt).toBe('Revenue chart')
      expect(result.images[0].caption).toBe('Figure 1: Revenue growth over time')
      expect(result.images[0].origin).toBe('figure')
    })

    it('skips figure with no img element', () => {
      const doc = createDocument(`
        <figure>
          <figcaption>Just a caption</figcaption>
        </figure>
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(0)
    })

    it('extracts caption for img inside figure with only figcaption', () => {
      const doc = createDocument(`
        <img src="https://example.com/standalone.jpg" />
        <figure>
          <img src="https://example.com/fig.jpg" />
          <figcaption>Inside figure</figcaption>
        </figure>
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(2)
      const figImage = result.images.find((i) => i.url === 'https://example.com/fig.jpg')
      expect(figImage?.caption).toBe('Inside figure')
      expect(figImage?.origin).toBe('figure')
    })
  })

  describe('alt/title preservation', () => {
    it('preserves alt attribute', () => {
      const doc = createDocument('<img src="https://example.com/a.jpg" alt="Description text" />')
      const result = extractArticleImages(doc)

      expect(result.images[0].alt).toBe('Description text')
    })

    it('preserves title when different from alt', () => {
      const doc = createDocument('<img src="https://example.com/a.jpg" alt="Photo" title="Click to enlarge" />')
      const result = extractArticleImages(doc)

      expect(result.images[0].alt).toBe('Photo')
      expect(result.images[0].title).toBe('Click to enlarge')
    })

    it('omits title when same as alt', () => {
      const doc = createDocument('<img src="https://example.com/a.jpg" alt="Same text" title="Same text" />')
      const result = extractArticleImages(doc)

      expect(result.images[0].alt).toBe('Same text')
      expect(result.images[0].title).toBeUndefined()
    })
  })

  describe('noise filtering - tracking pixels', () => {
    it('filters 1x1 tracking pixel', () => {
      const doc = createDocument(`
        <img src="https://example.com/photo.jpg" width="800" height="600" />
        <img src="https://track.example.com/pixel.gif" width="1" height="1" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/photo.jpg')
      expect(result.skipped[0].reason).toBe('tracking_pixel')
    })

    it('filters tracking pixel by URL pattern', () => {
      const doc = createDocument(`
        <img src="https://example.com/tracking" width="2" height="2" />
        <img src="https://example.com/photo.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/photo.jpg')
    })
  })

  describe('noise filtering - avatar/icon/logo', () => {
    it('filters images with avatar class', () => {
      const doc = createDocument(`
        <img class="avatar user-avatar" src="https://example.com/user123.jpg" />
        <img src="https://example.com/article-photo.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/article-photo.jpg')
      expect(result.skipped[0].reason).toBe('noise_class_or_attr')
    })

    it('filters images with icon class', () => {
      const doc = createDocument(`
        <img class="icon-small" src="https://example.com/star.png" />
        <img src="https://example.com/content.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/content.jpg')
    })

    it('filters images with logo in URL', () => {
      const doc = createDocument(`
        <img src="https://example.com/logo.svg" />
        <img src="https://example.com/hero.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/hero.jpg')
    })

    it('filters images with favicon in URL', () => {
      const doc = createDocument(`
        <img src="https://example.com/favicon.ico" />
        <img src="https://example.com/article.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/article.jpg')
    })

    it('filters images with badge class', () => {
      const doc = createDocument(`
        <img class="badge" src="https://example.com/badge.png" />
        <img src="https://example.com/real.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/real.jpg')
    })

    it('filters emoji images', () => {
      const doc = createDocument(`
        <img class="emoji" src="https://example.com/smile.png" />
        <img src="https://example.com/content.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/content.jpg')
    })

    it('filters sprite images', () => {
      const doc = createDocument(`
        <img class="icon-sprite" src="https://example.com/sprite.png" />
        <img src="https://example.com/real.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/real.jpg')
    })

    it('filters images with noise id', () => {
      const doc = createDocument(`
        <img id="avatar-img" src="https://example.com/user.png" />
        <img src="https://example.com/ok.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/ok.jpg')
    })
  })

  describe('data URI and blob URI filtering', () => {
    it('filters data:image URIs by default', () => {
      const doc = createDocument(`
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk" />
        <img src="https://example.com/real.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/real.jpg')
      expect(result.skipped.some((s) => s.reason === 'data_uri')).toBe(true)
    })

    it('allows data:image URIs when allowDataUri is true', () => {
      const doc = createDocument(`
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8" alt="Inline" />
      `)
      const result = extractArticleImages(doc, { allowDataUri: true })

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toContain('data:image/png;base64,')
    })

    it('filters blob URIs', () => {
      const doc = createDocument(`
        <img src="blob:https://example.com/uuid-here" />
        <img src="https://example.com/real.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/real.jpg')
      expect(result.skipped.some((s) => s.reason === 'blob_uri')).toBe(true)
    })
  })

  describe('deduplication', () => {
    it('deduplicates identical URLs', () => {
      const doc = createDocument(`
        <img src="https://example.com/same.jpg" alt="First" />
        <img src="https://example.com/same.jpg" alt="Second" />
        <img src="https://example.com/different.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(2)
      expect(result.skipped[0].reason).toBe('duplicate')
    })

    it('deduplicates after URL resolution', () => {
      const doc = createDocument(`
        <img src="/images/photo.jpg" />
        <img src="https://example.com/images/photo.jpg" />
      `)
      const result = extractArticleImages(doc, {
        pageUrl: 'https://example.com',
      })

      expect(result.images).toHaveLength(1)
    })
  })

  describe('maxImages limit', () => {
    it('limits to default 20 images', () => {
      const imgs = Array.from({ length: 25 }, (_, i) =>
        `<img src="https://example.com/img${i}.jpg" />`,
      ).join('\n')
      const doc = createDocument(imgs)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(20)
      expect(result.skipped.some((s) => s.reason === 'max_images_reached')).toBe(true)
      expect(result.stats.totalFound).toBe(25)
      expect(result.stats.kept).toBe(20)
      expect(result.stats.skipped).toBe(5)
    })

    it('respects custom maxImages', () => {
      const imgs = Array.from({ length: 10 }, (_, i) =>
        `<img src="https://example.com/img${i}.jpg" />`,
      ).join('\n')
      const doc = createDocument(imgs)
      const result = extractArticleImages(doc, { maxImages: 3 })

      expect(result.images).toHaveLength(3)
      expect(result.skipped.some((s) => s.reason === 'max_images_reached')).toBe(true)
    })

    it('returns all images when under limit', () => {
      const doc = createDocument(`
        <img src="https://example.com/1.jpg" />
        <img src="https://example.com/2.jpg" />
        <img src="https://example.com/3.jpg" />
      `)
      const result = extractArticleImages(doc, { maxImages: 10 })

      expect(result.images).toHaveLength(3)
      expect(result.skipped).toHaveLength(0)
    })
  })

  describe('below minimum size filtering', () => {
    it('filters images below default minimum size', () => {
      const doc = createDocument(`
        <img src="https://example.com/small.jpg" width="30" height="20" />
        <img src="https://example.com/large.jpg" width="800" height="600" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/large.jpg')
      expect(result.skipped[0].reason).toBe('below_min_size')
    })

    it('keeps images with zero dimension (not parsed)', () => {
      const doc = createDocument('<img src="https://example.com/unknown.jpg" />')
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
    })
  })

  describe('stats correctness', () => {
    it('reports correct stats for mixed results', () => {
      const doc = createDocument(`
        <img src="https://example.com/good1.jpg" width="800" height="600" />
        <img class="avatar" src="https://example.com/avatar.png" />
        <img src="https://example.com/good2.jpg" />
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP" width="1" height="1" />
        <img src="https://example.com/good1.jpg" />
        <img src="https://example.com/good3.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.stats.totalFound).toBe(6)
      expect(result.stats.kept).toBe(3)
      expect(result.stats.skipped).toBe(3)
      expect(result.stats.kept + result.stats.skipped).toBe(result.stats.totalFound)
    })
  })

  describe('index ordering', () => {
    it('assigns sequential indices', () => {
      const doc = createDocument(`
        <img src="https://example.com/1.jpg" />
        <img src="https://example.com/2.jpg" />
        <img src="https://example.com/3.jpg" />
      `)
      const result = extractArticleImages(doc)

      expect(result.images[0].index).toBe(0)
      expect(result.images[1].index).toBe(1)
      expect(result.images[2].index).toBe(2)
    })
  })

  describe('sourceUrl tracking', () => {
    it('records sourceUrl when available', () => {
      const dom = new JSDOM(`<!DOCTYPE html><html><body>
        <img src="https://example.com/photo.jpg" />
      </body></html>`, { url: 'https://example.com/article/42' })

      global.window = dom.window as unknown as Window & typeof globalThis
      global.document = dom.window.document

      const result = extractArticleImages(dom.window.document)

      expect(result.images[0].sourceUrl).toBe('https://example.com/article/42')

      delete (global as Record<string, unknown>).window
      delete (global as Record<string, unknown>).document
    })

    it('sourceUrl is string in environment with window', () => {
      const dom = new JSDOM(`<!DOCTYPE html><html><body>
        <img src="https://example.com/photo.jpg" />
      </body></html>`, { url: 'https://example.com/article/42' })

      global.window = dom.window as unknown as Window & typeof globalThis
      global.document = dom.window.document

      const result = extractArticleImages(dom.window.document)

      expect(result.images[0]).toHaveProperty('sourceUrl')
      expect(result.images[0].sourceUrl).toBeTypeOf('string')

      delete (global as Record<string, unknown>).window
      delete (global as Record<string, unknown>).document
    })
  })

  describe('picture element support', () => {
    it('extracts image from picture element', () => {
      const doc = createDocument(`
        <picture>
          <source srcset="https://example.com/photo.webp" type="image/webp" />
          <img src="https://example.com/photo.jpg" alt="A photo" />
        </picture>
      `)
      const result = extractArticleImages(doc)

      expect(result.images).toHaveLength(1)
      expect(result.images[0].url).toBe('https://example.com/photo.jpg')
      expect(result.images[0].alt).toBe('A photo')
      expect(result.images[0].origin).toBe('picture')
    })
  })
})

describe('resolveUrl', () => {
  it('resolves relative URL with base', () => {
    expect(resolveUrl('/path/to/img.jpg', 'https://example.com/blog/')).toBe(
      'https://example.com/path/to/img.jpg',
    )
  })

  it('preserves absolute URL', () => {
    expect(resolveUrl('https://cdn.com/img.jpg', 'https://example.com')).toBe(
      'https://cdn.com/img.jpg',
    )
  })

  it('handles protocol-relative URL', () => {
    expect(resolveUrl('//cdn.com/img.jpg', 'https://example.com')).toBe(
      'https://cdn.com/img.jpg',
    )
  })

  it('returns original on invalid base', () => {
    expect(resolveUrl('/img.jpg', '')).toBe('/img.jpg')
  })
})

describe('isNoiseUrl', () => {
  it('detects tracking URL', () => {
    expect(isNoiseUrl('https://example.com/tracking/pixel.gif')).toBe(true)
  })

  it('detects beacon URL', () => {
    expect(isNoiseUrl('https://analytics.example.com/beacon')).toBe(true)
  })

  it('detects 1x1 pixel path', () => {
    expect(isNoiseUrl('https://example.com/1x1.gif')).toBe(true)
  })

  it('detects blank spacer', () => {
    expect(isNoiseUrl('https://example.com/spacer.gif')).toBe(true)
  })

  it('detects transparent pixel', () => {
    expect(isNoiseUrl('https://example.com/transparent.png')).toBe(true)
  })

  it('detects data URI', () => {
    expect(isNoiseUrl('data:image/png;base64,abc123')).toBe(true)
  })

  it('detects blob URI', () => {
    expect(isNoiseUrl('blob:https://example.com/uuid')).toBe(true)
  })

  it('passes normal image URL', () => {
    expect(isNoiseUrl('https://example.com/photo.jpg')).toBe(false)
  })
})

describe('isTrackingPixel', () => {
  it('detects 1x1 pixel', () => {
    expect(isTrackingPixel(1, 1, 'https://example.com/pixel.gif')).toBe(true)
  })

  it('detects small tracking image', () => {
    expect(isTrackingPixel(2, 2, 'https://example.com/tracking/beacon')).toBe(true)
  })

  it('passes normal image', () => {
    expect(isTrackingPixel(800, 600, 'https://example.com/photo.jpg')).toBe(false)
  })

  it('passes small image without tracking pattern', () => {
    expect(isTrackingPixel(2, 2, 'https://example.com/icon-small.png')).toBe(false)
  })
})

describe('getBestSrc', () => {
  it('returns src attribute', () => {
    const dom = new JSDOM('<img src="https://example.com/photo.jpg" />')
    const img = dom.window.document.querySelector('img')!
    expect(getBestSrc(img)).toBe('https://example.com/photo.jpg')
  })

  it('returns undefined for no src', () => {
    const dom = new JSDOM('<img />')
    const img = dom.window.document.querySelector('img')!
    expect(getBestSrc(img)).toBeUndefined()
  })

  it('returns data URI (filtered later by extractArticleImages)', () => {
    const dom = new JSDOM('<img src="data:image/png;base64,abc" />')
    const img = dom.window.document.querySelector('img')!
    expect(getBestSrc(img)).toBe('data:image/png;base64,abc')
  })

  it('returns blob URI (filtered later by extractArticleImages)', () => {
    const dom = new JSDOM('<img src="blob:https://example.com/uuid" />')
    const img = dom.window.document.querySelector('img')!
    expect(getBestSrc(img)).toBe('blob:https://example.com/uuid')
  })
})

describe('extractCaption', () => {
  it('returns caption from ancestor figure', () => {
    const doc = createDocument(`
      <figure>
        <img src="https://example.com/a.jpg" />
        <figcaption>This is a caption</figcaption>
      </figure>
    `)
    const img = doc.querySelector('img')!
    expect(extractCaption(img)).toBe('This is a caption')
  })

  it('returns undefined when no figure parent', () => {
    const doc = createDocument('<img src="https://example.com/a.jpg" />')
    const img = doc.querySelector('img')!
    expect(extractCaption(img)).toBeUndefined()
  })

  it('truncates long captions', () => {
    const longText = 'A'.repeat(500)
    const doc = createDocument(`
      <figure>
        <img src="https://example.com/a.jpg" />
        <figcaption>${longText}</figcaption>
      </figure>
    `)
    const img = doc.querySelector('img')!
    const caption = extractCaption(img)
    expect(caption?.length).toBe(300)
  })
})
