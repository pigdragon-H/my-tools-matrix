
import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type UnitSystem = "metric" | "imperial";
type Lang = "zh" | "en";
type BmiCategory = "underweight" | "normal" | "overweight" | "obesity1" | "obesity2" | "obesity3";
type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: BmiCategory;
  label: LocalText;
  range: LocalText;
  band: LocalText;
  tone: string;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
  tools: LocalText[];
};

const l = (value: LocalText, lang: Lang) => value[lang];

const categoryInfo: CategoryInfo[] = [
  {
    key: "underweight",
    label: { zh: "偏輕", en: "Underweight" },
    range: { zh: "低於 18.5", en: "Below 18.5" },
    band: { zh: "低 BMI 區間", en: "Low BMI band" },
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "依據成人標準 BMI 分類，體重相對身高可能偏低。", en: "Weight may be low relative to height for standard adult BMI categories." },
    risks: { zh: "可能原因：營養不足、疲勞、抵抗力下降或非預期體重減輕。BMI 無法診斷這些狀況。", en: "Possible undernutrition, fatigue, reduced resilience, or unintended weight loss context. BMI does not diagnose these conditions." },
    actions: { zh: "建議檢視飲食營養、近期體重變化、食慾、活動量與症狀。若體重持續偏低且原因不明，請尋求專業協助。", en: "Review nutrition, recent weight change, appetite, activity, and symptoms. Seek professional guidance if low BMI is unexplained or persistent." },
    nextTool: { zh: "BMR 計算機", en: "BMR Calculator" },
    tools: [{ zh: "BMR 計算機", en: "BMR Calculator" }, { zh: "熱量計算機", en: "Calories Calculator" }, { zh: "理想體重指南", en: "Ideal Weight Guide" }],
  },
  {
    key: "normal",
    label: { zh: "正常", en: "Normal" },
    range: { zh: "18.5–24.9", en: "18.5–24.9" },
    band: { zh: "健康篩查區間", en: "Healthy screening band" },
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "BMI 在成人標準健康體重篩查範圍內。", en: "BMI is within the standard adult healthy weight screening range." },
    risks: { zh: "族群層面風險通常較低，但 BMI 無法保證代謝健康或理想體組成。", en: "Population-level risk is generally lower, but BMI does not guarantee metabolic health or ideal body composition." },
    actions: { zh: "維持均衡營養、規律運動、充足睡眠與定期健康檢查。可搭配體組成工具進行更深入評估。", en: "Maintain balanced nutrition, movement, sleep, hydration, and preventive care. Use body composition tools for deeper context." },
    nextTool: { zh: "TDEE 計算機", en: "TDEE Calculator" },
    tools: [{ zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "體脂率計算機", en: "Body Fat Calculator" }, { zh: "飲水量計算機", en: "Water Intake Calculator" }],
  },
  {
    key: "overweight",
    label: { zh: "過重", en: "Overweight" },
    range: { zh: "25.0–29.9", en: "25.0–29.9" },
    band: { zh: "偏高 BMI 區間", en: "Elevated BMI band" },
    tone: "from-yellow-300 via-orange-300 to-orange-500",
    meaning: { zh: "體重可能超過標準身高對應的健康範圍。", en: "Weight may be above the standard healthy range for height." },
    risks: { zh: "可能與較高的心血管代謝風險相關，具體取決於體組成與脂肪分佈。", en: "May be associated with higher cardiometabolic risk, depending on body composition and fat distribution." },
    actions: { zh: "建議先計算 BMR、TDEE、熱量規劃、腰臀比與體脂，再做體重管理決策。", en: "Check BMR, TDEE, calorie planning, waist ratio, and body fat context before making weight-management decisions." },
    nextTool: { zh: "BMR 計算機", en: "BMR Calculator" },
    tools: [{ zh: "BMR 計算機", en: "BMR Calculator" }, { zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "熱量計算機", en: "Calories Calculator" }, { zh: "體脂率計算機", en: "Body Fat Calculator" }],
  },
  {
    key: "obesity1",
    label: { zh: "肥胖 I 級", en: "Obesity I" },
    range: { zh: "30.0–34.9", en: "30.0–34.9" },
    band: { zh: "高 BMI 區間", en: "High BMI band" },
    tone: "from-orange-400 via-red-400 to-red-600",
    meaning: { zh: "BMI 落於成人肥胖第一級。", en: "BMI falls into Obesity Class I for adults." },
    risks: { zh: "族群層面與高血壓、胰島素阻抗、睡眠呼吸中止及關節壓力的發生機率上升相關。", en: "Associated at population level with increased likelihood of hypertension, insulin resistance, sleep apnea, and joint stress." },
    actions: { zh: "建議尋求專業指導，並搭配 BMR、TDEE 與體組成工具進行評估。", en: "Consider professional guidance and use BMR, TDEE, and body composition tools for context." },
    nextTool: { zh: "BMR 計算機", en: "BMR Calculator" },
    tools: [{ zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "熱量計算機", en: "Calories Calculator" }, { zh: "體脂率計算機", en: "Body Fat Calculator" }],
  },
  {
    key: "obesity2",
    label: { zh: "肥胖 II 級", en: "Obesity II" },
    range: { zh: "35.0–39.9", en: "35.0–39.9" },
    band: { zh: "極高 BMI 區間", en: "Very high BMI band" },
    tone: "from-red-500 via-rose-600 to-purple-700",
    meaning: { zh: "BMI 落於成人肥胖第二級。", en: "BMI falls into Obesity Class II for adults." },
    risks: { zh: "與族群層面體重相關健康風險升高有關。", en: "Associated with higher population-level weight-related health risks." },
    actions: { zh: "在進行重大生活方式或體重管理改變前，建議先接受專業評估。", en: "Professional assessment is recommended before major lifestyle or weight-management changes." },
    nextTool: { zh: "TDEE 計算機", en: "TDEE Calculator" },
    tools: [{ zh: "BMR 計算機", en: "BMR Calculator" }, { zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "熱量計算機", en: "Calories Calculator" }, { zh: "體脂率計算機", en: "Body Fat Calculator" }],
  },
  {
    key: "obesity3",
    label: { zh: "肥胖 III 級", en: "Obesity III" },
    range: { zh: "40.0 及以上", en: "40.0 and above" },
    band: { zh: "最高 BMI 區間", en: "Highest BMI band" },
    tone: "from-red-700 via-purple-800 to-slate-950",
    meaning: { zh: "BMI 落於成人肥胖第三級。", en: "BMI falls into Obesity Class III for adults." },
    risks: { zh: "與族群層面極高的體重相關健康風險有關。", en: "Associated with very high population-level weight-related health risk." },
    actions: { zh: "請尋求合格醫療專業人員的指導。計算工具可提供參考，但無法取代專業醫療照護。", en: "Seek qualified medical guidance. Calculators can provide context but should not replace professional care." },
    nextTool: { zh: "臨床指導 + BMR 計算機", en: "Clinical guidance + BMR Calculator" },
    tools: [{ zh: "BMR 計算機", en: "BMR Calculator" }, { zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "體脂率計算機", en: "Body Fat Calculator" }],
  },
];

