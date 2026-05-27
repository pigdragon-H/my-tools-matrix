// AdSlot.tsx
// 廣告位預留元件 — 通過 featureFlags 單一來源控制

import { isEnabled } from "@/config/featureFlags"

interface AdSlotProps {
  slot: string        // e.g. "bmi-knowledge", "bmi-faq"
  position: string    // e.g. "middle", "inline"
  variant?: "horizontal" | "square" | "responsive"
}

export function AdSlot({ slot, position, variant = "horizontal" }: AdSlotProps) {
  if (!isEnabled("ENABLE_ADS")) return null
  return (
    <div
      data-slot={slot}
      data-position={position}
      data-variant={variant}
      className="w-full min-h-[90px] border border-dashed 
        border-slate-200 rounded-xl flex items-center 
        justify-center text-xs text-slate-400"
    >
      廣告位 · Advertisement
    </div>
  )
}
