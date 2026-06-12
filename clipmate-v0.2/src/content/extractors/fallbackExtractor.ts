export interface FallbackResult {
  content: string
  textContent: string
}

export function fallbackExtract(doc: Document): FallbackResult {
  const textContent = doc.body.innerText || ''
  const content = doc.body.innerHTML || ''
  return { content, textContent }
}
