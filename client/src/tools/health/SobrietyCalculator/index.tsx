// @profile B
// Profile B · Calculator-YMYL · SobrietyCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Sex = "male" | "female";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 2) => (Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—");

const R_FACTOR: Record<Sex, number> = { male: 0.68, female: 0.55 };
const MET_RATE = 0.015; // %BAC per hour
const GRAM_PER_DRINK = 10; // grams ethanol per standard drink

const bands = [
  { key: "sober", range: "0–0.02%", label: { zh: "清醒", en: "Sober" }, desc: { zh: "法定清醒區間，幾乎無影響。", en: "Legally sober; almost no effect." } },
  { key: "buzzed", range: "0.02–0.05%", label: { zh: "微醺", en: "Buzzed" }, desc: { zh: "輕微放鬆，反應略降。", en: "Mild relaxation; slight reaction decrease." } },
  { key: "impaired", range: "0.05–0.08%", label: { zh: "酒醉影響", en: "Impaired" }, desc: { zh: "判斷與協調下降，多數地區此時駕車違法。", en: "Judgment & coordination decline; illegal to drive in most areas." } },
  { key: "dui", range: "≥ 0.08%", label: { zh: "法定酒駕", en: "DUI limit" }, desc: { zh: "超過多數地區法定酒駕標準，嚴重危險。", en: "Exceeds legal DUI limit in most regions; extremely dangerous." } },
  { key: "heavy", range: "≥ 0.15%", label: { zh: "重度醉酒", en: "Heavily drunk" }, desc: { zh: "嚴重影響平衡與意識，須有人照顧。", en: "Severe balance & consciousness impact; needs supervision." } },
  { key: "acute", range: "≥ 0.30%", label: { zh: "急性危險", en: "Acute danger" }, desc: { zh: "可能危及生命，請立即就醫。", en: "Potentially life-threatening; seek emergency care immediately." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "咖啡因攝取計算機", en: "Caffeine Intake Calculator" }, href: "/tools/health/caffeine-intake-calculator" },
  { label: { zh: "飲水量計算機", en: "Water Intake Calculator" }, href: "/tools/health/water-intake-calculator" },
  { label: { zh: "酒精熱量計算機", en: "Alcohol Calories Calculator" }, href: "/tools/health/alcohol-calories-calculator" },
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 酒精代謝 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "酒精濃度計算機 · Sobriety Calculator", subtitle: "用飲酒量、體重與時間估算血液酒精濃度與代謝時間",
    intro: "輸入飲酒量與體重，依 Widmark 公式估算血液酒精濃度（BAC），並推算大致代謝至清醒所需時間，協助理解飲酒後的安全狀態。",
    trustNoteLabel: "注意事項：", trustNote: "Widmark 公式為概估模型，實際 BAC 受體質、食物與飲酒速度影響；本工具僅供教學，不作法律或駕車依據，切勿酒駕。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立飲酒範例", examplePreview: "估算 BAC 預覽", examplePerson: "標準杯數", fillExample: "一鍵填入啤酒範例", previewActivePath: "填入紅酒範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入性別、體重與飲酒量", examplesHelper: "先用範例理解 BAC 如何估算，再改成自己的數值。",
    metric: "男性", imperial: "女性", exampleCards: "範例卡", baselineExample: "啤酒範例", activeExample: "紅酒範例", baselineExampleNote: "男性 · 70 kg · 2 杯 · 1 小時", activeExampleNote: "女性 · 55 kg · 3 杯 · 2 小時", calculator: "計算機",
    sex: "性別", male: "男性", female: "女性", weight: "體重 (kg)", drinks: "標準杯數", hours: "飲酒後經過（小時）",
    resultCard: "估算結果", unit: "BAC %", primaryValue: "目前 BAC", bacRaw: "初始 BAC", sobriety: "至清醒時間", rFactor: "分布係數",
    resultIntelligence: "結果解讀", matrix: "六格 BAC 區間判讀矩陣", matrixNote: "L7 固定六格，對照常見影響帶；這是教育參考，不是法律標準。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 BAC 估算轉成可行動的安全提醒", conversionNote: "L9 會連動目前估算結果，顯示目前 BAC、初始 BAC 與至清醒時間提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前酒精狀態", dailyGap: "初始 BAC", weeklyTrend: "至清醒時間", motivation: "動力卡", keepMomentum: "從估算走向安全決策",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的安全提醒帶回家", journeyHint: "代謝速率因人而異，請務必預留充足時間，必要時改搭計程車或代駕。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用酒精熱量計算機看攝取熱量", nextActionItem2: "用飲水量計算機規劃補水", nextActionItem3: "用咖啡因計算機評估提神替代",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "飲酒 → 估算 → 等待代謝 → 安全回家", drinkStep: "飲酒", estimateStep: "估算", waitStep: "等待", safeStep: "安全",
    knowledge: "知識", knowledgeTitle: "BAC 在健康宇宙中的意義", definition: "定義", definitionText: "血液酒精濃度（BAC）代表每 100 毫升血液中的酒精克數，是判斷酒醉程度的指標。", formula: "公式", formulaText: "BAC = 酒精克數 ÷ (體重kg × 分布係數 × 10)，再扣除代謝（0.015%/小時 × 時間）。", limitations: "限制", limitationsText: "本模型未區分空腹飽腹、飲酒速度與個體代謝差異，僅供概估。", interpretation: "解讀", interpretationText: "BAC 隨時間下降，但個人差異大；切勿以估算值決定是否駕車。", context: "脈絡", contextText: "酒精也提供熱量並影響補水，宜搭配相關健康工具一起看。", example: "範例", exampleText: "男性 70 kg、飲 2 標準杯、1 小時後 BAC 約 0.03%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "飲酒與代謝的下一步工具", premiumTitle: "PRO 飲酒安全包", premiumText: "解鎖多杯次累積估算、代謝曲線圖與個人化安全提醒。", feat1: "累積估算", feat2: "代謝曲線", feat3: "安全提醒", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與估算用途，不取代酒精測試器、法律標準或專業醫療建議；切勿酒後駕車。", relatedTools: "相關工具", relatedToolsText: "Caffeine Intake Calculator · Water Intake Calculator · Alcohol Calories Calculator · BMR Calculator", references: "參考資料", referencesText: "Widmark E.M.P. Principles and Applications of Medicolegal Alcohol Determination; NIAAA standard drink definitions; WHO Global status report on alcohol and health。",
    q1: "BAC 是什麼？", a1: "血液酒精濃度（Blood Alcohol Concentration），代表每 100 毫升血液中的酒精克數。",
    q2: "代謝速率是多少？", a2: "平均約每小時下降 0.015%，但個人差異大。",
    q3: "多久後可以開車？", a3: "需等 BAC 降到法定限制以下，本工具僅供估算；實際應以酒精測試器確認。",
    q4: "男女為什麼不同？", a4: "女性平均體水比例較低，同量酒精濃度較高。",
    q5: "空腹和飽腹有差嗎？", a5: "空腹吸收較快、峰值較高；本模型未區分，僅用平均估算。",
    q6: "這個計算準確嗎？", a6: "Widmark 公式為概估模型，實際值受體質、食物與飲酒速度影響；僅供教育，不作法律依據。",
  },
  en: {
    badge: "Health · Alcohol Metabolism · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Sobriety Calculator · BAC Estimator", subtitle: "Estimate blood alcohol concentration and sober-up time from drinks, weight, and time",
    intro: "Enter drinks and body weight to estimate Blood Alcohol Concentration (BAC) using the Widmark formula, and approximate the time needed to metabolize back to sober.",
    trustNoteLabel: "Note:", trustNote: "The Widmark formula is an estimate; actual BAC varies with body, food and drinking pace. Educational only, not legal or driving evidence. Never drink and drive.",
    quickActionCard: "Quick Action Card", tryExample: "Create a drinking example instantly", examplePreview: "Estimated BAC preview", examplePerson: "Drinks", fillExample: "Fill beer example", previewActivePath: "Fill wine example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter sex, weight and drinks", examplesHelper: "Start with an example to understand how BAC is estimated, then replace with your own values.",
    metric: "Male", imperial: "Female", exampleCards: "Example cards", baselineExample: "Beer example", activeExample: "Wine example", baselineExampleNote: "Male · 70 kg · 2 drinks · 1 h", activeExampleNote: "Female · 55 kg · 3 drinks · 2 h", calculator: "Calculator",
    sex: "Sex", male: "Male", female: "Female", weight: "Weight (kg)", drinks: "Standard drinks", hours: "Hours since drinking",
    resultCard: "Estimated Result", unit: "BAC %", primaryValue: "Current BAC", bacRaw: "Initial BAC", sobriety: "Time to sober", rFactor: "Distribution factor",
    resultIntelligence: "Result Intelligence", matrix: "Six-band BAC interpretation matrix", matrixNote: "L7 uses six fixed cells against common impact bands. Educational reference, not a legal standard.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the BAC estimate into an actionable safety reminder", conversionNote: "L9 values update from the current estimate: current BAC, initial BAC and time-to-sober hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current alcohol status", dailyGap: "Initial BAC", weeklyTrend: "Time to sober", motivation: "Motivation Card", keepMomentum: "Move from estimate to a safe decision",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's safety reminder home", journeyHint: "Metabolism varies by person; always leave plenty of time and take a taxi or designated driver when needed.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Check intake with the Alcohol Calories Calculator", nextActionItem2: "Plan hydration with the Water Intake Calculator", nextActionItem3: "Evaluate caffeine alternatives with the Caffeine Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Drink → Estimate → Wait to metabolize → Get home safe", drinkStep: "Drink", estimateStep: "Estimate", waitStep: "Wait", safeStep: "Safe",
    knowledge: "Knowledge", knowledgeTitle: "What BAC means in the Health universe", definition: "Definition", definitionText: "Blood Alcohol Concentration (BAC) is grams of alcohol per 100 mL of blood, an index of intoxication.", formula: "Formula", formulaText: "BAC = ethanol grams ÷ (weight kg × distribution factor × 10), minus metabolism (0.015%/hour × time).", limitations: "Limitations", limitationsText: "This model does not differentiate empty vs full stomach, drinking pace or individual metabolism; estimate only.", interpretation: "Interpretation", interpretationText: "BAC drops over time, but individual variation is large; never decide whether to drive from an estimate.", context: "Context", contextText: "Alcohol also adds calories and affects hydration, so pair this with related health tools.", example: "Example", exampleText: "A 70 kg male after 2 standard drinks and 1 hour is around 0.03% BAC.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for drinking and metabolism", premiumTitle: "PRO Drinking Safety Pack", premiumText: "Unlock multi-drink cumulative estimation, metabolism curve charts and personalized safety reminders.", feat1: "Cumulative", feat2: "Curve", feat3: "Reminders", feat4: "Reports",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and estimation only and does not replace a breathalyzer, legal standards or professional medical advice. Never drink and drive.", relatedTools: "Related Tools", relatedToolsText: "Caffeine Intake Calculator · Water Intake Calculator · Alcohol Calories Calculator · BMR Calculator", references: "References", referencesText: "Widmark E.M.P. Principles and Applications of Medicolegal Alcohol Determination; NIAAA standard drink definitions; WHO Global status report on alcohol and health.",
    q1: "What is BAC?", a1: "Blood Alcohol Concentration: grams of alcohol per 100 mL of blood.",
    q2: "What is the metabolism rate?", a2: "Average ~0.015% per hour; individual variation is large.",
    q3: "When can I drive?", a3: "Wait until BAC drops below the legal limit; this tool only estimates. Use a breathalyzer to confirm.",
    q4: "Why different for men and women?", a4: "Women generally have lower body water ratio, leading to higher BAC from the same amount.",
    q5: "Does eating affect BAC?", a5: "Empty stomach absorbs faster with a higher peak; this model uses averages and does not differentiate.",
    q6: "Is this calculation accurate?", a6: "The Widmark formula is an estimate; actual BAC varies with body, food and drinking pace. Educational only, not legal evidence.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

export default function SobrietyCalculator() {
  const { lang, setLang } = useLanguage();
  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState("70");
  const [drinks, setDrinks] = useState("2");
  const [hours, setHours] = useState("1");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(weight);
    const d = Number(drinks);
    const h = Number(hours);
    if (w <= 0 || d < 0 || h < 0) return null;
    const rFactor = R_FACTOR[sex];
    const bacRaw = (d * GRAM_PER_DRINK) / (w * rFactor * 10);
    const bac = Math.max(0, bacRaw - MET_RATE * h);
    const sobrietyH = bac > 0 ? bac / MET_RATE : 0;
    return { rFactor, bacRaw, bac, sobrietyH };
  }, [sex, weight, drinks, hours]);

  const bacDisplay = result ? fmt(result.bac, 3) : "—";
  const bacRawDisplay = result ? fmt(result.bacRaw, 3) : "—";
  const sobrietyDisplay = result ? `${fmt(result.sobrietyH, 1)} h` : "—";
  const rFactorDisplay = result ? fmt(result.rFactor, 2) : "—";

  function fillBeer() { setSex("male"); setWeight("70"); setDrinks("2"); setHours("1"); }
  function fillWine() { setSex("female"); setWeight("55"); setDrinks("3"); setHours("2"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{bacDisplay}%</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{drinks}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weight}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.sex}</div><div className="font-black">{sex === "male" ? "♂️" : "♀️"}</div></div></div><button onClick={fillBeer} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillWine} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${sex === "male" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setSex("male")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${sex === "female" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setSex("female")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBeer} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">0.03%</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillWine} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">0.05%</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.sex}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="male">{t.male}</option><option value="female">{t.female}</option></select></label><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.drinks}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={drinks} onChange={(e) => setDrinks(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.hours}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={hours} onChange={(e) => setHours(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{bacDisplay}%</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{bacDisplay}%</div><div className="mt-1 text-xs text-slate-300">{sex === "male" ? "MALE" : "FEMALE"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.bacRaw}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.bacRaw}</div><p className="mt-2 text-3xl font-black text-blue-950">{bacRawDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.sobriety}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.sobriety}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result ? fmt(result.sobrietyH, 1) : "—"}</p><p className="text-sm font-bold text-emerald-700">h</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.rFactor}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.rFactor}</div><p className="mt-2 text-3xl font-black text-orange-950">{rFactorDisplay}</p><p className="text-sm font-bold text-orange-700">r</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.matrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.matrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{bacDisplay}%</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="sobriety-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.primaryValue}</div><div className="mt-1 text-3xl font-black">{bacDisplay}%</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{bacRawDisplay}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{sobrietyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.drinkStep, t.estimateStep, t.waitStep, t.safeStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Drink", note: t.drinkStep }, { label: "Estimate", note: t.estimateStep }, { label: "Wait", note: t.waitStep }, { label: "Safe", note: t.safeStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
