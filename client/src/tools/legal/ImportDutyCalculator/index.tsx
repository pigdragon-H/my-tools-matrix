// @profile B
// Profile B · 法律-工具 · ImportDutyCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number) => (isFinite(v) ? Math.round(v).toLocaleString("en-US") : "—");

const VAT_RATE = 0.05;
const TRADE_FEE = 0.0004;

type DutyMode = "duty" | "total" | "cif";

const bands = [
  { key: "cif", range: "goods+freight", label: { zh: "完稅價格", en: "CIF value" }, desc: { zh: "完稅價格（CIF）= 貨物價格 + 運費 + 保險費,是計算進口關稅的稅基。", en: "CIF value = goods + freight + insurance — the base for computing import duty." } },
  { key: "duty", range: "x rate", label: { zh: "進口關稅", en: "Import duty" }, desc: { zh: "進口關稅 = 完稅價格 × 關稅稅率,稅率依貨物稅則號別與來源地而異。", en: "Import duty = CIF value x tariff rate; the rate varies by tariff code and origin." } },
  { key: "vat", range: "5%", label: { zh: "營業稅", en: "VAT" }, desc: { zh: "進口貨物營業稅 = (完稅價格 + 關稅) × 5%,於進口時一併課徵。", en: "Import VAT = (CIF + duty) x 5%, levied together at import." } },
  { key: "fee", range: "0.04%", label: { zh: "推廣貿易服務費", en: "Trade fee" }, desc: { zh: "推廣貿易服務費約按完稅價格萬分之四課徵,屬進口的附加費用。", en: "Trade-promotion fee is about 0.04% of the CIF value — an import surcharge." } },
  { key: "total", range: "sum", label: { zh: "進口總成本", en: "Total cost" }, desc: { zh: "進口總稅費 = 關稅 + 營業稅 + 推廣貿易費,加上貨價即為到岸總成本。", en: "Total import taxes = duty + VAT + trade fee; plus goods value gives landed cost." } },
  { key: "review", range: "per HS", label: { zh: "稅則查詢", en: "HS lookup" }, desc: { zh: "實際稅率需依貨物的稅則號別（HS code）查詢,本工具以您輸入的稅率估算。", en: "The actual rate needs an HS-code lookup; this tool estimates with the rate you enter." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "印花稅計算器", en: "Stamp Duty" }, href: "/tools/legal/stamp-duty-calculator" },
  { label: { zh: "法定利息計算器", en: "Legal Interest" }, href: "/tools/legal/legal-interest-calculator" },
  { label: { zh: "違約金計算器", en: "Penalty Calculator" }, href: "/tools/legal/penalty-calculator" },
  { label: { zh: "最低工資計算器", en: "Minimum Wage" }, href: "/tools/legal/minimum-wage-calculator" },
];

