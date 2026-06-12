import { describe, it, expect } from 'vitest'
import { ERROR_MESSAGES } from '../src/shared/constants/defaults'
import { ErrorCodes } from '../src/shared/utils/errors'

describe('Notion error messages', () => {
  it('NOTION_TOKEN_MISSING maps to Chinese message', () => {
    expect(ERROR_MESSAGES.NOTION_TOKEN_MISSING).toBe(
      '请先在设置页填写 Notion Token',
    )
  })

  it('NOTION_PAGE_ID_MISSING maps to Chinese message', () => {
    expect(ERROR_MESSAGES.NOTION_PAGE_ID_MISSING).toBe(
      '请先在设置页填写 Notion Page ID',
    )
  })

  it('NOTION_AUTH_FAILED maps to Chinese message', () => {
    expect(ERROR_MESSAGES.NOTION_AUTH_FAILED).toBe(
      'Notion 授权失败，请检查 Token 是否正确',
    )
  })

  it('NOTION_PAGE_NOT_FOUND maps to Chinese message', () => {
    expect(ERROR_MESSAGES.NOTION_PAGE_NOT_FOUND).toBe(
      '找不到 Notion 页面，请检查 Page ID，并确认 Integration 已被邀请到该页面',
    )
  })

  it('NOTION_RATE_LIMITED maps to Chinese message', () => {
    expect(ERROR_MESSAGES.NOTION_RATE_LIMITED).toBe(
      '请求过于频繁，请稍后重试',
    )
  })

  it('NETWORK_ERROR maps to Chinese message', () => {
    expect(ERROR_MESSAGES.NETWORK_ERROR).toBe(
      '网络错误，请稍后重试',
    )
  })

  it('NOTION_SAVE_FAILED maps to Chinese message', () => {
    expect(ERROR_MESSAGES.NOTION_SAVE_FAILED).toBe(
      '保存失败，请稍后重试',
    )
  })

  it('CONTENT_EMPTY maps to Chinese message', () => {
    expect(ERROR_MESSAGES.CONTENT_EMPTY).toBe(
      '没有可保存的内容',
    )
  })
})

describe('Notion error codes', () => {
  it('has all required notion error codes', () => {
    expect(ErrorCodes.NOTION_TOKEN_MISSING).toBe('NOTION_TOKEN_MISSING')
    expect(ErrorCodes.NOTION_PAGE_ID_MISSING).toBe('NOTION_PAGE_ID_MISSING')
    expect(ErrorCodes.NOTION_AUTH_FAILED).toBe('NOTION_AUTH_FAILED')
    expect(ErrorCodes.NOTION_PAGE_NOT_FOUND).toBe('NOTION_PAGE_NOT_FOUND')
    expect(ErrorCodes.NOTION_RATE_LIMITED).toBe('NOTION_RATE_LIMITED')
    expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR')
    expect(ErrorCodes.NOTION_SAVE_FAILED).toBe('NOTION_SAVE_FAILED')
    expect(ErrorCodes.CONTENT_EMPTY).toBe('CONTENT_EMPTY')
  })
})
