// PremiumGate.tsx
// Premium 付費牆預留 — 不啟用 Stripe

import { isEnabled } from "@/config/featureFlags"

interface PremiumGateProps {
  children: React.ReactNode
  plan?: "PRO" | "TEAM" | "AGENCY"
}

export function PremiumGate({ children, plan = "PRO" }: PremiumGateProps) {
  if (!isEnabled("ENABLE_PREMIUM")) {
    return <>{children}</>  // Feature off = 直接顯示內容
  }
  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
      <p className="font-black text-blue-700">
        {plan} 功能 — 即將推出
      </p>
      {/* TODO: Stripe checkout */}
    </div>
  )
}
