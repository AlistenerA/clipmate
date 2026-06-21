import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  deactivateLicenseRemote,
  LicenseApiError,
  refreshLicenseRemote,
  verifyLicenseRemote
} from '../src/pro/licenseApi'

function apiData() {
  return {
    activated: true,
    plan: 'pro',
    features: ['ai_summary'],
    token: 'new-token',
    token_expires_at: '2026-06-22T00:00:00Z',
    license_expires_at: '2027-06-21T00:00:00Z',
    active_devices: 1,
    max_devices: 2
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('v1.0.1 License API client', () => {
  it('posts activation to the fixed base without credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: apiData(), message: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    )
    vi.stubGlobal('fetch', fetchMock)
    const result = await verifyLicenseRemote('AAAA-BBBB-CCCC-DDDD', 'device-00000001', 'test')
    expect(result.token).toBe('new-token')
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://license.test/api/licenses/verify')
    expect(options.credentials).toBe('omit')
    expect(options.redirect).toBe('error')
    expect(options.headers.Authorization).toBeUndefined()
  })

  it('uses a bearer token for refresh and deactivate', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: apiData(), message: 'ok' }), {
          status: 200
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: { deactivated: true }, message: 'ok' }), {
          status: 200
        })
      )
    vi.stubGlobal('fetch', fetchMock)
    await refreshLicenseRemote('token-1', 'device-00000001')
    await deactivateLicenseRemote('token-2', 'device-00000001')
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer token-1')
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer token-2')
  })

  it('classifies 429 and 5xx as transient but revocation as terminal', async () => {
    for (const status of [429, 503]) {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({ success: false, error_code: 'TEMPORARY', message: 'retry' }),
            { status }
          )
        )
      )
      await expect(refreshLicenseRemote('token', 'device-00000001')).rejects.toMatchObject({
        transient: true
      })
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ success: false, error_code: 'LICENSE_REVOKED', message: 'revoked' }),
          { status: 403 }
        )
      )
    )
    await expect(refreshLicenseRemote('token', 'device-00000001')).rejects.toEqual(
      expect.objectContaining<Partial<LicenseApiError>>({
        code: 'LICENSE_REVOKED',
        transient: false
      })
    )
  })

  it('rejects malformed success payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: { token: 'only' }, message: 'ok' }), {
          status: 200
        })
      )
    )
    await expect(verifyLicenseRemote('key', 'device-00000001', 'test')).rejects.toMatchObject({
      code: 'INVALID_SERVER_RESPONSE',
      transient: true
    })
  })
})
