// TrustStrip.tsx
// Reusable trust strip — sources, editorial, legal links.
// Required for AdSense audit. Always render unless ENABLE_TRUST_LINKS=false.

import { Link } from "wouter";
import { isEnabled } from "@/config/featureFlags";
import type { Lang } from "@/contexts/LanguageContext";
import { ShieldCheck, BookOpenCheck, FileText, Mail, Github, ArrowRight, ExternalLink } from "lucide-react";

interface TrustStripProps {
  lang: Lang;
  variant?: "default" | "compact";
}

export function TrustStrip({ lang, variant = "default" }: TrustStripProps) {
  if (!isEnabled("ENABLE_TRUST_LINKS")) return null;

  const items = [
    {
      icon: ShieldCheck,
      title: { zh: "隱私保護", en: "Privacy" },
      description: {
        zh: "我們不販售用戶資料，計算結果預設只在您的瀏覽器執行。",
        en: "We do not sell user data; calculations run in your browser by default.",
      },
      href: "/privacy",
      cta: { zh: "閱讀隱私政策", en: "Read privacy policy" },
    },
    {
      icon: FileText,
      title: { zh: "使用條款", en: "Terms" },
      description: {
        zh: "工具僅供參考，重要決策仍應諮詢專業人士。",
        en: "Tools are for reference; critical decisions should consult professionals.",
      },
      href: "/terms",
      cta: { zh: "閱讀使用條款", en: "Read terms" },
    },
    {
      icon: BookOpenCheck,
      title: { zh: "編輯方針", en: "Editorial standards" },
      description: {
        zh: "公式來源、審稿流程、利益衝突揭露都記錄在編輯方針。",
        en: "Sources, review workflow, and conflict-of-interest disclosure are documented.",
      },
      href: "/editorial",
      cta: { zh: "閱讀編輯方針", en: "Read editorial" },
    },
  ];

  const contactLinks = [
    {
      icon: Mail,
      label: { zh: "聯絡我們", en: "Contact us" },
      description: {
        zh: "回報錯誤、授權合作或提出公式校正建議。",
        en: "Report issues, request partnerships, or suggest formula corrections.",
      },
      action: { zh: "前往聯絡頁", en: "Open contact page" },
      href: "/contact",
      external: false,
    },
    {
      icon: Github,
      label: { zh: "原始碼", en: "Source code" },
      description: {
        zh: "查看公開程式碼、提交 issue，或追蹤更新紀錄。",
        en: "Review public code, file issues, or follow release history.",
      },
      action: { zh: "查看 GitHub", en: "View GitHub" },
      href: "https://github.com/pigdragon-H/my-tools-matrix",
      external: true,
    },
  ];

  if (variant === "compact") {
    return (
      <section
        data-stub="trust-strip-compact"
        className="border-t border-slate-200 bg-white/60 py-8 dark:border-slate-800 dark:bg-slate-950/60"
      >
        <div className="container flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {lang === "zh"
              ? "我們公開公式來源、審稿方針與聯絡方式,讓使用者放心使用每一個結果。"
              : "We publish formula sources, editorial standards, and contact info so every result is trustworthy."}
          </p>
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            <Link href="/privacy" className="text-blue-700 hover:underline dark:text-blue-300">
              {lang === "zh" ? "隱私政策" : "Privacy"}
            </Link>
            <Link href="/terms" className="text-blue-700 hover:underline dark:text-blue-300">
              {lang === "zh" ? "使用條款" : "Terms"}
            </Link>
            <Link href="/editorial" className="text-blue-700 hover:underline dark:text-blue-300">
              {lang === "zh" ? "編輯方針" : "Editorial"}
            </Link>
            <Link href="/contact" className="text-blue-700 hover:underline dark:text-blue-300">
              {lang === "zh" ? "聯絡我們" : "Contact"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-stub="trust-strip"
      className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950 md:py-16"
    >
      <div className="container">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
            {lang === "zh" ? "信任與透明" : "Trust & Transparency"}
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
            {lang === "zh" ? "為什麼可以信任這些結果" : "Why you can trust these results"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            {lang === "zh"
              ? "每個工具都標註公式來源、限制條件與適用情境,並遵循公開的編輯方針與隱私原則。"
              : "Every tool labels its formula sources, limitations, and applicable context — under a public editorial policy and privacy principle."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-700"
              >
                <Icon className="mb-3 h-6 w-6 text-blue-600 dark:text-blue-300" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {item.title[lang]}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.description[lang]}
                </p>
                <p className="mt-4 text-sm font-bold text-blue-700 group-hover:underline dark:text-blue-300">
                  {item.cta[lang]} →
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">
                {lang === "zh" ? "聯絡選項" : "Contact options"}
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                {lang === "zh" ? "需要協助或想檢視專案？" : "Need help or want to inspect the project?"}
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {lang === "zh"
                ? "我們把聯絡入口與公開原始碼整理成可點擊卡片，方便快速回報、審閱與追蹤。"
                : "Contact and source links are presented as clear action cards for reporting, reviewing, and tracking updates."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {contactLinks.map((c) => {
              const Icon = c.icon;
              const indicator = c.external ? (
                <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              ) : (
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              );
              const content = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-900 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-black text-slate-900 dark:text-white">
                      {c.label[lang]}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {c.description[lang]}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 dark:text-blue-300">
                      {c.action[lang]}
                      {indicator}
                    </span>
                  </span>
                </>
              );

              return c.external ? (
                <a
                  key={c.href}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:from-slate-900/70 dark:to-slate-950 dark:hover:border-blue-700 dark:focus-visible:ring-offset-slate-950"
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group flex gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:from-slate-900/70 dark:to-slate-950 dark:hover:border-blue-700 dark:focus-visible:ring-offset-slate-950"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
