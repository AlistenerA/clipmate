import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  completeOnboarding,
  markOnboardingPending,
  shouldShowOnboarding
} from '../src/onboarding/storage'

const store: Record<string, unknown> = {}

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key]
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: vi.fn(async (key: string) => ({ [key]: store[key] })),
        set: vi.fn(async (values: Record<string, unknown>) => Object.assign(store, values))
      }
    }
  })
})

describe('v1.0.1 onboarding state', () => {
  it('is absent for existing/update installs', async () => {
    expect(await shouldShowOnboarding()).toBe(false)
  })

  it('shows while pending and never shows after completion', async () => {
    await markOnboardingPending()
    expect(await shouldShowOnboarding()).toBe(true)
    await completeOnboarding()
    expect(await shouldShowOnboarding()).toBe(false)
  })
})
