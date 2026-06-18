import { describe, it, expect } from 'vitest'
import {
  countWords,
  snippet,
  cleanMarkdown,
  formatCopyMarkdown,
} from '../src/shared/utils/formatMarkdown'
import { ClipMateError, ErrorCodes } from '../src/shared/utils/errors'
import { MESSAGE_TYPES } from '../src/shared/constants/messageTypes'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../src/shared/constants/defaults'

describe('formatMarkdown', () => {
  describe('countWords', () => {
    it('counts words in plain text', () => {
      expect(countWords('hello world')).toBe(2)
    })

    it('returns 0 for empty string', () => {
      expect(countWords('')).toBe(0)
    })

    it('returns 0 for whitespace only', () => {
      expect(countWords('   ')).toBe(0)
    })

    it('handles multiple spaces', () => {
      expect(countWords('hello   world')).toBe(2)
    })

    it('counts CJK characters individually without spaces', () => {
      expect(countWords('你好世界')).toBe(4)
    })

    it('counts CJK with spaces as characters', () => {
      expect(countWords('你好 世界')).toBe(4)
    })

    it('counts mixed CJK and English correctly', () => {
      expect(countWords('你好 world 你好')).toBe(5)
    })

    it('counts pure Chinese selection text', () => {
      expect(countWords('这是一段测试内容')).toBe(8)
    })

    it('counts CJK with punctuation', () => {
      expect(countWords('你好，世界！')).toBe(6)
    })

    it('handles English-only text with whitespace splitting', () => {
      expect(countWords('The quick brown fox')).toBe(4)
    })
  })

  describe('cleanMarkdown', () => {
    it('returns empty string for empty input', () => {
      expect(cleanMarkdown('')).toBe('')
    })

    it('merges adjacent bold segments: **A****B** -> **AB**', () => {
      expect(cleanMarkdown('**米团生活：从****\u201C心零售\u201D到信任生态**')).toBe(
        '**米团生活：从\u201C心零售\u201D到信任生态**',
      )
    })

    it('merges adjacent bold with Chinese quotes (example 2)', () => {
      expect(cleanMarkdown('**战略落地：****\u201C央信码\u201C全面接入米团生态**')).toBe(
        '**战略落地：\u201C央信码\u201C全面接入米团生态**',
      )
    })

    it('merges adjacent bold: **从**** -> **从 (example 3)', () => {
      expect(cleanMarkdown('**从****\u201C流量狂欢\u201D到\u201C信任回归\u201D**')).toBe(
        '**从\u201C流量狂欢\u201D到\u201C信任回归\u201D**',
      )
    })

    it('merges multiple adjacent bolds: **A****B****C** -> **ABC**', () => {
      expect(cleanMarkdown('**A****B****C**')).toBe('**ABC**')
    })

    it('merges **a******b** (6-star edge case, HTML pre-merge handles full fix)', () => {
      expect(cleanMarkdown('**a******b**')).toBe('**a**b**')
    })

    it('does NOT merge bolds separated by space: **A** **B**', () => {
      expect(cleanMarkdown('**A** **B**')).toBe('**A** **B**')
    })

    it('preserves normal bold text', () => {
      expect(cleanMarkdown('**正常粗体**')).toBe('**正常粗体**')
    })

    it('preserves normal text without bold', () => {
      expect(cleanMarkdown('普通文本')).toBe('普通文本')
    })

    it('removes empty bold marker lines', () => {
      expect(cleanMarkdown('** **')).toBe('')
    })
  })

  describe('formatCopyMarkdown', () => {
    it('includes title, URL, tags, note and body', () => {
      const result = formatCopyMarkdown(
        '测试文章',
        'https://example.com',
        ['技术', '笔记'],
        '这是备注',
        '正文内容',
      )
      expect(result).toContain('# 测试文章')
      expect(result).toContain('来源：https://example.com')
      expect(result).toContain('标签：#技术 #笔记')
      expect(result).toContain('> 这是备注')
      expect(result).toContain('---')
      expect(result).toContain('正文内容')
    })

    it('omits title section when title is empty', () => {
      const result = formatCopyMarkdown('', 'https://example.com', [], '', 'body')
      expect(result).not.toContain('# ')
      expect(result).toContain('来源：https://example.com')
    })

    it('omits URL section when URL is empty', () => {
      const result = formatCopyMarkdown('Title', '', [], '', 'body')
      expect(result).not.toContain('来源：')
      expect(result).toContain('# Title')
    })

    it('omits tags section when tags are empty', () => {
      const result = formatCopyMarkdown('T', 'https://a.com', [], '', 'body')
      expect(result).not.toContain('标签：')
    })

    it('omits note section when note is blank', () => {
      const result = formatCopyMarkdown('T', 'https://a.com', [], '  ', 'body')
      expect(result).not.toContain('>')
    })

    it('handles empty body markdown', () => {
      const result = formatCopyMarkdown('T', 'https://a.com', [], '', '')
      expect(result).toContain('# T')
      expect(result).toContain('---')
    })

    it('contains title before URL before tags before note before divider before body', () => {
      const result = formatCopyMarkdown(
        'T',
        'https://a.com',
        ['a'],
        'n',
        'body',
      )
      const idxTitle = result.indexOf('# T')
      const idxUrl = result.indexOf('来源：')
      const idxTag = result.indexOf('标签：')
      const idxNote = result.indexOf('> n')
      const idxDivider = result.indexOf('---')
      const idxBody = result.indexOf('body')
      expect(idxTitle).toBeLessThan(idxUrl)
      expect(idxUrl).toBeLessThan(idxTag)
      expect(idxTag).toBeLessThan(idxNote)
      expect(idxNote).toBeLessThan(idxDivider)
      expect(idxDivider).toBeLessThan(idxBody)
    })

    it('comment-context mode returns bodyMarkdown directly without wrapper', () => {
      const bodyMd = '# 评论标题\n\n平台：Weibo\n\n来源：https://example.com/comment\n\n## 选中评论\n\n评论者：Alice\n\n这是评论正文\n\n---\n\n> 注：以上内容为网页选区评论剪藏，并非全文。'
      const result = formatCopyMarkdown(
        '外层标题',
        'https://example.com/page',
        ['标签1'],
        '备注',
        bodyMd,
        'selection',
        'comment-context',
      )
      expect(result).toBe(bodyMd)
      expect(result).not.toContain('# 外层标题')
      expect(result).not.toContain('标签1')
      expect(result).not.toContain('备注')
      expect(result).not.toContain('> 注：以下内容为网页选区摘录，并非全文。')
    })

    it('comment-context with empty bodyMarkdown returns empty', () => {
      const result = formatCopyMarkdown(
        'Title',
        'https://a.com',
        ['tag'],
        'note',
        '',
        'selection',
        'comment-context',
      )
      expect(result).toBe('')
    })

    it('selection-generic without clipMode still gets full wrapper', () => {
      const result = formatCopyMarkdown(
        'Title',
        'https://a.com',
        ['tag'],
        'note',
        'body text',
        'selection',
      )
      expect(result).toContain('# Title')
      expect(result).toContain('来源：https://a.com')
      expect(result).toContain('标签：#tag')
      expect(result).toContain('---')
      expect(result).toContain('> 注：以下内容为网页选区摘录，并非全文。')
      expect(result).toContain('body text')
    })
  })

  describe('snippet', () => {
    it('returns full text if under maxLen', () => {
      expect(snippet('hello', 10)).toBe('hello')
    })

    it('truncates and appends ...', () => {
      expect(snippet('hello world', 5)).toBe('hello...')
    })

    it('defaults to maxLen 120', () => {
      const long = 'a'.repeat(200)
      expect(snippet(long).length).toBe(123) // 120 + '...'
    })
  })
})

