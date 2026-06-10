export interface PageMeta {
  url: string
  title: string
  description: string
  siteName: string
}

export function parseMetadata(doc: Document): PageMeta {
  const getMetaContent = (name: string, isProperty = false): string => {
    const selector = isProperty
      ? `meta[property="${name}"]`
      : `meta[name="${name}"], meta[property="${name}"]`
    const el = doc.querySelector(selector)
    const content = el?.getAttribute('content')?.trim()
    return content || ''
  }

  return {
    url: doc.URL || '',
    title: getMetaContent('og:title', true) || doc.title || '',
    description:
      getMetaContent('og:description', true) || getMetaContent('description') || '',
    siteName: getMetaContent('og:site_name', true) || '',
  }
}
