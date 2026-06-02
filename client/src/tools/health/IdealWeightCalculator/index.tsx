// @profile B
// Profile B · Calculator-YMYL · IdealWeightCalculator（由 BMR 黃金模板視覺骨架重建）
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md
// Spec: ops/specs/ideal-weight-calculator.md

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type UnitSystem = "metric" | "imperial";
type Sex = "male" | "female";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type FormulaRow = {
  key: string;
  name: string;
  kg: number;
  formula: LocalText;
  note: LocalText;
  tone: string;
};
type FaqItem = { q: LocalText; a: LocalText };

const l = (value: LocalText, lang: Lang) => value[lang];
const kgToLb = (kg: number) => kg * 2.2046226218;
const lbToKg = (lb: number) => lb / 2.2046226218;
const cmToIn = (cm: number) => cm / 2.54;
const inToCm = (inch: number) => inch * 2.54;
const fmt = (value: number, digits = 1) =>
  Number.isFinite(value) ? value.toFixed(digits) : "—";
const overFiveFeet = (heightIn: number) => Math.max(0, heightIn - 60);

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "#affiliate-bmi" },
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "#affiliate-bmr" },
  {
    label: { zh: "TDEE 計算機", en: "TDEE Calculator" },
    href: "#affiliate-tdee",
  },
  {
    label: { zh: "熱量缺口計算機", en: "Calorie Deficit Calculator" },
    href: "#affiliate-calorie-deficit",
  },
];

const sources = [
  {
    title: "ClinCalc — Ideal Body Weight Calculator",
    url: "https://clincalc.com/kinetics/ibw.aspx",
  },
  {
    title: "MDCalc — Ideal Body Weight and Adjusted Body Weight",
    url: "https://www.mdcalc.com/calc/68/ideal-body-weight-adjusted-body-weight",
  },
  {
    title:
      "Peterson et al., Universal equation for estimating ideal body weight and body weight at any BMI",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4841935/",
  },
  {
    title: "Walter & Patel, Ideal body weight and adjusted body weight, 2023",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10621523/",
  },
];

const faqItems: FaqItem[] = [
  {
    q: {
      zh: "理想體重是一個固定目標嗎？",
      en: "Is ideal weight a fixed target?",
    },
    a: {
      zh: "不是。它是由身高與歷史公式估算出的參考區間，應搭配 BMI、體脂、肌肉量、健康狀況與醫療建議。",
      en: "No. It is a height-based reference range from historical equations and should be read with BMI, body composition, health context, and professional guidance.",
    },
  },
  {
    q: {
      zh: "Devine、Robinson、Miller、Hamwi 為何不同？",
      en: "Why do Devine, Robinson, Miller, and Hamwi differ?",
    },
    a: {
      zh: "各公式的基準體重與每英吋增量不同，所以會形成一個範圍。看範圍比看單點更安全。",
      en: "Each formula uses a different base weight and increment per inch over five feet, so they create a range. The range is safer than one number.",
    },
  },
  {
    q: {
      zh: "BMI 健康範圍和理想體重公式哪個優先？",
      en: "Which matters more: BMI range or IBW equations?",
    },
    a: {
      zh: "兩者用途不同。BMI 是族群篩檢，IBW 是身高公式參考；臨床與個人決策需要更多脈絡。",
      en: "They serve different purposes. BMI is a screening range; IBW equations are height-based references. Clinical and personal decisions require more context.",
    },
  },
  {
    q: {
      zh: "運動員或高肌肉量者適合用嗎？",
      en: "Is this suitable for athletes or muscular users?",
    },
    a: {
      zh: "只能作參考。高肌肉量會讓體重高於公式區間，但不一定代表健康風險。",
      en: "Only as a reference. High muscle mass can place weight above equation ranges without necessarily indicating health risk.",
    },
  },
  {
    q: {
      zh: "懷孕、兒童或疾病狀態可以用嗎？",
      en: "Can pregnancy, children, or medical conditions use this?",
    },
    a: {
      zh: "不建議單獨使用。這些情境需要醫師、營養師或兒科成長曲線等專業評估。",
      en: "Not as a standalone tool. These situations require professional assessment such as clinical care, dietitian guidance, or pediatric growth charts.",
    },
  },
  {
    q: { zh: "下一步應該用哪個工具？", en: "Which tool should I use next?" },
    a: {
      zh: "可用 BMI 看篩檢區間、BMR/TDEE 看能量需求，再用熱量缺口工具規劃安全速度。",
      en: "Use BMI for screening context, BMR/TDEE for energy needs, then a calorie deficit tool for a safer planning pace.",
    },
  },
];

