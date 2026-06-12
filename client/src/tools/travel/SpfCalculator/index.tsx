// @profile B
// Profile B · Calculator-Travel · SpfCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "resistant" | "standard" | "sensitive";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 1 h", label: { zh: "極短", en: "Very Short" }, desc: { zh: "保護時間極短，烈日下需頻繁補擦並尋找遮蔭。", en: "Very short protection—reapply often and seek shade under strong sun." } },
  { key: "low", range: "1–2 h", label: { zh: "短", en: "Short" }, desc: { zh: "保護偏短，每兩小時補擦即可維持基本防護。", en: "Short protection; reapply every two hours to keep basic coverage." } },
  { key: "healthy", range: "2–4 h", label: { zh: "中等", en: "Moderate" }, desc: { zh: "常見戶外防護區間，流汗或下水後仍須補擦。", en: "Common outdoor band; still reapply after sweating or swimming." } },
  { key: "good", range: "4–6 h", label: { zh: "充足", en: "Ample" }, desc: { zh: "保護充足，搭配帽子與衣物可長時間戶外活動。", en: "Ample protection; with a hat and clothing, long outdoor time is fine." } },
  { key: "strong", range: "6–9 h", label: { zh: "長效", en: "Long" }, desc: { zh: "理論保護長效，但仍建議定時補擦避免遺漏部位。", en: "Long theoretical protection, but still reapply to avoid missed spots." } },
  { key: "elite", range: "> 9 h", label: { zh: "全日", en: "Full Day" }, desc: { zh: "理論可達全日，實務上汗水與摩擦會降低效果。", en: "Theoretically full-day, though sweat and friction reduce it in practice." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊補水計算機", en: "Travel Hydration Calculator" }, href: "/tools/travel/travel-hydration-calculator" },
  { label: { zh: "高山症風險計算機", en: "Altitude Sickness Calculator" }, href: "/tools/travel/altitude-sickness-calculator" },
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "每日預算計算機", en: "Daily Budget Calculator" }, href: "/tools/travel/daily-budget-calculator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 防曬係數 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "防曬係數計算機 · SPF", subtitle: "用未防護曬傷時間、SPF 係數與膚質敏感度算出有效防護時間與補擦提醒",
    intro: "SPF Calculator 依據未防護曬傷時間、防曬係數與膚質敏感度（耐曬、標準或敏感），計算理論有效防護時間、補擦占比與建議補擦頻率，協助您判斷該選多高的 SPF、戶外活動能撐多久、何時該補擦或尋找遮蔭，讓旅途防曬更安心。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以理論防護倍數估算，未含流汗、下水、摩擦與塗抹量；實際防曬效果通常低於理論值，請定時補擦並搭配遮蔽。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立防曬範例", examplePreview: "防護預覽", examplePerson: "曬傷時間", fillExample: "一鍵填入標準膚質範例", previewActivePath: "填入敏感膚質範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入未防護曬傷時間、SPF 係數與膚質敏感度", examplesHelper: "先用範例理解曬傷時間與 SPF 如何決定有效防護時間與補擦占比，再改成自己的膚質數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準膚質模式", activeExample: "敏感膚質示範", baselineExampleNote: "曬傷 10 · SPF 30 · 標準", activeExampleNote: "曬傷 10 · SPF 50 · 敏感", carbsLabel: "補擦占比", carbsName: "%", proteinLabel: "補擦占比", flowDemo: "SPF 係數", calculator: "計算機",
    weight: "未防護曬傷時間 (分鐘)", tdee: "SPF 係數", goal: "膚質敏感度", goalCut: "耐曬 (建議 SPF15)", goalMaintain: "標準 (建議 SPF30)", goalBulk: "敏感 (建議 SPF50)",
    resultCard: "防曬係數結果", unit: "小時 (有效防護)", primaryValue: "主要數值", maintenanceTarget: "建議補擦頻率", actionTarget: "防護時間", estimatedTdee: "SPF 係數", maintenance: "小時", fatLossTarget: "小時",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格有效防護時間判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前有效防護時間放進常見區間；這是規劃參考，不是醫療結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把防曬結果轉成可執行的戶外策略", conversionNote: "L9 會連動目前計算結果，顯示補擦占比、防護時間與膚質提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前防曬概況", dailyGap: "補擦占比", weeklyTrend: "防護時間", motivation: "動力卡", keepMomentum: "從防護分析走向安心舒適的戶外節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的防曬結果帶回團隊", journeyHint: "用旅遊補水計算機一起看，把補擦頻率與每日補水一併納入戶外規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊補水計算機算出每日補水量", nextActionItem2: "用高山症風險計算機規劃高海拔防護", nextActionItem3: "用旅遊預算把防曬用品納入花費",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "曬傷時間 → 補擦占比 → 膚質 → SPF", bmrStep: "曬傷時間", deficitStep: "補擦占比", trendStep: "膚質", mealStep: "SPF",
    knowledge: "知識", knowledgeTitle: "SPF 係數在防曬中的意義", definition: "定義", definitionText: "防曬係數評估是把未防護曬傷時間乘上 SPF 倍數，換算成理論有效防護時間；有效防護時間與補擦占比衡量您能在陽光下安全停留多久，是戶外防曬的核心指標。", formula: "公式", formulaText: "有效防護時間 = 未防護曬傷時間 × SPF。補擦占比 = 建議補擦間隔 ÷ 有效防護時間。膚質敏感度決定建議 SPF 下限。", limitations: "限制", limitationsText: "本工具以理論倍數估算；真實防曬效果還受塗抹量、流汗、下水、摩擦、UV 指數與膚質影響，實務上通常達不到理論值。", interpretation: "解讀", interpretationText: "有效防護時間越長越安心，但仍建議每兩小時補擦；補擦占比越高代表越需頻繁補擦，可提高 SPF 或搭配遮蔽改善。", context: "脈絡", contextText: "防曬結果應與旅遊補水、高山症風險與旅遊預算一起看，才能在戶外行程中兼顧防護與健康。", example: "範例", exampleText: "未防護曬傷 10 分鐘、SPF 30、標準膚質 → 理論有效防護約 5 小時，建議仍每兩小時補擦。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "防曬的下一步工具", premiumTitle: "PRO 防曬分析包", premiumText: "解鎖即時 UV 指數串接、塗抹量校正、補擦提醒與多場景防護計畫。", feat1: "即時紫外線", feat2: "用量修正", feat3: "補擦警示", feat4: "多情境",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供戶外規劃與教育用途，不取代皮膚科醫療建議或專業防曬診斷。", relatedTools: "相關工具", relatedToolsText: "Travel Hydration · Altitude · Travel Budget · Daily Budget", references: "參考資料", referencesText: "皮膚科學會防曬建議；SPF 標準定義；UV 指數指引；戶外防護研究。",
    q1: "有效防護時間怎麼算的？", a1: "本工具以未防護曬傷時間乘上 SPF 倍數得理論防護時間；實際還受塗抹量與流汗影響，通常更短。",
    q2: "SPF 越高越好嗎？", a2: "SPF 越高阻擋越多但邊際遞減，敏感膚質或高 UV 環境宜選 SPF50；一般日常 SPF30 已足夠。",
    q3: "耐曬還是敏感膚質？", a3: "易曬黑不易曬傷者偏耐曬可選 SPF15；易曬紅或敏感者宜選 SPF50，並縮短曝曬與加強補擦。",
    q4: "防護不夠怎麼補？", a4: "提高 SPF、每兩小時補擦、流汗下水後立即補擦、搭配帽子衣物與遮蔭，並避開正午強光時段。",
    q5: "要不要把補擦算進去？", a5: "要。本工具的補擦占比已依建議間隔估算；實際請每兩小時或流汗下水後補擦，別只看理論時間。",
    q6: "這個工具能取代醫師嗎？", a6: "不能。它只是快速估算與教育用途；有光敏性疾病或皮膚問題請諮詢皮膚科專業醫師。" },
  en: {
    badge: "Travel · SPF · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "SPF Calculator", subtitle: "Compute effective protection time and reapply reminders from unprotected burn time, SPF, and skin sensitivity",
    intro: "This calculator uses unprotected burn time, the SPF value, and skin sensitivity (resistant, standard, or sensitive) to compute theoretical effective protection time, a reapply share, and a suggested reapply frequency, helping you judge which SPF to pick, how long outdoor activity can last, and when to reapply or seek shade, making sun protection on your trip more reassuring.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from a theoretical protection multiplier, excluding sweat, swimming, friction, and application amount; real protection is usually lower than theory, so reapply on schedule and combine with cover.",
    quickActionCard: "Quick Action Card", tryExample: "Create an SPF example instantly", examplePreview: "Protection preview", examplePerson: "Burn time", fillExample: "One-click standard skin example", previewActivePath: "Fill sensitive skin example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter unprotected burn time, SPF value, and skin sensitivity", examplesHelper: "Start with an example to see how burn time and SPF set the effective protection time and reapply share, then replace with your own skin data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard skin mode", activeExample: "Sensitive demo", baselineExampleNote: "Burn 10 · SPF 30 · standard", activeExampleNote: "Burn 10 · SPF 50 · sensitive", carbsLabel: "Reapply share", carbsName: "%", proteinLabel: "Reapply share", flowDemo: "SPF value", calculator: "Calculator",
    weight: "Unprotected burn time (min)", tdee: "SPF value", goal: "Skin sensitivity", goalCut: "Resistant (SPF15 advised)", goalMaintain: "Standard (SPF30 advised)", goalBulk: "Sensitive (SPF50 advised)",
    resultCard: "SPF Result", unit: "hours (effective protection)", primaryValue: "Primary Value", maintenanceTarget: "Reapply frequency", actionTarget: "Protection time", estimatedTdee: "SPF value", maintenance: "hours", fatLossTarget: "hours",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card effective-protection interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current effective protection time into common zones. This is planning guidance, not a medical conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the SPF result into an actionable outdoor strategy", conversionNote: "L9 values update from the computed result: reapply share, protection time, and skin hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current SPF snapshot", dailyGap: "Reapply share", weeklyTrend: "Protection time", motivation: "Motivation Card", keepMomentum: "Move from protection analysis to a reassuring, comfortable outdoor rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's SPF result to your group", journeyHint: "Review it with the Travel Hydration Calculator to fold reapply frequency and daily hydration into outdoor planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Compute daily hydration with the Travel Hydration Calculator", nextActionItem2: "Plan high-altitude protection with the Altitude Sickness Calculator", nextActionItem3: "Fold sunscreen into spend with Travel Budget",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Burn Time → Reapply Share → Skin → SPF", bmrStep: "Burn time", deficitStep: "Reapply share", trendStep: "Skin", mealStep: "SPF",
    knowledge: "Knowledge", knowledgeTitle: "What SPF means in sun protection", definition: "Definition", definitionText: "SPF assessment multiplies unprotected burn time by the SPF factor into theoretical effective protection time; effective protection time and reapply share measure how long you can safely stay in the sun, the core indicator of outdoor sun protection.", formula: "Formula", formulaText: "Effective protection time = unprotected burn time × SPF. Reapply share = suggested reapply interval ÷ effective protection time. Skin sensitivity sets the suggested minimum SPF.", limitations: "Limitations", limitationsText: "This tool estimates from a theoretical multiplier; real protection is also affected by application amount, sweat, swimming, friction, UV index, and skin type, and in practice usually falls short of theory.", interpretation: "Interpretation", interpretationText: "Longer effective protection is more reassuring, but still reapply every two hours; a higher reapply share means more frequent reapplication—raise SPF or add cover to improve it.", context: "Context", contextText: "SPF results should be evaluated with travel hydration, altitude risk, and travel budget to balance protection and health on outdoor trips.", example: "Example", exampleText: "Unprotected burn 10 minutes, SPF 30, standard skin → about 5 hours theoretical effective protection, still reapply every two hours.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for sun protection", premiumTitle: "PRO SPF Analytics Pack", premiumText: "Unlock live UV-index feeds, application-amount correction, reapply reminders, and multi-scenario protection plans.", feat1: "Live UV Index", feat2: "Amount Correction", feat3: "Reapply Alert", feat4: "Multi Scenario",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for outdoor planning and education. It does not replace dermatological medical advice or professional sun-protection diagnosis.", relatedTools: "Related Tools", relatedToolsText: "Travel Hydration · Altitude · Travel Budget · Daily Budget", references: "References", referencesText: "Dermatology society sun-protection advice; SPF standard definitions; UV-index guidelines; outdoor-protection studies.",
    q1: "How is effective protection time calculated?", a1: "This tool multiplies unprotected burn time by the SPF factor for theoretical protection time; actual is also affected by application amount and sweat, usually shorter.",
    q2: "Is higher SPF always better?", a2: "Higher SPF blocks more but with diminishing returns; sensitive skin or high-UV environments should pick SPF50, while everyday use is fine with SPF30.",
    q3: "Resistant or sensitive skin?", a3: "Those who tan easily without burning lean resistant and can use SPF15; those who redden easily or are sensitive should pick SPF50, shorten exposure, and reapply more.",
    q4: "How do I cover insufficient protection?", a4: "Raise SPF, reapply every two hours, reapply right after sweating or swimming, add a hat, clothing, and shade, and avoid midday peak sun.",
    q5: "Should I count reapplication?", a5: "Yes. This tool's reapply share is estimated against a suggested interval; in practice reapply every two hours or after sweating and swimming, not just by theoretical time.",
    q6: "Can this tool replace a doctor?", a6: "No. It is a quick estimate for education; for photosensitive conditions or skin problems, consult a professional dermatologist." },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function advisedSpf(mode: TierMode): number {
  if (mode === "resistant") return 15;
  if (mode === "sensitive") return 50;
  return 30;
}

