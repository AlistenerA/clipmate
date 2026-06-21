import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  activateStoredLicense,
  refreshStoredLicense
} from '../src/background/handlers/licenseHandler'
import { registerLicenseLifecycle } from '../src/background/licenseLifecycle'
import { LICENSE_STORAGE_KEYS } from '../src/pro/storage'

const store: Record<string, unknown> = {}
const installedListeners: Array<(details: chrome.runtime.InstalledDetails) => void> = []
const startupListeners: Array<() => void> = []
const alarmListeners: Array<(alarm: chrome.alarms.Alarm) => void> = []
const createAlarm = vi.fn()

function successResponse() {
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        activated: true,
        plan: 'pro',
        features: ['batch_save', 'ai_summary'],
        token: 'signed-token',
        token_expires_at: new Date(Date.now() + 86_400_000).toISOString(),
        license_expires_at: new Date(Date.now() + 86_400_000 * 30).toISOString(),
        active_devices: 1,
        max_devices: 2
      },
      message: 'ok'
    }),
    { status: 200 }
  )
}

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key]
  installedListeners.length = 0
  startupListeners.length = 0
  alarmListeners.length = 0
  createAlarm.mockReset()
  vi.stubGlobal('chrome', {
    runtime: {
      getManifest: () => ({ version: '1.0.1' }),
      onInstalled: { addListener: (listener: typeof installedListeners[number]) => installedListeners.push(listener) },
      onStartup: { addListener: (listener: typeof startupListeners[number]) => startupListeners.push(listener) }
    },
    storage: {
      local: {
        get: vi.fn(async (key: string) => ({ [key]: store[key] })),
        set: vi.fn(async (values: Record<string, unknown>) => Object.assign(store, values)),
        remove: vi.fn(async (key: string) => delete store[key])
      }
    },
    alarms: {
      get: vi.fn(async () => undefined),
      create: createAlarm,
      onAlarm: { addListener: (listener: typeof alarmListeners[number]) => alarmListeners.push(listener) }
    }
  })
  vi.stubGlobal('fetch', vi.fn())
})

describe('v1.0.1 background License operations', () => {
  it('activates and persists entitlement without persisting the raw key', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse())
    const response = await activateStoredLicense('AAAA-BBBB-CCCC-DDDD')
    expect(response.success).toBe(true)
    const auth = store[LICENSE_STORAGE_KEYS.AUTH] as { token: string; features: string[] }
    expect(auth.token).toBe('signed-token')
    expect(auth.features).toEqual(['ai_summary', 'batch_save'])
    expect(JSON.stringify(store)).not.toContain('AAAA-BBBB-CCCC-DDDD')
  })

  it('keeps state after transient refresh failure and records the safe error code', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(successResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ success: false, error_code: 'TEMPORARY', message: 'retry' }),
          { status: 503 }
        )
      )
    await activateStoredLicense('AAAA-BBBB-CCCC-DDDD')
    const response = await refreshStoredLicense(true)
    expect(response).toEqual({ success: false, error: 'TEMPORARY', transient: true })
    expect((store[LICENSE_STORAGE_KEYS.AUTH] as { lastErrorCode: string }).lastErrorCode).toBe(
      'TEMPORARY'
    )
  })

  it('clears state after an explicit revocation response', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(successResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ success: false, error_code: 'LICENSE_REVOKED', message: 'revoked' }),
          { status: 403 }
        )
      )
    await activateStoredLicense('AAAA-BBBB-CCCC-DDDD')
    const response = await refreshStoredLicense(true)
    expect(response).toEqual({ success: false, error: 'LICENSE_REVOKED', transient: false })
    expect(store[LICENSE_STORAGE_KEYS.AUTH]).toBeUndefined()
  })
})

describe('v1.0.1 lifecycle registration', () => {
  it('marks onboarding only for a fresh install and schedules refresh', async () => {
    registerLicenseLifecycle()
    expect(installedListeners).toHaveLength(1)
    installedListeners[0]({ reason: 'install' } as chrome.runtime.InstalledDetails)
    await vi.waitFor(() => {
      expect(store.clipmate_onboarding_v1).toBe('pending')
      expect(createAlarm).toHaveBeenCalledWith(
        'clipmate-license-refresh',
        expect.objectContaining({ periodInMinutes: 360 })
      )
    })

    delete store.clipmate_onboarding_v1
    installedListeners[0]({ reason: 'update' } as chrome.runtime.InstalledDetails)
    await Promise.resolve()
    await Promise.resolve()
    expect(store.clipmate_onboarding_v1).toBeUndefined()
  })
})
