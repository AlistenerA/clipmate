interface RichTextSegment {
  content: string
  bold?: boolean
  italic?: boolean
  code?: boolean
  link?: { url: string } | null
}

export interface NotionTextRequest {
  type: 'text'
  text: { content: string; link?: { url: string } | null }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
}

const MAX_TEXT_LENGTH = 2000

function defaultAnnotations(overrides: Partial<RichTextSegment> = {}): NotionTextRequest['annotations'] {
  return {
    bold: overrides.bold ?? false,
    italic: overrides.italic ?? false,
    strikethrough: false,
    underline: false,
    code: overrides.code ?? false,
    color: 'default',
  }
}

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase()
  if (!trimmed) return false
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) return false
  return true
}

function parseSegments(text: string): RichTextSegment[] {
  const segments: RichTextSegment[] = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index)
      if (plain) {
        segments.push({ content: plain })
      }
    }

    if (match[2] !== undefined) {
      segments.push({ content: match[2], bold: true })
    } else if (match[3] !== undefined) {
      segments.push({ content: match[3], italic: true })
    } else if (match[4] !== undefined) {
      segments.push({ content: match[4], code: true })
    } else if (match[5] !== undefined && match[6] !== undefined) {
      const linkText = match[5]
      const linkUrl = match[6]
      if (isSafeUrl(linkUrl)) {
        segments.push({ content: linkText, link: { url: linkUrl } })
      } else {
        segments.push({ content: linkText })
      }
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex)
    if (remaining) {
      segments.push({ content: remaining })
    }
  }

  return segments
}

function mergeAdjacent(segments: RichTextSegment[]): RichTextSegment[] {
  const merged: RichTextSegment[] = []
  for (const seg of segments) {
    const prev = merged[merged.length - 1]
    if (prev &&
      !prev.bold && !prev.italic && !prev.code && !prev.link &&
      !seg.bold && !seg.italic && !seg.code && !seg.link) {
      prev.content += seg.content
    } else {
      merged.push(seg)
    }
  }
  return merged
}

export function parseNotionRichText(content: string): NotionTextRequest[] {
  if (!content) return [{ type: 'text', text: { content: '' }, annotations: defaultAnnotations() }]

  const segments = mergeAdjacent(parseSegments(content))
  if (segments.length === 0) {
    return [{ type: 'text', text: { content: content }, annotations: defaultAnnotations() }]
  }

  const results: NotionTextRequest[] = []
  for (const seg of segments) {
    let remaining = seg.content
    while (remaining.length > 0) {
      const chunk = remaining.slice(0, MAX_TEXT_LENGTH)
      remaining = remaining.slice(MAX_TEXT_LENGTH)
      results.push({
        type: 'text',
        text: {
          content: chunk,
          link: seg.link ?? null,
        },
        annotations: defaultAnnotations(seg),
      })
    }
  }

  return results
}

export function richText(content: string): NotionTextRequest[] {
  return parseNotionRichText(content)
}
