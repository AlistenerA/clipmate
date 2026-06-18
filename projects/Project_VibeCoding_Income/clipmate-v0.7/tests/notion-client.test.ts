import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { appendBlocks } from '../src/platforms/notion/client'

function mockFetch(status: number, ok: boolean, body?: unknown) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body ?? {},
  })
}

function mockFetchThrow(error: Error) {
  return vi.fn().mockRejectedValue(error)
}

const TOKEN = 'secret_test_token'
const PAGE_ID = 'test-page-id'

function makeBlocks(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    object: 'block' as const,
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: 'text' as const, text: { content: `block ${i}` } },
      ],
    },
  }))
}

describe('appendBlocks error handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch(200, true))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws NOTION_AUTH_FAILED on 401', async () => {
    vi.stubGlobal('fetch', mockFetch(401, false))

    await expect(
      appendBlocks(TOKEN, PAGE_ID, makeBlocks(1)),
    ).rejects.toThrow('NOTION_AUTH_FAILED')
  })

  it('throws NOTION_AUTH_FAILED on 403', async () => {
    vi.stubGlobal('fetch', mockFetch(403, false))

    await expect(
      appendBlocks(TOKEN, PAGE_ID, makeBlocks(1)),
    ).rejects.toThrow('NOTION_AUTH_FAILED')
  })

  it('throws NOTION_PAGE_NOT_FOUND on 404', async () => {
    vi.stubGlobal('fetch', mockFetch(404, false))

    await expect(
      appendBlocks(TOKEN, PAGE_ID, makeBlocks(1)),
    ).rejects.toThrow('NOTION_PAGE_NOT_FOUND')
  })

  it('throws NOTION_RATE_LIMITED on 429', async () => {
    vi.stubGlobal('fetch', mockFetch(429, false))

    await expect(
      appendBlocks(TOKEN, PAGE_ID, makeBlocks(1)),
    ).rejects.toThrow('NOTION_RATE_LIMITED')
  })

  it('throws NOTION_SERVICE_UNAVAILABLE on 500', async () => {
    vi.stubGlobal('fetch', mockFetch(500, false))

    await expect(
      appendBlocks(TOKEN, PAGE_ID, makeBlocks(1)),
    ).rejects.toThrow('NOTION_SERVICE_UNAVAILABLE')
  })

  it('preserves safe validation details and batch number', async () => {
    vi.stubGlobal('fetch', mockFetch(400, false, {
      code: 'validation_error',
      message: 'must not be copied into UI',
    }))

    try {
      await appendBlocks(TOKEN, PAGE_ID, makeBlocks(1))
      expect.fail('expected appendBlocks to throw')
    } catch (error) {
      expect(error).toMatchObject({
        code: 'NOTION_VALIDATION_ERROR',
        details: {
          httpStatus: 400,
          apiCode: 'validation_error',
          batch: 1,
        },
      })
      expect(JSON.stringify(error)).not.toContain('must not be copied into UI')
    }
  })

  it('throws NETWORK_ERROR when fetch rejects', async () => {
    vi.stubGlobal('fetch', mockFetchThrow(new Error('connect ECONNREFUSED')))

    await expect(
      appendBlocks(TOKEN, PAGE_ID, makeBlocks(1)),
    ).rejects.toThrow('NETWORK_ERROR')
  })
})

describe('appendBlocks batching', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch(200, true))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends a single request for <= 100 blocks', async () => {
    const fetchMock = mockFetch(200, true)
    vi.stubGlobal('fetch', fetchMock)

    await appendBlocks(TOKEN, PAGE_ID, makeBlocks(50))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('splits > 100 blocks into multiple requests', async () => {
    const fetchMock = mockFetch(200, true)
    vi.stubGlobal('fetch', fetchMock)

    await appendBlocks(TOKEN, PAGE_ID, makeBlocks(150))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('sends exactly 100 blocks in the first batch, remainder in the second', async () => {
    const fetchMock = mockFetch(200, true)
    vi.stubGlobal('fetch', fetchMock)

    await appendBlocks(TOKEN, PAGE_ID, makeBlocks(250))

    expect(fetchMock).toHaveBeenCalledTimes(3)

    const firstCallBody = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(firstCallBody.children).toHaveLength(100)

    const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(secondCallBody.children).toHaveLength(100)

    const thirdCallBody = JSON.parse(fetchMock.mock.calls[2][1].body)
    expect(thirdCallBody.children).toHaveLength(50)
  })

  it('stops batching if an earlier request fails', async () => {
    const failThenOk = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) })
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })

    vi.stubGlobal('fetch', failThenOk)

    await expect(
      appendBlocks(TOKEN, PAGE_ID, makeBlocks(150)),
    ).rejects.toThrow('NOTION_RATE_LIMITED')

    expect(failThenOk).toHaveBeenCalledTimes(1)
  })

  it('reports the failing batch without leaking response content', async () => {
    const secondBatchFails = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ code: 'validation_error', message: 'private block content' }),
      })
    vi.stubGlobal('fetch', secondBatchFails)

    await expect(appendBlocks(TOKEN, PAGE_ID, makeBlocks(150))).rejects.toMatchObject({
      code: 'NOTION_VALIDATION_ERROR',
      details: { batch: 2, httpStatus: 400 },
    })
  })
})