const ui = {
  zh: {
    badge: "法律 · 進口關稅 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Import Duty Calculator · 進口關稅計算器", subtitle: "依完稅價格與關稅稅率計算進口關稅、營業稅與推廣貿易費",
    intro: "本工具依進口稅費結構（關稅 = 完稅價格 × 稅率、營業稅 5%、推廣貿易服務費約萬分之四），把您輸入的貨物價格、運費與關稅稅率換算成應繳關稅、營業稅、貿易費與進口總成本,協助您在報關前快速估算稅負。所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "本工具僅依您輸入的金額與稅率做估算,屬一般試算;實際關稅稅率需依貨物稅則號別查詢,營業稅與規費請以海關及主管機關最新規定為準。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例金額即時計算", examplePreview: "進口總稅費", examplePerson: "稅率", flowDemo: "關稅", fillExample: "載入範例 · CIF 5 萬", previewActivePath: "載入範例 · CIF 20 萬",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入完稅價格與關稅稅率", examplesHelper: "先用範例了解進口稅費的計算邏輯,再輸入您自己的貨物價格、運費與關稅稅率,即可得到關稅、營業稅、貿易費與進口總成本。",
    metric: "總稅費", imperial: "僅關稅", exampleCards: "範例卡", baselineExample: "範例 · CIF 5 萬", activeExample: "範例 · CIF 20 萬", calculator: "計算器",
    modeLabel: "計算模式", countLabel: "完稅價格 / CIF（元）", formatLabel: "單位", regenerate: "重新計算", copyAll: "複製分析結果",
    resultCard: "進口關稅計算結果", estimatedTdee: "進口總稅費", monthlyEquiv: "關稅", weeklyEquiv: "營業稅", dailyEquiv: "貿易費", effectiveHours: "稅率", fatLossTarget: "完稅價格",
    outputLabel: "進口稅費分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格進口稅費參考矩陣", tdeeMatrixNote: "L7 固定六格,列出進口稅費的各項組成;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把進口稅費整合進成本估算", conversionNote: "L9 會連動目前計算結果,顯示關稅、營業稅與總成本,協助您判斷進口報價與採購決策。",
    progressInsight: "進度洞察卡", possibleTarget: "目前進口計算", dailyGap: "進口總稅費", weeklyTrend: "完稅價格", motivation: "動力卡", keepMomentum: "從單次計算走向長期進口成本管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次計算帶進您的採購紀錄", journeyHint: "每次更換貨物或調整稅率時重新計算,並把結果記錄到採購成本或進口管理系統。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用印花稅計算器估算採購契約的印花稅", nextActionItem2: "用法定利息計算器計算遲延付款的利息", nextActionItem3: "用違約金計算器估算契約違約相關費用",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "算完稅價格 → 套稅率 → 加營業稅 → 得總成本", bmrStep: "算CIF", deficitStep: "套稅率", trendStep: "加營業稅", mealStep: "得總成本",
    knowledge: "知識", knowledgeTitle: "進口關稅與相關稅費的意義", definition: "定義", definitionText: "進口貨物在通關時需繳納關稅、營業稅與推廣貿易服務費;關稅以完稅價格（CIF）為稅基,稅率依貨物稅則號別而異。",
    formula: "公式", formulaText: "完稅價格 = 貨價 + 運費 + 保險;關稅 = 完稅價格 × 稅率;營業稅 = (完稅價格 + 關稅) × 5%;貿易費 = 完稅價格 × 0.04%。",
    limitations: "限制", limitationsText: "本工具以您輸入的稅率估算,屬一般試算;實際稅率需依貨物稅則號別查詢,反傾銷稅、優惠關稅與規費另有規定,以海關認定為準。",
    interpretation: "解讀", interpretationText: "稅率越高、完稅價格越大,進口總稅費越高;高單價或高稅率貨物的稅負應特別留意,報關前可先估算成本。",
    context: "脈絡", contextText: "了解進口稅費可協助貿易商與個人在採購、報價與報關前估算到岸總成本,避免低估稅負而影響利潤與決策。",
    example: "範例", exampleText: "進口貨物完稅價格 50,000 元、關稅稅率 5%,關稅為 2,500 元,營業稅為 (50,000+2,500)×5% = 2,625 元,加上貿易費即為進口總稅費。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "進口貿易工作流程的下一步工具", premiumTitle: "專業版進口關稅管理工具包", premiumText: "解鎖稅則號別查詢、多品項批次計算、優惠關稅試算與到岸成本彙整報表。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做進口稅費換算,屬一般試算;不構成關務意見,實際稅率與規費請以海關及主管機關認定為準。", relatedTools: "相關工具", relatedToolsText: "印花稅計算器 · 法定利息計算器 · 違約金計算器 · 最低工資計算器", references: "參考資料", referencesText: "關稅法完稅價格與稅率規定;進口貨物營業稅 5%;推廣貿易服務費萬分之四;海關進口稅則查詢原則。",
    q1: "進口要繳哪些稅費？", a1: "進口貨物通常需繳關稅、營業稅與推廣貿易服務費;部分貨物另有貨物稅、菸酒稅或反傾銷稅,實際以海關規定為準。",
    q2: "完稅價格怎麼算？", a2: "完稅價格（CIF）= 貨物價格 + 運費 + 保險費,是計算進口關稅的稅基;本工具可直接輸入完稅價格或由貨價加運費推算。",
    q3: "營業稅怎麼計算？", a3: "進口貨物營業稅 = (完稅價格 + 關稅) × 5%,於進口時一併課徵;本工具會在總稅費模式下自動加計。",
    q4: "為什麼每次結果不同？", a4: "貨物價格、運費與稅率不同,結果自然不同;這很正常,建議依實際貨物與稅則號別的稅率輸入,才能得到貼近真實的估算。",
    q5: "怎麼查關稅稅率？", a5: "實際稅率需依貨物的稅則號別（HS code）向海關查詢;本工具以您輸入的稅率估算,僅供報關前的初步成本評估。",
    q6: "這個工具會上傳我的資料嗎？", a6: "不會。所有金額與稅費計算都在您的瀏覽器本機完成,輸入的數據不會上傳到任何伺服器。",
  },
  en: {
    badge: "Legal · Import duty · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Import Duty Calculator", subtitle: "Compute import duty, VAT, and trade fee from CIF value and tariff rate",
    intro: "Based on the import tax structure (duty = CIF value x rate, VAT 5%, trade-promotion fee ~0.04%), this tool converts the goods value, freight, and tariff rate you enter into duty, VAT, trade fee, and total import cost, helping you estimate the tax burden before customs clearance. All calculations run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "This tool only estimates from the amounts and rate you enter and is a general simulation; the actual tariff rate needs an HS-code lookup, and VAT and fees follow customs and the latest official rules. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample amount and compute", examplePreview: "Total import tax", examplePerson: "Rate", flowDemo: "Duty", fillExample: "Load sample · CIF 50k", previewActivePath: "Load sample · CIF 200k",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter CIF value and tariff rate", examplesHelper: "Start with a sample to understand how import taxes are computed, then enter your own goods value, freight, and tariff rate to get duty, VAT, trade fee, and total import cost.",
    metric: "Total", imperial: "Duty only", exampleCards: "Example cards", baselineExample: "Sample · CIF 50k", activeExample: "Sample · CIF 200k", calculator: "Calculator",
    modeLabel: "Calc mode", countLabel: "CIF value", formatLabel: "Unit", regenerate: "Recompute", copyAll: "Copy analysis",
    resultCard: "Import duty result", estimatedTdee: "Total import tax", monthlyEquiv: "Duty", weeklyEquiv: "VAT", dailyEquiv: "Trade fee", effectiveHours: "Rate", fatLossTarget: "CIF value",
    outputLabel: "Import tax summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band import-tax reference matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists each component of import taxes. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit import taxes into cost estimation", conversionNote: "L9 reflects your current calculation — duty, VAT, and total cost — to help you decide on import quotes and procurement.",
    progressInsight: "Progress insight", possibleTarget: "Your current import calc", dailyGap: "Total import tax", weeklyTrend: "CIF value", motivation: "Motivation", keepMomentum: "Move from a single calc to long-term import-cost management",
    saveShareJourney: "Save / share", journeyTitle: "Take this calc into your procurement record", journeyHint: "Recompute whenever you change goods or the rate, and log the result into procurement cost or import management.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Stamp Duty Calculator to estimate stamp duty on the purchase contract", nextActionItem2: "Use the Legal Interest Calculator to compute interest on late payments", nextActionItem3: "Use the Penalty Calculator to estimate contract-breach costs",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "CIF value → Apply rate → Add VAT → Total cost", bmrStep: "CIF", deficitStep: "Rate", trendStep: "VAT", mealStep: "Total",
    knowledge: "Knowledge", knowledgeTitle: "What import duty and related taxes mean", definition: "Definition", definitionText: "Imported goods owe duty, VAT, and a trade-promotion fee at clearance; duty is based on the CIF value, and the rate varies by the goods' tariff code.",
    formula: "Formula", formulaText: "CIF value = goods + freight + insurance; duty = CIF x rate; VAT = (CIF + duty) x 5%; trade fee = CIF x 0.04%.",
    limitations: "Limitations", limitationsText: "This tool estimates with the rate you enter and is a general simulation; the actual rate needs an HS-code lookup, and anti-dumping duty, preferential tariffs, and fees have separate rules — customs governs.",
    interpretation: "Interpretation", interpretationText: "Higher rate and larger CIF value mean higher total import tax; watch the burden on high-value or high-rate goods and estimate cost before clearance.",
    context: "Context", contextText: "Knowing import taxes helps traders and individuals estimate landed cost before procurement, quoting, and clearance, avoiding underestimation that hurts margin and decisions.",
    example: "Example", exampleText: "For a CIF value of 50,000 at a 5% rate, duty is 2,500; VAT is (50,000+2,500)x5% = 2,625; plus the trade fee gives the total import tax.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for an import-trade workflow", premiumTitle: "Pro Import-Duty Toolkit", premiumText: "Unlock HS-code lookup, multi-item batch calculation, preferential-tariff simulation, and landed-cost summary reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only converts import taxes and is a general simulation; it is not customs advice — the actual rate and fees follow customs and the authority's determination.", relatedTools: "Related tools", relatedToolsText: "Stamp Duty Calculator · Legal Interest Calculator · Penalty Calculator · Minimum Wage Calculator", references: "References", referencesText: "Customs Act CIF-value and rate rules; 5% import VAT; 0.04% trade-promotion fee; customs import-tariff lookup principles.",
    q1: "What taxes apply to imports?", a1: "Imported goods usually owe duty, VAT, and a trade-promotion fee; some goods also owe excise, tobacco/alcohol tax, or anti-dumping duty, with customs governing.",
    q2: "How is CIF value computed?", a2: "CIF value = goods + freight + insurance — the base for import duty; this tool lets you enter the CIF value directly or derive it from goods plus freight.",
    q3: "How is VAT computed?", a3: "Import VAT = (CIF + duty) x 5%, levied together at import; this tool adds it automatically in total-tax mode.",
    q4: "Why does each result differ?", a4: "Goods value, freight, and rate differ, so results differ; this is normal — enter the real goods and the HS-code rate to get a figure close to actual.",
    q5: "How do I find the tariff rate?", a5: "The actual rate needs an HS-code lookup with customs; this tool estimates with the rate you enter, for a preliminary cost assessment before clearance.",
    q6: "Does this tool upload my data?", a6: "No. All amount and tax calculations run locally in your browser — the data you enter is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function ImportDutyCalculator() {
  const { lang, setLang } = useLanguage();
  const [mode, setMode] = useState<DutyMode>("total");
  const [cif, setCif] = useState("50000");
  const [goods, setGoods] = useState("45000");
  const [freight, setFreight] = useState("5000");
  const [rate, setRate] = useState("5");
  const t = ui[lang];

  const result = useMemo(() => {
    const cifVal = Math.max(0, Number(cif) || 0);
    const g = Math.max(0, Number(goods) || 0);
    const f = Math.max(0, Number(freight) || 0);
    const r = Math.max(0, Number(rate) || 0);
    const base = mode === "cif" ? g + f : cifVal;
    const duty = Math.round(base * (r / 100));
    const vat = Math.round((base + duty) * VAT_RATE);
    const fee = Math.round(base * TRADE_FEE);
    const total = mode === "duty" ? duty : duty + vat + fee;
    return { base, duty, vat, fee, total };
  }, [mode, cif, goods, freight, rate]);

  const modeLabel = useMemo<LocalText>(() => (mode === "duty" ? { zh: "僅關稅", en: "Duty only" } : mode === "cif" ? { zh: "CIF 推算", en: "CIF derived" } : { zh: "總稅費", en: "Total tax" }), [mode]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "完稅價格", en: "CIF value" }, `${fmt(result.base)}`],
      [{ zh: "進口關稅", en: "Import duty" }, `${fmt(result.duty)}`],
      [{ zh: "營業稅", en: "VAT" }, `${fmt(result.vat)}`],
      [{ zh: "貿易費", en: "Trade fee" }, `${fmt(result.fee)}`],
      [{ zh: "總稅費", en: "Total tax" }, `${fmt(result.total)}`],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, lang]);

  function fillSolid() { setMode("total"); setCif("50000"); setGoods("45000"); setFreight("5000"); setRate("5"); }
  function fillHighSalary() { setMode("total"); setCif("200000"); setGoods("190000"); setFreight("10000"); setRate("10"); }

  const activeBand = bands.find(b => b.key === (mode === "duty" ? "duty" : mode === "cif" ? "cif" : "total")) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{fmt(result.total)}</div><div className="text-sm font-bold text-amber-100">{l(modeLabel, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.monthlyEquiv}</div><div className="font-black">{fmt(result.duty)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{fmt(result.vat)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyEquiv}</div><div className="font-black">{fmt(result.fee)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "total" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("total")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "duty" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("duty")}>{t.imperial}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "cif" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("cif")}>CIF</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">5%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "CIF 50,000 · 稅率 5%" : "CIF 50,000 · rate 5%"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">10%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "CIF 200,000 · 稅率 10%" : "CIF 200,000 · rate 10%"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4">{mode === "cif" ? (<><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "貨物價格（元）" : "Goods value"}<input type="number" min="0" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goods} onChange={(e) => setGoods(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "運費（元）" : "Freight"}<input type="number" min="0" step="500" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={freight} onChange={(e) => setFreight(e.target.value)} /></label></>) : (<label className="block text-sm font-black text-slate-700">{t.countLabel}<input type="number" min="0" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={cif} onChange={(e) => setCif(e.target.value)} /></label>)}<label className="block text-sm font-black text-emerald-700">{lang === "zh" ? "關稅稅率（%）" : "Tariff rate (%)"}<input type="number" min="0" step="0.5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={rate} onChange={(e) => setRate(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{fmt(result.total)}<span className="text-2xl">{lang === "zh" ? " 元" : ""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(modeLabel, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{fmt(result.duty)}</div><div className="mt-1 text-xs text-slate-300">{rate}%</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">5%</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.vat)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "元" : ""}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">0.04%</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.fee)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "元" : ""}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.fatLossTarget}</div><div className="mt-1 text-xs font-black text-slate-700">CIF</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.base)}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="import-duty-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "關稅" : "Duty"}</div><div className="mt-1 text-2xl font-black">{fmt(result.duty)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{fmt(result.base)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.total)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "算CIF" : "CIF", note: t.bmrStep }, { label: lang === "zh" ? "套稅率" : "Rate", note: t.deficitStep }, { label: lang === "zh" ? "加營業稅" : "VAT", note: t.trendStep }, { label: lang === "zh" ? "得總成本" : "Total", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="import-duty-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["稅則", "批次", "優惠", "報表"] : ["HS", "Batch", "Pref", "Report"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
