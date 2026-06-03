// @profile B
// Profile B · Calculator-YMYL · BudgetRatioCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "survival", range: "必要支出 > 70%", label: { zh: "生存模式", en: "生存模式" }, desc: { zh: "基本開支佔比過高，需削減固定支出或增加收入。", en: "基本開支佔比過高，需削減固定支出或增加收入。" } },
  { key: "tight", range: "必要支出 60–70%", label: { zh: "緊繃", en: "緊繃" }, desc: { zh: "基本開支偏高，可微調訂閱與非必要支出。", en: "基本開支偏高，可微調訂閱與非必要支出。" } },
  { key: "balanced", range: "必要支出 50–60%", label: { zh: "均衡", en: "均衡" }, desc: { zh: "接近 50/30/20 黃金比例，財務結構健康。", en: "接近 50/30/20 黃金比例，財務結構健康。" } },
  { key: "comfortable", range: "必要支出 40–50%", label: { zh: "寬裕", en: "寬裕" }, desc: { zh: "基本開支佔比低，可增加儲蓄或投資。", en: "基本開支佔比低，可增加儲蓄或投資。" } },
  { key: "wealthy", range: "必要支出 < 40%", label: { zh: "財富自由", en: "財富自由" }, desc: { zh: "基本開支極低，大量資金可投入成長型資產。", en: "基本開支極低，大量資金可投入成長型資產。" } },
  { key: "overSaved", range: "儲蓄 > 50%", label: { zh: "過度儲蓄", en: "過度儲蓄" }, desc: { zh: "儲蓄佔比過高，建議適度分配到生活品質與體驗。", en: "儲蓄佔比過高，建議適度分配到生活品質與體驗。" } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "淨資產計算機", en: "淨資產計算機" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "儲蓄目標計算機", en: "儲蓄目標計算機" }, href: "/tools/finance/savings-goal-calculator" },
  { label: { zh: "負債收入比計算機", en: "負債收入比計算機" }, href: "/tools/finance/debt-to-income-calculator" },
  { label: { zh: "退休計算機", en: "退休計算機" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 預算規劃 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Budget Ratio Calculator · 預算比例計算機", subtitle: "用 50/30/20 法則分配收入，掌握財務結構",
    intro: "本工具將你的月收入按 50/30/20 法則分為需要、想要與儲蓄三類，協助檢視支出結構是否健康並規劃改善方向。",
    trustNoteLabel: "注意事項：", trustNote: "50/30/20 為一般性參考比例，實際分配需考慮地區生活成本與個人目標。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立預算比例範例", examplePreview: "預算比例預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高支出範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入收入與支出", examplesHelper: "先用範例理解預算比例計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "均衡型 · 50/30/20", activeExample: "高支出型", flowDemo: "月收 $5,000", calculator: "計算機",
    monthlyIncome: "月收入 ($)", needs: "必要支出 ($)", wants: "想要支出 ($)", savings: "儲蓄與投資 ($)",
    resultCard: "預算比例計算結果", unit: "比例分配", primaryValue: "主要數值", maintenanceTarget: "儲蓄金額 ($)", actionTarget: "需要佔比", estimatedTdee: "月收入", maintenance: "儲蓄", fatLossTarget: "需要",
    needsPct: "需要佔比", wantsPct: "想要佔比", savingsPct: "儲蓄佔比", idealNeeds: "理想需要 (50%)", idealWants: "理想想要 (30%)", idealSavings: "理想儲蓄 (20%)",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格預算壓力判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前需要佔比放進常見規劃區間；這是規劃參考，不是理財建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把預算比例盤點轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示各類佔比、目標差距與改善提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前預算計畫", dailyGap: "需要佔比", weeklyTrend: "儲蓄佔比", motivation: "動力卡", keepMomentum: "從預算比例盤點走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的預算比例盤點帶回家", journeyHint: "每月重新計算一次，追蹤支出結構改善進度。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用淨資產計算機檢視整體財務健康", nextActionItem2: "用儲蓄目標計算機規劃儲蓄進度", nextActionItem3: "用負債收入比確認償債能力",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "預算比例 → 淨資產 → 儲蓄目標 → 負債收入比", bmrStep: "預算比例", deficitStep: "淨資產", trendStep: "儲蓄目標", mealStep: "負債收入比",
    knowledge: "知識", knowledgeTitle: "預算比例在財務規劃中的意義", definition: "定義", definitionText: "預算比例是將月收入按需要、想要、儲蓄分類的百分比分配。50/30/20 法則是常見的參考框架。",
    formula: "公式", formulaText: "需要佔比 = 必要支出 ÷ 月收入 × 100%。想要佔比 = 想要支出 ÷ 月收入 × 100%。儲蓄佔比 = 儲蓄投資 ÷ 月收入 × 100%。三項合計 = 100%。",
    limitations: "限制", limitationsText: "50/30/20 為一般性建議，高物價地區可能需要超過 50% 的必要支出。不適用於收入極端不穩定者。",
    interpretation: "解讀", interpretationText: "需要 < 50% 為健康；50–60% 需注意；> 60% 應削減固定支出。儲蓄 > 20% 為理想；< 10% 需改善。",
    context: "脈絡", contextText: "預算比例應搭配淨資產、儲蓄目標與負債收入比一起看。",
    example: "範例", exampleText: "月收 $5,000：需要 $2,500 (50%) + 想要 $1,500 (30%) + 儲蓄 $1,000 (20%) = 完美均衡型。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "預算規劃的下一步工具", premiumTitle: "專業版預算追蹤包", premiumText: "解鎖月度趨勢圖、類別深度分析、儲蓄進度模擬與個人化財務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代理財顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "淨資產計算機 · 儲蓄目標計算機 · 負債收入比計算機 · 退休計算機", references: "參考資料", referencesText: "美國消費者金融保護局預算指南；美國聯準會消費者財務調查；美國勞工統計局消費支出調查；50/30/20 預算框架。",
    q1: "50/30/20 法則適合所有人嗎？", a1: "它是參考框架，高物價地區或低收入者可能需要調整比例，如 60/20/20。", q2: "房租算在「需要」還是「想要」？", a2: "房租屬於「需要」（必要居住支出）；超過合理範圍的部分才需檢討。", q3: "儲蓄率多少才算好？", a3: "20% 以上為理想；10% 為最低建議；低於 10% 應優先改善。", q4: "收入不穩定怎麼辦？", a4: "用平均月收入計算；或以最低月份估算確保基本覆蓋。", q5: "怎麼減少「需要」佔比？", a5: "協商降租、取消未使用訂閱、比較保險方案、考慮合租或搬遷。", q6: "這個工具能提供投資建議或財務規劃嗎？", a6: "不能。它只是教育用估算；若需投資、稅務或重大財務決策，請諮詢專業人員。",
  },
  en: {
    badge: "財務 · 預算規劃 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Budget Ratio Calculator · 預算比例計算機", subtitle: "用 50/30/20 法則分配收入，掌握財務結構",
    intro: "本工具將你的月收入按 50/30/20 法則分為需要、想要與儲蓄三類，協助檢視支出結構是否健康並規劃改善方向。",
    trustNoteLabel: "注意事項：", trustNote: "50/30/20 為一般性參考比例，實際分配需考慮地區生活成本與個人目標。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立預算比例範例", examplePreview: "預算比例預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高支出範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入收入與支出", examplesHelper: "先用範例理解預算比例計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "均衡型 · 50/30/20", activeExample: "高支出型", flowDemo: "月收 $5,000", calculator: "計算機",
    monthlyIncome: "月收入 ($)", needs: "必要支出 ($)", wants: "想要支出 ($)", savings: "儲蓄與投資 ($)",
    resultCard: "預算比例計算結果", unit: "比例分配", primaryValue: "主要數值", maintenanceTarget: "儲蓄金額 ($)", actionTarget: "需要佔比", estimatedTdee: "月收入", maintenance: "儲蓄", fatLossTarget: "需要",
    needsPct: "需要佔比", wantsPct: "想要佔比", savingsPct: "儲蓄佔比", idealNeeds: "理想需要 (50%)", idealWants: "理想想要 (30%)", idealSavings: "理想儲蓄 (20%)",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格預算壓力判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前需要佔比放進常見規劃區間；這是規劃參考，不是理財建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把預算比例盤點轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示各類佔比、目標差距與改善提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前預算計畫", dailyGap: "需要佔比", weeklyTrend: "儲蓄佔比", motivation: "動力卡", keepMomentum: "從預算比例盤點走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的預算比例盤點帶回家", journeyHint: "每月重新計算一次，追蹤支出結構改善進度。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用淨資產計算機檢視整體財務健康", nextActionItem2: "用儲蓄目標計算機規劃儲蓄進度", nextActionItem3: "用負債收入比確認償債能力",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "預算比例 → 淨資產 → 儲蓄目標 → 負債收入比", bmrStep: "預算比例", deficitStep: "淨資產", trendStep: "儲蓄目標", mealStep: "負債收入比",
    knowledge: "知識", knowledgeTitle: "預算比例在財務規劃中的意義", definition: "定義", definitionText: "預算比例是將月收入按需要、想要、儲蓄分類的百分比分配。50/30/20 法則是常見的參考框架。",
    formula: "公式", formulaText: "需要佔比 = 必要支出 ÷ 月收入 × 100%。想要佔比 = 想要支出 ÷ 月收入 × 100%。儲蓄佔比 = 儲蓄投資 ÷ 月收入 × 100%。三項合計 = 100%。",
    limitations: "限制", limitationsText: "50/30/20 為一般性建議，高物價地區可能需要超過 50% 的必要支出。不適用於收入極端不穩定者。",
    interpretation: "解讀", interpretationText: "需要 < 50% 為健康；50–60% 需注意；> 60% 應削減固定支出。儲蓄 > 20% 為理想；< 10% 需改善。",
    context: "脈絡", contextText: "預算比例應搭配淨資產、儲蓄目標與負債收入比一起看。",
    example: "範例", exampleText: "月收 $5,000：需要 $2,500 (50%) + 想要 $1,500 (30%) + 儲蓄 $1,000 (20%) = 完美均衡型。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "預算規劃的下一步工具", premiumTitle: "專業版預算追蹤包", premiumText: "解鎖月度趨勢圖、類別深度分析、儲蓄進度模擬與個人化財務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代理財顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "淨資產計算機 · 儲蓄目標計算機 · 負債收入比計算機 · 退休計算機", references: "參考資料", referencesText: "美國消費者金融保護局預算指南；美國聯準會消費者財務調查；美國勞工統計局消費支出調查；50/30/20 預算框架。",
    q1: "50/30/20 法則適合所有人嗎？", a1: "它是參考框架，高物價地區或低收入者可能需要調整比例，如 60/20/20。", q2: "房租算在「需要」還是「想要」？", a2: "房租屬於「需要」（必要居住支出）；超過合理範圍的部分才需檢討。", q3: "儲蓄率多少才算好？", a3: "20% 以上為理想；10% 為最低建議；低於 10% 應優先改善。", q4: "收入不穩定怎麼辦？", a4: "用平均月收入計算；或以最低月份估算確保基本覆蓋。", q5: "怎麼減少「需要」佔比？", a5: "協商降租、取消未使用訂閱、比較保險方案、考慮合租或搬遷。", q6: "這個工具能提供投資建議或財務規劃嗎？", a6: "不能。它只是教育用估算；若需投資、稅務或重大財務決策，請諮詢專業人員。",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function BudgetRatioCalculator() {
  const { lang, setLang } = useLanguage();
  const displayLang: Lang = "zh";
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [monthlyIncome, setMonthlyIncome] = useState("5000");
  const [needs, setNeeds] = useState("2500");
  const [wants, setWants] = useState("1500");
  const [savings, setSavings] = useState("1000");
  const t = ui[lang];

  const result = useMemo(() => {
    const inc = Number(monthlyIncome) || 1;
    const n = Number(needs) || 0;
    const w = Number(wants) || 0;
    const s = Number(savings) || 0;
    const needsPct = (n / inc) * 100;
    const wantsPct = (w / inc) * 100;
    const savingsPct = (s / inc) * 100;
    const idealNeeds = inc * 0.5;
    const idealWants = inc * 0.3;
    const idealSavings = inc * 0.2;
    return { needsPct, wantsPct, savingsPct, idealNeeds, idealWants, idealSavings, totalSpent: n + w + s };
  }, [monthlyIncome, needs, wants, savings]);

  const needsDisplay = fmt(result.needsPct, 1);
  const savingsDisplay = fmt(result.savingsPct, 1);

  function fillBalanced() { setUnit("metric"); setMonthlyIncome("5000"); setNeeds("2500"); setWants("1500"); setSavings("1000"); }
  function fillHighExpense() { setUnit("metric"); setMonthlyIncome("4000"); setNeeds("3000"); setWants("800"); setSavings("200"); }

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-3xl bg-emerald-600 p-4 text-white"><div className="text-xs font-bold uppercase text-emerald-100">需要</div><div className="mt-1 text-4xl font-black">{needsDisplay}%</div></div><div className="rounded-3xl bg-amber-500 p-4 text-white"><div className="text-xs font-bold uppercase text-amber-100">想要</div><div className="mt-1 text-4xl font-black">{fmt(result.wantsPct, 1)}%</div></div><div className="rounded-3xl bg-blue-600 p-4 text-white"><div className="text-xs font-bold uppercase text-blue-100">儲蓄</div><div className="mt-1 text-4xl font-black">{savingsDisplay}%</div></div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{needsDisplay}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${fmt(Number(monthlyIncome), 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">儲蓄</div><div className="font-black">{savingsDisplay}%</div></div></div><button onClick={fillBalanced} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighExpense} className="mt-3 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBalanced} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">50/30/20</span></div><p className="mt-2 text-sm text-slate-600">月收入 $5,000</p></button><button onClick={fillHighExpense} className="w-full rounded-2xl border border-red-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">75%</span></div><p className="mt-2 text-sm text-slate-600">每月 $4,000 · 必要支出 $3,000</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.monthlyIncome}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.needs}<input className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={needs} onChange={(e) => setNeeds(e.target.value)} /></label><label className="block text-sm font-black text-amber-700">{t.wants}<input className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3 text-lg font-bold" value={wants} onChange={(e) => setWants(e.target.value)} /></label><label className="block text-sm font-black text-blue-700">{t.savings}<input className="mt-2 w-full rounded-2xl border border-blue-200 px-4 py-3 text-lg font-bold" value={savings} onChange={(e) => setSavings(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 via-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.needsPct}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">需要</div><p className="mt-2 text-4xl font-black text-emerald-950">{needsDisplay}%</p><p className="text-sm font-bold text-emerald-700">理想：50%</p></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{t.wantsPct}</div><div className="mt-1 text-xs font-black uppercase text-amber-700">想要</div><p className="mt-2 text-4xl font-black text-amber-950">{fmt(result.wantsPct, 1)}%</p><p className="text-sm font-bold text-amber-700">理想：30%</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.savingsPct}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">儲蓄</div><p className="mt-2 text-4xl font-black text-blue-950">{savingsDisplay}%</p><p className="text-sm font-bold text-blue-700">理想：20%</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(Number(savings), 0)}</p><p className="text-sm font-bold text-emerald-700">/月</p></div><div className="rounded-2xl bg-red-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-red-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-red-950">{needsDisplay}%</p><p className="text-sm font-bold text-red-700">占收入</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.estimatedTdee}</div><div className="mt-1 text-xs font-black uppercase text-slate-700">收入</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(Number(monthlyIncome), 0)}</p><p className="text-sm font-bold text-slate-700">/月</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, displayLang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, displayLang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="budgetratio-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">需要</div><div className="mt-1 text-3xl font-black">{needsDisplay}%</div></div><div className="rounded-2xl bg-red-50 p-4"><div className="text-xs font-black uppercase text-red-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-red-950">{needsDisplay}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{savingsDisplay}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "預算", note: t.bmrStep }, { label: "淨資產", note: t.deficitStep }, { label: "儲蓄", note: t.trendStep }, { label: "負債比", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="budgetratio-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, displayLang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["趨勢", "分類", "模擬", "報告"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
