const VIDEO_PAGE_PATTERNS = [
  /(?:^|\.)bilibili\.com$/i,
  /(?:^|\.)youtube\.com$/i,
  /^youtu\.be$/i,
  /(?:^|\.)vimeo\.com$/i,
  /(?:^|\.)youku\.com$/i,
  /(?:^|\.)v\.qq\.com$/i,
]

export function getVideoProvider(rawUrl: string): string | undefined {
  try {
    const hostname = new URL(rawUrl).hostname.replace(/^www\./, '')
    if (hostname === 'bilibili.com' || hostname.endsWith('.bilibili.com')) return 'Bilibili'
    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be') {
      return 'YouTube'
    }
    if (hostname === 'vimeo.com' || hostname.endsWith('.vimeo.com')) return 'Vimeo'
    if (hostname === 'youku.com' || hostname.endsWith('.youku.com')) return 'Youku'
    if (hostname === 'v.qq.com') return 'Tencent Video'
    return undefined
  } catch {
    return undefined
  }
}

export function isKnownVideoUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl)
    return VIDEO_PAGE_PATTERNS.some((pattern) => pattern.test(url.hostname))
  } catch {
    return false
  }
}

export function isVideoPageUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl)
    const hostname = url.hostname.replace(/^www\./, '')
    const path = url.pathname
    if (hostname === 'bilibili.com' || hostname.endsWith('.bilibili.com')) {
      return /^\/video\//i.test(path)
    }
    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
      return (path === '/watch' && url.searchParams.has('v')) ||
        /^\/(?:shorts|live)\//i.test(path)
    }
    if (hostname === 'youtu.be') return path.length > 1
    if (hostname === 'vimeo.com') return /^\/\d+/i.test(path)
    if (hostname.endsWith('.vimeo.com')) return /^\/video\/\d+/i.test(path)
    if (hostname === 'youku.com' || hostname.endsWith('.youku.com')) {
      return /^\/v_show\//i.test(path)
    }
    if (hostname === 'v.qq.com') return /^\/x\/cover\//i.test(path)
    return false
  } catch {
    return false
  }
}

export function isNotionEmbeddableVideoUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    if (/\.(?:mp4|mov|webm|ogg)(?:$|[?#])/i.test(url.pathname + url.search)) return true
    const provider = getVideoProvider(url.toString())
    return provider === 'YouTube' || provider === 'Vimeo'
  } catch {
    return false
  }
}
