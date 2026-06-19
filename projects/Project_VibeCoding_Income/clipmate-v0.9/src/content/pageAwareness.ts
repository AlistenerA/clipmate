import type { PageAwareness } from '../shared/types/clip.types'
import { buildPageAwareness } from '../shared/utils/pageAwareModes'
import { detectPageTypeFromDocument } from '../shared/utils/pageTypeDetector'

export function detectPageAwareness(
  document: Document,
  selectionPresent: boolean
): PageAwareness {
  return buildPageAwareness(detectPageTypeFromDocument(document), selectionPresent)
}
