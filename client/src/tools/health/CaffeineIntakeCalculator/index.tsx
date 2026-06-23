// @profile B
// Profile B · Calculator-YMYL · CaffeineIntakeCalculator（GOLD-STANDARD-001 compatible · MacroCalculator clone）

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

const ADULT_CAP_MG = 400; // FDA general adult daily cap
const PER_KG_MG = 5.7; // approximate per-kg safety reference
const perServing = { coffee: 95, espresso: 63, tea: 47, energy: 80, cola: 34 };

const bands = [
  { key: "minimal", range: "≤ 100 mg", label: { zh: "極低", en: "Minimal" }, desc: { zh: "約一杯茶或一杯淡咖啡，刺激溫和。", en: "About a cup of tea or weak coffee; very gentle." } },
  { key: "low", range: "≤ 200 mg", label: { zh: "偏低", en: "Low" }, desc: { zh: "多數人不會感到不適，適合日常提神。", en: "Comfortable for most; fine for a daily lift." } },
  { key: "moderate", range: "≤ 300 mg", label: { zh: "中等", en: "Moderate" }, desc: { zh: "提神效果明顯，敏感者午後攝取需留意睡眠。", en: "Noticeable boost; sensitive people should watch afternoon intake for sleep." } },
  { key: "high", range: "≤ 400 mg", label: { zh: "偏高", en: "High" }, desc: { zh: "接近成人每日上限 400mg，建議分散攝取。", en: "Near the 400mg adult daily cap; spread intake out." } },
  { key: "over", range: "≤ 600 mg", label: { zh: "超標", en: "Over limit" }, desc: { zh: "超過建議上限，可能心悸、焦慮、失眠。", en: "Above the recommended cap; may cause palpitations, anxiety, insomnia." } },
  { key: "danger", range: "> 600 mg", label: { zh: "危險", en: "Danger" }, desc: { zh: "顯著過量，請立即減量並注意身體反應。", en: "Markedly excessive; cut back immediately and monitor symptoms." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "低因咖啡", en: "Decaf Coffee" }, href: "https://www.amazon.com/s?k=decaf+coffee" },
  { label: { zh: "花草茶", en: "Herbal Tea" }, href: "https://www.amazon.com/s?k=herbal+tea" },
  { label: { zh: "保溫咖啡杯", en: "Insulated Mug" }, href: "https://www.amazon.com/s?k=insulated+coffee+mug" },
  { label: { zh: "睡眠追蹤手環", en: "Sleep Tracker" }, href: "https://www.amazon.com/s?k=sleep+tracker" },
];

