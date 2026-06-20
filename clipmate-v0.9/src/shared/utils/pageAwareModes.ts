import type { ClipMode, PageAwareness } from '../types/clip.types'
import type { PageType, PageTypeDetectionResult } from './pageTypeDetector'

export interface PageModeRecommendationInput {
  pageType: PageType
  confidence: number
  selectionPresent: boolean
  hasCodeBlock: boolean
  technicalConfidence?: number
}

const MODE_ORDER: ClipMode[] = ['fullpage', 'selection', 'tutorial']

export function isClipMode(value: unknown): value is ClipMode {
  return MODE_ORDER.includes(value as ClipMode)
}

export interface InitialPageModeInput {
  awareness?: PageAwareness
  currentMode: ClipMode
  alreadyHandled: boolean
  userSelected: boolean
}

export function resolveInitialPageMode(input: InitialPageModeInput): ClipMode | undefined {
  const recommended = input.awareness?.recommendedMode
  if (
    input.alreadyHandled ||
    input.userSelected ||
    !input.awareness?.autoApply ||
    !isClipMode(recommended) ||
    recommended === input.currentMode
  ) {
    return undefined
  }
  return recommended
}

function uniqueModes(...modes: Array<ClipMode | false>): ClipMode[] {
  return modes.filter((mode, index, values): mode is ClipMode =>
    Boolean(mode) && values.indexOf(mode) === index
  )
}

export function recommendPageModes(input: PageModeRecommendationInput): PageAwareness {
  const base = {
    pageType: input.pageType,
    confidence: input.confidence,
    selectionPresent: input.selectionPresent
  }

  switch (input.pageType) {
    case 'video':
      return {
        ...base,
        recommendedMode: 'tutorial',
        primaryModes: uniqueModes('tutorial', input.selectionPresent && 'selection', 'fullpage'),
        autoApply: input.confidence >= 0.6 && !input.selectionPresent,
        reason: '识别到视频页，优先收藏标题、简介和视频链接。'
      }
    case 'ai-answer':
      return {
        ...base,
        recommendedMode: input.selectionPresent ? 'selection' : 'tutorial',
        primaryModes: uniqueModes(
          input.selectionPresent ? 'selection' : 'tutorial',
          input.selectionPresent ? 'tutorial' : 'fullpage'
        ),
        autoApply: input.confidence >= 0.65 && !input.selectionPresent,
        reason: input.selectionPresent
          ? '检测到当前选区，优先保留这段回答。'
          : '识别到对话式页面，结构化模式更适合保留代码和层级。'
      }
    case 'forum-or-comment':
      return {
        ...base,
        recommendedMode: input.selectionPresent ? 'selection' : 'fullpage',
        primaryModes: uniqueModes(
          input.selectionPresent ? 'selection' : 'fullpage',
          input.selectionPresent ? 'fullpage' : 'selection'
        ),
        autoApply: false,
        reason: input.selectionPresent
          ? '检测到讨论页选区，优先剪藏评论上下文。'
          : '识别到讨论页；如需保存评论，请先在页面选中文字后重新打开。'
      }
    case 'search-results':
    case 'navigation':
      return {
        ...base,
        recommendedMode: input.selectionPresent ? 'selection' : 'fullpage',
        primaryModes: uniqueModes(
          input.selectionPresent ? 'selection' : 'fullpage',
          input.selectionPresent && 'fullpage'
        ),
        autoApply: false,
        reason: input.selectionPresent
          ? '当前页面偏导航，优先保存已选择的内容。'
          : '当前页面偏导航，全文模式将生成精简页面摘要。'
      }
    case 'article':
      if (input.hasCodeBlock) {
        return {
          ...base,
          recommendedMode: 'tutorial',
          primaryModes: uniqueModes('tutorial', 'fullpage', input.selectionPresent && 'selection'),
          autoApply: (input.technicalConfidence ?? 0) >= 0.75 && !input.selectionPresent,
          reason: '检测到技术内容和代码块，教程模式更利于保留结构。'
        }
      }
      return {
        ...base,
        recommendedMode: input.selectionPresent ? 'selection' : 'fullpage',
        primaryModes: uniqueModes(
          input.selectionPresent ? 'selection' : 'fullpage',
          input.selectionPresent ? 'fullpage' : 'tutorial'
        ),
        autoApply: false,
        reason: input.selectionPresent
          ? '检测到文章选区，优先保存所选段落。'
          : '识别到文章页，全文模式最适合保留正文。'
      }
    default:
      return {
        ...base,
        recommendedMode: input.selectionPresent ? 'selection' : 'fullpage',
        primaryModes: uniqueModes(
          input.selectionPresent ? 'selection' : 'fullpage',
          input.selectionPresent && 'fullpage'
        ),
        autoApply: false,
        reason: input.selectionPresent
          ? '页面类型不明确，优先保存当前选区。'
          : '页面类型不明确，使用全文模式稳定降级。'
      }
  }
}

