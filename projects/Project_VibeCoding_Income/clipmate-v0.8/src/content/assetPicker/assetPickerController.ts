import { createFigureAssetsFromArticleImages, normalizeSelectedImages } from '../../features/assets'
import type { SelectedImageAsset } from '../../shared/types/clip.types'
import type {
  AssetPickerSessionState,
  StartAssetPickerPayload
} from '../../shared/types/message.types'
import { extractArticleImages, getBestSrc, resolveUrl } from '../extractors/articleImages'

const OVERLAY_HOST_ID = 'clipmate-asset-picker-overlay'
const MAX_CANDIDATES = 100

interface PickerCandidate {
  element: Element
  asset: SelectedImageAsset
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isMeaningfulArticleLogo(element: Element, url: string): boolean {
  if (!/logo/i.test(url)) return false
  if (!element.closest('article, main, [role="main"], .article-body, .article-content, #content')) {
    return false
  }
  if (/\b(?:avatar|profile|icon|favicon|badge|emoji|sprite|qr)\b/i.test(
    `${element.id} ${element.getAttribute('class') || ''}`
  )) {
    return false
  }
  const rect = element.getBoundingClientRect()
  return rect.width >= 80 && rect.height >= 80
}

function createManualLogoAsset(
  element: Element,
  url: string,
  index: number,
  pageUrl: string
): SelectedImageAsset {
  const width = Math.round(element.getBoundingClientRect().width)
  const height = Math.round(element.getBoundingClientRect().height)
  return normalizeSelectedImages([
    {
      id: '',
      url,
      alt: element.getAttribute('alt')?.trim() || undefined,
      title: element.getAttribute('title')?.trim() || undefined,
      width: width > 0 ? width : undefined,
      height: height > 0 ? height : undefined,
      sourceUrl: pageUrl,
      index,
      origin: element.closest('picture') ? 'picture' : 'img'
    }
  ])[0]
}

export function isElementVisibleForAssetPicker(element: Element): boolean {
  if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') return false

  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }

  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

export function collectAssetPickerCandidates(
  sourceDocument: Document = document
): PickerCandidate[] {
  const extraction = extractArticleImages(sourceDocument, {
    pageUrl: sourceDocument.URL,
    maxImages: MAX_CANDIDATES
  })
  const assets = createFigureAssetsFromArticleImages(extraction.images)
  const assetByUrl = new Map(assets.map((asset) => [asset.url, asset]))
  const seen = new Set<string>()
  const candidates: PickerCandidate[] = []

  sourceDocument.querySelectorAll('img, video[poster]').forEach((element) => {
    if (!isElementVisibleForAssetPicker(element)) return
    const rawUrl = getBestSrc(element)
    if (!rawUrl) return
    const url = resolveUrl(rawUrl, sourceDocument.URL)
    const asset = assetByUrl.get(url) || (
      isHttpUrl(url) && isMeaningfulArticleLogo(element, url)
        ? createManualLogoAsset(element, url, candidates.length, sourceDocument.URL)
        : undefined
    )
    if (!asset || seen.has(url) || asset.origin === 'markdown') return

    seen.add(url)
    candidates.push({
      element,
      asset: {
        id: asset.id,
        url: asset.url,
        alt: asset.alt,
        title: asset.title,
        caption: asset.caption,
        width: asset.width,
        height: asset.height,
        sourceUrl: asset.sourceUrl,
        index: candidates.length,
        origin: asset.origin
      }
    })
  })

  return candidates
}

export class AssetPickerController {
  private state: AssetPickerSessionState | null = null
  private candidates: PickerCandidate[] = []
  private candidateByElement = new Map<Element, PickerCandidate>()
  private selectedByUrl = new Map<string, SelectedImageAsset>()
  private host: HTMLElement | null = null
  private shadow: ShadowRoot | null = null
  private hoverBox: HTMLElement | null = null
  private selectionLayer: HTMLElement | null = null
  private counter: HTMLElement | null = null
  private hoveredCandidate: PickerCandidate | null = null
  private pointerPosition: { x: number; y: number } | null = null

  start(payload: StartAssetPickerPayload): AssetPickerSessionState | null {
    this.cleanupDom()
    this.candidateByElement.clear()
    this.selectedByUrl.clear()
    this.candidates = collectAssetPickerCandidates(document)
    if (this.candidates.length === 0) {
      this.state = null
      return null
    }

    const maxSelection = Math.max(1, Math.min(payload.maxSelection, 20))
    this.selectedByUrl = new Map(
      normalizeSelectedImages(payload.selectedImages || [], maxSelection).map((image) => [
        image.url,
        image
      ])
    )
    this.candidateByElement = new Map(
      this.candidates.map((candidate) => [candidate.element, candidate])
    )
    this.state = {
      sessionId: payload.sessionId,
      pageUrl: document.URL,
      status: 'active',
      selectedImages: this.getSelectedImages(),
      candidateCount: this.candidates.length,
      maxSelection
    }
    this.mountDom()
    return this.getState()
  }

