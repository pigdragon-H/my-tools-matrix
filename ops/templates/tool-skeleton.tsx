/**
 * Tool Skeleton · 17-Layer Anatomy（v1.1 · 校正本）
 * ==============================================================
 * 直接複製這個檔案到 client/src/tools/{category}/{ToolName}/index.tsx
 * 然後依序：
 *   1. 把所有 `__TOOL_NAME__` 改成 PascalCase 工具名（例：BmiCalculator）
 *   2. 把所有 `__SLUG__` 改成 kebab-case slug（例：bmi-calculator）
 *   3. 補實 categoryInfo（依 spec §3，**固定 6 個**分類）
 *   4. 補實 calculation 函式（依 spec §4，公式必須有權威來源）
 *   5. 把 i18n keys 從 locales 帶進來（locales/zh.ts、locales/en.ts 已對齊）
 *
 * 切勿：
 *   ❌ 改變 17 層順序或新增/移除 layer
 *   ❌ 改變 4 種「2 列布局」的 lg 比例
 *   ❌ 把中英文寫死在 JSX
 *   ❌ 移除 AdSense / AdSlot / PremiumGate
 *   ❌ 把 categoryInfo 改成不是 6 個
 *
 * 17 層對照表（與 SOP §1 同步）：
 *   L1  Hero 文字（Hero 2 列：左欄，lg [1.05fr 0.95fr]）
 *   L2  Lang Switcher（Hero 頂部）
 *   L3  Quick Action Card（Hero 2 列：右欄）
 *   L4  Examples 卡（計算機 2 列：左欄，lg [0.9fr 1.1fr]）
 *   L5  Calculator Inputs（計算機 2 列：右欄）
 *   L6  Result Card（結果 2 列：左欄，lg [0.95fr 1.05fr]）
 *   L7  Result Intelligence — 6 格全部列出（結果 2 列：右欄）
 *   L8  AdSense 中段橫幅
 *   L9  Emotion + Conversion 上排（lg [1fr 0.9fr]：Progress + Motivation）
 *   L10 Emotion + Conversion 下排（lg [1fr 0.8fr]：Journey + Save/Share）
 *   L11 Decision Path（4 步橫向）
 *   L12 Knowledge（Knowledge+FAQ 2 列：左欄，lg [1fr 0.9fr]）
 *   L13 FAQ（Knowledge+FAQ 2 列：右欄）
 *   L14 AdSlot post-FAQ
 *   L15 Affiliate（推薦商品 4 格）
 *   L16 Premium Gate
 *   L17 Trust · Related · References（三欄並排）
 * ==============================================================
 */

import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import zhStrings from "./locales/zh";
import enStrings from "./locales/en";

// ============================================================
// Types（依 spec §3，**固定 6 個分類 keys**）
// ============================================================

type Lang = "zh" | "en";
type UnitSystem = "metric" | "imperial";

// ⚠️ 校正本明定：結果分類固定為 6 個。把這 6 個 key 換成你的工具的分類。
type ResultCategoryKey =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6";

type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: ResultCategoryKey;
  label: LocalText;
  range: LocalText;
  band: LocalText;
  tone: string; // gradient class，從 SOP §1.1 顏色表挑
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
};

const l = (value: LocalText, lang: Lang) => value[lang];

// ============================================================
// Static data — 依 spec §3 完整填寫（**固定 6 個 entry**）
// ⚠️ 內容代碼紀律：每個欄位必須有 spec §11 的權威來源
// ============================================================

