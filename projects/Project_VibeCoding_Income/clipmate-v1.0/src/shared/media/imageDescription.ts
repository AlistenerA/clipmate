const PLACEHOLDER_PATTERNS = [
  /^(?:在这里|请在此|此处)?插入(?:图片|图像)(?:描述|说明|题注|注释)?(?:文字)?$/i,
  /^(?:图片|图像)(?:描述|说明|题注|注释)$/i,
  /^(?:insert|enter|add)\s+(?:an?\s+)?image\s+(?:description|caption|alt(?:ernative)?\s+text)(?:\s+here)?$/i,
]

export function normalizeImageDescription(value?: string | null): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim()
  if (!normalized) return undefined
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized))
    ? undefined
    : normalized
}
