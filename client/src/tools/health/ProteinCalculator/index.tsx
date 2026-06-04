import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { name: LocalText; desc: LocalText; url: string };
type Goal = "sedentary" | "light" | "moderate" | "strength" | "athlete";

const l = (t: LocalText, lang: Lang) => t[lang];
const fmt = (n: number, d = 0) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

type Band = { key: string; max: number; label: LocalText; tip: LocalText };
const bands: Band[] = [
  { key: "low", max: 60, label: { zh: "基礎量", en: "Baseline" }, tip: { zh: "接近 RDA 下限，維持基本生理機能即可。", en: "Near the RDA floor; covers basic physiological needs." } },
  { key: "general", max: 90, label: { zh: "一般活動", en: "General" }, tip: { zh: "輕度活動者的常見區間，支撐日常與輕運動。", en: "Common range for lightly active people; supports daily light exercise." } },
  { key: "active", max: 120, label: { zh: "活躍", en: "Active" }, tip: { zh: "規律運動族群，幫助恢復與肌肉維持。", en: "Regular exercisers; aids recovery and muscle maintenance." } },
  { key: "build", max: 160, label: { zh: "增肌", en: "Muscle-building" }, tip: { zh: "阻力訓練增肌期的典型攝取，分多餐效果佳。", en: "Typical for resistance-training hypertrophy; spread across meals." } },
  { key: "high", max: 200, label: { zh: "高需求", en: "High demand" }, tip: { zh: "運動員或減脂保肌期，需搭配充足熱量管理。", en: "Athletes or muscle-sparing cuts; pair with calorie management." } },
  { key: "extreme", max: Infinity, label: { zh: "極高量", en: "Very high" }, tip: { zh: "超過多數人需求，注意腎臟健康與飲食均衡。", en: "Beyond most people's needs; mind kidney health and balance." } },
];

const affiliateItems: AffiliateItem[] = [
  { name: { zh: "乳清蛋白粉", en: "Whey Protein Powder" }, desc: { zh: "高生物價、快速吸收，方便補足每日缺口", en: "High biological value, fast-absorbing, easy daily top-up" }, url: "https://www.amazon.com/s?k=whey+protein" },
  { name: { zh: "植物蛋白粉", en: "Plant Protein Powder" }, desc: { zh: "純素友善，豌豆/糙米混合胺基酸完整", en: "Vegan-friendly pea/brown-rice blend with complete amino acids" }, url: "https://www.amazon.com/s?k=plant+protein" },
  { name: { zh: "蛋白棒", en: "Protein Bars" }, desc: { zh: "外出與訓練後便攜補充，免準備", en: "Portable post-workout and on-the-go top-up, no prep" }, url: "https://www.amazon.com/s?k=protein+bar" },
  { name: { zh: "廚房電子秤", en: "Kitchen Food Scale" }, desc: { zh: "精準秤量食物份量，估算蛋白質更準確", en: "Weigh portions precisely for accurate protein estimates" }, url: "https://www.amazon.com/s?k=kitchen+food+scale" },
];

const faqKeys = ["howmuch", "timing", "sources", "kidney"] as const;

const goalFactor: Record<Goal, number> = { sedentary: 0.8, light: 1.2, moderate: 1.6, strength: 2.0, athlete: 2.2 };

