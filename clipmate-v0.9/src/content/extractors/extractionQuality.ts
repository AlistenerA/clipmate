export interface ExtractionCandidate {
  id: 'legacy' | 'conservative' | 'site-container'
  content: string
  textContent: string
}

export interface ExtractionQuality {
  textLength: number
  headingCount: number
  codeCount: number
  tableCount: number
  listCount: number
  imageCount: number
  linkDensity: number
}

function countMatches(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length ?? 0
}

export function assessExtractionQuality(candidate: ExtractionCandidate): ExtractionQuality {
  const html = candidate.content
  const textLength = candidate.textContent.trim().length
  const linkText = Array.from(html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi))
    .reduce((total, match) => total + match[1].replace(/<[^>]+>/g, '').trim().length, 0)

  return {
    textLength,
    headingCount: countMatches(html, /<h[1-6]\b/gi),
    codeCount: countMatches(html, /<(?:pre|code)\b/gi),
    tableCount: countMatches(html, /<table\b/gi),
    listCount: countMatches(html, /<(?:ul|ol)\b/gi),
    imageCount: countMatches(html, /<img\b/gi),
    linkDensity: textLength > 0 ? Math.min(linkText / textLength, 1) : 0,
  }
}

function protectedStructure(quality: ExtractionQuality): number[] {
  return [
    quality.headingCount,
    quality.codeCount,
    quality.tableCount,
    quality.listCount,
    quality.imageCount,
  ]
}

function canReplaceLegacy(
  legacy: ExtractionQuality,
  candidate: ExtractionQuality,
  candidateId: ExtractionCandidate['id'],
): boolean {
  if (candidate.textLength < legacy.textLength * 0.9) return false
  if (legacy.textLength > 0 && candidate.textLength > legacy.textLength * 1.5) return false
  if (candidate.linkDensity > Math.max(0.55, legacy.linkDensity + 0.1)) return false

  const legacyStructure = protectedStructure(legacy)
  const candidateStructure = protectedStructure(candidate)
  if (candidateStructure.some((count, index) => count < legacyStructure[index])) return false

  const structureGain = candidateStructure.reduce(
    (gain, count, index) => gain + Math.max(0, count - legacyStructure[index]),
    0,
  )
  const textGain = candidate.textLength >= legacy.textLength * 1.05
  return structureGain > 0 || (candidateId === 'site-container' && textGain)
}

function qualityScore(quality: ExtractionQuality): number {
  const structureScore = quality.headingCount * 40 + quality.codeCount * 70 +
    quality.tableCount * 90 + quality.listCount * 30 + quality.imageCount * 35
  return quality.textLength + structureScore - Math.round(quality.linkDensity * quality.textLength)
}

export function selectBestExtractionCandidate(
  candidates: ExtractionCandidate[],
): ExtractionCandidate | null {
  if (candidates.length === 0) return null
  const legacy = candidates.find((candidate) => candidate.id === 'legacy') || candidates[0]
  const legacyQuality = assessExtractionQuality(legacy)
  let best = legacy
  let bestScore = qualityScore(legacyQuality)

  for (const candidate of candidates) {
    if (candidate === legacy) continue
    const quality = assessExtractionQuality(candidate)
    if (!canReplaceLegacy(legacyQuality, quality, candidate.id)) continue
    const score = qualityScore(quality)
    if (score > bestScore) {
      best = candidate
      bestScore = score
    }
  }

  return best
}