const copy = {
  zh: {
    chineseShort: "中",
    englishShort: "EN",
    badge: "HEALTH · IDEAL WEIGHT · GOLD TOOL",
    title: "理想體重計算機 · 多公式成人參考",
    subtitle: "用 BMR 黃金模板節奏呈現 Ideal Weight",
    intro:
      "比較 Devine、Robinson、Miller、Hamwi 與成人 BMI 18.5–24.9 對應體重範圍，幫你理解身高公式給出的參考區間，而不是追逐單一魔法數字。",
    trustNoteLabel: "注意：",
    trustNote:
      "本工具僅供教育與規劃，不構成醫療建議。懷孕、疾病、飲食障礙史、兒童青少年或劇烈體重變化，請諮詢專業人員。",
    quickActionCard: "QUICK ACTION CARD",
    tryExample: "一鍵建立 Ideal Weight 範例",
    examplePreview: "IDEAL PREVIEW",
    idealUnit: "kg average",
    examplePerson: "成人女性",
    heightCm: "身高 (cm)",
    currentKg: "目前體重 (kg)",
    fillExample: "一鍵填入範例",
    previewActivePath: "預覽公式路徑",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入身高並比較多公式",
    examplesHelper:
      "先用範例理解 Ideal Weight、BMI 篩檢範圍與下一步工具，再換成自己的資料。",
    metric: "公制",
    imperial: "英制",
    exampleCards: "範例卡",
    baselineExample: "標準成人範例",
    activeExample: "較高身高範例",
    flowDemo: "流程示範",
    calculator: "計算機",
    feet: "英尺",
    inches: "英吋",
    weightLb: "目前體重 (lb)",
    sex: "公式性別係數",
    male: "男性",
    female: "女性",
    resultCard: "IDEAL WEIGHT RESULT",
    coefficientTag: "公式係數",
    primaryValue: "PRIMARY VALUE",
    avgFormula: "四公式平均",
    bmiRangeLabel: "BMI SCREENING RANGE",
    formulaRangeLabel: "FORMULA RANGE",
    currentDeltaLabel: "CURRENT GAP",
    resultIntelligence: "RESULT INTELLIGENCE",
    formulaMatrix: "四公式與 BMI 篩檢矩陣",
    formulaMatrixNote:
      "下列卡片保留 BMR 的 result intelligence 節奏，但內容改為 Ideal Weight 專屬公式與範圍解讀。",
    emotionConversionLayer: "CONTEXT LAYER",
    turnIntoPlan: "把參考體重轉成安全下一步",
    conversionNote:
      "理想體重不是命令，而是幫你決定下一步要看 BMI、BMR、TDEE、體脂或專業評估。",
    progressInsight: "進度洞察",
    possibleTarget: "你不是在追單點數字",
    dailyGap: "差距",
    weeklyTrend: "BMI 下限",
    motivation: "動機",
    keepMomentum: "用工具串成完整脈絡",
    bmiShort: "BMI",
    bmrShort: "BMR",
    tdeeShort: "TDEE",
    goalShort: "熱量缺口",
    saveShareJourney: "儲存與分享",
    journeyTitle: "保留本次判讀",
    journeyHint:
      "儲存身高、四公式平均、BMI 範圍與下一步工具，避免把單一數字當成醫療結論。",
    nextActionLabel: "下一步",
    nextActionTitle: "安全解讀順序",
    nextActionItem1: "先看公式平均與 BMI 範圍是否差很遠。",
    nextActionItem2: "再用 BMR/TDEE 估算能量需求。",
    nextActionItem3: "若涉及健康風險，交給專業人員判讀。",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製連結",
    decisionPath: "DECISION PATH",
    decisionTitle: "四步決策流程",
    heightStep: "確認身高與公式係數",
    formulaStep: "比較四公式區間",
    contextStep: "加入 BMI/BMR/TDEE",
    safetyStep: "選擇安全下一步",
    knowledge: "KNOWLEDGE",
    knowledgeTitle: "定義、公式與限制",
    definition: "定義",
    definitionText: "理想體重是以成人身高推估的參考體重，不是診斷或命令。",
    formula: "公式",
    formulaText:
      "Devine、Robinson、Miller、Hamwi 都以 5 英尺基準加上每英吋增量；BMI 範圍使用 18.5×h² 至 24.9×h²。",
    limitations: "限制",
    limitationsText:
      "不應單獨用於兒童、孕期、特殊疾病、高肌肉量者或飲食障礙風險。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "RELATED TOOLS",
    affiliateTitle: "下一步語意推薦",
    premiumTitle: "Premium：Ideal Weight 趨勢報告",
    premiumText:
      "把 IBW、BMI、BMR、TDEE、熱量缺口與長期紀錄整合成健康管理報告。",
    calorieCycles: "熱量週期",
    reports: "報告",
    trustReferences: "TRUST & REFERENCES",
    trust: "信任說明",
    trustText: "公式來自常見臨床藥物劑量與成人體重參考脈絡，僅供教育用途。",
    relatedTools: "相關工具",
    relatedToolsText:
      "BMI · BMR · TDEE · Calorie Deficit · Body Fat · Waist-to-Hip",
    references: "具名來源",
    referencesText: "ClinCalc、MDCalc、Peterson et al.、Walter & Patel。",
  },
  en: {
    chineseShort: "中",
    englishShort: "EN",
    badge: "HEALTH · IDEAL WEIGHT · GOLD TOOL",
    title: "Ideal Weight Calculator · Multi-Formula Adult Reference",
    subtitle: "Ideal Weight rebuilt with the BMR golden-template rhythm",
    intro:
      "Compare Devine, Robinson, Miller, Hamwi, and the adult BMI 18.5–24.9 weight range to understand height-based reference weight without treating one number as a magic target.",
    trustNoteLabel: "Note:",
    trustNote:
      "Educational planning only, not medical advice. Pregnancy, disease, eating-disorder history, children, adolescents, or major weight change require professional guidance.",
    quickActionCard: "QUICK ACTION CARD",
    tryExample: "Create an Ideal Weight example instantly",
    examplePreview: "IDEAL PREVIEW",
    idealUnit: "kg average",
    examplePerson: "Adult female",
    heightCm: "Height (cm)",
    currentKg: "Current weight (kg)",
    fillExample: "One-click fill example",
    previewActivePath: "Preview formula path",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter height and compare formulas",
    examplesHelper:
      "Start with examples to understand Ideal Weight, BMI screening range, and next tools, then replace values with your own data.",
    metric: "Metric",
    imperial: "Imperial",
    exampleCards: "Example cards",
    baselineExample: "Baseline adult example",
    activeExample: "Taller-height demo",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    feet: "Feet",
    inches: "Inches",
    weightLb: "Current weight (lb)",
    sex: "Equation sex coefficient",
    male: "Male",
    female: "Female",
    resultCard: "IDEAL WEIGHT RESULT",
    coefficientTag: "Equation coefficient",
    primaryValue: "PRIMARY VALUE",
    avgFormula: "Four-formula average",
    bmiRangeLabel: "BMI SCREENING RANGE",
    formulaRangeLabel: "FORMULA RANGE",
    currentDeltaLabel: "CURRENT GAP",
    resultIntelligence: "RESULT INTELLIGENCE",
    formulaMatrix: "Formula and BMI screening matrix",
    formulaMatrixNote:
      "These cards keep the BMR result-intelligence rhythm while replacing the content with Ideal Weight formulas and range interpretation.",
    emotionConversionLayer: "CONTEXT LAYER",
    turnIntoPlan: "Turn reference weight into a safe next step",
    conversionNote:
      "Ideal weight is not a command; it helps decide whether your next context should be BMI, BMR, TDEE, body composition, or professional review.",
    progressInsight: "Progress insight",
    possibleTarget: "You are not chasing one number",
    dailyGap: "Gap",
    weeklyTrend: "BMI low",
    motivation: "Motivation",
    keepMomentum: "Connect the next tools",
    bmiShort: "BMI",
    bmrShort: "BMR",
    tdeeShort: "TDEE",
    goalShort: "Calorie deficit",
    saveShareJourney: "Save & share",
    journeyTitle: "Save this interpretation",
    journeyHint:
      "Save height, formula average, BMI range, and next tools so one number does not become a medical conclusion.",
    nextActionLabel: "Next action",
    nextActionTitle: "Safe interpretation order",
    nextActionItem1: "Compare formula average with the BMI range.",
    nextActionItem2: "Use BMR/TDEE to estimate energy needs.",
    nextActionItem3: "Use professional review for health-risk decisions.",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Link copied",
    decisionPath: "DECISION PATH",
    decisionTitle: "Four-step decision flow",
    heightStep: "Confirm height and coefficient",
    formulaStep: "Compare formula range",
    contextStep: "Add BMI/BMR/TDEE",
    safetyStep: "Choose a safe next step",
    knowledge: "KNOWLEDGE",
    knowledgeTitle: "Definition, formulas, and limits",
    definition: "Definition",
    definitionText:
      "Ideal weight is a height-based adult reference, not a diagnosis or command.",
    formula: "Formula",
    formulaText:
      "Devine, Robinson, Miller, and Hamwi use a five-foot base plus per-inch increments; BMI range uses 18.5×h² to 24.9×h².",
    limitations: "Limits",
    limitationsText:
      "Do not use as a standalone decision for children, pregnancy, medical conditions, high muscle mass, or eating-disorder risk.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "RELATED TOOLS",
    affiliateTitle: "Semantic next-step recommendations",
    premiumTitle: "Premium: Ideal Weight trend report",
    premiumText:
      "Combine IBW, BMI, BMR, TDEE, calorie deficit, and long-term logs into a health-management report.",
    calorieCycles: "Calorie cycles",
    reports: "Reports",
    trustReferences: "TRUST & REFERENCES",
    trust: "Trust note",
    trustText:
      "Equations come from common clinical dosing and adult reference-weight contexts; this tool is educational only.",
    relatedTools: "Related tools",
    relatedToolsText:
      "BMI · BMR · TDEE · Calorie Deficit · Body Fat · Waist-to-Hip",
    references: "Named sources",
    referencesText: "ClinCalc, MDCalc, Peterson et al., and Walter & Patel.",
  },
} as const;

