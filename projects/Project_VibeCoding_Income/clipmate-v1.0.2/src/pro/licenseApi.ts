// Version: v1.0.1
import { LICENSE_API_BASE } from './config'
import type { LicenseApiData } from './types'

interface ApiEnvelope {
  success: boolean
  data?: unknown
  error_code?: string
  message: string
}

export class LicenseApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly transient: boolean
  ) {
    super(code)
  }
}

export async function verifyLicenseRemote(
  licenseKey: string,
  deviceId: string,
  deviceInfo: string
): Promise<LicenseApiData> {
  return request('/licenses/verify', {
    license_key: licenseKey,
    device_id: deviceId,
    device_info: deviceInfo
  })
}

export async function refreshLicenseRemote(
  token: string,
  deviceId: string
): Promise<LicenseApiData> {
  return request('/licenses/refresh', { device_id: deviceId }, token)
}

export async function deactivateLicenseRemote(token: string, deviceId: string): Promise<void> {
  await request('/licenses/deactivate', { device_id: deviceId }, token, false)
}

async function request(
  path: string,
  body: Record<string, unknown>,
  token?: string,
  expectLicenseData = true
): Promise<LicenseApiData> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(`${LICENSE_API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal
    })
    const envelope = await parseEnvelope(response)
    if (!response.ok || !envelope.success) {
      const code = envelope.error_code || 'LICENSE_REQUEST_FAILED'
      throw new LicenseApiError(code, response.status, isTransientStatus(response.status))
    }
    if (!expectLicenseData) return {} as LicenseApiData
    if (!isLicenseApiData(envelope.data)) {
      throw new LicenseApiError('INVALID_SERVER_RESPONSE', response.status, true)
    }
    return envelope.data
  } catch (error) {
    if (error instanceof LicenseApiError) throw error
    throw new LicenseApiError('NETWORK_ERROR', 0, true)
  } finally {
    clearTimeout(timeout)
  }
}

async function parseEnvelope(response: Response): Promise<ApiEnvelope> {
  try {
    const value = (await response.json()) as unknown
    if (!value || typeof value !== 'object') throw new Error('invalid response')
    const envelope = value as Partial<ApiEnvelope>
    if (typeof envelope.success !== 'boolean' || typeof envelope.message !== 'string') {
      throw new Error('invalid response')
    }
    return envelope as ApiEnvelope
  } catch {
    throw new LicenseApiError('INVALID_SERVER_RESPONSE', response.status, true)
  }
}

function isLicenseApiData(value: unknown): value is LicenseApiData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<LicenseApiData>
  return (
    typeof data.activated === 'boolean' &&
    (data.plan === 'pro' || data.plan === 'lifetime') &&
    Array.isArray(data.features) &&
    data.features.every((feature) => typeof feature === 'string') &&
    typeof data.token === 'string' &&
    typeof data.token_expires_at === 'string' &&
    (typeof data.license_expires_at === 'string' || data.license_expires_at === null) &&
    typeof data.active_devices === 'number' &&
    typeof data.max_devices === 'number'
  )
}

function isTransientStatus(status: number): boolean {
  return status === 0 || status === 429 || status >= 500
}
