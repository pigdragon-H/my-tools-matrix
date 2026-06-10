import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { defaultSeo, setSeoMeta } from "@/lib/seo";
import { TrustStrip } from "@/components/business/TrustStrip";

export default function Terms() {
  const { lang } = useLanguage();
  const lastUpdated = "2026-06-10";
  const contactEmail = "pigragonh@gmail.com";

  useEffect(() => {
    setSeoMeta({
      ...defaultSeo,
      title: lang === "zh" ? "使用條款｜Formula Universe" : "Terms of Service | Formula Universe",
      description:
        lang === "zh"
          ? "Formula Universe 使用條款：說明工具結果、專業免責、可接受使用、廣告、聯盟連結、Premium 與責任限制。"
          : "Formula Universe terms covering tool outputs, professional disclaimers, acceptable use, ads, affiliate links, Premium access, and limitations of liability.",
    });
  }, [lang]);

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
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {lang === "zh" ? "使用 Formula Universe 即代表您同意本條款。若您不同意，請停止使用本網站與相關服務。" : "By using Formula Universe, you agree to these terms. If you do not agree, please stop using the site and related services."}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {lang === "zh" ? `最後更新：${lastUpdated}` : `Last updated: ${lastUpdated}`}
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <article className="prose prose-slate max-w-4xl dark:prose-invert">
          <h2>{lang === "zh" ? "1. 服務內容" : "1. Service scope"}</h2>
          <p>{lang === "zh" ? "Formula Universe 提供計算器、轉換器、知識文章、比較表、範例與相關資源。服務目的在於協助使用者快速估算、理解公式、整理情境與建立決策參考，而不是取代專業判斷。" : "Formula Universe provides calculators, converters, knowledge articles, comparison tables, examples, and related resources. The service helps users estimate, understand formulas, organize scenarios, and build decision references; it does not replace professional judgment."}</p>
          <p>{lang === "zh" ? "我們可能新增、修改、暫停或移除部分功能、內容、分類、廣告版位或 Premium 項目。若變更涉及重大使用規則，會盡量於相關頁面或公告區提示。" : "We may add, modify, suspend, or remove features, content, categories, ad placements, or Premium items. If a change affects major usage rules, we will try to note it on relevant pages or announcements."}</p>

          <h2>{lang === "zh" ? "2. 工具結果與專業免責" : "2. Tool outputs and professional disclaimer"}</h2>
          <p>{lang === "zh" ? "所有計算結果、公式解釋、風險提示、分數、等級、預估值與建議文字均僅供一般資訊與教育參考。這些內容不構成醫療、財務、投資、法律、稅務、工程、安全、保險或其他專業建議。" : "All calculation results, formula explanations, risk notices, scores, ratings, estimates, and recommendation text are for general information and education only. They are not medical, financial, investment, legal, tax, engineering, safety, insurance, or other professional advice."}</p>
          <p>{lang === "zh" ? "任何重要決策都應由您自行驗證輸入資料、公式假設、當地法規、時效與專業來源；必要時請諮詢合格專業人士。您不得將本網站輸出作為唯一決策依據。" : "For important decisions, you must verify inputs, formula assumptions, local rules, timing, and professional sources; consult qualified professionals when needed. You must not rely on site outputs as the sole basis for a decision."}</p>

          <h2>{lang === "zh" ? "3. 可接受使用" : "3. Acceptable use"}</h2>
          <p>{lang === "zh" ? "您同意不進行下列行為：攻擊、干擾或測試網站安全邊界；大量自動化請求或惡意爬取；繞過廣告、Premium、速率限制或存取控制；上傳或輸入違法、侵權、惡意、誤導或含個資濫用風險的內容。" : "You agree not to attack, disrupt, or probe site security boundaries; send excessive automated requests or malicious scraping; bypass ads, Premium, rate limits, or access controls; or upload/enter illegal, infringing, malicious, misleading, or privacy-abusive content."}</p>
          <p>{lang === "zh" ? "合理的搜尋引擎索引、一般瀏覽器使用、人工研究與低頻 API/頁面測試通常可接受；但不得造成服務負載、資料濫用或規避商業模式。" : "Reasonable search engine indexing, normal browser use, human research, and low-frequency page testing are generally acceptable, but must not create service load, data abuse, or business-model circumvention."}</p>

          <h2>{lang === "zh" ? "4. 帳號、Premium 與付款" : "4. Accounts, Premium, and payment"}</h2>
          <p>{lang === "zh" ? "若本網站提供帳號、Premium、訂閱、下載、匯出或進階功能，您需提供正確資訊並妥善保護登入憑證。Premium 功能可能依方案、地區、測試狀態或技術限制而調整。" : "If the site offers accounts, Premium, subscriptions, downloads, exports, or advanced features, you must provide accurate information and protect login credentials. Premium features may vary by plan, region, testing status, or technical limitations."}</p>
          <p>{lang === "zh" ? "付款、退款、稅務與發票可能由第三方服務處理。除非頁面另有明確承諾，所有價格、功能與可用性都可能調整。" : "Payments, refunds, taxes, and invoices may be handled by third-party services. Unless explicitly promised on a page, prices, features, and availability may change."}</p>

          <h2>{lang === "zh" ? "5. 廣告與聯盟揭露" : "5. Ads and affiliate disclosure"}</h2>
          <p>{lang === "zh" ? "本網站可能顯示 Google AdSense 或同等廣告，也可能包含站內推薦、聯盟連結、贊助連結或合作資源。若您透過部分連結購買產品或服務，我們可能獲得佣金。" : "This site may display Google AdSense or equivalent ads and may include on-site recommendations, affiliate links, sponsored links, or partner resources. If you purchase through certain links, we may earn a commission."}</p>
          <p>{lang === "zh" ? "廣告與聯盟收入有助於維持免費工具，但不代表我們保證第三方產品、服務、價格、品質、可用性或適用性。您應自行評估任何第三方服務。" : "Advertising and affiliate revenue help support free tools, but we do not guarantee third-party products, services, prices, quality, availability, or suitability. You should evaluate third-party services independently."}</p>

          <h2>{lang === "zh" ? "6. 智慧財產與引用" : "6. Intellectual property and citation"}</h2>
          <p>{lang === "zh" ? "本網站的品牌、介面、文案、範例、分類架構、視覺設計與原創內容受著作權、商標或其他法律保護。公式、標準或公開資料本身可能屬公共知識，但本站的整理、解釋與呈現方式仍受保護。" : "The site's brand, interface, copy, examples, taxonomy, visual design, and original content are protected by copyright, trademark, or other laws. Formulas, standards, or public data may be public knowledge, but our organization, explanation, and presentation remain protected."}</p>
          <p>{lang === "zh" ? "允許合理引用少量內容並附上來源連結；不得大量複製、重新包裝、鏡像、販售或用於建立競品資料庫，除非取得書面同意。" : "Reasonable short quotation with source link is permitted. You may not bulk copy, repackage, mirror, sell, or use the content to build a competing database without written permission."}</p>

          <h2>{lang === "zh" ? "7. 責任限制" : "7. Limitation of liability"}</h2>
          <p>{lang === "zh" ? "本網站以現狀與可用狀態提供。我們不保證服務不中斷、無錯誤、完全安全、符合您的特定目的或所有結果絕對準確。在法律允許範圍內，我們不對因使用或無法使用本網站造成的間接、附帶、特殊、衍生或懲罰性損害負責。" : "The site is provided as is and as available. We do not guarantee uninterrupted service, error-free operation, complete security, fitness for a particular purpose, or absolute accuracy of all outputs. To the extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages arising from use or inability to use the site."}</p>

          <h2>{lang === "zh" ? "8. 終止與變更" : "8. Termination and changes"}</h2>
          <p>{lang === "zh" ? "若使用者違反本條款、造成風險或濫用服務，我們得限制、暫停或終止存取。條款若有更新，會更新本頁日期；您繼續使用即代表接受更新後條款。" : "If a user violates these terms, creates risk, or abuses the service, we may restrict, suspend, or terminate access. If the terms are updated, we will update the date on this page; continued use means acceptance of the updated terms."}</p>

          <h2>{lang === "zh" ? "9. 聯絡" : "9. Contact"}</h2>
          <p>{lang === "zh" ? `條款、內容更正、權利主張或服務問題請寄至 ${contactEmail}。` : `For terms, corrections, rights claims, or service questions, email ${contactEmail}.`}</p>
        </article>

        <div className="mt-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:underline dark:text-blue-300">
            <ArrowLeft className="h-4 w-4" />
            {lang === "zh" ? "回首頁" : "Back to home"}
          </Link>
        </div>
      </section>
      <TrustStrip lang={lang} variant="compact" />
    </div>
  );
}