const categoryInfo: CategoryInfo[] = [
  {
    key: "category1",
    label: { zh: "（分類1中文）", en: "(Category 1 EN)" },
    range: { zh: "（區間，例：低於 X）", en: "Below X" },
    band: { zh: "（區段名）", en: "Band name" },
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "（意味著什麼，依 spec §3）", en: "(meaning per spec §3)" },
    risks: { zh: "（具名風險，依 spec §3）", en: "(named risks)" },
    actions: { zh: "（動詞起頭的具體行動）", en: "(action verb-led)" },
    nextTool: { zh: "（下一步站內具名工具）", en: "(next in-site tool)" },
  },
  {
    key: "category2",
    label: { zh: "（分類2中文）", en: "(Category 2 EN)" },
    range: { zh: "", en: "" },
    band: { zh: "", en: "" },
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "", en: "" },
    risks: { zh: "", en: "" },
    actions: { zh: "", en: "" },
    nextTool: { zh: "", en: "" },
  },
  {
    key: "category3",
    label: { zh: "（分類3中文）", en: "(Category 3 EN)" },
    range: { zh: "", en: "" },
    band: { zh: "", en: "" },
    tone: "from-yellow-300 via-orange-300 to-orange-500",
    meaning: { zh: "", en: "" },
    risks: { zh: "", en: "" },
    actions: { zh: "", en: "" },
    nextTool: { zh: "", en: "" },
  },
  {
    key: "category4",
    label: { zh: "（分類4中文）", en: "(Category 4 EN)" },
    range: { zh: "", en: "" },
    band: { zh: "", en: "" },
    tone: "from-orange-400 via-red-400 to-red-600",
    meaning: { zh: "", en: "" },
    risks: { zh: "", en: "" },
    actions: { zh: "", en: "" },
    nextTool: { zh: "", en: "" },
  },
  {
    key: "category5",
    label: { zh: "（分類5中文）", en: "(Category 5 EN)" },
    range: { zh: "", en: "" },
    band: { zh: "", en: "" },
    tone: "from-red-500 via-rose-500 to-pink-600",
    meaning: { zh: "", en: "" },
    risks: { zh: "", en: "" },
    actions: { zh: "", en: "" },
    nextTool: { zh: "", en: "" },
  },
  {
    key: "category6",
    label: { zh: "（分類6中文）", en: "(Category 6 EN)" },
    range: { zh: "", en: "" },
    band: { zh: "", en: "" },
    tone: "from-rose-700 via-purple-700 to-slate-900",
    meaning: { zh: "", en: "" },
    risks: { zh: "", en: "" },
    actions: { zh: "", en: "" },
    nextTool: { zh: "", en: "" },
  },
];

// FAQ 列表（與 locales 的 key 對應；spec §8 規定 5-8 題）
const faqKeys: Array<[questionKey: string, answerKey: string]> = [
  ["faq1Q", "faq1A"],
  ["faq2Q", "faq2A"],
  ["faq3Q", "faq3A"],
  ["faq4Q", "faq4A"],
  ["faq5Q", "faq5A"],
  // 可加到 faq8Q/faq8A，但不超過 8 題
];

// Affiliate 商品（與 spec §10 對應）
const affiliateItems: Array<{ zh: string; en: string; href: string }> = [
  { zh: "（商品 1）", en: "(item 1)", href: "#affiliate-1" },
  { zh: "（商品 2）", en: "(item 2)", href: "#affiliate-2" },
  { zh: "（商品 3）", en: "(item 3)", href: "#affiliate-3" },
  { zh: "（商品 4）", en: "(item 4)", href: "#affiliate-4" },
];

// ============================================================
// Calculation logic — 依 spec §4
// ⚠️ 公式必須有權威來源（spec §11）
// ============================================================

function getCategory(value: number): CategoryInfo {
  // 依 spec §3 的 range 拆分；範例（BMI）：
  if (value < 18.5) return categoryInfo[0];
  if (value < 24) return categoryInfo[1];
  if (value < 27) return categoryInfo[2];
  if (value < 30) return categoryInfo[3];
  if (value < 35) return categoryInfo[4];
  return categoryInfo[5];
}

function formatValue(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}

// ============================================================
// Main component
// ============================================================

