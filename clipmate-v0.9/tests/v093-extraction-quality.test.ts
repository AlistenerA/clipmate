import { JSDOM } from 'jsdom'
import {
  assessExtractionQuality,
  selectBestExtractionCandidate,
  type ExtractionCandidate,
} from '../src/content/extractors/extractionQuality'
import {
  isLikelyNoiseElement,
  preCleanDocument,
} from '../src/content/extractors/articleBoundaryGuard'

function candidate(
  id: ExtractionCandidate['id'],
  content: string,
  textContent: string,
): ExtractionCandidate {
  return { id, content, textContent }
}

describe('v0.9.3 extraction quality gate', () => {
  it('selects a bounded candidate that preserves text and adds protected structure', () => {
    const legacy = candidate(
      'legacy',
      '<h2>Guide</h2><p>Intro text</p><pre><code>const a = 1</code></pre>',
      'Guide\nIntro text\nconst a = 1',
    )
    const improved = candidate(
      'conservative',
      '<h2>Guide</h2><p>Intro text and detail</p><pre><code>const a = 1</code></pre><table><tr><td>A</td></tr></table>',
      'Guide\nIntro text and detail\nconst a = 1\nA',
    )

    expect(selectBestExtractionCandidate([legacy, improved])?.id).toBe('conservative')
    expect(assessExtractionQuality(improved).tableCount).toBe(1)
  })

  it('keeps the legacy result when a candidate loses code or tables', () => {
    const legacy = candidate(
      'legacy',
      '<h2>Guide</h2><pre><code>const a = 1</code></pre><table><tr><td>A</td></tr></table>',
      'Guide\nconst a = 1\nA',
    )
    const lossy = candidate(
      'site-container',
      '<h2>Guide</h2><p>Longer explanatory body without its examples</p>',
      'Guide\nLonger explanatory body without its examples',
    )

    expect(selectBestExtractionCandidate([legacy, lossy])?.id).toBe('legacy')
  })

  it('rejects whole-page text inflation even when it contains more nodes', () => {
    const body = 'Article body '.repeat(30)
    const legacy = candidate('legacy', `<article><h2>Title</h2><p>${body}</p></article>`, body)
    const noisyText = `${body}${'Navigation recommendation '.repeat(100)}`
    const noisy = candidate(
      'conservative',
      `<main><h2>Title</h2><p>${noisyText}</p><ul><li>noise</li></ul></main>`,
      noisyText,
    )

    expect(selectBestExtractionCandidate([legacy, noisy])?.id).toBe('legacy')
  })
})

describe('v0.9.3 conservative noise filtering', () => {
  it('removes anchored ad/comment UI while retaining AI conversations', () => {
    const doc = new JSDOM(`<!doctype html><html><body>
      <div class="ad-banner">Advertisement</div>
      <div class="conversation-thread"><p>Complete AI answer</p></div>
      <div class="comment-thread"><p>Maintainer reply</p></div>
    </body></html>`).window.document

    preCleanDocument(doc)
    expect(doc.querySelector('.ad-banner')).toBeNull()
    expect(doc.querySelector('.conversation-thread')).not.toBeNull()
    expect(doc.querySelector('.comment-thread')).toBeNull()
  })

  it('never removes a protected code or table structure due to its class name', () => {
    const doc = new JSDOM(`<!doctype html><html><body>
      <section class="ad-example"><pre><code>const retained = true</code></pre></section>
      <section class="related-data"><table><tr><td>retained</td></tr></table></section>
    </body></html>`).window.document

    const codeSection = doc.querySelector('.ad-example')!
    const tableSection = doc.querySelector('.related-data')!
    expect(isLikelyNoiseElement(codeSection)).toBe(false)
    expect(isLikelyNoiseElement(tableSection)).toBe(false)
    preCleanDocument(doc)
    expect(doc.querySelector('code')?.textContent).toContain('retained')
    expect(doc.querySelector('table')).not.toBeNull()
  })
})
