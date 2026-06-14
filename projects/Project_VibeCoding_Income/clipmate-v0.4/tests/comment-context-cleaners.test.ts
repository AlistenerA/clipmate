import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  cleanSourceText,
  isAuthorRelationLike,
  hasDateLeading,
  stripAuthorRelationPrefix,
  extractFirstTopicOrSentence,
  filterSourceMedia,
  isContainerCommentOnly,
} from '../src/content/commentSelection/commentContextCleaners'

// ===== cleanSourceText =====

describe('cleanSourceText', () => {
  it('removes 返回', () => {
    expect(cleanSourceText('返回 Real content')).toBe('Real content')
  })

  it('removes 公开', () => {
    expect(cleanSourceText('公开 Real content')).toBe('Real content')
  })

  it('removes 来自 pattern', () => {
    expect(cleanSourceText('来自 weibo.com Real content')).toBe('Real content')
  })

  it('removes 关注', () => {
    expect(cleanSourceText('关注 Real content')).toBe('Real content')
  })

  it('removes 转发/评论/点赞/分享 counts', () => {
    expect(cleanSourceText('转发 12 评论 3 点赞 25 分享 Real content')).toBe('Real content')
  })

  it('removes dates', () => {
    expect(cleanSourceText('2024-01-15 Real content')).toBe('Real content')
  })

  it('removes times', () => {
    expect(cleanSourceText('13:45 Real content')).toBe('Real content')
  })

  it('removes 与 xxx 的共创微博', () => {
    expect(cleanSourceText('作者A与作者B的共创微博 Real content')).toBe('Real content')
  })

  it('removes 粉丝', () => {
    expect(cleanSourceText('粉丝 123 Real content')).toBe('Real content')
  })

  it('removes 微博直播平台', () => {
    expect(cleanSourceText('微博直播平台 Real content')).toBe('Real content')
  })

  it('truncates to maxLength', () => {
    const result = cleanSourceText('Hello World This is a long text', 10)
    expect(result).toContain('…')
    expect(result.length).toBeLessThanOrEqual(13)
  })

  it('returns empty for empty input', () => {
    expect(cleanSourceText('')).toBe('')
  })

  it('preserves Chinese content', () => {
    const result = cleanSourceText('今天天气真好适合出去走走')
    expect(result).toBe('今天天气真好适合出去走走')
  })

  it('collapses multiple spaces', () => {
    expect(cleanSourceText('Hello   World')).toBe('Hello World')
  })
})

// ===== isAuthorRelationLike =====

describe('isAuthorRelationLike', () => {
  it('detects AuthorA和AuthorB的共创微博', () => {
    expect(isAuthorRelationLike('央视新闻和华为终端云服务的共创微博')).toBe(true)
  })

  it('detects A-B pattern', () => {
    expect(isAuthorRelationLike('作者A-作者B')).toBe(true)
  })

  it('rejects normal text', () => {
    expect(isAuthorRelationLike('今天天气真好')).toBe(false)
  })

  it('rejects empty', () => {
    expect(isAuthorRelationLike('')).toBe(false)
  })
})

// ===== hasDateLeading =====

describe('hasDateLeading', () => {
  it('detects date leading', () => {
    expect(hasDateLeading('2024-01-15 Real content')).toBe(true)
  })

  it('detects short date with time', () => {
    expect(hasDateLeading('06-14 13:45 Real content')).toBe(true)
  })

  it('rejects normal text', () => {
    expect(hasDateLeading('今天天气真好')).toBe(false)
  })
})

// ===== stripAuthorRelationPrefix =====

describe('stripAuthorRelationPrefix', () => {
  it('strips author relation prefix', () => {
    const result = stripAuthorRelationPrefix('央视新闻和华为终端云服务的共创微博 Real content')
    expect(result).toBe('Real content')
  })

  it('returns original if no match', () => {
    expect(stripAuthorRelationPrefix('今天天气真好')).toBe('今天天气真好')
  })
})

// ===== extractFirstTopicOrSentence =====

describe('extractFirstTopicOrSentence', () => {
  it('extracts topic with surrounding content', () => {
    const result = extractFirstTopicOrSentence('今天分享一个 #原来鸿蒙有这么多宝藏开发者# 很棒的活动')
    expect(result).toContain('#原来鸿蒙有这么多宝藏开发者#')
  })

  it('returns short text as-is', () => {
    const result = extractFirstTopicOrSentence('Hello World')
    expect(result).toBe('Hello World')
  })

  it('truncates long text', () => {
    const text = 'A'.repeat(300)
    const result = extractFirstTopicOrSentence(text, 100)
    expect(result).toContain('…')
    expect(result.length).toBeLessThanOrEqual(103)
  })

  it('returns empty for empty input', () => {
    expect(extractFirstTopicOrSentence('')).toBe('')
  })
})

// ===== filterSourceMedia =====

function makeImgElement(doc: Document, overrides: Record<string, string>): HTMLImageElement {
  const img = doc.createElement('img')
  if (overrides.src) img.src = overrides.src
  if (overrides.alt) img.alt = overrides.alt
  if (overrides.className) img.className = overrides.className
  if (overrides.width) img.setAttribute('width', overrides.width)
  if (overrides.height) img.setAttribute('height', overrides.height)
  return img
}