  getState(): AssetPickerSessionState | null {
    if (!this.state) return null
    return {
      ...this.state,
      selectedImages: this.state.selectedImages.map((image) => ({ ...image }))
    }
  }

  cancel(sessionId?: string): boolean {
    if (!this.state || (sessionId && this.state.sessionId !== sessionId)) return false
    this.state = {
      ...this.state,
      status: 'cancelled',
      selectedImages: []
    }
    this.cleanupDom()
    return true
  }

  complete(): boolean {
    if (!this.state || this.state.status !== 'active') return false
    this.state = {
      ...this.state,
      status: 'completed',
      selectedImages: this.getSelectedImages()
    }
    this.cleanupDom()
    return true
  }

  consume(sessionId: string): boolean {
    if (!this.state || this.state.sessionId !== sessionId || this.state.status === 'active') {
      return false
    }
    this.state = null
    this.candidates = []
    this.candidateByElement.clear()
    this.selectedByUrl.clear()
    return true
  }

  private getSelectedImages(): SelectedImageAsset[] {
    return normalizeSelectedImages(
      Array.from(this.selectedByUrl.values()),
      this.state?.maxSelection || 20
    )
  }

  private mountDom(): void {
    const host = document.createElement('div')
    host.id = OVERLAY_HOST_ID
    host.style.position = 'fixed'
    host.style.inset = '0'
    host.style.zIndex = '2147483647'
    host.style.pointerEvents = 'none'
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = `
      <style>
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        #toolbar { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 10px; padding: 10px 12px; color: #fff; background: rgba(17, 24, 39, .96); border-radius: 10px; box-shadow: 0 8px 30px rgba(0, 0, 0, .28); pointer-events: auto; }
        #title { font-size: 13px; font-weight: 600; white-space: nowrap; }
        #count { min-width: 52px; color: #bfdbfe; font-size: 12px; white-space: nowrap; }
        button { border: 0; border-radius: 6px; padding: 6px 10px; font-size: 12px; cursor: pointer; }
        #done { color: #fff; background: #2563eb; }
        #cancel { color: #374151; background: #f3f4f6; }
        .box { position: fixed; border: 3px solid #2563eb; border-radius: 4px; pointer-events: none; }
        .selected { border-color: #16a34a; background: rgba(22, 163, 74, .08); }
        .badge { position: absolute; top: -12px; right: -12px; display: flex; width: 24px; height: 24px; align-items: center; justify-content: center; color: #fff; background: #16a34a; border: 2px solid #fff; border-radius: 999px; font-size: 11px; font-weight: 700; }
      </style>
      <div id="selection-layer"></div>
      <div id="hover" class="box" hidden></div>
      <div id="toolbar" role="dialog" aria-label="ClipMate image picker">
        <span id="title">点击图片加入剪藏</span>
        <span id="count"></span>
        <button id="done" type="button">完成</button>
        <button id="cancel" type="button">取消</button>
      </div>
    `
    document.documentElement.appendChild(host)

    this.host = host
    this.shadow = shadow
    this.hoverBox = shadow.querySelector('#hover')
    this.selectionLayer = shadow.querySelector('#selection-layer')
    this.counter = shadow.querySelector('#count')
    shadow.querySelector('#done')?.addEventListener('click', this.handleDone)
    shadow.querySelector('#cancel')?.addEventListener('click', this.handleCancel)
    document.addEventListener('mouseover', this.handleMouseOver, true)
    document.addEventListener('click', this.handleDocumentClick, true)
    document.addEventListener('keydown', this.handleKeyDown, true)
    window.addEventListener('scroll', this.handleViewportChange, true)
    window.addEventListener('resize', this.handleViewportChange)
    window.addEventListener('pagehide', this.handlePageLeave)
    window.addEventListener('popstate', this.handlePageLeave)
    window.addEventListener('hashchange', this.handlePageLeave)
    this.updateUi()
  }

  private handleMouseOver = (event: MouseEvent): void => {
    this.pointerPosition = { x: event.clientX, y: event.clientY }
    const candidate = this.findCandidate(event.target, event.clientX, event.clientY)
    if (!this.hoverBox || !candidate) {
      this.hoverBox?.setAttribute('hidden', '')
      this.hoveredCandidate = null
      return
    }
    this.hoveredCandidate = candidate
    this.positionBox(this.hoverBox, candidate.element)
    this.hoverBox.toggleAttribute('hidden', false)
  }

