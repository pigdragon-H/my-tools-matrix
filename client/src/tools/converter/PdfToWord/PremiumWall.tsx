/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  PdfToWord — Premium Wall (L1+ high-fidelity path)                          ║
 * ║                                                                            ║
 * ║  Shown ONLY when the uploaded PDF is detected as L1+ (complex layout:       ║
 * ║  multi-column / dense tables / image-heavy / scanned).                      ║
 * ║                                                                            ║
 * ║  Flow (matches the user's flowchart):                                       ║
 * ║    detect L1+  →  show first-page PHOTO-GRADE preview (the "hook")          ║
 * ║                →  paywall (subscription OR one-time)                        ║
 * ║                →  on paid + quota, backend calls CloudConvert               ║
 * ║                                                                            ║
 * ║  Cost guard: NO CloudConvert call happens here. The preview is a single     ║
 * ║  first-page raster render produced cheaply server-side; the real high-      ║
 * ║  fidelity conversion is triggered only after a verified payment.            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import { useState } from "react";

type Lang = "zh" | "en";

export interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  highlight?: boolean;
  features: string[];
  badge?: string;
}

export interface PremiumWallText {
  detectedTitle: string;
  detectedDesc: string;
  previewTitle: string;
  previewCaption: string;
  previewLoading: string;
  plansTitle: string;
  plansSubtitle: string;
  oneTimeTitle: string;
  payEcpay: string;
  payStripe: string;
  payNote: string;
  guarantee: string[];
  chooseCta: string;
}

interface PremiumWallProps {
  lang: Lang;
  t: PremiumWallText;
  /** First-page photo-grade preview image (data URL or remote URL). */
  previewUrl: string;
  /** True while the backend is rendering the first-page preview. */
  previewLoading: boolean;
  fileName: string;
  plans: PlanOption[];
  oneTime: PlanOption;
  /** Invoked when the user picks a plan + gateway. Backend wiring lands later. */
  onCheckout: (planId: string, gateway: "ecpay" | "stripe") => void;
}

export function PremiumWall({
  t,
  previewUrl,
  previewLoading,
  fileName,
  plans,
  oneTime,
  onCheckout,
}: PremiumWallProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(
    plans.find((p) => p.highlight)?.id ?? plans[0]?.id ?? oneTime.id,
  );

  const allPlans = [...plans, oneTime];
  const active = allPlans.find((p) => p.id === selectedPlan) ?? plans[0];

  return (
    <section className="space-y-6">
      {/* Detected banner */}
      <div className="rounded-[2rem] border border-violet-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 p-6 text-center shadow-sm">
        <span className="inline-block rounded-full bg-violet-600 px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-white">
          High-Fidelity
        </span>
        <h3 className="mt-3 text-2xl font-black text-slate-900">{t.detectedTitle}</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{t.detectedDesc}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* First-page photo-grade preview (the hook) */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-black text-slate-700">{t.previewTitle}</p>
          <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {previewLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-violet-500" />
                  <span className="text-sm font-bold">{t.previewLoading}</span>
                </div>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={`${fileName} — page 1 preview`}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-slate-300">📄</div>
            )}
          </div>
          <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">{t.previewCaption}</p>
        </div>

        {/* Paywall */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-slate-700">{t.plansTitle}</p>
          <p className="mb-4 text-xs text-slate-500">{t.plansSubtitle}</p>

          <div className="space-y-3">
            {allPlans.map((p) => {
              const isActive = p.id === selectedPlan;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlan(p.id)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                    isActive
                      ? "border-violet-500 bg-violet-50 shadow"
                      : "border-slate-200 bg-white hover:border-violet-300"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-black text-slate-900">{p.name}</span>
                    <span className="text-right">
                      <span className="text-xl font-black text-violet-700">{p.price}</span>
                      <span className="ml-1 text-xs font-bold text-slate-400">{p.period}</span>
                    </span>
                  </div>
                  {p.badge && (
                    <span className="mt-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-black text-violet-700">
                      {p.badge}
                    </span>
                  )}
                  <ul className="mt-2 space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-1.5 text-xs leading-relaxed text-slate-600">
                        <span className="shrink-0 text-violet-500">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Dual gateway */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onCheckout(active.id, "ecpay")}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700 active:scale-[0.97]"
              style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)", transitionDuration: "160ms" }}
            >
              {t.payEcpay}
            </button>
            <button
              type="button"
              onClick={() => onCheckout(active.id, "stripe")}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:bg-indigo-700 active:scale-[0.97]"
              style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)", transitionDuration: "160ms" }}
            >
              {t.payStripe}
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">{t.payNote}</p>

          <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            {t.guarantee.map((g) => (
              <li key={g} className="flex items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-2 text-center text-[11px] font-bold text-slate-600">
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
