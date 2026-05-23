import { useMemo, useState } from "react";

type Lang = "zh" | "en";
type Rating = "low" | "average" | "good" | "excellent";

const zhText = {
  title: "CTR 點擊率計算器",
  description: "計算廣告點擊率，並與行業基準進行比較分析。",
  language: "語言",
  zh: "中文",
  en: "EN",
  inputTitle: "輸入資料",
  clicks: "總點擊數",
  impressions: "總曝光數",
  targetCtr: "目標 CTR（%）",
  reverseImpressions: "反向計算曝光數",
  calculateHint: "輸入點擊數與曝光數後，系統會即時計算點擊率與評級。",
  resultTitle: "結果",
  ctr: "點擊率",
  rating: "評級",
  benchmark: "行業基準",
  searchAds: "搜尋廣告：2-5%",
  displayAds: "展示廣告：0.1-0.3%",
  email: "電子郵件：2-5%",
  reverse: "反向計算",
  requiredClicks: "所需點擊數",
  belowAverage: "偏低",
  average: "一般",
  good: "良好",
  excellent: "優秀",
  lowExplain: "低於 1%，建議檢查受眾、素材與關鍵字相關性。",
  averageExplain: "介於 1-3%，屬於常見水準，可持續優化標題與素材。",
  goodExplain: "介於 3-5%，表現良好，代表訊息與受眾匹配度佳。",
  excellentExplain: "高於 5%，表現優秀，建議擴大有效投放組合。",
  copy: "複製結果",
  copied: "已複製",
  clear: "清除",
  formulaTitle: "公式",
  formula: "CTR (%) =（總點擊數 ÷ 總曝光數）× 100",
  errorPositive: "請輸入有效且不為負數的數值。",
  errorImpressions: "總曝光數必須大於 0，才能計算點擊率。",
  noResult: "請輸入有效資料以顯示結果。",
};