  private handleViewportChange = (): void => {
    this.renderSelectionBoxes()
    this.refreshHoverBox()
  }

  private refreshHoverBox(): void {
    if (!this.hoverBox || !this.hoveredCandidate || !this.pointerPosition) return
    const rect = this.hoveredCandidate.element.getBoundingClientRect()
    const { x, y } = this.pointerPosition
    const pointerStillInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    if (!pointerStillInside || !isElementVisibleForAssetPicker(this.hoveredCandidate.element)) {
      this.hoverBox.setAttribute('hidden', '')
      this.hoveredCandidate = null
      return
    }
    this.positionBox(this.hoverBox, this.hoveredCandidate.element)
  }

  private handleDocumentClick = (event: MouseEvent): void => {
    if (!this.state || this.state.status !== 'active') return
    if (this.host && event.composedPath().includes(this.host)) return
    const candidate = this.findCandidate(event.target, event.clientX, event.clientY)
    event.preventDefault()
    event.stopImmediatePropagation()
    if (!candidate) return

    if (this.selectedByUrl.has(candidate.asset.url)) {
      this.selectedByUrl.delete(candidate.asset.url)
    } else if (this.selectedByUrl.size < this.state.maxSelection) {
      this.selectedByUrl.set(candidate.asset.url, candidate.asset)
    }
    this.state = { ...this.state, selectedImages: this.getSelectedImages() }
    this.updateUi()
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.stopImmediatePropagation()
    this.cancel()
  }

  private handleDone = (event: Event): void => {
    event.preventDefault()
    event.stopPropagation()
    this.complete()
  }

  private handleCancel = (event: Event): void => {
    event.preventDefault()
    event.stopPropagation()
    this.cancel()
  }

  private handlePageLeave = (): void => {
    this.cancel()
  }

  private findCandidate(
    target: EventTarget | null,
    clientX?: number,
    clientY?: number
  ): PickerCandidate | undefined {
    if (!(target instanceof Element) || target === this.host) return undefined
    const media = target.closest('img, video[poster]')
    const direct = media ? this.candidateByElement.get(media) : undefined
    if (direct) return direct
    if (clientX == null || clientY == null) return undefined

    return this.candidates
      .filter((candidate) => {
        const rect = candidate.element.getBoundingClientRect()
        return clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom
      })
      .sort((left, right) => {
        const leftRect = left.element.getBoundingClientRect()
        const rightRect = right.element.getBoundingClientRect()
        return leftRect.width * leftRect.height - rightRect.width * rightRect.height
      })[0]
  }

  private updateUi(): void {
    if (!this.state) return
    if (this.counter) {
      this.counter.textContent = `${this.selectedByUrl.size}/${this.state.maxSelection}`
    }
    this.renderSelectionBoxes()
  }

  private renderSelectionBoxes = (): void => {
    if (!this.selectionLayer) return
    this.selectionLayer.replaceChildren()
    let order = 1
    for (const candidate of this.candidates) {
      if (!this.selectedByUrl.has(candidate.asset.url)) continue
      const box = document.createElement('div')
      box.className = 'box selected'
      const badge = document.createElement('span')
      badge.className = 'badge'
      badge.textContent = String(order++)
      box.appendChild(badge)
      this.positionBox(box, candidate.element)
      this.selectionLayer.appendChild(box)
    }
  }

  private positionBox(box: HTMLElement, element: Element): void {
    const rect = element.getBoundingClientRect()
    box.style.left = `${rect.left}px`
    box.style.top = `${rect.top}px`
    box.style.width = `${rect.width}px`
    box.style.height = `${rect.height}px`
  }

  private cleanupDom(): void {
    document.removeEventListener('mouseover', this.handleMouseOver, true)
    document.removeEventListener('click', this.handleDocumentClick, true)
    document.removeEventListener('keydown', this.handleKeyDown, true)
    window.removeEventListener('scroll', this.handleViewportChange, true)
    window.removeEventListener('resize', this.handleViewportChange)
    window.removeEventListener('pagehide', this.handlePageLeave)
    window.removeEventListener('popstate', this.handlePageLeave)
    window.removeEventListener('hashchange', this.handlePageLeave)
    this.shadow?.querySelector('#done')?.removeEventListener('click', this.handleDone)
    this.shadow?.querySelector('#cancel')?.removeEventListener('click', this.handleCancel)
    this.host?.remove()
    this.host = null
    this.shadow = null
    this.hoverBox = null
    this.selectionLayer = null
    this.counter = null
    this.hoveredCandidate = null
    this.pointerPosition = null
  }
}

export const assetPickerController = new AssetPickerController()