const faqItems: { question: LocalText; answer: LocalText }[] = [
  { question: { zh: "BMI 是診斷工具嗎？", en: "Is BMI a diagnosis?" }, answer: { zh: "不是。BMI 是篩查工具，無法診斷健康狀況、疾病或體脂率。", en: "No. BMI is a screening tool and does not diagnose health status, disease, or body fat percentage." } },
  { question: { zh: "健康的 BMI 是多少？", en: "What is a healthy BMI?" }, answer: { zh: "對大多數成人來說，18.5–24.9 通常被歸類為健康 BMI 範圍。", en: "For most adults, 18.5–24.9 is commonly categorized as the healthy BMI range." } },
  { question: { zh: "運動員的 BMI 會失真嗎？", en: "Can athletes have misleading BMI?" }, answer: { zh: "會。高肌肉量可能使 BMI 偏高，即使體脂並未升高。", en: "Yes. High muscle mass can raise BMI even when body fat is not elevated." } },
  { question: { zh: "BMI 適用於兒童嗎？", en: "Is BMI valid for children?" }, answer: { zh: "兒童和青少年需要依年齡與性別的百分位解讀，不適用成人分類標準。", en: "Children and teens need age- and sex-specific percentile interpretation, not adult categories." } },
  { question: { zh: "懷孕期間可以用 BMI 嗎？", en: "Can BMI be used during pregnancy?" }, answer: { zh: "懷孕需要臨床情境評估，標準成人 BMI 解讀並不足夠。", en: "Pregnancy requires clinical context. Standard adult BMI interpretation is not enough." } },
  { question: { zh: "看完 BMI 後我該做什麼？", en: "What should I check after BMI?" }, answer: { zh: "BMR、TDEE、熱量計算、體脂率與腰圍等指標可提供更多情境參考。", en: "BMR, TDEE, Calories, Body Fat, and waist-based metrics can provide more context." } },
];

