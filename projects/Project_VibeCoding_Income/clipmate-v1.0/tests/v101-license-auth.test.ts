import { describe, expect, it } from 'vitest'
import { createManifest } from '../manifest.config'
import { OFFLINE_GRACE_MS, PURCHASE_URL } from '../src/pro/config'
import { isEntitlementUsable } from '../src/pro/proAuth'
import type { LicenseAuthState } from '../src/pro/types'

function makeState(overrides: Partial<LicenseAuthState> = {}): LicenseAuthState {
  const now = Date.now()
  return {
    schemaVersion: 1,
    deviceId: 'device-00000001',
    token: 'signed-token',
    plan: 'pro',
    features: ['ai_summary'],
    activatedAt: new Date(now - 1000).toISOString(),
    lastVerifiedAt: new Date(now - 1000).toISOString(),
    tokenExpiresAt: new Date(now + 60_000).toISOString(),
    activeDevices: 1,
    maxDevices: 2,
    ...overrides
  }
}

describe('v1.0.1 License entitlement', () => {
  it('routes upgrade traffic to the ClipMate Afdian plan page', () => {
    expect(PURCHASE_URL).toBe('https://ifdian.net/a/ClipMate/plan')
  })

  it('keeps entitlement during the seven-day offline grace', () => {
    const now = Date.now()
    const state = makeState({
      lastVerifiedAt: new Date(now - OFFLINE_GRACE_MS + 1000).toISOString(),
      tokenExpiresAt: new Date(now - 60_000).toISOString()
    })
    expect(isEntitlementUsable(state, now)).toBe(true)
  })

  it('locks after the offline grace or License expiry', () => {
    const now = Date.now()
    expect(
      isEntitlementUsable(
        makeState({ lastVerifiedAt: new Date(now - OFFLINE_GRACE_MS - 1).toISOString() }),
        now
      )
    ).toBe(false)
    expect(
      isEntitlementUsable(
        makeState({ licenseExpiresAt: new Date(now - 1).toISOString() }),
        now
      )
    ).toBe(false)
  })

  it('rejects empty or malformed entitlement state', () => {
    expect(isEntitlementUsable(null)).toBe(false)
    expect(isEntitlementUsable(makeState({ token: '' }))).toBe(false)
    expect(isEntitlementUsable(makeState({ lastVerifiedAt: 'invalid' }))).toBe(false)
  })
})

describe('v1.0.1 manifest isolation', () => {
  it('uses only the selected License origin and the alarms permission', () => {
    const staging = createManifest('https://cydl.site/api')
    const production = createManifest('https://license.cydl.site/api')
    expect(staging.version).toBe('1.0.1')
    expect(staging.permissions).toEqual(['storage', 'activeTab', 'alarms'])
    expect(staging.host_permissions).toContain('https://cydl.site/*')
    expect(staging.host_permissions).not.toContain('https://license.cydl.site/*')
    expect(production.host_permissions).toContain('https://license.cydl.site/*')
    expect(production.host_permissions).not.toContain('https://cydl.site/*')
  })

  it('refuses a non-HTTPS License origin', () => {
    expect(() => createManifest('http://license.cydl.site/api')).toThrow(/HTTPS/)
  })
})
