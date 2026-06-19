import { hasEnoughArticleText } from './articleBoundaryGuard'

export interface FallbackResult {
  content: string
  textContent: string
}

const CONTENT_SELECTORS = [
  'article',
  'main',
  '[role="main"]',
  '.article-content',
  '.article-body',
  '.post-content',
  '.entry-content',
  '.content',
  '#content',
  '.main-content',
  '.rich_media_content',
  '.markdown-body',
  '.news-content',
  '.news-body',
  '.article-detail',
]

export function fallbackExtract(doc: Document): FallbackResult {
  for (const sel of CONTENT_SELECTORS) {
    try {
      const el = doc.querySelector(sel)
      if (el && hasEnoughArticleText(el.textContent || '')) {
        return {
          content: el.innerHTML || '',
          textContent: el.textContent || '',
        }
      }
    } catch {
      // invalid selector - try next
    }
  }

  const textContent = doc.body.innerText || ''
  const content = doc.body.innerHTML || ''
  return { content, textContent }
}
