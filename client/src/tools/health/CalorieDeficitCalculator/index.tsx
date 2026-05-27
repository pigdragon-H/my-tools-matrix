import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type Lang = "zh" | "en";
type DeficitLevel = "dangerous" | "aggressive" | "moderate" | "conservative" | "surplus";
type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: DeficitLevel;
  label: LocalText;
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
    tone: "from-red-700 via-purple-800 to-slate-950",
    meaning: { zh: "每日赤字 > 1000 卡路里，可能導致肌肉流失、營養不足、代謝下降。" , en: "Daily deficit > 1000 calories, may cause muscle loss, malnutrition, metabolic slowdown." },
    risks: { zh: "極端赤字可能導致疲勞、免疫下降、激素失衡、肌肉流失。不建議長期使用。", en: "Extreme deficit may cause fatigue, immune suppression, hormonal imbalance, muscle loss. Not recommended long-term." },
    actions: { zh: "不建議。如需快速減重，請在專業指導下進行，並定期監測健康指標。", en: "Not recommended. If rapid weight loss is needed, do so under professional guidance with regular health monitoring." },
    nextTool: { zh: "專業營養師諮詢", en: "Professional Nutritionist Consultation" },
  },
  {
    key: "aggressive",
    label: { zh: "激進赤字", en: "Aggressive Deficit" },
    tone: "from-orange-400 via-red-400 to-red-600",
    meaning: { zh: "每日赤字 750-1000 卡路里，快速減重但風險較高。", en: "Daily deficit 750-1000 calories, rapid weight loss but higher risk." },
    risks: { zh: "可能導致肌肉流失、疲勞、代謝適應。需要充足蛋白質和營養。", en: "May cause muscle loss, fatigue, metabolic adaptation. Requires adequate protein and nutrition." },
    actions: { zh: "建議配合高蛋白飲食、阻力訓練、充足睡眠。定期評估進度。", en: "Combine with high-protein diet, resistance training, adequate sleep. Monitor progress regularly." },
    nextTool: { zh: "蛋白質計算機", en: "Protein Calculator" },
  },
  {
    key: "moderate",
    label: { zh: "適度赤字", en: "Moderate Deficit" },
    tone: "from-yellow-300 via-orange-300 to-orange-500",
    meaning: { zh: "每日赤字 500-750 卡路里，健康減重速度約 0.5-1 kg/週。", en: "Daily deficit 500-750 calories, healthy weight loss rate ~0.5-1 kg/week." },
    risks: { zh: "適度赤字通常安全，但仍需注意營養均衡和運動。", en: "Moderate deficit is usually safe, but nutrition balance and exercise are still important." },
    actions: { zh: "維持規律運動、均衡飲食、充足睡眠。每週檢查體重變化。", en: "Maintain regular exercise, balanced diet, adequate sleep. Check weight weekly." },
    nextTool: { zh: "TDEE 計算機", en: "TDEE Calculator" },
  },
  {
    key: "conservative",
    label: { zh: "保守赤字", en: "Conservative Deficit" },
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "每日赤字 250-500 卡路里，緩慢減重約 0.25-0.5 kg/週。", en: "Daily deficit 250-500 calories, slow weight loss ~0.25-0.5 kg/week." },
    risks: { zh: "保守赤字風險最低，適合長期減重。", en: "Conservative deficit has lowest risk, suitable for long-term weight loss." },
    actions: { zh: "適合長期堅持。配合運動、充足蛋白質、定期評估。", en: "Suitable for long-term adherence. Combine with exercise, adequate protein, regular assessment." },
    nextTool: { zh: "BMI 計算機", en: "BMI Calculator" },
  },
  {
    key: "surplus",
    label: { zh: "熱量盈餘", en: "Calorie Surplus" },
    tone: "from-red-500 via-rose-600 to-purple-700",
    meaning: { zh: "每日攝取 > TDEE，用於增肌或恢復。", en: "Daily intake > TDEE, used for muscle gain or recovery." },
    risks: { zh: "盈餘可能導致脂肪增加。需要配合阻力訓練以最大化肌肉增長。", en: "Surplus may cause fat gain. Requires resistance training to maximize muscle growth." },
    actions: { zh: "配合阻力訓練、充足蛋白質（1.6-2.2g/kg）、充足睡眠。", en: "Combine with resistance training, adequate protein (1.6-2.2g/kg), sufficient sleep." },
    nextTool: { zh: "BMR 計算機", en: "BMR Calculator" },
  },
];

