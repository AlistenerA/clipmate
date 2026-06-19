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
    const asset = assetByUrl.get(url)
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
    window.addEventListener('scroll', this.renderSelectionBoxes, true)
    window.addEventListener('resize', this.renderSelectionBoxes)
    window.addEventListener('pagehide', this.handlePageLeave)
    window.addEventListener('popstate', this.handlePageLeave)
    window.addEventListener('hashchange', this.handlePageLeave)
    this.updateUi()
  }

  private handleMouseOver = (event: MouseEvent): void => {
    const candidate = this.findCandidate(event.target)
    if (!this.hoverBox || !candidate) {
      this.hoverBox?.setAttribute('hidden', '')
      return
    }
    this.positionBox(this.hoverBox, candidate.element)
    this.hoverBox.toggleAttribute('hidden', false)
  }

  private handleDocumentClick = (event: MouseEvent): void => {
    if (!this.state || this.state.status !== 'active') return
    if (this.host && event.composedPath().includes(this.host)) return
    const candidate = this.findCandidate(event.target)
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

  private findCandidate(target: EventTarget | null): PickerCandidate | undefined {
    if (!(target instanceof Element) || target === this.host) return undefined
    const media = target.closest('img, video[poster]')
    return media ? this.candidateByElement.get(media) : undefined
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
    window.removeEventListener('scroll', this.renderSelectionBoxes, true)
    window.removeEventListener('resize', this.renderSelectionBoxes)
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
  }
}

export const assetPickerController = new AssetPickerController()
