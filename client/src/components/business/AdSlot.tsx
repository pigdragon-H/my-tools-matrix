// AdSlot.tsx
// 廣告位預留元件 — 不啟用任何 AdSense script

interface AdSlotProps {
  slot: string        // e.g. "home-hero", "home-knowledge", "faq-inline"
  position: string    // e.g. "hero", "middle", "footer"
  variant?: "horizontal" | "square" | "responsive"
}

const ENABLE_ADS = true  // Feature flag - enabled for ad slot display

export function AdSlot({ slot, position, variant = "horizontal" }: AdSlotProps) {
  if (!ENABLE_ADS) return null
  return (
    <div
      data-slot={slot}
      data-position={position}
      data-variant={variant}
      className="w-full"
    />
  )
}
