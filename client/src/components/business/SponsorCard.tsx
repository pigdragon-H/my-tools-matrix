// SponsorCard.tsx
// 贊助商預留元件

interface SponsorCardProps {
  title: string
  logo?: string
  link?: string
  variant?: "banner" | "card" | "inline"
}

const ENABLE_SPONSOR = false

export function SponsorCard({ title, logo, link, variant = "card" }: SponsorCardProps) {
  if (!ENABLE_SPONSOR) return null
  return (
    <div data-sponsor={title} className="rounded-2xl border border-slate-200 p-4">
      {title}
    </div>
  )
}
