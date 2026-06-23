// featureFlags.ts
// Single source of truth for runtime feature toggles.
// Monetization features are disabled during AdSense review.
// Enable only after policies, publisher IDs, partner links, and checkout are production-ready.

export type FeatureFlag =
  | "ENABLE_ADS"               // Show ad placements only after approval and inventory readiness
  | "ENABLE_REAL_ADSENSE"      // Inject real Google AdSense script (needs publisher ID)
  | "ENABLE_AFFILIATE"         // Make affiliate links clickable / track outbound
  | "ENABLE_PREMIUM"           // Lock PremiumGate children behind paywall (needs Stripe + auth)
  | "ENABLE_NEWSLETTER"        // Submit newsletter signup to backend (needs email service)
  | "ENABLE_TRUST_LINKS";      // Hide TrustStrip footer if false (rarely needed)

const flags: Record<FeatureFlag, boolean> = {
  ENABLE_ADS: false,           // Keep ad placements hidden during AdSense review
  ENABLE_REAL_ADSENSE: false,  // Enable after AdSense approval and publisher ID setup
  ENABLE_AFFILIATE: false,     // Enable after partner contracts and destination URLs are final
  ENABLE_PREMIUM: false,       // Enable after checkout, auth, and support flows are final
  ENABLE_NEWSLETTER: true,     // Phase G: wired to /api/newsletter/subscribe (Resend)
  ENABLE_TRUST_LINKS: true,    // Trust strip is always shown — important for AdSense audit
};

export function isEnabled(flag: FeatureFlag | string): boolean {
  return (flags as Record<string, boolean>)[flag] ?? false;
}

// Public publisher ID is intentionally blank until real AdSense approval.
export const ADSENSE_PUBLISHER_ID = "";
