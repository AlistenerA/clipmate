import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import {
  MAX_SOCIAL_POST_COMMENTS,
  detectSocialPostPlatform,
  extractSupportedSocialPost,
  extractSocialPostSnapshot,
} from '../src/content/socialPost'

function makeDocument(html: string, url: string): Document {
  return new JSDOM(html, { url }).window.document
}

function xiaohongshuComment(index: number): string {
  return `
    <div class="parent-comment">
      <div class="comment-item" id="comment-${index}">
        <div class="comment-inner-container">
          <div class="right">
            <div class="author-wrapper"><div class="author"><a class="name" href="/user/${index}">用户 ${index}</a></div></div>
            <div class="content"><span class="note-text">评论 ${index}</span></div>
            <div class="info"><div class="date"><span>06-${String(index).padStart(2, '0')}</span><span class="location">测试地</span></div></div>
          </div>
        </div>
      </div>
    </div>`
}

function tiebaComment(index: number, nested = false): string {
  return `
    <div class="pb-comment-item" data-id="floor-${index}">
      <div class="head-line user-info"><a class="head-name" href="/home/main?id=${index}">层主 ${index}</a></div>
      <div class="comment-content">
        <div class="pb-rich-text"><div class="pb-content-item"><span class="pb-text-wrapper text">楼层回复 ${index}</span></div></div>
        <div class="pc-pb-comments-desc"><div class="comment-desc-left">第 ${index} 楼 10:00</div></div>
      </div>
      ${nested ? `
        <div class="lzl-wrapper">
          <div class="pb-lzl-item" data-id="nested-${index}">
            <div class="head-line user-info"><a class="head-name" href="/home/main?nested=${index}">楼中楼用户</a></div>
            <div class="comment-content">
              <div class="pb-rich-text"><div class="pb-content-item">楼中楼回复</div></div>
              <div class="pc-pb-comments-desc"><div class="comment-desc-left">10:01</div></div>
            </div>
          </div>
        </div>` : ''}
    </div>`
}

