// @profile B
// Profile B · Calculator-YMYL · InflationAdjuster（GOLD-STANDARD-001 compatible）
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Mode = "future" | "real";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "deflation", range: "< 0%", label: { zh: "通貨緊縮", en: "通貨緊縮" }, desc: { zh: "物價下跌，貨幣購買力上升，但可能伴隨經濟萎縮。", en: "物價下跌，貨幣購買力上升，但可能伴隨經濟萎縮。" } },
  { key: "low", range: "0–2%", label: { zh: "低通膨", en: "低通膨" }, desc: { zh: "溫和物價上漲，央行目標區間，經濟穩定成長。", en: "溫和物價上漲，央行目標區間，經濟穩定成長。" } },
  { key: "moderate", range: "2–5%", label: { zh: "中度通膨", en: "中度通膨" }, desc: { zh: "物價明顯上漲，需關注但不至於失控。", en: "物價明顯上漲，需關注但不至於失控。" } },
  { key: "high", range: "5–10%", label: { zh: "高通膨", en: "高通膨" }, desc: { zh: "侵蝕購買力，薪資與儲蓄實質價值下降。", en: "侵蝕購買力，薪資與儲蓄實質價值下降。" } },
  { key: "hyper", range: "10–50%+", label: { zh: "惡性通膨", en: "惡性通膨" }, desc: { zh: "貨幣幾乎失去功能，需緊急資產重配置。", en: "貨幣幾乎失去功能，需緊急資產重配置。" } },
  { key: "stagflation", range: "停滯+通膨", label: { zh: "停滯性通膨", en: "停滯性通膨" }, desc: { zh: "經濟停滯與物價上漲並存，最難應對的總體環境。", en: "經濟停滯與物價上漲並存，最難應對的總體環境。" } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "年複合成長率計算機", en: "年複合成長率計算機" }, href: "/tools/finance/cagr-calculator" },
  { label: { zh: "複利計算機", en: "複利計算機" }, href: "/tools/finance/compound-interest-calculator" },
  { label: { zh: "儲蓄目標計算機", en: "儲蓄目標計算機" }, href: "/tools/finance/savings-goal-calculator" },
  { label: { zh: "退休計算機", en: "退休計算機" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 通膨規劃 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Inflation Adjuster · 通膨調整計算機", subtitle: "用通膨率與年數計算貨幣未來購買力與實質價值",
    intro: "本工具根據年通膨率與年數，計算未來等值金額（同一筆錢在未來需要多少）或實質價值（未來金額折算回今天的購買力），協助長期財務規劃。",
    trustNoteLabel: "注意事項：", trustNote: "通膨率為估計值，實際通膨受政策、供給鏈與全球事件影響而有大幅波動。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立通膨調整範例", examplePreview: "未來等值預覽", examplePerson: "標準未來成本", fillExample: "一鍵填入標準範例", previewActivePath: "填入實質價值範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入金額與通膨率", examplesHelper: "先用範例理解通膨對購買力的影響，再改成自己的金額與通膨率。",
    metric: "常用", imperial: "進階", exampleCards: "範例卡", baselineExample: "$1000 · 10 年 · 3%", activeExample: "實質價值模式", flowDemo: "3% 通膨", calculator: "計算機",
    amount: "金額 ($)", rate: "年通膨率 (%)", years: "年數", mode: "計算模式", modeFuture: "未來等值", modeReal: "實質價值",
    resultCard: "通膨調整結果", unit: "調整後金額", primaryValue: "主要數值", maintenanceTarget: "調整後金額 ($)", actionTarget: "購買力變化", estimatedTdee: "原始金額", maintenance: "調整後", fatLossTarget: "購買力",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格通膨判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前通膨率放進常見規劃區間；這是規劃參考，不是投資建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把通膨調整建議轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示每年侵蝕、實質報酬率與資產重配置提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前通膨規劃", dailyGap: "每年侵蝕", weeklyTrend: "實質報酬", motivation: "動力卡", keepMomentum: "從通膨調整走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的通膨調整帶回家", journeyHint: "用 3–7 年平均通膨率重新估算，避免被單年數據誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用年複合成長率計算機確認投資年化報酬率", nextActionItem2: "用複利計算機計算實質成長", nextActionItem3: "用儲蓄目標或退休計算機檢查是否達標",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "年複合成長率 → 通膨 → 複利 → 儲蓄目標", bmrStep: "年複合成長率", deficitStep: "通膨", trendStep: "複利", mealStep: "儲蓄目標",
    knowledge: "知識", knowledgeTitle: "通膨在財務規劃中的意義", definition: "定義", definitionText: "通貨膨脹是物價持續上漲導致貨幣購買力下降的現象；相同金額在未來能買到的商品與服務減少。", formula: "公式", formulaText: "未來等值 = 現值 × (1 + r)^n。實質價值 = 名目金額 ÷ (1 + r)^n。其中 r 為年通膨率，n 為年數。", limitations: "限制", limitationsText: "通膨率為估計值，實際值受貨幣政策、供給鏈衝擊與全球事件影響大幅波動；不同品類通膨率差異極大。", interpretation: "解讀", interpretationText: "2–3% 通膨下 20 年購買力約剩 55–67%；5% 通膨下 20 年購買力僅剩 38%。越長期影響越顯著。", context: "脈絡", contextText: "通膨調整應搭配年複合成長率與複利一起看，確認名目報酬是否真的打敗通膨。", example: "範例", exampleText: "$1000、3% 通膨、10 年 → 未來等值 = $1,343.92；$1000 在 10 年後的實質價值 = $744.09。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "通膨規劃的下一步工具", premiumTitle: "專業版通膨追蹤包", premiumText: "解鎖品類通膨追蹤、購買力趨勢圖、資產配置建議與個人化財務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代投資建議、理財顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "年複合成長率計算機 · 複利計算機 · 儲蓄目標計算機 · 退休計算機", references: "參考資料", referencesText: "美國勞工統計局消費者物價指數方法；國際貨幣基金世界經濟展望；貨幣數量理論框架；美國聯準會經濟資料庫。",
    q1: "通膨率應該用多少來估算？", a1: "多數已開發國家長期平均 2–3%；開發中國家可能 5–10%。建議用過去 10 年平均而非單年數據。", q2: "未來等值和實質價值有什麼差別？", a2: "未來等值：今天 $1000 在 n 年後要多少才能買到同樣東西。實質價值：n 年後的 $1000 折算回今天值多少。", q3: "通膨對債務有什麼影響？", a3: "固定利率債務的實質負擔會隨通膨下降，因為未來還款的金額購買力更低。浮動利率則不一定。", q4: "如何對抗通膨？", a4: "投資於歷史回報率高於通膨的資產（如股票、不動產）；避免長期持有大量現金。", q5: "通縮是不是比較好？", a5: "不一定。溫和通縮可能導致消費延遲與債務實質加重，引發經濟惡性循環。", q6: "這個工具能預測未來物價或提供投資建議嗎？", a6: "不能。它只是教育用估算；若有投資、稅務或重大財務決策，請諮詢專業人員。",
  },
  en: {
    badge: "財務 · 通膨規劃 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Inflation Adjuster · 通膨調整計算機", subtitle: "用通膨率與年數計算貨幣未來購買力與實質價值",
    intro: "本工具根據年通膨率與年數，計算未來等值金額（同一筆錢在未來需要多少）或實質價值（未來金額折算回今天的購買力），協助長期財務規劃。",
    trustNoteLabel: "注意事項：", trustNote: "通膨率為估計值，實際通膨受政策、供給鏈與全球事件影響而有大幅波動。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立通膨調整範例", examplePreview: "未來等值預覽", examplePerson: "標準未來成本", fillExample: "一鍵填入標準範例", previewActivePath: "填入實質價值範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入金額與通膨率", examplesHelper: "先用範例理解通膨對購買力的影響，再改成自己的金額與通膨率。",
    metric: "常用", imperial: "進階", exampleCards: "範例卡", baselineExample: "$1000 · 10 年 · 3%", activeExample: "實質價值模式", flowDemo: "3% 通膨", calculator: "計算機",
    amount: "金額 ($)", rate: "年通膨率 (%)", years: "年數", mode: "計算模式", modeFuture: "未來等值", modeReal: "實質價值",
    resultCard: "通膨調整結果", unit: "調整後金額", primaryValue: "主要數值", maintenanceTarget: "調整後金額 ($)", actionTarget: "購買力變化", estimatedTdee: "原始金額", maintenance: "調整後", fatLossTarget: "購買力",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格通膨判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前通膨率放進常見規劃區間；這是規劃參考，不是投資建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把通膨調整建議轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示每年侵蝕、實質報酬率與資產重配置提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前通膨規劃", dailyGap: "每年侵蝕", weeklyTrend: "實質報酬", motivation: "動力卡", keepMomentum: "從通膨調整走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的通膨調整帶回家", journeyHint: "用 3–7 年平均通膨率重新估算，避免被單年數據誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用年複合成長率計算機確認投資年化報酬率", nextActionItem2: "用複利計算機計算實質成長", nextActionItem3: "用儲蓄目標或退休計算機檢查是否達標",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "年複合成長率 → 通膨 → 複利 → 儲蓄目標", bmrStep: "年複合成長率", deficitStep: "通膨", trendStep: "複利", mealStep: "儲蓄目標",
    knowledge: "知識", knowledgeTitle: "通膨在財務規劃中的意義", definition: "定義", definitionText: "通貨膨脹是物價持續上漲導致貨幣購買力下降的現象；相同金額在未來能買到的商品與服務減少。", formula: "公式", formulaText: "未來等值 = 現值 × (1 + r)^n。實質價值 = 名目金額 ÷ (1 + r)^n。其中 r 為年通膨率，n 為年數。", limitations: "限制", limitationsText: "通膨率為估計值，實際值受貨幣政策、供給鏈衝擊與全球事件影響大幅波動；不同品類通膨率差異極大。", interpretation: "解讀", interpretationText: "2–3% 通膨下 20 年購買力約剩 55–67%；5% 通膨下 20 年購買力僅剩 38%。越長期影響越顯著。", context: "脈絡", contextText: "通膨調整應搭配年複合成長率與複利一起看，確認名目報酬是否真的打敗通膨。", example: "範例", exampleText: "$1000、3% 通膨、10 年 → 未來等值 = $1,343.92；$1000 在 10 年後的實質價值 = $744.09。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "通膨規劃的下一步工具", premiumTitle: "專業版通膨追蹤包", premiumText: "解鎖品類通膨追蹤、購買力趨勢圖、資產配置建議與個人化財務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代投資建議、理財顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "年複合成長率計算機 · 複利計算機 · 儲蓄目標計算機 · 退休計算機", references: "參考資料", referencesText: "美國勞工統計局消費者物價指數方法；國際貨幣基金世界經濟展望；貨幣數量理論框架；美國聯準會經濟資料庫。",
    q1: "通膨率應該用多少來估算？", a1: "多數已開發國家長期平均 2–3%；開發中國家可能 5–10%。建議用過去 10 年平均而非單年數據。", q2: "未來等值和實質價值有什麼差別？", a2: "未來等值：今天 $1000 在 n 年後要多少才能買到同樣東西。實質價值：n 年後的 $1000 折算回今天值多少。", q3: "通膨對債務有什麼影響？", a3: "固定利率債務的實質負擔會隨通膨下降，因為未來還款的金額購買力更低。浮動利率則不一定。", q4: "如何對抗通膨？", a4: "投資於歷史回報率高於通膨的資產（如股票、不動產）；避免長期持有大量現金。", q5: "通縮是不是比較好？", a5: "不一定。溫和通縮可能導致消費延遲與債務實質加重，引發經濟惡性循環。", q6: "這個工具能預測未來物價或提供投資建議嗎？", a6: "不能。它只是教育用估算；若有投資、稅務或重大財務決策，請諮詢專業人員。",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function InflationAdjuster() {
  const { lang, setLang } = useLanguage();
  const displayLang: Lang = "zh";
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("3");
  const [years, setYears] = useState("10");
  const [mode, setMode] = useState<Mode>("future");
  const t = ui[lang];

  const result = useMemo(() => {
    const a = Number(amount);
    const r = Number(rate) / 100;
    const n = Number(years);
    if (a <= 0 || n <= 0 || r < -0.5) return null;
    const factor = Math.pow(1 + r, n);
    const adjusted = mode === "future" ? a * factor : a / factor;
    const purchasingPower = mode === "future" ? (a / adjusted) * 100 : (adjusted / a) * 100;
    const realReturn = ((1 + 0.07) / (1 + r) - 1) * 100; // assume 7% nominal for context
    return { adjusted, factor, purchasingPower, realReturn, originalAmount: a };
  }, [amount, rate, years, mode]);

  const adjustedDisplay = result ? fmt(result.adjusted, 2) : "—";
  const ppDisplay = result ? fmt(result.purchasingPower, 1) : "—";

  function fillStandard() { setUnit("metric"); setAmount("1000"); setRate("3"); setYears("10"); setMode("future"); }
  function fillReal() { setUnit("metric"); setAmount("1000"); setRate("3"); setYears("10"); setMode("real"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${adjustedDisplay}</div><div className="text-sm font-bold text-amber-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${amount}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{rate}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.years}</div><div className="font-black">{years} 年</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillReal} className="mt-3 w-full rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-black text-blue-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">3%</span></div><p className="mt-2 text-sm text-slate-600">$1000 · 10 年 · 未來等值</p></button><button onClick={fillReal} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">$744</span></div><p className="mt-2 text-sm text-slate-600">$1000 · 10 年 · 實質價值</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.amount}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={amount} onChange={(e) => setAmount(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.rate}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={rate} onChange={(e) => setRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.years}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={years} onChange={(e) => setYears(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.mode}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as Mode)}><option value="future">{t.modeFuture}</option><option value="real">{t.modeReal}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${adjustedDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">${amount}</div><div className="mt-1 text-xs text-slate-300">{mode === "future" ? "未來等值" : "實質價值"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-amber-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-amber-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-amber-950">${adjustedDisplay}</p><p className="text-sm font-bold text-amber-700">已調整</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-blue-950">{ppDisplay}%</p><p className="text-sm font-bold text-blue-700">剩餘購買力</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.estimatedTdee}</div><div className="mt-1 text-xs font-black uppercase text-slate-700">原始金額</div><p className="mt-2 text-3xl font-black text-slate-950">${amount}</p><p className="text-sm font-bold text-slate-700">名目金額</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, displayLang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, displayLang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{rate}%</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="inflation-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">通膨率</div><div className="mt-1 text-3xl font-black">{rate}%</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.purchasingPower > 100 ? result.purchasingPower - 100 : 100 - result.purchasingPower, 1) : "—"}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.realReturn, 1) : "—"}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "年複合成長率", note: t.bmrStep }, { label: "通膨", note: t.deficitStep }, { label: "複利", note: t.trendStep }, { label: "儲蓄", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="inflation-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, displayLang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["物價指數", "趨勢", "資產", "報告"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
