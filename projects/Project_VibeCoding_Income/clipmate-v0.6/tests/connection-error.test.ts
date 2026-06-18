import { describe, it, expect } from 'vitest'
import {
  isContentScriptUnavailableError,
  normalizeContentScriptConnectionError,
} from '../src/shared/messaging/sendMessage'

describe('isContentScriptUnavailableError', () => {
  it('returns true for "Could not establish connection" error', () => {
    expect(isContentScriptUnavailableError(
      new Error('Could not establish connection. Receiving end does not exist.'),
    )).toBe(true)
  })

  it('returns true for "Receiving end does not exist" error', () => {
    expect(isContentScriptUnavailableError(
      new Error('Error: Receiving end does not exist'),
    )).toBe(true)
  })

  it('returns true for native host communication error', () => {
    expect(isContentScriptUnavailableError(
      new Error('Error communicating with the native message host'),
    )).toBe(true)
  })

  it('returns false for other errors', () => {
    expect(isContentScriptUnavailableError(
      new Error('Something else went wrong'),
    )).toBe(false)
  })

  it('returns false for null', () => {
    expect(isContentScriptUnavailableError(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isContentScriptUnavailableError(undefined)).toBe(false)
  })

  it('returns false for string', () => {
    expect(isContentScriptUnavailableError('Could not establish connection')).toBe(false)
  })
})

describe('normalizeContentScriptConnectionError', () => {
  it('converts connection error to friendly message', () => {
    const err = normalizeContentScriptConnectionError(
      new Error('Could not establish connection. Receiving end does not exist.'),
    )
    expect(err.message).toContain('ClipMate 未能连接到当前页面')
    expect(err.message).toContain('刷新')
  })

  it('preserves non-connection errors unchanged', () => {
    const original = new Error('EXTRACTION_FAILED')
    const err = normalizeContentScriptConnectionError(original)
    expect(err).toBe(original)
  })

  it('wraps non-Error values as generic error', () => {
    const err = normalizeContentScriptConnectionError('something')
    expect(err.message).toBe('提取失败')
  })

  it('does not leak technical details in friendly message', () => {
    const err = normalizeContentScriptConnectionError(
      new Error('Could not establish connection. Receiving end does not exist.'),
    )
    expect(err.message).not.toContain('Receiving end')
    expect(err.message).not.toContain('chrome.tabs')
    expect(err.message).not.toContain('sendMessage')
  })

  it('does not modify message of No active tab found', () => {
    const original = new Error('No active tab found')
    const err = normalizeContentScriptConnectionError(original)
    expect(err).toBe(original)
  })
})
