import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

type Sex = "male" | "female";
const R_FACTOR: Record<Sex, number> = { male: 0.68, female: 0.55 };
const MET_RATE = 0.015; // %BAC per hour
const GRAM_PER_DRINK = 10; // grams ethanol per standard drink

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—";

export default function SobrietyCalculator() {
  const { lang, setLang } = useLanguage();

  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState(70);
  const [drinks, setDrinks] = useState(2);
  const [hours, setHours] = useState(1);

  const r = useMemo(() => {
    const rFactor = R_FACTOR[sex];
    const bacRaw = (drinks * GRAM_PER_DRINK) / (weight * rFactor * 10);
    const bac = Math.max(0, bacRaw - MET_RATE * hours);
    const sobrietyH = bac > 0 ? bac / MET_RATE : 0;
    return { rFactor, bacRaw, bac, sobrietyH };
  }, [sex, weight, drinks, hours]);

  const fillBeer = () => { setSex("male"); setWeight(70); setDrinks(2); setHours(1); };
  const fillWine = () => { setSex("female"); setWeight(55); setDrinks(3); setHours(2); };

  const bands = [
    { label: { zh: "清醒", en: "Sober" }, range: "0–0.02%", note: { zh: "法定清醒區間，無影響。", en: "Legally sober; no effect." } },
    { label: { zh: "微醺", en: "Buzzed" }, range: "0.02–0.05%", note: { zh: "輕微放鬆，反應略降。", en: "Mild relaxation; slight reaction decrease." } },
    { label: { zh: "酒醉影響", en: "Impaired" }, range: "0.05–0.08%", note: { zh: "判斷與協調下降，多數地區此時駕車違法。", en: "Judgment & coordination decline; illegal to drive in most areas." } },
    { label: { zh: "法定酒駕", en: "DUI limit" }, range: "≥0.08%", note: { zh: "超過多數地區法定酒駕標準，嚴重危險。", en: "Exceeds legal DUI limit in most regions; extremely dangerous." } },
    { label: { zh: "重度醉酒", en: "Heavily intoxicated" }, range: "≥0.15%", note: { zh: "嚴重影響平衡與意識，須有人照顧。", en: "Severe balance & consciousness impact; needs supervision." } },
    { label: { zh: "急性危險", en: "Acute danger" }, range: "≥0.30%", note: { zh: "可能危及生命，請立即就醫。", en: "Potentially life-threatening; seek emergency care immediately." } },
  ];

  const faqs = [
    { q: { zh: "BAC 是什麼？", en: "What is BAC?" }, a: { zh: "血液酒精濃度（Blood Alcohol Concentration），代表每 100 毫升血液中的酒精克數。", en: "Blood Alcohol Concentration: grams of alcohol per 100 mL of blood." } },
    { q: { zh: "代謝速率是多少？", en: "What is the metabolism rate?" }, a: { zh: "平均約每小時下降 0.015%，個人差異大。", en: "Average ~0.015% per hour; individual variation is large." } },
    { q: { zh: "多久後可以開車？", en: "When can I drive?" }, a: { zh: "需等 BAC 降到法定限制以下，本工具僅供估算；實際應以酒精測試器確認。", en: "Wait until BAC drops below the legal limit; this tool only estimates. Use a breathalyzer to confirm." } },
    { q: { zh: "男女為什麼不同？", en: "Why different for men and women?" }, a: { zh: "女性平均體水比例較低，同量酒精濃度較高。", en: "Women generally have lower body water ratio, leading to higher BAC from the same amount." } },
    { q: { zh: "空腹和飽腹有差嗎？", en: "Does eating affect BAC?" }, a: { zh: "空腹吸收較快，峰值較高；本模型未區分，僅用平均估算。", en: "Empty stomach absorbs faster with a higher peak; this model uses averages and does not differentiate." } },
    { q: { zh: "這個計算準確嗎？", en: "Is this calculation accurate?" }, a: { zh: "Widmark 公式為概估模型，實際值受體質、食物與飲酒速度影響；僅供教育，不作法律依據。", en: "The Widmark formula is an estimate; actual BAC varies with body, food and drinking pace. Educational only, not legal evidence." } },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">

        {/* L1 Hero */}
        <header className="rounded-[2rem] bg-white/70 p-8 shadow-sm ring-1 ring-emerald-100 backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700">
            {l({ zh: "健康 · 酒精代謝 · GOLD TOOL", en: "Health · Alcohol Metabolism · GOLD TOOL" }, lang)}
          </div>
          <h1 className="mt-4 text-4xl font-black text-slate-900 lg:text-5xl">
            {l({ zh: "酒精濃度計算機", en: "Sobriety Calculator" }, lang)} · Sobriety Calculator
          </h1>
          <p className="mt-3 max-w-2xl text-lg font-black text-slate-600">
            {l({ zh: "輸入飲酒量與體重，估算血液酒精濃度（BAC）與大致代謝所需時間。", en: "Enter drinks and body weight to estimate Blood Alcohol Concentration and time to sober up." }, lang)}
          </p>
        </header>

        {/* L2 TrustIntro */}
        <section className="mt-6 rounded-[2rem] bg-white/60 p-6 ring-1 ring-emerald-100">
          <p className="text-sm font-black text-slate-600">
            <span className="font-black text-emerald-700">{l({ zh: "注意事項：", en: "Note: " }, lang)}</span>
            {l({ zh: "Widmark 公式為概估模型，實際 BAC 受體質、食物與飲酒速度影響；本工具僅供教育，不作法律或駕車依據。切勿酒駕。", en: "The Widmark formula is an estimate; actual BAC varies with body, food and drinking pace. Educational only, not legal or driving advice. Never drink and drive." }, lang)}
          </p>
        </section>

        {/* L3 QuickStartExample */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
            <h2 className="text-sm font-black uppercase tracking-wide text-emerald-700">{l({ zh: "快速範例卡", en: "Quick start" }, lang)}</h2>
            <p className="mt-2 font-black text-slate-600">{l({ zh: "一鍵建立飲酒範例", en: "Create a drinking example in one click" }, lang)}</p>
          </div>
          <div className="rounded-[2rem] bg-emerald-600 p-6 text-white">
            <div className="text-xs font-black uppercase tracking-wide text-emerald-100">{l({ zh: "估算 BAC", en: "Estimated BAC" }, lang)}</div>
            <div className="mt-1 text-3xl font-black">{fmt(r.bac)}%</div>
          </div>
        </section>

        {/* L4 InputGuidance */}
        <section className="mt-6 rounded-[2rem] bg-white/60 p-6 ring-1 ring-emerald-100">
          <h2 className="text-sm font-black uppercase tracking-wide text-emerald-700">{l({ zh: "輸入飲酒資訊", en: "Enter drinking info" }, lang)}</h2>
          <p className="mt-2 font-black text-slate-600">{l({ zh: "先用範例理解 BAC 如何估算，再改成自己的數值。", en: "Use the example first, then enter your own values." }, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={fillBeer} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white">{l({ zh: "填入啤酒範例", en: "Fill beer example" }, lang)}</button>
            <button onClick={fillWine} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-black text-white">{l({ zh: "填入紅酒範例", en: "Fill wine example" }, lang)}</button>
          </div>
        </section>

        {/* L5 CalculatorInput */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[2rem] bg-white/80 p-6 ring-1 ring-emerald-100">
            <h2 className="text-lg font-black text-slate-900">{l({ zh: "計算機", en: "Calculator" }, lang)}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "性別", en: "Sex" }, lang)}</span>
                <select value={sex} onChange={(e) => setSex(e.target.value as Sex)} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2">
                  <option value="male">{l({ zh: "男性", en: "Male" }, lang)}</option>
                  <option value="female">{l({ zh: "女性", en: "Female" }, lang)}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "體重（kg）", en: "Weight (kg)" }, lang)}</span>
                <input type="number" value={weight} min={30} max={200} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "標準杯數", en: "Standard drinks" }, lang)}</span>
                <input type="number" value={drinks} min={0} max={30} onChange={(e) => setDrinks(parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "飲酒後經過（小時）", en: "Hours since drinking" }, lang)}</span>
                <input type="number" value={hours} min={0} max={24} onChange={(e) => setHours(parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2" />
              </label>
            </div>
          </div>

          {/* L6 PrimaryResult */}
          <div className="rounded-[2rem] bg-slate-950 p-6 text-emerald-200 lg:w-80">
            <div className="text-xs font-black uppercase tracking-wide text-emerald-400">{l({ zh: "估算結果", en: "Result" }, lang)}</div>
            <div className="mt-2 text-4xl font-black text-white">{fmt(r.bac)}%</div>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-200">
{`BAC raw : ${fmt(r.bacRaw)}%
BAC now  : ${fmt(r.bac)}%
r-factor : ${fmt(r.rFactor, 2)}
met rate : ${MET_RATE}%/h
sobriety : ${fmt(r.sobrietyH, 1)}h`}
            </pre>
          </div>
        </section>

        {/* L7 ResultIntelligence */}
        <section className="mt-6 mx-auto max-w-7xl rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "結果解讀", en: "Result intelligence" }, lang)}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{l({ zh: "六格 BAC 區間判讀矩陣（L7）固定六格，對照常見影響帶；這是教育參考，不是法律標準。", en: "Six-band BAC matrix (L7), fixed six cells against common effect bands; educational, not legal standard." }, lang)}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {bands.map((b, i) => (
              <div key={i} className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <div className="text-base font-black text-emerald-700">{l(b.label, lang)} · {b.range}</div>
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
              <div className="text-sm font-black text-slate-700">{l({ zh: "目前 BAC", en: "Current BAC" }, lang)}</div>
              <div className="text-2xl font-black text-emerald-700">{fmt(r.bac)}%</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "原始 BAC", en: "Raw BAC" }, lang)}</div>
              <div className="text-2xl font-black text-teal-700">{fmt(r.bacRaw)}%</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "已代謝時間", en: "Hours elapsed" }, lang)}</div>
              <div className="text-2xl font-black text-blue-700">{hours}h</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "尚需清醒時間", en: "Hours to sober" }, lang)}</div>
              <div className="text-2xl font-black text-orange-600">{fmt(r.sobrietyH, 1)}h</div>
            </div>
          </div>
        </section>

        {/* L9 EmotionConversionUpper */}
        <AdSenseWrapper showAds={true} adSlot="sobre-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="mt-6 rounded-[2rem] bg-emerald-600 p-8 text-white">
          <h2 className="text-2xl font-black">{l({ zh: "把 BAC 轉成可理解資訊", en: "Turn BAC into something readable" }, lang)}</h2>
          <p className="mt-2 max-w-2xl font-black text-emerald-50">{l({ zh: "L9 會連動目前估算結果，顯示 BAC、代謝時間與相對參考提示。", en: "L9 reacts to the current estimate, showing BAC, metabolism time and relative hints." }, lang)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black uppercase text-emerald-100">{l({ zh: "BAC", en: "BAC" }, lang)}</div><div className="text-2xl font-black">{fmt(r.bac)}%</div></div>
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black uppercase text-emerald-100">{l({ zh: "已代謝", en: "Elapsed" }, lang)}</div><div className="text-2xl font-black">{hours}h</div></div>
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black uppercase text-emerald-100">{l({ zh: "尚需", en: "To sober" }, lang)}</div><div className="text-2xl font-black">{fmt(r.sobrietyH, 1)}h</div></div>
          </div>
        </section>

        {/* L10 EmotionConversionLower */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "進度洞察卡", en: "Progress insight" }, lang)}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{l({ zh: "目前 BAC", en: "BAC now" }, lang)}</div><div className="text-xl font-black text-slate-900">{fmt(r.bac)}%</div></div>
            <div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{l({ zh: "代謝率", en: "Met rate" }, lang)}</div><div className="text-xl font-black text-slate-900">{MET_RATE}%/h</div></div>
            <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">{l({ zh: "清醒時間", en: "Sober time" }, lang)}</div><div className="text-xl font-black text-slate-900">{fmt(r.sobrietyH, 1)}h</div></div>
          </div>
          <p className="mt-4 text-sm font-black text-slate-600">{l({ zh: "代謝速率因人而異，本工具僅用平均值估算；切勿以此判斷能否駕車。", en: "Metabolism rate varies; this uses averages only. Never use this to decide whether to drive." }, lang)}</p>
        </section>

        {/* L11 DecisionPath */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "決策路徑", en: "Decision path" }, lang)}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{l({ zh: "飲酒 → 估算 → 等待 → 確認", en: "Drink → Estimate → Wait → Confirm" }, lang)}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">1 Drink · {l({ zh: "飲酒", en: "drink" }, lang)}</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">2 Estimate · {l({ zh: "估算", en: "estimate" }, lang)}</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">3 Wait · {l({ zh: "等待", en: "wait" }, lang)}</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">4 Confirm · {l({ zh: "確認", en: "confirm" }, lang)}</div>
          </div>
        </section>

        {/* L12 Knowledge */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "BAC 與代謝的知識", en: "BAC and metabolism knowledge" }, lang)}</h2>
          <dl className="mt-4 grid gap-4 lg:grid-cols-2">
            <div><dt className="font-black text-emerald-700">{l({ zh: "定義", en: "Definition" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "BAC 為血液酒精濃度，代表每 100 mL 血液中酒精克數百分比。", en: "BAC is Blood Alcohol Concentration: percentage of alcohol grams per 100 mL blood." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "公式（Widmark）", en: "Formula (Widmark)" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "BAC% = (標準杯 × 10) ÷ (體重 × r × 10) − 0.015 × 小時。男性 r≈0.68，女性 r≈0.55。", en: "BAC% = (drinks × 10) ÷ (weight × r × 10) − 0.015 × hours. Male r≈0.68, female r≈0.55." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "限制", en: "Limits" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "Widmark 為概估模型，未考慮食物、飲酒速度與肝功能差異。", en: "Widmark is an estimate; it does not account for food, drinking pace or liver function." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "解讀", en: "Reading" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "0.08% 是多數地區酒駕法定上限，超過即違法；0.05% 即有影響。", en: "0.08% is the DUI limit in most regions; 0.05% already impairs judgment." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "脈絡", en: "Context" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "酒精代謝與體水比例、年齡和肝臟健康有關，需整體判讀。", en: "Alcohol metabolism relates to body water ratio, age and liver health; read holistically." }, lang)}</dd></div>
            <div><dt className="font-black text-emerald-700">{l({ zh: "範例", en: "Example" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "70kg 男性 2 杯 1h → BAC ≈ 0.03%。", en: "70 kg male, 2 drinks, 1h → BAC ≈ 0.03%." }, lang)}</dd></div>
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="sobre-faq" position="inline" /></section>

        {/* L15 AffiliateResources */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "推薦工具", en: "Recommended tools" }, lang)}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{l({ zh: "健康規劃的下一步工具", en: "Next tools for health planning" }, lang)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a href="/tools/health/bmi-calculator" className="rounded-2xl bg-emerald-50 p-4 font-black text-emerald-700">{l({ zh: "BMI 計算機", en: "BMI Calculator" }, lang)}</a>
            <a href="/tools/health/tdee-calculator" className="rounded-2xl bg-teal-50 p-4 font-black text-teal-700">{l({ zh: "TDEE 計算機", en: "TDEE Calculator" }, lang)}</a>
            <a href="/tools/health/macro-calculator" className="rounded-2xl bg-blue-50 p-4 font-black text-blue-700">{l({ zh: "巨量營養素計算機", en: "Macro Calculator" }, lang)}</a>
          </div>
          <p className="mt-3 text-xs font-black text-slate-400">{l({ zh: "* 聯盟連結，購買後我們可能獲得佣金。", en: "* Affiliate links; we may earn a commission." }, lang)}</p>
        </section>

        {/* L16 PremiumGate */}
        <section className="mt-6">
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black">{l({ zh: "PRO 酒精追蹤包", en: "PRO Alcohol Tracking" }, lang)}</h2>
              <p className="mt-2 font-black text-slate-300">{l({ zh: "解鎖多次飲酒記錄、BAC 趨勢圖與個人化代謝追蹤報告。", en: "Unlock multi-session drink logs, BAC trend charts and personalized metabolism tracking reports." }, lang)}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4 font-black">{l({ zh: "飲酒記錄", en: "Drink log" }, lang)}</div>
                <div className="rounded-2xl bg-white/10 p-4 font-black">{l({ zh: "趨勢圖", en: "Trend chart" }, lang)}</div>
                <div className="rounded-2xl bg-white/10 p-4 font-black">{l({ zh: "報表", en: "Reports" }, lang)}</div>
              </div>
            </div>
          </PremiumGate>
        </section>

        {/* L17 TrustRelatedReferences */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "信任聲明 · 相關工具 · 參考資料", en: "Trust · Related tools · References" }, lang)}</h2>
          <p className="mt-2 text-sm font-black text-slate-600">{l({ zh: "本工具只供估算與教育用途，不取代法律判斷、醫療診斷或專業建議。切勿酒駕。", en: "This tool is for estimation and education only; not legal judgment, medical diagnosis or professional advice. Never drink and drive." }, lang)}</p>
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
