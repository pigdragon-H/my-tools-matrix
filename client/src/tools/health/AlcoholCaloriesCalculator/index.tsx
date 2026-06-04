import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { name: LocalText; desc: LocalText; url: string };
type Drink = "beer" | "wine" | "spirit" | "cocktail" | "custom";

const l = (t: LocalText, lang: Lang) => t[lang];
const fmt = (n: number, d = 0) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

const ETHANOL_DENSITY = 0.789; // g/ml
const KCAL_PER_G_ALCOHOL = 7;

type Band = { key: string; max: number; label: LocalText; tip: LocalText };
const bands: Band[] = [
  { key: "light", max: 100, label: { zh: "輕量", en: "Light" }, tip: { zh: "單杯低酒精飲品，熱量負擔小。", en: "A single low-alcohol drink; minimal calorie load." } },
  { key: "moderate", max: 200, label: { zh: "中等", en: "Moderate" }, tip: { zh: "約等於一份正餐配菜的熱量，留意總量。", en: "About a side-dish worth of calories; watch the total." } },
  { key: "high", max: 350, label: { zh: "偏高", en: "High" }, tip: { zh: "接近半份正餐，含糖調酒易超標。", en: "Near half a meal; sugary cocktails add up fast." } },
  { key: "veryhigh", max: 500, label: { zh: "很高", en: "Very high" }, tip: { zh: "相當於一份正餐熱量，建議節制。", en: "Equivalent to a full meal; moderation advised." } },
  { key: "heavy", max: 800, label: { zh: "過量", en: "Heavy" }, tip: { zh: "多杯累積，明顯影響每日熱量平衡。", en: "Multiple drinks accumulate and skew daily energy balance." } },
  { key: "excess", max: Infinity, label: { zh: "嚴重超標", en: "Excessive" }, tip: { zh: "遠超建議飲用量，對健康與熱量皆有風險。", en: "Far above recommended intake; risky for health and calories." } },
];

const affiliateItems: AffiliateItem[] = [
  { name: { zh: "無酒精氣泡飲", en: "Non-Alcoholic Sparkling" }, desc: { zh: "想減少酒精熱量的替代選擇", en: "A swap to cut alcohol calories" }, url: "https://www.amazon.com/s?k=non+alcoholic+sparkling" },
  { name: { zh: "酒精測試儀", en: "Breathalyzer" }, desc: { zh: "了解自身飲酒狀態，安全第一", en: "Know your level; safety first" }, url: "https://www.amazon.com/s?k=breathalyzer" },
  { name: { zh: "電解質飲", en: "Electrolyte Drink" }, desc: { zh: "飲酒後補水，緩解隔日不適", en: "Rehydrate after drinking to ease next-day discomfort" }, url: "https://www.amazon.com/s?k=electrolyte+drink" },
  { name: { zh: "量酒器", en: "Jigger Measure" }, desc: { zh: "精準量酒，控制份量與熱量", en: "Pour precisely to control portion and calories" }, url: "https://www.amazon.com/s?k=cocktail+jigger" },
];

const faqKeys = ["where", "lowest", "sugar", "limit"] as const;

const presets: Record<Exclude<Drink, "custom">, { ml: number; abv: number; sugar: number }> = {
  beer: { ml: 355, abv: 5, sugar: 13 },
  wine: { ml: 150, abv: 12, sugar: 4 },
  spirit: { ml: 44, abv: 40, sugar: 0 },
  cocktail: { ml: 200, abv: 15, sugar: 25 },
};

