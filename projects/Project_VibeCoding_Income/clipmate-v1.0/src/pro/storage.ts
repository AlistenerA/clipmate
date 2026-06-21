// Version: v1.0.1
import { generateId } from '../shared/utils/id'
import type { LicenseAuthState } from './types'

export const LICENSE_STORAGE_KEYS = {
  AUTH: 'clipmate_pro_auth_v1',
  DEVICE_ID: 'clipmate_device_id_v1'
} as const

export async function getLicenseAuthState(): Promise<LicenseAuthState | null> {
  const result = await chrome.storage.local.get(LICENSE_STORAGE_KEYS.AUTH)
  const value = result[LICENSE_STORAGE_KEYS.AUTH]
  return isLicenseAuthState(value) ? value : null
}

export async function saveLicenseAuthState(state: LicenseAuthState): Promise<void> {
  await chrome.storage.local.set({ [LICENSE_STORAGE_KEYS.AUTH]: state })
}

export async function clearLicenseAuthState(): Promise<void> {
  await chrome.storage.local.remove(LICENSE_STORAGE_KEYS.AUTH)
}

export async function getOrCreateDeviceId(): Promise<string> {
  const result = await chrome.storage.local.get(LICENSE_STORAGE_KEYS.DEVICE_ID)
  const stored = result[LICENSE_STORAGE_KEYS.DEVICE_ID]
  if (typeof stored === 'string' && stored.length >= 8 && stored.length <= 128) {
    return stored
  }
  const deviceId = generateId()
  await chrome.storage.local.set({ [LICENSE_STORAGE_KEYS.DEVICE_ID]: deviceId })
  return deviceId
}

function isLicenseAuthState(value: unknown): value is LicenseAuthState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<LicenseAuthState>
  return (
    state.schemaVersion === 1 &&
    typeof state.deviceId === 'string' &&
    typeof state.token === 'string' &&
    state.token.length > 0 &&
    (state.plan === 'pro' || state.plan === 'lifetime') &&
    Array.isArray(state.features) &&
    state.features.every((feature) => typeof feature === 'string') &&
    typeof state.activatedAt === 'string' &&
    typeof state.lastVerifiedAt === 'string' &&
    typeof state.tokenExpiresAt === 'string' &&
    typeof state.activeDevices === 'number' &&
    typeof state.maxDevices === 'number'
  )
}
