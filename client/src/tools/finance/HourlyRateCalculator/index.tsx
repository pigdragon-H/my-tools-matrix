// @profile B
// Profile B · Calculator-YMYL · HourlyRateCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "minimum", range: "<$10/小時", label: { zh: "最低工資", en: "最低工資" }, desc: { zh: "時薪接近最低工資，建議提升技能或尋找更高薪機會。", en: "時薪接近最低工資，建議提升技能或尋找更高薪機會。" } },
  { key: "entry", range: "$10–20/小時", label: { zh: "入門", en: "入門" }, desc: { zh: "入門級時薪，持續累積經驗以提升價值。", en: "入門級時薪，持續累積經驗以提升價值。" } },
  { key: "mid", range: "$20–40/小時", label: { zh: "中階", en: "中階" }, desc: { zh: "中階時薪，適合開始規劃長期財務目標。", en: "中階時薪，適合開始規劃長期財務目標。" } },
  { key: "senior", range: "$40–60/小時", label: { zh: "資深", en: "資深" }, desc: { zh: "資深級時薪，可加速投資與資產累積。", en: "資深級時薪，可加速投資與資產累積。" } },
  { key: "expert", range: "$60–100/小時", label: { zh: "專家", en: "專家" }, desc: { zh: "專家級時薪，善用高收入優勢最大化投資。", en: "專家級時薪，善用高收入優勢最大化投資。" } },
  { key: "elite", range: ">$100/小時", label: { zh: "頂尖", en: "頂尖" }, desc: { zh: "頂尖時薪，專注資產配置與稅務效率。", en: "頂尖時薪，專注資產配置與稅務效率。" } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "稅後薪資計算機", en: "稅後薪資計算機" }, href: "/tools/finance/salary-after-tax-calculator" },
  { label: { zh: "預算比例計算機", en: "預算比例計算機" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "淨資產計算機" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "退休計算機", en: "退休計算機" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 時薪換算 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Hourly Rate Calculator · 時薪計算機", subtitle: "將年薪或月薪換算成真實時薪",
    intro: "本工具將你的年薪換算成實際時薪，並考量休假與工時差異，幫助你了解每小時工作時間的真實價值。",
    trustNoteLabel: "注意事項：", trustNote: "此計算假設標準工時；實際時薪受加班、獎金與非現金福利影響。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立時薪範例", examplePreview: "時薪預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高薪範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入薪資與工時資訊", examplesHelper: "先用範例理解時薪計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "一般薪資 · $75k", activeExample: "高薪型", flowDemo: "年薪 $75,000", calculator: "計算機",
    annualSalary: "年薪 ($)", weeklyHours: "每週工時", weeksPerYear: "每年工作週數", vacationDays: "年休假天數",
    resultCard: "時薪計算結果", unit: "時薪（$/小時）", primaryValue: "主要數值", maintenanceTarget: "實際時薪（$/小時）", actionTarget: "月薪換算", estimatedTdee: "時薪", maintenance: "時薪", fatLossTarget: "月薪等價",
    hourlyRate: "時薪", monthlyEquiv: "月薪等價", weeklyEquiv: "週薪等價", dailyEquiv: "日薪等價", effectiveHours: "實際年工時",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格時薪等級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將時薪放進常見等級區間；這是規劃參考，不是薪資建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把時薪盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示時薪、月薪等價與儲蓄提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前時薪計畫", dailyGap: "日薪", weeklyTrend: "時薪", motivation: "動力卡", keepMomentum: "從時薪盤點走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的時薪盤點帶回家", journeyHint: "每次調薪或換工作時重新計算，追蹤時薪成長。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用稅後薪資計算機了解扣稅後的實際到手", nextActionItem2: "用預算比例計算機規劃到手薪資分配", nextActionItem3: "用淨資產計算機檢視整體財務健康",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "時薪 → 稅後薪資 → 預算比例 → 淨資產", bmrStep: "時薪", deficitStep: "稅後薪資", trendStep: "預算比例", mealStep: "淨資產",
    knowledge: "知識", knowledgeTitle: "時薪在財務規劃中的意義", definition: "定義", definitionText: "時薪是將總薪資除以實際工作時數得出的每小時收入，反映工作時間的真實價值。",
    formula: "公式", formulaText: "實際年工時 = (工作週數 × 每週工時) − (休假天數 × 每日工時)。時薪 = 年薪 ÷ 實際年工時。月薪等價 = 年薪 ÷ 12。週薪等價 = 年薪 ÷ 52。日薪等價 = 年薪 ÷ 工作天數。",
    limitations: "限制", limitationsText: "假設固定工時與薪資；未計算加班費、獎金、非現金福利或自僱稅負差異。",
    interpretation: "解讀", interpretationText: "時薪 $20–40 為一般白領常見範圍；超過 $60 代表高專業度或管理職位。",
    context: "脈絡", contextText: "時薪應搭配稅後薪資、預算比例與淨資產一起看。",
    example: "範例", exampleText: "年薪 $75,000，每週 40 小時，工作 50 週，休假 10 天。實際工時 = 50×40 − 10×8 = 1,920 小時。時薪 = $75,000 ÷ 1,920 ≈ $39.06/小時。月薪等價 $6,250。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "時薪規劃的下一步工具", premiumTitle: "專業版時薪追蹤包", premiumText: "解鎖時薪成長趨勢圖、同行比較、自由職業估算與個人化收入報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代薪資顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "稅後薪資計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機", references: "參考資料", referencesText: "美國勞工統計職業展望資料；美國勞工部公平勞動標準說明；美國時間使用調查；消費者金融保護局收入規劃資料。",
    q1: "時薪和月薪哪個更準確？", a1: "時薪更精確地反映工作價值，因為它考慮了實際工作時數，包括加班與休假差異。",
    q2: "為什麼我的實際時薪比帳面低？", a2: "如果經常無償加班，實際工時比合約工時多，時薪就會被稀釋。計算時應包含所有工作時間。",
    q3: "自由工作者怎麼算時薪？", a3: "自由工作者的時薪 = 專案收入 ÷ 專案總時數（含溝通、修改時間）。還需額外扣除自僱稅與業務成本。",
    q4: "加班費如何影響時薪？", a4: "有償加班（1.5x 或 2x）會提高加權時薪；無償加班則降低實際時薪。計算時應分開考量。",
    q5: "兼職或多份工作的時薪怎麼算？", a5: "分別計算每份工作的時薪，再以收入加權平均。高時薪工作應優先投入時間。",
    q6: "這個工具能提供薪資談判或職涯建議嗎？", a6: "不能。它只是教育用估算；若需薪資談判、職涯規劃或勞動權益，請諮詢專業人員。",
  },
  en: {
    badge: "財務 · 時薪換算 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Hourly Rate Calculator · 時薪計算機", subtitle: "將年薪或月薪換算成真實時薪",
    intro: "本工具將你的年薪換算成實際時薪，並考量休假與工時差異，幫助你了解每小時工作時間的真實價值。",
    trustNoteLabel: "注意事項：", trustNote: "此計算假設標準工時；實際時薪受加班、獎金與非現金福利影響。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立時薪範例", examplePreview: "時薪預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高薪範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入薪資與工時資訊", examplesHelper: "先用範例理解時薪計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "一般薪資 · $75k", activeExample: "高薪型", flowDemo: "年薪 $75,000", calculator: "計算機",
    annualSalary: "年薪 ($)", weeklyHours: "每週工時", weeksPerYear: "每年工作週數", vacationDays: "年休假天數",
    resultCard: "時薪計算結果", unit: "時薪（$/小時）", primaryValue: "主要數值", maintenanceTarget: "實際時薪（$/小時）", actionTarget: "月薪換算", estimatedTdee: "時薪", maintenance: "時薪", fatLossTarget: "月薪等價",
    hourlyRate: "時薪", monthlyEquiv: "月薪等價", weeklyEquiv: "週薪等價", dailyEquiv: "日薪等價", effectiveHours: "實際年工時",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格時薪等級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將時薪放進常見等級區間；這是規劃參考，不是薪資建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把時薪盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示時薪、月薪等價與儲蓄提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前時薪計畫", dailyGap: "日薪", weeklyTrend: "時薪", motivation: "動力卡", keepMomentum: "從時薪盤點走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的時薪盤點帶回家", journeyHint: "每次調薪或換工作時重新計算，追蹤時薪成長。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用稅後薪資計算機了解扣稅後的實際到手", nextActionItem2: "用預算比例計算機規劃到手薪資分配", nextActionItem3: "用淨資產計算機檢視整體財務健康",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "時薪 → 稅後薪資 → 預算比例 → 淨資產", bmrStep: "時薪", deficitStep: "稅後薪資", trendStep: "預算比例", mealStep: "淨資產",
    knowledge: "知識", knowledgeTitle: "時薪在財務規劃中的意義", definition: "定義", definitionText: "時薪是將總薪資除以實際工作時數得出的每小時收入，反映工作時間的真實價值。",
    formula: "公式", formulaText: "實際年工時 = (工作週數 × 每週工時) − (休假天數 × 每日工時)。時薪 = 年薪 ÷ 實際年工時。月薪等價 = 年薪 ÷ 12。週薪等價 = 年薪 ÷ 52。日薪等價 = 年薪 ÷ 工作天數。",
    limitations: "限制", limitationsText: "假設固定工時與薪資；未計算加班費、獎金、非現金福利或自僱稅負差異。",
    interpretation: "解讀", interpretationText: "時薪 $20–40 為一般白領常見範圍；超過 $60 代表高專業度或管理職位。",
    context: "脈絡", contextText: "時薪應搭配稅後薪資、預算比例與淨資產一起看。",
    example: "範例", exampleText: "年薪 $75,000，每週 40 小時，工作 50 週，休假 10 天。實際工時 = 50×40 − 10×8 = 1,920 小時。時薪 = $75,000 ÷ 1,920 ≈ $39.06/小時。月薪等價 $6,250。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "時薪規劃的下一步工具", premiumTitle: "專業版時薪追蹤包", premiumText: "解鎖時薪成長趨勢圖、同行比較、自由職業估算與個人化收入報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代薪資顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "稅後薪資計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機", references: "參考資料", referencesText: "美國勞工統計職業展望資料；美國勞工部公平勞動標準說明；美國時間使用調查；消費者金融保護局收入規劃資料。",
    q1: "時薪和月薪哪個更準確？", a1: "時薪更精確地反映工作價值，因為它考慮了實際工作時數，包括加班與休假差異。",
    q2: "為什麼我的實際時薪比帳面低？", a2: "如果經常無償加班，實際工時比合約工時多，時薪就會被稀釋。計算時應包含所有工作時間。",
    q3: "自由工作者怎麼算時薪？", a3: "自由工作者的時薪 = 專案收入 ÷ 專案總時數（含溝通、修改時間）。還需額外扣除自僱稅與業務成本。",
    q4: "加班費如何影響時薪？", a4: "有償加班（1.5x 或 2x）會提高加權時薪；無償加班則降低實際時薪。計算時應分開考量。",
    q5: "兼職或多份工作的時薪怎麼算？", a5: "分別計算每份工作的時薪，再以收入加權平均。高時薪工作應優先投入時間。",
    q6: "這個工具能提供薪資談判或職涯建議嗎？", a6: "不能。它只是教育用估算；若需薪資談判、職涯規劃或勞動權益，請諮詢專業人員。",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function HourlyRateCalculator() {
  const { lang, setLang } = useLanguage();
  const displayLang: Lang = "zh";
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [annualSalary, setAnnualSalary] = useState("75000");
  const [weeklyHours, setWeeklyHours] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("50");
  const [vacationDays, setVacationDays] = useState("10");
  const t = ui.zh;

  const result = useMemo(() => {
    const salary = Number(annualSalary) || 0;
    const hrs = Number(weeklyHours) || 40;
    const wks = Number(weeksPerYear) || 50;
    const vac = Number(vacationDays) || 0;
    const dailyHrs = hrs / 5;
    const effectiveHours = (wks * hrs) - (vac * dailyHrs);
    const hourlyRate = effectiveHours > 0 ? salary / effectiveHours : 0;
    const monthly = salary / 12;
    const weekly = salary / 52;
    const workDays = wks * 5 - vac;
    const daily = workDays > 0 ? salary / workDays : 0;
    return { hourlyRate, monthly, weekly, daily, effectiveHours };
  }, [annualSalary, weeklyHours, weeksPerYear, vacationDays]);

  const hourlyDisplay = fmt(result.hourlyRate, 2);
  const monthlyDisplay = fmt(result.monthly, 0);

  function fillSolid() { setUnit("metric"); setAnnualSalary("75000"); setWeeklyHours("40"); setWeeksPerYear("50"); setVacationDays("10"); }
  function fillHighSalary() { setUnit("imperial"); setAnnualSalary("150000"); setWeeklyHours("45"); setWeeksPerYear("50"); setVacationDays("15"); }

  const activeBand = bands.find(b => {
    const r = result.hourlyRate;
    if (r < 10) return b.key === "minimum";
    if (r < 20) return b.key === "entry";
    if (r < 40) return b.key === "mid";
    if (r < 60) return b.key === "senior";
    if (r < 100) return b.key === "expert";
    return b.key === "elite";
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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${hourlyDisplay}</div><div className="text-sm font-bold text-amber-100">/小時</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${hourlyDisplay}/小時</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${fmt(Number(annualSalary), 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$39/小時</span></div><p className="mt-2 text-sm text-slate-600">$75k · 每週 40 小時</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">約 $71/小時</span></div><p className="mt-2 text-sm text-slate-600">$150k · 每週 45 小時</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.annualSalary}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualSalary} onChange={(e) => setAnnualSalary(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.weeklyHours}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.weeksPerYear}<input type="number" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={weeksPerYear} onChange={(e) => setWeeksPerYear(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.vacationDays}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={vacationDays} onChange={(e) => setVacationDays(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${hourlyDisplay}<span className="text-3xl">/小時</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">/月</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">週薪</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.weekly, 0)}</p><p className="text-sm font-bold text-emerald-700">/週</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">日薪</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.daily, 0)}</p><p className="text-sm font-bold text-blue-700">/日</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">工時</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.effectiveHours, 0)}</p><p className="text-sm font-bold text-slate-700">小時/年</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, displayLang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, displayLang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="hourlyrate-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">時薪</div><div className="mt-1 text-3xl font-black">${hourlyDisplay}/小時</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${hourlyDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${fmt(result.daily, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "時薪", note: t.bmrStep }, { label: "稅後", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問答後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="hourlyrate-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, displayLang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">推薦連結揭露：部分連結可能帶來佣金收入。</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["趨勢", "比較", "自由工作", "報告"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