export default function SpfCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("10");
  const [tdee, setTdee] = useState("30");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const burnTime = Number(weight);
    const spf = Number(tdee);
    if (burnTime <= 0 || spf <= 0) return null;
    const protectedMinutes = burnTime * spf;
    const protectedHours = protectedMinutes / 60;
    const reapplyShare = Math.min((120 / protectedMinutes) * 100, 100);
    const advised = advisedSpf(goal);
    return { burnTime, spf, protectedHours, reapplyShare, advised };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.reapplyShare, 1) : "—";
  const fatDisplay = result ? fmt(result.protectedHours, 1) : "—";
  const carbDisplay = result ? fmt(result.reapplyShare, 1) : "—";
  const totalDisplay = result ? fmt(result.protectedHours, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("10"); setTdee("30"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("10"); setTdee("50"); setGoal("sensitive"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "resistant" ? "🟢" : goal === "sensitive" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">5.0</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">8.3</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="resistant">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="sensitive">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">h</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{fatDisplay} <span className="text-sm text-slate-500">h</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="spf-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.reapplyShare, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.protectedHours, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "BurnTime", note: t.bmrStep }, { label: "ReapplyShare", note: t.deficitStep }, { label: "Skin", note: t.trendStep }, { label: "SPF", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="spf-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
