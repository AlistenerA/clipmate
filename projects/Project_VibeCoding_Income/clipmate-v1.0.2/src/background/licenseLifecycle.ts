// Version: v1.0.1
import { LICENSE_REFRESH_ALARM } from '../pro/config'
import { markOnboardingPending } from '../onboarding/storage'
import { refreshStoredLicense } from './handlers/licenseHandler'

const SIX_HOURS_MINUTES = 6 * 60

export function registerLicenseLifecycle(): void {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') void markOnboardingPending()
    void ensureLicenseRefreshAlarm()
  })
  chrome.runtime.onStartup.addListener(() => {
    void ensureLicenseRefreshAlarm()
    void refreshStoredLicense(false)
  })
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === LICENSE_REFRESH_ALARM) void refreshStoredLicense(false)
  })
}

export async function ensureLicenseRefreshAlarm(): Promise<void> {
  const existing = await chrome.alarms.get(LICENSE_REFRESH_ALARM)
  if (existing) return
  chrome.alarms.create(LICENSE_REFRESH_ALARM, {
    delayInMinutes: 1,
    periodInMinutes: SIX_HOURS_MINUTES
  })
}
