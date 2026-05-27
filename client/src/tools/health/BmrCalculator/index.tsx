
import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type UnitSystem = "metric" | "imperial";
type Lang = "zh" | "en";
type BmrCategory = "low" | "normal" | "high";
type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: BmrCategory;
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
    key: "low",
    label: { zh: "偏低", en: "Low" },
    range: { zh: "< 1400 kcal/day", en: "< 1400 kcal/day" },
    band: { zh: "低代謝區間", en: "Low metabolism band" },
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "基礎代謝率偏低，可能與年齡、性別、肌肉量或代謝狀況有關。", en: "Lower basal metabolic rate may be related to age, sex, muscle mass, or metabolic condition." },
    risks: { zh: "代謝偏低可能導致體重管理困難。建議評估整體健康狀況、飲食與運動習慣。", en: "Lower metabolism may make weight management more challenging. Consider evaluating overall health, diet, and exercise habits." },
    actions: { zh: "建議增加肌肉量訓練、優化飲食營養、檢查甲狀腺功能。可搭配 TDEE 與熱量計算進行深入評估。", en: "Consider resistance training to build muscle, optimize nutrition, and check thyroid function. Use TDEE and calorie planning for deeper context." },
    nextTool: { zh: "TDEE 計算機", en: "TDEE Calculator" },
    tools: [{ zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "蛋白質計算機", en: "Protein Calculator" }, { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }],
  },
  {
    key: "normal",
    label: { zh: "正常", en: "Normal" },
    range: { zh: "1400-2000 kcal/day", en: "1400-2000 kcal/day" },
    band: { zh: "正常代謝區間", en: "Normal metabolism band" },
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "基礎代謝率在正常範圍內，反映健康的靜止代謝水平。", en: "Basal metabolic rate is within normal range, reflecting a healthy resting metabolism level." },
    risks: { zh: "正常代謝提供良好的代謝基礎。維持健康的生活方式有助於長期健康管理。", en: "Normal metabolism provides a good metabolic foundation. Maintaining healthy lifestyle habits supports long-term health management." },
    actions: { zh: "維持均衡營養、規律運動、充足睡眠。可計算 TDEE 進行更精準的熱量管理與體重目標設定。", en: "Maintain balanced nutrition, regular exercise, and adequate sleep. Calculate TDEE for precise calorie management and weight goals." },
    nextTool: { zh: "TDEE 計算機", en: "TDEE Calculator" },
    tools: [{ zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, { zh: "進度追蹤", en: "Progress Tracking" }],
  },
  {
    key: "high",
    label: { zh: "偏高", en: "High" },
    range: { zh: "> 2000 kcal/day", en: "> 2000 kcal/day" },
    band: { zh: "高代謝區間", en: "High metabolism band" },
    tone: "from-orange-400 via-red-400 to-red-600",
    meaning: { zh: "基礎代謝率較高，通常與較高的肌肉量、年輕年齡或代謝效率有關。", en: "Higher basal metabolic rate is often associated with higher muscle mass, younger age, or efficient metabolism." },
    risks: { zh: "代謝較高本身不是風險，但需要相應的熱量攝取以維持能量平衡。", en: "Higher metabolism itself is not a risk, but requires appropriate calorie intake to maintain energy balance." },
    actions: { zh: "確保充足的營養攝取以支持代謝需求。計算 TDEE 與熱量赤字以達成體重或體組成目標。", en: "Ensure adequate nutrition to support metabolic needs. Calculate TDEE and calorie deficit to achieve weight or body composition goals." },
    nextTool: { zh: "TDEE 計算機", en: "TDEE Calculator" },
    tools: [{ zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, { zh: "蛋白質計算機", en: "Protein Calculator" }],
  },
];

