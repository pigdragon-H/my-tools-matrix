import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { name: LocalText; desc: LocalText; url: string };
type Goal = "muscle" | "fatloss" | "maintain";

const l = (t: LocalText, lang: Lang) => t[lang];
const fmt = (n: number, d = 0) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

type Band = { key: string; max: number; label: LocalText; tip: LocalText };
const bands: Band[] = [
  { key: "minimal", max: 6, label: { zh: "極低量", en: "Minimal" }, tip: { zh: "每肌群週組數偏低，較適合維持或復健期。", en: "Low weekly sets per muscle; best for maintenance or rehab phases." } },
  { key: "light", max: 10, label: { zh: "輕量", en: "Light" }, tip: { zh: "初學者起步區間，先建立動作品質再加量。", en: "Beginner starting zone; build movement quality before adding volume." } },
  { key: "moderate", max: 14, label: { zh: "中量", en: "Moderate" }, tip: { zh: "多數人增肌的甜蜜點，恢復與刺激平衡。", en: "Hypertrophy sweet spot for most; balances stimulus and recovery." } },
  { key: "high", max: 20, label: { zh: "高量", en: "High" }, tip: { zh: "進階訓練量，需充足睡眠與營養支持恢復。", en: "Advanced volume; needs solid sleep and nutrition to recover." } },
  { key: "veryhigh", max: 26, label: { zh: "極高量", en: "Very high" }, tip: { zh: "接近恢復上限，建議週期化並監測疲勞。", en: "Near recovery ceiling; periodize and monitor fatigue." } },
  { key: "excess", max: Infinity, label: { zh: "超量風險", en: "Overreaching" }, tip: { zh: "超過多數人恢復能力，受傷與停滯風險升高。", en: "Beyond most lifters' recovery; injury and stall risk rises." } },
];

const affiliateItems: AffiliateItem[] = [
  { name: { zh: "可調式啞鈴組", en: "Adjustable Dumbbell Set" }, desc: { zh: "省空間，覆蓋全身分割訓練重量需求", en: "Space-saving, covers full-body split loading needs" }, url: "https://www.amazon.com/s?k=adjustable+dumbbell" },
  { name: { zh: "訓練日誌 App 訂閱", en: "Training Log App" }, desc: { zh: "記錄組數、漸進負荷與週期化追蹤", en: "Track sets, progressive overload and periodization" }, url: "https://www.amazon.com/s?k=workout+log+app" },
  { name: { zh: "彈力帶套組", en: "Resistance Band Set" }, desc: { zh: "輔助暖身、活化與居家補充訓練量", en: "Aids warm-up, activation and home volume top-up" }, url: "https://www.amazon.com/s?k=resistance+bands" },
  { name: { zh: "乳清蛋白", en: "Whey Protein" }, desc: { zh: "支持訓練後恢復與肌肉合成", en: "Supports post-workout recovery and muscle synthesis" }, url: "https://www.amazon.com/s?k=whey+protein" },
];

const faqKeys = ["volume", "split", "progress", "rest"] as const;

const goalSetsPerMuscle: Record<Goal, number> = { muscle: 16, fatloss: 12, maintain: 8 };
const MAJOR_MUSCLE_GROUPS = 6; // chest, back, legs, shoulders, arms, core

function pickSplit(days: number, lang: Lang): string {
  const z = lang === "zh";
  if (days <= 2) return z ? "全身訓練 ×2（每次涵蓋所有大肌群）" : "Full-body ×2 (hit all major groups each session)";
  if (days === 3) return z ? "推/拉/腿 三分割" : "Push / Pull / Legs split";
  if (days === 4) return z ? "上半身/下半身 ×2" : "Upper / Lower ×2";
  if (days === 5) return z ? "推/拉/腿 + 上/下" : "Push / Pull / Legs + Upper / Lower";
  return z ? "推/拉/腿 ×2（6 分割）" : "Push / Pull / Legs ×2 (6-day split)";
}