const ui = {
  zh: {
    badge: "健康 · 飲食 · 咖啡因 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "咖啡因攝取計算機 · Caffeine Planner", subtitle: "輸入每日各種飲品杯數，估算咖啡因總攝取量與安全占比",
    intro: "Caffeine Calculator 依據每日咖啡、濃縮、茶、能量飲與可樂的份數，乘以各飲品平均咖啡因含量，估算每日咖啡因總攝取量（毫克），並對照成人 400mg 上限與您的體重安全參考值。",
    trustNoteLabel: "注意事項：", trustNote: "每份咖啡因為平均值，實際依品牌、沖泡與杯量而異；對咖啡因敏感者標準更低。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立咖啡因攝取範例", examplePreview: "每日咖啡因預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入重度範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入各飲品杯數與體重", examplesHelper: "先用範例理解咖啡因加總算法，再改成您自己的每日飲用習慣。",
    metric: "公制 (mg/kg)", imperial: "對照表 (mg/份)", exampleCards: "範例卡", baselineExample: "2 咖啡 + 1 茶 · 70kg", activeExample: "重度攝取示範", adultCapLabel: "成人上限", totalLabel: "總計", baselineExampleNote: "2 咖啡 + 1 茶 · 70 kg", activeExampleNote: "3 咖啡 + 1 濃縮 + 1 茶 + 1 能量飲 + 1 可樂", flowDemo: "70 kg", calculator: "計算機",
    weight: "體重 (kg)", tdee: "咖啡（杯·95mg）", goal: "茶（杯·47mg）", goalCut: "咖啡", goalMaintain: "茶", goalBulk: "能量飲",
    coffeeLabel: "咖啡（杯·95mg）", espressoLabel: "濃縮（份·63mg）", teaLabel: "茶（杯·47mg）", energyLabel: "能量飲（罐·80mg）", colaLabel: "可樂（罐·34mg）",
    resultCard: "咖啡因攝取結果", unit: "mg/day", primaryValue: "主要數值", maintenanceTarget: "占上限比例 (%)", actionTarget: "安全參考 (mg)", estimatedTdee: "成人上限", maintenance: "占上限", fatLossTarget: "體重參考",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格咖啡因強度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每日咖啡因總量放進常見強度區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把咖啡因攝取轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示每杯貢獻、占上限比例與睡前風險提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前每日攝取", dailyGap: "占上限", weeklyTrend: "體重參考", motivation: "動力卡", keepMomentum: "從估算走向穩定控制",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的咖啡因估算帶回家", journeyHint: "盡量把咖啡因控制在每日 400mg 以內並避開睡前 6–8 小時攝取，若常超標逐步以低因或花草茶替換。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用睡眠追蹤觀察咖啡因對深睡的影響", nextActionItem2: "午後改喝低因或無咖啡因飲品", nextActionItem3: "若常超過 400mg，逐步以低因咖啡替換",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "飲品份數 → 咖啡因總量 → 上限對照 → 睡眠調整", bmrStep: "飲品份數", deficitStep: "咖啡因總量", trendStep: "上限對照", mealStep: "睡眠調整",
    knowledge: "知識", knowledgeTitle: "咖啡因在健康宇宙中的意義", definition: "定義", definitionText: "咖啡因是一種中樞神經興奮劑，可暫時提升警覺與專注；攝取量與時段會影響睡眠與心率。", formula: "公式", formulaText: "總量 = 各飲品份數 × 每份平均咖啡因（咖啡95、濃縮63、茶47、能量80、可樂34 mg）。安全參考 = 體重(kg) × 5.7 mg/kg。占上限 = 總量 ÷ 400mg × 100%。", limitations: "限制", limitationsText: "每份咖啡因為平均值；孕婦、青少年、心律不整者與對咖啡因敏感者上限更低。沖泡濃度與杯量差異大，數值僅供規劃參考。", interpretation: "解讀", interpretationText: "多數健康成人每日 400mg 以內安全；半衰期約 5–6 小時，下午攝取易影響睡眠；分散攝取比一次大量更平穩。", context: "脈絡", contextText: "咖啡因規劃應與睡眠品質、心率與整體飲食一起看，並避開睡前時段。", example: "範例", exampleText: "2 杯咖啡(190) + 1 杯茶(47) = 237 mg；占成人上限約 59%，體重 70kg 安全參考約 399mg。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "咖啡因管理的推薦替代", premiumTitle: "PRO 咖啡因追蹤包", premiumText: "解鎖飲品資料庫、每日時段攝取曲線、睡前風險提醒與個人化攝取報告。", feat1: "資料庫", feat2: "代謝曲線", feat3: "警示", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、營養治療或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Decaf Coffee · Herbal Tea · Insulated Mug · Sleep Tracker", references: "參考資料", referencesText: "US FDA caffeine guidance; EFSA Scientific Opinion on the safety of caffeine; Institute of Medicine caffeine reviews。",
    q1: "成人一天上限是多少？", a1: "FDA 建議健康成人每日不超過約 400mg，相當於 4 杯一般沖泡咖啡。",
    q2: "咖啡因多久代謝掉？", a2: "半衰期約 5–6 小時，因此下午 3 點後的攝取常會影響當晚睡眠。",
    q3: "孕期可以喝嗎？", a3: "多數指引建議孕期每日不超過 200mg，並先諮詢醫師。",
    q4: "為什麼午後要少喝？", a4: "咖啡因會延遲入睡與減少深睡，敏感者建議中午後改喝低因或無咖啡因飲品。",
    q5: "青少年適用嗎？", a5: "青少年建議上限更低（約每公斤體重 2.5mg），且不建議飲用能量飲料。",
    q6: "這個工具能診斷咖啡因成癮嗎？", a6: "不能。它只是教育用估算；若有心悸、焦慮或戒斷頭痛等狀況，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Diet · Caffeine · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Caffeine Intake Calculator · Caffeine Planner", subtitle: "Estimate total daily caffeine and its safety share from your drink counts",
    intro: "This calculator multiplies your daily counts of coffee, espresso, tea, energy drinks, and cola by each drink's average caffeine content to estimate total daily caffeine (mg), compared against the 400mg adult cap and a body-weight safety reference.",
    trustNoteLabel: "Note:", trustNote: "Per-serving caffeine is an average; real values vary by brand, brew and cup size; sensitive people have lower thresholds.",
    quickActionCard: "Quick Action Card", tryExample: "Create a caffeine example instantly", examplePreview: "Daily caffeine preview", examplePerson: "Standard example", fillExample: "One-click standard example", previewActivePath: "Fill heavy example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter drink counts and weight", examplesHelper: "Start with an example to understand the totaling math, then swap in your own daily habits.",
    metric: "Metric (mg/kg)", imperial: "Per-serving (mg)", exampleCards: "Example cards", baselineExample: "2 coffees + 1 tea · 70kg", activeExample: "Heavy intake demo", adultCapLabel: "Adult cap", totalLabel: "Total", baselineExampleNote: "2 Coffee + 1 Tea · 70 kg", activeExampleNote: "3 Coffee + 1 Espresso + 1 Tea + 1 Energy + 1 Cola", flowDemo: "70 kg", calculator: "Calculator",
    weight: "Body weight (kg)", tdee: "Coffee (cups·95mg)", goal: "Tea (cups·47mg)", goalCut: "Coffee", goalMaintain: "Tea", goalBulk: "Energy",
    coffeeLabel: "Coffee (cups·95mg)", espressoLabel: "Espresso (shots·63mg)", teaLabel: "Tea (cups·47mg)", energyLabel: "Energy drink (cans·80mg)", colaLabel: "Cola (cans·34mg)",
    resultCard: "Caffeine Intake Result", unit: "mg/day", primaryValue: "Primary Value", maintenanceTarget: "% of cap", actionTarget: "Safety ref (mg)", estimatedTdee: "Adult cap", maintenance: "% of cap", fatLossTarget: "Weight ref",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card caffeine intensity matrix", tdeeMatrixNote: "L7 uses six fixed cards to place your current daily caffeine total in common intensity zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn caffeine intake into an actionable plan", conversionNote: "L9 values update from the computed result: per-cup contribution, % of cap, and bedtime-risk hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current daily intake", dailyGap: "% of cap", weeklyTrend: "Weight ref", motivation: "Motivation Card", keepMomentum: "Move from estimate to steady control",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's caffeine estimate home", journeyHint: "Keep caffeine under 400mg/day and avoid it within 6–8 hours of sleep; if you often exceed it, gradually swap in decaf or herbal tea.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use a sleep tracker to see caffeine's effect on deep sleep", nextActionItem2: "Switch to decaf or caffeine-free drinks in the afternoon", nextActionItem3: "If you often exceed 400mg, gradually swap in decaf coffee",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Drink counts → Total caffeine → Cap check → Sleep adjustment", bmrStep: "Drink counts", deficitStep: "Total caffeine", trendStep: "Cap check", mealStep: "Sleep adjustment",
    knowledge: "Knowledge", knowledgeTitle: "What caffeine means in the Health universe", definition: "Definition", definitionText: "Caffeine is a central-nervous-system stimulant that temporarily boosts alertness and focus; the amount and timing affect sleep and heart rate.", formula: "Formula", formulaText: "Total = each drink's count × average caffeine per serving (coffee 95, espresso 63, tea 47, energy 80, cola 34 mg). Safety ref = weight(kg) × 5.7 mg/kg. % of cap = total ÷ 400mg × 100%.", limitations: "Limitations", limitationsText: "Per-serving caffeine is an average; pregnant women, teens, people with arrhythmia, and caffeine-sensitive individuals have lower limits. Brew strength and cup size vary widely; values are for planning only.", interpretation: "Interpretation", interpretationText: "Up to 400mg/day is safe for most healthy adults; half-life is ~5–6 hours, so afternoon intake affects sleep; spreading intake is steadier than one large dose.", context: "Context", contextText: "Caffeine planning should be viewed alongside sleep quality, heart rate, and overall diet, avoiding the pre-sleep window.", example: "Example", exampleText: "2 coffees (190) + 1 tea (47) = 237 mg; about 59% of the adult cap, with a 70kg safety reference of ~399mg.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Recommended swaps for caffeine management", premiumTitle: "PRO Caffeine Tracking Pack", premiumText: "Unlock a drink database, time-of-day intake curves, bedtime-risk alerts, and personalized intake reports.", feat1: "Database", feat2: "Curves", feat3: "Alerts", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Decaf Coffee · Herbal Tea · Insulated Mug · Sleep Tracker", references: "References", referencesText: "US FDA caffeine guidance; EFSA Scientific Opinion on the safety of caffeine; Institute of Medicine caffeine reviews.",
    q1: "What's the adult daily cap?", a1: "The FDA suggests healthy adults stay under ~400mg/day, about four cups of regular brewed coffee.",
    q2: "How long does caffeine last?", a2: "Its half-life is ~5–6 hours, so intake after 3pm often affects that night's sleep.",
    q3: "Can I have caffeine while pregnant?", a3: "Most guidelines suggest under 200mg/day during pregnancy—consult your doctor first.",
    q4: "Why drink less in the afternoon?", a4: "Caffeine delays sleep onset and reduces deep sleep; sensitive people should switch to decaf after midday.",
    q5: "Is it suitable for teenagers?", a5: "Teens have a lower recommended limit (about 2.5mg per kg body weight) and should avoid energy drinks.",
    q6: "Can this tool diagnose caffeine addiction?", a6: "No. It is an educational estimate; if you have palpitations, anxiety, or withdrawal headaches, consult a professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CaffeineIntakeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [coffee, setCoffee] = useState("2");
  const [espresso, setEspresso] = useState("0");
  const [tea, setTea] = useState("1");
  const [energy, setEnergy] = useState("0");
  const [cola, setCola] = useState("0");
  const [weight, setWeight] = useState("70");
  const t = ui[lang];

  const result = useMemo(() => {
    const c = Math.max(0, Number(coffee) || 0);
    const e = Math.max(0, Number(espresso) || 0);
    const tt = Math.max(0, Number(tea) || 0);
    const en = Math.max(0, Number(energy) || 0);
    const co = Math.max(0, Number(cola) || 0);
    const w = Math.max(0, Number(weight) || 0);
    if (c + e + tt + en + co <= 0 && w <= 0) return null;
    const total = c * perServing.coffee + e * perServing.espresso + tt * perServing.tea + en * perServing.energy + co * perServing.cola;
    const perKgRef = w * PER_KG_MG;
    const pctCap = (total / ADULT_CAP_MG) * 100;
    return { total, perKgRef, pctCap };
  }, [coffee, espresso, tea, energy, cola, weight]);

  const totalDisplay = result ? fmt(result.total, 0) : "—";
  const pctDisplay = result ? fmt(result.pctCap, 0) : "—";
  const perKgDisplay = result ? fmt(result.perKgRef, 0) : "—";

  function fillStandard() { setUnit("metric"); setCoffee("2"); setEspresso("0"); setTea("1"); setEnergy("0"); setCola("0"); setWeight("70"); }
  function fillCut() { setUnit("metric"); setCoffee("3"); setEspresso("1"); setTea("1"); setEnergy("1"); setCola("1"); setWeight("70"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.estimatedTdee}</div><div className="font-black">{ADULT_CAP_MG}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.maintenance}</div><div className="font-black">{pctDisplay}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{weight} kg</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">237 mg</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">489 mg</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.coffeeLabel}<input type="number" min={0} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={coffee} onChange={(e) => setCoffee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.espressoLabel}<input type="number" min={0} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={espresso} onChange={(e) => setEspresso(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.teaLabel}<input type="number" min={0} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tea} onChange={(e) => setTea(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.energyLabel}<input type="number" min={0} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={energy} onChange={(e) => setEnergy(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.colaLabel}<input type="number" min={0} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={cola} onChange={(e) => setCola(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.weight}<input type="number" min={0} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{weight} kg</div><div className="mt-1 text-xs text-slate-300">{pctDisplay}% CAP</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{pctDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{perKgDisplay}</p><p className="text-sm font-bold text-emerald-700">mg</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">CAP</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.adultCapLabel}</div><p className="mt-2 text-3xl font-black text-orange-950">{ADULT_CAP_MG}</p><p className="text-sm font-bold text-orange-700">mg</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">mg</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="caffeine-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.totalLabel}</div><div className="mt-1 text-3xl font-black">{totalDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{pctDisplay}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{perKgDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Counts", note: t.bmrStep }, { label: "Total", note: t.deficitStep }, { label: "Cap", note: t.trendStep }, { label: "Sleep", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
