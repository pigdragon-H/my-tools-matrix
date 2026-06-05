// @profile B
// Profile B · Calculator-YMYL · BMR 為 17-Layer 黃金樣板 #2
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type UnitSystem = "metric" | "imperial";
type Sex = "male" | "female";
type BmrActivity = "sedentary" | "light" | "moderate" | "active" | "veryActive" | "ultraActive";
type LocalText = { zh: string; en: string };

type ActivityInfo = {
  key: BmrActivity;
  label: LocalText;
  factor: number;
  description: LocalText;
  tone: string;
};

type AffiliateItem = { label: LocalText; href: string };

const l = (value: LocalText, lang: Lang) => value[lang];
const formatActivityFactor = (item: { key: string; factor: number }) => item.key === "ultraActive" ? "2.0+" : String(item.factor);

const activityLevels: ActivityInfo[] = [
  { key: "sedentary", label: { zh: "久坐", en: "Sedentary" }, factor: 1.2, description: { zh: "很少或不運動", en: "Little or no exercise" }, tone: "from-slate-400 to-slate-600" },
  { key: "light", label: { zh: "輕度活動", en: "Lightly Active" }, factor: 1.375, description: { zh: "每週輕度運動1-3天", en: "Light exercise 1-3 days per week" }, tone: "from-sky-400 to-blue-600" },
  { key: "moderate", label: { zh: "中度活動", en: "Moderately Active" }, factor: 1.55, description: { zh: "每週中度運動3-5天", en: "Moderate exercise 3-5 days per week" }, tone: "from-emerald-400 to-green-600" },
  { key: "active", label: { zh: "積極活動", en: "Very Active" }, factor: 1.725, description: { zh: "每週高強度運動6-7天", en: "Hard exercise 6-7 days per week" }, tone: "from-orange-400 to-red-600" },
  { key: "veryActive", label: { zh: "極度活動", en: "Extra Active" }, factor: 1.9, description: { zh: "體力勞動或兩日訓練", en: "Physical labor or two-a-day training" }, tone: "from-fuchsia-500 to-purple-700" },
  { key: "ultraActive", label: { zh: "超高強度", en: "Ultra High Intensity" }, factor: 2.0, description: { zh: "每日高強度訓練或體力勞動（×2.0+）", en: "Daily high-intensity training or physical labor (×2.0+)" }, tone: "from-violet-500 to-indigo-700" },
];

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "智能體重計", en: "Smart Scale" }, href: "#affiliate-scale" },
  { label: { zh: "健身追蹤器", en: "Fitness Tracker" }, href: "#affiliate-tracker" },
  { label: { zh: "蛋白質補充品", en: "Protein Supplements" }, href: "#affiliate-protein" },
  { label: { zh: "代謝健康書籍", en: "Metabolism Books" }, href: "#affiliate-books" },
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
    title: "BMR 計算機 · 基礎代謝率完整指南",
    subtitle: "了解你的基礎代謝率",
    intro: "BMR 代表身體在靜止狀態下維持呼吸、心跳、體溫與器官運作所需的最低熱量。這個工具使用 Mifflin-St Jeor 公式估算 BMR，並依活動等級推估 TDEE，協助你把代謝數字轉成熱量規劃與體重目標。",
    trustNoteLabel: "注意事項：",
    trustNote: "BMR 是靜止狀態下的熱量消耗估算，不代表實際燃燒量，個人差異因肌肉量、年齡、荷爾蒙而異。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立 BMR 範例",
    examplePreview: "BMR 預覽",
    examplePerson: "成年男性",
    fillExample: "一鍵填入範例",
    previewActivePath: "預覽活動等級路徑",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入資料並估算代謝",
    examplesHelper: "先用範例理解 BMR、TDEE 與活動係數，再改成自己的年齡、身高、體重與活動量。",
    metric: "公制",
    imperial: "英制",
    exampleCards: "範例卡",
    baselineExample: "標準代謝範例",
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
    resultCard: "BMR 結果",
    bmrUnit: "kcal/天",
    activityTag: "活動等級",
    // Profile B 三格語意（canonical L6 markers）
    primaryValue: "主要數值",
    maintenanceTarget: "維持目標",
    actionTarget: "行動目標",
    estimatedTdee: "活動後每日消耗",
    maintenance: "維持熱量",
    fatLossTarget: "減脂目標",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "以 BMR 換算六種活動消耗",
    tdeeMatrixNote: "下列六張卡片以目前 BMR 乘上活動係數，換算不同生活型態下的每日消耗；這是 BMR 的活動換算結果，不是 TDEE 工具頁。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把 BMR 轉成可執行的健康計畫",
    conversionNote: "此層示範如何把單一代謝數字轉為留存、轉換與下一步行動，不實作帳號或付款流程。",
    progressInsight: "進度洞察卡",
    possibleTarget: "你的可能熱量目標",
    dailyGap: "每日差距",
    weeklyTrend: "每週趨勢",
    motivation: "動力卡",
    keepMomentum: "從代謝數字走向穩定行動",
    saveShareJourney: "儲存 / 分享",
    nextActionLabel: "下一步行動",
    nextActionTitle: "把計算結果變成可執行的下一步",
    nextActionItem1: "把這個結果連結存到記事本或書籤",
    nextActionItem2: "把試算數字寫進你的月度規劃",
    nextActionItem3: "下個月回來重算，看數字有沒有改善",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    journeyTitle: "把今天的 BMR 帶回家",
    journeyHint: "截圖、加書籤或分享給家人，下次回來就能直接接續比較。",
    decisionPath: "決策路徑",
    decisionTitle: "BMR → 活動消耗 → 熱量 → 體重目標",
    bmrStep: "靜止代謝",
    tdeeStep: "活動後消耗",
    caloriesStep: "熱量規劃",
    goalStep: "體重目標",
    knowledge: "知識",
    knowledgeTitle: "BMR 在健康宇宙中的意義",
    definition: "定義",
    definitionText: "BMR 是身體在休息、清醒、安靜狀態下維持基本生命機能所需的能量。",
    formula: "公式",
    formulaText: "男性 BMR = 10 × 體重kg + 6.25 × 身高cm − 5 × 年齡 + 5。女性 BMR = 10 × 體重kg + 6.25 × 身高cm − 5 × 年齡 − 161。",
    limitations: "限制",
    limitationsText: "BMR 不等於實際每日消耗，也不直接反映肌肉量、荷爾蒙、疾病、藥物或長期節食造成的代謝調整。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦資源",
    affiliateTitle: "代謝與健康管理相關商品",
    premiumTitle: "PRO 代謝計畫包",
    premiumText: "解鎖週期化熱量策略、TDEE 追蹤、體重目標模擬與個人化報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具提供教育與規劃用途，不能取代醫療診斷、營養治療或專業健康建議。",
    relatedTools: "相關工具",
    relatedToolsText: "TDEE · 熱量計算 · 體脂率 · 理想體重 · 水分攝取 · 腰臀比",
    references: "參考資料",
    referencesText: "Mifflin-St Jeor 方程式、臨床營養能量需求估算，以及活動係數常用分類。",
    q1: "BMR 是什麼意思？",
    a1: "BMR 是基礎代謝率，表示身體在休息狀態下維持基本生命功能所需的熱量。",
    q2: "BMR 和 TDEE 有什麼不同？",
    a2: "BMR 是靜止能量需求；TDEE 是 BMR 乘上活動係數後的每日總能量消耗。",
    q3: "我的 BMR 越高越好嗎？",
    a3: "不一定。較高 BMR 可能與體型、肌肉量或活動狀態有關，但健康評估需要更多指標。",
    q4: "年齡會影響 BMR 嗎？",
    a4: "會。年齡增加通常會使 BMR 下降，尤其當肌肉量也下降時更明顯。",
    q5: "肌肉量和 BMR 有關係嗎？",
    a5: "有。肌肉組織消耗能量，較高瘦體重通常與較高 BMR 相關。",
    q6: "BMR 計算出來之後該怎麼用？",
    a6: "先用 BMR 估算 TDEE，再依減脂、維持或增重目標規劃每日熱量。",
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
    title: "BMR Calculator · Complete Metabolic Assessment",
    subtitle: "Understand your Basal Metabolic Rate",
    intro: "BMR is the minimum energy your body needs at rest to maintain breathing, heartbeat, temperature, and organ function. This tool uses the Mifflin-St Jeor equation to estimate BMR, then maps activity levels into TDEE for calorie planning and weight goals.",
    trustNoteLabel: "Note:",
    trustNote: "BMR estimates resting calorie needs. Actual expenditure varies by muscle mass, age, and hormonal factors.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a BMR example instantly",
    examplePreview: "BMR preview",
    examplePerson: "Adult male",
    fillExample: "One-click fill example",
    previewActivePath: "Preview activity path",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter data and estimate metabolism",
    examplesHelper: "Start with an example to understand BMR, TDEE, and activity factors, then replace it with your own age, height, weight, and activity level.",
    metric: "Metric",
    imperial: "Imperial",
    exampleCards: "Example cards",
    baselineExample: "Baseline metabolism example",
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
    resultCard: "BMR Result",
    bmrUnit: "kcal/day",
    activityTag: "Activity level",
    // Profile B canonical L6 markers
    primaryValue: "Primary Value",
    maintenanceTarget: "Maintenance Target",
    actionTarget: "Action Target",
    estimatedTdee: "Activity-adjusted daily burn",
    maintenance: "Maintenance calories",
    fatLossTarget: "Fat-loss target",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six activity-adjusted BMR estimates",
    tdeeMatrixNote: "Each of the six cards multiplies the current BMR by an activity factor to estimate daily burn under different lifestyles. This is the BMR tool’s activity adjustment, not the TDEE tool page.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn BMR into an actionable health plan",
    conversionNote: "This layer demonstrates retention, conversion, and next-step prompts without implementing accounts or payment flow.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Your possible calorie target",
    dailyGap: "Daily gap",
    weeklyTrend: "Weekly trend",
    motivation: "Motivation Card",
    keepMomentum: "Move from metabolism number to steady action",
    saveShareJourney: "Save / Share",
    nextActionLabel: "Next actions",
    nextActionTitle: "Turn this number into your next concrete step",
    nextActionItem1: "Save this result link to your notes or bookmarks",
    nextActionItem2: "Write the numbers into your monthly plan",
    nextActionItem3: "Come back next month and recalculate to see progress",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    journeyTitle: "Take today's BMR home",
    journeyHint: "Screenshot, bookmark, or share with family — pick up where you left off next time.",
    decisionPath: "Decision Path",
    decisionTitle: "BMR → Activity burn → Calories → Weight Goal",
    bmrStep: "Resting metabolism",
    tdeeStep: "Activity burn",
    caloriesStep: "Calorie planning",
    goalStep: "Weight goal",
    knowledge: "Knowledge",
    knowledgeTitle: "What BMR means in the Health universe",
    definition: "Definition",
    definitionText: "BMR is the energy required to maintain basic life functions while resting, awake, and calm.",
    formula: "Formula",
    formulaText: "Male BMR = 10 × weight kg + 6.25 × height cm − 5 × age + 5. Female BMR = 10 × weight kg + 6.25 × height cm − 5 × age − 161.",
    limitations: "Limitations",
    limitationsText: "BMR is not the same as actual daily expenditure and does not directly capture muscle mass, hormones, disease, medication, or metabolic adaptation from long-term dieting.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Affiliate Resources",
    affiliateTitle: "Metabolism and health management products",
    premiumTitle: "PRO Metabolic Planning Pack",
    premiumText: "Unlock periodized calorie strategy, TDEE tracking, weight-goal simulation, and personalized reports.",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional health advice.",
    relatedTools: "Related Tools",
    relatedToolsText: "TDEE · Calories Calculator · Body Fat · Ideal Weight · Water Intake · Waist-to-Hip Ratio",
    references: "References",
    referencesText: "Mifflin-St Jeor equation, clinical nutrition energy estimation, and common physical activity factor categories.",
    q1: "What does BMR mean?",
    a1: "BMR means Basal Metabolic Rate: the calories your body needs at rest for basic life functions.",
    q2: "What is the difference between BMR and TDEE?",
    a2: "BMR is resting energy need. TDEE is BMR multiplied by an activity factor to estimate total daily expenditure.",
    q3: "Is a higher BMR better?",
    a3: "Not always. A higher BMR can relate to size, muscle mass, or activity, but health assessment needs more context.",
    q4: "Does age affect BMR?",
    a4: "Yes. BMR often decreases with age, especially when muscle mass also declines.",
    q5: "Does muscle mass affect BMR?",
    a5: "Yes. Muscle tissue uses energy, so higher lean mass is usually associated with higher BMR.",
    q6: "How do I use my BMR result?",
    a6: "Use BMR to estimate TDEE, then plan calories for fat loss, maintenance, or weight gain.",
  },
} as const;

