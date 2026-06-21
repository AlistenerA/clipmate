// Version: v1.0.1
export type LicensePlan = 'pro' | 'lifetime'

export interface LicenseAuthState {
  schemaVersion: 1
  deviceId: string
  token: string
  plan: LicensePlan
  features: string[]
  activatedAt: string
  lastVerifiedAt: string
  tokenExpiresAt: string
  licenseExpiresAt?: string
  activeDevices: number
  maxDevices: number
  lastErrorCode?: string
}

export interface LicenseApiData {
  activated: boolean
  plan: LicensePlan
  features: string[]
  token: string
  token_expires_at: string
  license_expires_at: string | null
  active_devices: number
  max_devices: number
}

export type LicenseActionResponse =
  | { success: true; data: LicenseAuthState | null }
  | { success: false; error: string; transient: boolean }

export interface ActivateLicensePayload {
  licenseKey: string
}