const ui = {
  zh: {
    heroTag: "營養 · 蛋白質",
    heroTitle: "蛋白質需求計算機",
    heroDesc: "依體重與活動／訓練目標，估算每日蛋白質建議攝取量（公克），並換算每餐分配與常見食物份量參考。",
    quickTitle: "每日蛋白質預覽",
    quickUnit: "公克/天",
    fillStandard: "一鍵標準範例",
    fillCut: "填入增肌範例",
    metricNote: "註：建議量為族群平均，腎功能異常、孕期或特殊疾病者請先諮詢醫師或營養師。",
    examplesTag: "範例 → 計算機",
    enterTitle: "輸入體重與目標",
    enterHint: "先用範例理解算法，再換成你自己的體重與訓練目標。",
    exampleCard: "範例卡",
    exampleName: "70kg · 中度活動 · 1.6 g/kg",
    calcTitle: "計算機",
    weightLabel: "體重（公斤）",
    goalLabel: "活動／目標",
    mealsLabel: "每日餐數",
    goalSedentary: "久坐",
    goalLight: "輕度活動",
    goalModerate: "中度活動",
    goalStrength: "重量訓練",
    goalAthlete: "運動員／減脂保肌",
    resultTitle: "你的蛋白質需求",
    daily: "每日蛋白質",
    factor: "係數",
    perMeal: "每餐約",
    whey: "≈ 乳清匙數（25g/匙）",
    bandsTitle: "蛋白質需求強度帶",
    knowledgeTitle: "知識與常見問題",
    decisionTitle: "怎麼用這個數字",
    decisionBody: "把每日總量平均分配到各餐（每餐約 20–40g 吸收效率較佳），優先從天然食物攝取，不足再用蛋白粉補足缺口。",
    trustTitle: "方法與參考",
    trustBody: "本工具以「每公斤體重 × 活動係數」估算每日蛋白質（久坐 0.8、輕度 1.2、中度 1.6、重訓 2.0、運動員 2.2 g/kg），對應 RDA 與運動營養共識。僅供規劃參考。",
    references: "參考：ISSN 蛋白質與運動立場聲明、美國膳食營養素參考攝取量（DRI）。",
    affiliateTitle: "推薦補給",
    premiumTitle: "解鎖個人化蛋白攝取計畫",
    premiumDesc: "升級可取得分餐排程、食物蛋白質資料庫與每週達標追蹤報表。",
    faq: {
      howmuch: { q: "一天要吃多少蛋白質？", a: "依目標而定：久坐約 0.8、規律運動 1.2–1.6、增肌或減脂保肌 1.6–2.2 g/kg 體重。本工具依你的選擇估算。" },
      timing: { q: "蛋白質要分餐吃嗎？", a: "建議分 3–5 餐、每餐約 20–40g，較能持續刺激肌肉合成，比一次大量更有效率。" },
      sources: { q: "哪些是優質來源？", a: "蛋、乳製品、瘦肉、魚、黃豆製品與乳清屬高生物價；植物來源建議多樣搭配以補齊胺基酸。" },
      kidney: { q: "高蛋白傷腎嗎？", a: "對腎功能正常者一般安全；但腎臟疾病患者應遵醫囑限量，並維持充足水分。" },
    },
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
  },
  en: {
    heroTag: "Nutrition · Protein",
    heroTitle: "Protein Calculator",
    heroDesc: "From body weight and activity/training goal, estimate your daily protein target in grams, plus per-meal distribution and common food references.",
    quickTitle: "DAILY PROTEIN PREVIEW",
    quickUnit: "grams/day",
    fillStandard: "One-click standard example",
    fillCut: "Fill muscle-building example",
    metricNote: "Note: Targets are population averages; if you have kidney issues, are pregnant, or have special conditions, consult a doctor or dietitian first.",
    examplesTag: "EXAMPLES → CALCULATOR",
    enterTitle: "Enter weight and goal",
    enterHint: "Start with an example to understand the math, then swap in your own weight and goal.",
    exampleCard: "Example card",
    exampleName: "70kg · Moderate · 1.6 g/kg",
    calcTitle: "Calculator",
    weightLabel: "Body weight (kg)",
    goalLabel: "Activity / goal",
    mealsLabel: "Meals per day",
    goalSedentary: "Sedentary",
    goalLight: "Lightly active",
    goalModerate: "Moderately active",
    goalStrength: "Strength training",
    goalAthlete: "Athlete / muscle-sparing cut",
    resultTitle: "Your protein needs",
    daily: "Daily protein",
    factor: "Factor",
    perMeal: "Per meal approx.",
    whey: "≈ whey scoops (25g/scoop)",
    bandsTitle: "Protein demand bands",
    knowledgeTitle: "Knowledge & FAQ",
    decisionTitle: "How to use this number",
    decisionBody: "Split the daily total across meals (≈20–40g per meal absorbs best), prioritize whole foods, and top up with protein powder only for the remaining gap.",
    trustTitle: "Method & references",
    trustBody: "This tool estimates daily protein as body weight × an activity factor (sedentary 0.8, light 1.2, moderate 1.6, strength 2.0, athlete 2.2 g/kg), aligned with RDA and sports-nutrition consensus. For planning only.",
    references: "References: ISSN protein & exercise position stand; US Dietary Reference Intakes (DRI).",
    affiliateTitle: "Recommended supplements",
    premiumTitle: "Unlock personalized protein plan",
    premiumDesc: "Upgrade for meal-by-meal scheduling, a food protein database and weekly adherence reports.",
    faq: {
      howmuch: { q: "How much protein per day?", a: "It depends on goal: sedentary ≈0.8, regular exercise 1.2–1.6, muscle-building or muscle-sparing cuts 1.6–2.2 g/kg bodyweight. This tool estimates from your choice." },
      timing: { q: "Should I split protein across meals?", a: "Yes—3–5 meals of ≈20–40g each sustains muscle protein synthesis better than one large dose." },
      sources: { q: "What are quality sources?", a: "Eggs, dairy, lean meat, fish, soy and whey are high biological value; combine varied plant sources to complete amino acids." },
      kidney: { q: "Does high protein harm kidneys?", a: "Generally safe for healthy kidneys; those with kidney disease should follow medical guidance on limits and stay well hydrated." },
    },
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
  },
} as const;

