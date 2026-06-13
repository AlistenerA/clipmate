import { describe, it, expect } from 'vitest'
import {
  getMarkdownProfile,
  listMarkdownProfiles,
  normalizeMarkdownTarget,
  ALL_TARGETS,
} from '../src/shared/markdown/profiles'
import { formatMarkdownWithProfile } from '../src/shared/markdown/formatWithProfile'
import type { MarkdownTarget, MarkdownProfile } from '../src/shared/types/clip.types'

describe('Markdown profiles', () => {
  describe('listMarkdownProfiles', () => {
    it('returns 4 profiles', () => {
      const profiles = listMarkdownProfiles()
      expect(profiles).toHaveLength(4)
    })

    it('all profiles have unique targets', () => {
      const profiles = listMarkdownProfiles()
      const targets = profiles.map((p) => p.target)
      expect(new Set(targets).size).toBe(4)
    })

    it('all profiles have a label and description', () => {
      const profiles = listMarkdownProfiles()
      for (const p of profiles) {
        expect(p.label).toBeTruthy()
        expect(p.description).toBeTruthy()
      }
    })

    it('profile order is notion, obsidian, typora, generic', () => {
      const profiles = listMarkdownProfiles()
      expect(profiles[0].target).toBe('notion')
      expect(profiles[1].target).toBe('obsidian')
      expect(profiles[2].target).toBe('typora')
      expect(profiles[3].target).toBe('generic')
    })
  })

  describe('getMarkdownProfile', () => {
    it('returns notion profile', () => {
      const profile = getMarkdownProfile('notion')
      expect(profile.target).toBe('notion')
      expect(profile.frontmatter).toBe(false)
      expect(profile.label).toBe('Notion')
    })

    it('returns obsidian profile', () => {
      const profile = getMarkdownProfile('obsidian')
      expect(profile.target).toBe('obsidian')
      expect(profile.frontmatter).toBe(true)
      expect(profile.tagStyle).toBe('yaml')
    })

    it('returns typora profile', () => {
      const profile = getMarkdownProfile('typora')
      expect(profile.target).toBe('typora')
      expect(profile.frontmatter).toBe(false)
      expect(profile.sourceStyle).toBe('markdown-link')
    })

    it('returns generic profile', () => {
      const profile = getMarkdownProfile('generic')
      expect(profile.target).toBe('generic')
      expect(profile.frontmatter).toBe(false)
    })

    it('returns valid profile for each target', () => {
      for (const target of ALL_TARGETS) {
        const profile = getMarkdownProfile(target)
        expect(profile).toBeDefined()
        expect(profile.target).toBe(target)
        expect(typeof profile.frontmatter).toBe('boolean')
      }
    })
  })

  describe('normalizeMarkdownTarget', () => {
    it('returns notion for undefined', () => {
      expect(normalizeMarkdownTarget(undefined)).toBe('notion')
    })

    it('returns notion for null', () => {
      expect(normalizeMarkdownTarget(null)).toBe('notion')
    })

    it('returns notion for empty string', () => {
      expect(normalizeMarkdownTarget('')).toBe('notion')
    })

    it('returns notion for invalid value', () => {
      expect(normalizeMarkdownTarget('invalid')).toBe('notion')
      expect(normalizeMarkdownTarget('gibberish')).toBe('notion')
    })

    it('passes through valid targets', () => {
      expect(normalizeMarkdownTarget('notion')).toBe('notion')
      expect(normalizeMarkdownTarget('obsidian')).toBe('obsidian')
      expect(normalizeMarkdownTarget('typora')).toBe('typora')
      expect(normalizeMarkdownTarget('generic')).toBe('generic')
    })
  })
})

