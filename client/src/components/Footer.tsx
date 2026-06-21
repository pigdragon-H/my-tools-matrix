// ============================================================
// Footer.tsx — 全站共用頁尾（合規關鍵）
// ------------------------------------------------------------
// 設計（最高指揮官確認）：
//   1. 掛在 App.tsx <main> 之後 → 全站每一頁（含所有工具小卡頁 / ToolPage /
//      CategoryPage / AllToolsPage）底部都自動有隱私權政策連結。
//      解決 AdSense / GDPR / CCPA「隱私權政策需全站可達」的合規缺口。
//   2. 永遠渲染：不受任何 feature flag 控制（先前 TrustStrip 受
//      ENABLE_TRUST_LINKS 控制會「自動消失」→ 此 Footer 不再會消失）。
//   3. 不含 GitHub 原始碼連結（先前首頁底 TrustStrip 暴露原始碼 → 此處移除）。
//   4. 含完整合規連結：隱私權政策、使用條款、Cookie 政策(/privacy#cookies)、
//      編輯方針、關於、聯絡我們、版權年份。
//   5. 中英雙語（依 useLanguage 的 lang 切換）。
//   6. 字型對齊標準：標題 14px(輔助上標)、連結/內文 14~16px、行高 1.6。
// ============================================================

import { Link } from "wouter";
import { Layers } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { lang } = useLanguage();
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const year = new Date().getFullYear();

  // 法律 / 合規連結（AdSense 稽核最在意這一欄）
  const legalLinks = [
    { href: "/privacy", label: t("隱私權政策", "Privacy Policy") },
    { href: "/privacy#cookies", label: t("Cookie 政策", "Cookie Policy") },
    { href: "/terms", label: t("使用條款", "Terms of Service") },
    { href: "/editorial", label: t("編輯方針", "Editorial Standards") },
  ];

  // 探索 / 內容連結
  // 重要對應（與 Navbar / laneRegistry 一致，勿混淆）：
  //   /blog      → 工具知識庫 (Tool Knowledge)
  //   /knowledge → AI 知識庫 (AI Knowledge)
  const exploreLinks = [
    { href: "/tools", label: t("所有工具", "All Tools") },
    { href: "/blog", label: t("工具知識庫", "Tool Knowledge") },
    { href: "/knowledge", label: t("AI 知識庫", "AI Knowledge") },
    { href: "/about", label: t("關於我們", "About") },
  ];

  // 聯絡連結
  const contactLinks = [
    { href: "/contact", label: t("聯絡我們", "Contact Us") },
  ];

  return (
    <footer className="border-t border-border bg-muted/30 text-muted-foreground">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* 站名 + 簡述 */}
          <div className="lg:pr-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Layers className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">
                Formula Universe
              </span>
            </Link>
            <p className="mt-3 text-sm leading-[1.6]">
              {t(
                "免費、快速的線上計算與決策輔助工具。多數工具在您的瀏覽器端執行，預設不會將輸入資料傳送到我們的伺服器。",
                "Free, fast online calculators and decision-support tools. Most tools run in your browser, and inputs are not sent to our servers by default.",
              )}
            </p>
          </div>

          {/* 法律 / 合規 */}
          <nav aria-label={t("法律與隱私", "Legal & Privacy")}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              {t("法律與隱私", "Legal & Privacy")}
            </h2>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm leading-[1.6] transition-colors hover:text-primary hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 探索 */}
          <nav aria-label={t("探索", "Explore")}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              {t("探索", "Explore")}
            </h2>
            <ul className="mt-3 space-y-2">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm leading-[1.6] transition-colors hover:text-primary hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 聯絡 */}
          <nav aria-label={t("聯絡", "Contact")}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              {t("聯絡", "Contact")}
            </h2>
            <ul className="mt-3 space-y-2">
              {contactLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm leading-[1.6] transition-colors hover:text-primary hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 版權 + 廣告/聯盟揭露 */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm leading-[1.6] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Formula Universe. {t("版權所有。", "All rights reserved.")}</p>
          <p className="max-w-2xl sm:text-right">
            {t(
              "本網站可能顯示 Google AdSense 廣告與站內聯盟連結；相關 Cookie 與資料處理請見隱私權政策。",
              "This site may show Google AdSense ads and affiliate links; see the Privacy Policy for related cookies and data handling.",
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
