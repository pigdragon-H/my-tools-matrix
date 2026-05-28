import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type Lang = "zh" | "en";
type DeficitLevel = "dangerous" | "aggressive" | "moderate" | "conservative" | "surplus";
type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: DeficitLevel;
  label: LocalText;
  range: string;
  tone: string;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const deficitInfo: CategoryInfo[] = [
  {
    key: "dangerous",
    label: { zh: "危險赤字", en: "Dangerous Deficit" },
    range: "> 1000 cal",
    tone: "from-red-600 via-red-500 to-orange-400",
    meaning: { zh: "每日赤字超過 1000 卡，極端風險，不建議採用。", en: "Daily deficit > 1000 cal, extreme risk, not recommended." },
    risks: { zh: "可能導致肌肉流失、代謝下降、營養不足、健康問題。", en: "May cause muscle loss, metabolic slowdown, malnutrition, health issues." },
    actions: { zh: "不建議採用。如需快速減重，請諮詢醫生或營養師。", en: "Not recommended. Consult doctor or nutritionist for rapid weight loss." },
    nextTool: { zh: "營養師諮詢", en: "Nutritionist Consultation" },
  },
  {
    key: "aggressive",
    label: { zh: "激進赤字", en: "Aggressive Deficit" },
    range: "750-1000 cal",
    tone: "from-orange-500 via-orange-400 to-yellow-300",
    meaning: { zh: "每日赤字 750-1000 卡，快速減重（約 1.5-2 kg/週），需謹慎監控。", en: "Daily deficit 750-1000 cal, rapid weight loss (~1.5-2 kg/week), requires careful monitoring." },
    risks: { zh: "可能導致肌肉流失、疲勞、營養不足。需要充足蛋白質和監控。", en: "May cause muscle loss, fatigue, malnutrition. Requires adequate protein and monitoring." },
    actions: { zh: "確保充足蛋白質、規律運動、充足睡眠、定期檢查。", en: "Ensure adequate protein, regular exercise, sufficient sleep, regular check-ups." },
    nextTool: { zh: "蛋白質計算機", en: "Protein Calculator" },
  },
  {
    key: "moderate",
    label: { zh: "適度赤字", en: "Moderate Deficit" },
    range: "500-750 cal",
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "每日赤字 500-750 卡，健康減重（約 0.5-1 kg/週），推薦標準。", en: "Daily deficit 500-750 cal, healthy weight loss (~0.5-1 kg/week), recommended." },
    risks: { zh: "適度赤字是科學減重的標準，風險最低，效果最佳。", en: "Moderate deficit is the scientific standard for weight loss, lowest risk, best results." },
    actions: { zh: "維持規律運動、均衡飲食、充足睡眠、定期監控進度。", en: "Maintain regular exercise, balanced diet, sufficient sleep, regular progress monitoring." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
  {
    key: "conservative",
    label: { zh: "保守赤字", en: "Conservative Deficit" },
    range: "250-500 cal",
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "每日赤字 250-500 卡，緩慢減重（約 0.25-0.5 kg/週），適合長期計劃。", en: "Daily deficit 250-500 cal, slow weight loss (~0.25-0.5 kg/week), suitable for long-term plans." },
    risks: { zh: "保守赤字風險最低，但減重速度較慢，需要耐心。", en: "Conservative deficit has the lowest risk, but slower weight loss requires patience." },
    actions: { zh: "適合長期減重計劃，維持規律運動和均衡飲食。", en: "Suitable for long-term weight loss plans, maintain regular exercise and balanced diet." },
    nextTool: { zh: "BMI 計算機", en: "BMI Calculator" },
  },
  {
    key: "surplus",
    label: { zh: "熱量盈餘", en: "Calorie Surplus" },
    range: "< 0 cal",
    tone: "from-purple-500 via-pink-400 to-rose-300",
    meaning: { zh: "每日攝取 > TDEE，熱量盈餘，用於增肌或增重。", en: "Daily intake > TDEE, calorie surplus, used for muscle gain or weight gain." },
    risks: { zh: "盈餘模式適合增肌，但需控制盈餘量避免過度增脂。", en: "Surplus mode is for muscle gain, but control surplus amount to avoid excess fat gain." },
    actions: { zh: "確保充足蛋白質、進行阻力訓練、監控體脂變化。", en: "Ensure adequate protein, perform resistance training, monitor body fat changes." },
    nextTool: { zh: "蛋白質計算機", en: "Protein Calculator" },
  },
];

