import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { defaultSeo, setSeoMeta } from "@/lib/seo";
import { TrustStrip } from "@/components/business/TrustStrip";

export default function Privacy() {
  const { lang } = useLanguage();

  useEffect(() => {
    setSeoMeta({
      ...defaultSeo,
      title:
        lang === "zh"
          ? "隱私政策｜Formula Universe"
          : "Privacy Policy | Formula Universe",
    });
  }, [lang]);

  const lastUpdated = "2025-01-15";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_48%,#ecfeff_100%)] dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-14 md:py-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
            {lang === "zh" ? "法律與隱私" : "Legal & Privacy"}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
            {lang === "zh" ? "隱私政策" : "Privacy Policy"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {lang === "zh"
              ? "我們重視你的隱私。這份政策說明 Formula Universe 如何處理 (或不處理) 你的個人資料。"
              : "We respect your privacy. This policy explains how Formula Universe handles (or does not handle) your personal data."}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {lang === "zh" ? `最後更新：${lastUpdated}` : `Last updated: ${lastUpdated}`}
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <article className="prose prose-slate max-w-3xl dark:prose-invert">
          <h2>{lang === "zh" ? "1. 我們收集什麼資料" : "1. What we collect"}</h2>
          <p>
            {lang === "zh"
              ? "大多數計算工具完全在你的瀏覽器內執行,我們不會傳送你輸入的數值到伺服器。我們會收集匿名的訪問統計 (頁面瀏覽次數、瀏覽器類型、語言) 用來改善網站。"
              : "Most calculation tools run entirely in your browser; we do not send your input values to our servers. We collect anonymous visit statistics (page views, browser type, language) to improve the site."}
          </p>

          <h2>{lang === "zh" ? "2. Cookie 與第三方服務" : "2. Cookies and third-party services"}</h2>
          <p>
            {lang === "zh"
              ? "本站可能使用 Google Analytics 與 Google AdSense 來提供匿名分析與廣告。這些服務會在你的瀏覽器設定 cookie。你可以在瀏覽器設定中停用或刪除 cookie。"
              : "This site may use Google Analytics and Google AdSense for anonymous analytics and advertising. These services set cookies in your browser. You can disable or delete cookies in your browser settings."}
          </p>

          <h2>{lang === "zh" ? "3. 你的資料權利" : "3. Your data rights"}</h2>
          <p>
            {lang === "zh"
              ? "我們不販售也不分享個人資料給第三方做行銷用途。如果你曾透過電子報訂閱、聯絡表單或付費方案提供 email,你可以隨時要求刪除。"
              : "We do not sell or share personal data with third parties for marketing. If you have provided your email via newsletter, contact, or paid plan, you may request deletion at any time."}
          </p>

          <h2>{lang === "zh" ? "4. 兒童隱私" : "4. Children's privacy"}</h2>
          <p>
            {lang === "zh"
              ? "本站不主動針對 13 歲以下兒童收集資料。"
              : "This site does not knowingly collect data from children under 13."}
          </p>

          <h2>{lang === "zh" ? "5. 政策變更" : "5. Changes to this policy"}</h2>
          <p>
            {lang === "zh"
              ? "本政策若有重大調整,我們會在頁首更新版本日期,並在首頁顯著位置公告至少 14 天。"
              : "If this policy materially changes, we will update the date at the top and announce it prominently on the homepage for at least 14 days."}
          </p>

          <h2>{lang === "zh" ? "6. 聯絡方式" : "6. Contact"}</h2>
          <p>
            {lang === "zh"
              ? "隱私相關問題請寄至 hello@formulauniverse.dev,我們會在 7 個工作日內回覆。"
              : "For privacy questions, email hello@formulauniverse.dev. We respond within 7 business days."}
          </p>

          <p className="text-sm text-slate-500">
            <em>
              {lang === "zh"
                ? "* 本頁為初版範本。隨著本站接入廣告 / 訂閱 / 帳號系統,本政策將持續更新。"
                : "* This page is an initial template. It will be updated as ads / subscriptions / accounts come online."}
            </em>
          </p>
        </article>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:underline dark:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === "zh" ? "回首頁" : "Back to home"}
          </Link>
        </div>
      </section>

      <TrustStrip lang={lang} variant="compact" />
    </div>
  );
}