const ui = {
  zh: {
    badge: "健康 · 熱量管理 · Gold Tool",
    title: "熱量赤字計算機・體重管理指南",
    subtitle: "熱量赤字計算機引導體驗",
    intro: "根據 TDEE 和每日攝取計算熱量赤字，快速了解您的減重速度和策略，並延伸到營養規劃、運動計畫等下一步工具。",
    trustNoteLabel: "信任提醒：",
    trustNote: "熱量赤字是減重的基礎，但不是唯一因素。運動、睡眠、壓力、激素等都會影響體重變化。",
    quickActionCard: "快速範例卡",
    tryCommonDeficitExample: "試用常見赤字範例",
    deficitPreview: "赤字預覽",
    example: "範例",
    conservativeExample: "保守減重",
    aggressiveExample: "快速減重",
    weight: "體重",
    deficit: "赤字",
    oneClickFillConservativeExample: "一鍵填入保守減重範例",
    previewAggressiveDeficitPath: "預覽快速減重決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的數值調整輸入而不失去脈絡。",
    exampleCards: "範例卡",
    aggressiveDeficitPathDemo: "快速減重路徑示範",
    oneClickFillAllowed: "TDEE 2500 · 可一鍵填入",
    highDeficitPathDescription: "TDEE 2000 · 展示赤字 → 體重變化 → 營養規劃路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    tdee: "TDEE（每日熱量消耗）",
    dailyIntake: "每日攝取（卡路里）",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "狀態",
    weeklyWeightChange: "每週體重變化",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretDeficitBeforeActing: "行動前先理解赤字等級",
    knowledge: "知識",
    deficitMeaning: "熱量赤字在健康宇宙中的意義",
    definition: "定義",
    definitionText: "熱量赤字是指每日攝取熱量少於消耗熱量的差值。赤字越大，減重越快，但風險也越高。",
    limitations: "限制",
    limitationsText: "熱量赤字無法考慮運動類型、肌肉質量、激素變化等因素。實際體重變化可能有差異。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "TDEE、BMR、蛋白質需求、運動計畫等工具可擴展結果情境。",
    formula: "計算公式",
    formulaText: "赤字 = TDEE - 每日攝取；每週體重變化 = 赤字 × 7 ÷ 7700（1 kg 脂肪 ≈ 7700 卡路里）",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "熱量赤字是減重的基礎，但需結合運動、營養、睡眠等多方面因素。建議在專業指導下進行。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "美國運動醫學會（ACSM）、國際運動營養學會（ISSN）、NIH 體重管理指引。",
  },
  en: {
    badge: "Health · Calorie Management · Gold Tool",
    title: "Calorie Deficit Calculator · Weight Management Guide",
    subtitle: "Calorie Deficit Calculator guided experience",
    intro: "Calculate your calorie deficit based on TDEE and daily intake, quickly understand your weight loss rate and strategy, and continue to nutrition planning, exercise plans, and other next tools.",
    trustNoteLabel: "Trust note:",
    trustNote: "Calorie deficit is the foundation of weight loss, but not the only factor. Exercise, sleep, stress, hormones, and other factors also affect weight change.",
    quickActionCard: "Quick Action Card",
    tryCommonDeficitExample: "Try a common deficit example",
    deficitPreview: "Deficit preview",
    example: "Example",
    conservativeExample: "Conservative weight loss",
    aggressiveExample: "Rapid weight loss",
    weight: "Weight",
    deficit: "Deficit",
    oneClickFillConservativeExample: "One-click fill conservative weight loss example",
    previewAggressiveDeficitPath: "Preview rapid weight loss decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    exampleCards: "Example cards",
    aggressiveDeficitPathDemo: "Rapid weight loss path demo",
    oneClickFillAllowed: "TDEE 2500 · one-click fill allowed",
    highDeficitPathDescription: "TDEE 2000 · shows Deficit → Weight Change → Nutrition Planning path",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    tdee: "TDEE (Total Daily Energy Expenditure)",
    dailyIntake: "Daily Intake (Calories)",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Status",
    weeklyWeightChange: "Weekly Weight Change",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretDeficitBeforeActing: "Interpret the deficit level before acting",
    knowledge: "Knowledge",
    deficitMeaning: "What Calorie Deficit means in the Health universe",
    definition: "Definition",
    definitionText: "Calorie deficit is the difference between daily calorie intake and expenditure. The larger the deficit, the faster the weight loss, but the higher the risk.",
    limitations: "Limitations",
    limitationsText: "Calorie deficit cannot account for exercise type, muscle mass, hormonal changes, and other factors. Actual weight change may vary.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "TDEE, BMR, Protein Requirements, Exercise Plans, and other tools expand the result context.",
    formula: "Calculation Formula",
    formulaText: "Deficit = TDEE - Daily Intake; Weekly Weight Change = Deficit × 7 ÷ 7700 (1 kg fat ≈ 7700 calories)",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "Calorie deficit is the foundation of weight loss, but requires combining exercise, nutrition, sleep, and other factors. Professional guidance is recommended.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "American College of Sports Medicine (ACSM), International Society of Sports Nutrition (ISSN), NIH Weight Management Guidelines.",
  },
} as const;

