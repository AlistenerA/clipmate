import { describe, it, expect } from 'vitest'
import {
  normalizeHostname,
  hostnameMatchesDomain,
  matchSiteProfile,
  listSiteProfiles,
} from '../src/shared/siteProfiles/siteProfileEngine'
import { SEED_PROFILES } from '../src/shared/siteProfiles/seedProfiles'
import type { SiteProfile, SiteProfileCategory } from '../src/shared/siteProfiles/siteProfile.types'

describe('normalizeHostname', () => {
  it('extracts hostname from full URL', () => {
    expect(normalizeHostname('https://www.google.com/search?q=test')).toBe('www.google.com')
  })

  it('extracts hostname from http URL', () => {
    expect(normalizeHostname('http://example.com/path')).toBe('example.com')
  })

  it('returns hostname as-is when given bare hostname', () => {
    expect(normalizeHostname('google.com')).toBe('google.com')
  })

  it('handles hostname with leading slash', () => {
    expect(normalizeHostname('/example.com')).toBe('example.com')
  })

  it('extracts hostname from URL with path (no protocol)', () => {
    expect(normalizeHostname('example.com/search')).toBe('example.com')
  })

  it('returns lowercase hostname', () => {
    expect(normalizeHostname('https://WWW.Example.COM')).toBe('www.example.com')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeHostname('')).toBe('')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeHostname('   ')).toBe('')
  })

  it('returns empty string for invalid URL with protocol', () => {
    expect(normalizeHostname('://')).toBe('')
  })

  it('handles hostname with port', () => {
    expect(normalizeHostname('localhost:3000/path')).toBe('localhost:3000')
  })
})

describe('hostnameMatchesDomain', () => {
  it('matches exact domain', () => {
    expect(hostnameMatchesDomain('google.com', 'google.com')).toBe(true)
  })

  it('matches www subdomain', () => {
    expect(hostnameMatchesDomain('www.google.com', 'google.com')).toBe(true)
  })

  it('matches deeper subdomain', () => {
    expect(hostnameMatchesDomain('mail.google.com', 'google.com')).toBe(true)
  })

  it('matches with case difference', () => {
    expect(hostnameMatchesDomain('WWW.GOOGLE.COM', 'google.com')).toBe(true)
  })

  it('does not match evil variant ending with same suffix', () => {
    expect(hostnameMatchesDomain('evilgoogle.com', 'google.com')).toBe(false)
  })

  it('does not match completely different domain', () => {
    expect(hostnameMatchesDomain('facebook.com', 'google.com')).toBe(false)
  })

  it('returns false for empty hostname', () => {
    expect(hostnameMatchesDomain('', 'google.com')).toBe(false)
  })

  it('returns false for empty domain', () => {
    expect(hostnameMatchesDomain('google.com', '')).toBe(false)
  })

  it('matches sub-subdomain', () => {
    expect(hostnameMatchesDomain('api.v2.example.com', 'example.com')).toBe(true)
  })

  it('does not match when domain is substring but not proper subdomain', () => {
    expect(hostnameMatchesDomain('notgoogle.com', 'google.com')).toBe(false)
  })
})

