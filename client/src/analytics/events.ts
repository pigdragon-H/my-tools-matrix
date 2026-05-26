// events.ts
// Analytics 事件預留 — 不實作，只定義合約
// 未來接入 GA4 或 Posthog 時只需要實作這些函數

export const analytics = {
  homepageView: () => {
    // TODO: GA4 / Posthog
  },
  toolView: (toolName: string) => {
    // TODO: GA4 / Posthog
  },
  toolSubmit: (toolName: string) => {
    // TODO: GA4 / Posthog
  },
  journeyClick: (from: string, to: string) => {
    // TODO: GA4 / Posthog
  },
  knowledgeClick: (section: string) => {
    // TODO: GA4 / Posthog
  },
  premiumClick: (plan: string) => {
    // TODO: GA4 / Posthog
  },
  affiliateClick: (item: string) => {
    // TODO: GA4 / Posthog
  },
}
