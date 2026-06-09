import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { defaultSeo, setSeoMeta } from "@/lib/seo";
import { TrustStrip } from "@/components/business/TrustStrip";

export default function Editorial() {
  const { lang } = useLanguage();

  useEffect(() => {
    setSeoMeta({
      ...defaultSeo,
      title:
        lang === "zh"
          ? "編輯方針｜Formula Universe"
          : "Editorial Standards | Formula Universe",
    });
  }, [lang]);

  const lastUpdated = "2025-01-15";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_48%,#ecfeff_100%)] dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-14 md:py-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
            {lang === "zh" ? "編輯與審稿" : "Editorial & Review"}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
            {lang === "zh" ? "編輯方針" : "Editorial Standards"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {lang === "zh"
              ? "我們公開公式來源、審稿流程與利益衝突揭露,讓使用者放心地把每一個結果用在決策中。"
              : "We publish our formula sources, review workflow, and conflict-of-interest disclosure so every result can be trusted in real decisions."}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {lang === "zh" ? `最後更新：${lastUpdated}` : `Last updated: ${lastUpdated}`}
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <article className="prose prose-slate max-w-3xl dark:prose-invert">
          <h2>{lang === "zh" ? "1. 公式來源" : "1. Formula sources"}</h2>
          <p>
            {lang === "zh"
              ? "每個工具的公式都標註原始出處 (期刊、教科書、官方機構或業界共識)。例如 BMI 採用 WHO 標準,BMR 採用 Mifflin-St Jeor (1990) 與 Harris-Benedict (1919) 兩種公式併陳。"
              : "Every tool labels its formula's primary source (journals, textbooks, official agencies, or industry consensus). For example, BMI follows the WHO standard; BMR uses both Mifflin-St Jeor (1990) and Harris-Benedict (1919)."}
          </p>

          <h2>{lang === "zh" ? "2. 審稿流程" : "2. Review workflow"}</h2>
          <ul>
            <li>
              {lang === "zh"
                ? "新工具上線前,公式必須由至少一位領域審稿人複核。"
                : "Before launch, every formula is reviewed by at least one domain reviewer."}
            </li>
            <li>
              {lang === "zh"
                ? "邊界值與單位轉換以單元測試覆蓋,並在 GitHub 公開測試結果。"
                : "Edge cases and unit conversions are covered by unit tests; results are public on GitHub."}
            </li>
            <li>
              {lang === "zh"
                ? "知識文章在發布前進行事實查核,並標註參考資料連結。"
                : "Knowledge articles are fact-checked before publishing and include reference links."}
            </li>
          </ul>

          <h2>{lang === "zh" ? "3. 限制與適用情境" : "3. Limitations and applicable context"}</h2>
          <p>
            {lang === "zh"
              ? "每個工具都會在頁面顯示其限制。例如 BMI 不適用孕婦、運動員與兒童;CAGR 假設報酬均勻分配,實際投資波動更大。我們把這些限制視為工具的一部分,而不是免責聲明的小字。"
              : "Each tool surfaces its limitations on-page. BMI is not applicable to pregnant women, athletes, or children; CAGR assumes uniform returns while real investments fluctuate. We treat limitations as part of the tool, not as fine-print disclaimers."}
          </p>

          <h2>{lang === "zh" ? "4. 廣告、聯盟與利益衝突揭露" : "4. Ads, affiliates, and conflict of interest"}</h2>
          <p>
            {lang === "zh"
              ? "本站可能顯示 Google AdSense 廣告與聯盟行銷連結。我們承諾: (1) 推薦商品的選擇基於使用者價值,而非佣金高低;(2) 廣告與內容明確區隔;(3) 任何贊助內容會清楚標示「Sponsored」。"
              : "This site may show Google AdSense ads and affiliate links. We commit to: (1) recommending products based on user value, not commission size; (2) clearly separating ads from content; (3) labeling any sponsored content as 'Sponsored'."}
          </p>

          <h2>{lang === "zh" ? "5. 修正與回饋" : "5. Corrections and feedback"}</h2>
          <p>
            {lang === "zh"
              ? "如果您發現公式錯誤、引用過時或解釋有疑慮,請寄信到 hello@formulauniverse.dev,或在 GitHub 開 issue。重大修正會在版本歷史中留下紀錄。"
              : "If you spot an error, outdated citation, or unclear explanation, email hello@formulauniverse.dev or open a GitHub issue. Major corrections are recorded in the version history."}
          </p>

          <h2>{lang === "zh" ? "6. AI 輔助與作者責任" : "6. AI assistance and author accountability"}</h2>
          <p>
            {lang === "zh"
              ? "我們使用 AI 工具協助起草與翻譯,但所有內容上線前都由人類審稿並標註負責人。AI 不會獨立決定醫療、投資或法律相關內容。"
              : "We use AI tools to assist drafting and translation, but every published piece is reviewed by a human author who is named accountable. AI does not independently decide medical, financial, or legal content."}
          </p>

          <p className="text-sm text-slate-500">
            <em>
              {lang === "zh"
                ? "* 本頁為初版範本,將隨網站規模擴大而具體化 (例如增列審稿人名單、AI 使用比例公開等)。"
                : "* This page is an initial template and will be expanded (e.g. named reviewer list, AI-usage disclosure) as the site grows."}
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