describe('filterSourceMedia weibo', () => {
  function makeDoc(): Document {
    return new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'https://weibo.com/test' }).window.document
  }

  it('keeps large sinaimg images', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: 'https://wx1.sinaimg.cn/large/fake.jpg', width: '600', height: '400' }),
    ]
    const result = filterSourceMedia(imgs, 'weibo')
    expect(result.length).toBe(1)
    expect(result[0].url).toContain('large')
  })

  it('keeps mw690 images', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: 'https://wx2.sinaimg.cn/mw690/fake.jpg', width: '690', height: '500' }),
    ]
    const result = filterSourceMedia(imgs, 'weibo')
    expect(result.length).toBe(1)
  })

  it('filters face.t.sinajs.cn emoji', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: 'https://face.t.sinajs.cn/fake-emoji.png', alt: '[太开心]', width: '64', height: '64' }),
      makeImgElement(doc, { src: 'https://wx1.sinaimg.cn/large/fake.jpg', width: '600', height: '400' }),
    ]
    const result = filterSourceMedia(imgs, 'weibo')
    expect(result.length).toBe(1)
    expect(result[0].url).toContain('large')
  })

  it('filters svip/member badges', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: 'https://h5.sinaimg.cn/upload/svip-badge.png', width: '40', height: '40' }),
      makeImgElement(doc, { src: 'https://h5.sinaimg.cn/upload/member-badge.png', width: '40', height: '40' }),
      makeImgElement(doc, { src: 'https://wx2.sinaimg.cn/mw690/fake.jpg', width: '690', height: '500' }),
    ]
    const result = filterSourceMedia(imgs, 'weibo')
    expect(result.length).toBe(1)
    expect(result[0].url).toContain('mw690')
  })

  it('filters tvax crop avatar images', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: 'https://tvax1.sinaimg.cn/crop.0.0.180.180/fake-avatar.jpg', width: '50', height: '50' }),
      makeImgElement(doc, { src: 'https://wx1.sinaimg.cn/large/fake.jpg', width: '600', height: '400' }),
    ]
    const result = filterSourceMedia(imgs, 'weibo')
    expect(result.length).toBe(1)
    expect(result[0].url).toContain('large')
  })

  it('filters a.sinaimg.cn/mintra icons', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: 'https://a.sinaimg.cn/mintra/fake-icon.png', width: '24', height: '24' }),
      makeImgElement(doc, { src: 'https://wx1.sinaimg.cn/large/fake.jpg', width: '600', height: '400' }),
    ]
    const result = filterSourceMedia(imgs, 'weibo')
    expect(result.length).toBe(1)
    expect(result[0].url).toContain('large')
  })

  it('filters emoji alt patterns', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: 'https://wx1.sinaimg.cn/emoji/fake.jpg', alt: '[太开心]', width: '64', height: '64', className: 'emoji' }),
      makeImgElement(doc, { src: 'https://wx2.sinaimg.cn/mw690/fake.jpg', width: '690', height: '500' }),
    ]
    const result = filterSourceMedia(imgs, 'weibo')
    expect(result.length).toBe(1)
    expect(result[0].url).toContain('mw690')
  })

  it('max 2 media items', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: 'https://wx1.sinaimg.cn/large/fake1.jpg', width: '600', height: '400' }),
      makeImgElement(doc, { src: 'https://wx2.sinaimg.cn/large/fake2.jpg', width: '600', height: '400' }),
      makeImgElement(doc, { src: 'https://wx3.sinaimg.cn/large/fake3.jpg', width: '600', height: '400' }),
    ]
    const result = filterSourceMedia(imgs, 'weibo')
    expect(result.length).toBe(2)
  })
})

describe('filterSourceMedia non-weibo', () => {
  function makeDoc(): Document {
    return new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'https://bilibili.com/video/123' }).window.document
  }

  it('bilibili does not apply weibo rules', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: 'https://i0.hdslb.com/bfs/archive/fake-cover.jpg', width: '400', height: '225' }),
    ]
    const result = filterSourceMedia(imgs, 'bilibili')
    expect(result.length).toBe(1)
  })

  it('filters avatar by class even for non-weibo', () => {
    const doc = makeDoc()
    const imgs = [
      makeImgElement(doc, { src: '/avatar.jpg', className: 'avatar', width: '32', height: '32' }),
      makeImgElement(doc, { src: '/photo.jpg', width: '400', height: '300' }),
    ]
    const result = filterSourceMedia(imgs, 'bilibili')
    expect(result.length).toBe(1)
    expect(result[0].url).toContain('photo.jpg')
  })
})

// ===== isContainerCommentOnly =====

describe('isContainerCommentOnly', () => {
  it('returns false for main/ article/ section', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><main class="comment-list"></main></body></html>')
    const mainEl = dom.window.document.querySelector('main')!
    expect(isContainerCommentOnly(mainEl)).toBe(false)

    const articleEl = dom.window.document.createElement('article')
    articleEl.className = 'comment-section'
    expect(isContainerCommentOnly(articleEl)).toBe(false)
  })

  it('returns true for div with comment in class', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div class="comment-list"></div></body></html>')
    const div = dom.window.document.querySelector('.comment-list')!
    expect(isContainerCommentOnly(div)).toBe(true)
  })
})