function formatKcal(value: number): string {
  return Number.isFinite(value) ? Math.round(value).toLocaleString() : "—";
}

function calculateBmr(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
}

function activityByKey(key: BmrActivity): ActivityInfo {
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

export default function BmrCalculator() {
  const { lang, setLang } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("70");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("154");
  const [activity, setActivity] = useState<BmrActivity>("moderate");

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
      fatLossTarget: tdee - 400,
      weeklyDeficit: 400 * 7,
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
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.activityLevel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={activity} onChange={(e) => setActivity(e.target.value as BmrActivity)}>{activityLevels.map((item) => <option key={item.key} value={item.key}>{l(item.label, lang)} × {formatActivityFactor(item)}</option>)}</select></label>
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
                <div><div className="text-7xl font-black tracking-tight text-slate-950">{bmrDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.bmrUnit}</div></div>
                <div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.activityTag}</div><div className="mt-1 text-xl font-black">{l(activeActivity.label, lang)}</div><div className="mt-1 text-xs text-slate-300">× {formatActivityFactor(activeActivity)}</div></div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div>
                  <div className="mt-1 text-xs font-black uppercase text-blue-700">{t.estimatedTdee}</div>
                  <p className="mt-2 text-3xl font-black text-blue-950">{tdeeDisplay}</p>
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

        <AdSenseWrapper showAds={true} adSlot="bmr-result-intelligence" adFormat="horizontal" className="my-2" />

        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p>
          <h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          {/* L9 · Emotion+Conversion 上排 · Progress + Motivation · lg:grid-cols-[1_0.9] */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">BMR</div><div className="mt-1 text-3xl font-black">{bmrDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">400</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{calculation ? formatKcal(calculation.weeklyDeficit) : "—"}</div></div></div></article>
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
          <AdSlot slot="bmr-faq" position="inline" />
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