export default function __TOOL_NAME__() {
  const { lang, setLang } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  // ↓ 依 spec §4.3 補欄位
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const t = lang === "zh" ? zhStrings : enStrings;

  const calculation = useMemo(() => {
    // 依 spec §4.1 / §4.2 公式
    const a = Number(inputA);
    const b = Number(inputB);
    if (!a || !b || a <= 0 || b <= 0) return null;

    const value = a / (b * b); // ← 換成你的公式
    return { value, category: getCategory(value) };
  }, [inputA, inputB, unitSystem]);

  // 預設 active：第 2 個分類（healthy / normal 區間）
  const activeCategory = calculation?.category ?? categoryInfo[1];
  const activeValue = calculation?.value;

  function fillTypicalExample() {
    // 依 spec §5.1
    setUnitSystem("metric");
    setInputA("（典型範例值 A）");
    setInputB("（典型範例值 B）");
  }

  function fillContrastExample() {
    // 依 spec §5.2
    setUnitSystem("metric");
    setInputA("（對比情境值 A）");
    setInputB("（對比情境值 B）");
  }

  // Decision path nodes（依 spec §6，**固定 4 步**）
  const decisionNodes: string[] = [t.decisionStep1, t.decisionStep2, t.decisionStep3, t.decisionStep4];
  const decisionDescriptions: string[] = [t.decisionDesc1, t.decisionDesc2, t.decisionDesc3, t.decisionDesc4];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">

      {/* ════════════════════════════════════════════════════════════════
          L1 Hero（左欄）+ L2 Lang Switcher + L3 Quick Action Card（右欄）
          視覺布局：Hero 2 列布局 lg [1.05fr 0.95fr]
          ════════════════════════════════════════════════════════════════ */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)] dark:bg-[radial-gradient(circle_at_top_left,_#0c1226,_#020617_45%,_#020617)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">

          {/* L2 Lang Switcher */}
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

          {/* Hero 2 列布局：lg [1.05fr 0.95fr] —— 不准改比例 */}
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            {/* L1 Hero text（左欄）*/}
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-blue-700 dark:text-blue-300">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                <strong>{t.trustNoteLabel}</strong> {t.trustNote}
              </div>
            </section>

            {/* L3 Quick Action Card（右欄）*/}
            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur dark:border-blue-900/40 dark:bg-slate-900/80">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p>
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonAdultExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.previewLabel}</div>
                  <div className="text-3xl font-black">{activeValue ? formatValue(activeValue) : "—"}</div>
                </div>
              </div>
              <button onClick={fillTypicalExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">
                {t.oneClickFillTypicalExample}
              </button>
              <button onClick={fillContrastExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">
                {t.previewContrastDecisionPath}
              </button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">

          {/* ════════════════════════════════════════════════════════════════
              L4 Examples 卡（左欄）+ L5 Calculator Inputs（右欄）
              視覺布局：計算機 2 列布局 lg [0.9fr 1.1fr]
              ════════════════════════════════════════════════════════════════ */}
          <section className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">

            {/* L4 Examples 卡（左欄）*/}
            <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{t.examplesHelper}</p>

              <div className="mt-5 space-y-3">
                <button onClick={fillTypicalExample} className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="text-xs font-black uppercase text-slate-500">{t.example} A</div>
                  <div className="mt-1 font-black text-slate-800 dark:text-slate-100">{t.exampleCardA_role}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.exampleCardA_outcome}</div>
                </button>
                <button onClick={fillContrastExample} className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-orange-400 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="text-xs font-black uppercase text-slate-500">{t.example} B</div>
                  <div className="mt-1 font-black text-slate-800 dark:text-slate-100">{t.exampleCardB_role}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.exampleCardB_outcome}</div>
                </button>
              </div>
            </article>

            {/* L5 Calculator Inputs（右欄）*/}
            <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <h2 className="text-3xl font-black">{t.enterOrFillValues}</h2>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2 dark:bg-slate-800">
                  <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "metric" ? "bg-blue-600 text-white" : "bg-white text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`} onClick={() => setUnitSystem("metric")}>{t.metric}</button>
                  <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "imperial" ? "bg-blue-600 text-white" : "bg-white text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`} onClick={() => setUnitSystem("imperial")}>{t.imperial}</button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300">
                  {unitSystem === "metric" ? t.inputA_label_metric : t.inputA_label_imperial}
                  <input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold dark:border-slate-700 dark:bg-slate-800" value={inputA} onChange={(e) => setInputA(e.target.value)} />
                </label>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300">
                  {unitSystem === "metric" ? t.inputB_label_metric : t.inputB_label_imperial}
                  <input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold dark:border-slate-700 dark:bg-slate-800" value={inputB} onChange={(e) => setInputB(e.target.value)} />
                </label>
              </div>
            </article>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              L6 Result Card（左欄）+ L7 Result Intelligence — 6 格（右欄）
              視覺布局：結果 2 列布局 lg [0.95fr 1.05fr]
              ════════════════════════════════════════════════════════════════ */}
          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">

            {/* L6 Result Card（左欄）*/}
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className={`h-5 bg-gradient-to-r ${activeCategory.tone}`} aria-label="Color band" />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-7xl font-black tracking-tight text-slate-950 dark:text-white">{activeValue ? formatValue(activeValue) : "—"}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">{activeValue ? l(activeCategory.label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.status}</div>
                    <div className="mt-1 text-xl font-black">{l(activeCategory.range, lang)}</div>
                    <div className="mt-1 text-xs text-slate-300">{l(activeCategory.band, lang)}</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"><div className="text-xs font-black uppercase text-slate-500">{t.riskSummary}</div><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{l(activeCategory.risks, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{l(activeCategory.actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40"><div className="text-xs font-black uppercase text-blue-600 dark:text-blue-300">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950 dark:text-blue-100">{l(activeCategory.nextTool, lang)}</p></div>
                </div>
              </div>
            </article>

            {/* L7 Result Intelligence（右欄）—— **固定 6 格** */}
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretCategoryBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categoryInfo.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeCategory.key ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-950/40" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"}`}>
                    <div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{l(item.range, lang)}</span></div>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{l(item.meaning, lang)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              L8 AdSense 中段橫幅
              ════════════════════════════════════════════════════════════════ */}
          <AdSenseWrapper showAds={true} adFormat="horizontal" />

          {/* ════════════════════════════════════════════════════════════════
              L9 Emotion + Conversion 上排
              視覺布局：lg [1fr 0.9fr] —— Progress Insight + Motivation
              ════════════════════════════════════════════════════════════════ */}
          <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7 dark:border-indigo-900/40 dark:from-slate-900 dark:via-indigo-950/30 dark:to-blue-950/30">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">{t.emotionConversionLayer}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">{t.prototypeLayerNote}</p>

            {/* L9 上排：lg [1fr 0.9fr] —— 不准改比例 */}
            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              {/* Progress Insight Card */}
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsightCard}</p>
                <h3 className="mt-2 text-2xl font-black">{t.progressInsightHeadline}</h3>
                {/* 三格目前 / 目標 / 需調整 */}
              </article>

              {/* Motivation Card */}
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivationCard}</p>
                <h3 className="mt-2 text-2xl font-black">{t.motivationHeadline}</h3>
              </article>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              L10 Emotion + Conversion 下排
              視覺布局：lg [1fr 0.8fr] —— Journey + Save/Share Placeholder
              ════════════════════════════════════════════════════════════════ */}
          <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7 dark:border-indigo-900/40 dark:from-slate-900 dark:via-indigo-950/30 dark:to-blue-950/30">

            {/* L10 下排：lg [1fr 0.8fr] —— 不准改比例 */}
            <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              {/* Journey */}
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-2xl font-black">{t.journeyTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{t.journeyDescription}</p>
              </article>

              {/* Save / Share Placeholder */}
              <article className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{t.saveSharePlaceholder}</p>
                <h3 className="mt-2 text-xl font-black">{t.saveShareJourney}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{t.saveShareNote}</p>
              </article>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              L11 Decision Path —— **固定 4 步橫向**
              ════════════════════════════════════════════════════════════════ */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.decisionPath}</p>
            <h2 className="mt-2 text-3xl font-black">{t.decisionPathHeadline}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
              {decisionNodes.map((node, index) => (
                <div key={`${node}-${index}`} className="contents">
                  <div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/40" : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40"}`}>
                    <div className="text-xs font-black uppercase text-slate-500">{t.step} {index + 1}</div>
                    <div className="mt-1 text-xl font-black">{node}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{decisionDescriptions[index]}</p>
                  </div>
                  {index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              L12 Knowledge（左欄）+ L13 FAQ（右欄）
              視覺布局：Knowledge+FAQ 2 列並排 lg [1fr 0.9fr]
              ════════════════════════════════════════════════════════════════ */}
          <section className="grid gap-7 lg:grid-cols-[1fr_0.9fr]">

            {/* L12 Knowledge（左欄）*/}
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
              <h2 className="mt-2 text-3xl font-black">{t.knowledgeHeadline}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{t.definitionText}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{t.limitationsText}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"><h3 className="font-black">{t.semanticNeighbors}</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{t.semanticNeighborsText}</p></div>
              </div>
              <pre className="mt-5 rounded-3xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">{t.metricFormula}{"\n"}{t.imperialFormula}</pre>

              {/* AdSlot: Knowledge 中間 */}
              <div className="mt-6">
                <AdSlot slot="__SLUG__-knowledge" position="middle" />
              </div>
            </article>

            {/* L13 FAQ（右欄）—— 5-8 題 */}
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
              <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
              <div className="mt-5 space-y-3">
                {faqKeys.map(([qKey, aKey]) => (
                  <details key={qKey} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <summary className="cursor-pointer font-black">{(t as Record<string, string>)[qKey]}</summary>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{(t as Record<string, string>)[aKey]}</p>
                  </details>
                ))}
              </div>
            </article>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              L14 AdSlot post-FAQ
              ════════════════════════════════════════════════════════════════ */}
          <AdSlot slot="__SLUG__-faq" position="inline" />

          {/* ════════════════════════════════════════════════════════════════
              L15 Affiliate（推薦商品 4 格）
              ════════════════════════════════════════════════════════════════ */}
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">{t.affiliateBadge}</p>
            <h2 className="mt-2 text-2xl font-black">{t.affiliateTitle}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {affiliateItems.map((item) => (
                <a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
                  {lang === "zh" ? item.zh : item.en}
                </a>
              ))}
            </div>
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">{t.affiliateDisclosure}</p>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              L16 Premium Gate
              ════════════════════════════════════════════════════════════════ */}
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.premiumBadge}</p>
              <h2 className="mt-2 text-2xl font-black">{t.premiumTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t.premiumDescription}</p>
            </div>
          </PremiumGate>

          {/* ════════════════════════════════════════════════════════════════
              L17 Trust · Related · References —— 三欄並排
              ════════════════════════════════════════════════════════════════ */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{t.trustText}</p></div>
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{t.relatedToolsText}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{t.referencesText}</p></div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
