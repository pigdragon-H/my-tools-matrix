#!/usr/bin/env node
// Finance量產 generator v2 · 1:1 複製 MeetingCostCalculator 17 層結構
// Emits single-line JSX sections matching master sigil signature: rounded-[2rem]=11, font-black=18, bg-[radial-gradient]=1, md:grid-cols-[1fr_auto_1fr]=0
// Layer markers: 19 unique
//
// Usage: node scripts/finance-gen/build-tool.mjs <spec.json>

import fs from "node:fs";
import path from "node:path";

const specPath = process.argv[2];
if (!specPath) { console.error("Usage: node build-tool.mjs <spec.json>"); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

const C = spec.colorToken;
const COMPONENT = spec.componentName;
const ID = spec.id;
const PK = spec.primaryKey;
const PKDecimals = spec.primaryDecimals ?? 0;
const PKPrefix = spec.primaryPrefix ?? "$";
const PKSuffix = spec.primarySuffix ?? "";
const SK = spec.secondaryKey;
const SKDecimals = spec.secondaryDecimals ?? 0;
const TK = spec.tertiaryKey;
const TKDecimals = spec.tertiaryDecimals ?? 0;
const QK = spec.quaternaryKey;
const QKDecimals = spec.quaternaryDecimals ?? 0;

function escQ(s){return String(s).replace(/\\/g,"\\\\").replace(/"/g,'\\"');}
function cap(s){return s[0].toUpperCase()+s.slice(1);}

const inp = spec.inputs;
if (inp.length !== 4) { console.error("inputs must be exactly 4"); process.exit(1); }

const inputState = inp.map(i => `  const [${i.name}, set${cap(i.name)}] = useState("${i.default}");`).join("\n");

const calcInputs = inp.map(i => {
  const accent = i.accent ? "text-emerald-700" : "text-slate-700";
  const borderColor = i.accent ? "border-emerald-200" : "border-slate-300";
  return `<label className="block text-sm font-black ${accent}">{t.${i.name}}<input type="number"${i.step?` step="${i.step}"`:""} className="mt-2 w-full rounded-2xl border ${borderColor} px-4 py-3 text-lg font-bold" value={${i.name}} onChange={(e) => set${cap(i.name)}(e.target.value)} /></label>`;
}).join("");

const bandsCode = spec.bands.map(b => `  { key: "${b.key}", range: "${escQ(b.range)}", label: { zh: "${escQ(b.label_zh)}", en: "${escQ(b.label_en)}" }, desc: { zh: "${escQ(b.desc_zh)}", en: "${escQ(b.desc_en)}" } },`).join("\n");

const affiliateItemsCode = spec.affiliateItems.map(a => `  { label: { zh: "${escQ(a.label_zh)}", en: "${escQ(a.label_en)}" }, href: "${a.href}" },`).join("\n");

const uiZh = spec.ui.zh;
const uiEn = spec.ui.en;
const uiKeys = Object.keys(uiZh);
const uiZhLines = uiKeys.map(k => `    ${k}: "${escQ(uiZh[k])}"`).join(",\n");
const uiEnLines = uiKeys.map(k => `    ${k}: "${escQ(uiEn[k])}"`).join(",\n");

const ex1 = spec.examples.solid;
const ex2 = spec.examples.high;
const fillSolid = `function fillSolid() { setUnit("${ex1.unit}"); ${inp.map(i=>`set${cap(i.name)}("${ex1.values[i.name]}");`).join(" ")} }`;
const fillHighSalary = `function fillHighSalary() { setUnit("${ex2.unit}"); ${inp.map(i=>`set${cap(i.name)}("${ex2.values[i.name]}");`).join(" ")} }`;

// Note: master's L1-Hero, L5-Calc, L6-Result, L9, L10, L11, L12+L13, L14, L15+L16, L17 are each emitted as ONE LONG LINE.
// We must do the same to preserve sigil counts (11/18/1/0 = lines containing those tokens).

// Below: emit each section as a single line. Indentation matches master.
const out = `// @profile B
// Profile B · 計算機-YMYL · ${COMPONENT}（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
${bandsCode}
] as const;

const affiliateItems: AffiliateItem[] = [
${affiliateItemsCode}
];

const ui = {
  zh: {
${uiZhLines}
  },
  en: {
${uiEnLines}
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function ${COMPONENT}() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
${inputState}
  const t = ui[lang];

  const result = useMemo(() => {
${spec.compute}
  }, [${inp.map(i=>i.name).join(", ")}]);

  const primaryDisplay = fmt(result.${PK}, ${PKDecimals});
  const secondaryDisplay = fmt(result.${SK}, ${SKDecimals});
  const tertiaryDisplay = fmt(result.${TK}, ${TKDecimals});
  const quaternaryDisplay = fmt(result.${QK}, ${QKDecimals});

  ${fillSolid}
  ${fillHighSalary}

  const activeBand = bands.find(b => {
    const r = result.${PK};
${spec.bandKeyBody}
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_${C.hueA},_${C.hueB}_45%,_${C.hueC})]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-${C.primary}-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-${C.primary}-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-${C.primary}-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-${C.primary}-200 bg-${C.primary}-50 p-5 text-sm leading-6 text-${C.primary}-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-${C.primary}-100 bg-white/90 p-6 shadow-2xl shadow-${C.primary}-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-${C.primary}-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-${C.primary}-600 p-5 text-white"><div className="text-xs font-bold uppercase text-${C.primary}-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${PKPrefix}{primaryDisplay}${PKSuffix}</div><div className="text-sm font-bold text-${C.primary}-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${PKPrefix}{primaryDisplay}${PKSuffix}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{${inp[0].name}} × {${inp[1].name}}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-${C.primary}-200 bg-${C.primary}-50 px-5 py-4 text-sm font-black text-${C.primary}-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-${C.primary}-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={\`rounded-xl px-4 py-3 text-sm font-black \${unit === "metric" ? "bg-${C.primary}-600 text-white" : "bg-white text-slate-700"}\`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={\`rounded-xl px-4 py-3 text-sm font-black \${unit === "imperial" ? "bg-${C.primary}-600 text-white" : "bg-white text-slate-700"}\`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-${C.primary}-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-${C.primary}-100 px-3 py-1 text-xs font-black text-${C.primary}-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-${C.primary}-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-${C.primary}-100 px-3 py-1 text-xs font-black text-${C.primary}-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2">${calcInputs}</div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-${C.primary}-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-${C.primary}-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${PKPrefix}{primaryDisplay}<span className="text-3xl">${PKSuffix||"{t.primaryUnitTail}"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-${C.primary}-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={\`rounded-2xl border p-4 \${activeBand?.key === item.key ? "border-${C.primary}-400 bg-${C.primary}-50 ring-2 ring-${C.primary}-500" : "border-slate-200 bg-slate-50"}\`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="${ID}-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-${C.primary}-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">${PKPrefix}{primaryDisplay}${PKSuffix}</div></div><div className="rounded-2xl bg-${C.primary}-50 p-4"><div className="text-xs font-black uppercase text-${C.primary}-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-${C.primary}-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-${C.primary}-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-${C.primary}-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-${C.primary}-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-${C.primary}-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-${C.primary}-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-${C.primary}-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-${C.primary}-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={\`rounded-3xl border p-5 text-center \${index === 0 ? "border-${C.primary}-300 bg-${C.primary}-50" : "border-blue-200 bg-blue-50"}\`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-${C.primary}-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-${C.primary}-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="${ID}-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-${C.primary}-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-${C.primary}-100 bg-${C.primary}-50 p-5 text-center font-black text-${C.primary}-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-${C.primary}-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-${C.primary}-200 bg-gradient-to-br from-${C.primary}-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-${C.primary}-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
`;

const outDir = path.join("client/src/tools/finance", COMPONENT);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.tsx"), out);

// Verify sigil counts (line-based, like grep -c)
const lines = out.split("\n");
const counts = {
  rounded: lines.filter(L => /rounded-\[2rem\]/.test(L)).length,
  fontBlack: lines.filter(L => /font-black/.test(L)).length,
  radial: lines.filter(L => /bg-\[radial-gradient/.test(L)).length,
  oddGrid: lines.filter(L => /md:grid-cols-\[1fr_auto_1fr\]/.test(L)).length,
  layers: new Set((out.match(/L[0-9]+-[A-Za-z]+/g) || [])).size,
};
console.log(`Wrote ${outDir}/index.tsx`);
console.log(`Lines: ${lines.length}`);
console.log(`Sigils (line-based, expect 11/18/1/0): rounded=${counts.rounded} fontBlack=${counts.fontBlack} radial=${counts.radial} oddGrid=${counts.oddGrid}`);
console.log(`Layer markers: ${counts.layers} unique`);