const ui = {
  zh: {
    heroTag: "飲食 · 酒精熱量",
    heroTitle: "酒精卡路里計算機",
    heroDesc: "依酒精濃度、份量與糖分，估算一杯飲品的總熱量（酒精熱量＋糖分熱量），幫你把「液體卡路里」算清楚。",
    quickTitle: "單杯熱量預覽",
    quickUnit: "大卡/杯",
    fillStandard: "一鍵啤酒範例",
    fillCocktail: "填入調酒範例",
    metricNote: "註：估算採用乙醇 7 kcal/g、密度 0.789 g/ml，糖分為概略值；過量飲酒有害健康。",
    examplesTag: "範例 → 計算機",
    enterTitle: "輸入份量、酒精濃度與糖分",
    enterHint: "先用範例理解算法，再換成你自己的飲品數據。",
    exampleCard: "範例卡",
    exampleName: "啤酒 355ml · 5% · 13g 糖",
    calcTitle: "計算機",
    drinkLabel: "飲品類型",
    mlLabel: "份量（毫升）",
    abvLabel: "酒精濃度（% ABV）",
    sugarLabel: "糖分（公克）",
    beer: "啤酒",
    wine: "葡萄酒",
    spirit: "烈酒",
    cocktail: "調酒",
    custom: "自訂",
    resultTitle: "你的飲品熱量",
    total: "總熱量",
    fromAlcohol: "酒精熱量",
    fromSugar: "糖分熱量",
    grams: "純酒精量",
    bandsTitle: "單杯熱量強度帶",
    knowledgeTitle: "知識與常見問題",
    decisionTitle: "怎麼用這個數字",
    decisionBody: "把飲品熱量計入每日總熱量，調酒與含糖啤酒往往是隱藏地雷。想降低負擔可選低糖烈酒搭配無糖氣泡水，或減少杯數。",
    trustTitle: "方法與參考",
    trustBody: "酒精熱量＝份量(ml) × ABV% × 0.789(乙醇密度) × 7(每克酒精熱量)；糖分熱量＝糖(g) × 4。糖分為各酒類概略平均，實際視品牌而異。",
    references: "參考：USDA 食品成分資料庫、各國酒精飲料營養標示慣例。",
    affiliateTitle: "推薦選擇",
    premiumTitle: "解鎖個人化飲酒熱量記錄",
    premiumDesc: "升級可取得飲品資料庫、每週酒精熱量趨勢與減量目標追蹤。",
    faq: {
      where: { q: "酒的熱量來自哪裡？", a: "主要來自酒精本身（每克 7 大卡，僅次於脂肪），其次是殘糖與調酒添加的糖漿、果汁。" },
      lowest: { q: "哪種酒熱量較低？", a: "純烈酒（如威士忌、伏特加）以小份量計通常較低；含糖調酒與精釀啤酒往往最高。" },
      sugar: { q: "糖分影響大嗎？", a: "含糖調酒一杯可能多出 100 大卡以上的糖分熱量，是常被忽略的來源。" },
      limit: { q: "建議飲用上限？", a: "多數指引建議男性每日不超過 2 份、女性 1 份標準酒精單位；本工具僅估熱量，非飲用建議。" },
    },
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
  },
  en: {
    heroTag: "Diet · Alcohol Calories",
    heroTitle: "Alcohol Calories Calculator",
    heroDesc: "From alcohol strength, serving size and sugar, estimate a drink's total calories (alcohol plus sugar) so you can see your 'liquid calories' clearly.",
    quickTitle: "PER-DRINK CALORIES PREVIEW",
    quickUnit: "kcal/drink",
    fillStandard: "One-click beer example",
    fillCocktail: "Fill cocktail example",
    metricNote: "Note: Uses ethanol 7 kcal/g, density 0.789 g/ml; sugar is approximate. Excessive drinking harms health.",
    examplesTag: "EXAMPLES → CALCULATOR",
    enterTitle: "Enter serving, ABV and sugar",
    enterHint: "Start with an example to understand the math, then swap in your own drink data.",
    exampleCard: "Example card",
    exampleName: "Beer 355ml · 5% · 13g sugar",
    calcTitle: "Calculator",
    drinkLabel: "Drink type",
    mlLabel: "Serving (ml)",
    abvLabel: "Alcohol strength (% ABV)",
    sugarLabel: "Sugar (grams)",
    beer: "Beer",
    wine: "Wine",
    spirit: "Spirit",
    cocktail: "Cocktail",
    custom: "Custom",
    resultTitle: "Your drink's calories",
    total: "Total calories",
    fromAlcohol: "From alcohol",
    fromSugar: "From sugar",
    grams: "Pure alcohol",
    bandsTitle: "Per-drink calorie bands",
    knowledgeTitle: "Knowledge & FAQ",
    decisionTitle: "How to use this number",
    decisionBody: "Count drink calories toward your daily total—cocktails and sugary beers are common hidden traps. To cut the load, pick low-sugar spirits with soda water, or fewer drinks.",
    trustTitle: "Method & references",
    trustBody: "Alcohol kcal = serving(ml) × ABV% × 0.789(ethanol density) × 7(kcal per gram alcohol); sugar kcal = sugar(g) × 4. Sugar values are per-type averages and vary by brand.",
    references: "References: USDA FoodData Central; common alcoholic-beverage nutrition labeling conventions.",
    affiliateTitle: "Recommended choices",
    premiumTitle: "Unlock personalized drink-calorie log",
    premiumDesc: "Upgrade for a drink database, weekly alcohol-calorie trends and reduction goal tracking.",
    faq: {
      where: { q: "Where do alcohol calories come from?", a: "Mainly from alcohol itself (7 kcal/g, second only to fat), then residual sugar and mixers' syrups or juices." },
      lowest: { q: "Which drinks are lower-calorie?", a: "Neat spirits (whiskey, vodka) in small servings are usually lowest; sugary cocktails and craft beers are often highest." },
      sugar: { q: "Does sugar matter much?", a: "A sugary cocktail can add 100+ kcal of sugar calories per glass—a frequently overlooked source." },
      limit: { q: "What's a recommended limit?", a: "Most guidelines suggest ≤2 standard drinks/day for men and ≤1 for women; this tool estimates calories only, not drinking advice." },
    },
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
  },
} as const;