export default function ProteinCalculator() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];

  const [weight, setWeight] = useState("70");
  const [goal, setGoal] = useState<Goal>("moderate");
  const [meals, setMeals] = useState("4");

  const result = useMemo(() => {
    const w = Math.max(0, Number(weight) || 0);
    const m = Math.max(1, Math.min(8, Number(meals) || 0));
    const factor = goalFactor[goal];
    const daily = w * factor;
    const perMeal = daily / m;
    const scoops = daily / 25;
    return { w, m, factor, daily, perMeal, scoops };
  }, [weight, goal, meals]);

  const activeBandKey = useMemo(() => {
    const v = result.daily;
    return (bands.find((b) => v <= b.max) ?? bands[bands.length - 1]).key;
  }, [result]);

  function fillStandard() {
    setWeight("70");
    setGoal("moderate");
    setMeals("4");
  }
  function fillCut() {
    setWeight("70");
    setGoal("strength");
    setMeals("5");
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
        <span className="inline-block text-xs font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">{t.heroTag}</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{t.heroTitle}</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300 leading-relaxed">{t.heroDesc}</p>
        <p className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">{t.metricNote}</p>
      </section>

      {/* L2 Quick-action card */}
      <section className="mx-3 mt-4 md:mx-6 md:mt-6">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          <div className="rounded-[2rem] bg-emerald-600 text-white p-6 md:p-7 flex flex-col justify-center">
            <span className="text-xs font-black tracking-widest uppercase opacity-90">{t.quickTitle}</span>
            <div className="mt-2 text-7xl font-black leading-none">{fmt(result.daily, 0)}</div>
            <div className="mt-1 text-sm opacity-90">{t.quickUnit}</div>
          </div>
          <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800" />
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-7 grid grid-cols-2 gap-4 content-center">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
              <div className="text-xs text-slate-500">{t.weightLabel}</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{fmt(result.w)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
              <div className="text-xs text-slate-500">{t.factor}</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{fmt(result.factor, 1)}</div>
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
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <span className="text-xs font-black tracking-widest uppercase text-slate-400">{t.exampleCard}</span>
            <button onClick={fillStandard} className="mt-3 w-full rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-4 text-left hover:shadow transition">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 dark:text-white">{t.exampleName}</span>
                <span className="rounded-full bg-emerald-600 text-white text-xs font-black px-2 py-1">112 g</span>
              </div>
            </button>
          </div>
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <span className="text-xs font-black tracking-widest uppercase text-slate-400">{t.calcTitle}</span>
            <div className="mt-3 space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.weightLabel}</label>
                <input type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.goalLabel}</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white">
                  <option value="sedentary">{t.goalSedentary} · 0.8</option>
                  <option value="light">{t.goalLight} · 1.2</option>
                  <option value="moderate">{t.goalModerate} · 1.6</option>
                  <option value="strength">{t.goalStrength} · 2.0</option>
                  <option value="athlete">{t.goalAthlete} · 2.2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.mealsLabel}</label>
                <input type="number" min={1} max={8} value={meals} onChange={(e) => setMeals(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white" />
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
              <div className="text-xs text-slate-500">{t.daily}</div>
              <div className="mt-1 text-3xl font-black text-emerald-600 dark:text-emerald-400">{fmt(result.daily, 0)}<span className="text-sm"> g</span></div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.factor}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{fmt(result.factor, 1)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.perMeal}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{fmt(result.perMeal, 0)}<span className="text-sm"> g</span></div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.whey}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{fmt(result.scoops, 1)}</div>
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
        <AdSenseWrapper showAds={true} adSlot="protein-result-intelligence" adFormat="horizontal" className="my-2" />
        <AdSlot slot="protein-faq" position="inline" />
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