export function buildPageAwareness(
  detection: PageTypeDetectionResult,
  selectionPresent: boolean
): PageAwareness {
  const technicalConfidence = getTechnicalConfidence(detection)
  const recommendation = recommendPageModes({
    pageType: detection.type,
    confidence: detection.confidence,
    selectionPresent,
    hasCodeBlock: detection.signals.hasCodeBlock,
    technicalConfidence,
  })
  const characteristics: NonNullable<PageAwareness['characteristics']> = (detection.candidates || [])
    .filter((candidate) => candidate.confidence >= 0.35)
    .map((candidate) => ({ type: candidate.type, confidence: candidate.confidence }))
  if (technicalConfidence > 0) {
    characteristics.push({ type: 'technical', confidence: technicalConfidence })
  }
  return {
    ...recommendation,
    characteristics,
    modeFamily: getModeFamily(recommendation.recommendedMode, recommendation),
  }
}

function getTechnicalConfidence(detection: PageTypeDetectionResult): number {
  const count = detection.signals.technicalCodeBlockCount ??
    (detection.signals.hasCodeBlock ? 1 : 0)
  if (count === 0) return 0

  const domain = detection.signals.domain.toLowerCase()
  const knownTechnicalDomain = [
    'runoob.com', 'developer.mozilla.org', 'docs.microsoft.com',
    'learn.microsoft.com', 'cnblogs.com', 'csdn.net',
  ].some((candidate) => domain === candidate || domain.endsWith(`.${candidate}`))
  const title = detection.signals.title.toLowerCase()
  const titleSignal = /tutorial|教程|文档|开发|编程|typescript|javascript|python|代码/.test(title)

  let confidence = count >= 2 ? 0.6 : 0.35
  if (knownTechnicalDomain) confidence += 0.25
  if (titleSignal) confidence += 0.15
  return Math.min(Math.round(confidence * 100) / 100, 1)
}

export function getModeLabel(mode: ClipMode, awareness?: PageAwareness): string {
  if (mode === 'tutorial' && awareness?.pageType === 'video') return '视频收藏'
  if (mode === 'tutorial' && awareness?.pageType === 'ai-answer') return '结构化'
  if (mode === 'selection' && awareness?.pageType === 'forum-or-comment') return '评论选区'
  if (
    mode === 'fullpage' &&
    (awareness?.pageType === 'search-results' || awareness?.pageType === 'navigation')
  ) {
    return '页面摘要'
  }
  if (mode === 'fullpage') return '全文'
  if (mode === 'selection') return '选区'
  return '教程'
}

export function getPageTypeLabel(pageType: PageType): string {
  const labels: Record<PageType, string> = {
    article: '文章页',
    'search-results': '搜索页',
    navigation: '导航页',
    'forum-or-comment': '讨论页',
    video: '视频页',
    'ai-answer': 'AI 对话',
    unknown: '普通页面'
  }
  return labels[pageType] || labels.unknown
}

export function getModeFamilyLabel(mode: ClipMode, awareness?: PageAwareness): string {
  return getModeFamily(mode, awareness) === 'selection'
    ? '选区'
    : getModeFamily(mode, awareness) === 'adaptive'
      ? '自适应'
      : '全文'
}

export function getModeFamily(
  mode: ClipMode,
  awareness?: PageAwareness,
): 'fullpage' | 'selection' | 'adaptive' {
  if (mode === 'selection') return 'selection'
  if (mode === 'tutorial') return 'adaptive'
  if (awareness?.pageType === 'search-results' || awareness?.pageType === 'navigation') {
    return 'adaptive'
  }
  return 'fullpage'
}

export function getAllClipModes(): ClipMode[] {
  return [...MODE_ORDER]
}
