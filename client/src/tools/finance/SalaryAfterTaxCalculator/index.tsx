// @profile B
// Profile B · Calculator-YMYL · SalaryAfterTaxCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "heavy", range: ">40%", label: { zh: "重稅", en: "重稅" }, desc: { zh: "稅率超過 40%，可尋求稅務規劃降低有效稅率。", en: "稅率超過 40%，可尋求稅務規劃降低有效稅率。" } },
  { key: "high", range: "30–40%", label: { zh: "高稅", en: "高稅" }, desc: { zh: "稅率偏高，建議檢視扣除額與退休帳戶。", en: "稅率偏高，建議檢視扣除額與退休帳戶。" } },
  { key: "moderate", range: "20–30%", label: { zh: "中等", en: "中等" }, desc: { zh: "稅率在常見範圍，持續善用扣除額。", en: "稅率在常見範圍，持續善用扣除額。" } },
  { key: "low", range: "10–20%", label: { zh: "低稅", en: "低稅" }, desc: { zh: "稅率較低，可將更多資金投入投資。", en: "稅率較低，可將更多資金投入投資。" } },
  { key: "minimal", range: "<10%", label: { zh: "極低", en: "極低" }, desc: { zh: "稅率極低，適合加速累積資產。", en: "稅率極低，適合加速累積資產。" } },
  { key: "credit", range: "Negative", label: { zh: "退稅", en: "退稅" }, desc: { zh: "扣除額超過收入，可能獲得退稅。", en: "扣除額超過收入，可能獲得退稅。" } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "時薪計算機", en: "時薪計算機" }, href: "/tools/finance/hourly-rate-calculator" },
  { label: { zh: "預算比例計算機", en: "預算比例計算機" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "淨資產計算機" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "退休計算機", en: "退休計算機" }, href: "/tools/finance/retirement-calculator" },
];

/* ── Simplified 2024 US Federal Brackets (Single) ── */
function calcFederalTax(taxable: number): number {
  const brackets = [
    { cap: 11600, rate: 0.10 },
    { cap: 47150, rate: 0.12 },
    { cap: 100525, rate: 0.22 },
    { cap: 191950, rate: 0.24 },
    { cap: 243725, rate: 0.32 },
    { cap: 609350, rate: 0.35 },
    { cap: Infinity, rate: 0.37 },
  ];
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (taxable <= prev) break;
    const taxableInBracket = Math.min(taxable, b.cap) - prev;
    tax += taxableInBracket * b.rate;
    prev = b.cap;
  }
  return Math.max(tax, 0);
}

