import { Readability } from '@mozilla/readability'
import { normalizeSiteCodeContainers } from '../parser/codeContainers'

export interface ReadabilityResult {
  content: string
  textContent: string
}

export function extractFullpage(doc: Document): ReadabilityResult | null {
  try {
    normalizeSiteCodeContainers(doc)
    const article = new Readability(doc, { keepClasses: true }).parse()
    if (!article) return null
    return {
      content: article.content || '',
      textContent: article.textContent || '',
    }
  } catch {
    return null
  }
}
