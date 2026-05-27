import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type UnitSystem = "metric" | "imperial";
type Lang = "zh" | "en";
type DeficitCategory = "dangerous" | "aggressive" | "moderate" | "maintain" | "surplus";
type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: DeficitCategory;
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
    key: "dangerous",
    label: { zh: "危險赤字", en: "Dangerous Deficit" },
    range: { zh: "> 1000 kcal", en: "> 1000 kcal" },
    band: { zh: "極端不建議區間", en: "Extreme not recommended band" },
    tone: "from-red-700 via-purple-800 to-slate-950",
    meaning: { zh: "危險赤字（每天赤字 > 1000 kcal）可能導致不健康的体重丧失、肌肉流失和代謝減速。", en: "Dangerous deficit (>1000 kcal/day) may lead to unhealthy weight loss, muscle loss, and metabolic slowdown." },
    risks: { zh: "極端不建議。可能導致疲勞、茐母、克隱症和代謝綏亂。需要醫学指導。", en: "Extreme not recommended. May cause fatigue, nutrient deficiency, eating disorders, and metabolic chaos. Seek medical guidance." },
    actions: { zh: "請立即調整你的赤字目標。建議每天赤字 500-750 kcal。請詢問醫療專業人員。", en: "Adjust your deficit immediately. Aim for 500-750 kcal/day deficit. Consult a medical professional." },
    nextTool: { zh: "醫療指導", en: "Medical Guidance" },
    tools: [{ zh: "醫療指導", en: "Medical Guidance" }, { zh: "營養計畫書", en: "Nutrition Plan" }, { zh: "進度追蹤", en: "Progress Tracking" }],
  },
  {
    key: "aggressive",
    label: { zh: "激進赤字", en: "Aggressive Deficit" },
    range: { zh: "500-1000 kcal", en: "500-1000 kcal" },
    band: { zh: "較大赤字區間", en: "Larger deficit band" },
    tone: "from-orange-400 via-red-400 to-red-600",
    meaning: { zh: "激進赤字（每天赤字 500-1000 kcal）可以带來較快的体重減失，但需要注意肌肉保持。", en: "Aggressive deficit (500-1000 kcal/day) allows faster weight loss but requires careful muscle preservation." },
    risks: { zh: "需要高蛋白質攝取和充足休息。可能感到疲勞、不適。", en: "Requires high protein intake and adequate rest. May cause fatigue and irritability." },
    actions: { zh: "保證高蛋白質（每公斤 1.6-2.2g）、充足休息、定期運動。", en: "Ensure high protein (1.6-2.2g/lb), adequate rest, and regular exercise." },
    nextTool: { zh: "蛋白質計算機", en: "Protein Calculator" },
    tools: [{ zh: "蛋白質計算機", en: "Protein Calculator" }, { zh: "體重追蹤", en: "Weight Tracking" }, { zh: "進度追蹤", en: "Progress Tracking" }],
  },
  {
    key: "moderate",
    label: { zh: "適中赤字", en: "Moderate Deficit" },
    range: { zh: "0-500 kcal", en: "0-500 kcal" },
    band: { zh: "健康赤字區間", en: "Healthy deficit band" },
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "適中赤字（每天赤字 0-500 kcal）是最可持續的体重減失方式，可以有效保持肌肉。", en: "Moderate deficit (0-500 kcal/day) is the most sustainable weight loss approach, preserving muscle." },
    risks: { zh: "低風險。需要耐心和一致性。", en: "Low risk. Requires patience and consistency." },
    actions: { zh: "維持中等蛋白質（每公斤 1.2-1.6g）、正常休息、定期運動。", en: "Maintain moderate protein (1.2-1.6g/lb), normal rest, and regular exercise." },
    nextTool: { zh: "體重追蹤", en: "Weight Tracking" },
    tools: [{ zh: "體重追蹤", en: "Weight Tracking" }, { zh: "蛋白質計算機", en: "Protein Calculator" }, { zh: "進度追蹤", en: "Progress Tracking" }],
  },
  {
    key: "maintain",
    label: { zh: "維持", en: "Maintenance" },
    range: { zh: "0 kcal", en: "0 kcal" },
    band: { zh: "能量平衡區間", en: "Energy balance band" },
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "維持（每天赤字 0 kcal）是保持當前体重的最佳方式。", en: "Maintenance (0 kcal deficit) is the best way to maintain current weight." },
    risks: { zh: "低風險。可以長期維持。", en: "Low risk. Can be maintained long-term." },
    actions: { zh: "根據 TDEE 正常飲食、保持中等蛋白質、定期運動。", en: "Eat at TDEE, maintain moderate protein, and exercise regularly." },
    nextTool: { zh: "進度追蹤", en: "Progress Tracking" },
    tools: [{ zh: "進度追蹤", en: "Progress Tracking" }, { zh: "蛋白質計算機", en: "Protein Calculator" }, { zh: "運動計畫", en: "Fitness Plan" }],
  },
  {
    key: "surplus",
    label: { zh: "盐餘增肌", en: "Surplus (Muscle Gain)" },
    range: { zh: "< 0 kcal", en: "< 0 kcal" },
    band: { zh: "能量盐餘區間", en: "Energy surplus band" },
    tone: "from-blue-400 via-indigo-300 to-purple-200",
    meaning: { zh: "盐餘增肌（每天盐餘）是用于增加肌肉、提高力量。", en: "Surplus (daily calorie surplus) is used for muscle gain and strength building." },
    risks: { zh: "需要控制盐餘幅度（每天 300-500 kcal）以最小化脂肪增加。", en: "Control surplus (300-500 kcal/day) to minimize fat gain." },
    actions: { zh: "高蛋白質（每公斤 1.6-2.2g）、定期力量訓練、充足休息。", en: "High protein (1.6-2.2g/lb), strength training, and adequate rest." },
    nextTool: { zh: "蛋白質計算機", en: "Protein Calculator" },
    tools: [{ zh: "蛋白質計算機", en: "Protein Calculator" }, { zh: "運動計畫", en: "Fitness Plan" }, { zh: "進度追蹤", en: "Progress Tracking" }],
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
    badge: "健康 · 生物指標 · GOLD TOOL",
    title: "熱量赤字／盐餘計算機",
    subtitle: "熱量赤字計算引導體驗",
    intro: "依據 TDEE 設定減脂或增肌的熱量目標，計算每日赤字或盐餘，並預估體重變化速度。",
    trustNoteLabel: "信任提醒：",
    trustNote: "赤字是理論估算，不是精確測量。實際体重變化取決於這個赤字、適應能力、運動、代謝和身體組成。",
    quickActionCard: "快速範例卡",
    tryCommonAdultExample: "試用常見成人範例",
    deficitPreview: "赤字預覽",
    example: "範例",
    adultMale: "成年男性（30 歲）",
    weight: "體重",
    height: "身高",
    oneClickFillAdultMaleExample: "一鍵填入成年男性範例",
    previewHighDeficitDecisionPath: "預覽高赤字決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的數值調整輸入而不失去脈絡。",
    metric: "公制",
    imperial: "英制",
    exampleCards: "範例卡",
    highDeficitPathDemo: "高赤字路徑示範",
    oneClickFillAllowed: "TDEE 2200 · 每日 1700 · 可一鍵填入",
    highDeficitPathDescription: "TDEE 2500 · 每日 1800 · 展示赤字 → 體重追蹤 → 蛋白質計算路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    heightCm: "身高（cm）",
    weightKg: "體重（kg）",
    feet: "英尺",
    inches: "英寸",
    weightLb: "體重（lb）",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "赤字分類",
    riskSummary: "赤字評估",
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
    bmiMeaning: "BMR 在健康宇宙中的意義",
    definition: "定義",
    definitionText: "BMR（基礎代謝率）是身體在靜止狀態下每天消耗的熱量，用於維持基本生理功能。",
    limitations: "限制",
    limitationsText: "BMR 是估算值，實際代謝受年齡、性別、肌肉量、激素和遺傳因素影響。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "TDEE、熱量赤字、蛋白質計算、體脂率與進度追蹤能擴展代謝規劃。",
    metricFormula: "男性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 + 5",
    imperialFormula: "女性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 - 161",
    faq: "FAQ",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "參考資料應包含 美國熱量學學會、CDC 體重管理指引、NIH 熱量需求指引。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "American Society of Nutrition, CDC weight management guidelines, NIH calorie requirement guidelines.",
  },
  en: {
    badge: "Health · Biometrics · Gold Tool",
    title: "Calorie Deficit / Surplus Calculator",
    subtitle: "Calorie Deficit Calculator guided experience",
    intro: "Set your calorie goal for fat loss or muscle gain based on TDEE, calculate daily deficit or surplus, and estimate weekly weight change.",
    trustNoteLabel: "Trust note:",
    trustNote: "Calorie deficit is a theoretical estimate, not a precise measurement. Actual weight change depends on this deficit, adherence, exercise, metabolism, and body composition.",
    quickActionCard: "Quick Action Card",
    tryCommonAdultExample: "Try a common adult example",
    deficitPreview: "Deficit preview",
    example: "Example",
    adultMale: "Adult male (age 30)",
    weight: "Weight",
    height: "Height",
    oneClickFillAdultMaleExample: "One-click fill adult male example",
    previewHighDeficitDecisionPath: "Preview high deficit decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    metric: "Metric",
    imperial: "Imperial",
    exampleCards: "Example cards",
    highDeficitPathDemo: "High deficit path demo",
    oneClickFillAllowed: "TDEE 2200 · Daily 1700 · one-click fill allowed",
    highDeficitPathDescription: "TDEE 2500 · Daily 1800 · shows Deficit → Weight Tracking → Protein Calculator path.",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    heightCm: "Height (cm)",
    weightKg: "Weight (kg)",
    feet: "Feet",
    inches: "Inches",
    weightLb: "Weight (lb)",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Deficit Category",
    riskSummary: "Deficit Assessment",
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
    bmiMeaning: "What Calorie Deficit means in the Health universe",
    definition: "Definition",
    definitionText: "Calorie Deficit is the difference between your TDEE and daily calorie intake. It determines weight loss or gain speed.",
    limitations: "Limitations",
    limitationsText: "Deficit is an estimate. Actual weight change varies by metabolism, exercise, adherence, and body composition.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "BMR, TDEE, Protein Calculator, Weight Tracking, and Progress Tracking expand weight management planning.",
    metricFormula: "Deficit = TDEE - Daily Intake",
    imperialFormula: "Weekly Weight Change = Deficit × 7 ÷ 7700 (kg)",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "References should include American Society of Nutrition, CDC weight management guidelines, and NIH calorie requirement guidelines.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "American Society of Nutrition, CDC weight management guidelines, NIH calorie requirement guidelines.",
  },
} as const;

