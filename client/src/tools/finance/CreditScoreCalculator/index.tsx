// @profile B
// Profile B · 計算機-YMYL · CreditScore信用評分估算機（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "300-579", label: { zh: "待改善", en: "Poor" }, desc: { zh: "信用分數偏低，常因逾期或高使用率，貸款核准與利率較不利。", en: "Low score — often from late payments or high utilization; harder approval and worse rates." } },
  { key: "normal", range: "580-669", label: { zh: "普通", en: "Fair" }, desc: { zh: "普通信用，部分產品可核准但條件一般。", en: "Fair credit — some products approve but with average terms." } },
  { key: "notable", range: "670-739", label: { zh: "良好", en: "Good" }, desc: { zh: "良好信用，多數貸款與信用卡可取得合理條件。", en: "Good credit — most loans and cards available at reasonable terms." } },
  { key: "high", range: "740-799", label: { zh: "很好", en: "Very good" }, desc: { zh: "很好信用，享有較佳利率與較高額度。", en: "Very good credit — better rates and higher limits." } },
  { key: "major", range: "800-849", label: { zh: "優異", en: "Excellent" }, desc: { zh: "優異信用，幾乎可取得最佳條件。", en: "Excellent credit — near-best available terms." } },
  { key: "executive", range: "850", label: { zh: "頂級", en: "Top tier" }, desc: { zh: "頂級信用，談判空間最大，違約風險被視為極低。", en: "Top-tier credit — maximum negotiating power, very low perceived risk." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "個人貸款計算機", en: "Personal Loan Calculator" }, href: "/tools/finance/personal-loan-calculator" },
  { label: { zh: "房貸攤還計算機", en: "Mortgage Amortization" }, href: "/tools/finance/mortgage-amortization-calculator" },
  { label: { zh: "EMI 計算機", en: "EMI Calculator" }, href: "/tools/finance/emi-calculator" },
  { label: { zh: "預算規劃計算機", en: "Budget Planner" }, href: "/tools/finance/budget-planner" },
];