describe('errors', () => {
  it('creates ClipMateError with default code', () => {
    const err = new ClipMateError('something wrong')
    expect(err.name).toBe('ClipMateError')
    expect(err.code).toBe('UNKNOWN')
    expect(err.message).toBe('something wrong')
  })

  it('creates ClipMateError with custom code', () => {
    const err = new ClipMateError('no selection', ErrorCodes.NO_SELECTION)
    expect(err.code).toBe('NO_SELECTION')
  })
})

describe('constants', () => {
  it('has all message types', () => {
    expect(MESSAGE_TYPES.EXTRACT_CURRENT_PAGE).toBe('EXTRACT_CURRENT_PAGE')
    expect(MESSAGE_TYPES.GET_SELECTION).toBe('GET_SELECTION')
    expect(MESSAGE_TYPES.GET_SETTINGS).toBe('GET_SETTINGS')
    expect(MESSAGE_TYPES.SAVE_SETTINGS).toBe('SAVE_SETTINGS')
    expect(MESSAGE_TYPES.SAVE_LAST_CLIP).toBe('SAVE_LAST_CLIP')
    expect(MESSAGE_TYPES.GET_LAST_CLIP).toBe('GET_LAST_CLIP')
  })

  it('has empty default settings (no real token)', () => {
    expect(DEFAULT_SETTINGS.notionToken).toBe('')
    expect(DEFAULT_SETTINGS.notionPageId).toBe('')
    expect(DEFAULT_SETTINGS.saveHistoryEnabled).toBe(true)
  })

  it('defines storage keys', () => {
    expect(STORAGE_KEYS.SETTINGS).toBe('clipmate_settings')
    expect(STORAGE_KEYS.LAST_CLIP).toBe('clipmate_last_clip')
  })
})