const adultMaleExampleBmi = 70 / (1.75 * 1.75);

function getCategory(deficit: number): CategoryInfo {
  if (deficit > 1000) return categoryInfo[0];
  if (deficit >= 500) return categoryInfo[1];
  if (deficit > 0) return categoryInfo[2];
  if (deficit === 0) return categoryInfo[3];
  return categoryInfo[4];
}

function formatDeficit(value: number): string {
  return Number.isFinite(value) ? Math.round(value) : "—";
}

const getBrowserLang = (): "zh" | "en" => {
  const locale =
    (typeof navigator !== "undefined"
    && navigator.language) || "zh"
  return locale.startsWith("zh") ? "zh" : "en"
}

export function CalorieDeficitCalculator() {
  const [lang, setLang] = useState<"zh" | "en">(getBrowserLang());
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("70");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("154");

  const t = ui[lang];

  const calculation = useMemo(() => {
    const tdee = 2200; // 預設 TDEE
    const dailyIntake = 1700; // 預設每日攝取
    const deficit = tdee - dailyIntake;
    const weeklyWeightChange = (deficit * 7) / 7700; // kg
    
    if (!tdee || !dailyIntake) return null;
    return { tdee, dailyIntake, deficit, weeklyWeightChange, category: getCategory(deficit) };
  }, []);

  const activeCategory = calculation?.category ?? categoryInfo[2];
  const activeDeficit = calculation?.deficit;
  const weeklyWeightChange = calculation?.weeklyWeightChange;
  const journeyNodes = [t.current, "熱量赤字", "體重追蹤", "蛋白質計算", t.progress];
  const decisionNodes = ["熱量赤字", "體重追蹤", "蛋白質計算", "目標達成"];
  const decisionDescriptions = ["赤字規劃", "體重變化", "蛋白質需求", "目標達成"];
  const motivationTools = ["體重追蹤", "蛋白質計算機", "減重計畫書", "進度追蹤"];

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
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>中</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>EN</span>
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
            <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "配合熱量赤字使用的健康工具" : "Health tools to use with Calorie Deficit"}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "食物秤", en: "Food Scale", href: "#affiliate-foodscale"}, {zh: "熱量計算App", en: "Calorie App", href: "#affiliate-app"}, {zh: "蛋白質補充品", en: "Protein Supplements", href: "#affiliate-protein"}, {zh: "減重計畫書", en: "Weight Loss Plan", href: "#affiliate-plan"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
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