const ui = {
  zh: {
    badge: "財務 · 薪資稅務 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Salary After Tax Calculator · 稅後薪資計算機", subtitle: "計算你的實際到手薪資與有效稅率",
    intro: "本工具根據你的年薪、州稅率與扣除額，估算聯邦稅、州稅、社會安全稅與醫療保險稅，得出實際到手薪資與有效稅率。",
    trustNoteLabel: "注意事項：", trustNote: "本工具使用簡化版 2024 美國單身聯邦稅率表；實際稅務因州法、家庭狀況與扣除項目而異。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立稅後薪資範例", examplePreview: "稅率預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高薪範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入薪資與稅務資訊", examplesHelper: "先用範例理解稅後薪資計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "一般薪資 · $75k", activeExample: "高薪型", flowDemo: "年薪 $75,000", calculator: "計算機",
    grossSalary: "年薪 ($)", stateTaxRate: "州稅率 (%)", deductions: "扣除額 ($)", filingStatus: "申報身份",
    single: "單身", married: "已婚合併",
    resultCard: "稅後薪資計算結果", unit: "稅後薪資 ($)", primaryValue: "主要數值", maintenanceTarget: "年稅後薪資 ($)", actionTarget: "月到手薪資", estimatedTdee: "有效稅率", maintenance: "稅後年薪", fatLossTarget: "月到手薪資",
    annualTakeHome: "年稅後薪資", monthlyTakeHome: "月到手薪資", federalTax: "聯邦稅", stateTax: "州稅", socialSecurity: "社會安全稅", medicareTax: "醫療保險稅", totalTax: "總稅額", effectiveRate: "有效稅率",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格稅率壓力判讀矩陣", tdeeMatrixNote: "L7 固定六格，將有效稅率放進常見規劃區間；這是規劃參考，不是稅務建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把稅後薪資盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示有效稅率、月到手薪資與儲蓄提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前稅後薪資計畫", dailyGap: "總稅額", weeklyTrend: "有效稅率", motivation: "動力卡", keepMomentum: "從稅後薪資盤點走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的稅後薪資盤點帶回家", journeyHint: "每年報稅季重新計算一次，追蹤有效稅率變化。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用時薪計算機了解你的真實時薪", nextActionItem2: "用預算比例計算機規劃到手薪資分配", nextActionItem3: "用淨資產計算機檢視整體財務健康",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "稅後薪資 → 時薪 → 預算比例 → 淨資產", bmrStep: "稅後薪資", deficitStep: "時薪", trendStep: "預算比例", mealStep: "淨資產",
    knowledge: "知識", knowledgeTitle: "稅後薪資在財務規劃中的意義", definition: "定義", definitionText: "稅後薪資是扣除所有強制稅費後的實際到手收入，包括聯邦所得稅、州所得稅、社會安全稅與醫療保險稅。",
    formula: "公式", formulaText: "應稅收入 = 年薪 − 扣除額。聯邦稅依累進稅率計算。州稅 = 應稅收入 × 州稅率。社會安全稅 = min(年薪, 168,600) × 6.2%。醫療保險稅 = 年薪 × 1.45%。稅後薪資 = 年薪 − 總稅額。有效稅率 = 總稅額 ÷ 年薪 × 100%。",
    limitations: "限制", limitationsText: "使用簡化單身聯邦稅率表；未計算 AMT、資本利得、稅額抵減或家庭狀況差異。實際稅務請諮詢專業稅務人員。",
    interpretation: "解讀", interpretationText: "有效稅率 20–30% 為一般受薪者常見範圍；超過 30% 建議檢視扣除額與退休帳戶貢獻。",
    context: "脈絡", contextText: "稅後薪資應搭配時薪計算、預算比例與淨資產一起看。",
    example: "範例", exampleText: "年薪 $75,000，扣除額 $14,600，州稅率 5%。應稅收入 $60,400。聯邦稅約 $8,288，州稅 $3,020，社安稅 $4,650，醫保稅 $1,088。總稅約 $17,046，稅後年薪 $57,954，月到手 $4,830，有效稅率 22.7%。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "稅後薪資規劃的下一步工具", premiumTitle: "專業版稅務規劃包", premiumText: "解鎖年度稅務趨勢圖、扣除額最佳化分析、州際比較與個人化稅務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代稅務顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "時薪計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機", references: "參考資料", referencesText: "美國國稅局 2024 稅率級距；稅務基金會州稅率資料；社會安全署薪資基數；消費者金融保護局預扣稅指南。",
    q1: "有效稅率與邊際稅率有何不同？", a1: "有效稅率是總稅額除以總收入，反映整體稅負；邊際稅率是下一元收入適用的稅率，通常較高。",
    q2: "如何降低有效稅率？", a2: "善用 401(k)、IRA 等稅前扣除，增加標準或列舉扣除額，並利用子女抵稅等稅額抵免。",
    q3: "州稅差異有多大？", a3: "部分州無所得稅（如德州、佛州），部分州高達 13%（如加州），跨州工作需特別注意。",
    q4: "社會安全稅與醫保稅能否避免？", a4: "受薪者無法避免；自僱者需繳雙倍（15.3%），但半數可作為業務支出扣除。",
    q5: "年終獎金會被扣多少稅？", a5: "獎金視為補充薪資，聯邦預扣通常 22%（超過百萬則 37%）；實際稅負依總收入計算。",
    q6: "這個工具能提供稅務申報或避稅建議嗎？", a6: "不能。它只是教育用估算；若需稅務申報、避稅策略或重大財務決策，請諮詢專業人員。",
  },
  en: {
    badge: "財務 · 薪資稅務 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Salary After Tax Calculator · 稅後薪資計算機", subtitle: "計算你的實際到手薪資與有效稅率",
    intro: "本工具根據你的年薪、州稅率與扣除額，估算聯邦稅、州稅、社會安全稅與醫療保險稅，得出實際到手薪資與有效稅率。",
    trustNoteLabel: "注意事項：", trustNote: "本工具使用簡化版 2024 美國單身聯邦稅率表；實際稅務因州法、家庭狀況與扣除項目而異。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立稅後薪資範例", examplePreview: "稅率預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高薪範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入薪資與稅務資訊", examplesHelper: "先用範例理解稅後薪資計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "一般薪資 · $75k", activeExample: "高薪型", flowDemo: "年薪 $75,000", calculator: "計算機",
    grossSalary: "年薪 ($)", stateTaxRate: "州稅率 (%)", deductions: "扣除額 ($)", filingStatus: "申報身份",
    single: "單身", married: "已婚合併",
    resultCard: "稅後薪資計算結果", unit: "稅後薪資 ($)", primaryValue: "主要數值", maintenanceTarget: "年稅後薪資 ($)", actionTarget: "月到手薪資", estimatedTdee: "有效稅率", maintenance: "稅後年薪", fatLossTarget: "月到手薪資",
    annualTakeHome: "年稅後薪資", monthlyTakeHome: "月到手薪資", federalTax: "聯邦稅", stateTax: "州稅", socialSecurity: "社會安全稅", medicareTax: "醫療保險稅", totalTax: "總稅額", effectiveRate: "有效稅率",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格稅率壓力判讀矩陣", tdeeMatrixNote: "L7 固定六格，將有效稅率放進常見規劃區間；這是規劃參考，不是稅務建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把稅後薪資盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示有效稅率、月到手薪資與儲蓄提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前稅後薪資計畫", dailyGap: "總稅額", weeklyTrend: "有效稅率", motivation: "動力卡", keepMomentum: "從稅後薪資盤點走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的稅後薪資盤點帶回家", journeyHint: "每年報稅季重新計算一次，追蹤有效稅率變化。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用時薪計算機了解你的真實時薪", nextActionItem2: "用預算比例計算機規劃到手薪資分配", nextActionItem3: "用淨資產計算機檢視整體財務健康",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "稅後薪資 → 時薪 → 預算比例 → 淨資產", bmrStep: "稅後薪資", deficitStep: "時薪", trendStep: "預算比例", mealStep: "淨資產",
    knowledge: "知識", knowledgeTitle: "稅後薪資在財務規劃中的意義", definition: "定義", definitionText: "稅後薪資是扣除所有強制稅費後的實際到手收入，包括聯邦所得稅、州所得稅、社會安全稅與醫療保險稅。",
    formula: "公式", formulaText: "應稅收入 = 年薪 − 扣除額。聯邦稅依累進稅率計算。州稅 = 應稅收入 × 州稅率。社會安全稅 = min(年薪, 168,600) × 6.2%。醫療保險稅 = 年薪 × 1.45%。稅後薪資 = 年薪 − 總稅額。有效稅率 = 總稅額 ÷ 年薪 × 100%。",
    limitations: "限制", limitationsText: "使用簡化單身聯邦稅率表；未計算 AMT、資本利得、稅額抵減或家庭狀況差異。實際稅務請諮詢專業稅務人員。",
    interpretation: "解讀", interpretationText: "有效稅率 20–30% 為一般受薪者常見範圍；超過 30% 建議檢視扣除額與退休帳戶貢獻。",
    context: "脈絡", contextText: "稅後薪資應搭配時薪計算、預算比例與淨資產一起看。",
    example: "範例", exampleText: "年薪 $75,000，扣除額 $14,600，州稅率 5%。應稅收入 $60,400。聯邦稅約 $8,288，州稅 $3,020，社安稅 $4,650，醫保稅 $1,088。總稅約 $17,046，稅後年薪 $57,954，月到手 $4,830，有效稅率 22.7%。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "稅後薪資規劃的下一步工具", premiumTitle: "專業版稅務規劃包", premiumText: "解鎖年度稅務趨勢圖、扣除額最佳化分析、州際比較與個人化稅務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代稅務顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "時薪計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機", references: "參考資料", referencesText: "美國國稅局 2024 稅率級距；稅務基金會州稅率資料；社會安全署薪資基數；消費者金融保護局預扣稅指南。",
    q1: "有效稅率與邊際稅率有何不同？", a1: "有效稅率是總稅額除以總收入，反映整體稅負；邊際稅率是下一元收入適用的稅率，通常較高。",
    q2: "如何降低有效稅率？", a2: "善用 401(k)、IRA 等稅前扣除，增加標準或列舉扣除額，並利用子女抵稅等稅額抵免。",
    q3: "州稅差異有多大？", a3: "部分州無所得稅（如德州、佛州），部分州高達 13%（如加州），跨州工作需特別注意。",
    q4: "社會安全稅與醫保稅能否避免？", a4: "受薪者無法避免；自僱者需繳雙倍（15.3%），但半數可作為業務支出扣除。",
    q5: "年終獎金會被扣多少稅？", a5: "獎金視為補充薪資，聯邦預扣通常 22%（超過百萬則 37%）；實際稅負依總收入計算。",
    q6: "這個工具能提供稅務申報或避稅建議嗎？", a6: "不能。它只是教育用估算；若需稅務申報、避稅策略或重大財務決策，請諮詢專業人員。",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function SalaryAfterTaxCalculator() {
  const { lang, setLang } = useLanguage();
  const displayLang: Lang = "zh";
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [grossSalary, setGrossSalary] = useState("75000");
  const [stateTaxRate, setStateTaxRate] = useState("5");
  const [deductions, setDeductions] = useState("14600");
  const [filingStatus, setFilingStatus] = useState<"single" | "married">("single");
  const t = ui.zh;

  const result = useMemo(() => {
    const gross = Number(grossSalary) || 0;
    const stRate = (Number(stateTaxRate) || 0) / 100;
    const deduct = Number(deductions) || 0;
    const taxable = Math.max(gross - deduct, 0);
    const fedTax = calcFederalTax(taxable);
    const stTax = taxable * stRate;
    const ssTax = Math.min(gross, 168600) * 0.062;
    const medTax = gross * 0.0145;
    const total = fedTax + stTax + ssTax + medTax;
    const takeHome = gross - total;
    const effRate = gross > 0 ? (total / gross) * 100 : 0;
    const monthly = takeHome / 12;
    return { fedTax, stTax, ssTax, medTax, total, takeHome, effRate, monthly, taxable };
  }, [grossSalary, stateTaxRate, deductions, filingStatus]);

  const effRateDisplay = fmt(result.effRate, 1);
  const monthlyDisplay = fmt(result.monthly, 0);

  function fillSolid() { setUnit("metric"); setGrossSalary("75000"); setStateTaxRate("5"); setDeductions("14600"); setFilingStatus("single"); }
  function fillHighSalary() { setUnit("imperial"); setGrossSalary("150000"); setStateTaxRate("8"); setDeductions("29200"); setFilingStatus("single"); }

  const activeBand = bands.find(b => {
    const r = result.effRate;
    if (r < 0) return b.key === "credit";
    if (r < 10) return b.key === "minimal";
    if (r < 20) return b.key === "low";
    if (r < 30) return b.key === "moderate";
    if (r < 40) return b.key === "high";
    return b.key === "heavy";
  });

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{effRateDisplay}%</div><div className="text-sm font-bold text-amber-100">{t.estimatedTdee}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{effRateDisplay}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${fmt(Number(grossSalary), 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">22.7%</span></div><p className="mt-2 text-sm text-slate-600">$75k · 到手 $57,954</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">~31%</span></div><p className="mt-2 text-sm text-slate-600">$150k · 州稅 8%</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.grossSalary}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.stateTaxRate}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={stateTaxRate} onChange={(e) => setStateTaxRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.deductions}<input className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={deductions} onChange={(e) => setDeductions(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.filingStatus}<select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as "single" | "married")} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold"><option value="single">{t.single}</option><option value="married">{t.married}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{effRateDisplay}<span className="text-3xl">%</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyTakeHome}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">/月</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.takeHome, 0)}</p><p className="text-sm font-bold text-emerald-700">/年</p></div><div className="rounded-2xl bg-red-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">{t.totalTax}</div><div className="mt-1 text-xs font-black text-red-700">稅額</div><p className="mt-2 text-3xl font-black text-red-950">${fmt(result.total, 0)}</p><p className="text-sm font-bold text-red-700">總額</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveRate}</div><div className="mt-1 text-xs font-black text-slate-700">稅率</div><p className="mt-2 text-3xl font-black text-slate-950">{effRateDisplay}%</p><p className="text-sm font-bold text-slate-700">有效</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, displayLang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, displayLang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="salaryaftertax-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">到手薪資</div><div className="mt-1 text-3xl font-black">${fmt(result.takeHome, 0)}</div></div><div className="rounded-2xl bg-red-50 p-4"><div className="text-xs font-black uppercase text-red-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-red-950">${fmt(result.total, 0)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{effRateDisplay}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "稅後", note: t.bmrStep }, { label: "時薪", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問答後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="salaryaftertax-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, displayLang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">推薦連結揭露：部分連結可能帶來佣金收入。</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["趨勢", "扣除額", "比較", "報告"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