export default function AlcoholCaloriesCalculator() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];

  const [drink, setDrink] = useState<Drink>("beer");
  const [ml, setMl] = useState("355");
  const [abv, setAbv] = useState("5");
  const [sugar, setSugar] = useState("13");

  const result = useMemo(() => {
    const v = Math.max(0, Number(ml) || 0);
    const a = Math.max(0, Math.min(100, Number(abv) || 0));
    const s = Math.max(0, Number(sugar) || 0);
    const grams = v * (a / 100) * ETHANOL_DENSITY;
    const fromAlcohol = grams * KCAL_PER_G_ALCOHOL;
    const fromSugar = s * 4;
    const total = fromAlcohol + fromSugar;
    return { grams, fromAlcohol, fromSugar, total };
  }, [ml, abv, sugar]);

  const activeBandKey = useMemo(() => {
    const v = result.total;
    return (bands.find((b) => v <= b.max) ?? bands[bands.length - 1]).key;
  }, [result]);

  function applyPreset(d: Drink) {
    setDrink(d);
    if (d !== "custom") {
      setMl(String(presets[d].ml));
      setAbv(String(presets[d].abv));
      setSugar(String(presets[d].sugar));
    }
  }
  function fillStandard() {
    applyPreset("beer");
  }
  function fillCocktail() {
    applyPreset("cocktail");
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
            <div className="mt-2 text-7xl font-black leading-none">{fmt(result.total, 0)}</div>
            <div className="mt-1 text-sm opacity-90">{t.quickUnit}</div>
          </div>
          <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800" />
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-7 grid grid-cols-2 gap-4 content-center">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
              <div className="text-xs text-slate-500">{t.mlLabel}</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{fmt(Number(ml))}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
              <div className="text-xs text-slate-500">{t.abvLabel}</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{fmt(Number(abv), 1)}</div>
            </div>
            <button onClick={fillStandard} className="col-span-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-3 hover:opacity-90 transition">{t.fillStandard}</button>
            <button onClick={fillCocktail} className="col-span-2 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-black py-3 hover:opacity-90 transition">{t.fillCocktail}</button>
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
                <span className="rounded-full bg-emerald-600 text-white text-xs font-black px-2 py-1">~150 kcal</span>
              </div>
            </button>
          </div>
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <span className="text-xs font-black tracking-widest uppercase text-slate-400">{t.calcTitle}</span>
            <div className="mt-3 space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.drinkLabel}</label>
                <select value={drink} onChange={(e) => applyPreset(e.target.value as Drink)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white">
                  <option value="beer">{t.beer}</option>
                  <option value="wine">{t.wine}</option>
                  <option value="spirit">{t.spirit}</option>
                  <option value="cocktail">{t.cocktail}</option>
                  <option value="custom">{t.custom}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.mlLabel}</label>
                <input type="number" min={0} value={ml} onChange={(e) => { setMl(e.target.value); setDrink("custom"); }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.abvLabel}</label>
                  <input type="number" step="0.1" min={0} max={100} value={abv} onChange={(e) => { setAbv(e.target.value); setDrink("custom"); }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.sugarLabel}</label>
                  <input type="number" min={0} value={sugar} onChange={(e) => { setSugar(e.target.value); setDrink("custom"); }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white" />
                </div>
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
              <div className="text-xs text-slate-500">{t.total}</div>
              <div className="mt-1 text-3xl font-black text-emerald-600 dark:text-emerald-400">{fmt(result.total, 0)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.fromAlcohol}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{fmt(result.fromAlcohol, 0)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.fromSugar}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{fmt(result.fromSugar, 0)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.grams}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{fmt(result.grams, 1)}<span className="text-sm"> g</span></div>
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
        <AdSenseWrapper showAds={true} adSlot="alcohol-result-intelligence" adFormat="horizontal" className="my-2" />
        <AdSlot slot="alcohol-faq" position="inline" />
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
