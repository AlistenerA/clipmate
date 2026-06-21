// Version: v1.0.1
import { MESSAGE_TYPES } from '../../shared/constants/messageTypes'
import { logger } from '../../shared/utils/logger'
import { REFRESH_THRESHOLD_MS } from '../../pro/config'
import {
  deactivateLicenseRemote,
  LicenseApiError,
  refreshLicenseRemote,
  verifyLicenseRemote
} from '../../pro/licenseApi'
import {
  clearLicenseAuthState,
  getLicenseAuthState,
  getOrCreateDeviceId,
  saveLicenseAuthState
} from '../../pro/storage'
import type {
  ActivateLicensePayload,
  LicenseActionResponse,
  LicenseApiData,
  LicenseAuthState
} from '../../pro/types'

const TERMINAL_REFRESH_ERRORS = new Set([
  'LICENSE_REVOKED',
  'LICENSE_EXPIRED',
  'DEVICE_NOT_FOUND',
  'DEVICE_MISMATCH',
  'INVALID_TOKEN',
  'TOKEN_EXPIRED'
])

export function isLicenseMessageType(type: unknown): boolean {
  return (
    type === MESSAGE_TYPES.LICENSE_ACTIVATE ||
    type === MESSAGE_TYPES.LICENSE_REFRESH ||
    type === MESSAGE_TYPES.LICENSE_DEACTIVATE
  )
}

export async function handleLicenseMessage(
  type: string,
  payload: unknown
): Promise<LicenseActionResponse> {
  if (type === MESSAGE_TYPES.LICENSE_ACTIVATE) {
    const licenseKey = (payload as Partial<ActivateLicensePayload> | undefined)?.licenseKey
    if (typeof licenseKey !== 'string' || !licenseKey.trim()) {
      return { success: false, error: 'INVALID_LICENSE_KEY', transient: false }
    }
    return activateStoredLicense(licenseKey)
  }
  if (type === MESSAGE_TYPES.LICENSE_REFRESH) return refreshStoredLicense(true)
  if (type === MESSAGE_TYPES.LICENSE_DEACTIVATE) return deactivateStoredLicense()
  return { success: false, error: 'UNSUPPORTED_MESSAGE', transient: false }
}

export async function activateStoredLicense(licenseKey: string): Promise<LicenseActionResponse> {
  try {
    const deviceId = await getOrCreateDeviceId()
    const data = await verifyLicenseRemote(licenseKey, deviceId, getDeviceInfo())
    const current = await getLicenseAuthState()
    const state = toAuthState(data, deviceId, current?.activatedAt)
    await saveLicenseAuthState(state)
    return { success: true, data: state }
  } catch (error) {
    return actionFailure(error)
  }
}

export async function refreshStoredLicense(force = false): Promise<LicenseActionResponse> {
  const current = await getLicenseAuthState()
  if (!current) return { success: false, error: 'LICENSE_NOT_ACTIVATED', transient: false }
  if (!force && Date.parse(current.tokenExpiresAt) - Date.now() > REFRESH_THRESHOLD_MS) {
    return { success: true, data: current }
  }
  try {
    const data = await refreshLicenseRemote(current.token, current.deviceId)
    const state = toAuthState(data, current.deviceId, current.activatedAt)
    await saveLicenseAuthState(state)
    return { success: true, data: state }
  } catch (error) {
    const failure = actionFailure(error)
    if (!failure.success && TERMINAL_REFRESH_ERRORS.has(failure.error)) {
      await clearLicenseAuthState()
    } else if (!failure.success) {
      await saveLicenseAuthState({ ...current, lastErrorCode: failure.error })
    }
    return failure
  }
}

export async function deactivateStoredLicense(): Promise<LicenseActionResponse> {
  const current = await getLicenseAuthState()
  if (!current) return { success: true, data: null }
  try {
    await deactivateLicenseRemote(current.token, current.deviceId)
    await clearLicenseAuthState()
    return { success: true, data: null }
  } catch (error) {
    return actionFailure(error)
  }
}

function toAuthState(
  data: LicenseApiData,
  deviceId: string,
  activatedAt = new Date().toISOString()
): LicenseAuthState {
  return {
    schemaVersion: 1,
    deviceId,
    token: data.token,
    plan: data.plan,
    features: [...new Set(data.features)].sort(),
    activatedAt,
    lastVerifiedAt: new Date().toISOString(),
    tokenExpiresAt: data.token_expires_at,
    licenseExpiresAt: data.license_expires_at || undefined,
    activeDevices: data.active_devices,
    maxDevices: data.max_devices
  }
}

function actionFailure(error: unknown): LicenseActionResponse {
  if (error instanceof LicenseApiError) {
    return { success: false, error: error.code, transient: error.transient }
  }
  logger.error('Unexpected license operation failure')
  return { success: false, error: 'LICENSE_REQUEST_FAILED', transient: true }
}

function getDeviceInfo(): string {
  const version = chrome.runtime.getManifest().version
  return `ClipMate ${version}; ${navigator.userAgent}`.slice(0, 256)
}
