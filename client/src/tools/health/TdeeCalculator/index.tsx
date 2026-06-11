// @profile B
// Profile B · Calculator-YMYL · TDEE 試產（依 BMR 黃金樣板複製）
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md
// Spec: ops/specs/tdee-calculator.md

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type UnitSystem = "metric" | "imperial";
type Sex = "male" | "female";
type TdeeActivity = "sedentary" | "light" | "moderate" | "active" | "veryActive" | "ultraActive";
type LocalText = { zh: string; en: string };

type ActivityInfo = {
  key: TdeeActivity;
  label: LocalText;
  factor: number;
  description: LocalText;
  tone: string;
};

type AffiliateItem = { label: LocalText; href: string };

const l = (value: LocalText, lang: Lang) => value[lang];
const formatActivityFactor = (item: { key: string; factor: number }) => item.key === "ultraActive" ? "2.0+" : String(item.factor);

const activityLevels: ActivityInfo[] = [
  { key: "sedentary",  label: { zh: "久坐",       en: "Sedentary" },         factor: 1.2,   description: { zh: "幾乎不運動，整天坐辦公或在家",                en: "Little or no exercise, mostly desk / home" },        tone: "from-sky-400 to-sky-600" },
  { key: "light",      label: { zh: "輕度活動",   en: "Lightly Active" },    factor: 1.375, description: { zh: "每週 1-3 天輕運動或散步",                  en: "Light exercise 1-3 days per week" },                  tone: "from-cyan-400 to-cyan-600" },
  { key: "moderate",   label: { zh: "中度活動",   en: "Moderately Active" }, factor: 1.55,  description: { zh: "每週 3-5 天中強度運動",                    en: "Moderate exercise 3-5 days per week" },               tone: "from-teal-400 to-teal-600" },
  { key: "active",     label: { zh: "活躍",       en: "Active" },            factor: 1.725, description: { zh: "每週 6-7 天高強度運動",                    en: "Hard exercise 6-7 days per week" },                   tone: "from-emerald-400 to-emerald-600" },
  { key: "veryActive", label: { zh: "極活躍",     en: "Very Active" },       factor: 1.9,   description: { zh: "每天高強度運動或體力勞動工作",              en: "Daily intense exercise or physical labor" },         tone: "from-amber-400 to-amber-600" },
  { key: "ultraActive", label: { zh: "超高強度", en: "Ultra High Intensity" }, factor: 2.0, description: { zh: "每日高強度訓練或體力勞動（×2.0+）",            en: "Daily high-intensity training or physical labor (×2.0+)" }, tone: "from-orange-500 to-red-700" },
];

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "智能體脂計", en: "Smart Body Composition Scale" }, href: "#affiliate-scale" },
  { label: { zh: "心率手環",   en: "Heart-rate Tracker" },           href: "#affiliate-tracker" },
  { label: { zh: "餐盒備餐套組", en: "Meal-prep Container Set" },    href: "#affiliate-mealprep" },
  { label: { zh: "巨量營養素手冊", en: "Macro Nutrition Handbook" }, href: "#affiliate-books" },
];

