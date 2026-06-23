// AffiliateGrid.tsx
// Reusable affiliate recommendations grid — stub-first.
// To activate: set ENABLE_AFFILIATE=true and replace href values with real partner URLs.

import { isEnabled } from "@/config/featureFlags";
import type { Lang } from "@/contexts/LanguageContext";

export type AffiliateItem = {
  label: { zh: string; en: string };
  description?: { zh: string; en: string };
  href: string;            // disabled until partner signed
  emoji?: string;
};

interface AffiliateGridProps {
  lang: Lang;
  items: AffiliateItem[];
  title?: { zh: string; en: string };
  disclosureText?: { zh: string; en: string };
}

const defaultDisclosure = {
  zh: "* 聯盟連結，購買後我們可能獲得佣金。",
  en: "* Affiliate links. We may earn a commission.",
};

const defaultTitle = {
  zh: "推薦資源",
  en: "Recommended resources",
};

export function AffiliateGrid({ lang, items, title, disclosureText }: AffiliateGridProps) {
  const t = title ?? defaultTitle;
  const d = disclosureText ?? defaultDisclosure;
  const isLive = isEnabled("ENABLE_AFFILIATE");

  if (!isLive) return null;

  return (
    <section
      data-review-note="resource-grid"
      data-todo="commercial-links-disabled-during-review"
      className="rounded-[2rem] border border-amber-200 bg-amber-50/80 p-6 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20 md:p-8"
    >
      <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
        {lang === "zh" ? "聯盟推薦" : "Affiliate"}
      </p>
      <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
        {t[lang]}
      </h3>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <a
            key={item.href + item.label.zh}
            href={item.href}
            data-review-note="resource-card"
            data-affiliate-href={item.href}
            onClick={(e) => {
              if (!isLive) e.preventDefault();
            }}
            className={`group rounded-2xl border border-amber-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md dark:border-amber-900/50 dark:bg-slate-900/80 ${
              isLive ? "" : "cursor-not-allowed opacity-90"
            }`}
          >
            {item.emoji ? (
              <div className="mb-2 text-2xl" aria-hidden="true">
                {item.emoji}
              </div>
            ) : null}
            <div className="text-sm font-black text-amber-900 dark:text-amber-100">
              {item.label[lang]}
            </div>
            {item.description ? (
              <div className="mt-1 text-xs leading-5 text-amber-800/80 dark:text-amber-200/70">
                {item.description[lang]}
              </div>
            ) : null}
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-amber-700 dark:text-amber-300">
        {d[lang]}
      </p>
    </section>
  );
}
