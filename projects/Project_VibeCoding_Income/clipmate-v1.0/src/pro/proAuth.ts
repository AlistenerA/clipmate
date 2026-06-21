// Version: v1.0.1
import { MESSAGE_TYPES } from '../shared/constants/messageTypes'
import { OFFLINE_GRACE_MS } from './config'
import { getLicenseAuthState } from './storage'
import type { ActivateLicensePayload, LicenseActionResponse, LicenseAuthState } from './types'

export async function hasFeature(featureName: string): Promise<boolean> {
  const state = await getLicenseAuthState()
  return isEntitlementUsable(state) && state!.features.includes(featureName)
}

export async function isPro(): Promise<boolean> {
  return isEntitlementUsable(await getLicenseAuthState())
}

export async function activateLicense(key: string): Promise<LicenseActionResponse> {
  return sendLicenseMessage({
    type: MESSAGE_TYPES.LICENSE_ACTIVATE,
    payload: { licenseKey: key.trim().toUpperCase() } satisfies ActivateLicensePayload
  })
}

export async function refreshToken(): Promise<LicenseActionResponse> {
  return sendLicenseMessage({ type: MESSAGE_TYPES.LICENSE_REFRESH })
}

export async function deactivateLicense(): Promise<LicenseActionResponse> {
  return sendLicenseMessage({ type: MESSAGE_TYPES.LICENSE_DEACTIVATE })
}

export function isEntitlementUsable(
  state: LicenseAuthState | null,
  now = Date.now()
): state is LicenseAuthState {
  if (!state || !state.token || (state.plan !== 'pro' && state.plan !== 'lifetime')) return false
  const lastVerified = Date.parse(state.lastVerifiedAt)
  if (!Number.isFinite(lastVerified) || lastVerified + OFFLINE_GRACE_MS < now) return false
  if (state.licenseExpiresAt) {
    const licenseExpiry = Date.parse(state.licenseExpiresAt)
    if (!Number.isFinite(licenseExpiry) || licenseExpiry <= now) return false
  }
  return true
}

async function sendLicenseMessage(message: {
  type: string
  payload?: ActivateLicensePayload
}): Promise<LicenseActionResponse> {
  try {
    const response = (await chrome.runtime.sendMessage(message)) as unknown
    if (!response || typeof response !== 'object' || typeof (response as { success?: unknown }).success !== 'boolean') {
      return { success: false, error: 'INVALID_BACKGROUND_RESPONSE', transient: true }
    }
    return response as LicenseActionResponse
  } catch {
    return { success: false, error: 'BACKGROUND_UNAVAILABLE', transient: true }
  }
}