const ui = {
  zh: {
    badge: "健康 · 生物指標 · Gold Tool",
    title: "BMI 計算機・完整健康評估",
    subtitle: "BMI 計算機引導體驗",
    intro: "透過 BMI 作為健康篩檢起點，快速計算身體質量指數、理解風險訊號，並延伸到 BMR、TDEE、熱量與體脂等下一步工具。",
    trustNoteLabel: "信任提醒：",
    trustNote: "BMI 是篩查工具，不是診斷。它不能直接測量體脂、運動員體組成、懷孕情境或兒童百分位狀態。",
    quickActionCard: "快速範例卡",
    tryCommonAdultExample: "試用常見成人範例",
    bmiPreview: "BMI 預覽",
    example: "範例",
    adultMale: "成年男性",
    weight: "體重",
    height: "身高",
    oneClickFillAdultMaleExample: "一鍵填入成年男性範例",
    previewHighBmiDecisionPath: "預覽高 BMI 決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的數值調整輸入而不失去脈絡。",
    metric: "公制",
    imperial: "英制",
    exampleCards: "範例卡",
    highBmiPathDemo: "高 BMI 路徑示範",
    oneClickFillAllowed: "70kg · 175cm · 可一鍵填入",
    highBmiPathDescription: "88kg · 170cm · 展示 BMR → TDEE → 熱量路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    heightCm: "身高（cm）",
    weightKg: "體重（kg）",
    feet: "英尺",
    inches: "英寸",
    weightLb: "體重（lb）",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "狀態",
    riskSummary: "風險摘要",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretCategoryBeforeActing: "行動前先理解分類",
    emotionConversionLayer: "情緒與轉換層",
    turnBmiIntoJourney: "將 BMI 結果轉化為健康旅程",
    prototypeLayerNote: "此原型層在結果後加入留存與轉換提示，但不實作儲存、分享、帳號或導航功能。",
    progressInsightCard: "進度洞察卡",
    possibleProgressTarget: "你的可能進度目標",
    timeline: "時間軸",
    estimatedTimelinePlaceholder: "預估時程（參考）",
    currentBmi: "目前 BMI",
    goal: "目標",
    needed: "需調整",
    neededWeightNote: "需調整體重是依目前身高與目標 BMI 23 推估的原型數值，並非醫療建議。",
    motivationCard: "動力卡",
    keepMomentum: "拿到分數後保持動力",
    targetBmiRange: "目標 BMI 範圍",
    weightLoss: "減重",
    healthJourney: "健康旅程",
    current: "目前",
    calories: "熱量",
    progress: "進度",
    start: "起點",
    step: "步驟",
    saveSharePlaceholder: "儲存 / 分享佔位",
    saveShareJourney: "儲存結果或分享旅程",
    saveShareNote: "僅為 UI 佔位。不包含帳號、儲存、分享或匯出實作。",
    saveUi: "儲存（示意）",
    shareUi: "分享（示意）",
    decisionPath: "決策路徑",
    highBmiEnergyPath: "若 BMI 偏高，繼續能量路徑",
    bmiHigh: "BMI 偏高",
    screeningSignal: "篩查訊號",
    restingEnergy: "靜止能量",
    dailyNeeds: "每日需求",
    planIntake: "規劃攝取",
    knowledge: "知識",
    bmiMeaning: "BMI 在健康宇宙中的意義",
    definition: "定義",
    definitionText: "BMI 使用體重除以身高平方，將成人體重與身高進行比較。",
    limitations: "限制",
    limitationsText: "BMI 不測量體脂、肌肉量、脂肪分佈、懷孕狀態或兒童百分位狀態。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "BMR、TDEE、熱量、體脂、飲水量與腰圍比例能擴展結果情境。",
    metricFormula: "公制：BMI = 體重(kg) / 身高(m)²",
    imperialFormula: "英制：BMI = 703 × 體重(lb) / 身高(in)²",
    faq: "FAQ",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "參考資料應包含 WHO、CDC 與 NIH。BMI 是篩查指標，不是診斷或醫療治療建議。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "WHO 分類脈絡、CDC BMI 篩查指引，以及 NIH 健康風險脈絡。",
  },
  en: {
    badge: "Health · Biometrics · Gold Tool",
    title: "BMI Calculator · Complete Health Assessment",
    subtitle: "BMI Calculator guided experience",
    intro: "Move through BMI as a guided health screening flow: start with a quick example, calculate your score, understand the risk signal, and continue to the most useful next tool.",
    trustNoteLabel: "Trust note:",
    trustNote: "BMI is a screening tool, not a diagnosis. It does not directly measure body fat, athletic body composition, pregnancy context, or child percentile status.",
    quickActionCard: "Quick Action Card",
    tryCommonAdultExample: "Try a common adult example",
    bmiPreview: "BMI preview",
    example: "Example",
    adultMale: "Adult male",
    weight: "Weight",
    height: "Height",
    oneClickFillAdultMaleExample: "One-click fill adult male example",
    previewHighBmiDecisionPath: "Preview high BMI decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    metric: "Metric",
    imperial: "Imperial",
    exampleCards: "Example cards",
    highBmiPathDemo: "High BMI path demo",
    oneClickFillAllowed: "70kg · 175cm · one-click fill allowed",
    highBmiPathDescription: "88kg · 170cm · shows BMR → TDEE → Calories path.",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    heightCm: "Height (cm)",
    weightKg: "Weight (kg)",
    feet: "Feet",
    inches: "Inches",
    weightLb: "Weight (lb)",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Status",
    riskSummary: "Risk summary",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretCategoryBeforeActing: "Interpret the category before acting",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnBmiIntoJourney: "Turn the BMI result into a health journey",
    prototypeLayerNote: "This prototype layer adds retention and conversion prompts after the result without implementing save, share, account, or navigation behavior.",
    progressInsightCard: "Progress Insight Card",
    possibleProgressTarget: "Your possible progress target",
    timeline: "Timeline",
    estimatedTimelinePlaceholder: "Estimated timeline placeholder",
    currentBmi: "Current BMI",
    goal: "Goal",
    needed: "Needed",
    neededWeightNote: "Needed weight is a prototype estimate based on the current height and a goal BMI of 23. It is not a medical recommendation.",
    motivationCard: "Motivation Card",
    keepMomentum: "Keep momentum after the score",
    targetBmiRange: "Target BMI range",
    weightLoss: "Weight Loss",
    healthJourney: "Health Journey",
    current: "Current",
    calories: "Calories",
    progress: "Progress",
    start: "Start",
    step: "Step",
    saveSharePlaceholder: "Save / Share placeholder",
    saveShareJourney: "Save this result or share the journey",
    saveShareNote: "UI placeholder only. No account, storage, sharing, or export implementation is included in this prototype.",
    saveUi: "Save UI",
    shareUi: "Share UI",
    decisionPath: "Decision Path",
    highBmiEnergyPath: "If BMI is high, continue through the energy path",
    bmiHigh: "BMI high",
    screeningSignal: "Screening signal",
    restingEnergy: "Resting energy",
    dailyNeeds: "Daily needs",
    planIntake: "Plan intake",
    knowledge: "Knowledge",
    bmiMeaning: "What BMI means in the Health universe",
    definition: "Definition",
    definitionText: "BMI compares adult weight with height using weight divided by squared height.",
    limitations: "Limitations",
    limitationsText: "BMI does not measure body fat, muscle mass, fat distribution, pregnancy status, or child percentile status.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "BMR, TDEE, Calories, Body Fat, Water Intake, and Waist Ratio expand the result context.",
    metricFormula: "Metric: BMI = weight(kg) / height(m)²",
    imperialFormula: "Imperial: BMI = 703 × weight(lb) / height(in)²",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "References should include WHO, CDC, and NIH. BMI is a screening metric, not a diagnosis or medical treatment recommendation.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "WHO classification context, CDC BMI screening guidance, and NIH health risk context.",
  },
} as const;

