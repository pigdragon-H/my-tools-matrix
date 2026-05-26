// featureFlags.ts
// 單一來源，所有功能開關
// 禁止在其他地方重複定義

export const FEATURE_FLAGS = {
  ENABLE_ADS: false,
  ENABLE_PREMIUM: false,
  ENABLE_STRIPE: false,
  ENABLE_AFFILIATE: true,   // Affiliate 已啟用
  ENABLE_AI: false,
  ENABLE_ANALYTICS: false,
  ENABLE_SPONSOR: false,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS

export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag]
}