function calculateRows(heightIn: number, sex: Sex): FormulaRow[] {
  const over = overFiveFeet(heightIn);
  const hamwiLb = sex === "male" ? 106 + 6 * over : 100 + 5 * over;
  return [
    {
      key: "devine",
      name: "Devine",
      kg: (sex === "male" ? 50 : 45.5) + 2.3 * over,
      formula: {
        zh: "男 50kg / 女 45.5kg + 2.3kg × 超過5英尺英吋",
        en: "Male 50kg / female 45.5kg + 2.3kg × inches over 5 ft",
      },
      note: {
        zh: "常見藥物劑量參考公式",
        en: "Common dosing-reference equation",
      },
      tone: "from-emerald-400 to-teal-500",
    },
    {
      key: "robinson",
      name: "Robinson",
      kg: (sex === "male" ? 52 : 49) + (sex === "male" ? 1.9 : 1.7) * over,
      formula: {
        zh: "男 52kg / 女 49kg + 性別增量 × 超過5英尺英吋",
        en: "Male 52kg / female 49kg + sex-specific increment × inches over 5 ft",
      },
      note: {
        zh: "通常比 Devine 略保守",
        en: "Often slightly more conservative than Devine",
      },
      tone: "from-blue-400 to-indigo-500",
    },
    {
      key: "miller",
      name: "Miller",
      kg:
        (sex === "male" ? 56.2 : 53.1) + (sex === "male" ? 1.41 : 1.36) * over,
      formula: {
        zh: "男 56.2kg / 女 53.1kg + 性別增量 × 超過5英尺英吋",
        en: "Male 56.2kg / female 53.1kg + sex-specific increment × inches over 5 ft",
      },
      note: {
        zh: "基準較高、增量較小",
        en: "Higher base with smaller increment",
      },
      tone: "from-violet-400 to-purple-500",
    },
    {
      key: "hamwi",
      name: "Hamwi",
      kg: hamwiLb * 0.45359237,
      formula: {
        zh: "男 106lb / 女 100lb + 每英吋 6lb 或 5lb",
        en: "Male 106lb / female 100lb + 6lb or 5lb per inch",
      },
      note: {
        zh: "以磅為基礎的常見歷史公式",
        en: "Common historical pound-based equation",
      },
      tone: "from-orange-400 to-amber-500",
    },
  ];
}

