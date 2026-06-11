// @profile B
// Profile B · Calculator-YMYL · AlcoholCaloriesCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Drink = "beer" | "wine" | "spirit" | "cocktail" | "custom";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const ETHANOL_DENSITY = 0.789; // g/ml
const KCAL_PER_G_ALCOHOL = 7;

const presets: Record<Exclude<Drink, "custom">, { ml: number; abv: number; sugar: number }> = {
  beer: { ml: 355, abv: 5, sugar: 13 },
  wine: { ml: 150, abv: 12, sugar: 4 },
  spirit: { ml: 44, abv: 40, sugar: 0 },
  cocktail: { ml: 200, abv: 15, sugar: 25 },
};

const bands = [
  { key: "light", range: "≤ 100", label: { zh: "輕量", en: "Light" }, desc: { zh: "單杯低酒精飲品，熱量負擔小。", en: "A single low-alcohol drink; minimal calorie load." } },
  { key: "moderate", range: "≤ 200", label: { zh: "中等", en: "Moderate" }, desc: { zh: "約等於一份正餐配菜的熱量，留意總量。", en: "About a side-dish worth of calories; watch the total." } },
  { key: "high", range: "≤ 350", label: { zh: "偏高", en: "High" }, desc: { zh: "接近半份正餐，含糖調酒易超標。", en: "Near half a meal; sugary cocktails add up fast." } },
  { key: "veryhigh", range: "≤ 500", label: { zh: "很高", en: "Very high" }, desc: { zh: "相當於一份正餐熱量，建議節制。", en: "Equivalent to a full meal; moderation advised." } },
  { key: "heavy", range: "≤ 800", label: { zh: "過量", en: "Heavy" }, desc: { zh: "多杯累積，明顯影響每日熱量平衡。", en: "Multiple drinks accumulate and skew daily energy balance." } },
  { key: "excess", range: "> 800", label: { zh: "嚴重超標", en: "Excessive" }, desc: { zh: "遠超建議飲用量，對健康與熱量皆有風險。", en: "Far above recommended intake; risky for health and calories." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 飲食營養 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "酒精卡路里計算機 · Alcohol Calories", subtitle: "用份量、酒精濃度與糖分估算一杯飲品的總熱量",
    intro: "Alcohol Calories Calculator 依據份量(ml)、酒精濃度(ABV%)與糖分(g)，估算一杯飲品的總熱量（酒精熱量＋糖分熱量），並換算純酒精克數，幫您把「液體卡路里」算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "估算採用乙醇 7 kcal/g、密度 0.789 g/ml，糖分為概略值；個別品牌與配方會影響實際熱量，過量飲酒有害健康。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立酒精熱量範例", examplePreview: "單杯熱量預覽", examplePerson: "份量", fillExample: "一鍵填入啤酒範例", previewActivePath: "填入調酒範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入份量、酒精濃度與糖分", examplesHelper: "先用範例理解酒精與糖分如何形成熱量，再改成您自己的飲品數據。",
    metric: "啤酒 / 葡萄酒", imperial: "烈酒 / 調酒", exampleCards: "範例卡", baselineExample: "啤酒 355 ml · 5%", activeExample: "調酒 200 ml · 15%", totalLabel: "總計", baselineExampleNote: "啤酒 · 355 ml · 5% · 13 g", activeExampleNote: "雞尾酒 · 200 ml · 15% · 25 g", flowDemo: "ABV", calculator: "計算機",
    weight: "份量 (ml)", tdee: "酒精濃度 ABV (%)", goal: "糖分 (g)", goalCut: "啤酒", goalMaintain: "葡萄酒", goalBulk: "烈酒",
    resultCard: "酒精熱量估算結果", unit: "kcal/杯", primaryValue: "純酒精", maintenanceTarget: "酒精熱量 (kcal)", actionTarget: "糖分熱量 (kcal)", estimatedTdee: "純酒精克數", maintenance: "酒精", fatLossTarget: "糖分", gramsLabel: "公克",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格酒精熱量判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每杯熱量放進常見強度區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把酒精熱量換成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示純酒精克數、每毫升熱量與每日追蹤提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前飲品熱量", dailyGap: "純酒精", weeklyTrend: "每毫升熱量", motivation: "動力卡", keepMomentum: "從單杯估算走向穩定控管",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的飲酒熱量帶回家", journeyHint: "用一週平均飲用量重新估算，避免被單次聚會誤導；無酒精日有助整體平衡。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 BMR 確認基礎代謝是否合理", nextActionItem2: "用 TDEE 計算總消耗，扣掉酒精熱量", nextActionItem3: "用 Calorie Deficit 或 Macro 檢查是否需要調整",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "BMR / TDEE → 酒精熱量 → Calorie Deficit / Macro", bmrStep: "BMR/TDEE", deficitStep: "酒精熱量", trendStep: "熱量赤字", mealStep: "巨量追蹤",
    knowledge: "知識", knowledgeTitle: "酒精熱量在健康宇宙中的意義", definition: "定義", definitionText: "酒精（乙醇）每克提供約 7 kcal，介於碳水(4)與脂肪(9)之間；它不含必需營養，常被稱為「空熱量」。", formula: "公式", formulaText: "純酒精(g) = 份量(ml) × ABV% × 0.789。酒精熱量 = 純酒精(g) × 7 kcal/g。糖分熱量 = 糖分(g) × 4 kcal/g。總熱量 = 酒精熱量 + 糖分熱量。", limitations: "限制", limitationsText: "糖分為概略值；不同品牌、調酒配方與添加物會改變實際熱量。本工具未計入混合飲料中的其他食材熱量。", interpretation: "解讀", interpretationText: "烈酒的酒精濃度高但份量小；含糖調酒總熱量常高於想像。比較時應看「整杯總熱量」而非僅看 ABV。", context: "脈絡", contextText: "酒精熱量規劃應接在 TDEE 之後，並與熱量赤字、巨量營養素一起看。", example: "範例", exampleText: "啤酒 355 ml、5% ABV、13 g 糖 → 純酒精 14.0g、酒精熱量 98 kcal + 糖分熱量 52 kcal = 約 150 kcal。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "飲食規劃的下一步工具", premiumTitle: "PRO 飲酒追蹤包", premiumText: "解鎖每杯記錄、週飲量趨勢圖、無酒精日提醒與個人化飲食報告。", feat1: "記錄追蹤", feat2: "趨勢分析", feat3: "提醒", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、營養治療或專業健康建議。過量飲酒有害健康。", relatedTools: "相關工具", relatedToolsText: "BMR Calculator · TDEE Calculator · Calorie Deficit Calculator · Macro Calculator", references: "參考資料", referencesText: "USDA FoodData Central（酒精能量值）；NIAAA Rethinking Drinking；WHO Global status report on alcohol and health；Atwater general factors。",
    q1: "酒精熱量是怎麼算出來的？", a1: "用份量(ml) × 酒精濃度(ABV%) 得到純酒精毫升，再乘以密度 0.789 換成克數，最後乘以 7 kcal/g；含糖飲品再加上糖分(g) × 4 kcal。",
    q2: "哪一種酒熱量最低？", a2: "一般而言純烈酒(不加糖)單位份量熱量集中但份量小；含糖調酒總熱量最高。低酒精啤酒或無糖氣泡酒通常較低。",
    q3: "為什麼要算糖分？", a3: "許多調酒、利口酒與啤酒含可觀糖分，糖每克 4 kcal，會明顯墊高總熱量，因此本工具把糖分熱量單獨列出。",
    q4: "每天可以喝多少？", a4: "各國指引不同，常見上限為男性每日約 2 份、女性約 1 份標準酒精；本工具僅估算熱量，不代表安全飲用建議。",
    q5: "孕婦適用嗎？", a5: "孕期與哺乳期不建議飲酒。本工具的熱量估算不適用於替孕婦規劃飲酒，請諮詢專業人員。",
    q6: "這個工具能診斷酒精依賴或代謝疾病嗎？", a6: "不能。它只是教育用估算；若有飲酒問題、肝臟疾病、用藥或特殊狀況，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Diet & Nutrition · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Alcohol Calories Calculator", subtitle: "Estimate a drink's total calories from volume, ABV, and sugar",
    intro: "This calculator uses volume(ml), alcohol by volume(ABV%), and sugar(g) to estimate a drink's total calories (alcohol calories + sugar calories) and the grams of pure alcohol, so you can quantify those liquid calories.",
    trustNoteLabel: "Note:", trustNote: "Estimates use ethanol at 7 kcal/g and density 0.789 g/ml; sugar is approximate. Brands and recipes change real values; excessive drinking harms health.",
    quickActionCard: "Quick Action Card", tryExample: "Create an alcohol calorie example instantly", examplePreview: "Per-drink calorie preview", examplePerson: "Volume", fillExample: "One-click beer example", previewActivePath: "Fill cocktail example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter volume, ABV, and sugar", examplesHelper: "Start with an example to understand how alcohol and sugar form calories, then replace with your own drink data.",
    metric: "Beer / Wine", imperial: "Spirit / Cocktail", exampleCards: "Example cards", baselineExample: "Beer 355 ml · 5%", activeExample: "Cocktail 200 ml · 15%", totalLabel: "Total", baselineExampleNote: "Beer · 355 ml · 5% · 13 g", activeExampleNote: "Cocktail · 200 ml · 15% · 25 g", flowDemo: "ABV", calculator: "Calculator",
    weight: "Volume (ml)", tdee: "Alcohol by volume ABV (%)", goal: "Sugar (g)", goalCut: "Beer", goalMaintain: "Wine", goalBulk: "Spirit",
    resultCard: "Alcohol Calorie Estimate", unit: "kcal/drink", primaryValue: "Pure alcohol", maintenanceTarget: "Alcohol kcal", actionTarget: "Sugar kcal", estimatedTdee: "Grams of pure alcohol", maintenance: "Alcohol", fatLossTarget: "Sugar", gramsLabel: "grams",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card alcohol calorie matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current per-drink calories into common intensity zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn alcohol calories into an actionable plan", conversionNote: "L9 values update from the computed result: grams of pure alcohol, calories per ml, and a daily tracking hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current drink calories", dailyGap: "Pure alcohol", weeklyTrend: "kcal per ml", motivation: "Motivation Card", keepMomentum: "Move from per-drink estimate to steady control",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's drink calories home", journeyHint: "Re-estimate using a weekly average to avoid overreacting to a single party; alcohol-free days help overall balance.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm basal metabolism with BMR Calculator", nextActionItem2: "Use TDEE for total output and subtract alcohol calories", nextActionItem3: "Use Calorie Deficit or Macro to decide whether to adjust",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "BMR / TDEE → Alcohol calories → Calorie Deficit / Macro", bmrStep: "BMR/TDEE", deficitStep: "Alcohol kcal", trendStep: "Calorie deficit", mealStep: "Macro tracking",
    knowledge: "Knowledge", knowledgeTitle: "What alcohol calories mean in the Health universe", definition: "Definition", definitionText: "Alcohol (ethanol) provides about 7 kcal per gram, between carbs(4) and fat(9). It carries no essential nutrients and is often called 'empty calories'.", formula: "Formula", formulaText: "Pure alcohol(g) = volume(ml) × ABV% × 0.789. Alcohol kcal = pure alcohol(g) × 7. Sugar kcal = sugar(g) × 4. Total = alcohol kcal + sugar kcal.", limitations: "Limitations", limitationsText: "Sugar is approximate; brands, mixers, and additives change real values. This tool excludes calories from other ingredients in mixed drinks.", interpretation: "Interpretation", interpretationText: "Spirits are high ABV but small in volume; sugary cocktails often exceed expectations. Compare total per-glass calories, not just ABV.", context: "Context", contextText: "Alcohol-calorie planning should follow TDEE and be paired with calorie deficit and macro tracking.", example: "Example", exampleText: "Beer 355 ml, 5% ABV, 13 g sugar → 14.0g pure alcohol, 98 kcal alcohol + 52 kcal sugar = ~150 kcal.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for diet planning", premiumTitle: "PRO Drink Tracking Pack", premiumText: "Unlock per-drink logging, weekly intake trend charts, alcohol-free-day reminders, and personalized diet reports.", feat1: "Logging", feat2: "Trends", feat3: "Reminder", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional health advice. Excessive drinking harms health.", relatedTools: "Related Tools", relatedToolsText: "BMR Calculator · TDEE Calculator · Calorie Deficit Calculator · Macro Calculator", references: "References", referencesText: "USDA FoodData Central (alcohol energy values); NIAAA Rethinking Drinking; WHO Global status report on alcohol and health; Atwater general factors.",
    q1: "How are alcohol calories calculated?", a1: "Multiply volume(ml) by ABV% for pure-alcohol ml, multiply by density 0.789 for grams, then by 7 kcal/g; sugary drinks add sugar(g) × 4 kcal.",
    q2: "Which drink has the lowest calories?", a2: "Plain spirits (no sugar) are concentrated but small in volume; sugary cocktails are highest. Low-alcohol beer or sugar-free sparkling is usually lower.",
    q3: "Why count sugar?", a3: "Many cocktails, liqueurs, and beers contain notable sugar at 4 kcal per gram, which clearly raises total calories, so this tool lists sugar calories separately.",
    q4: "How much can I drink per day?", a4: "Guidelines vary; a common cap is about 2 standard drinks/day for men and 1 for women. This tool only estimates calories, not safe-intake advice.",
    q5: "Is this suitable during pregnancy?", a5: "Alcohol is not recommended during pregnancy or lactation. This calorie estimate is not for planning drinking while pregnant; consult a professional.",
    q6: "Can this tool diagnose alcohol dependence or metabolic disease?", a6: "No. It is an educational estimate; consult professionals for drinking problems, liver disease, medication, or special conditions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function AlcoholCaloriesCalculator() {
  const { lang, setLang } = useLanguage();
  const [drink, setDrink] = useState<Drink>("beer");
  const [ml, setMl] = useState("355");
  const [abv, setAbv] = useState("5");
  const [sugar, setSugar] = useState("13");
  const t = ui[lang];

  const result = useMemo(() => {
    const v = Number(ml);
    const a = Number(abv);
    const s = Number(sugar);
    if (v <= 0 || a < 0) return null;
    const grams = v * (a / 100) * ETHANOL_DENSITY;
    const fromAlcohol = grams * KCAL_PER_G_ALCOHOL;
    const fromSugar = (s > 0 ? s : 0) * 4;
    const total = fromAlcohol + fromSugar;
    return { grams, fromAlcohol, fromSugar, total };
  }, [ml, abv, sugar]);

  const totalDisplay = result ? fmt(result.total, 0) : "—";
  const alcoholDisplay = result ? fmt(result.fromAlcohol, 0) : "—";
  const sugarDisplay = result ? fmt(result.fromSugar, 0) : "—";
  const gramsDisplay = result ? fmt(result.grams, 1) : "—";

  function fillStandard() { setDrink("beer"); setMl(String(presets.beer.ml)); setAbv(String(presets.beer.abv)); setSugar(String(presets.beer.sugar)); }
  function fillCut() { setDrink("cocktail"); setMl(String(presets.cocktail.ml)); setAbv(String(presets.cocktail.abv)); setSugar(String(presets.cocktail.sugar)); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{ml} ml</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{abv}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{sugar}g</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${drink === "beer" || drink === "wine" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={fillStandard}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${drink === "spirit" || drink === "cocktail" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={fillCut}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~150</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">~286</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={ml} onChange={(e) => { setDrink("custom"); setMl(e.target.value); }} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={abv} onChange={(e) => { setDrink("custom"); setAbv(e.target.value); }} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sugar} onChange={(e) => { setDrink("custom"); setSugar(e.target.value); }} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{gramsDisplay} g</div><div className="mt-1 text-xs text-slate-300">{abv}% ABV</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{alcoholDisplay}</p><p className="text-sm font-bold text-blue-700">kcal</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{sugarDisplay}</p><p className="text-sm font-bold text-emerald-700">kcal</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.estimatedTdee}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.gramsLabel}</div><p className="mt-2 text-3xl font-black text-orange-950">{gramsDisplay}</p><p className="text-sm font-bold text-orange-700">g</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">kcal</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="alcohol-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.totalLabel}</div><div className="mt-1 text-3xl font-black">{totalDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{gramsDisplay}g</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result && Number(ml) > 0 ? fmt(result.total / Number(ml), 2) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "BMR/TDEE", note: t.bmrStep }, { label: "Alcohol", note: t.deficitStep }, { label: "Deficit", note: t.trendStep }, { label: "Macro", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="alcohol-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
