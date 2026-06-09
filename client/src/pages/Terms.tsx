import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { defaultSeo, setSeoMeta } from "@/lib/seo";
import { TrustStrip } from "@/components/business/TrustStrip";

export default function Terms() {
  const { lang } = useLanguage();

  useEffect(() => {
    setSeoMeta({
      ...defaultSeo,
      title:
        lang === "zh"
          ? "使用條款｜Formula Universe"
          : "Terms of Service | Formula Universe",
    });
  }, [lang]);

  const lastUpdated = "2025-01-15";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_48%,#ecfeff_100%)] dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-14 md:py-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
            {lang === "zh" ? "法律與條款" : "Legal & Terms"}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
            {lang === "zh" ? "使用條款" : "Terms of Service"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {lang === "zh"
              ? "使用 Formula Universe 即代表您同意以下條款。"
              : "By using Formula Universe you agree to the following terms."}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {lang === "zh" ? `最後更新：${lastUpdated}` : `Last updated: ${lastUpdated}`}
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <article className="prose prose-slate max-w-3xl dark:prose-invert">
          <h2>{lang === "zh" ? "1. 服務性質" : "1. Nature of the service"}</h2>
          <p>
            {lang === "zh"
              ? "本網站提供公式、計算工具與知識文章,目的是協助使用者快速理解概念與估算結果。所有計算結果僅供參考,不構成醫療、財務、法律或專業建議。"
              : "This site provides formulas, calculators, and knowledge articles to help users understand concepts and estimate results. All outputs are for reference only and do not constitute medical, financial, legal, or professional advice."}
          </p>

          <h2>{lang === "zh" ? "2. 使用限制" : "2. Acceptable use"}</h2>
          <p>
            {lang === "zh"
              ? "您同意不對本網站進行: 自動化大量爬取、攻擊性掃描、繞過付費或廣告機制、發布違法內容,或冒用他人身份。"
              : "You agree not to: scrape the site at scale, run intrusive scans, bypass paid or ad mechanics, publish illegal content, or impersonate others."}
          </p>

          <h2>{lang === "zh" ? "3. 智慧財產" : "3. Intellectual property"}</h2>
          <p>
            {lang === "zh"
              ? "網站介面、文字與品牌屬 PiGragon-H 所有。公式本身屬公共知識,但本站的解釋、範例與排版受著作權保護。允許個人非商業引用,並請註明來源連結。"
              : "Site interface, text, and branding are property of PiGragon-H. Formulas themselves are public knowledge, but our explanations, examples, and layouts are copyrighted. Personal non-commercial citation with link is permitted."}
          </p>

          <h2>{lang === "zh" ? "4. 廣告與聯盟連結" : "4. Ads and affiliate links"}</h2>
          <p>
            {lang === "zh"
              ? "本站可能顯示 Google AdSense 廣告與聯盟行銷連結。當您透過聯盟連結購買,我們可能獲得佣金,這不會增加您的成本,也不會影響我們對工具或公式的評估。"
              : "This site may show Google AdSense ads and affiliate links. If you purchase through an affiliate link, we may earn a commission. This does not increase your cost and does not influence our evaluation of tools or formulas."}
          </p>

          <h2>{lang === "zh" ? "5. 免責聲明" : "5. Disclaimer"}</h2>
          <p>
            {lang === "zh"
              ? "本網站以「現狀」提供,不保證計算結果絕對準確,也不對您因使用本服務造成的任何損失負責。重要決策 (健康、投資、法律) 請諮詢合格的專業人士。"
              : "This site is provided 'as is' without guarantee of accuracy. We are not liable for losses arising from your use of the service. For important decisions (health, investment, legal) consult a qualified professional."}
          </p>

          <h2>{lang === "zh" ? "6. 條款變更" : "6. Changes to terms"}</h2>
          <p>
            {lang === "zh"
              ? "我們可能不時調整本條款。重大變更將在首頁公告至少 14 天。繼續使用即視為同意更新後的條款。"
              : "We may update these terms occasionally. Material changes will be announced on the homepage for at least 14 days. Continued use constitutes acceptance of updated terms."}
          </p>

          <h2>{lang === "zh" ? "7. 準據法" : "7. Governing law"}</h2>
          <p>
            {lang === "zh"
              ? "本條款依中華民國 (台灣) 法律解釋。"
              : "These terms are governed by the laws of Taiwan (Republic of China)."}
          </p>

          <p className="text-sm text-slate-500">
            <em>
              {lang === "zh"
                ? "* 本頁為初版範本,將隨服務功能更新而調整。"
                : "* This page is an initial template and will be revised as features mature."}
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