export default function IdealWeightCalculator() {
  const { lang, setLang } = useLanguage();
  const t = copy[lang as Lang] ?? copy.en;
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("165");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("5");
  const [currentKg, setCurrentKg] = useState("62");
  const [pounds, setPounds] = useState("137");
  const [sex, setSex] = useState<Sex>("female");

  const heightIn = useMemo(
    () =>
      unitSystem === "metric"
        ? cmToIn(Number(heightCm) || 0)
        : (Number(feet) || 0) * 12 + (Number(inches) || 0),
    [unitSystem, heightCm, feet, inches]
  );
  const currentWeightKg = useMemo(
    () =>
      unitSystem === "metric"
        ? Number(currentKg) || 0
        : lbToKg(Number(pounds) || 0),
    [unitSystem, currentKg, pounds]
  );
  const result = useMemo(() => {
    const rows = calculateRows(heightIn, sex);
    const values = rows.map(row => row.kg);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    const low = Math.min(...values);
    const high = Math.max(...values);
    const heightM = inToCm(heightIn) / 100;
    const bmiLow = 18.5 * heightM * heightM;
    const bmiHigh = 24.9 * heightM * heightM;
    const delta = currentWeightKg - avg;
    return { rows, avg, low, high, bmiLow, bmiHigh, delta };
  }, [heightIn, sex, currentWeightKg]);

  const fillBaselineExample = () => {
    setUnitSystem("metric");
    setSex("female");
    setHeightCm("165");
    setCurrentKg("62");
    setFeet("5");
    setInches("5");
    setPounds("137");
  };
  const fillActiveExample = () => {
    setUnitSystem("metric");
    setSex("male");
    setHeightCm("180");
    setCurrentKg("78");
    setFeet("5");
    setInches("11");
    setPounds("172");
  };
  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(t.shareCopiedToast);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50"
            >
              <span
                className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                {t.chineseShort}
              </span>
              <span
                className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                {t.englishShort}
              </span>
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            {/* L1-Hero */}
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">
                {t.badge}
              </p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                {t.title}
              </h1>
              <p className="text-xl font-black text-emerald-700">
                {t.subtitle}
              </p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                {t.intro}
              </p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <strong>{t.trustNoteLabel}</strong> {t.trustNote}
              </div>
            </section>

            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                {t.quickActionCard}
              </p>
              <h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2>
              <div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white">
                <div className="text-xs font-bold uppercase text-emerald-100">
                  {t.examplePreview}
                </div>
                <div className="mt-1 text-5xl font-black">
                  {fmt(result.avg)}
                </div>
                <div className="text-sm font-bold text-emerald-100">
                  {t.idealUnit}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-black text-slate-500">
                    {t.examplePerson}
                  </div>
                  <div className="font-black">
                    {sex === "female" ? t.female : t.male}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-black text-slate-500">
                    {t.heightCm}
                  </div>
                  <div className="font-black">{fmt(inToCm(heightIn), 0)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-black text-slate-500">
                    {t.currentKg}
                  </div>
                  <div className="font-black">{fmt(currentWeightKg)}</div>
                </div>
              </div>
              <button
                onClick={fillBaselineExample}
                className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                {t.fillExample}
              </button>
              <button
                onClick={fillActiveExample}
                className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100"
              >
                {t.previewActivePath}
              </button>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          {/* L2-L5 Examples Calculator */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            {/* L2 */}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                {t.examplesCalculator}
              </p>
              <h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t.examplesHelper}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
              {/* L3 */}
              <button
                className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}
                onClick={() => setUnitSystem("metric")}
              >
                {t.metric}
              </button>
              <button
                className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}
                onClick={() => setUnitSystem("imperial")}
              >
                {t.imperial}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            {/* L4-L5 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              {/* L4 */}
              <h3 className="text-lg font-black">{t.exampleCards}</h3>
              <div className="mt-4 space-y-3">
                <button
                  onClick={fillBaselineExample}
                  className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left transition hover:border-emerald-500"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black">{t.baselineExample}</span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                      57.7
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    165cm · 62kg · {t.female}
                  </p>
                </button>
                <button
                  onClick={fillActiveExample}
                  className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black">{t.activeExample}</span>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
                      {t.flowDemo}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    180cm · 78kg · {t.male}
                  </p>
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              {/* L5 */}
              <h3 className="text-lg font-black">{t.calculator}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {unitSystem === "metric" ? (
                  <>
                    <label className="block text-sm font-black text-slate-700">
                      {t.heightCm}
                      <input
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold"
                        value={heightCm}
                        onChange={e => setHeightCm(e.target.value)}
                      />
                    </label>
                    <label className="block text-sm font-black text-slate-700">
                      {t.currentKg}
                      <input
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold"
                        value={currentKg}
                        onChange={e => setCurrentKg(e.target.value)}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-black text-slate-700">
                      {t.feet}
                      <input
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold"
                        value={feet}
                        onChange={e => setFeet(e.target.value)}
                      />
                    </label>
                    <label className="block text-sm font-black text-slate-700">
                      {t.inches}
                      <input
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold"
                        value={inches}
                        onChange={e => setInches(e.target.value)}
                      />
                    </label>
                    <label className="block text-sm font-black text-slate-700 md:col-span-2">
                      {t.weightLb}
                      <input
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold"
                        value={pounds}
                        onChange={e => setPounds(e.target.value)}
                      />
                    </label>
                  </>
                )}
                <label className="block text-sm font-black text-slate-700 md:col-span-2">
                  {t.sex}
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold"
                    value={sex}
                    onChange={e => setSex(e.target.value as Sex)}
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          {/* L6-L7 Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            {/* L6 */}
            <div className="h-5 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                {t.resultCard}
              </p>
              <div className="mt-4 flex items-start justify-between gap-5">
                <div>
                  <div className="text-7xl font-black tracking-tight text-slate-950">
                    {fmt(result.avg)}
                  </div>
                  <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                    kg / {fmt(kgToLb(result.avg))} lb
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                  <div className="text-xs font-bold uppercase text-slate-300">
                    {t.coefficientTag}
                  </div>
                  <div className="mt-1 text-xl font-black">
                    {sex === "female" ? t.female : t.male}
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    {fmt(inToCm(heightIn), 0)} cm
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                    {t.primaryValue}
                  </div>
                  <div className="mt-1 text-xs font-black uppercase text-blue-700">
                    {t.avgFormula}
                  </div>
                  <p className="mt-2 text-3xl font-black text-blue-950">
                    {fmt(result.avg)}
                  </p>
                  <p className="text-sm font-bold text-blue-700">kg</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                    {t.bmiRangeLabel}
                  </div>
                  <div className="mt-1 text-xs font-black uppercase text-emerald-700">
                    18.5–24.9
                  </div>
                  <p className="mt-2 text-3xl font-black text-emerald-950">
                    {fmt(result.bmiLow)}–{fmt(result.bmiHigh)}
                  </p>
                  <p className="text-sm font-bold text-emerald-700">kg</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                    {t.currentDeltaLabel}
                  </div>
                  <div className="mt-1 text-xs font-black uppercase text-orange-700">
                    {currentWeightKg >= result.avg ? "+" : "-"}
                  </div>
                  <p className="mt-2 text-3xl font-black text-orange-950">
                    {fmt(Math.abs(result.delta))}
                  </p>
                  <p className="text-sm font-bold text-orange-700">kg</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            {/* L7 */}
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              {t.resultIntelligence}
            </p>
            <h2 className="mt-2 text-3xl font-black">{t.formulaMatrix}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t.formulaMatrixNote}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {result.rows.map(row => (
                <div
                  key={row.key}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black">{row.name}</h3>
                    <span
                      className={`h-3 w-12 rounded-full bg-gradient-to-r ${row.tone}`}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {l(row.note, lang as Lang)}
                  </p>
                  <p className="mt-3 text-2xl font-black text-slate-950">
                    {fmt(row.kg)}{" "}
                    <span className="text-sm text-slate-500">kg</span>
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section
          aria-label="L8 AdSlot #1 廣告位・Advertisement"
          className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"
        >
          {/* L8 */}
          <AdSlot slot="ideal-weight-l8" position="inline" />
        </section>

        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">
            {t.emotionConversionLayer}
          </p>
          <h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {t.conversionNote}
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            {/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                {t.progressInsight}
              </p>
              <h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase text-slate-500">
                    IBW
                  </div>
                  <div className="mt-1 text-3xl font-black">
                    {fmt(result.avg)}
                  </div>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-xs font-black uppercase text-blue-600">
                    {t.dailyGap}
                  </div>
                  <div className="mt-1 text-3xl font-black text-blue-950">
                    {fmt(Math.abs(result.delta))}
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-xs font-black uppercase text-emerald-700">
                    {t.weeklyTrend}
                  </div>
                  <div className="mt-1 text-3xl font-black text-emerald-950">
                    {fmt(result.bmiLow)}
                  </div>
                </div>
              </div>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">
                {t.motivation}
              </p>
              <h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[t.bmiShort, t.bmrShort, t.tdeeShort, t.goalShort].map(
                  item => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            {/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                {t.saveShareJourney}
              </p>
              <h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t.journeyHint}
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                {t.nextActionLabel}
              </p>
              <h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3>
              <ul className="mt-3 space-y-2">
                <li className="flex gap-2 text-sm leading-6 text-slate-700">
                  <span className="font-black text-emerald-600">①</span>
                  <span>{t.nextActionItem1}</span>
                </li>
                <li className="flex gap-2 text-sm leading-6 text-slate-700">
                  <span className="font-black text-emerald-600">②</span>
                  <span>{t.nextActionItem2}</span>
                </li>
                <li className="flex gap-2 text-sm leading-6 text-slate-700">
                  <span className="font-black text-emerald-600">③</span>
                  <span>{t.nextActionItem3}</span>
                </li>
              </ul>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-slate-800"
                >
                  {t.shareLinkBtn}
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                >
                  {t.shareNativeBtn}
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          {/* L11 */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            {t.decisionPath}
          </p>
          <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {[
              { label: t.heightStep, note: t.heightCm },
              { label: t.formulaStep, note: t.formulaRangeLabel },
              { label: t.contextStep, note: t.bmiRangeLabel },
              { label: t.safetyStep, note: t.goalShort },
            ].map((node, index) => (
              <div key={node.label} className="contents">
                <div
                  className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}
                >
                  <div className="text-xs font-black uppercase text-slate-500">
                    {index + 1}
                  </div>
                  <div className="mt-1 text-xl font-black">{node.label}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {node.note}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden text-3xl font-black text-slate-300 md:block">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          {/* L12-L13 */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            {/* L12 */}
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              {t.knowledge}
            </p>
            <h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black">{t.definition}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {t.definitionText}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black">{t.formula}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {t.formulaText}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black">{t.limitations}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {t.limitationsText}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {result.rows
                .filter(row => row.key === "devine" || row.key === "robinson")
                .map(row => (
                  <div
                    key={row.key}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <h3 className="font-black">{row.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {l(row.formula, lang as Lang)} ·{" "}
                      {l(row.note, lang as Lang)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            {/* L13 */}
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              {t.faq}
            </p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-5 space-y-3">
              {faqItems.map(item => (
                <details
                  key={l(item.q, lang as Lang)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <summary className="cursor-pointer font-black">
                    {l(item.q, lang as Lang)}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {l(item.a, lang as Lang)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement"
          className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"
        >
          {/* L14 */}
          <AdSlot slot="ideal-weight-faq" position="inline" />
        </section>

        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
          {/* L15-L16 */}
          <section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            {/* L15 */}
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              {t.affiliate}
            </p>
            <h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              {affiliateItems.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950 transition hover:border-emerald-500 hover:bg-emerald-100"
                >
                  {l(item.label, lang as Lang)}
                </a>
              ))}
            </div>
            <p className="mt-3 text-xs text-emerald-700">
              {lang === "zh"
                ? "* 聯盟連結，購買後我們可能獲得佣金。"
                : "* Affiliate links. We may earn a commission."}
            </p>
          </section>
          <PremiumGate plan="PRO">
            <article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7">
              {/* L16 */}
              <h2 className="text-3xl font-black text-slate-950">
                {t.premiumTitle}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
                {t.premiumText}
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {[t.bmiShort, t.tdeeShort, t.calorieCycles, t.reports].map(
                  item => (
                    <div
                      key={item}
                      className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </article>
          </PremiumGate>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          {/* L17 */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            {t.trustReferences}
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div>
              <h2 className="text-xl font-black">{t.trust}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {t.trustText}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-black">{t.relatedTools}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {t.relatedToolsText}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-black">{t.references}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {t.referencesText}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {sources.map(source => (
              <a
                key={source.url}
                href={source.url}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800"
              >
                {source.title}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