const enText = {
  title: "CTR Click-Through Rate Calculator",
  description: "Calculate click-through rate and benchmark against industry standards.",
  language: "Language",
  zh: "中文",
  en: "EN",
  inputTitle: "Inputs",
  clicks: "Total Clicks",
  impressions: "Total Impressions",
  targetCtr: "Target CTR (%)",
  reverseImpressions: "Reverse Impressions",
  calculateHint: "Enter clicks and impressions to calculate CTR and performance rating instantly.",
  resultTitle: "Results",
  ctr: "CTR",
  rating: "Rating",
  benchmark: "Industry Benchmark",
  searchAds: "Search Ads: 2-5%",
  displayAds: "Display Ads: 0.1-0.3%",
  email: "Email: 2-5%",
  reverse: "Reverse Calculation",
  requiredClicks: "Required Clicks",
  belowAverage: "Below Average",
  average: "Average",
  good: "Good",
  excellent: "Excellent",
  lowExplain: "Below 1%. Review audience targeting, creative quality and keyword relevance.",
  averageExplain: "Between 1-3%. This is a common range; keep improving copy and creative.",
  goodExplain: "Between 3-5%. Performance is good and the message matches the audience well.",
  excellentExplain: "Above 5%. Performance is excellent; consider scaling effective campaigns.",
  copy: "Copy Result",
  copied: "Copied",
  clear: "Clear",
  formulaTitle: "Formula",
  formula: "CTR (%) = (Total Clicks / Total Impressions) × 100",
  errorPositive: "Please enter valid non-negative numbers.",
  errorImpressions: "Total impressions must be greater than 0 to calculate CTR.",
  noResult: "Enter valid data to show results.",
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function getRating(ctr: number): Rating {
  if (ctr < 1) return "low";
  if (ctr < 3) return "average";
  if (ctr <= 5) return "good";
  return "excellent";
}

export default function CtrCalculator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [clicks, setClicks] = useState("120");
  const [impressions, setImpressions] = useState("5000");
  const [targetCtr, setTargetCtr] = useState("3");
  const [reverseImpressions, setReverseImpressions] = useState("10000");
  const [copied, setCopied] = useState(false);
  const t = lang === "zh" ? zhText : enText;

  const data = useMemo(() => {
    const clickValue = Number(clicks);
    const impressionValue = Number(impressions);
    const targetValue = Number(targetCtr);
    const reverseImpressionValue = Number(reverseImpressions);
    if ([clickValue, impressionValue, targetValue, reverseImpressionValue].some((value) => !Number.isFinite(value) || value < 0)) {
      return { error: t.errorPositive };
    }
    if (impressionValue <= 0) return { error: t.errorImpressions };
    const ctr = (clickValue / impressionValue) * 100;
    const rating = getRating(ctr);
    const requiredClicks = Math.ceil((targetValue / 100) * reverseImpressionValue);
    return { ctr, rating, requiredClicks, error: "" };
  }, [clicks, impressions, targetCtr, reverseImpressions, t.errorImpressions, t.errorPositive]);

  const ratingText = data.rating
    ? {
        low: t.belowAverage,
        average: t.average,
        good: t.good,
        excellent: t.excellent,
      }[data.rating]
    : "";

  const ratingExplain = data.rating
    ? {
        low: t.lowExplain,
        average: t.averageExplain,
        good: t.goodExplain,
        excellent: t.excellentExplain,
      }[data.rating]
    : "";

  const ratingClass = data.rating
    ? {
        low: "border-red-200 bg-red-50 text-red-700",
        average: "border-orange-200 bg-orange-50 text-orange-700",
        good: "border-blue-200 bg-blue-50 text-blue-700",
        excellent: "border-green-200 bg-green-50 text-green-700",
      }[data.rating]
    : "";

  const copyResult = async () => {
    if (data.error || data.ctr === undefined) return;
    const text = `${t.title}\n${t.ctr}: ${numberFormat.format(data.ctr)}%\n${t.rating}: ${ratingText}\n${t.requiredClicks}: ${numberFormat.format(data.requiredClicks ?? 0)}`;
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => {
    setClicks("");
    setImpressions("");
    setTargetCtr("");
    setReverseImpressions("");
    setCopied(false);
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex justify-end">
        <div className="rounded-full border bg-card p-1 text-sm">
          <span className="px-3 text-muted-foreground">{t.language}</span>
          <button className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-primary text-primary-foreground" : ""}`} onClick={() => setLang("zh")}>{t.zh}</button>
          <button className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-primary text-primary-foreground" : ""}`} onClick={() => setLang("en")}>{t.en}</button>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.description}</p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{t.inputTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.calculateHint}</p>
          <label className="mt-4 block text-sm font-medium">{t.clicks}<input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" value={clicks} onChange={(e) => setClicks(e.target.value)} /></label>
          <label className="mt-4 block text-sm font-medium">{t.impressions}<input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" value={impressions} onChange={(e) => setImpressions(e.target.value)} /></label>
          <div className="mt-6 rounded-xl border bg-muted/30 p-4">
            <h3 className="font-semibold">{t.reverse}</h3>
            <label className="mt-3 block text-sm font-medium">{t.targetCtr}<input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" step="0.01" value={targetCtr} onChange={(e) => setTargetCtr(e.target.value)} /></label>
            <label className="mt-3 block text-sm font-medium">{t.reverseImpressions}<input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" value={reverseImpressions} onChange={(e) => setReverseImpressions(e.target.value)} /></label>
          </div>
          {data.error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{data.error}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" disabled={!!data.error} onClick={copyResult}>{copied ? t.copied : t.copy}</button>
            <button className="rounded-md border px-4 py-2" onClick={clear}>{t.clear}</button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{t.resultTitle}</h2>
          {!data.error && data.ctr !== undefined ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">{t.ctr}</p><p className="text-3xl font-bold">{numberFormat.format(data.ctr)}%</p></div>
              <div className={`rounded-xl border p-4 ${ratingClass}`}><p className="text-sm font-semibold">{t.rating}</p><p className="text-2xl font-bold">{ratingText}</p><p className="mt-1 text-sm">{ratingExplain}</p></div>
              <div className="rounded-xl border p-4"><p className="font-semibold">{t.benchmark}</p><ul className="mt-2 space-y-1 text-sm text-muted-foreground"><li>{t.searchAds}</li><li>{t.displayAds}</li><li>{t.email}</li></ul></div>
              <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">{t.requiredClicks}</p><p className="text-2xl font-bold">{numberFormat.format(data.requiredClicks ?? 0)}</p></div>
            </div>
          ) : <p className="mt-4 text-muted-foreground">{t.noResult}</p>}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">{t.formulaTitle}</h2>
        <p className="mt-2">{t.formula}</p>
      </section>
    </main>
  );
}