describe('formatMarkdownWithProfile', () => {
  const testInput = {
    title: '测试文章',
    url: 'https://example.com/article',
    tags: ['技术', '笔记'],
    note: '这是一条备注',
    bodyMarkdown: '这是正文内容',
    createdAt: '2026-06-12T10:00:00.000Z',
  }

  const emptyInput = {
    title: '',
    url: '',
    tags: [] as string[],
    note: '',
    bodyMarkdown: '',
  }

  describe('Notion profile', () => {
    it('does not contain YAML frontmatter', () => {
      const result = formatMarkdownWithProfile(testInput, 'notion')
      expect(result).not.toMatch(/^---/)
    })

    it('includes title as H1', () => {
      const result = formatMarkdownWithProfile(testInput, 'notion')
      expect(result).toContain('# 测试文章')
    })

    it('includes source URL with Chinese label', () => {
      const result = formatMarkdownWithProfile(testInput, 'notion')
      expect(result).toContain('来源：https://example.com/article')
    })

    it('includes tags with hashtag prefix', () => {
      const result = formatMarkdownWithProfile(testInput, 'notion')
      expect(result).toContain('标签：#技术 #笔记')
    })

    it('includes note as blockquote', () => {
      const result = formatMarkdownWithProfile(testInput, 'notion')
      expect(result).toContain('> 这是一条备注')
    })

    it('includes body after divider', () => {
      const result = formatMarkdownWithProfile(testInput, 'notion')
      expect(result).toContain('---')
      expect(result).toContain('这是正文内容')
    })

    it('handles empty input gracefully', () => {
      const result = formatMarkdownWithProfile(emptyInput, 'notion')
      expect(result).not.toContain('# ')
      expect(result).not.toContain('来源：')
      expect(result).not.toContain('标签：')
    })
  })

  describe('Obsidian profile', () => {
    it('contains YAML frontmatter', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      expect(result).toMatch(/^---/)
    })

    it('includes title in frontmatter', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      expect(result).toMatch(/title:.*测试文章/)
    })

    it('includes source in frontmatter', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      expect(result).toMatch(/source:.*example\.com/)
    })

    it('includes created date in frontmatter', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      expect(result).toMatch(/created:.*2026-06-12/)
    })

    it('includes tags as YAML array in frontmatter', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      expect(result).toMatch(/tags:.*\[/)
      expect(result).toContain('技术')
      expect(result).toContain('笔记')
    })

    it('does not duplicate tags in body', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      const bodyPart = result.split('---').slice(2).join('---')
      expect(bodyPart).not.toContain('标签：')
    })

    it('does not duplicate source in body', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      const bodyPart = result.split('---').slice(2).join('---')
      expect(bodyPart).not.toContain('来源：https://example.com')
    })

    it('includes title as H1 after frontmatter', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      const afterFrontmatter = result.replace(/^---[\s\S]*?---\n\n?/, '')
      expect(afterFrontmatter).toContain('# 测试文章')
    })

    it('includes note as blockquote', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      expect(result).toContain('> 这是一条备注')
    })

    it('includes body content', () => {
      const result = formatMarkdownWithProfile(testInput, 'obsidian')
      expect(result).toContain('这是正文内容')
    })

    it('handles empty tags in frontmatter', () => {
      const noTags = { ...testInput, tags: [] }
      const result = formatMarkdownWithProfile(noTags, 'obsidian')
      expect(result).not.toMatch(/tags:/)
    })

    it('escapes special characters in YAML values', () => {
      const specialInput = {
        ...testInput,
        title: 'Title with "quotes"',
        tags: ['tag:with:colons'],
      }
      const result = formatMarkdownWithProfile(specialInput, 'obsidian')
      expect(result).toMatch(/title:.*"Title with \\"quotes\\""/)
    })

    it('generates createdAt when not provided', () => {
      const noDate = { ...testInput }
      delete (noDate as Partial<typeof testInput>).createdAt
      const result = formatMarkdownWithProfile(noDate, 'obsidian')
      const dateMatch = result.match(/created:\s*(\S+)/)
      expect(dateMatch).toBeTruthy()
      const dateValue = dateMatch![1].replace(/"/g, '')
      expect(new Date(dateValue).getTime()).toBeGreaterThan(0)
    })
  })

  describe('Typora profile', () => {
    it('does not contain YAML frontmatter', () => {
      const result = formatMarkdownWithProfile(testInput, 'typora')
      expect(result).not.toMatch(/^---/)
    })

    it('includes title as H1', () => {
      const result = formatMarkdownWithProfile(testInput, 'typora')
      expect(result).toContain('# 测试文章')
    })

    it('includes source as markdown link', () => {
      const result = formatMarkdownWithProfile(testInput, 'typora')
      expect(result).toContain('[来源](https://example.com/article)')
    })

    it('includes tags with hashtag prefix', () => {
      const result = formatMarkdownWithProfile(testInput, 'typora')
      expect(result).toContain('标签：#技术 #笔记')
    })

    it('includes note as blockquote', () => {
      const result = formatMarkdownWithProfile(testInput, 'typora')
      expect(result).toContain('> 这是一条备注')
    })

    it('includes body after divider', () => {
      const result = formatMarkdownWithProfile(testInput, 'typora')
      expect(result).toContain('这是正文内容')
    })

    it('handles empty URL gracefully', () => {
      const noUrl = { ...testInput, url: '' }
      const result = formatMarkdownWithProfile(noUrl, 'typora')
      expect(result).not.toContain('[来源]')
    })
  })

  describe('Generic profile', () => {
    it('does not contain YAML frontmatter', () => {
      const result = formatMarkdownWithProfile(testInput, 'generic')
      expect(result).not.toMatch(/^---/)
    })

    it('includes title as H1', () => {
      const result = formatMarkdownWithProfile(testInput, 'generic')
      expect(result).toContain('# 测试文章')
    })

    it('includes source URL with plain label', () => {
      const result = formatMarkdownWithProfile(testInput, 'generic')
      expect(result).toContain('来源：https://example.com/article')
    })

    it('includes tags with hashtag prefix', () => {
      const result = formatMarkdownWithProfile(testInput, 'generic')
      expect(result).toContain('标签：#技术 #笔记')
    })

    it('includes note as blockquote', () => {
      const result = formatMarkdownWithProfile(testInput, 'generic')
      expect(result).toContain('> 这是一条备注')
    })

    it('includes body after divider', () => {
      const result = formatMarkdownWithProfile(testInput, 'generic')
      expect(result).toContain('这是正文内容')
    })
  })

  describe('edge cases', () => {
    it('handles tags with special characters', () => {
      const input = { ...testInput, tags: ['vue.js', 'react-native'] }
      const result = formatMarkdownWithProfile(input, 'notion')
      expect(result).toContain('#vue.js')
      expect(result).toContain('#react-native')
    })

    it('handles empty tags array', () => {
      const input = { ...testInput, tags: [] }
      const result = formatMarkdownWithProfile(input, 'notion')
      expect(result).not.toContain('标签：')
    })

    it('handles blank note', () => {
      const input = { ...testInput, note: '   ' }
      const result = formatMarkdownWithProfile(input, 'notion')
      expect(result).not.toContain('>')
    })

    it('handles empty body markdown', () => {
      const input = { ...testInput, bodyMarkdown: '' }
      const result = formatMarkdownWithProfile(input, 'notion')
      expect(result).toContain('---')
    })

    it('handles empty title', () => {
      const input = { ...testInput, title: '' }
      const result = formatMarkdownWithProfile(input, 'notion')
      expect(result).not.toContain('# ')
      expect(result).toContain('来源：')
    })

    it('cleanMarkdown is applied to body', () => {
      const input = { ...testInput, bodyMarkdown: '**a****b**' }
      const result = formatMarkdownWithProfile(input, 'notion')
      expect(result).toContain('**ab**')
      expect(result).not.toContain('**a****b**')
    })

    it('Notion profile output matches legacy formatCopyMarkdown structure', () => {
      const result = formatMarkdownWithProfile(testInput, 'notion')
      const idxTitle = result.indexOf('# 测试文章')
      const idxSource = result.indexOf('来源：')
      const idxTags = result.indexOf('标签：')
      const idxNote = result.indexOf('> 这是一条备注')
      const idxDivider = result.indexOf('---')
      const idxBody = result.indexOf('这是正文内容')
      expect(idxTitle).toBeLessThan(idxSource)
      expect(idxSource).toBeLessThan(idxTags)
      expect(idxTags).toBeLessThan(idxNote)
      expect(idxNote).toBeLessThan(idxDivider)
      expect(idxDivider).toBeLessThan(idxBody)
    })

    it('all four targets include title and body', () => {
      for (const target of ALL_TARGETS) {
        const result = formatMarkdownWithProfile(testInput, target)
        expect(result).toContain('测试文章')
        expect(result).toContain('这是正文内容')
      }
    })

    it('all four targets include note when present', () => {
      for (const target of ALL_TARGETS) {
        const result = formatMarkdownWithProfile(testInput, target)
        expect(result).toContain('这是一条备注')
      }
    })
  })

  describe('profile properties', () => {
    it('all profiles have required fields (notion)', () => {
      const p: MarkdownProfile = getMarkdownProfile('notion')
      expect(p.target).toBeDefined()
      expect(p.label).toBeDefined()
      expect(p.description).toBeDefined()
      expect(typeof p.frontmatter).toBe('boolean')
      expect(['hashtag', 'yaml']).toContain(p.tagStyle)
      expect(['plain-label', 'markdown-link', 'frontmatter']).toContain(p.sourceStyle)
    })

    it('all profiles have placeholder fields for future sessions', () => {
      for (const target of ALL_TARGETS) {
        const p = getMarkdownProfile(target)
        expect(['standard', 'preserve']).toContain(p.imageStyle)
        expect(['standard', 'preserve']).toContain(p.tableStyle)
        expect(p.formulaStyle).toBe('preserve-text')
        expect(['standard', 'preserve-language']).toContain(p.codeBlockStyle)
      }
    })
  })

  describe('selection excerpt hint', () => {
    const hintText = '网页选区摘录'

    it('includes hint for selection mode with notion profile', () => {
      const input = { ...testInput, mode: 'selection' as const }
      const result = formatMarkdownWithProfile(input, 'notion')
      expect(result).toContain(hintText)
      expect(result).toContain('并非全文')
    })

    it('does not include hint for fullpage mode', () => {
      const input = { ...testInput, mode: 'fullpage' as const }
      const result = formatMarkdownWithProfile(input, 'notion')
      expect(result).not.toContain(hintText)
    })

    it('includes hint for all four profiles in selection mode', () => {
      for (const target of ALL_TARGETS) {
        const input = { ...testInput, mode: 'selection' as const }
        const result = formatMarkdownWithProfile(input, target)
        expect(result).toContain('并非全文')
      }
    })
  })
})
