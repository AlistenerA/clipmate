import type { ArticleImageCandidate } from '../../content/extractors/articleImages'

export type ClipAssetKind = 'image'

export type FigureAssetOrigin =
  | ArticleImageCandidate['origin']
  | 'markdown'

export interface ClipAsset {
  id: string
  kind: ClipAssetKind
  url: string
  sourceUrl?: string
  alt?: string
  title?: string
  caption?: string
  width?: number
  height?: number
  index: number
  origin: FigureAssetOrigin
}

export interface FigureAsset extends ClipAsset {
  kind: 'image'
  role: 'figure'
}

export type AssetTarget = 'notion' | 'markdown'

export type ImageSaveStrategyType =
  | 'notion-external'
  | 'notion-file-upload-external-import'
  | 'markdown-reference'
  | 'skip'

export type ImageSaveStrategyStatus = 'ready' | 'candidate' | 'blocked'

export type ImageAssetIssueReason =
  | 'empty_url'
  | 'data_uri'
  | 'blob_uri'
  | 'non_http_url'
  | 'notion_external_maybe_unsupported'
  | 'file_upload_external_import_not_enabled'

export interface ImageSaveStrategy {
  assetId: string
  type: ImageSaveStrategyType
  status: ImageSaveStrategyStatus
  reason?: ImageAssetIssueReason
  requiresPermissionReview: boolean
  requiresBinaryFetch: boolean
  notes: string[]
}

export interface AssetQualityIssue {
  assetId: string
  url: string
  severity: 'warning' | 'error'
  reason: ImageAssetIssueReason
  message: string
}

export interface ImageAssetQualityReport {
  total: number
  ready: number
  candidates: number
  blocked: number
  issues: AssetQualityIssue[]
  strategies: ImageSaveStrategy[]
}

export interface ImageSaveStrategyOptions {
  target?: AssetTarget
  fileUploadExternalImport?: 'off' | 'candidate'
}

const DEFAULT_OPTIONS: Required<ImageSaveStrategyOptions> = {
  target: 'notion',
  fileUploadExternalImport: 'off',
}

const MARKDOWN_IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g

const NON_DIRECT_IMAGE_HOST_PATTERNS = [
  /\/api\/auto\/resize\b/i,
  /\/api\/[^/]*\.(?:jpg|png|gif|webp)/i,
  /\/(?:resize|crop|thumbnail|thumb)\b/i,
  /[?&]img=(?:https?:\/\/|[^&]*\/)/i,
]

function createAssetId(index: number, url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0
  }
  return `img-${index}-${Math.abs(hash).toString(36)}`
}

function isDataUri(url: string): boolean {
  return url.trim().startsWith('data:')
}

function isBlobUri(url: string): boolean {
  return url.trim().startsWith('blob:')
}

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim())
}

export function isLikelyDirectExternalImageUrl(url: string): boolean {
  const path = (() => {
    try {
      const u = new URL(url)
      return u.pathname + u.search
    } catch {
      return url
    }
  })()

  return !NON_DIRECT_IMAGE_HOST_PATTERNS.some((pattern) => pattern.test(path))
}

export function createFigureAssetsFromArticleImages(
  images: ArticleImageCandidate[],
): FigureAsset[] {
  return images.map((image) => ({
    id: createAssetId(image.index, image.url),
    kind: 'image',
    role: 'figure',
    url: image.url,
    sourceUrl: image.sourceUrl,
    alt: image.alt,
    title: image.title,
    caption: image.caption,
    width: image.width,
    height: image.height,
    index: image.index,
    origin: image.origin,
  }))
}

export function createFigureAssetsFromMarkdown(
  markdown: string,
  sourceUrl?: string,
): FigureAsset[] {
  const assets: FigureAsset[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = MARKDOWN_IMAGE_RE.exec(markdown)) !== null) {
    const alt = match[1]?.trim() || undefined
    const url = match[2]?.trim() || ''
    if (!url || seen.has(url)) continue

    seen.add(url)
    assets.push({
      id: createAssetId(assets.length, url),
      kind: 'image',
      role: 'figure',
      url,
      sourceUrl,
      alt,
      caption: alt,
      index: assets.length,
      origin: 'markdown',
    })
  }

  return assets
}

export function chooseImageSaveStrategy(
  asset: FigureAsset,
  options: ImageSaveStrategyOptions = {},
): ImageSaveStrategy {
  const resolved = { ...DEFAULT_OPTIONS, ...options }
  const url = asset.url.trim()

  if (!url) {
    return blockedStrategy(asset.id, 'empty_url', 'Image asset has no URL.')
  }

  if (isDataUri(url)) {
    return blockedStrategy(asset.id, 'data_uri', 'Data URI images are not saved by default.')
  }

  if (isBlobUri(url)) {
    return blockedStrategy(asset.id, 'blob_uri', 'Blob URL images cannot be restored outside the source page.')
  }

  if (!isHttpUrl(url)) {
    return blockedStrategy(asset.id, 'non_http_url', 'Only http/https image URLs are saveable in this pipeline.')
  }

  if (resolved.target === 'markdown') {
    return {
      assetId: asset.id,
      type: 'markdown-reference',
      status: 'ready',
      requiresPermissionReview: false,
      requiresBinaryFetch: false,
      notes: ['Keep the original external URL in Markdown output.'],
    }
  }

  if (isLikelyDirectExternalImageUrl(url)) {
    return {
      assetId: asset.id,
      type: 'notion-external',
      status: 'ready',
      requiresPermissionReview: false,
      requiresBinaryFetch: false,
      notes: ['Use Notion external image block with the original URL.'],
    }
  }

  if (resolved.fileUploadExternalImport === 'candidate') {
    return {
      assetId: asset.id,
      type: 'notion-file-upload-external-import',
      status: 'candidate',
      reason: 'file_upload_external_import_not_enabled',
      requiresPermissionReview: true,
      requiresBinaryFetch: false,
      notes: [
        'Candidate for official Notion File Upload external import.',
        'Do not enable by default until API, privacy, quota, and permission behavior are reviewed.',
      ],
    }
  }

  return blockedStrategy(
    asset.id,
    'notion_external_maybe_unsupported',
    'URL looks like a proxy/resize endpoint and may not render as a Notion external image.',
  )
}

export function createImageAssetQualityReport(
  assets: FigureAsset[],
  options: ImageSaveStrategyOptions = {},
): ImageAssetQualityReport {
  const strategies = assets.map((asset) => chooseImageSaveStrategy(asset, options))
  const issues = assets.flatMap((asset, index) => {
    const strategy = strategies[index]
    if (strategy.status === 'ready') return []

    return [{
      assetId: asset.id,
      url: asset.url,
      severity: strategy.status === 'candidate' ? 'warning' as const : 'error' as const,
      reason: strategy.reason ?? 'notion_external_maybe_unsupported',
      message: strategy.notes.join(' '),
    }]
  })

  return {
    total: assets.length,
    ready: strategies.filter((strategy) => strategy.status === 'ready').length,
    candidates: strategies.filter((strategy) => strategy.status === 'candidate').length,
    blocked: strategies.filter((strategy) => strategy.status === 'blocked').length,
    issues,
    strategies,
  }
}

function blockedStrategy(
  assetId: string,
  reason: ImageAssetIssueReason,
  note: string,
): ImageSaveStrategy {
  return {
    assetId,
    type: 'skip',
    status: 'blocked',
    reason,
    requiresPermissionReview: false,
    requiresBinaryFetch: false,
    notes: [note],
  }
}
