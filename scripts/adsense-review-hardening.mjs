import fs from "fs";

function replaceOnce(file, from, to) {
  const s = fs.readFileSync(file, "utf8");
  if (!s.includes(from)) throw new Error(`Missing expected text in ${file}: ${from.slice(0, 120)}`);
  fs.writeFileSync(file, s.replace(from, to), "utf8");
}

replaceOnce(
  "client/src/components/business/AdSlot.tsx",
  `export function AdSlot({ slot, position, variant = "horizontal" }: AdSlotProps) {\n  const adsEnabled = isEnabled("ENABLE_ADS")\n  const minHeight = variant === "square" ? "250px" : "90px"\n\n  return (`,
  `export function AdSlot({ slot, position, variant = "horizontal" }: AdSlotProps) {\n  const adsEnabled = isEnabled("ENABLE_ADS")\n\n  if (!adsEnabled) return null\n\n  const minHeight = variant === "square" ? "250px" : "90px"\n\n  return (`
);

replaceOnce(
  "client/src/components/AdSenseWrapper.tsx",
  `import { useEffect, useRef, useState } from "react";`,
  `import { useEffect, useRef, useState } from "react";\nimport { isEnabled } from "@/config/featureFlags";`
);
replaceOnce(
  "client/src/components/AdSenseWrapper.tsx",
  `  const containerRef = useRef<HTMLDivElement>(null);\n  const [isVisible, setIsVisible] = useState(false);`,
  `  const realAdsEnabled = isEnabled("ENABLE_REAL_ADSENSE");\n  const containerRef = useRef<HTMLDivElement>(null);\n  const [isVisible, setIsVisible] = useState(false);`
);
replaceOnce(
  "client/src/components/AdSenseWrapper.tsx",
  `  if (!showAds) return null;`,
  `  if (!showAds || !realAdsEnabled) return null;`
);

replaceOnce(
  "client/src/components/business/AffiliateGrid.tsx",
  `  const isLive = isEnabled("ENABLE_AFFILIATE");\n\n  return (`,
  `  const isLive = isEnabled("ENABLE_AFFILIATE");\n\n  if (!isLive) return null;\n\n  return (`
);

replaceOnce(
  "client/src/components/business/PremiumTeaser.tsx",
  `  const isLive = isEnabled("ENABLE_PREMIUM");\n  const [showNotifyForm, setShowNotifyForm] = useState<string | null>(null);`,
  `  const isLive = isEnabled("ENABLE_PREMIUM");\n\n  if (!isLive) return null;\n\n  const [showNotifyForm, setShowNotifyForm] = useState<string | null>(null);`
);

replaceOnce(
  "client/src/config/featureFlags.ts",
  `// Stub-first architecture: all monetization layers are wired in code as placeholders.\n// To "turn on the power" later, change the flag value here — no JSX changes required.`,
  `// Monetization features are disabled during AdSense review.\n// Enable only after policies, publisher IDs, partner links, and checkout are production-ready.`
);
replaceOnce(
  "client/src/config/featureFlags.ts",
  `  | "ENABLE_ADS"               // Show AdSlot dashed-border placeholders`,
  `  | "ENABLE_ADS"               // Show ad placements only after approval and inventory readiness`
);
replaceOnce(
  "client/src/config/featureFlags.ts",
  `  ENABLE_ADS: false,           // Phase G: placeholders hidden until real AdSense inventory exists\n  ENABLE_REAL_ADSENSE: false,  // TODO: flip on after AdSense approval + publisher ID set\n  ENABLE_AFFILIATE: false,     // TODO: flip on after partner contracts signed\n  ENABLE_PREMIUM: false,       // TODO: flip on after Stripe + auth wired`,
  `  ENABLE_ADS: false,           // Keep ad placements hidden during AdSense review\n  ENABLE_REAL_ADSENSE: false,  // Enable after AdSense approval and publisher ID setup\n  ENABLE_AFFILIATE: false,     // Enable after partner contracts and destination URLs are final\n  ENABLE_PREMIUM: false,       // Enable after checkout, auth, and support flows are final`
);
replaceOnce(
  "client/src/config/featureFlags.ts",
  `// Public publisher ID placeholder. Replaced at deploy time when ENABLE_REAL_ADSENSE goes true.\nexport const ADSENSE_PUBLISHER_ID = "ca-pub-XXXXXXXXXXXXXXXX"; // TODO`,
  `// Public publisher ID is intentionally blank until real AdSense approval.\nexport const ADSENSE_PUBLISHER_ID = "";`
);

console.log("adsense review hardening applied");
