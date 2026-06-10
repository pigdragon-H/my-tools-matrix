// @profile B
// Profile B · Calculator-YMYL · IntermittentFastingCalculator（GOLD-STANDARD-001 compatible · MacroCalculator clone）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Protocol = "14:10" | "16:8" | "18:6" | "20:4" | "23:1";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

function clockLabel(h: number): string {
  const hh = ((Math.floor(h) % 24) + 24) % 24;
  const mm = Math.round((h - Math.floor(h)) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const protocolFast: Record<Protocol, number> = { "14:10": 14, "16:8": 16, "18:6": 18, "20:4": 20, "23:1": 23 };

const bands = [
  { key: "gentle", range: "≤ 14h", label: { zh: "溫和入門", en: "Gentle" }, desc: { zh: "14 小時內斷食，適合初學者建立節律。", en: "Fasting under 14h; great for beginners building rhythm." } },
  { key: "standard", range: "≤ 16h", label: { zh: "標準", en: "Standard" }, desc: { zh: "16 小時是最普及的入門起點，平衡效益與可持續。", en: "16h is the most popular entry point; balances benefit and sustainability." } },
  { key: "advanced", range: "≤ 18h", label: { zh: "進階", en: "Advanced" }, desc: { zh: "18 小時加深代謝彈性，注意進食窗營養密度。", en: "18h deepens metabolic flexibility; mind nutrient density in the window." } },
  { key: "aggressive", range: "≤ 20h", label: { zh: "積極", en: "Aggressive" }, desc: { zh: "20 小時接近單餐型態，需確保蛋白與微量元素充足。", en: "20h nears one-meal style; ensure adequate protein and micronutrients." } },
  { key: "omad", range: "≤ 23h", label: { zh: "單餐 OMAD", en: "OMAD" }, desc: { zh: "每日一餐，門檻高，建議有經驗者並監測體感。", en: "One meal a day; high bar—best for experienced users monitoring how they feel." } },
  { key: "extreme", range: "> 23h", label: { zh: "極限", en: "Extreme" }, desc: { zh: "超過 23 小時屬延長斷食，請審慎並諮詢專業意見。", en: "Beyond 23h is extended fasting; proceed cautiously and seek professional advice." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "斷食追蹤 App", en: "Fasting Tracker App" }, href: "https://www.amazon.com/s?k=fasting+tracker+app" },
  { label: { zh: "電解質補充飲", en: "Electrolyte Drink Mix" }, href: "https://www.amazon.com/s?k=electrolyte+drink+mix" },
  { label: { zh: "黑咖啡／無糖茶", en: "Black Coffee / Tea" }, href: "https://www.amazon.com/s?k=black+coffee" },
  { label: { zh: "保溫水瓶", en: "Insulated Water Bottle" }, href: "https://www.amazon.com/s?k=insulated+water+bottle" },
];

const ui = {
  zh: {
    badge: "健康 · 飲食 · 間歇斷食 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "間歇性斷食計算機 · Fasting Planner", subtitle: "選擇斷食法與進食窗起始時間，算出每日斷食時數與開窗排程",
    intro: "Fasting Calculator 依據常見斷食協定（14:10、16:8、18:6、20:4、OMAD 23:1）與您的進食窗起始時間，計算每日斷食時數、進食窗長度與開窗／關窗時刻，幫您把斷食排程具體化。",
    trustNoteLabel: "注意事項：", trustNote: "間歇斷食非人人適合，孕期、糖尿病、進食障礙史或服藥者請先諮詢醫師。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立斷食排程範例", examplePreview: "每日斷食時數預覽", examplePerson: "斷食法", fillExample: "一鍵填入標準範例", previewActivePath: "填入 20:4 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "選擇斷食法與起始時間", examplesHelper: "先用範例理解算法，再改成您自己的斷食法與進食窗開始時間。",
    metric: "24 小時制", imperial: "排程對照", exampleCards: "範例卡", baselineExample: "16:8 · 12:00 開窗", activeExample: "20:4 示範", fastLabel: "斷食", baselineExampleNote: "16:8 · 開窗 12:00 · 關窗 20:00", activeExampleNote: "20:4 · 開窗 16:00 · 關窗 20:00", flowDemo: "16:8", calculator: "計算機",
    protocolLabel: "斷食法", startLabel: "進食窗開始（24 小時制）",
    resultCard: "您的斷食排程", unit: "小時/天", primaryValue: "主要數值", maintenanceTarget: "進食窗 (h)", actionTarget: "開窗時間", quickOpenLabel: "快速開窗", estimatedTdee: "斷食法", maintenance: "進食窗", fatLossTarget: "關窗時間",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格斷食強度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每日斷食時數放進常見強度區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把斷食排程轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示斷食時數、進食窗與開關窗時刻。",
    progressInsight: "進度洞察卡", possibleTarget: "目前斷食排程", dailyGap: "進食窗", weeklyTrend: "斷食占比", motivation: "動力卡", keepMomentum: "從排程走向穩定節律",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的斷食排程帶回家", journeyHint: "固定每天的開窗與關窗時間，讓身體建立節律；進食窗內以均衡、足量蛋白的原型食物為主，斷食期維持水分與電解質。",
    nextActionLabel: "下一步行動", nextActionTitle: "將排程接到下一個工具", nextActionItem1: "用斷食追蹤 App 計時進食窗與連續天數", nextActionItem2: "斷食期補充水分與電解質，減少頭暈疲勞", nextActionItem3: "開窗第一餐以蛋白與纖維為主，避免血糖驟升",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "斷食法 → 斷食時數 → 進食窗 → 開關窗時刻", bmrStep: "斷食法", deficitStep: "斷食時數", trendStep: "進食窗", mealStep: "開關窗",
    knowledge: "知識", knowledgeTitle: "間歇斷食在健康宇宙中的意義", definition: "定義", definitionText: "間歇性斷食是以時間為框架，把進食集中在固定時段內、其餘時間禁食，藉此調整代謝與飲食節律。", formula: "公式", formulaText: "斷食時數 = 協定固定值（14:10→14、16:8→16、18:6→18、20:4→20、23:1→23）。進食窗 = 24 − 斷食時數。關窗時刻 = 開窗時刻 + 進食窗。", limitations: "限制", limitationsText: "斷食非人人適合；孕期、哺乳、第一型糖尿病、進食障礙史、體重過輕或服用需配餐藥物者，應先諮詢醫師。本工具僅排程規劃，不評估個人代謝風險。", interpretation: "解讀", interpretationText: "新手建議從 14:10 或 16:8 入門，適應後再視體感延長；進食窗內仍需均衡足量蛋白，斷食期維持水分與電解質。", context: "脈絡", contextText: "斷食排程應與睡眠、訓練與整體飲食一起看，固定開關窗時間更易維持。", example: "範例", exampleText: "16:8 協定、12:00 開窗 → 斷食 16 小時、進食窗 8 小時、12:00 開窗、20:00 關窗。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "斷食排程的推薦工具", premiumTitle: "PRO 斷食計畫包", premiumText: "解鎖週期化斷食排程、進食窗營養範本、連續天數成就追蹤與個人化提醒。", feat1: "排程", feat2: "營養", feat3: "連續天數", feat4: "提醒",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與排程規劃用途，不取代醫療診斷、營養治療或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Fasting Tracker App · Electrolyte Drink Mix · Black Coffee / Tea · Insulated Water Bottle", references: "參考資料", referencesText: "de Cabo & Mattson, Effects of Intermittent Fasting on Health, Aging, and Disease (NEJM, 2019); Patterson & Sears, Metabolic Effects of Intermittent Fasting。",
    q1: "新手該從哪種開始？", a1: "建議從 14:10 或 16:8 入門，身體適應後再視體感逐步延長到 18:6 或 20:4。",
    q2: "斷食期能喝什麼？", a2: "水、黑咖啡、無糖茶等零熱量飲品可接受；任何含糖或含熱量飲品都會中斷斷食。",
    q3: "誰不適合斷食？", a3: "孕期或哺乳、第一型糖尿病、有進食障礙病史、體重過輕或服用需配餐藥物者，應先諮詢醫師。",
    q4: "如何開窗第一餐？", a4: "建議以蛋白質與纖維為主、避免大量精製糖，減少血糖驟升與暴食衝動。",
    q5: "斷食會掉肌肉嗎？", a5: "在進食窗攝取足量蛋白並維持阻力訓練，可大幅降低肌肉流失風險。",
    q6: "這個工具能評估我的健康風險嗎？", a6: "不能。它只計算排程；若有疾病、懷孕、服藥或特殊狀況，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Diet · Intermittent Fasting · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Intermittent Fasting Calculator · Fasting Planner", subtitle: "Pick a protocol and window start to compute daily fasting hours and schedule",
    intro: "This calculator uses common fasting protocols (14:10, 16:8, 18:6, 20:4, OMAD 23:1) and your eating-window start time to compute daily fasting hours, window length, and open/close times—turning fasting into a concrete schedule.",
    trustNoteLabel: "Note:", trustNote: "Intermittent fasting isn't for everyone—if pregnant, diabetic, with an eating-disorder history, or on medication, consult a doctor first.",
    quickActionCard: "Quick Action Card", tryExample: "Create a fasting schedule instantly", examplePreview: "Daily fasting hours preview", examplePerson: "Protocol", fillExample: "One-click standard example", previewActivePath: "Fill 20:4 example",
    examplesCalculator: "Examples → Calculator", enterValues: "Pick protocol and start time", examplesHelper: "Start with an example to understand the math, then swap in your own protocol and window start time.",
    metric: "24-hour", imperial: "Schedule view", exampleCards: "Example cards", baselineExample: "16:8 · open at 12:00", activeExample: "20:4 demo", fastLabel: "Fast", baselineExampleNote: "16:8 · open 12:00 · close 20:00", activeExampleNote: "20:4 · open 16:00 · close 20:00", flowDemo: "16:8", calculator: "Calculator",
    protocolLabel: "Fasting protocol", startLabel: "Eating-window start (24h)",
    resultCard: "Your Fasting Schedule", unit: "hours/day", primaryValue: "Primary Value", maintenanceTarget: "Eating window (h)", actionTarget: "Window opens", quickOpenLabel: "Quick open", estimatedTdee: "Protocol", maintenance: "Eating window", fatLossTarget: "Window closes",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card fasting intensity matrix", tdeeMatrixNote: "L7 uses six fixed cards to place your daily fasting hours in common intensity zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn your fasting schedule into an actionable plan", conversionNote: "L9 values update from the computed result: fasting hours, eating window, and open/close times.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current fasting schedule", dailyGap: "Eating window", weeklyTrend: "Fasting share", motivation: "Motivation Card", keepMomentum: "Move from schedule to steady rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's fasting schedule home", journeyHint: "Keep your open/close times consistent daily so your body builds a rhythm. Eat balanced, protein-rich whole foods within the window and stay hydrated with electrolytes while fasting.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this schedule to the next tool", nextActionItem1: "Use a fasting tracker app to time your window and streaks", nextActionItem2: "Replenish water and electrolytes during fasts to reduce dizziness", nextActionItem3: "Break the fast with protein and fiber to avoid blood-sugar spikes",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Protocol → Fasting hours → Eating window → Open/close times", bmrStep: "Protocol", deficitStep: "Fasting hours", trendStep: "Eating window", mealStep: "Open/close",
    knowledge: "Knowledge", knowledgeTitle: "What intermittent fasting means in the Health universe", definition: "Definition", definitionText: "Intermittent fasting is a time-based framework that concentrates eating within a fixed window and fasts the rest of the day to adjust metabolism and dietary rhythm.", formula: "Formula", formulaText: "Fasting hours = protocol fixed value (14:10→14, 16:8→16, 18:6→18, 20:4→20, 23:1→23). Eating window = 24 − fasting hours. Close time = open time + eating window.", limitations: "Limitations", limitationsText: "Fasting isn't for everyone; those pregnant/breastfeeding, with type-1 diabetes, an eating-disorder history, underweight, or on meal-dependent medication should consult a doctor first. This tool only schedules; it doesn't assess personal metabolic risk.", interpretation: "Interpretation", interpretationText: "Beginners should start with 14:10 or 16:8 and extend by feel; eat balanced, protein-rich food in the window and stay hydrated with electrolytes while fasting.", context: "Context", contextText: "Fasting schedules should be viewed alongside sleep, training, and overall diet; consistent open/close times are easier to maintain.", example: "Example", exampleText: "16:8 protocol, open at 12:00 → fast 16 hours, eating window 8 hours, opens 12:00, closes 20:00.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Recommended tools for fasting schedules", premiumTitle: "PRO Fasting Plan Pack", premiumText: "Unlock periodized fasting schedules, eating-window nutrition templates, streak achievement tracking, and personalized reminders.", feat1: "Schedule", feat2: "Nutrition", feat3: "Streaks", feat4: "Reminder",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and scheduling. It does not replace medical diagnosis, nutrition therapy, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Fasting Tracker App · Electrolyte Drink Mix · Black Coffee / Tea · Insulated Water Bottle", references: "References", referencesText: "de Cabo & Mattson, Effects of Intermittent Fasting on Health, Aging, and Disease (NEJM, 2019); Patterson & Sears, Metabolic Effects of Intermittent Fasting.",
    q1: "Which protocol should beginners start with?", a1: "Start with 14:10 or 16:8; once adapted, gradually extend to 18:6 or 20:4 based on how you feel.",
    q2: "What can I drink while fasting?", a2: "Water, black coffee and unsweetened tea (zero calories) are fine; any sugary or caloric drink breaks the fast.",
    q3: "Who should not fast?", a3: "Those pregnant/breastfeeding, with type-1 diabetes, an eating-disorder history, underweight, or on meal-dependent medication should consult a doctor first.",
    q4: "How should I break the fast?", a4: "Lead with protein and fiber and avoid large refined-sugar loads to curb blood-sugar spikes and overeating urges.",
    q5: "Will fasting cost me muscle?", a5: "Eating enough protein in the window and keeping up resistance training greatly reduces muscle-loss risk.",
    q6: "Can this tool assess my health risk?", a6: "No. It only computes a schedule; consult a professional for disease, pregnancy, medication, or special conditions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function IntermittentFastingCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [protocol, setProtocol] = useState<Protocol>("16:8");
  const [start, setStart] = useState("12");
  const t = ui[lang];

  const result = useMemo(() => {
    const fastHours = protocolFast[protocol];
    const eatHours = 24 - fastHours;
    const s = Math.max(0, Math.min(23.99, Number(start) || 0));
    const end = s + eatHours;
    return { fastHours, eatHours, start: s, end, startLabel: clockLabel(s), endLabel: clockLabel(end) };
  }, [protocol, start]);

  const fastDisplay = fmt(result.fastHours, 0);
  const eatDisplay = fmt(result.eatHours, 0);
  const fastPct = fmt((result.fastHours / 24) * 100, 0);

  function fillStandard() { setUnit("metric"); setProtocol("16:8"); setStart("12"); }
  function fillCut() { setUnit("metric"); setProtocol("20:4"); setStart("16"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{fastDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.estimatedTdee}</div><div className="font-black">{protocol}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.maintenance}</div><div className="font-black">{eatDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.quickOpenLabel}</div><div className="font-black">{result.startLabel}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">16h</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">20h</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.protocolLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={protocol} onChange={(e) => setProtocol(e.target.value as Protocol)}><option value="14:10">14:10</option><option value="16:8">16:8</option><option value="18:6">18:6</option><option value="20:4">20:4</option><option value="23:1">OMAD 23:1</option></select></label><label className="block text-sm font-black text-slate-700">{t.startLabel}<input type="number" min={0} max={23} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={start} onChange={(e) => setStart(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{fastDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{protocol}</div><div className="mt-1 text-xs text-slate-300">{result.startLabel}–{result.endLabel}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{eatDisplay}</p><p className="text-sm font-bold text-blue-700">h</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">OPEN</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.startLabel}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "開窗" : "open"}</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">CLOSE</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-orange-950">{result.endLabel}</p><p className="text-sm font-bold text-orange-700">{lang === "zh" ? "關窗" : "close"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{fastDisplay} <span className="text-sm text-slate-500">h</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="fasting-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.fastLabel}</div><div className="mt-1 text-3xl font-black">{fastDisplay}h</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{eatDisplay}h</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fastPct}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Protocol", note: t.bmrStep }, { label: "Fast", note: t.deficitStep }, { label: "Window", note: t.trendStep }, { label: "Times", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="fasting-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