describe('v1.0.2 social post extraction', () => {
  it('extracts Xiaohongshu note body, ordered carousel images and nested comments', () => {
    const doc = makeDocument(`
      <div id="noteContainer" class="note-container">
        <div class="author-container"><div class="author-wrapper"><a class="name" href="/user/author"><span class="username">笔记作者</span></a></div></div>
        <div class="media-container">
          <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="1"><img src="https://sns-webpic-qc.xhscdn.com/note/second.jpg"></div>
          <div class="swiper-slide" data-swiper-slide-index="0"><img src="https://sns-webpic-qc.xhscdn.com/note/first.jpg"></div>
          <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="0"><img src="https://sns-webpic-qc.xhscdn.com/note/first.jpg"></div>
        </div>
        <div class="note-content">
          <div id="detail-title">周末 [散步]</div>
          <div id="detail-desc"><span class="note-text">今天去了公园。</span><a class="tag" href="/search_result?keyword=公园">#公园</a></div>
          <div class="bottom-container"><span class="date">06-21</span></div>
        </div>
        <div class="comments-container">
          <div class="parent-comment">
            <div class="comment-item" id="comment-main">
              <div class="comment-inner-container"><div class="right">
                <div class="author-wrapper"><div class="author"><a class="name" href="/user/main">主评论用户</a></div></div>
                <div class="content"><span class="note-text">主评论正文</span></div>
                <div class="info"><div class="date"><span>06-21</span><span class="location">上海</span></div></div>
              </div></div>
            </div>
            <div class="reply-container">
              <div class="comment-item" id="comment-reply">
                <div class="comment-inner-container"><div class="right">
                  <div class="author-wrapper"><div class="author"><a class="name" href="/user/reply">回复用户</a></div></div>
                  <div class="content"><span class="note-text">嵌套回复正文</span></div>
                  <div class="info"><div class="date"><span>06-22</span></div></div>
                </div></div>
              </div>
            </div>
          </div>
        </div>
      </div>`, 'https://www.xiaohongshu.com/explore/note123?xsec_token=private-token')

    const result = extractSocialPostSnapshot(doc)

    expect(result?.platform).toBe('xiaohongshu')
    expect(result?.title).toBe('周末 [散步]')
    expect(result?.author).toBe('笔记作者')
    expect(result?.bodyText).toContain('今天去了公园。#公园')
    expect(result?.canonicalUrl).toBe('https://www.xiaohongshu.com/explore/note123')
    expect(result?.images.map((image) => image.url)).toEqual([
      'https://sns-webpic-qc.xhscdn.com/note/first.jpg',
      'https://sns-webpic-qc.xhscdn.com/note/second.jpg',
    ])
    expect(result?.comments.map((comment) => comment.depth)).toEqual([0, 1])
    expect(result?.markdown).toContain('主评论正文')
    expect(result?.markdown).toContain('嵌套回复正文')
    expect(result?.markdown).not.toContain('/user/')
    expect(result?.markdown).not.toContain('/search_result')
    expect(result?.markdown).not.toContain('private-token')
    expect(result?.contentHtml).not.toMatch(/<a(?:\s|>)/)
  })

  it('hard-limits Xiaohongshu comments to 50', () => {
    const comments = Array.from({ length: 55 }, (_, index) => xiaohongshuComment(index + 1)).join('')
    const doc = makeDocument(`
      <div id="noteContainer">
        <div id="detail-title">评论很多的笔记</div>
        <div id="detail-desc">正文</div>
        <div class="comments-container">${comments}</div>
      </div>`, 'https://www.xiaohongshu.com/explore/many-comments')

    const result = extractSocialPostSnapshot(doc)

    expect(result?.comments).toHaveLength(MAX_SOCIAL_POST_COMMENTS)
    expect(result?.markdown).toContain('评论 50')
    expect(result?.markdown).not.toContain('评论 51')
  })

  it('collects virtualized comments after scrolling and restores the original position', async () => {
    const doc = makeDocument(`
      <div id="noteContainer">
        <div id="detail-title">虚拟评论笔记</div>
        <div id="detail-desc">正文</div>
        <div class="note-scroller">
          <div class="comments-container">${xiaohongshuComment(1)}</div>
        </div>
      </div>`, 'https://www.xiaohongshu.com/explore/virtual-comments')
    const scroller = doc.querySelector('.note-scroller') as HTMLElement
    Object.defineProperty(scroller, 'clientHeight', { value: 100 })
    Object.defineProperty(scroller, 'scrollHeight', { value: 800 })
    scroller.scrollTop = 25
    scroller.addEventListener('scroll', () => {
      if (scroller.scrollTop < 600 || doc.querySelector('#comment-2')) return
      doc.querySelector('.comments-container')?.insertAdjacentHTML(
        'beforeend',
        xiaohongshuComment(2),
      )
    })

    const result = await extractSupportedSocialPost(doc, {
      maxComments: 2,
      wait: async () => undefined,
    })

    expect(result?.comments.map((comment) => comment.key)).toEqual(['comment-1', 'comment-2'])
    expect(scroller.scrollTop).toBe(25)
  })

  it('extracts Tieba first-floor content, images, floor replies and nested replies', () => {
    const doc = makeDocument(`
      <div class="image-text">
        <div class="head-line user-info"><a class="head-name" href="/home/main?id=author">楼主</a><div class="desc-info">1楼 06-21</div></div>
        <div class="pc-pb-title"><span class="pb-title">测试主题</span></div>
        <div class="pb-content-wrap"><div class="richtext-item">
          <div class="pb-content-item"><span class="pb-text-wrapper text"><a href="https://example.com/unrelated">首楼正文</a></span></div>
          <div class="image-card-wrapper"><img data-src="https://tiebapic.baidu.com/forum/pic/item/body.jpg"></div>
        </div></div>
        <div class="pc-pb-reply-list">${tiebaComment(2, true)}</div>
      </div>`, 'https://tieba.baidu.com/p/123456?fr=personalize_page')

    const result = extractSocialPostSnapshot(doc)

    expect(result?.platform).toBe('tieba')
    expect(result?.title).toBe('测试主题')
    expect(result?.author).toBe('楼主')
    expect(result?.bodyText).toBe('首楼正文')
    expect(result?.canonicalUrl).toBe('https://tieba.baidu.com/p/123456')
    expect(result?.images[0]?.url).toBe('https://tiebapic.baidu.com/forum/pic/item/body.jpg')
    expect(result?.comments).toHaveLength(2)
    expect(result?.comments[0]?.depth).toBe(0)
    expect(result?.comments[1]?.depth).toBe(1)
    expect(result?.markdown).toContain('楼层回复 2')
    expect(result?.markdown).toContain('楼中楼回复')
    expect(result?.markdown).not.toContain('example.com/unrelated')
    expect(result?.markdown).not.toContain('/home/main')
    expect(result?.contentHtml).not.toMatch(/<a(?:\s|>)/)
  })

  it('hard-limits Tieba floor and nested replies to 50 total', () => {
    const comments = Array.from({ length: 60 }, (_, index) => tiebaComment(index + 2)).join('')
    const doc = makeDocument(`
      <div class="image-text">
        <div class="pc-pb-title"><span class="pb-title">长讨论主题</span></div>
        <div class="pb-content-wrap"><div class="richtext-item"><div class="pb-content-item">正文</div></div></div>
        <div class="pc-pb-reply-list">${comments}</div>
      </div>`, 'https://tieba.baidu.com/p/999999')

    const result = extractSocialPostSnapshot(doc)

    expect(result?.comments).toHaveLength(MAX_SOCIAL_POST_COMMENTS)
    expect(result?.markdown).toContain('楼层回复 51')
    expect(result?.markdown).not.toContain('楼层回复 52')
  })

  it('ignores unsupported and non-detail routes', () => {
    expect(detectSocialPostPlatform('https://www.xiaohongshu.com/explore')).toBeNull()
    expect(detectSocialPostPlatform('https://tieba.baidu.com/')).toBeNull()
    expect(detectSocialPostPlatform('https://example.com/post/1')).toBeNull()
  })
})