const ui = {
  zh: {
    heroTag: "健身 · 訓練計畫",
    heroTitle: "健身計畫計算機",
    heroDesc: "依訓練目標、每週天數與經驗等級，估算每肌群每週建議組數、總訓練量與分割建議，幫你把課表量化。",
    quickTitle: "每週訓練量預覽",
    quickUnit: "組/肌群/週",
    fillStandard: "一鍵標準範例",
    fillCut: "填入減脂範例",
    metricNote: "註：訓練量建議為族群平均，實際應依恢復、睡眠與飲食微調，循序漸進避免受傷。",
    examplesTag: "範例 → 計算機",
    enterTitle: "輸入目標、天數與經驗",
    enterHint: "先用範例理解算法，再換成你自己的目標與可訓練天數。",
    exampleCard: "範例卡",
    exampleName: "增肌 · 4 天 · 中階",
    calcTitle: "計算機",
    goalLabel: "訓練目標",
    daysLabel: "每週訓練天數",
    levelLabel: "經驗倍率（0.6 新手 ~ 1.2 進階）",
    goalMuscle: "增肌",
    goalFatloss: "減脂",
    goalMaintain: "維持",
    resultTitle: "你的訓練計畫",
    perMuscle: "每肌群週組數",
    weeklyTotal: "全身週總組數",
    perSession: "每次訓練約",
    splitLabel: "建議分割",
    bandsTitle: "訓練量強度帶",
    knowledgeTitle: "知識與常見問題",
    decisionTitle: "怎麼用這個數字",
    decisionBody: "把每肌群週組數平均分到你的訓練天數，搭配漸進負荷（每週微增重量或次數）。先求動作品質與恢復，再逐步加量。",
    trustTitle: "方法與參考",
    trustBody: "本工具以運動科學常見的「每肌群每週有效組數」框架估算（增肌約 10–20 組、維持約 6–10 組），並依經驗倍率縮放。僅供規劃參考，非個人化處方。",
    references: "參考：Schoenfeld 等人訓練量統合分析、ACSM 阻力訓練指引。",
    affiliateTitle: "推薦裝備",
    premiumTitle: "解鎖完整週期化課表",
    premiumDesc: "升級可取得 4 週漸進式課表、去訓練（deload）週安排與動作清單匯出。",
    faq: {
      volume: { q: "每肌群一週要練幾組？", a: "增肌多數研究落在 10–20 有效組，維持約 6–10 組。本工具依目標與經驗倍率給出建議值。" },
      split: { q: "分割怎麼選？", a: "天數少用全身，3 天推拉腿，4 天上下分割，5–6 天可混合。重點是每肌群每週被刺激 ≥2 次。" },
      progress: { q: "如何漸進負荷？", a: "在同樣組數下，每週嘗試多 1–2 次或加一點重量；停滯時再考慮加組或換動作。" },
      rest: { q: "需要 deload 嗎？", a: "高量訓練建議每 4–8 週安排一週減量（組數或強度降約 40%）以利恢復與長期進步。" },
    },
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
  },
  en: {
    heroTag: "Fitness · Training Plan",
    heroTitle: "Workout Plan Calculator",
    heroDesc: "From your goal, weekly training days and experience level, estimate recommended weekly sets per muscle, total volume and a split suggestion to quantify your program.",
    quickTitle: "WEEKLY VOLUME PREVIEW",
    quickUnit: "sets/muscle/week",
    fillStandard: "One-click standard example",
    fillCut: "Fill fat-loss example",
    metricNote: "Note: Volume targets are population averages; adjust to your recovery, sleep and nutrition, and progress gradually to avoid injury.",
    examplesTag: "EXAMPLES → CALCULATOR",
    enterTitle: "Enter goal, days and experience",
    enterHint: "Start with an example to understand the math, then swap in your own goal and trainable days.",
    exampleCard: "Example card",
    exampleName: "Muscle · 4 days · Intermediate",
    calcTitle: "Calculator",
    goalLabel: "Training goal",
    daysLabel: "Training days per week",
    levelLabel: "Experience multiplier (0.6 novice ~ 1.2 advanced)",
    goalMuscle: "Build muscle",
    goalFatloss: "Fat loss",
    goalMaintain: "Maintain",
    resultTitle: "Your training plan",
    perMuscle: "Weekly sets / muscle",
    weeklyTotal: "Total weekly sets",
    perSession: "Per session approx.",
    splitLabel: "Suggested split",
    bandsTitle: "Volume intensity bands",
    knowledgeTitle: "Knowledge & FAQ",
    decisionTitle: "How to use this number",
    decisionBody: "Spread the weekly sets per muscle across your training days with progressive overload (small weekly bumps in load or reps). Prioritize technique and recovery before adding volume.",
    trustTitle: "Method & references",
    trustBody: "This tool estimates using the common 'effective weekly sets per muscle' framework (≈10–20 sets to build, ≈6–10 to maintain), scaled by an experience multiplier. For planning only, not a personalized prescription.",
    references: "References: Schoenfeld et al. volume meta-analyses; ACSM resistance-training guidelines.",
    affiliateTitle: "Recommended gear",
    premiumTitle: "Unlock full periodized program",
    premiumDesc: "Upgrade for a 4-week progressive program, deload week scheduling and exercise-list export.",
    faq: {
      volume: { q: "How many sets per muscle per week?", a: "Most hypertrophy research lands at 10–20 effective sets; maintenance ≈6–10. This tool scales by goal and experience." },
      split: { q: "How do I choose a split?", a: "Few days → full-body, 3 days → push/pull/legs, 4 days → upper/lower, 5–6 days → a blend. Aim to stimulate each muscle ≥2×/week." },
      progress: { q: "How do I progress?", a: "At the same set count, add 1–2 reps or a little load each week; when stalled, add a set or change the exercise." },
      rest: { q: "Do I need a deload?", a: "On high volume, schedule a lighter week every 4–8 weeks (drop sets or intensity ~40%) to aid recovery and long-term progress." },
    },
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
  },
} as const;

