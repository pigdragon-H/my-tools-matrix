// PremiumTeaser.tsx
// Reusable premium plan teaser — stub-first.
// To activate: set ENABLE_PREMIUM=true and wire Stripe checkout in onClick handler.

import { isEnabled } from "@/config/featureFlags";
import type { Lang } from "@/contexts/LanguageContext";
import { Sparkles, Crown, Zap } from "lucide-react";

interface PremiumTeaserProps {
  lang: Lang;
}

const PLANS = [
  {
    plan: "PRO",
    icon: Sparkles,
    price: { zh: "NT$ 96 / 月", en: "$3 / month" },
    title: { zh: "個人專業版", en: "PRO" },
    features: {
      zh: ["移除廣告", "儲存計算紀錄", "匯出 PDF / CSV", "進階公式組合"],
      en: ["Ad-free", "Save calculation history", "Export PDF / CSV", "Advanced formula combos"],
    },
  },
  {
    plan: "TEAM",
    icon: Crown,
    price: { zh: "NT$ 330 / 月", en: "$9 / month" },
    title: { zh: "團隊版", en: "TEAM" },
    features: {
      zh: ["包含 PRO 全部功能", "團隊共享空間", "5 位成員", "API 額度 10,000 / 月"],
      en: ["All PRO features", "Team workspaces", "5 seats", "10,000 API calls / month"],
    },
  },
  {
    plan: "AGENCY",
    icon: Zap,
    price: { zh: "NT$ 996 / 月", en: "$33 / month" },
    title: { zh: "代理 / 企業版", en: "AGENCY" },
    features: {
      zh: ["包含 TEAM 全部功能", "白標品牌", "20 位成員", "API 額度 100,000 / 月"],
      en: ["All TEAM features", "White-label", "20 seats", "100,000 API calls / month"],
    },
  },
] as const;

export function PremiumTeaser({ lang }: PremiumTeaserProps) {
  const isLive = isEnabled("ENABLE_PREMIUM");
  const ctaLabel = isLive
    ? lang === "zh"
      ? "立即升級"
      : "Upgrade now"
    : lang === "zh"
    ? "即將推出"
    : "Coming soon";

  return (
    <section
      data-stub="premium-teaser"
      data-todo="wire-stripe-checkout-when-payment-ready"
      className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-6 shadow-sm dark:border-blue-900/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/30 md:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white">
          Premium
        </span>
        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
          {lang === "zh" ? "進階方案規劃中" : "Plans in progress"}
        </p>
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
        {lang === "zh" ? "解鎖更多公式與工作流" : "Unlock more formulas and workflows"}
      </h3>
      <p className="mt-1 text-sm font-bold italic text-blue-700 dark:text-blue-300">
        {lang === "zh"
          ? "知識付費，但不要成為負擔。"
          : "Pay for knowledge — never let it weigh you down."}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {lang === "zh"
          ? "Premium 方案會帶來無廣告體驗、計算紀錄、PDF 匯出、團隊協作與 API 額度,幫你把 Tool Matrix 變成日常決策的延伸。"
          : "Premium plans will bring an ad-free experience, calculation history, PDF export, team collaboration, and API quotas — extending Tool Matrix into your everyday decision flow."}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.plan}
              data-stub="premium-plan-card"
              data-plan={p.plan}
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-blue-900/50 dark:bg-slate-900/80"
            >
              <div className="mb-3 flex items-center justify-between">
                <Icon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                  {p.plan}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {p.title[lang]}
              </h4>
              <p className="mt-1 text-sm font-bold text-blue-900 dark:text-blue-200">
                {p.price[lang]}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                {p.features[lang].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-300">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={!isLive}
                onClick={() => {
                  if (!isLive) return;
                  // TODO: redirect to /api/checkout?plan={p.plan} when Stripe ready
                }}
                className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-black transition ${
                  isLive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {ctaLabel}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
