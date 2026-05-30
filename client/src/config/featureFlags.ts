// featureFlags.ts
// Single source of truth for runtime feature toggles.
// Stub-first architecture: all monetization layers are wired in code as placeholders.
// To "turn on the power" later, change the flag value here — no JSX changes required.

export type FeatureFlag =
  | "ENABLE_ADS"               // Show AdSlot dashed-border placeholders
  | "ENABLE_REAL_ADSENSE"      // Inject real Google AdSense script (needs publisher ID)
  | "ENABLE_AFFILIATE"         // Make affiliate links clickable / track outbound
  | "ENABLE_PREMIUM"           // Lock PremiumGate children behind paywall (needs Stripe + auth)
  | "ENABLE_NEWSLETTER"        // Submit newsletter signup to backend (needs email service)
  | "ENABLE_TRUST_LINKS";      // Hide TrustStrip footer if false (rarely needed)

const flags: Record<FeatureFlag, boolean> = {
  ENABLE_ADS: false,           // Phase G: placeholders hidden until real AdSense inventory exists
  ENABLE_REAL_ADSENSE: false,  // TODO: flip on after AdSense approval + publisher ID set
  ENABLE_AFFILIATE: false,     // TODO: flip on after partner contracts signed
  ENABLE_PREMIUM: false,       // TODO: flip on after Stripe + auth wired
  ENABLE_NEWSLETTER: true,     // Phase G: wired to /api/newsletter/subscribe (Resend)
  ENABLE_TRUST_LINKS: true,    // Trust strip is always shown — important for AdSense audit
};

export function isEnabled(flag: FeatureFlag | string): boolean {
  return (flags as Record<string, boolean>)[flag] ?? false;
}

// Public publisher ID placeholder. Replaced at deploy time when ENABLE_REAL_ADSENSE goes true.
export const ADSENSE_PUBLISHER_ID = "ca-pub-XXXXXXXXXXXXXXXX"; // TODO