const ui = {
  zh: {
    badge: "健康 · 體重管理 · Gold Tool",
    title: "熱量赤字計算機・體重管理指南",
    subtitle: "熱量赤字計算機引導體驗",
    intro: "根據 TDEE 和每日攝取計算熱量赤字，快速了解您的減重進度，並規劃科學的體重管理策略。",
    trustNoteLabel: "信任提醒：",
    trustNote: "熱量赤字是減重的基礎，但需結合運動和營養管理。建議在專業指導下進行。",
    quickActionCard: "快速範例卡",
    tryCommonDeficitExample: "試用常見赤字等級範例",
    deficitPreview: "赤字預覽",
    example: "範例",
    aggressiveExample: "激進減重者",
    conservativeExample: "保守減重者",
    tdee: "TDEE",
    intake: "每日攝取",
    oneClickFillAggressiveExample: "一鍵填入激進減重範例",
    previewConservativePath: "預覽保守減重決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的數值調整輸入而不失去脈絡。",
    exampleCards: "範例卡",
    conservativePathDemo: "保守減重路徑示範",
    oneClickFillAllowed: "TDEE 2200 · 可一鍵填入",
    aggressivePathDescription: "TDEE 2500 · 展示激進赤字 → 體重變化 → 營養計劃路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    tdeeInput: "TDEE（kcal）",
    intakeInput: "每日攝取（kcal）",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "狀態",
    deficitAmount: "赤字金額",
    weeklyWeightChange: "每週體重變化",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretDeficitBeforeActing: "行動前先理解赤字等級",
    knowledge: "知識",
    deficitMeaning: "熱量赤字在健康宇宙中的意義",
    definition: "定義",
    definitionText: "熱量赤字是指每日攝取熱量少於 TDEE 的差值。赤字 = TDEE - 每日攝取。每週赤字 7700 卡 ≈ 減少 1 kg 體重。",
    limitations: "限制",
    limitationsText: "熱量赤字是減重的必要條件，但不是充分條件。還需考慮運動、營養、睡眠等因素。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "TDEE、BMR、BMI、理想體重、蛋白質計算機等工具可擴展結果情境。",
    formula: "計算公式",
    formulaText: "赤字 = TDEE - 每日攝取；每週體重變化 = 赤字 × 7 ÷ 7700",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "熱量赤字是減重的基礎，但需結合運動、營養、睡眠等多方面因素。建議在專業指導下進行。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "美國運動醫學會（ACSM）、國際運動營養學會（ISSN）、CDC 體重管理指引。",
    recommendedProducts: "配合熱量赤字使用的健康工具",
  },
  en: {
    badge: "Health · Weight Management · Gold Tool",
    title: "Calorie Deficit Calculator · Weight Management Guide",
    subtitle: "Calorie Deficit Calculator guided experience",
    intro: "Calculate your calorie deficit based on TDEE and daily intake, quickly understand your weight loss progress, and plan a scientific weight management strategy.",
    trustNoteLabel: "Trust note:",
    trustNote: "Calorie deficit is the foundation of weight loss, but requires combining with exercise and nutrition management. Professional guidance is recommended.",
    quickActionCard: "Quick Action Card",
    tryCommonDeficitExample: "Try a common deficit level example",
    deficitPreview: "Deficit preview",
    example: "Example",
    aggressiveExample: "Aggressive weight loser",
    conservativeExample: "Conservative weight loser",
    tdee: "TDEE",
    intake: "Daily Intake",
    oneClickFillAggressiveExample: "One-click fill aggressive weight loss example",
    previewConservativePath: "Preview conservative weight loss decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    exampleCards: "Example cards",
    conservativePathDemo: "Conservative weight loss path demo",
    oneClickFillAllowed: "TDEE 2200 · one-click fill allowed",
    aggressivePathDescription: "TDEE 2500 · shows Aggressive Deficit → Weight Change → Nutrition Plan path",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    tdeeInput: "TDEE (kcal)",
    intakeInput: "Daily Intake (kcal)",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Status",
    deficitAmount: "Deficit Amount",
    weeklyWeightChange: "Weekly Weight Change",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretDeficitBeforeActing: "Interpret deficit level before acting",
    knowledge: "Knowledge",
    deficitMeaning: "What Calorie Deficit means in the Health universe",
    definition: "Definition",
    definitionText: "Calorie deficit is the difference between daily intake and TDEE. Deficit = TDEE - Daily Intake. Weekly deficit of 7700 cal ≈ 1 kg weight loss.",
    limitations: "Limitations",
    limitationsText: "Calorie deficit is necessary but not sufficient for weight loss. Also consider exercise, nutrition, sleep, and other factors.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "TDEE, BMR, BMI, Ideal Weight, Protein Calculator, and other tools expand the result context.",
    formula: "Calculation Formula",
    formulaText: "Deficit = TDEE - Daily Intake; Weekly Weight Change = Deficit × 7 ÷ 7700",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "Calorie deficit is the foundation of weight loss, but requires combining with exercise, nutrition, sleep, and other factors. Professional guidance is recommended.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "American College of Sports Medicine (ACSM), International Society of Sports Nutrition (ISSN), CDC Weight Management Guidelines.",
    recommendedProducts: "Health tools to use with calorie deficit",
  },
} as const;

