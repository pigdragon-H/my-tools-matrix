import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export function SiteFooter() {
  const { lang } = useLanguage();
  const year = new Date().getFullYear();

  const links = [
    { href: "/about", label: { zh: "關於我們", en: "About" } },
    { href: "/privacy", label: { zh: "隱私政策", en: "Privacy" } },
    { href: "/terms", label: { zh: "使用條款", en: "Terms" } },
    { href: "/contact", label: { zh: "聯絡我們", en: "Contact" } },
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-100 dark:border-slate-800">
      <div className="container flex flex-col gap-4 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-black">Formula Universe</p>
          <p className="mt-1 max-w-2xl text-slate-400">
            {lang === "zh"
              ? "免費線上計算、AI 知識與決策輔助工具。內容僅供教育與一般資訊參考，不構成醫療、法律、稅務或投資建議。"
              : "Free online calculators, AI knowledge, and decision-support tools. Content is for education and general information only, not medical, legal, tax, or investment advice."}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer links">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate-300 transition hover:text-white hover:underline">
              {item.label[lang]}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-slate-800 py-4">
        <div className="container text-xs text-slate-500">
          © {year} Formula Universe. {lang === "zh" ? "最後更新：2025-01-15。" : "Last updated: 2025-01-15."}
        </div>
      </div>
    </footer>
  );
}