function getDeficitInfo(deficit: number): CategoryInfo {
  if (deficit > 1000) return deficitInfo[0];
  if (deficit > 750) return deficitInfo[1];
  if (deficit > 250) return deficitInfo[2];
  if (deficit >= 0) return deficitInfo[3];
  return deficitInfo[4];
}

function formatCalories(value: number): string {
  return Number.isFinite(value) ? Math.round(value).toString() : "—";
}

function formatWeight(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

export default function CalorieDeficitCalculator() {
  const { lang, setLang } = useLanguage();
  const [tdee, setTdee] = useState("2000");
  const [dailyIntake, setDailyIntake] = useState("1500");

  const t = ui[lang];

  const calculation = useMemo(() => {
    const tdeeVal = Number(tdee);
    const intakeVal = Number(dailyIntake);
    if (!tdeeVal || !intakeVal || tdeeVal <= 0 || intakeVal < 0) return null;
    
    const deficit = tdeeVal - intakeVal;
    const weeklyWeightChange = (deficit * 7) / 7700;
    const deficitCategory = getDeficitInfo(Math.abs(deficit));
    
    return { deficit, weeklyWeightChange, deficitCategory };
  }, [tdee, dailyIntake]);

  const activeDeficitInfo = calculation?.deficitCategory ?? deficitInfo[2];
  const displayDeficit = calculation?.deficit ? formatCalories(Math.abs(calculation.deficit)) : "—";
  const displayWeeklyChange = calculation?.weeklyWeightChange ? formatWeight(calculation.weeklyWeightChange) : "—";
  const deficitType = calculation?.deficit ?? 0 >= 0 ? "deficit" : "surplus";

  function fillConservativeExample() {
    setTdee("2000");
    setDailyIntake("1750");
  }

  function fillAggressiveExample() {
    setTdee("2500");
    setDailyIntake("1750");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      {/* Hero Section */}
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
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonDeficitExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.deficitPreview}</div>
                  <div className="text-3xl font-black">500</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.conservativeExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">TDEE</div><div className="mt-1 text-lg font-black">2000</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.deficit}</div><div className="mt-1 text-lg font-black">500</div></div>
              </div>
              <button onClick={fillConservativeExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">
                {t.oneClickFillConservativeExample}
              </button>
              <button onClick={fillAggressiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">
                {t.previewAggressiveDeficitPath}
              </button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          {/* Calculator Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p>
                <h2 className="mt-2 text-3xl font-black">{t.enterOrFillValues}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillConservativeExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.conservativeExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">500</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillAggressiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.aggressiveExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.highDeficitPathDescription}</p>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.calculator}</h3>
                <div className="mt-4 grid gap-4">
                  <label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.dailyIntake}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={dailyIntake} onChange={(e) => setDailyIntake(e.target.value)} /></label>
                </div>
              </div>
            </div>
          </section>

          {/* Result Section */}
          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeDeficitInfo.tone}`} aria-label="Color band placeholder" />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-7xl font-black tracking-tight text-slate-950">{displayDeficit}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{calculation ? l(activeDeficitInfo.label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.status}</div>
                    <div className="mt-1 text-xl font-black">{displayWeeklyChange}</div>
                    <div className="mt-1 text-xs text-slate-300">{t.weeklyWeightChange}</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.weeklyWeightChange}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeDeficitInfo.meaning, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeDeficitInfo.actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950">{l(activeDeficitInfo.nextTool, lang)}</p></div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretDeficitBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {deficitInfo.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeDeficitInfo.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                    <h3 className="font-black">{l(item.label, lang)}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.meaning, lang)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* Knowledge Section */}
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
          </section>

          {/* FAQ Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "多大的赤字才安全？" : "What deficit size is safe?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "每週 0.5-1 kg 的減重速度（每日赤字 500-750 卡）通常被認為是安全的。" : "Weight loss of 0.5-1 kg per week (daily deficit 500-750 calories) is usually considered safe."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "赤字越大越好嗎？" : "Is a larger deficit always better?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "不是。過大的赤字可能導致肌肉流失、疲勞、代謝下降。適度赤字更可持續。" : "No. Excessive deficit may cause muscle loss, fatigue, metabolic slowdown. Moderate deficit is more sustainable."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "赤字中應該吃什麼？" : "What should I eat in a deficit?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "高蛋白（1.6-2.2g/kg）、充足纖維、微量營養素。優先吃飽腹感強的食物。" : "High protein (1.6-2.2g/kg), adequate fiber, micronutrients. Prioritize satiating foods."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "赤字時應該運動嗎？" : "Should I exercise in a deficit?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "是的。阻力訓練可以保留肌肉，有氧運動可以增加赤字。兩者結合效果最好。" : "Yes. Resistance training preserves muscle, cardio increases deficit. Combining both is best."}</p>
              </div>
            </div>
          </section>

          {/* Related Tools Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.relatedTools}</p>
            <h2 className="mt-2 text-3xl font-black">{t.semanticNeighbors}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <a href="/tools/health/tdee-calculator" className="rounded-2xl border border-blue-200 bg-blue-50 p-4 transition hover:border-blue-500">
                <h3 className="font-black text-blue-900">TDEE {lang === "zh" ? "計算機" : "Calculator"}</h3>
                <p className="mt-2 text-sm text-blue-800">{lang === "zh" ? "計算每日熱量消耗" : "Calculate daily energy expenditure"}</p>
              </a>
              <a href="/tools/health/bmr-calculator" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400">
                <h3 className="font-black">BMR {lang === "zh" ? "計算機" : "Calculator"}</h3>
                <p className="mt-2 text-sm text-slate-700">{lang === "zh" ? "計算基礎代謝率" : "Calculate basal metabolic rate"}</p>
              </a>
              <a href="/tools/health/bmi-calculator" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400">
                <h3 className="font-black">BMI {lang === "zh" ? "計算機" : "Calculator"}</h3>
                <p className="mt-2 text-sm text-slate-700">{lang === "zh" ? "評估體重狀況" : "Assess weight status"}</p>
              </a>
            </div>
          </section>

          {/* References Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.references}</p>
            <h2 className="mt-2 text-3xl font-black">{t.trustRelatedReferences}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-black mb-3">{t.trust}</h3>
                <p className="text-sm leading-6 text-slate-700">{t.trustText}</p>
              </div>
              <div>
                <h3 className="font-black mb-3">{t.references}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://www.acsm.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ACSM - American College of Sports Medicine</a></li>
                  <li><a href="https://www.issn.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ISSN - International Society of Sports Nutrition</a></li>
                  <li><a href="https://www.nih.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">NIH - National Institutes of Health</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Ad Slots */}
          <AdSlot slot="calorie-deficit-knowledge" position="bottom" />
        </div>
      </div>

      {/* Sidebar with Premium Gate */}
      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="calorie-deficit-sidebar" position="top" />
        <PremiumGate />
        <AdSlot slot="calorie-deficit-sidebar" position="bottom" />
      </div>

      {/* Footer Ad */}
      <AdSlot slot="calorie-deficit-footer" position="footer" />
    </main>
  );
}