const ui = {
  zh: {
    badge: "健康 · 代謝 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    bmrShort: "BMR",
    tdeeShort: "TDEE",
    caloriesShort: "熱量",
    goalShort: "目標",
    calorieCycles: "熱量週期",
    reports: "報告",
    title: "TDEE 計算機 · 每日總消耗熱量完整指南",
    subtitle: "30 秒算出您每天到底該吃幾大卡",
    intro: "TDEE（Total Daily Energy Expenditure）是您身體一整天會消耗的熱量總和，等於 BMR（基礎代謝）乘以活動係數。本工具用 Mifflin-St Jeor 公式估算 BMR，再依 6 段活動量帶推估 TDEE，並給您「維持／減脂／增肌」三檔可執行目標。",
    trustNoteLabel: "信任提醒：",
    trustNote: "TDEE 為估算值（誤差約 ±10%），請以實測體重變化 2-4 週為準再校準；不可取代醫師或註冊營養師建議。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立 TDEE 範例",
    examplePreview: "TDEE 預覽",
    examplePerson: "成年男性 · 中度活動",
    fillExample: "一鍵填入範例",
    previewActivePath: "預覽活動等級路徑",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入資料並估算 TDEE",
    examplesHelper: "先用範例理解 BMR、TDEE 與活動係數，再改成自己的年齡、身高、體重與活動量。",
    metric: "公制",
    imperial: "英制",
    exampleCards: "範例卡",
    baselineExample: "標準久坐範例",
    activeExample: "高活動量示範", baselineExampleNote: "70kg · 175cm · 30 歲", activeExampleNote: "62kg · 168cm · 28 歲",
    flowDemo: "流程示範",
    calculator: "計算機",
    heightCm: "身高（cm）",
    weightKg: "體重（kg）",
    feet: "英尺",
    inches: "英寸",
    weightLb: "體重（lb）",
    age: "年齡",
    sex: "性別",
    male: "男性",
    female: "女性",
    activityLevel: "活動等級",
    resultCard: "TDEE 結果",
    bmrUnit: "kcal/天",
    activityTag: "活動等級",
    // Profile B 三格語意（canonical L6 markers）
    primaryValue: "主要數值",
    maintenanceTarget: "維持目標",
    actionTarget: "行動目標",
    estimatedTdee: "估算 TDEE",
    maintenance: "維持熱量",
    fatLossTarget: "減脂目標 (−500)",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六段活動量 TDEE 推估",
    tdeeMatrixNote: "下列卡片以目前 BMR 乘上不同活動倍數，協助比較生活型態（久坐 → 超高強度）對每日總消耗的影響。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把 TDEE 轉成可執行的飲食計畫",
    conversionNote: "此層示範如何把單一熱量數字轉為儲存、轉換與下一步行動，不實作帳號或付款流程。",
    progressInsight: "進度洞察卡",
    possibleTarget: "您的可能熱量目標",
    dailyGap: "每日差距",
    weeklyTrend: "每週趨勢",
    motivation: "動力卡",
    keepMomentum: "從 TDEE 數字走向穩定行動",
    saveShareJourney: "儲存 / 分享",
    nextActionLabel: "下一步行動",
    nextActionTitle: "把計算結果變成可執行的下一步",
    nextActionItem1: "把這個結果連結存到記事本或書籤",
    nextActionItem2: "把試算數字寫進您的月度規劃",
    nextActionItem3: "下個月回來重算，看數字有沒有改善",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    journeyTitle: "把今天的 TDEE 帶回家",
    journeyHint: "截圖、加書籤或分享給家人，下次回來就能直接接續比較。",
    decisionPath: "決策路徑",
    decisionTitle: "BMR → TDEE → 熱量 → 體重目標",
    bmrStep: "靜止代謝",
    tdeeStep: "每日總消耗",
    caloriesStep: "熱量規劃",
    goalStep: "體重目標",
    knowledge: "知識",
    knowledgeTitle: "TDEE 在熱量規劃中的角色",
    definition: "定義",
    definitionText: "TDEE = REE（靜止能量消耗）+ TEF（食物熱效應）+ 身體活動。NCBI 2023 DRI 報告指出活動量佔 TEE 的 15-50%。",
    formula: "公式",
    formulaText: "BMR 採 Mifflin-St Jeor 1990：男 = 10×kg + 6.25×cm − 5×age + 5；女 = 10×kg + 6.25×cm − 5×age − 161。TDEE = BMR × 活動係數（1.2 / 1.375 / 1.55 / 1.725 / 1.9 / 2.0+）。",
    limitations: "限制",
    limitationsText: "估算值有 ±10% 誤差；體脂率高、孕哺期、慢性病或藥物使用者誤差更大。建議追蹤實際體重 2-4 週後依變化調整熱量。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦資源",
    affiliateTitle: "熱量規劃與飲食追蹤相關商品",
    premiumTitle: "PRO 熱量規劃包",
    premiumText: "解鎖週期化熱量策略、Macro 拆分、體重目標模擬與個人化報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具提供教育與規劃用途，不能取代醫療診斷、營養治療或專業健康建議。",
    relatedTools: "相關工具",
    relatedToolsText: "BMI · BMR · 體脂率 · 理想體重 · 水分攝取 · 腰臀比",
    references: "參考資料",
    referencesText: "Mifflin-St Jeor 1990（Am J Clin Nutr）；Frankenfield 2005 系統性回顧；NIH/NAS 2023 Dietary Reference Intakes for Energy；Pontzer 2021 Science；Medscape 臨床計算器。",
    q1: "TDEE 和 BMR 有什麼不同？",
    a1: "BMR 是身體完全休息時的最低熱量需求；TDEE 加上活動消耗，是您「實際每天會燒掉的熱量」。",
    q2: "我該選哪個活動量等級？",
    a2: "不確定就選「輕度活動 1.375」，比較不會高估。2 週後依體重變化往上或往下調。",
    q3: "減脂該吃多少？",
    a3: "一般建議 TDEE − 500 kcal/天（每週減約 0.45 kg）。不要長期低於 BMR 以免代謝適應。",
    q4: "為什麼算出來和 App 不同？",
    a4: "App 可能用 Harris-Benedict 1919 舊式或 Katch-McArdle（含體脂）公式。本工具用 Mifflin-St Jeor 1990，現代精度最高。",
    q5: "多久該重算一次 TDEE？",
    a5: "體重每變動 ±5%，或活動量明顯改變（如開始/停止規律運動）時重算。",
    q6: "可以長期吃低於 BMR 嗎？",
    a6: "不建議。長期低於 BMR 容易造成代謝適應、肌肉流失、停滯期，請與註冊營養師討論。",
  },
  en: {
    badge: "Health · Metabolism · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    bmrShort: "BMR",
    tdeeShort: "TDEE",
    caloriesShort: "Calories",
    goalShort: "Goal",
    calorieCycles: "Calorie cycles",
    reports: "Reports",
    title: "TDEE Calculator · Daily Calorie Needs Made Clear",
    subtitle: "Find out exactly how many calories you burn each day",
    intro: "TDEE (Total Daily Energy Expenditure) is the total calories your body burns in 24 hours: BMR multiplied by an activity factor. This tool uses the Mifflin-St Jeor equation for BMR, then applies one of six activity bands to estimate TDEE — and gives you maintenance / fat-loss / muscle-gain targets you can act on.",
    trustNoteLabel: "Trust note:",
    trustNote: "TDEE is an estimate (~±10% error). Track real-world weight changes for 2–4 weeks before drawing conclusions. Not a substitute for advice from a physician or registered dietitian.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a TDEE example instantly",
    examplePreview: "TDEE preview",
    examplePerson: "Adult male · moderate",
    fillExample: "One-click fill example",
    previewActivePath: "Preview activity path",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter your data and estimate TDEE",
    examplesHelper: "Start with an example to understand BMR, TDEE, and activity factors, then replace it with your own age, height, weight, and activity level.",
    metric: "Metric",
    imperial: "Imperial",
    exampleCards: "Example cards",
    baselineExample: "Sedentary baseline example",
    activeExample: "High-activity demo", baselineExampleNote: "70kg · 175cm · 30", activeExampleNote: "62kg · 168cm · 28",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    heightCm: "Height (cm)",
    weightKg: "Weight (kg)",
    feet: "Feet",
    inches: "Inches",
    weightLb: "Weight (lb)",
    age: "Age",
    sex: "Sex",
    male: "Male",
    female: "Female",
    activityLevel: "Activity level",
    resultCard: "TDEE Result",
    bmrUnit: "kcal/day",
    activityTag: "Activity level",
    // Profile B canonical L6 markers
    primaryValue: "Primary Value",
    maintenanceTarget: "Maintenance Target",
    actionTarget: "Action Target",
    estimatedTdee: "Estimated TDEE",
    maintenance: "Maintenance calories",
    fatLossTarget: "Fat-loss target (−500)",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-band TDEE estimate",
    tdeeMatrixNote: "Each card multiplies the current BMR by an activity factor (sedentary → athlete) to compare how lifestyle changes daily energy expenditure.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn TDEE into an actionable nutrition plan",
    conversionNote: "This layer demonstrates retention, conversion, and next-step prompts without implementing accounts or payment flow.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Your possible calorie target",
    dailyGap: "Daily gap",
    weeklyTrend: "Weekly trend",
    motivation: "Motivation Card",
    keepMomentum: "Move from TDEE number to steady action",
    saveShareJourney: "Save / Share",
    nextActionLabel: "Next actions",
    nextActionTitle: "Turn this number into your next concrete step",
    nextActionItem1: "Save this result link to your notes or bookmarks",
    nextActionItem2: "Write the numbers into your monthly plan",
    nextActionItem3: "Come back next month and recalculate to see progress",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    journeyTitle: "Take today's TDEE home",
    journeyHint: "Screenshot, bookmark, or share with family — pick up where you left off next time.",
    decisionPath: "Decision Path",
    decisionTitle: "BMR → TDEE → Calories → Weight Goal",
    bmrStep: "Resting metabolism",
    tdeeStep: "Daily expenditure",
    caloriesStep: "Calorie planning",
    goalStep: "Weight goal",
    knowledge: "Knowledge",
    knowledgeTitle: "Where TDEE fits in calorie planning",
    definition: "Definition",
    definitionText: "TDEE = REE (resting energy expenditure) + TEF (thermic effect of food) + physical activity. NIH/NAS 2023 DRI report shows physical activity accounts for 15–50% of TEE.",
    formula: "Formula",
    formulaText: "BMR uses Mifflin-St Jeor 1990: Male = 10×kg + 6.25×cm − 5×age + 5; Female = 10×kg + 6.25×cm − 5×age − 161. TDEE = BMR × activity factor (1.2 / 1.375 / 1.55 / 1.725 / 1.9 / 2.0+).",
    limitations: "Limitations",
    limitationsText: "Estimates carry ~±10% error and are larger for high body-fat, pregnancy/lactation, chronic disease, or medication users. Track real weight for 2–4 weeks and adjust calories from observed change.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Affiliate Resources",
    affiliateTitle: "Calorie planning and nutrition tracking gear",
    premiumTitle: "PRO Calorie Planning Pack",
    premiumText: "Unlock periodized calorie strategy, macro split, weight-goal simulation, and personalized reports.",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional health advice.",
    relatedTools: "Related Tools",
    relatedToolsText: "BMI · BMR · Body Fat % · Ideal Weight · Water Intake · Waist-to-Hip Ratio",
    references: "References",
    referencesText: "Mifflin MD, St Jeor ST 1990 (Am J Clin Nutr); Frankenfield 2005 systematic review; NIH/NAS 2023 Dietary Reference Intakes for Energy; Pontzer 2021 (Science); Medscape clinical calculator.",
    q1: "What is the difference between TDEE and BMR?",
    a1: "BMR is the minimum calories your body needs at complete rest. TDEE adds activity, so it's the calories you actually burn in a real day.",
    q2: "Which activity level should I pick?",
    a2: "If unsure, pick \"Lightly Active 1.375\" — it tends to under-estimate, which is safer. Adjust up or down after tracking weight for 2 weeks.",
    q3: "How much should I eat to lose fat?",
    a3: "A common starting point is TDEE − 500 kcal/day (~0.45 kg/week of loss). Avoid eating below BMR long-term to prevent metabolic adaptation.",
    q4: "Why does another app give a different number?",
    a4: "Some apps still use the older Harris-Benedict 1919 equation, or Katch-McArdle which needs body-fat %. This tool uses Mifflin-St Jeor 1990 — the most accurate modern predictor.",
    q5: "How often should I recalculate TDEE?",
    a5: "Recalculate when body weight changes by ±5%, or when activity level shifts noticeably (e.g. starting/stopping a regular exercise routine).",
    q6: "Is it safe to eat below my BMR?",
    a6: "Not recommended long-term. Prolonged intake below BMR can cause metabolic adaptation, muscle loss, and stalled progress. Consult a registered dietitian.",
  },
} as const;