const faqItems: { question: LocalText; answer: LocalText }[] = [
  { question: { zh: "BMR 是什麼？", en: "What is BMR?" }, answer: { zh: "BMR（基礎代謝率）是你的身體在完全靜止狀態下維持生命功能所需的最低熱量。", en: "BMR (Basal Metabolic Rate) is the minimum calories your body needs to maintain life functions at complete rest." } },
  { question: { zh: "BMR 和 TDEE 有什麼區別？", en: "What is the difference between BMR and TDEE?" }, answer: { zh: "BMR 是靜止時的代謝，TDEE 是加上日常活動和運動的總代謝。TDEE 通常比 BMR 高 20-50%。", en: "BMR is resting metabolism, TDEE includes daily activities and exercise. TDEE is typically 20-50% higher than BMR." } },
  { question: { zh: "哪些因素會影響 BMR？", en: "What factors affect BMR?" }, answer: { zh: "年齡、性別、肌肉量、體重、荷爾蒙、遲早代謝疾病和運動習慣都會影響 BMR。", en: "Age, sex, muscle mass, weight, hormones, metabolic disorders, and exercise habits all affect BMR." } },
  { question: { zh: "BMR 計算的準確性如何？", en: "How accurate is the BMR calculation?" }, answer: { zh: "Mifflin-St Jeor 公式是目前最精準的 BMR 估算方法，但個體差異仍然存在。建議結合實際體重變化來調整。", en: "Mifflin-St Jeor is the most accurate BMR estimation method, but individual variation still exists. Adjust based on actual weight changes." } },
  { question: { zh: "BMR 偏低或偏高是什麼意思？", en: "What does low or high BMR mean?" }, answer: { zh: "BMR 偏低可能使體重管理更困難，偏高可能需要更多熱量來維持能量平衡。不是好或壞，只是不同。", en: "Low BMR may make weight management harder, high BMR may require more calories for energy balance. Neither is good or bad, just different." } },
  { question: { zh: "應該如何使用 BMR 來管理體重？", en: "How should I use BMR for weight management?" }, answer: { zh: "計算 TDEE 並設定適當的熱量赤字或盈餘。建議每週減少 0.5-1 kg。不要低於 BMR 太多。", en: "Calculate TDEE and set appropriate calorie deficit or surplus. Aim for 0.5-1 kg change per week. Don't go too far below BMR." } },
];

const ui = {
  zh: {
    badge: "健康 · 生物指標 · GOLD TOOL",
    title: "BMR 基礎代謝率計算機",
    subtitle: "BMR 計算引導體驗",
    intro: "透過 Mifflin-St Jeor 公式精確計算靜止代謝率，理解你的身體基礎熱量需求，並延伸到 TDEE、熱量赤字等下一步工具。",
    trustNoteLabel: "信任提醒：",
    trustNote: "BMR 是估算工具，個人實際代謝因體組成、健康狀況而異。孕婦及特殊疾病患者請諮詢醫師。",
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
    bmiMeaning: "BMR 在健康宇宙中的意義",
    definition: "定義",
    definitionText: "BMR（基礎代謝率）是你的身體在完全靜止狀態下維持生命功能所需的最低熱量。",
    limitations: "限制",
    limitationsText: "BMR 不考慮日常活動、運動、壓力或荷爾蒙變化的影響。肌肉量高者 BMR 會偏高。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "TDEE、熱量赤字、BMI、蛋白質需求計算機可擴展結果情境。",
    metricFormula: "男性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 + 5",
    imperialFormula: "女性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 - 161",
    faq: "FAQ",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具基於 Mifflin-St Jeor 公式，為目前學術界最廣泛採用的 BMR 計算標準。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "Mifflin MD et al. (1990)、WHO 代謝標準、NIH 熱量需求指引",
  },
  en: {
    badge: "Health · Biometrics · GOLD TOOL",
    title: "BMR Basal Metabolic Rate Calculator",
    subtitle: "BMR Calculator guided experience",
    intro: "Calculate your basal metabolic rate using the Mifflin-St Jeor formula to understand your body's baseline calorie needs, then extend to TDEE, calorie deficit, and other next-step tools.",
    trustNoteLabel: "Trust note:",
    trustNote: "BMR is an estimation tool. Individual actual metabolism varies by body composition and health status. Pregnant women and patients with special conditions should consult a physician.",
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
    bmiMeaning: "What BMR means in the Health universe",
    definition: "Definition",
    definitionText: "BMR (Basal Metabolic Rate) is the minimum calories your body needs to maintain life functions at complete rest.",
    limitations: "Limitations",
    limitationsText: "BMR does not account for daily activities, exercise, stress, or hormonal changes. Higher muscle mass results in higher BMR.",
    semanticNeighbors: "Related Tools",
    semanticNeighborsText: "TDEE, Calorie Deficit, BMI, and Protein Calculator extend the result context.",
    metricFormula: "Male: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + 5",
    imperialFormula: "Female: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age - 161",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust Statement",
    trustText: "This tool is based on the Mifflin-St Jeor formula, the most widely adopted BMR calculation standard in academia.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "Mifflin MD et al. (1990), WHO metabolic standards, NIH calorie requirement guidelines",
  },
} as const;