function getDeficitLevel(deficit: number): DeficitLevel {
  if (deficit > 1000) return "dangerous";
  if (deficit >= 750) return "aggressive";
  if (deficit >= 500) return "moderate";
  if (deficit >= 250) return "conservative";
  return "surplus";
}

function formatCalories(value: number): string {
  return Number.isFinite(value) ? Math.round(value).toString() : "—";
}

export default function CalorieDeficitCalculator() {
  const { lang, setLang } = useLanguage();
  const [tdee, setTdee] = useState("2200");
  const [intake, setIntake] = useState("1700");

  const t = ui[lang];

  const calculation = useMemo(() => {
    const tdeeVal = Number(tdee);
    const intakeVal = Number(intake);
    if (!tdeeVal || !intakeVal || tdeeVal <= 0 || intakeVal <= 0) return null;
    const deficit = tdeeVal - intakeVal;
    const level = getDeficitLevel(deficit);
    const weeklyChange = (deficit * 7) / 7700;
    return { deficit, level, weeklyChange };
  }, [tdee, intake]);

  const activeDeficitInfo = calculation?.level ? deficitInfo.find((d) => d.key === calculation.level) : deficitInfo[2];
  const displayDeficit = calculation?.deficit ? formatCalories(calculation.deficit) : "—";
  const displayWeekly = calculation?.weeklyChange ? calculation.weeklyChange.toFixed(2) : "—";

  function fillAggressiveExample() {
    setTdee("2500");
    setIntake("1750");
  }

  function fillConservativeExample() {
    setTdee("2200");
    setIntake("1700");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50">
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
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonDeficitExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.deficitPreview}</div>
                  <div className="text-3xl font-black">500 cal</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.aggressiveExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.tdee}</div><div className="mt-1 text-lg font-black">2500</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.intake}</div><div className="mt-1 text-lg font-black">1750</div></div>
              </div>
              <button onClick={fillAggressiveExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">{t.oneClickFillAggressiveExample}</button>
              <button onClick={fillConservativeExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewConservativePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterOrFillValues}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillAggressiveExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.aggressiveExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">750 cal</span></div>
                    <p className="mt-2 text-sm text-slate-600">TDEE 2500 · {lang === "zh" ? "快速減重" : "Rapid weight loss"}</p>
                  </button>
                  <button onClick={fillConservativeExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.conservativeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.aggressivePathDescription}</p>
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.calculator}</h3>
                <div className="mt-4 grid gap-4">
                  <label className="block text-sm font-black text-slate-700">{t.tdeeInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.intakeInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={intake} onChange={(e) => setIntake(e.target.value)} /></label>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeDeficitInfo?.tone}`} />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-7xl font-black tracking-tight text-slate-950">{displayDeficit}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{calculation ? l(activeDeficitInfo?.label || deficitInfo[2].label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.weeklyWeightChange}</div>
                    <div className="mt-1 text-xl font-black">{displayWeekly} kg</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.deficitAmount}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeDeficitInfo?.meaning || deficitInfo[2].meaning, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeDeficitInfo?.actions || deficitInfo[2].actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950">{l(activeDeficitInfo?.nextTool || deficitInfo[2].nextTool, lang)}</p></div>
                </div>
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretDeficitBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {deficitInfo.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeDeficitInfo?.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-center justify-between gap-2"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.meaning, lang)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <AdSenseWrapper showAds={true} adFormat="horizontal" />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.deficitMeaning}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-black">{t.definition}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.definitionText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.formula}</h3>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700">{t.formulaText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.limitations}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.limitationsText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.semanticNeighbors}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.semanticNeighborsText}</p>
              </div>
            </div>
            <div className="mt-6">
              <AdSlot slot="calorie-deficit-knowledge" position="middle" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "多大的赤字才是安全的？" : "What deficit size is safe?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "適度赤字 500-750 cal/天（0.5-1 kg/週）是最安全且可持續的。激進赤字需要醫學監督。" : "Moderate deficit 500-750 cal/day (0.5-1 kg/week) is safest and most sustainable. Aggressive deficit requires medical supervision."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "赤字越大越好嗎？" : "Is a larger deficit always better?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "不是。過大赤字可能導致肌肉流失、代謝下降、營養不足。適度赤字效果最佳。" : "No. Excessive deficit may cause muscle loss, metabolic slowdown, malnutrition. Moderate deficit works best."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "赤字中應該吃什麼？" : "What should I eat in a deficit?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "優先蛋白質（保護肌肉）、纖維（飽腹感）、微量營養素。避免過度加工食品。" : "Prioritize protein (preserve muscle), fiber (satiety), micronutrients. Avoid ultra-processed foods."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "赤字中應該運動嗎？" : "Should I exercise in a deficit?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "是的。阻力訓練保護肌肉，有氧運動增加赤字。結合兩者效果最佳。" : "Yes. Resistance training preserves muscle, cardio increases deficit. Combining both works best."}</p>
              </div>
            </div>
          </section>

          <AdSlot slot="calorie-deficit-faq" position="inline" />

          {/* SAVE/SHARE Section */}
          <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{lang === "zh" ? "減重旅程" : "Weight Loss Journey"}</p>
              <h2 className="mt-2 text-3xl font-black">{lang === "zh" ? "從赤字到目標體重" : "From Deficit to Goal Weight"}</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 1" : "Step 1"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "計算赤字" : "Calculate Deficit"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "確定每日熱量目標" : "Determine daily calorie goal"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 2" : "Step 2"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "評估風險" : "Assess Risk"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "了解赤字等級安全性" : "Understand deficit level safety"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 3" : "Step 3"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "制定計畫" : "Create Plan"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "根據建議調整飲食" : "Adjust diet per recommendations"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{lang === "zh" ? "步驟 4" : "Step 4"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "持續監控" : "Monitor Progress"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "追蹤體重變化" : "Track weight changes"}</p>
                  </div>
                </div>
              </div>
            </div>

            <article className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{lang === "zh" ? "儲存 / 分享位置" : "Save / Share Placeholder"}</p>
              <h3 className="mt-2 text-xl font-black">{lang === "zh" ? "儲存結果或分享旅程" : "Save this result or share the journey"}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "僅 UI 佔位符。不包含帳號、儲存、分享或匯出實現。" : "UI placeholder only. No account, storage, sharing, or export implementation is included in this prototype."}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-slate-800">{lang === "zh" ? "儲存" : "Save"}<br /><span className="text-xs font-normal">UI</span></button>
                <button className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-slate-50">{lang === "zh" ? "分享" : "Share"}<br /><span className="text-xs font-normal">UI</span></button>
              </div>
            </article>
          </section>

          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦商品" : "Recommended"}</p>
            <h2 className="mt-2 text-2xl font-black">{t.recommendedProducts}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "食物秤", en: "Food Scale", href: "#affiliate-scale"}, {zh: "熱量計算 App", en: "Calorie App", href: "#affiliate-app"}, {zh: "蛋白質補充品", en: "Protein Powder", href: "#affiliate-protein"}, {zh: "減重計畫書", en: "Diet Plans", href: "#affiliate-plans"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
            </div>
            <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </section>

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
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">TDEE · BMR · BMI · {lang === "zh" ? "理想體重" : "Ideal Weight"}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><ul className="mt-2 space-y-1 text-sm text-slate-700"><li><a href="https://www.acsm.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ACSM</a></li><li><a href="https://www.issn.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ISSN</a></li><li><a href="https://www.cdc.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CDC</a></li></ul></div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="calorie-deficit-sidebar" position="top" />
        <PremiumGate plan="PRO" />
        <AdSlot slot="calorie-deficit-sidebar" position="bottom" />
      </div>

      <AdSlot slot="calorie-deficit-footer" position="footer" />
    </main>
  );
}
