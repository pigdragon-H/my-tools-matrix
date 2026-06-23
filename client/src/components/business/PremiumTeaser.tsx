// PremiumTeaser.tsx — Phase G Sprint C
// Pricing tiers with a real "Notify me" capture wired to /trpc/newsletter.subscribe
// (segmented by source="pricing-interest"). When ENABLE_PREMIUM flips true,
// the cards switch to actual upgrade CTAs.

import { useState } from "react";
import { isEnabled } from "@/config/featureFlags";
import { trpc } from "@/lib/trpc";
import type { Lang } from "@/contexts/LanguageContext";
import { Sparkles, Crown, Zap, Loader2, BellRing } from "lucide-react";

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
  const [showNotifyForm, setShowNotifyForm] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setFeedback({
        kind: "success",
        text:
          data?.message ??
          (lang === "zh"
            ? "✓ 我們會在 Premium 開放時通知您!"
            : "✓ We'll notify you when Premium launches!"),
      });
      setEmail("");
      setShowNotifyForm(null);
    },
    onError: (err) => {
      setFeedback({
        kind: "error",
        text:
          err.message ||
          (lang === "zh" ? "提交失敗,請稍後再試。" : "Could not submit. Please try again."),
      });
    },
  });

  if (!isLive) return null;

  return (
    <section
      data-review-note="premium-info"
      className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-6 shadow-sm dark:border-blue-900/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/30 md:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white">
          Premium
        </span>
        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
          {lang === "zh" ? "搶先預約 — 早鳥通知名單" : "Early access — notification list"}
        </p>
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
        {lang === "zh" ? "解鎖更多公式與工作流" : "Unlock more formulas and workflows"}
      </h3>
      <p className="mt-1 text-sm font-bold italic text-blue-700 dark:text-blue-300">
        {lang === "zh"
          ? "知識付費,但不要成為負擔。"
          : "Pay for knowledge — never let it weigh you down."}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {lang === "zh"
          ? "Premium 方案會帶來無廣告體驗、計算紀錄、PDF 匯出、團隊協作與 API 額度,幫您把 Formula Universe 變成日常決策的延伸。"
          : "Premium plans will bring an ad-free experience, calculation history, PDF export, team collaboration, and API quotas — extending Formula Universe into your everyday decision flow."}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const Icon = p.icon;
          const isThisFormOpen = showNotifyForm === p.plan;
          return (
            <div
              key={p.plan}
              data-review-note="premium-plan-info"
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

              {isLive ? (
                <button
                  type="button"
                  onClick={() => {
                    // TODO: redirect to /api/checkout?plan={p.plan} when Stripe ready
                  }}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  {lang === "zh" ? "立即升級" : "Upgrade now"}
                </button>
              ) : isThisFormOpen ? (
                <form
                  className="mt-5 space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email) return;
                    setFeedback(null);
                    subscribe.mutate({
                      email,
                      source: `pricing-interest:${p.plan.toLowerCase()}`,
                      lang,
                    });
                  }}
                >
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={subscribe.isPending}
                    aria-label={lang === "zh" ? "Email 地址" : "Email address"}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 dark:border-blue-900/50 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={subscribe.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    {subscribe.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {lang === "zh" ? "送出中…" : "Submitting…"}
                      </>
                    ) : (
                      <>
                        <BellRing className="h-4 w-4" />
                        {lang === "zh" ? "通知我" : "Notify me"}
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setShowNotifyForm(p.plan);
                  }}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-black text-blue-700 transition hover:border-blue-500 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-blue-950/50"
                >
                  <BellRing className="h-4 w-4" />
                  {lang === "zh" ? "開放時通知我" : "Notify me when available"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-4 min-h-[1.25rem]">
        {feedback ? (
          <p
            className={`text-xs font-bold ${
              feedback.kind === "success"
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {feedback.text}
          </p>
        ) : null}
      </div>
    </section>
  );
}
