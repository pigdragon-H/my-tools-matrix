// AdSlot.tsx
// 廣告位元件 — L14 #2 必須與 L8 同規格，在本機與正式環境都可視化標示

import { isEnabled } from "@/config/featureFlags"

interface AdSlotProps {
  slot: string        // e.g. "bmi-knowledge", "bmi-faq"
  position: string    // e.g. "middle", "inline"
  variant?: "horizontal" | "square" | "responsive"
}

export function AdSlot({ slot, position, variant = "horizontal" }: AdSlotProps) {
  const adsEnabled = isEnabled("ENABLE_ADS")

  if (!adsEnabled) return null

  const minHeight = variant === "square" ? "250px" : "90px"

  return (
    <div className="w-full">
      <div
        data-slot={slot}
        data-position={position}
        data-variant={variant}
        data-ads-enabled={adsEnabled ? "true" : "false"}
        aria-label="Sponsored content area"
        className="flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 text-xs text-muted-foreground"
        style={{ minHeight }}
      >
        <span className="select-none">Sponsored content area</span>
      </div>
    </div>
  )
}
