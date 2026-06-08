// @profile B
// Profile B · 計算機-YMYL · LeanBodyMassCalculator (Health GOLD · MacroCalculator-aligned, 17-layer)

import { Fragment, useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type Sex = "male" | "female";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : "—");

// Lean Body Mass formulas (kg from weightKg, heightCm)
function lbmBoer(w: number, h: number, sex: Sex): number {
  return sex === "male" ? 0.407 * w + 0.267 * h - 19.2 : 0.252 * w + 0.473 * h - 48.3;
}
function lbmJames(w: number, h: number, sex: Sex): number {
  return sex === "male"
    ? 1.1 * w - 128 * (w / h) ** 2
    : 1.07 * w - 148 * (w / h) ** 2;
}
function lbmHume(w: number, h: number, sex: Sex): number {
  return sex === "male" ? 0.32810 * w + 0.33929 * h - 29.5336 : 0.29569 * w + 0.41813 * h - 43.2933;
}

export default function LeanBodyMassCalculator() {
  const { lang, setLang } = useLanguage();
  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);

  const r = useMemo(() => {
    const w = Math.max(0, weight), h = Math.max(1, height);
    const boer = lbmBoer(w, h, sex);
    const james = lbmJames(w, h, sex);
    const hume = lbmHume(w, h, sex);
    const avg = (boer + james + hume) / 3;
    const fatMass = w - avg;
    const bfPct = w > 0 ? (fatMass / w) * 100 : 0;
    return { boer, james, hume, avg, fatMass, bfPct };
  }, [sex, weight, height]);

  const t = {
    zh: {
      hero: "瘦體重計算機",
      heroSub: "輸入體重、身高與生理性別，立即用 Boer、James、Hume 三種公式估算你的瘦體重（LBM）與體脂量。",
      trust: "為什麼算瘦體重",
      trustText: "瘦體重是除去脂肪後的身體質量（肌肉、骨骼、器官、水分）。它是設定蛋白質攝取、藥物劑量與訓練目標的重要基準，比單看體重更有意義。",
      quick: "三步驟",
      step1: "選生理性別",
      step2: "填體重與身高",
      step3: "看三公式估算",
      inputGuide: "輸入指引",
      inputGuideText: "公式以公斤與公分為單位；估算值適用於一般成年人，極端體型或運動員建議搭配 DEXA 等實測。",
      sex: "生理性別", male: "男性", female: "女性",
      weight: "體重 (kg)", height: "身高 (cm)",
      resultTitle: "你的瘦體重",
      avg: "三公式平均 LBM", fatMass: "估算體脂量", bf: "估算體脂率",
      intel: "結果解讀",
      boer: "Boer 公式", james: "James 公式", hume: "Hume 公式",
      scenario: "情境對照",
      scA: "設定蛋白質", scADesc: "以 LBM 每公斤 1.6–2.2g 設定增肌期蛋白質，比用總體重更精準。",
      scB: "追蹤體組成", scBDesc: "減脂期應盡量維持 LBM，體重下降但 LBM 不掉才是好的減脂。",
      scC: "藥物劑量", scCDesc: "部分藥物以 LBM 計算劑量，避免肥胖者過量。",
      emotionUp: "看見真正的身體組成",
      emotionUpText: "體重計只給一個數字；LBM 讓你知道有多少是肌肉骨骼，多少是脂肪。",
      emotionLow: "把目標訂在對的地方",
      emotionLowText: "別只追求體重下降——保住 LBM、減少脂肪量，才是健康且持久的改變。",
      decision: "怎麼用",
      decisionText: "想增肌：盯緊 LBM 上升；想減脂：盯緊 LBM 不掉、體脂率下降。實測（DEXA / BIA）可校正公式估算。",
      knowledge: "知識卡",
      knowledgeText: "瘦體重（Lean Body Mass）= 體重 − 脂肪量。Boer 公式對一般族群準確度高；James 公式對 BMI 偏高者較保守；Hume 公式源自體表面積研究。三者取平均可降低單一公式偏差。",
      faq: "常見問題", faqAd: "常見問題後廣告位",
      affiliate: "延伸工具", affiliateTitle: "體組成與營養相關資源",
      premiumTitle: "Pro：體組成追蹤", premiumText: "升級 Pro 可儲存歷史紀錄、繪製 LBM 趨勢圖、整合 DEXA/BIA 實測值校正。",
      refs: "資料來源",
    },
    en: {
      hero: "Lean Body Mass Calculator",
      heroSub: "Enter weight, height and biological sex to estimate your lean body mass (LBM) and fat mass using the Boer, James and Hume formulas.",
      trust: "Why estimate LBM",
      trustText: "Lean body mass is your body weight minus fat (muscle, bone, organs, water). It's a better baseline than total weight for protein targets, drug dosing and training goals.",
      quick: "Three steps",
      step1: "Pick biological sex",
      step2: "Enter weight & height",
      step3: "See 3-formula estimate",
      inputGuide: "Input guide",
      inputGuideText: "Formulas use kilograms and centimetres; estimates suit typical adults — extreme physiques or athletes should pair with DEXA measurement.",
      sex: "Biological sex", male: "Male", female: "Female",
      weight: "Weight (kg)", height: "Height (cm)",
      resultTitle: "Your lean body mass",
      avg: "3-formula average LBM", fatMass: "Estimated fat mass", bf: "Estimated body fat",
      intel: "Result intelligence",
      boer: "Boer formula", james: "James formula", hume: "Hume formula",
      scenario: "Scenario comparison",
      scA: "Set protein", scADesc: "Set bulking protein at 1.6–2.2 g per kg of LBM — more precise than using total weight.",
      scB: "Track composition", scBDesc: "During a cut, preserve LBM; losing weight while keeping LBM is a quality fat loss.",
      scC: "Drug dosing", scCDesc: "Some drugs are dosed by LBM to avoid overdosing in obese patients.",
      emotionUp: "See your true composition",
      emotionUpText: "A scale gives one number; LBM tells you how much is muscle and bone versus fat.",
      emotionLow: "Aim at the right target",
      emotionLowText: "Don't just chase weight loss — keeping LBM while cutting fat is the healthy, durable change.",
      decision: "How to use",
      decisionText: "Bulking: watch LBM rise. Cutting: keep LBM flat while body-fat % drops. DEXA/BIA measurements can calibrate the estimate.",
      knowledge: "Knowledge card",
      knowledgeText: "Lean Body Mass = weight − fat mass. The Boer formula is accurate for the general population; James is conservative for higher BMI; Hume derives from body-surface research. Averaging the three reduces single-formula bias.",
      faq: "FAQ", faqAd: "Post-FAQ ad slot",
      affiliate: "Related tools", affiliateTitle: "Body composition & nutrition resources",
      premiumTitle: "Pro: composition tracking", premiumText: "Upgrade to Pro to save history, chart LBM trends and calibrate with DEXA/BIA measurements.",
      refs: "References",
    },
  }[lang];

  const faqs: { q: LocalText; a: LocalText }[] = [
    { q: { zh: "LBM 和肌肉量一樣嗎?", en: "Is LBM the same as muscle mass?" }, a: { zh: "不完全。LBM 包含肌肉、骨骼、器官與水分；肌肉只是其中一部分。", en: "Not exactly. LBM includes muscle, bone, organs and water; muscle is only part of it." } },
    { q: { zh: "哪個公式最準?", en: "Which formula is most accurate?" }, a: { zh: "對一般族群 Boer 通常較準；我們取三者平均以降低偏差。", en: "Boer is usually accurate for the general population; we average all three to reduce bias." } },
    { q: { zh: "可以用來算蛋白質嗎?", en: "Can I use it for protein?" }, a: { zh: "可以，常見建議為每公斤 LBM 1.6–2.2g 蛋白質。", en: "Yes — a common target is 1.6–2.2 g protein per kg of LBM." } },
  ];

  const affiliateItems: AffiliateItem[] = [
    { label: { zh: "體脂計", en: "Body-fat scale" }, href: "#" },
    { label: { zh: "蛋白粉", en: "Protein powder" }, href: "#" },
    { label: { zh: "DEXA 掃描", en: "DEXA scan" }, href: "#" },
    { label: { zh: "訓練計畫", en: "Training plan" }, href: "#" },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ddd6fe,_#f8fafc_45%,_#e0e7ff)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* L1 Hero */}
        <section className="rounded-[2rem] border border-emerald-200 bg-white/80 p-7 shadow-sm backdrop-blur md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">HEALTH · GOLD</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950 md:text-5xl">{t.hero}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{t.heroSub}</p>
            </div>
            <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="shrink-0 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">{lang === "zh" ? "EN" : "中文"}</button>
          </div>
        </section>

        {/* L2 TrustIntro */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trust}</p>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">{t.trustText}</p>
        </section>

        {/* L3 QuickStart */}
        <section className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {[t.step1, t.step2, t.step3].map((step, i) => (
            <Fragment key={`step-${i}`}>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 text-center shadow-sm"><div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-black text-white">{i + 1}</div><p className="mt-2 text-sm font-black text-slate-800">{step}</p></div>
              {i < 2 && <div className="hidden items-center justify-center text-2xl font-black text-emerald-400 md:flex">→</div>}
            </Fragment>
          ))}
        </section>

        {/* L4 InputGuidance + L5 Calc + L6 Result */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.inputGuide}</p>
            <p className="mt-1 text-xs text-slate-500">{t.inputGuideText}</p>
            <div className="mt-4">
              <label className="text-sm font-black text-slate-800">{t.sex}</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(["male", "female"] as Sex[]).map((s) => (
                  <button key={s} onClick={() => setSex(s)} className={`rounded-2xl border p-3 text-sm font-black ${sex === s ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-white text-slate-600"}`}>{s === "male" ? t.male : t.female}</button>
                ))}
              </div>
            </div>
            <label className="mt-4 text-sm font-black text-slate-800">{t.weight}</label>
            <input type="number" value={weight} min={0} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-lg font-black text-slate-800 focus:border-emerald-500 focus:outline-none" />
            <label className="mt-4 text-sm font-black text-slate-800">{t.height}</label>
            <input type="number" value={height} min={1} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-lg font-black text-slate-800 focus:border-emerald-500 focus:outline-none" />
          </div>
          <div className="flex h-full flex-col justify-center rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultTitle}</p>
            <p className="mt-2 text-6xl font-black text-emerald-900">{fmt(r.avg, 1)}<span className="ml-2 text-2xl text-emerald-700">kg</span></p>
            <p className="mt-1 text-sm font-black text-slate-600">{t.avg}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm"><p className="text-2xl font-black text-slate-900">{fmt(r.fatMass, 1)} kg</p><p className="mt-1 text-xs font-black uppercase text-slate-500">{t.fatMass}</p></div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm"><p className="text-2xl font-black text-slate-900">{fmt(r.bfPct, 1)}%</p><p className="mt-1 text-xs font-black uppercase text-slate-500">{t.bf}</p></div>
            </div>
          </div>
        </section>

        {/* L7 ResultIntelligence */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.intel}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[[t.boer, r.boer], [t.james, r.james], [t.hume, r.hume]].map(([k, v]) => (
              <div key={String(k)} className="rounded-2xl bg-emerald-50 p-4 text-center"><p className="text-3xl font-black text-emerald-900">{fmt(v as number, 1)} kg</p><p className="mt-1 text-xs font-black uppercase tracking-wide text-emerald-700">{k}</p></div>
            ))}
          </div>
          <AdSenseWrapper showAds={true} adSlot="lean-body-mass-result-intelligence" adFormat="horizontal" className="my-2" />
        </section>

        {/* L8 ScenarioComparison */}
        <section className="grid gap-4 md:grid-cols-3">
          {[[t.scA, t.scADesc], [t.scB, t.scBDesc], [t.scC, t.scCDesc]].map(([h, d]) => (
            <article key={String(h)} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-black text-slate-900">{h}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></article>
          ))}
        </section>

        {/* L9/L10 Emotion */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6"><h3 className="text-xl font-black text-emerald-900">{t.emotionUp}</h3><p className="mt-2 text-sm leading-6 text-emerald-800">{t.emotionUpText}</p></div>
          <div className="rounded-[2rem] border border-indigo-200 bg-indigo-50 p-6"><h3 className="text-xl font-black text-indigo-900">{t.emotionLow}</h3><p className="mt-2 text-sm leading-6 text-indigo-800">{t.emotionLowText}</p></div>
        </section>

        {/* L11 DecisionPath */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decision}</p><p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">{t.decisionText}</p></section>

        {/* L12 Knowledge */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">{t.knowledgeText}</p></section>

        {/* L13 FAQ */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <h2 className="text-2xl font-black text-slate-950">{t.faq}</h2>
          <div className="mt-4 space-y-3">{faqs.map((f, i) => (<details key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black text-slate-800">{l(f.q, lang)}</summary><p className="mt-2 text-sm leading-6 text-slate-600">{l(f.a, lang)}</p></details>))}</div>
        </section>

        {/* L14 FAQ Ad */}
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="lean-body-mass-faq" position="inline" /></section>

        {/* L15 Affiliate + L16 PremiumGate */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href + l(item.label, lang)} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section>
          <PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["歷史紀錄", "趨勢圖", "DEXA 校正", "匯出"] : ["History", "Trends", "DEXA", "Export"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-emerald-900 shadow-sm">{item}</div>)}</div></article></PremiumGate>
        </section>

        {/* L17 TrustReferences */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.refs}</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600"><li>Boer P. Estimated lean body mass as an index for normalization of body fluid volumes (1984)</li><li>James W. Research on Obesity (1976)</li><li>Hume R. Prediction of lean body mass from height and weight (1966)</li></ul></section>
      </div>
    </main>
  );
}