function formatKcal(value: number): string {
  return Number.isFinite(value) ? Math.round(value).toLocaleString() : "—";
}

function calculateBmr(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
}

function activityByKey(key: TdeeActivity): ActivityInfo {
  return activityLevels.find((item) => item.key === key) ?? activityLevels[2];
}

const faqKeys = [
  ["q1", "a1"],
  ["q2", "a2"],
  ["q3", "a3"],
  ["q4", "a4"],
  ["q5", "a5"],
  ["q6", "a6"],
] as const;

export default function TdeeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("70");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("154");
  const [activity, setActivity] = useState<TdeeActivity>("moderate");

  const t = ui[lang];
  const activeActivity = activityByKey(activity);

  const calculation = useMemo(() => {
    const ageValue = Number(age);
    const heightValue = unitSystem === "metric" ? Number(heightCm) : (Number(feet) * 12 + Number(inches)) * 2.54;
    const weightValue = unitSystem === "metric" ? Number(weightKg) : Number(pounds) * 0.453592;

    if (!ageValue || !heightValue || !weightValue || ageValue <= 0 || heightValue <= 0 || weightValue <= 0) return null;

    const bmr = calculateBmr(weightValue, heightValue, ageValue, sex);
    const tdee = bmr * activeActivity.factor;
    const matrix = activityLevels.map((item) => ({ ...item, tdee: bmr * item.factor }));

    return {
      bmr,
      tdee,
      maintenance: tdee,
      fatLossTarget: tdee - 500,
      weeklyDeficit: 500 * 7,
      matrix,
    };
  }, [activeActivity.factor, age, feet, heightCm, inches, pounds, sex, unitSystem, weightKg]);

  function fillBaselineExample() {
    setUnitSystem("metric");
    setSex("male");
    setAge("30");
    setHeightCm("175");
    setWeightKg("70");
    setActivity("moderate");
  }

  function fillActiveExample() {
    setUnitSystem("metric");
    setSex("female");
    setAge("28");
    setHeightCm("168");
    setWeightKg("62");
    setActivity("active");
  }

  const bmrDisplay = calculation ? formatKcal(calculation.bmr) : "—";
  const tdeeDisplay = calculation ? formatKcal(calculation.tdee) : "—";
  const fatLossDisplay = calculation ? formatKcal(calculation.fatLossTarget) : "—";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}

      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span>
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-emerald-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div>
            </section>

            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p>
              <h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2>
              <div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white">
                <div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div>
                <div className="mt-1 text-5xl font-black">1,649</div>
                <div className="text-sm font-bold text-emerald-100">{t.bmrUnit}</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">30</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weightKg}</div><div className="font-black">70</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.heightCm}</div><div className="font-black">175</div></div>
              </div>
              <button onClick={fillBaselineExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-700">{t.fillExample}</button>
              <button onClick={fillActiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewActivePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("metric")}>{t.metric}</button>
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("imperial")}>{t.imperial}</button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black">{t.exampleCards}</h3>
              <div className="mt-4 space-y-3">
                <button onClick={fillBaselineExample} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left transition hover:border-emerald-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">1,649</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button>
                <button onClick={fillActiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black">{t.calculator}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {unitSystem === "metric" ? (
                  <>
                    <label className="block text-sm font-black text-slate-700">{t.heightCm}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} /></label>
                    <label className="block text-sm font-black text-slate-700">{t.weightKg}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} /></label>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-black text-slate-700">{t.feet}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={feet} onChange={(e) => setFeet(e.target.value)} /></label>
                    <label className="block text-sm font-black text-slate-700">{t.inches}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={inches} onChange={(e) => setInches(e.target.value)} /></label>
                    <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.weightLb}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={pounds} onChange={(e) => setPounds(e.target.value)} /></label>
                  </>
                )}
                <label className="block text-sm font-black text-slate-700">{t.age}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.sex}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="male">{t.male}</option><option value="female">{t.female}</option></select></label>
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.activityLevel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={activity} onChange={(e) => setActivity(e.target.value as TdeeActivity)}>{activityLevels.map((item) => <option key={item.key} value={item.key}>{l(item.label, lang)} × {formatActivityFactor(item)}</option>)}</select></label>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className={`h-5 bg-gradient-to-r ${activeActivity.tone}`} />
            <div className="p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p>
              <div className="mt-4 flex items-start justify-between gap-5">
                <div><div className="text-7xl font-black tracking-tight text-slate-950">{tdeeDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.bmrUnit}</div></div>
                <div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.activityTag}</div><div className="mt-1 text-xl font-black">{l(activeActivity.label, lang)}</div><div className="mt-1 text-xs text-slate-300">× {formatActivityFactor(activeActivity)}</div></div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div>
                  <div className="mt-1 text-xs font-black uppercase text-blue-700">{t.bmrShort}</div>
                  <p className="mt-2 text-3xl font-black text-blue-950">{bmrDisplay}</p>
                  <p className="text-sm font-bold text-blue-700">{t.bmrUnit}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div>
                  <div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.maintenance}</div>
                  <p className="mt-2 text-3xl font-black text-emerald-950">{calculation ? formatKcal(calculation.maintenance) : "—"}</p>
                  <p className="text-sm font-bold text-emerald-700">{t.bmrUnit}</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.actionTarget}</div>
                  <div className="mt-1 text-xs font-black uppercase text-orange-700">{t.fatLossTarget}</div>
                  <p className="mt-2 text-3xl font-black text-orange-950">{fatLossDisplay}</p>
                  <p className="text-sm font-bold text-orange-700">{t.bmrUnit}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p>
            <h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {(calculation?.matrix ?? activityLevels.map((item) => ({ ...item, tdee: 0 }))).map((item) => (
                <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeActivity.key ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">× {formatActivityFactor(item)}</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.description, lang)}</p>
                  <p className="mt-3 text-2xl font-black text-slate-950">{formatKcal(item.tdee)} <span className="text-sm text-slate-500">{t.bmrUnit}</span></p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <AdSenseWrapper showAds={true} adSlot="tdee-result-intelligence" adFormat="horizontal" className="my-2" />

        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p>
          <h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          {/* L9 · Emotion+Conversion 上排 · Progress + Motivation · lg:grid-cols-[1_0.9] */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">TDEE</div><div className="mt-1 text-3xl font-black">{tdeeDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">500</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{calculation ? formatKcal(calculation.weeklyDeficit) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrShort, t.tdeeShort, t.caloriesShort, t.goalShort].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          {/* L10 · Emotion+Conversion 下排 · Save / Share Journey · lg:grid-cols-[1_0.8] */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p>
              <h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p>
              <h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3>
              <ul className="mt-3 space-y-2">
                <li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li>
                <li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li>
                <li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li>
              </ul>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => { if (typeof navigator !== "undefined" && navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-slate-800">{t.shareLinkBtn}</button>
                <button type="button" onClick={() => { const sd = { title: document.title, url: window.location.href }; const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) { nav.share(sd).catch(() => {}); } else if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">{t.shareNativeBtn}</button>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p>
          <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {[{ label: t.bmrShort, note: t.bmrStep }, { label: t.tdeeShort, note: t.tdeeStep }, { label: t.caloriesShort, note: t.caloriesStep }, { label: t.goalShort, note: t.goalStep }].map((node, index) => (
              <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>
            ))}
          </div>
        </section>

        {/* L14 · Knowledge + FAQ 並排 · lg:grid-cols-[1fr_0.9fr] */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div></div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div>          </div>
        </section>


        {/* L14-AdSlot · FAQ 後獨立廣告位 */}
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <AdSlot slot="tdee-faq" position="inline" />
        </section>

        {/* L15-L16 · 推薦商品 + Premium Gate 並排 */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
          {/* L15-Affiliate */}
          <section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p>
                              <h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2>
                              <div className="mt-5 grid gap-4 md:grid-cols-4">
                                {affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950 transition hover:border-emerald-500 hover:bg-emerald-100">{l(item.label, lang)}</a>)}
                              </div>
                              <p className="mt-3 text-xs text-emerald-700">
                                {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}
                              </p>
                            </section>

          {/* L16-PremiumGate */}
          <PremiumGate plan="PRO">
            <article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7">{/* L16-PremiumGate */}
              <h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2>
                                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p>
                                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                                    {[t.bmrShort, t.tdeeShort, t.calorieCycles, t.reports].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}
                                  </div>
            </article>
          </PremiumGate>
        </section>


        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
            <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div>
            <div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
