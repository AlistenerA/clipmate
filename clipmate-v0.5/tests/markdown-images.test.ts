import { describe, it, expect } from 'vitest'
import { htmlToMarkdown } from '../src/content/parser/htmlToMarkdown'

describe('htmlToMarkdown - image noise filtering', () => {
  it('keeps normal article image', () => {
    const md = htmlToMarkdown('<article><img src="https://example.com/photo.jpg" alt="A nice view" /></article>')
    expect(md).toContain('![A nice view](https://example.com/photo.jpg)')
  })

  it('rejects data:image URIs', () => {
    const md = htmlToMarkdown('<img src="data:image/png;base64,iVBORw0KGgo" alt="inline" />')
    expect(md).not.toContain('data:image')
    expect(md).not.toContain('![')
  })

  it('rejects blob URIs', () => {
    const md = htmlToMarkdown('<img src="blob:https://example.com/uuid" alt="blob" />')
    expect(md).not.toContain('blob:')
    expect(md).not.toContain('![')
  })

  it('rejects avatar class image', () => {
    const md = htmlToMarkdown('<img class="avatar user-avatar" src="https://example.com/avatar.png" alt="me" />')
    expect(md).not.toContain('avatar.png')
    expect(md).not.toContain('![')
  })

  it('rejects icon class image', () => {
    const md = htmlToMarkdown('<img class="icon-small" src="https://example.com/icon.png" />')
    expect(md).not.toContain('icon.png')
  })

  it('rejects logo URL image', () => {
    const md = htmlToMarkdown('<img src="https://example.com/logo.svg" alt="brand" />')
    expect(md).not.toContain('logo.svg')
  })

  it('rejects emoji class image', () => {
    const md = htmlToMarkdown('<img class="emoji" src="https://example.com/smile.png" />')
    expect(md).not.toContain('smile.png')
  })

  it('rejects tracking pixel 1x1', () => {
    const md = htmlToMarkdown('<img src="https://track.example.com/beacon.gif" width="1" height="1" />')
    expect(md).not.toContain('beacon.gif')
  })

  it('rejects below minimum size images', () => {
    const md = htmlToMarkdown('<img src="https://example.com/tiny.jpg" width="30" height="20" />')
    expect(md).not.toContain('tiny.jpg')
  })

  it('rejects noise id image', () => {
    const md = htmlToMarkdown('<img id="avatar-img" src="https://example.com/profile.png" />')
    expect(md).not.toContain('profile.png')
  })

  it('rejects noise URL pattern image', () => {
    const md = htmlToMarkdown('<img src="https://analytics.example.com/tracking/pixel.gif" />')
    expect(md).not.toContain('pixel.gif')
  })
})

describe('htmlToMarkdown - image deduplication', () => {
  it('keeps only first occurrence of duplicate URL', () => {
    const md = htmlToMarkdown(`
      <img src="https://example.com/same.jpg" alt="First" />
      <img src="https://example.com/same.jpg" alt="Second" />
      <img src="https://example.com/different.jpg" alt="Other" />
    `)
    const matches = md.match(/!\[.*?\]\(https:\/\/example\.com\/same\.jpg\)/g)
    expect(matches).toHaveLength(1)
    expect(md).toContain('![First]')
    expect(md).not.toContain('![Second]')
    expect(md).toContain('![Other]')
  })
})

describe('htmlToMarkdown - alt text fallback', () => {
  it('uses "image" as default alt when empty', () => {
    const md = htmlToMarkdown('<img src="https://example.com/photo.jpg" />')
    expect(md).toContain('![image](https://example.com/photo.jpg)')
  })

  it('uses provided alt text', () => {
    const md = htmlToMarkdown('<img src="https://example.com/photo.jpg" alt="Sunset over mountains" />')
    expect(md).toContain('![Sunset over mountains](https://example.com/photo.jpg)')
  })

  it('trims whitespace from alt', () => {
    const md = htmlToMarkdown('<img src="https://example.com/photo.jpg" alt="  hello  " />')
    expect(md).toContain('![hello](https://example.com/photo.jpg)')
  })
})

describe('htmlToMarkdown - relative URL resolution', () => {
  it('resolves relative URLs with pageUrl', () => {
    const md = htmlToMarkdown(
      '<img src="/images/photo.jpg" alt="Photo" />',
      'https://example.com/blog/post.html',
    )
    expect(md).toContain('![Photo](https://example.com/images/photo.jpg)')
  })

  it('resolves protocol-relative URLs with pageUrl', () => {
    const md = htmlToMarkdown(
      '<img src="//cdn.example.com/photo.jpg" alt="CDN" />',
      'https://example.com',
    )
    expect(md).toContain('![CDN](https://cdn.example.com/photo.jpg)')
  })

  it('keeps absolute URLs unchanged even with pageUrl', () => {
    const md = htmlToMarkdown(
      '<img src="https://cdn.example.com/photo.jpg" alt="CDN" />',
      'https://example.com',
    )
    expect(md).toContain('![CDN](https://cdn.example.com/photo.jpg)')
  })

  it('keeps relative URL as-is when no pageUrl', () => {
    const md = htmlToMarkdown('<img src="/images/photo.jpg" alt="Photo" />')
    expect(md).toContain('![Photo](/images/photo.jpg)')
  })
})

describe('htmlToMarkdown - no regression on non-image content', () => {
  it('preserves text paragraphs unchanged', () => {
    const md = htmlToMarkdown('<p>Hello world</p><p>Second paragraph</p>')
    expect(md).toContain('Hello world')
    expect(md).toContain('Second paragraph')
    expect(md).not.toContain('![')
  })

  it('preserves headings', () => {
    const md = htmlToMarkdown('<h1>Title</h1><h2>Subtitle</h2>')
    expect(md).toContain('# Title')
    expect(md).toContain('## Subtitle')
  })

  it('preserves links', () => {
    const md = htmlToMarkdown('<a href="https://example.com">Visit</a>')
    expect(md).toContain('[Visit](https://example.com)')
  })

  it('returns empty string for empty html', () => {
    const md = htmlToMarkdown('')
    expect(md).toBe('')
  })

  it('returns empty string for whitespace-only html', () => {
    const md = htmlToMarkdown('   ')
    expect(md).toBe('')
  })
})

describe('htmlToMarkdown - figure with images', () => {
  it('keeps figure image with caption when image is valid', () => {
    const md = htmlToMarkdown(`
      <figure>
        <img src="https://example.com/chart.png" alt="Revenue" />
        <figcaption>Figure 1: Revenue growth</figcaption>
      </figure>
    `)
    expect(md).toContain('![Revenue](https://example.com/chart.png)')
    expect(md).toContain('*Figure 1: Revenue growth*')
  })

  it('rejects figure with noise image', () => {
    const md = htmlToMarkdown(`
      <figure>
        <img class="avatar" src="https://example.com/user.png" alt="User" />
        <figcaption>Team member</figcaption>
      </figure>
    `)
    expect(md).not.toContain('user.png')
  })
})

describe('htmlToMarkdown - no impact on selection/comment-context', () => {
  it('does not add image syntax to plain text', () => {
    const md = htmlToMarkdown('<p>Just some text with no images at all</p>')
    expect(md).toBe('Just some text with no images at all')
  })

  it('mixed content preserves images alongside text', () => {
    const md = htmlToMarkdown(`
      <p>Before image</p>
      <img src="https://example.com/mid.jpg" alt="Middle" width="800" height="600" />
      <p>After image</p>
    `)
    expect(md).toContain('Before image')
    expect(md).toContain('![Middle](https://example.com/mid.jpg)')
    expect(md).toContain('After image')
  })
})