const adultMaleExampleBmi = 70 / (1.75 * 1.75);

function getCategory(bmi: number): CategoryInfo {
  if (bmi < 18.5) return categoryInfo[0];
  if (bmi < 25) return categoryInfo[1];
  if (bmi < 30) return categoryInfo[2];
  if (bmi < 35) return categoryInfo[3];
  if (bmi < 40) return categoryInfo[4];
  return categoryInfo[5];
}

function formatBmi(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}

export default function BmiCalculator() {
  const { lang, setLang } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("70");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("154");

  const t = ui[lang];

  const calculation = useMemo(() => {
    if (unitSystem === "metric") {
      const heightM = Number(heightCm) / 100;
      const weight = Number(weightKg);
      if (!heightM || !weight || heightM <= 0 || weight <= 0) return null;
      const bmi = weight / (heightM * heightM);
      return { bmi, category: getCategory(bmi) };
    }

    const totalInches = Number(feet) * 12 + Number(inches);
    const weight = Number(pounds);
    if (!totalInches || !weight || totalInches <= 0 || weight <= 0) return null;
    const bmi = (703 * weight) / (totalInches * totalInches);
    return { bmi, category: getCategory(bmi) };
  }, [feet, heightCm, inches, pounds, unitSystem, weightKg]);

  const activeCategory = calculation?.category ?? categoryInfo[1];
  const activeBmi = calculation?.bmi;
  const goalBmi = 23;
  const currentMetricHeightM = Number(heightCm) / 100;
  const goalWeightKg = currentMetricHeightM > 0 ? goalBmi * currentMetricHeightM * currentMetricHeightM : null;
  const currentWeightKg = unitSystem === "metric" ? Number(weightKg) : Number(pounds) * 0.45359237;
  const neededWeightChangeKg = goalWeightKg && currentWeightKg > 0 ? goalWeightKg - currentWeightKg : null;
  const neededWeightDisplay = neededWeightChangeKg ? `${neededWeightChangeKg > 0 ? "+" : ""}${Math.round(neededWeightChangeKg)}kg` : "—";
  const journeyNodes = [t.current, "BMI", "BMR", t.calories, t.progress];
  const decisionNodes = [t.bmiHigh, "BMR", "TDEE", t.calories];
  const decisionDescriptions = [t.screeningSignal, t.restingEnergy, t.dailyNeeds, t.planIntake];
  const motivationTools = ["BMR", "TDEE", t.calories, t.weightLoss];

  function fillAdultMaleExample() {
    setUnitSystem("metric");
    setHeightCm("175");
    setWeightKg("70");
  }

  function fillHighBmiExample() {
    setUnitSystem("metric");
    setHeightCm("170");
    setWeightKg("88");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50"
              aria-label={lang === "zh" ? "Switch to English" : "切換到中文"}
            >
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 中</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 EN</span>
            </button>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-blue-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <strong>{t.trustNoteLabel}</strong> {t.trustNote}
              </div>
            </section>

            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p>
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonAdultExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.bmiPreview}</div>
                  <div className="text-3xl font-black">{formatBmi(adultMaleExampleBmi)}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.adultMale}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.weight}</div><div className="mt-1 text-lg font-black">70kg</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.height}</div><div className="mt-1 text-lg font-black">175cm</div></div>
              </div>
              <button onClick={fillAdultMaleExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">
                {t.oneClickFillAdultMaleExample}
              </button>
              <button onClick={fillHighBmiExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">
                {t.previewHighBmiDecisionPath}
              </button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p>
                <h2 className="mt-2 text-3xl font-black">{t.enterOrFillValues}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
                <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "metric" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("metric")}>{t.metric}</button>
                <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "imperial" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("imperial")}>{t.imperial}</button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillAdultMaleExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.adultMale}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">BMI {formatBmi(adultMaleExampleBmi)}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillHighBmiExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.highBmiPathDemo}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.highBmiPathDescription}</p>
                  </button>
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
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeCategory.tone}`} aria-label="Color band placeholder" />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-7xl font-black tracking-tight text-slate-950">{activeBmi ? formatBmi(activeBmi) : "—"}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{activeBmi ? l(activeCategory.label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.status}</div>
                    <div className="mt-1 text-xl font-black">{l(activeCategory.range, lang)}</div>
                    <div className="mt-1 text-xs text-slate-300">{l(activeCategory.band, lang)}</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.riskSummary}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeCategory.risks, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeCategory.actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950">{l(activeCategory.nextTool, lang)}</p></div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretCategoryBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categoryInfo.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeCategory.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{l(item.range, lang)}</span></div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.meaning, lang)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* ────── AdSense 廣告區塊 ────── */}
          <AdSenseWrapper
            showAds={true}
            adFormat="horizontal"
          />

          <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p>
            <h2 className="mt-2 text-3xl font-black">{t.turnBmiIntoJourney}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.prototypeLayerNote}</p>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsightCard}</p>
                    <h3 className="mt-2 text-2xl font-black">{t.possibleProgressTarget}</h3>
                  </div>
                  <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.timeline}</div>
                    <div className="text-sm font-black">{t.estimatedTimelinePlaceholder}</div>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.currentBmi}</div><div className="mt-1 text-3xl font-black">{activeBmi ? formatBmi(activeBmi) : "—"}</div></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.goal}</div><div className="mt-1 text-3xl font-black text-blue-950">23</div></div>
                  <div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.needed}</div><div className="mt-1 text-3xl font-black text-emerald-950">{neededWeightDisplay}</div></div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{t.neededWeightNote}</p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivationCard}</p>
                <h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3>
                <div className="mt-5 rounded-2xl bg-pink-50 p-4">
                  <div className="text-xs font-black uppercase text-pink-700">{t.targetBmiRange}</div>
                  <div className="mt-1 text-3xl font-black text-pink-950">18.5–24.9</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {motivationTools.map((tool) => (
                    <div key={tool} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{tool}</div>
                  ))}
                </div>
              </article>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.55fr]">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.healthJourney}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
                  {journeyNodes.map((node, index) => (
                    <div key={`${node}-${index}`} className="contents">
                      <div className={`rounded-2xl border p-4 text-center ${index === 4 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}>
                        <div className="text-xs font-black uppercase text-slate-500">{index === 0 ? t.start : `${t.step} ${index}`}</div>
                        <div className="mt-1 text-lg font-black">{node}</div>
                      </div>
                      {index < 4 && <div className="hidden text-2xl font-black text-slate-300 md:block">→</div>}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{t.saveSharePlaceholder}</p>
                <h3 className="mt-2 text-xl font-black">{t.saveShareJourney}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t.saveShareNote}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button type="button" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">{t.saveUi}</button>
                  <button type="button" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700">{t.shareUi}</button>
                </div>
              </article>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.decisionPath}</p>
            <h2 className="mt-2 text-3xl font-black">{t.highBmiEnergyPath}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
              {decisionNodes.map((node, index) => (
                <div key={`${node}-${index}`} className="contents">
                  <div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-orange-300 bg-orange-50" : "border-blue-200 bg-blue-50"}`}>
                    <div className="text-xs font-black uppercase text-slate-500">{t.step} {index + 1}</div>
                    <div className="mt-1 text-xl font-black">{node}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{decisionDescriptions[index]}</p>
                  </div>
                  {index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
              <h2 className="mt-2 text-3xl font-black">{t.bmiMeaning}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.semanticNeighbors}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.semanticNeighborsText}</p></div>
              </div>
              <pre className="mt-5 rounded-3xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">{t.metricFormula}{"\n"}{t.imperialFormula}</pre>
              
              {/* ────── AdSlot: Knowledge 中間 ────── */}
              <div className="mt-6">
                <AdSlot slot="bmi-knowledge" position="middle" />
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
              <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
              <div className="mt-5 space-y-3">
                {faqItems.map((item) => (
                  <details key={l(item.question, lang)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer font-black">{l(item.question, lang)}</summary>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.answer, lang)}</p>
                  </details>
                ))}
              </div>
            </article>
          </section>

          {/* ────── AdSlot: FAQ 下方 ────── */}
          <AdSlot slot="bmi-faq" position="inline" />

          {/* ────── Affiliate Layer (L14) - 獨立顯示，不在任何 flag 內 ────── */}
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦商品" : "Recommended"}</p>
            <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "配合 BMI 使用的健康工具" : "Health tools to use with BMI"}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "智能體重計", en: "Smart Scale", href: "#affiliate-scale"}, {zh: "健身追蹤器", en: "Fitness Tracker", href: "#affiliate-tracker"}, {zh: "營養補充品", en: "Supplements", href: "#affiliate-supplements"}, {zh: "健康書籍", en: "Health Books", href: "#affiliate-books"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
            </div>
            <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </section>

          {/* ────── Premium Layer (L15) ────── */}
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium Features"}</p>
              <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "解鎖完整健康追蹤" : "Unlock Complete Health Tracking"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "Premium 功能即將推出" : "Premium features coming soon"}</p>
            </div>
          </PremiumGate>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">BMR · TDEE · {t.calories} · {lang === "zh" ? "體脂" : "Body Fat"} · {lang === "zh" ? "飲水量" : "Water Intake"} · {lang === "zh" ? "腰圍比例" : "Waist Ratio"}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