const adultMaleExampleBmi = 70 / (1.75 * 1.75);

function getCategory(bmr: number): CategoryInfo {
  if (bmr < 1400) return categoryInfo[0];
  if (bmr <= 2000) return categoryInfo[1];
  return categoryInfo[2];
}

function formatBmr(value: number): string {
  return Number.isFinite(value) ? value.toFixed(0) : "—";
}

const getBrowserLang = (): "zh" | "en" => {
  const locale =
    (typeof navigator !== "undefined"
    && navigator.language) || "zh"
  return locale.startsWith("zh") ? "zh" : "en"
}

export default function BmrCalculator() {
  const [lang, setLang] = useState<"zh" | "en">(getBrowserLang());
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("70");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("154");
  const [age, setAge] = useState("30");
  const [gender, setGender] = useState<"male" | "female">("male");

  const t = ui[lang];

  const calculation = useMemo(() => {
    if (unitSystem === "metric") {
      const height = Number(heightCm);
      const weight = Number(weightKg);
      const ageNum = Number(age);
      if (!height || !weight || !ageNum || height <= 0 || weight <= 0 || ageNum <= 0) return null;
      // Mifflin-St Jeor formula
      let bmr = 10 * weight + 6.25 * height - 5 * ageNum;
      if (gender === "male") {
        bmr += 5;
      } else {
        bmr -= 161;
      }
      return { bmr, category: getCategory(bmr) };
    }

    const totalInches = Number(feet) * 12 + Number(inches);
    const weight = Number(pounds);
    const ageNum = Number(age);
    if (!totalInches || !weight || !ageNum || totalInches <= 0 || weight <= 0 || ageNum <= 0) return null;
    // Convert to metric for Mifflin-St Jeor
    const heightCm_conv = totalInches * 2.54;
    const weightKg_conv = weight * 0.45359237;
    let bmr = 10 * weightKg_conv + 6.25 * heightCm_conv - 5 * ageNum;
    if (gender === "male") {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    return { bmr, category: getCategory(bmr) };
  }, [feet, heightCm, inches, pounds, unitSystem, weightKg, age, gender]);

  const activeCategory = calculation?.category ?? categoryInfo[1];
  const activeBmr = calculation?.bmr;
  const tdeeEstimate = activeBmr ? Math.round(activeBmr * 1.5) : null;
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
                  <div className="text-3xl font-black">{formatBmr(adultMaleExampleBmi)}</div>
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
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.adultMale}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">BMI {formatBmr(adultMaleExampleBmi)}</span></div>
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
                    <div className="text-7xl font-black tracking-tight text-slate-950">{activeBmr ? formatBmr(activeBmr) : "—"}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{activeBmr ? l(activeCategory.label, lang) : t.enterValidValues}</div>
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
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.currentBmi}</div><div className="mt-1 text-3xl font-black">{activeBmr ? formatBmr(activeBmr) : "—"}</div></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.goal}</div><div className="mt-1 text-3xl font-black text-blue-950">23</div></div>
                  <div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.needed}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tdeeEstimate ? `${tdeeEstimate} kcal` : "—"}</div></div>
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