describe('matchSiteProfile', () => {
  describe('search profiles', () => {
    it('matches google.com/search to google-search', () => {
      const result = matchSiteProfile({ url: 'https://www.google.com/search?q=hello' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('google-search')
    })

    it('matches bing.com/search to bing-search', () => {
      const result = matchSiteProfile({ url: 'https://www.bing.com/search?q=test' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('bing-search')
    })

    it('matches baidu.com/s?wd=xxx to baidu-search', () => {
      const result = matchSiteProfile({ url: 'https://www.baidu.com/s?wd=hello' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('baidu-search')
    })
  })

  describe('video profiles', () => {
    it('matches youtube.com/watch to youtube-video', () => {
      const result = matchSiteProfile({ url: 'https://www.youtube.com/watch?v=abc123' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('youtube-video')
    })

    it('matches youtu.be to youtube-video', () => {
      const result = matchSiteProfile({ url: 'https://youtu.be/abc123' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('youtube-video')
    })

    it('matches bilibili.com/video/BVxxx to bilibili-video', () => {
      const result = matchSiteProfile({ url: 'https://www.bilibili.com/video/BV1xx' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('bilibili-video')
    })

    it('matches iqiyi.com to iqiyi-video', () => {
      const result = matchSiteProfile({ url: 'https://www.iqiyi.com/v_abc.html' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('iqiyi-video')
    })

    it('matches youku.com to youku-video', () => {
      const result = matchSiteProfile({ url: 'https://v.youku.com/v_show/id_abc.html' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('youku-video')
    })

    it('matches v.qq.com to tencent-video', () => {
      const result = matchSiteProfile({ url: 'https://v.qq.com/x/cover/abc.html' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('tencent-video')
    })
  })

  describe('short-video profiles', () => {
    it('matches tiktok.com/@user/video/xxx to tiktok-short-video', () => {
      const result = matchSiteProfile({ url: 'https://www.tiktok.com/@user/video/12345' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('tiktok-short-video')
    })

    it('matches douyin.com/video/xxx to douyin-short-video', () => {
      const result = matchSiteProfile({ url: 'https://www.douyin.com/video/12345' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('douyin-short-video')
    })

    it('matches kuaishou.com to kuaishou-short-video', () => {
      const result = matchSiteProfile({ url: 'https://www.kuaishou.com/short-video/abc' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('kuaishou-short-video')
    })
  })

  describe('social and community profiles', () => {
    it('matches xiaohongshu.com/explore/xxx to xiaohongshu-social', () => {
      const result = matchSiteProfile({ url: 'https://www.xiaohongshu.com/explore/abc123' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('xiaohongshu-social')
    })

    it('matches zhihu.com/question/xxx to zhihu-community', () => {
      const result = matchSiteProfile({ url: 'https://www.zhihu.com/question/12345' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('zhihu-community')
    })

    it('matches reddit.com/r/subreddit to reddit-community', () => {
      const result = matchSiteProfile({ url: 'https://www.reddit.com/r/programming/comments/abc/' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('reddit-community')
    })

    it('matches weibo.com to weibo-social', () => {
      const result = matchSiteProfile({ url: 'https://weibo.com/12345/abcdef' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('weibo-social')
    })
  })

  describe('ai-chat profiles', () => {
    it('matches chatgpt.com/c/xxx to chatgpt-ai-chat', () => {
      const result = matchSiteProfile({ url: 'https://chatgpt.com/c/abc-123' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('chatgpt-ai-chat')
    })

    it('matches claude.ai to claude-ai-chat', () => {
      const result = matchSiteProfile({ url: 'https://claude.ai/chat/abc' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('claude-ai-chat')
    })

    it('matches gemini.google.com to gemini-ai-chat', () => {
      const result = matchSiteProfile({ url: 'https://gemini.google.com/app/abc' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('gemini-ai-chat')
    })

    it('matches copilot.microsoft.com to copilot-ai-chat', () => {
      const result = matchSiteProfile({ url: 'https://copilot.microsoft.com/chats/abc' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('copilot-ai-chat')
    })
  })

  describe('unknown domain', () => {
    it('returns null for unknown domain', () => {
      const result = matchSiteProfile({ url: 'https://some-random-website.com/page' })
      expect(result).toBeNull()
    })

    it('returns null for empty URL', () => {
      const result = matchSiteProfile({ url: '' })
      expect(result).toBeNull()
    })
  })

  describe('confidence and pageType matching', () => {
    it('returns higher confidence when pageType matches profile', () => {
      const withType = matchSiteProfile({ url: 'https://www.google.com/search?q=test', pageType: 'search-results' })
      const withoutType = matchSiteProfile({ url: 'https://www.google.com/search?q=test' })
      expect(withType).not.toBeNull()
      expect(withoutType).not.toBeNull()
      expect(withType!.confidence).toBeGreaterThan(withoutType!.confidence)
    })

    it('includes pageType in matchedPageType', () => {
      const result = matchSiteProfile({ url: 'https://youtube.com/watch?v=abc', pageType: 'video' })
      expect(result).not.toBeNull()
      expect(result!.matchedPageType).toBe('video')
    })

    it('confidence is always between 0 and 1', () => {
      const result = matchSiteProfile({ url: 'https://www.google.com/search?q=test', pageType: 'search-results' })
      expect(result).not.toBeNull()
      expect(result!.confidence).toBeGreaterThanOrEqual(0)
      expect(result!.confidence).toBeLessThanOrEqual(1)
    })

    it('pageType mismatch does not prevent domain match', () => {
      const result = matchSiteProfile({ url: 'https://www.google.com/search?q=test', pageType: 'video' })
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('google-search')
    })
  })

  describe('reasons', () => {
    it('reasons are short sanitized strings', () => {
      const result = matchSiteProfile({ url: 'https://www.google.com/search?q=test', pageType: 'search-results' })
      expect(result).not.toBeNull()
      for (const reason of result!.reasons) {
        expect(typeof reason).toBe('string')
        expect(reason.length).toBeLessThan(200)
      }
    })

    it('reasons do not contain full URLs or paths', () => {
      const result = matchSiteProfile({ url: 'https://www.google.com/search?q=hello+world', pageType: 'search-results' })
      expect(result).not.toBeNull()
      for (const reason of result!.reasons) {
        expect(reason).not.toContain('https://www.google.com/search?q=hello+world')
      }
    })

    it('includes domain match reason', () => {
      const result = matchSiteProfile({ url: 'https://google.com/search' })
      expect(result).not.toBeNull()
      expect(result!.reasons.some((r) => r.includes('domain'))).toBe(true)
    })
  })

  describe('custom profiles', () => {
    it('accepts custom profiles array', () => {
      const customProfiles: SiteProfile[] = [
        {
          id: 'my-site',
          label: 'My Site',
          category: 'search',
          domains: ['my-site.com'],
          pageTypes: ['search-results'],
          priority: 10,
        },
      ]
      const result = matchSiteProfile({ url: 'https://my-site.com/page' }, customProfiles)
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('my-site')
    })

    it('custom profiles do not leak to default SEED_PROFILES', () => {
      const customProfiles: SiteProfile[] = [
        {
          id: 'custom-only',
          label: 'Custom Only',
          category: 'search',
          domains: ['custom-only.com'],
          pageTypes: ['search-results'],
          priority: 10,
        },
      ]
      const resultWithCustom = matchSiteProfile({ url: 'https://custom-only.com' }, customProfiles)
      expect(resultWithCustom).not.toBeNull()

      const resultWithoutCustom = matchSiteProfile({ url: 'https://custom-only.com' })
      expect(resultWithoutCustom).toBeNull()
    })
  })

  describe('priority tie-breaking', () => {
    it('chooses higher priority profile when confidences are equal', () => {
      const profiles: SiteProfile[] = [
        {
          id: 'low-priority',
          label: 'Low',
          category: 'search',
          domains: ['shared-domain.com'],
          pageTypes: [],
          priority: 5,
        },
        {
          id: 'high-priority',
          label: 'High',
          category: 'search',
          domains: ['shared-domain.com'],
          pageTypes: [],
          priority: 20,
        },
      ]
      const result = matchSiteProfile({ url: 'https://shared-domain.com/page' }, profiles)
      expect(result).not.toBeNull()
      expect(result!.profile.id).toBe('high-priority')
    })
  })
})

describe('listSiteProfiles', () => {
  it('returns a copy of SEED_PROFILES', () => {
    const result = listSiteProfiles()
    expect(result).toEqual(SEED_PROFILES)
    expect(result).not.toBe(SEED_PROFILES as SiteProfile[])
  })

  it('mutating returned array does not affect SEED_PROFILES', () => {
    const result = listSiteProfiles()
    const originalLength = SEED_PROFILES.length
    result.push({
      id: 'intruder',
      label: 'Intruder',
      category: 'search',
      domains: ['intruder.com'],
      pageTypes: [],
      priority: 0,
    })
    expect(SEED_PROFILES.length).toBe(originalLength)
  })

  it('accepts custom profiles and returns copy', () => {
    const custom: SiteProfile[] = [
      {
        id: 'custom',
        label: 'Custom',
        category: 'search',
        domains: ['custom.com'],
        pageTypes: [],
        priority: 5,
      },
    ]
    const result = listSiteProfiles(custom)
    expect(result).toEqual(custom)
    expect(result).not.toBe(custom)
  })
})

describe('matchSiteProfile on baidu non-search', () => {
  it('matches baidu.com homepage as baidu-search by domain', () => {
    const result = matchSiteProfile({ url: 'https://www.baidu.com/' })
    expect(result).not.toBeNull()
    expect(result!.profile.id).toBe('baidu-search')
  })
})

describe('matchSiteProfile with pageType signals', () => {
  it('baidu-search with search-results pageType has full confidence', () => {
    const result = matchSiteProfile({
      url: 'https://www.baidu.com/s?wd=hello',
      pageType: 'search-results',
    })
    expect(result).not.toBeNull()
    expect(result!.confidence).toBeGreaterThanOrEqual(0.9)
  })

  it('youtube-video with video pageType has full confidence', () => {
    const result = matchSiteProfile({
      url: 'https://www.youtube.com/watch?v=abc',
      pageType: 'video',
    })
    expect(result).not.toBeNull()
    expect(result!.confidence).toBeGreaterThanOrEqual(0.9)
  })

  it('chatgpt-ai-chat with ai-answer pageType has full confidence', () => {
    const result = matchSiteProfile({
      url: 'https://chatgpt.com/c/abc',
      pageType: 'ai-answer',
    })
    expect(result).not.toBeNull()
    expect(result!.confidence).toBeGreaterThanOrEqual(0.9)
  })
})

describe('seed profiles count', () => {
  it('has at least 19 seed profiles', () => {
    expect(SEED_PROFILES.length).toBeGreaterThanOrEqual(19)
  })

  it('all seed profiles have required fields', () => {
    for (const profile of SEED_PROFILES) {
      expect(profile.id).toBeTruthy()
      expect(profile.label).toBeTruthy()
      expect(profile.category).toBeTruthy()
      expect(profile.domains.length).toBeGreaterThan(0)
      expect(profile.pageTypes.length).toBeGreaterThan(0)
      expect(typeof profile.priority).toBe('number')
    }
  })

  it('all seed profile ids are unique', () => {
    const ids = SEED_PROFILES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('seed profiles structural QA', () => {
  const VALID_CATEGORIES: SiteProfileCategory[] = [
    'search', 'video', 'short-video', 'social', 'community', 'ai-chat',
  ]

  it('all seed profiles have a selectorHints object', () => {
    for (const profile of SEED_PROFILES) {
      expect(
        profile.selectorHints,
        `${profile.id}: missing selectorHints`,
      ).toBeDefined()
      expect(
        typeof profile.selectorHints,
        `${profile.id}: selectorHints must be object`,
      ).toBe('object')
      expect(
        Object.keys(profile.selectorHints!).length,
        `${profile.id}: selectorHints must have at least 1 key`,
      ).toBeGreaterThanOrEqual(1)
    }
  })

  it('all seed profiles have a valid category', () => {
    for (const profile of SEED_PROFILES) {
      expect(
        VALID_CATEGORIES.includes(profile.category),
        `${profile.id}: invalid category "${profile.category}"`,
      ).toBe(true)
    }
  })

  it('search profiles have searchResultCard selector', () => {
    for (const profile of SEED_PROFILES) {
      if (profile.category === 'search') {
        expect(
          profile.selectorHints?.searchResultCard,
          `${profile.id}: search profile missing searchResultCard`,
        ).toBeTruthy()
      }
    }
  })

  it('video and short-video profiles have videoPlayer selector', () => {
    for (const profile of SEED_PROFILES) {
      if (profile.category === 'video' || profile.category === 'short-video') {
        expect(
          profile.selectorHints?.videoPlayer,
          `${profile.id}: video profile missing videoPlayer`,
        ).toBeTruthy()
      }
    }
  })

  it('social and community profiles have contentContainer or commentContainer', () => {
    for (const profile of SEED_PROFILES) {
      if (profile.category === 'social' || profile.category === 'community') {
        const hasContent = !!profile.selectorHints?.contentContainer
        const hasComment = !!profile.selectorHints?.commentContainer
        expect(
          hasContent || hasComment,
          `${profile.id}: social/community profile missing contentContainer and commentContainer`,
        ).toBe(true)
      }
    }
  })

  it('ai-chat profiles have contentContainer selector', () => {
    for (const profile of SEED_PROFILES) {
      if (profile.category === 'ai-chat') {
        expect(
          profile.selectorHints?.contentContainer,
          `${profile.id}: ai-chat profile missing contentContainer`,
        ).toBeTruthy()
      }
    }
  })

  it('seedProfiles.ts does not contain real tokens, API keys, or page IDs', () => {
    const src = JSON.stringify(SEED_PROFILES)
    const sensitivePatterns = [
      /ntn_/,
      /secret_/,
      /Bearer\s+/,
      /api[_-]?key/i,
      /passw(or)?d/i,
    ]
    for (const pattern of sensitivePatterns) {
      expect(
        src,
        `seedProfiles contains sensitive pattern: ${pattern}`,
      ).not.toMatch(pattern)
    }
  })

  it('counts exactly 19 seed profiles', () => {
    expect(SEED_PROFILES.length).toBe(19)
  })

  it('bilibili-video profile has danmu excludeSelector', () => {
    const bilibili = SEED_PROFILES.find((p) => p.id === 'bilibili-video')
    expect(bilibili).toBeDefined()
    expect(bilibili!.selectorHints?.excludeSelector).toBeDefined()
    const excludeSel = bilibili!.selectorHints!.excludeSelector!
    expect(excludeSel).toContain('danmaku')
    expect(excludeSel).toContain('danmu')
  })
})