export default function WorkoutPlanCalculator() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];

  const [goal, setGoal] = useState<Goal>("muscle");
  const [days, setDays] = useState("4");
  const [level, setLevel] = useState("1.0");

  const result = useMemo(() => {
    const d = Math.max(1, Math.min(7, Number(days) || 0));
    const lv = Math.max(0.4, Math.min(1.5, Number(level) || 0));
    const perMuscle = goalSetsPerMuscle[goal] * lv;
    const weeklyTotal = perMuscle * MAJOR_MUSCLE_GROUPS;
    const perSession = weeklyTotal / d;
    return { d, perMuscle, weeklyTotal, perSession };
  }, [goal, days, level]);

  const activeBandKey = useMemo(() => {
    const v = result.perMuscle;
    return (bands.find((b) => v <= b.max) ?? bands[bands.length - 1]).key;
  }, [result]);

  function fillStandard() {
    setGoal("muscle");
    setDays("4");
    setLevel("1.0");
  }
  function fillCut() {
    setGoal("fatloss");
    setDays("3");
    setLevel("0.8");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* L1 Hero */}
      <section className="relative overflow-hidden rounded-[2rem] mx-3 mt-3 md:mx-6 md:mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-7">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>
            <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span>
            <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span>
          </button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">{t.heroTag}</span>
            <h1 className="mt-2 text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{t.heroTitle}</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300 leading-relaxed">{t.heroDesc}</p>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">{t.metricNote}</p>
      </section>

      {/* L2 Quick-action card */}
      <section className="mx-3 mt-4 md:mx-6 md:mt-6">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          <div className="rounded-[2rem] bg-emerald-600 text-white p-6 md:p-7 flex flex-col justify-center">
            <span className="text-xs font-black tracking-widest uppercase opacity-90">{t.quickTitle}</span>
            <div className="mt-2 text-7xl font-black leading-none">{fmt(result.perMuscle, 0)}</div>
            <div className="mt-1 text-sm opacity-90">{t.quickUnit}</div>
          </div>
          <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800" />
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-7 grid grid-cols-2 gap-4 content-center">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
              <div className="text-xs text-slate-500">{t.goalLabel}</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{goal === "muscle" ? t.goalMuscle : goal === "fatloss" ? t.goalFatloss : t.goalMaintain}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
              <div className="text-xs text-slate-500">{t.daysLabel}</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{fmt(result.d)}</div>
            </div>
            <button onClick={fillStandard} className="col-span-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-3 hover:opacity-90 transition">{t.fillStandard}</button>
            <button onClick={fillCut} className="col-span-2 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-black py-3 hover:opacity-90 transition">{t.fillCut}</button>
          </div>
        </div>
      </section>

      {/* L3 Calculator */}
      <section className="mx-3 mt-6 md:mx-6 md:mt-8">
        <span className="text-xs font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">{t.examplesTag}</span>
        <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.enterTitle}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t.enterHint}</p>
        <div className="mt-5 grid md:grid-cols-2 gap-6">
          {/* L3a Example card */}
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <span className="text-xs font-black tracking-widest uppercase text-slate-400">{t.exampleCard}</span>
            <button onClick={fillStandard} className="mt-3 w-full rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-4 text-left hover:shadow transition">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 dark:text-white">{t.exampleName}</span>
                <span className="rounded-full bg-emerald-600 text-white text-xs font-black px-2 py-1">16 / muscle</span>
              </div>
            </button>
          </div>
          {/* L3b Calculator form */}
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <span className="text-xs font-black tracking-widest uppercase text-slate-400">{t.calcTitle}</span>
            <div className="mt-3 space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.goalLabel}</label>
                <div className="grid grid-cols-3 gap-2">
                  {([["muscle", t.goalMuscle], ["fatloss", t.goalFatloss], ["maintain", t.goalMaintain]] as const).map(([g, label]) => (
                    <button key={g} onClick={() => setGoal(g as Goal)} className={`rounded-xl px-3 py-2 text-sm font-black border transition ${goal === g ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.daysLabel}</label>
                <input type="number" min={1} max={7} value={days} onChange={(e) => setDays(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.levelLabel}</label>
                <input type="number" step="0.1" min={0.4} max={1.5} value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* L4 Result card */}
      <section className="mx-3 mt-6 md:mx-6 md:mt-8">
        <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-7">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.resultTitle}</h3>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-5 text-center">
              <div className="text-xs text-slate-500">{t.perMuscle}</div>
              <div className="mt-1 text-3xl font-black text-emerald-600 dark:text-emerald-400">{fmt(result.perMuscle, 0)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.weeklyTotal}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{fmt(result.weeklyTotal, 0)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.perSession}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{fmt(result.perSession, 0)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.splitLabel}</div>
              <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">{pickSplit(result.d, lang)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* L5 Result-intelligence bands */}
      <section className="mx-3 mt-6 md:mx-6 md:mt-8">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.bandsTitle}</h3>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bands.map((b) => (
            <div key={b.key} className={`rounded-2xl p-4 border transition ${activeBandKey === b.key ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 dark:text-white">{l(b.label, lang)}</span>
                {activeBandKey === b.key && <span className="rounded-full bg-emerald-600 text-white text-xs font-black px-2 py-0.5">●</span>}
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{l(b.tip, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L6 Ad */}
      <section className="mx-3 mt-6 md:mx-6 md:mt-8">
        <AdSenseWrapper showAds={true} adSlot="workout-result-intelligence" adFormat="horizontal" className="my-2" />
        <AdSlot slot="workout-faq" position="inline" />
      </section>

      {/* L7 Decision path */}
      <section className="mx-3 mt-6 md:mx-6 md:mt-8">
        <div className="rounded-[2rem] bg-slate-900 text-white p-6 md:p-7">
          <h3 className="text-xl font-black">{t.decisionTitle}</h3>
          <p className="mt-2 text-slate-200 leading-relaxed">{t.decisionBody}</p>
        </div>
      </section>

      {/* L8 Knowledge + FAQ */}
      <section className="mx-3 mt-6 md:mx-6 md:mt-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t.knowledgeTitle}</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {faqKeys.map((k) => (
            <div key={k} className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
              <h4 className="font-black text-slate-900 dark:text-white">{t.faq[k].q}</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t.faq[k].a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L9 Affiliate + Premium */}
      <section className="mx-3 mt-6 md:mx-6 md:mt-8">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.affiliateTitle}</h3>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {affiliateItems.map((a) => (
            <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer sponsored" className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 hover:shadow transition">
              <div className="font-black text-slate-900 dark:text-white">{l(a.name, lang)}</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{l(a.desc, lang)}</p>
            </a>
          ))}
        </div>
        <div className="mt-5">
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 md:p-7">
              <h4 className="text-xl font-black">{t.premiumTitle}</h4>
              <p className="mt-2 opacity-90">{t.premiumDesc}</p>
            </div>
          </PremiumGate>
        </div>
      </section>

      {/* L10 Trust / references */}
      <section className="mx-3 mt-6 mb-10 md:mx-6 md:mt-8">
        <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-7">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.trustTitle}</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">{t.trustBody}</p>
          <p className="mt-3 text-xs text-slate-400">{t.references}</p>
        </div>
      </section>
    </div>
  );
}
