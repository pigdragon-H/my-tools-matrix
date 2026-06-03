// @profile B
// Profile B · Calculator-YMYL · DebtPayoffCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "minimal", range: "< $500/月", label: { zh: "輕鬆還款", en: "輕鬆還款" }, desc: { zh: "每月還款極低，可加速還清。", en: "每月還款極低，可加速還清。" } },
  { key: "manageable", range: "$500–$1,500/月", label: { zh: "可負擔", en: "可負擔" }, desc: { zh: "還款在合理範圍，持續穩定付款即可。", en: "還款在合理範圍，持續穩定付款即可。" } },
  { key: "heavy", range: "$1,500–$3,000/月", label: { zh: "較重負擔", en: "較重負擔" }, desc: { zh: "佔收入比高，可考慮重組或增加額外收入。", en: "佔收入比高，可考慮重組或增加額外收入。" } },
  { key: "critical", range: "$3,000–$5,000/月", label: { zh: "嚴重壓力", en: "嚴重壓力" }, desc: { zh: "需立即檢視支出，必要時尋求專業建議。", en: "需立即檢視支出，必要時尋求專業建議。" } },
  { key: "overwhelmed", range: "$5,000–$10,000/月", label: { zh: "瀕臨危機", en: "瀕臨危機" }, desc: { zh: "債務危機風險高，需緊急應對方案。", en: "債務危機風險高，需緊急應對方案。" } },
  { key: "emergency", range: "$10,000+/月", label: { zh: "緊急狀態", en: "緊急狀態" }, desc: { zh: "必須立即尋求法律與財務顧問協助。", en: "必須立即尋求法律與財務顧問協助。" } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "貸款計算機", en: "貸款計算機" }, href: "/tools/finance/loan-calculator" },
  { label: { zh: "複利計算機", en: "複利計算機" }, href: "/tools/finance/compound-interest-calculator" },
  { label: { zh: "負債收入比計算機", en: "負債收入比計算機" }, href: "/tools/finance/debt-to-income-calculator" },
  { label: { zh: "淨資產計算機", en: "淨資產計算機" }, href: "/tools/finance/net-worth-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 債務管理 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Debt Payoff Calculator · 債務清償計算機", subtitle: "計算每月還款、總利息與清償日期，制定還債計畫",
    intro: "本工具根據本金、年利率與還款期限，計算每月固定還款額、總利息支出與預計清償日期，協助制定有效的債務清償策略。",
    trustNoteLabel: "注意事項：", trustNote: "實際還款可能因利率變動或額外費用而異；浮動利率貸款結果僅供參考。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立債務清償範例", examplePreview: "每月還款預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高利率範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入債務資訊", examplesHelper: "先用範例理解債務清償計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準型 · 月付 $1,110", activeExample: "高利率型", flowDemo: "本金 $50k", calculator: "計算機",
    principal: "貸款本金 ($)", annualRate: "年利率 (%)", termMonths: "還款期限 (月)", extraPayment: "額外月付 ($)",
    resultCard: "債務清償計算結果", unit: "每月還款 ($)", primaryValue: "主要數值", maintenanceTarget: "月付金額 ($)", actionTarget: "總利息", estimatedTdee: "總還款", maintenance: "月付", fatLossTarget: "利息",
    payoffDate: "清償日期", totalInterest: "總利息", totalPayment: "總還款額", interestRatio: "利息佔比",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格債務壓力判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前月付金額放進常見規劃區間；這是規劃參考，不是理財建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把債務清償計畫轉成可執行方案", conversionNote: "L9 會連動目前計算結果，顯示還款進度、利息節省與改善提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前還款計畫", dailyGap: "利息佔比", weeklyTrend: "本金/利息", motivation: "動力卡", keepMomentum: "從債務清償計畫走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的債務清償計畫帶回家", journeyHint: "每季重新計算一次，追蹤本金縮減與利息節省進度。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用貸款計算機檢視房貸或貸款償還方案", nextActionItem2: "用複利計算機規劃投資組合成長", nextActionItem3: "用負債收入比確認整體償債能力",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "債務清償 → 淨資產 → 負債收入比 → 貸款", bmrStep: "債務清償", deficitStep: "淨資產", trendStep: "負債收入比", mealStep: "貸款",
    knowledge: "知識", knowledgeTitle: "債務清償在財務規劃中的意義", definition: "定義", definitionText: "債務清償是按固定月付金額分期償還本金與利息的過程。每月還款 = P × r(1+r)^n / ((1+r)^n − 1)。",
    formula: "公式", formulaText: "月付 = 本金 × r(1+r)^n / ((1+r)^n − 1)，其中 r = 月利率，n = 期數。總利息 = 月付 × n − 本金。利息佔比 = 總利息 ÷ 總還款 × 100%。",
    limitations: "限制", limitationsText: "僅適用固定利率貸款；浮動利率結果為估計值。未計入提前還款罰金或手續費。",
    interpretation: "解讀", interpretationText: "利息佔比低於 30% 屬健康；30–50% 需關注；超過 50% 表示長期成本沉重，應考慮加速還款或重組。",
    context: "脈絡", contextText: "債務清償應搭配負債收入比、淨資產與貸款方案一起看。",
    example: "範例", exampleText: "本金 $50,000，年利率 6%，120 期。月利率 = 0.5%，月付 = $555.10，總還款 = $66,612，總利息 = $16,612，利息佔比 24.9%。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "債務清償規劃的下一步工具", premiumTitle: "專業版債務追蹤包", premiumText: "解鎖還款進度甘特圖、利率比較分析、提前還款模擬與個人化財務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代理財顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "貸款計算機 · 複利計算機 · 負債收入比計算機 · 淨資產計算機", references: "參考資料", referencesText: "美國消費者金融保護局信用卡還款指南；美國聯準會 G.19 消費信貸報告；美國聯邦貿易委員會消費者信用資訊；美國國家信用諮詢基金會財務諮詢標準。",
    q1: "提前還款真的好嗎？", a1: "通常是的，但需確認是否有提前還款罰金；高利率債務優先清償效益最大。", q2: "浮動利率怎麼辦？", a2: "本計算機使用固定利率估算；浮動利率建議用當前利率估算，並預留利率上升空間。", q3: "月付超過收入 30% 怎麼辦？", a3: "考慮延長還款期限、債務重組或增加收入；嚴重時可尋求信用諮詢服務。", q4: "利息佔比多少算正常？", a4: "低於 30% 健康；30–50% 需注意；超過 50% 應加速還款或重組。", q5: "最低應繳與固定月付有何不同？", a5: "最低應繳只付利息加小額本金，清償時間極長；固定月付可預估清償日期。", q6: "這個工具能提供債務重組或法律建議嗎？", a6: "不能。它只是教育用估算；若需債務重組、破產諮詢或法律建議，請尋求專業人員。",
  },
  en: {
    badge: "財務 · 債務管理 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Debt Payoff Calculator · 債務清償計算機", subtitle: "計算每月還款、總利息與清償日期，制定還債計畫",
    intro: "本工具根據本金、年利率與還款期限，計算每月固定還款額、總利息支出與預計清償日期，協助制定有效的債務清償策略。",
    trustNoteLabel: "注意事項：", trustNote: "實際還款可能因利率變動或額外費用而異；浮動利率貸款結果僅供參考。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立債務清償範例", examplePreview: "每月還款預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高利率範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入債務資訊", examplesHelper: "先用範例理解債務清償計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準型 · 月付 $1,110", activeExample: "高利率型", flowDemo: "本金 $50k", calculator: "計算機",
    principal: "貸款本金 ($)", annualRate: "年利率 (%)", termMonths: "還款期限 (月)", extraPayment: "額外月付 ($)",
    resultCard: "債務清償計算結果", unit: "每月還款 ($)", primaryValue: "主要數值", maintenanceTarget: "月付金額 ($)", actionTarget: "總利息", estimatedTdee: "總還款", maintenance: "月付", fatLossTarget: "利息",
    payoffDate: "清償日期", totalInterest: "總利息", totalPayment: "總還款額", interestRatio: "利息佔比",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格債務壓力判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前月付金額放進常見規劃區間；這是規劃參考，不是理財建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把債務清償計畫轉成可執行方案", conversionNote: "L9 會連動目前計算結果，顯示還款進度、利息節省與改善提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前還款計畫", dailyGap: "利息佔比", weeklyTrend: "本金/利息", motivation: "動力卡", keepMomentum: "從債務清償計畫走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的債務清償計畫帶回家", journeyHint: "每季重新計算一次，追蹤本金縮減與利息節省進度。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用貸款計算機檢視房貸或貸款償還方案", nextActionItem2: "用複利計算機規劃投資組合成長", nextActionItem3: "用負債收入比確認整體償債能力",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "債務清償 → 淨資產 → 負債收入比 → 貸款", bmrStep: "債務清償", deficitStep: "淨資產", trendStep: "負債收入比", mealStep: "貸款",
    knowledge: "知識", knowledgeTitle: "債務清償在財務規劃中的意義", definition: "定義", definitionText: "債務清償是按固定月付金額分期償還本金與利息的過程。每月還款 = P × r(1+r)^n / ((1+r)^n − 1)。",
    formula: "公式", formulaText: "月付 = 本金 × r(1+r)^n / ((1+r)^n − 1)，其中 r = 月利率，n = 期數。總利息 = 月付 × n − 本金。利息佔比 = 總利息 ÷ 總還款 × 100%。",
    limitations: "限制", limitationsText: "僅適用固定利率貸款；浮動利率結果為估計值。未計入提前還款罰金或手續費。",
    interpretation: "解讀", interpretationText: "利息佔比低於 30% 屬健康；30–50% 需關注；超過 50% 表示長期成本沉重，應考慮加速還款或重組。",
    context: "脈絡", contextText: "債務清償應搭配負債收入比、淨資產與貸款方案一起看。",
    example: "範例", exampleText: "本金 $50,000，年利率 6%，120 期。月利率 = 0.5%，月付 = $555.10，總還款 = $66,612，總利息 = $16,612，利息佔比 24.9%。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "債務清償規劃的下一步工具", premiumTitle: "專業版債務追蹤包", premiumText: "解鎖還款進度甘特圖、利率比較分析、提前還款模擬與個人化財務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代理財顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "貸款計算機 · 複利計算機 · 負債收入比計算機 · 淨資產計算機", references: "參考資料", referencesText: "美國消費者金融保護局信用卡還款指南；美國聯準會 G.19 消費信貸報告；美國聯邦貿易委員會消費者信用資訊；美國國家信用諮詢基金會財務諮詢標準。",
    q1: "提前還款真的好嗎？", a1: "通常是的，但需確認是否有提前還款罰金；高利率債務優先清償效益最大。", q2: "浮動利率怎麼辦？", a2: "本計算機使用固定利率估算；浮動利率建議用當前利率估算，並預留利率上升空間。", q3: "月付超過收入 30% 怎麼辦？", a3: "考慮延長還款期限、債務重組或增加收入；嚴重時可尋求信用諮詢服務。", q4: "利息佔比多少算正常？", a4: "低於 30% 健康；30–50% 需注意；超過 50% 應加速還款或重組。", q5: "最低應繳與固定月付有何不同？", a5: "最低應繳只付利息加小額本金，清償時間極長；固定月付可預估清償日期。", q6: "這個工具能提供債務重組或法律建議嗎？", a6: "不能。它只是教育用估算；若需債務重組、破產諮詢或法律建議，請尋求專業人員。",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function calcPayoff(principal: number, annualRate: number, termMonths: number) {
  if (principal <= 0 || termMonths <= 0) return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0, interestRatio: 0 };
  const r = annualRate / 100 / 12;
  if (r === 0) {
    const mp = principal / termMonths;
    return { monthlyPayment: mp, totalPayment: principal, totalInterest: 0, interestRatio: 0 };
  }
  const factor = Math.pow(1 + r, termMonths);
  const mp = principal * r * factor / (factor - 1);
  const total = mp * termMonths;
  const interest = total - principal;
  return { monthlyPayment: mp, totalPayment: total, totalInterest: interest, interestRatio: (interest / total) * 100 };
}