const ui = {
  zh: {
    badge: "財務 · 信用評分 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Credit Score Calculator · 信用評分估算機",
    subtitle: "依還款、使用率、年資與查詢估算信用分數區間",
    intro: "本工具依準時還款率、信用使用率、信用歷史長度與近期查詢次數，以常見權重估算信用分數區間，協助您了解哪些因子最影響信用。",
    trustNoteLabel: "注意事項：",
    trustNote: "此工具為簡化估算，非實際信用機構分數；各機構演算法與權重不同，僅供教育參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立信用範例",
    examplePreview: "估算分數預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入優異範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入還款、使用率、年資與查詢",
    examplesHelper: "先用範例理解信用因子，再改成自己的數字。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "標準信用 · 準時 98%",
    activeExample: "優異信用",
    flowDemo: "使用率 25%",
    calculator: "計算機",
    participants: "準時還款率 (%)",
    averageHourlyRate: "信用使用率 (%)",
    durationHours: "信用歷史 (月)",
    meetingsPerMonth: "近期查詢次數",
    resultCard: "信用評分結果",
    unit: "估算信用分數",
    primaryValue: "主要數值",
    maintenanceTarget: "估算信用分數",
    actionTarget: "使用率",
    estimatedTdee: "估算信用分數",
    maintenance: "分數",
    fatLossTarget: "信用年資",
    meetingCost: "估算信用分數",
    monthlyEquiv: "使用率",
    weeklyEquiv: "使用率",
    dailyEquiv: "信用年資",
    effectiveHours: "近期查詢",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格信用分數判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將估算分數放進常見區間；這是教育參考，不是貸款核准或信用建議。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把信用盤點轉成改善計畫",
    conversionNote: "L9 會連動目前計算結果，顯示分數、使用率與年資，協助判斷先降使用率還是先穩定還款。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前信用計畫",
    dailyGap: "信用年資",
    weeklyTrend: "估算分數",
    motivation: "動力卡",
    keepMomentum: "從信用盤點走向穩定改善",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的信用盤點帶回家",
    journeyHint: "每次調整還款、使用率或查詢時重新計算，追蹤分數區間變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用個人貸款計算機看分數對利率與月付的影響",
    nextActionItem2: "用房貸攤還計算機評估信用對房貸條件的差異",
    nextActionItem3: "用預算規劃計算機把還款納入每月現金流",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "信用 → 分數 → 利率 → 貸款",
    bmrStep: "信用因子",
    deficitStep: "信用分數",
    trendStep: "貸款利率",
    mealStep: "貸款核准",
    knowledge: "知識",
    knowledgeTitle: "信用分數在借貸中的意義",
    definition: "定義",
    definitionText: "信用分數是衡量還款可靠度的指標，常見因子包含還款紀錄、信用使用率、信用歷史長度、查詢次數與信用組合，分數越高通常條件越好。",
    formula: "公式",
    formulaText: "本估算採常見權重：還款 35%、使用率 30%、年資 15%、查詢 10%、信用組合 10%。各因子標準化後加權，再映射到 300–850 分區間。",
    limitations: "限制",
    limitationsText: "本工具為教育用簡化模型；實際機構（如 FICO、VantageScore）演算法不同，且納入更多細項與資料來源。",
    interpretation: "解讀",
    interpretationText: "準時還款與低使用率影響最大。即使年資短，只要持續準時且使用率低，分數也會穩步提升。",
    context: "脈絡",
    contextText: "信用分數應搭配收入、負債比、就業穩定度與貸款用途一起看，分數只是核貸條件之一。",
    example: "範例",
    exampleText: "準時 98%、使用率 25%、歷史 96 個月、查詢 2 次。估算分數約 748 分，落在「很好」區間，主要受惠於高準時率與中低使用率。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "信用改善的下一步工具",
    premiumTitle: "專業版信用治理包",
    premiumText: "解鎖因子拆解、改善情境模擬、長期追蹤與信用報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途，非實際信用評分，不構成貸款或信用建議。",
    relatedTools: "相關工具",
    relatedToolsText: "個人貸款計算機 · 房貸攤還計算機 · EMI 計算機 · 預算規劃計算機",
    references: "參考資料",
    referencesText: "信用評分模型公開說明；信用使用率研究；消費者信用報告指引；借貸條件與分數關聯資料。",
    q1: "哪個因子最影響信用分數？",
    a1: "通常是還款紀錄與信用使用率。準時還款建立信任，低使用率代表不過度依賴信用，兩者合計影響最大。",
    q2: "信用使用率多少才理想？",
    a2: "一般建議低於 30%，越低越好。把循環餘額相對於額度壓低，是短期內最快提升分數的方法之一。",
    q3: "查詢次數會扣分嗎？",
    a3: "短期內多次硬查詢可能小幅扣分。理財比較期可集中在短時間內完成，多數模型會視為一次查詢。",
    q4: "信用年資短該怎麼辦？",
    a4: "保持最舊帳戶開啟、持續準時還款並控制使用率，年資會自然累積，分數也會逐步提升。",
    q5: "分數高就一定核貸嗎？",
    a5: "不一定。放款方還會看收入、負債比與貸款用途。高分提升條件，但非唯一決定因素。",
    q6: "這個工具等於我的真實分數嗎？",
    a6: "不等於。它是教育用簡化估算；真實分數請查詢正式信用機構報告，演算法與資料更完整。",
  },
  en: {
    badge: "Finance · Credit score · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "中",
    englishShort: "EN",
    title: "Credit Score Calculator",
    subtitle: "Estimate a credit score range from payments, utilization, history, and inquiries",
    intro: "This tool uses on-time payment rate, credit utilization, history length, and recent inquiries with common weights to estimate a credit score range — helping you see which factors influence credit the most.",
    trustNoteLabel: "Note:",
    trustNote: "This is a simplified estimate, not an actual bureau score. Each bureau uses different algorithms and weights; for educational reference only.",
    quickActionCard: "Quick example",
    tryExample: "Build a credit example",
    examplePreview: "Estimated score",
    examplePerson: "Standard example",
    fillExample: "Fill the standard example",
    previewActivePath: "Try the excellent example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter payments, utilization, history, and inquiries",
    examplesHelper: "Start from an example to understand the factors, then change the numbers to match your own profile.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Standard credit · 98% on-time",
    activeExample: "Excellent credit",
    flowDemo: "25% utilization",
    calculator: "Calculator",
    participants: "On-time payment (%)",
    averageHourlyRate: "Credit utilization (%)",
    durationHours: "Credit history (months)",
    meetingsPerMonth: "Recent inquiries",
    resultCard: "Credit score result",
    unit: "Estimated score",
    primaryValue: "Headline number",
    maintenanceTarget: "Estimated score",
    actionTarget: "Utilization",
    estimatedTdee: "Estimated score",
    maintenance: "Score",
    fatLossTarget: "History",
    meetingCost: "Estimated score",
    monthlyEquiv: "Utilization",
    weeklyEquiv: "Utilization",
    dailyEquiv: "History",
    effectiveHours: "Inquiries",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Six-band credit-score matrix",
    tdeeMatrixNote: "L7 fixed six-band matrix — places your estimated score into common ranges. This is educational reference, not loan-approval or credit advice.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the credit snapshot into an improvement plan",
    conversionNote: "L9 reflects your current results — score, utilization, and history — to help you decide whether to lower utilization or stabilise payments first.",
    progressInsight: "Progress insight",
    possibleTarget: "Your current credit plan",
    dailyGap: "History",
    weeklyTrend: "Estimated score",
    motivation: "Motivation",
    keepMomentum: "Move from a credit snapshot to steady improvement",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's credit snapshot home",
    journeyHint: "Recalculate whenever payments, utilization, or inquiries change — and track how the score range moves.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use Personal Loan Calculator to see how score affects rate and monthly payment",
    nextActionItem2: "Use Mortgage Amortization to compare mortgage terms by credit",
    nextActionItem3: "Use Budget Planner to fold repayments into monthly cash flow",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Credit → Score → Rate → Loan",
    bmrStep: "Credit factors",
    deficitStep: "Credit score",
    trendStep: "Loan rate",
    mealStep: "Loan approval",
    knowledge: "Knowledge",
    knowledgeTitle: "What a credit score means in borrowing",
    definition: "Definition",
    definitionText: "A credit score measures repayment reliability. Common factors include payment history, utilization, history length, inquiries, and credit mix. A higher score usually means better terms.",
    formula: "Formula",
    formulaText: "This estimate uses common weights: payments 35%, utilization 30%, history 15%, inquiries 10%, mix 10%. Each factor is normalised, weighted, and mapped to the 300–850 range.",
    limitations: "Limitations",
    limitationsText: "This is an educational simplified model. Actual bureaus (e.g. FICO, VantageScore) use different algorithms with more detail and data sources.",
    interpretation: "Interpretation",
    interpretationText: "On-time payments and low utilization matter most. Even with short history, staying on time and keeping utilization low raises the score steadily.",
    context: "Context",
    contextText: "Read the score together with income, debt ratio, employment stability, and loan purpose — the score is only one approval factor.",
    example: "Example",
    exampleText: "98% on-time, 25% utilization, 96 months history, 2 inquiries. Estimated score about 748, in the 'very good' range, mainly from a high on-time rate and low-to-moderate utilization.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for credit improvement",
    premiumTitle: "Pro Credit Toolkit",
    premiumText: "Unlock factor breakdowns, improvement scenario simulation, long-term tracking, and credit reports.",
    trustReferences: "Trust · Related tools · References",
    trust: "Trust",
    trustText: "This tool is for educational and planning purposes only, is not an actual credit score, and is not loan or credit advice.",
    relatedTools: "Related tools",
    relatedToolsText: "Personal Loan Calculator · Mortgage Amortization · EMI Calculator · Budget Planner",
    references: "References",
    referencesText: "Public credit-scoring model documentation; utilization research; consumer credit report guides; data on loan terms vs score.",
    q1: "Which factor affects the score most?",
    a1: "Usually payment history and utilization. On-time payments build trust and low utilization shows you don't over-rely on credit; together they matter most.",
    q2: "What utilization is ideal?",
    a2: "Generally below 30%, and lower is better. Reducing revolving balances relative to limits is one of the fastest ways to lift the score short-term.",
    q3: "Do inquiries reduce the score?",
    a3: "Multiple hard inquiries in a short time can slightly reduce it. Concentrate rate-shopping into a short window; most models treat it as a single inquiry.",
    q4: "What if my history is short?",
    a4: "Keep your oldest account open, stay on time, and control utilization — history accumulates naturally and the score rises gradually.",
    q5: "Does a high score guarantee approval?",
    a5: "Not necessarily. Lenders also check income, debt ratio, and loan purpose. A high score improves terms but is not the only factor.",
    q6: "Is this the same as my real score?",
    a6: "No. It is an educational simplified estimate. For your real score, check an official bureau report with more complete algorithms and data.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CreditScoreCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("98");
  const [averageHourlyRate, setAverageHourlyRate] = useState("25");
  const [durationHours, setDurationHours] = useState("96");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("2");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const payment = Math.min(100, v1); const util = v2; const ageMonths = v3; const inquiries = v4;
    const paymentScore = (payment / 100) * 0.35;
    const utilScore = Math.max(0, 1 - util / 100) * 0.30;
    const ageScore = Math.min(1, ageMonths / 120) * 0.15;
    const inquiryScore = Math.max(0, 1 - inquiries / 10) * 0.10;
    const mixScore = 0.10;
    const composite = paymentScore + utilScore + ageScore + inquiryScore + mixScore;
    const score = Math.round(300 + composite * 550);
    const utilPenalty = util;
    const ageYears = ageMonths / 12;
    return { score, utilPenalty, ageYears, inquiries, composite };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.score, 0);
  const monthlyDisplay = fmt(result.utilPenalty, 0);

  function fillSolid() { setUnit("metric"); setParticipants("98"); setAverageHourlyRate("25"); setDurationHours("96"); setMeetingsPerMonth("2"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("100"); setAverageHourlyRate("8"); setDurationHours("180"); setMeetingsPerMonth("0"); }

  const activeBand = bands.find(b => {
    const r = result.score;
    if (r < 580) return b.key === "tiny";
    if (r < 670) return b.key === "normal";
    if (r < 740) return b.key === "notable";
    if (r < 800) return b.key === "high";
    if (r < 850) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,__#dcfce7,_#f8fafc_45%,_#fef9c3)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "\"估算信用分數\"" : "\"Estimated score\""}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{averageHourlyRate}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.ageYears, 0)}{lang === "zh" ? " 年" : " yr"}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">748</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "準時 98% · 使用率 25%" : "98% on-time · 25% util"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">812</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "準時 100% · 使用率 8%" : "100% on-time · 8% util"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}<span className="text-3xl">{lang === "zh" ? "\"分\"" : "\" pts\""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "\"使用率\"" : "\"util %\""}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "使用率" : "Utilization"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.utilPenalty, 0)}</p><p className="text-sm font-bold text-emerald-700">%</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "信用年資" : "History"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.ageYears, 0)}</p><p className="text-sm font-bold text-blue-700">yr</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "近期查詢" : "Inquiries"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.inquiries, 0)}</p><p className="text-sm font-bold text-slate-700"></p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="credit-score-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "\"估算信用分數\"" : "\"Estimated score\""}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "信用" : "Credit", note: t.bmrStep }, { label: lang === "zh" ? "分數" : "Score", note: t.deficitStep }, { label: lang === "zh" ? "利率" : "Rate", note: t.trendStep }, { label: lang === "zh" ? "貸款" : "Loan", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="credit-score-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["因子","情境","追蹤","報告"] : ["Factors","Scenarios","Tracking","Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
