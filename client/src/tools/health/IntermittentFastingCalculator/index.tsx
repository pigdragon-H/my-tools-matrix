import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { name: LocalText; desc: LocalText; url: string };
type Protocol = "16:8" | "18:6" | "20:4" | "23:1" | "14:10";

const l = (t: LocalText, lang: Lang) => t[lang];
const fmt = (n: number, d = 0) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

function clockLabel(h: number): string {
  const hh = ((Math.floor(h) % 24) + 24) % 24;
  const mm = Math.round((h - Math.floor(h)) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

type Band = { key: string; max: number; label: LocalText; tip: LocalText };
const bands: Band[] = [
  { key: "gentle", max: 14, label: { zh: "溫和入門", en: "Gentle" }, tip: { zh: "14 小時內斷食，適合初學者建立節律。", en: "Fasting under 14h; great for beginners building rhythm." } },
  { key: "standard", max: 16, label: { zh: "標準", en: "Standard" }, tip: { zh: "16 小時是最普及的入門起點，平衡效益與可持續。", en: "16h is the most popular entry point; balances benefit and sustainability." } },
  { key: "advanced", max: 18, label: { zh: "進階", en: "Advanced" }, tip: { zh: "18 小時加深代謝彈性，注意進食窗營養密度。", en: "18h deepens metabolic flexibility; mind nutrient density in the window." } },
  { key: "aggressive", max: 20, label: { zh: "積極", en: "Aggressive" }, tip: { zh: "20 小時接近單餐型態，需確保蛋白與微量元素充足。", en: "20h nears one-meal style; ensure adequate protein and micronutrients." } },
  { key: "omad", max: 23, label: { zh: "單餐 OMAD", en: "OMAD" }, tip: { zh: "每日一餐，門檻高，建議有經驗者並監測體感。", en: "One meal a day; high bar—best for experienced users monitoring how they feel." } },
  { key: "extreme", max: Infinity, label: { zh: "極限", en: "Extreme" }, tip: { zh: "超過 23 小時屬延長斷食，請審慎並諮詢專業意見。", en: "Beyond 23h is extended fasting; proceed cautiously and seek professional advice." } },
];

const affiliateItems: AffiliateItem[] = [
  { name: { zh: "斷食追蹤 App", en: "Fasting Tracker App" }, desc: { zh: "計時進食窗、記錄斷食時數與連續天數", en: "Time your window, log fasting hours and streaks" }, url: "https://www.amazon.com/s?k=fasting+tracker+app" },
  { name: { zh: "電解質補充飲", en: "Electrolyte Drink Mix" }, desc: { zh: "斷食期補充鈉鉀鎂，減少頭暈疲勞", en: "Replenish sodium/potassium/magnesium during fasts to reduce dizziness" }, url: "https://www.amazon.com/s?k=electrolyte+drink+mix" },
  { name: { zh: "黑咖啡／無糖茶", en: "Black Coffee / Tea" }, desc: { zh: "零熱量飲品，幫助度過斷食時段", en: "Zero-calorie drinks to help bridge fasting windows" }, url: "https://www.amazon.com/s?k=black+coffee" },
  { name: { zh: "保溫水瓶", en: "Insulated Water Bottle" }, desc: { zh: "維持充足水分是順利斷食的關鍵", en: "Staying hydrated is key to a smooth fast" }, url: "https://www.amazon.com/s?k=insulated+water+bottle" },
];

const faqKeys = ["which", "drink", "who", "break"] as const;

const protocolFast: Record<Protocol, number> = { "14:10": 14, "16:8": 16, "18:6": 18, "20:4": 20, "23:1": 23 };

const ui = {
  zh: {
    heroTag: "飲食 · 間歇斷食",
    heroTitle: "間歇性斷食計算機",
    heroDesc: "選擇斷食法與進食窗起始時間，計算每日斷食時數、進食窗長度與起訖時刻，幫你把斷食排程具體化。",
    quickTitle: "每日斷食時數預覽",
    quickUnit: "小時/天",
    fillStandard: "一鍵標準範例",
    fillStrict: "填入 20:4 範例",
    metricNote: "註：間歇斷食非人人適合，孕期、糖尿病、進食障礙史或服藥者請先諮詢醫師。",
    examplesTag: "範例 → 計算機",
    enterTitle: "選擇斷食法與起始時間",
    enterHint: "先用範例理解算法，再換成你自己的斷食法與進食窗開始時間。",
    exampleCard: "範例卡",
    exampleName: "16:8 · 12:00 開窗",
    calcTitle: "計算機",
    protocolLabel: "斷食法",
    startLabel: "進食窗開始（24 小時制）",
    resultTitle: "你的斷食排程",
    fastHours: "每日斷食",
    eatHours: "進食窗",
    eatStart: "開窗時間",
    eatEnd: "關窗時間",
    bandsTitle: "斷食強度帶",
    knowledgeTitle: "知識與常見問題",
    decisionTitle: "怎麼用這個排程",
    decisionBody: "固定每天的開窗與關窗時間，讓身體建立節律。進食窗內仍以均衡、足量蛋白的原型食物為主，斷食期維持水分與電解質。",
    trustTitle: "方法與參考",
    trustBody: "本工具以常見斷食協定（14:10、16:8、18:6、20:4、OMAD 23:1）計算斷食與進食時數，並以進食窗起始時間推算起訖時刻。僅供排程規劃，非醫療建議。",
    references: "參考：de Cabo & Mattson 間歇斷食代謝健康綜述（NEJM, 2019）。",
    affiliateTitle: "推薦工具",
    premiumTitle: "解鎖個人化斷食計畫",
    premiumDesc: "升級可取得週期化斷食排程、進食窗營養範本與連續天數成就追蹤。",
    faq: {
      which: { q: "新手該從哪種開始？", a: "建議從 14:10 或 16:8 入門，身體適應後再視體感逐步延長到 18:6 或 20:4。" },
      drink: { q: "斷食期能喝什麼？", a: "水、黑咖啡、無糖茶等零熱量飲品可接受；任何含糖或含熱量飲品都會中斷斷食。" },
      who: { q: "誰不適合斷食？", a: "孕期或哺乳、第一型糖尿病、有進食障礙病史、體重過輕或服用需配餐藥物者，應先諮詢醫師。" },
      break: { q: "如何開窗第一餐？", a: "建議以蛋白質與纖維為主、避免大量精製糖，減少血糖驟升與暴食衝動。" },
    },
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
  },
  en: {
    heroTag: "Diet · Intermittent Fasting",
    heroTitle: "Intermittent Fasting Calculator",
    heroDesc: "Pick a fasting protocol and your eating-window start time to compute daily fasting hours, window length and open/close times—turning fasting into a concrete schedule.",
    quickTitle: "DAILY FASTING HOURS PREVIEW",
    quickUnit: "hours/day",
    fillStandard: "One-click standard example",
    fillStrict: "Fill 20:4 example",
    metricNote: "Note: Intermittent fasting isn't for everyone—if pregnant, diabetic, with an eating-disorder history, or on medication, consult a doctor first.",
    examplesTag: "EXAMPLES → CALCULATOR",
    enterTitle: "Pick protocol and start time",
    enterHint: "Start with an example to understand the math, then swap in your own protocol and window start time.",
    exampleCard: "Example card",
    exampleName: "16:8 · open at 12:00",
    calcTitle: "Calculator",
    protocolLabel: "Fasting protocol",
    startLabel: "Eating-window start (24h)",
    resultTitle: "Your fasting schedule",
    fastHours: "Daily fasting",
    eatHours: "Eating window",
    eatStart: "Window opens",
    eatEnd: "Window closes",
    bandsTitle: "Fasting intensity bands",
    knowledgeTitle: "Knowledge & FAQ",
    decisionTitle: "How to use this schedule",
    decisionBody: "Keep your open/close times consistent daily so your body builds a rhythm. Eat balanced, protein-rich whole foods within the window and stay hydrated with electrolytes while fasting.",
    trustTitle: "Method & references",
    trustBody: "This tool uses common fasting protocols (14:10, 16:8, 18:6, 20:4, OMAD 23:1) to compute fasting and eating hours, deriving open/close clock times from your window start. For scheduling only, not medical advice.",
    references: "Reference: de Cabo & Mattson, intermittent fasting and metabolic health review (NEJM, 2019).",
    affiliateTitle: "Recommended tools",
    premiumTitle: "Unlock personalized fasting plan",
    premiumDesc: "Upgrade for periodized fasting schedules, eating-window nutrition templates and streak achievement tracking.",
    faq: {
      which: { q: "Which protocol should beginners start with?", a: "Start with 14:10 or 16:8; once adapted, gradually extend to 18:6 or 20:4 based on how you feel." },
      drink: { q: "What can I drink while fasting?", a: "Water, black coffee and unsweetened tea (zero calories) are fine; any sugary or caloric drink breaks the fast." },
      who: { q: "Who should not fast?", a: "Those pregnant/breastfeeding, with type-1 diabetes, an eating-disorder history, underweight, or on meal-dependent medication should consult a doctor first." },
      break: { q: "How should I break the fast?", a: "Lead with protein and fiber and avoid large refined-sugar loads to curb blood-sugar spikes and overeating urges." },
    },
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
  },
} as const;

export default function IntermittentFastingCalculator() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];

  const [protocol, setProtocol] = useState<Protocol>("16:8");
  const [start, setStart] = useState("12");

  const result = useMemo(() => {
    const fastHours = protocolFast[protocol];
    const eatHours = 24 - fastHours;
    const s = Math.max(0, Math.min(23.99, Number(start) || 0));
    const end = s + eatHours;
    return { fastHours, eatHours, start: s, end, startLabel: clockLabel(s), endLabel: clockLabel(end) };
  }, [protocol, start]);

  const activeBandKey = useMemo(() => {
    const v = result.fastHours;
    return (bands.find((b) => v <= b.max) ?? bands[bands.length - 1]).key;
  }, [result]);

  function fillStandard() {
    setProtocol("16:8");
    setStart("12");
  }
  function fillStrict() {
    setProtocol("20:4");
    setStart("16");
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
            <div className="mt-2 text-7xl font-black leading-none">{fmt(result.fastHours, 0)}</div>
            <div className="mt-1 text-sm opacity-90">{t.quickUnit}</div>
          </div>
          <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800" />
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-7 grid grid-cols-2 gap-4 content-center">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
              <div className="text-xs text-slate-500">{t.protocolLabel}</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{protocol}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
              <div className="text-xs text-slate-500">{t.eatHours}</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{fmt(result.eatHours)}</div>
            </div>
            <button onClick={fillStandard} className="col-span-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-3 hover:opacity-90 transition">{t.fillStandard}</button>
            <button onClick={fillStrict} className="col-span-2 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-black py-3 hover:opacity-90 transition">{t.fillStrict}</button>
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
                <span className="rounded-full bg-emerald-600 text-white text-xs font-black px-2 py-1">16 h</span>
              </div>
            </button>
          </div>
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <span className="text-xs font-black tracking-widest uppercase text-slate-400">{t.calcTitle}</span>
            <div className="mt-3 space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.protocolLabel}</label>
                <select value={protocol} onChange={(e) => setProtocol(e.target.value as Protocol)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white">
                  <option value="14:10">14:10</option>
                  <option value="16:8">16:8</option>
                  <option value="18:6">18:6</option>
                  <option value="20:4">20:4</option>
                  <option value="23:1">23:1 (OMAD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{t.startLabel}</label>
                <input type="number" min={0} max={23} value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white" />
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
              <div className="text-xs text-slate-500">{t.fastHours}</div>
              <div className="mt-1 text-3xl font-black text-emerald-600 dark:text-emerald-400">{fmt(result.fastHours)}<span className="text-sm"> h</span></div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.eatHours}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{fmt(result.eatHours)}<span className="text-sm"> h</span></div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.eatStart}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{result.startLabel}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center">
              <div className="text-xs text-slate-500">{t.eatEnd}</div>
              <div className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{result.endLabel}</div>
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
        <AdSenseWrapper showAds={true} adSlot="fasting-result-intelligence" adFormat="horizontal" className="my-2" />
        <AdSlot slot="fasting-faq" position="inline" />
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