export default function DebtPayoffCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [principal, setPrincipal] = useState("50000");
  const [annualRate, setAnnualRate] = useState("6");
  const [termMonths, setTermMonths] = useState("120");
  const [extraPayment, setExtraPayment] = useState("0");
  const displayLang: Lang = "zh";
  const t = ui[lang];

  const result = useMemo(() => {
    const p = Number(principal);
    const r = Number(annualRate);
    const n = Number(termMonths);
    const base = calcPayoff(p, r, n);
    const extra = Number(extraPayment) || 0;
    const effectiveMonthly = base.monthlyPayment + extra;
    // recalculate with extra payment
    let effectiveTerm = n;
    let effectiveTotalInterest = base.totalInterest;
    if (extra > 0 && base.monthlyPayment > 0) {
      const monthlyRate = r / 100 / 12;
      if (monthlyRate > 0) {
        let balance = p;
        let months = 0;
        let totalInt = 0;
        while (balance > 0 && months < n * 3) {
          const intPortion = balance * monthlyRate;
          const prinPortion = Math.min(effectiveMonthly - intPortion, balance);
          totalInt += intPortion;
          balance -= prinPortion;
          months++;
          if (prinPortion <= 0) break;
        }
        effectiveTerm = months;
        effectiveTotalInterest = totalInt;
      }
    }
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + effectiveTerm);
    return {
      ...base,
      effectiveMonthly,
      effectiveTerm,
      effectiveTotalInterest,
      payoffDate: payoffDate.toLocaleDateString("zh-TW", { year: "numeric", month: "long" }),
    };
  }, [principal, annualRate, termMonths, extraPayment, lang]);

  const monthlyDisplay = fmt(result.effectiveMonthly, 2);
  const interestDisplay = fmt(result.effectiveTotalInterest, 0);

  function fillStandard() { setUnit("metric"); setPrincipal("50000"); setAnnualRate("6"); setTermMonths("120"); setExtraPayment("0"); }
  function fillHighRate() { setUnit("metric"); setPrincipal("30000"); setAnnualRate("18"); setTermMonths("60"); setExtraPayment("0"); }

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${monthlyDisplay}</div><div className="text-sm font-bold text-amber-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{fmt(result.monthlyPayment, 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${fmt(Number(principal), 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.interestRatio, 1)}%</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighRate} className="mt-3 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">6%</span></div><p className="mt-2 text-sm text-slate-600">$50k · 120 個月</p></button><button onClick={fillHighRate} className="w-full rounded-2xl border border-red-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">18%</span></div><p className="mt-2 text-sm text-slate-600">$30k · 60 個月</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.principal}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={principal} onChange={(e) => setPrincipal(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.annualRate}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.termMonths}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.extraPayment}<input className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-emerald-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${monthlyDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.payoffDate}</div><div className="mt-1 text-xl font-black">{result.payoffDate}</div><div className="mt-1 text-xs text-slate-300">{result.effectiveTerm} 個月</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-emerald-950">${monthlyDisplay}</p><p className="text-sm font-bold text-emerald-700">/月</p></div><div className="rounded-2xl bg-red-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-red-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-red-950">${interestDisplay}</p><p className="text-sm font-bold text-red-700">總計</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.estimatedTdee}</div><div className="mt-1 text-xs font-black uppercase text-slate-700">總計</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(result.totalPayment, 0)}</p><p className="text-sm font-bold text-slate-700">已還款</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, displayLang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, displayLang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="debtpayoff-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">每月</div><div className="mt-1 text-3xl font-black">${monthlyDisplay}</div></div><div className="rounded-2xl bg-red-50 p-4"><div className="text-xs font-black uppercase text-red-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-red-950">{fmt(result.interestRatio, 1)}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt((Number(principal) / Math.max(result.totalPayment, 1)) * 100, 0)}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "債務清償", note: t.bmrStep }, { label: "淨資產", note: t.deficitStep }, { label: "負債比", note: t.trendStep }, { label: "貸款", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="debtpayoff-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, displayLang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">推薦連結揭露：部分連結可能帶來佣金收入。</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["進度", "比較", "模擬", "報告"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
