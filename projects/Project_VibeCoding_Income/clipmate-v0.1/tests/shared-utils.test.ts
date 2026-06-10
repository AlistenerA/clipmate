import { describe, it, expect } from 'vitest'
import { countWords, snippet } from '../src/shared/utils/formatMarkdown'
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

    it('handles CJK characters as single words', () => {
      expect(countWords('你好 世界')).toBe(2)
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
