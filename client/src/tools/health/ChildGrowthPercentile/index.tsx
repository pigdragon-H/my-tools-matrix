import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

type Sex = "boy" | "girl";
type Metric = "height" | "weight";

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—";

const REF: Record<Sex, Record<Metric, { med: number; sd: number }>> = {
  boy: { height: { med: 110, sd: 0.06 }, weight: { med: 18.5, sd: 0.14 } },
  girl: { height: { med: 109, sd: 0.06 }, weight: { med: 18.0, sd: 0.14 } },
};

const percentileFor = (z: number) => {
  if (z <= -2) return 3;
  if (z <= -1.3) return 10;
  if (z <= -0.5) return 25;
  if (z < 0.5) return 50;
  if (z < 1.3) return 75;
  if (z < 2) return 90;
  return 97;
};

export default function ChildGrowthPercentile() {
  const { lang, setLang } = useLanguage();

  const [ageRef, setAgeRef] = useState(5);
  const [sex, setSex] = useState<Sex>("boy");
  const [metric, setMetric] = useState<Metric>("height");
  const [value, setValue] = useState(110);

  const r = useMemo(() => {
    const base = REF[sex][metric];
    const ageScale = metric === "height" ? 1 + (ageRef - 5) * 0.07 : 1 + (ageRef - 5) * 0.12;
    const med = base.med * ageScale;
    const sd = med * base.sd;
    const z = sd > 0 ? (value - med) / sd : 0;
    const pct = percentileFor(z);
    return { med, sd, z, pct };
  }, [ageRef, sex, metric, value]);

  const unit = metric === "height" ? "cm" : "kg";
  const fillBoy = () => { setSex("boy"); setMetric("height"); setAgeRef(5); setValue(110); };
  const fillGirl = () => { setSex("girl"); setMetric("weight"); setAgeRef(6); setValue(21); };

  const bands = [
    { p: "P3", label: { zh: "偏低帶", en: "Low band" }, range: { zh: "約第 3 百分位以下", en: "Below ~3rd pct" }, note: { zh: "低於同齡多數，建議與兒科討論。", en: "Below most peers; discuss with pediatrics." } },
    { p: "P10", label: { zh: "偏低正常", en: "Low-normal" }, range: { zh: "約第 3–10 百分位", en: "~3rd–10th pct" }, note: { zh: "仍在正常下緣，留意成長趨勢。", en: "Lower-normal; watch the trend." } },
    { p: "P25", label: { zh: "中下", en: "Lower-mid" }, range: { zh: "約第 10–25 百分位", en: "~10th–25th pct" }, note: { zh: "常見區間，趨勢穩定即可。", en: "Common range; stable trend is fine." } },
    { p: "P50", label: { zh: "中位", en: "Median" }, range: { zh: "約第 25–75 百分位", en: "~25th–75th pct" }, note: { zh: "落在中位附近，最常見。", en: "Around median; most common." } },
    { p: "P75", label: { zh: "中上", en: "Upper-mid" }, range: { zh: "約第 75–90 百分位", en: "~75th–90th pct" }, note: { zh: "偏高常見區間，趨勢穩定即可。", en: "Upper-common; stable trend is fine." } },
    { p: "P97", label: { zh: "偏高帶", en: "High band" }, range: { zh: "約第 90 百分位以上", en: "Above ~90th pct" }, note: { zh: "高於同齡多數，建議與兒科討論。", en: "Above most peers; discuss with pediatrics." } },
  ];

  const faqs = [
    { q: { zh: "百分位是什麼意思？", en: "What does percentile mean?" }, a: { zh: "第 50 百分位代表約一半同齡兒童比他矮或輕；數字越大代表越偏上緣。", en: "The 50th percentile means about half of same-age children are below; higher numbers are toward the upper end." } },
    { q: { zh: "這個結果準確嗎？", en: "Is this accurate?" }, a: { zh: "本工具用簡化參考帶估算，僅供教育；正式評估請用兒科生長曲線圖。", en: "This uses simplified reference bands for education only; use clinical growth charts for formal assessment." } },
    { q: { zh: "男女為什麼分開算？", en: "Why separate boys and girls?" }, a: { zh: "男女在不同年齡的身高體重分布不同，分開對照較貼近實際。", en: "Boys and girls have different height and weight distributions by age, so separate references fit better." } },
    { q: { zh: "百分位偏低要擔心嗎？", en: "Should I worry about a low percentile?" }, a: { zh: "單次數值不等於問題，連續追蹤的趨勢比單點更重要。", en: "A single value is not a problem by itself; the tracked trend matters more than one point." } },
    { q: { zh: "可以用來診斷生長遲緩嗎？", en: "Can it diagnose growth delay?" }, a: { zh: "不行，本工具僅供換算與教育，診斷請交由專業醫療判斷。", en: "No; this is for estimation and education only. Diagnosis belongs to professionals." } },
    { q: { zh: "要多久量一次？", en: "How often should I measure?" }, a: { zh: "依兒科建議的回診節奏記錄，連續多點才能看出成長曲線。", en: "Follow your pediatric schedule; multiple points reveal the growth curve." } },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">

        {/* L1 Hero */}
        <header className="rounded-[2rem] bg-white/70 p-8 shadow-sm ring-1 ring-emerald-100 backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700">
            {l({ zh: "健康 · 兒童成長 · GOLD TOOL", en: "Health · Child Growth · GOLD TOOL" }, lang)}
          </div>
          <h1 className="mt-4 text-4xl font-black text-slate-900 lg:text-5xl">
            {l({ zh: "兒童生長曲線百分位", en: "Child Growth Percentile" }, lang)} · Child Growth Percentile
          </h1>
          <p className="mt-3 max-w-2xl text-lg font-black text-slate-600">
            {l({ zh: "輸入兒童的年齡、性別與身高或體重，估算所在的生長百分位區間並對照常見參考帶。", en: "Enter a child's age, sex and height or weight to estimate the growth percentile band against common references." }, lang)}
          </p>
        </header>

        {/* L2 TrustIntro */}
        <section className="mt-6 rounded-[2rem] bg-white/60 p-6 ring-1 ring-emerald-100">
          <p className="text-sm font-black text-slate-600">
            <span className="font-black text-emerald-700">{l({ zh: "注意事項：", en: "Note: " }, lang)}</span>
            {l({ zh: "參考帶為簡化教育模型，實際生長評估須依兒科生長曲線與個別狀況；本工具僅供估算與教育，不作診斷依據。", en: "Reference bands are a simplified educational model; real assessment relies on clinical growth charts and individual context. This tool is for estimation and education only." }, lang)}
          </p>
        </section>

        {/* L3 QuickStartExample */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
            <h2 className="text-sm font-black uppercase tracking-wide text-emerald-700">{l({ zh: "快速範例卡", en: "Quick start" }, lang)}</h2>
            <p className="mt-2 font-black text-slate-600">{l({ zh: "一鍵建立兒童成長範例", en: "Create a child growth example in one click" }, lang)}</p>
          </div>
          <div className="rounded-[2rem] bg-emerald-600 p-6 text-white">
            <div className="text-xs font-black uppercase tracking-wide text-emerald-100">{l({ zh: "估算百分位", en: "Estimated pct" }, lang)}</div>
            <div className="mt-1 text-3xl font-black">P{r.pct}</div>
          </div>
        </section>

        {/* L4 InputGuidance */}
        <section className="mt-6 rounded-[2rem] bg-white/60 p-6 ring-1 ring-emerald-100">
          <h2 className="text-sm font-black uppercase tracking-wide text-emerald-700">{l({ zh: "輸入年齡、性別與量測值", en: "Enter age, sex and measurement" }, lang)}</h2>
          <p className="mt-2 font-black text-slate-600">{l({ zh: "先用範例理解身高體重如何對照百分位，再改成自己的數值。", en: "Use the example to understand the mapping, then enter your own values." }, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={fillBoy} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white">{l({ zh: "填入男孩身高範例", en: "Fill boy height example" }, lang)}</button>
            <button onClick={fillGirl} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-black text-white">{l({ zh: "填入女孩體重範例", en: "Fill girl weight example" }, lang)}</button>
          </div>
        </section>

        {/* L5 CalculatorInput */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[2rem] bg-white/80 p-6 ring-1 ring-emerald-100">
            <h2 className="text-lg font-black text-slate-900">{l({ zh: "計算機", en: "Calculator" }, lang)}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "年齡（歲）", en: "Age (years)" }, lang)}</span>
                <input type="number" value={ageRef} min={2} max={12} onChange={(e) => setAgeRef(parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "性別", en: "Sex" }, lang)}</span>
                <select value={sex} onChange={(e) => setSex(e.target.value as Sex)} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2">
                  <option value="boy">{l({ zh: "男孩", en: "Boy" }, lang)}</option>
                  <option value="girl">{l({ zh: "女孩", en: "Girl" }, lang)}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "量測項目", en: "Metric" }, lang)}</span>
                <select value={metric} onChange={(e) => setMetric(e.target.value as Metric)} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2">
                  <option value="height">{l({ zh: "身高 (cm)", en: "Height (cm)" }, lang)}</option>
                  <option value="weight">{l({ zh: "體重 (kg)", en: "Weight (kg)" }, lang)}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "量測值", en: "Value" }, lang)} ({unit})</span>
                <input type="number" value={value} min={0} onChange={(e) => setValue(parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2" />
              </label>
            </div>
          </div>

          {/* L6 PrimaryResult */}
          <div className="rounded-[2rem] bg-slate-950 p-6 text-emerald-200 lg:w-80">
            <div className="text-xs font-black uppercase tracking-wide text-emerald-400">{l({ zh: "估算結果", en: "Result" }, lang)}</div>
            <div className="mt-2 text-4xl font-black text-white">P{r.pct}</div>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-200">
{`metric : ${metric}
value  : ${fmt(value)} ${unit}
median : ${fmt(r.med)} ${unit}
z-score: ${fmt(r.z, 2)}
pctile : P${r.pct}`}
            </pre>
          </div>
        </section>

        {/* L7 ResultIntelligence */}
        <section className="mt-6 mx-auto max-w-7xl rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "結果解讀", en: "Result intelligence" }, lang)}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{l({ zh: "六格百分位帶判讀矩陣（L7）固定六格，對照常見參考帶；這是教育參考，不是醫療診斷。", en: "Six-band percentile matrix (L7), fixed six cells against common references; educational, not diagnosis." }, lang)}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {bands.map((b) => (
              <div key={b.p} className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <div className="text-base font-black text-emerald-700">{b.p} · {l(b.label, lang)}</div>
                <div className="text-sm font-black text-slate-700">{l(b.range, lang)}</div>
                <div className="mt-1 text-sm font-black text-slate-600">{l(b.note, lang)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* L8 ScenarioComparison */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "情境對照", en: "Scenario comparison" }, lang)}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "目前數值", en: "Current value" }, lang)}</div>
              <div className="text-2xl font-black text-emerald-700">{fmt(value)} {unit} → P{r.pct}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "同齡中位", en: "Age median" }, lang)}</div>
              <div className="text-2xl font-black text-teal-700">{fmt(r.med)} {unit} → P50</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "與中位差距", en: "Gap vs median" }, lang)}</div>
              <div className="text-2xl font-black text-blue-700">{fmt(value - r.med)} {unit}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "標準差倍數", en: "Z-score" }, lang)}</div>
              <div className="text-2xl font-black text-orange-600">{fmt(r.z, 2)}</div>
            </div>
          </div>
        </section>

        {/* L9 EmotionConversionUpper */}
        <AdSenseWrapper showAds={true} adSlot="cgp-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="mt-6 rounded-[2rem] bg-emerald-600 p-8 text-white">
          <h2 className="text-2xl font-black">{l({ zh: "把成長百分位轉成可理解資訊", en: "Turn the percentile into something readable" }, lang)}</h2>
          <p className="mt-2 max-w-2xl font-black text-emerald-50">{l({ zh: "L9 會連動目前估算結果，顯示量測值、同齡中位與相對參考提示。", en: "L9 reacts to the current estimate, showing value, age median and relative reference hints." }, lang)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black uppercase text-emerald-100">{l({ zh: "百分位", en: "Percentile" }, lang)}</div><div className="text-2xl font-black">P{r.pct}</div></div>
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black uppercase text-emerald-100">{l({ zh: "量測值", en: "Value" }, lang)}</div><div className="text-2xl font-black">{fmt(value)} {unit}</div></div>
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black uppercase text-emerald-100">{l({ zh: "同齡中位", en: "Median" }, lang)}</div><div className="text-2xl font-black">{fmt(r.med)} {unit}</div></div>
          </div>
        </section>

        {/* L10 EmotionConversionLower */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "進度洞察卡", en: "Progress insight" }, lang)}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{l({ zh: "估算百分位", en: "Pct" }, lang)}</div><div className="text-xl font-black text-slate-900">P{r.pct}</div></div>
            <div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{l({ zh: "中位", en: "Median" }, lang)}</div><div className="text-xl font-black text-slate-900">{fmt(r.med)} {unit}</div></div>
            <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">{l({ zh: "標準差", en: "SD" }, lang)}</div><div className="text-xl font-black text-slate-900">{fmt(r.sd)} {unit}</div></div>
          </div>
          <p className="mt-4 text-sm font-black text-slate-600">{l({ zh: "單次數值受測量方式與時間影響，建議以多點連續記錄看成長曲線。", en: "A single value depends on measurement method and time; track multiple points to see the growth curve." }, lang)}</p>
        </section>

        {/* L11 DecisionPath */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "決策路徑", en: "Decision path" }, lang)}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{l({ zh: "量測 → 估算 → 對照趨勢 → 追蹤", en: "Measure → Estimate → Compare trend → Track" }, lang)}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">1 Measure · {l({ zh: "量測", en: "measure" }, lang)}</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">2 Estimate · {l({ zh: "估算", en: "estimate" }, lang)}</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">3 Compare · {l({ zh: "對照", en: "compare" }, lang)}</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">4 Track · {l({ zh: "追蹤", en: "track" }, lang)}</div>
          </div>
        </section>

        {/* L12 Knowledge */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "生長百分位的意義", en: "What growth percentile means" }, lang)}</h2>
          <dl className="mt-4 grid gap-4 lg:grid-cols-2">
            <div><dt className="font-black text-emerald-700">{l({ zh: "定義", en: "Definition" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "百分位代表在同齡同性別群體中的相對位置，第 50 百分位約為中位。", en: "A percentile is the relative position within same-age, same-sex peers; the 50th is roughly median." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "公式", en: "Formula" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "z = (量測值 − 中位) ÷ 標準差，再對照百分位帶。", en: "z = (value − median) ÷ SD, then map to a percentile band." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "限制", en: "Limits" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "本模型為簡化教育版，正式評估須用兒科生長曲線圖。", en: "This is a simplified educational model; formal assessment needs clinical growth charts." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "解讀", en: "Reading" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "趨勢比單點重要，連續沿同一條百分位線通常代表穩定成長。", en: "Trend matters more than one point; staying along one percentile line usually means steady growth." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "脈絡", en: "Context" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "遺傳、營養與健康狀況都會影響百分位，需整體判讀。", en: "Genetics, nutrition and health all affect percentile; read it holistically." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "範例", en: "Example" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "5 歲男孩 110 cm 約落在 P50 中位附近。", en: "A 5-year-old boy at 110 cm sits near the P50 median." }, lang)}</dd></div>
          </dl>
        </section>

        {/* L13 FAQ */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "常見問題", en: "FAQ" }, lang)}</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="rounded-2xl bg-slate-50 p-4">
                <summary className="cursor-pointer font-black text-slate-800">{l(f.q, lang)}</summary>
                <p className="mt-2 text-sm font-black text-slate-600">{l(f.a, lang)}</p>
              </details>
            ))}
          </div>
        </section>

        {/* L14 FAQAfterAdSlot */}
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="cgp-faq" position="inline" /></section>

        {/* L15 AffiliateResources */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "推薦工具", en: "Recommended tools" }, lang)}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{l({ zh: "兒童健康規劃的下一步工具", en: "Next tools for child health planning" }, lang)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a href="/tools/health/bmi-calculator" className="rounded-2xl bg-emerald-50 p-4 font-black text-emerald-700">{l({ zh: "BMI 計算機", en: "BMI Calculator" }, lang)}</a>
            <a href="/tools/health/tdee-calculator" className="rounded-2xl bg-teal-50 p-4 font-black text-teal-700">{l({ zh: "TDEE 計算機", en: "TDEE Calculator" }, lang)}</a>
            <a href="/tools/health/macro-calculator" className="rounded-2xl bg-blue-50 p-4 font-black text-blue-700">{l({ zh: "巨量營養素計算機", en: "Macro Calculator" }, lang)}</a>
          </div>
          <p className="mt-3 text-xs text-slate-400">{l({ zh: "* 聯盟連結，購買後我們可能獲得佣金。", en: "* Affiliate links; we may earn a commission." }, lang)}</p>
        </section>

        {/* L16 PremiumGate */}
        <section className="mt-6">
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black">{l({ zh: "PRO 成長追蹤包", en: "PRO Growth Tracking" }, lang)}</h2>
              <p className="mt-2 font-black text-slate-300">{l({ zh: "解鎖多點生長曲線、百分位趨勢圖與個人化追蹤報告。", en: "Unlock multi-point growth curves, percentile trend charts and personalized tracking reports." }, lang)}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4 font-black">{l({ zh: "生長曲線", en: "Growth curve" }, lang)}</div>
                <div className="rounded-2xl bg-white/10 p-4 font-black">{l({ zh: "趨勢圖", en: "Trend chart" }, lang)}</div>
                <div className="rounded-2xl bg-white/10 p-4 font-black">{l({ zh: "報表", en: "Reports" }, lang)}</div>
              </div>
            </div>
          </PremiumGate>
        </section>

        {/* L17 TrustRelatedReferences */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "信任聲明 · 相關工具 · 參考資料", en: "Trust · Related tools · References" }, lang)}</h2>
          <p className="mt-2 text-sm font-black text-slate-600">{l({ zh: "本工具只供換算與教育用途，不取代醫療診斷、生長評估或專業健康建議。", en: "This tool is for estimation and education only and does not replace medical diagnosis, growth assessment or professional advice." }, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/tools/health/bmi-calculator" className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">BMI</a>
            <a href="/tools/health/tdee-calculator" className="rounded-full bg-teal-100 px-4 py-2 text-sm font-black text-teal-700">TDEE</a>
            <a href="/tools/health/macro-calculator" className="rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700">Macro</a>
          </div>
        </section>

      </div>
    </div>
  );
}
