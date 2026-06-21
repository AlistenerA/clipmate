const REMOVE_SELECTORS = 'script, style, noscript, iframe'

export function cleanDocument(doc: Document): void {
  doc.querySelectorAll(REMOVE_SELECTORS).forEach((el) => el.remove())
}
