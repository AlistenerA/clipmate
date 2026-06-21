// Version: v1.0.1
const ONBOARDING_KEY = 'clipmate_onboarding_v1'

type OnboardingState = 'pending' | 'completed'

export async function markOnboardingPending(): Promise<void> {
  await chrome.storage.local.set({ [ONBOARDING_KEY]: 'pending' satisfies OnboardingState })
}

export async function completeOnboarding(): Promise<void> {
  await chrome.storage.local.set({ [ONBOARDING_KEY]: 'completed' satisfies OnboardingState })
}

export async function shouldShowOnboarding(): Promise<boolean> {
  const result = await chrome.storage.local.get(ONBOARDING_KEY)
  return result[ONBOARDING_KEY] === 'pending'
}
