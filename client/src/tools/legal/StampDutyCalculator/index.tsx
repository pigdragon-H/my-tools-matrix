// @profile B
// Profile B · 法律-工具 · StampDutyCalculator（GOLD-STANDARD-001 compatible）

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

const RATE_RECEIPT = 0.004;
const RATE_CONTRACT = 0.001;
const RATE_PROPERTY = 0.001;

type DocMode = "receipt" | "contract" | "property";

const bands = [
  { key: "receipt", range: "0.4%", label: { zh: "銀錢收據", en: "Receipt" }, desc: { zh: "銀錢收據按金額千分之四課徵印花稅,是常見且稅率較高的憑證類型。", en: "Cash receipts are taxed at 0.4% of the amount — a common type with a higher rate." } },
  { key: "contract", range: "0.1%", label: { zh: "承攬契約", en: "Contract" }, desc: { zh: "承攬契據按金額千分之一課徵,適用於工程、勞務等承攬性質的合約。", en: "Contracting agreements are taxed at 0.1%, applied to engineering and service contracts." } },
  { key: "property", range: "0.1%", label: { zh: "產權移轉", en: "Property" }, desc: { zh: "典賣、讓受及分割不動產契據按金額千分之一課徵印花稅。", en: "Sale, transfer, and partition deeds for real estate are taxed at 0.1% of the amount." } },
  { key: "fixed", range: "fixed", label: { zh: "定額憑證", en: "Fixed" }, desc: { zh: "部分憑證採每件定額貼花,不依金額比例;本工具聚焦比例稅率類型。", en: "Some documents use a fixed per-item stamp, not proportional; this tool focuses on rate-based types." } },
  { key: "stamp", range: "round", label: { zh: "計算取整", en: "Rounding" }, desc: { zh: "印花稅額計算後通常取整數,實際貼花以稅捐機關規定的進位方式為準。", en: "Stamp duty is usually rounded to a whole number; the rounding follows the tax authority's rules." } },
  { key: "review", range: "per doc", label: { zh: "逐件檢視", en: "Per document" }, desc: { zh: "建議按憑證類型逐件計算與貼花,避免漏貼或短貼而衍生補稅與罰鍰。", en: "Compute and stamp per document type to avoid under-stamping and resulting back-taxes or penalties." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "進口關稅計算器", en: "Import Duty" }, href: "/tools/legal/import-duty-calculator" },
  { label: { zh: "法定利息計算器", en: "Legal Interest" }, href: "/tools/legal/legal-interest-calculator" },
  { label: { zh: "違約金計算器", en: "Penalty Calculator" }, href: "/tools/legal/penalty-calculator" },
  { label: { zh: "最低工資計算器", en: "Minimum Wage" }, href: "/tools/legal/minimum-wage-calculator" },
];

const ui = {
  zh: {
    badge: "法律 · 印花稅 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Stamp Duty Calculator · 印花稅計算器", subtitle: "依憑證類型與金額計算應繳印花稅額,支援收據、契約與產權移轉",
    intro: "本工具依印花稅法的比例稅率（銀錢收據千分之四、承攬契據與產權移轉契據千分之一），把你輸入的憑證金額換算成應繳印花稅額,協助你在簽約、開立收據或辦理不動產移轉前快速估算稅負。所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "本工具僅依你輸入的金額與憑證類型做比例稅率估算,屬一般試算;實際應稅憑證範圍、稅率與貼花方式請以印花稅法及稅捐機關最新公告為準。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例金額即時計算", examplePreview: "印花稅額", examplePerson: "類型", flowDemo: "稅率", fillExample: "載入範例 · 收據", previewActivePath: "載入範例 · 契約",
    examplesCalculator: "範例 → 計算器", enterValues: "選擇憑證類型與金額", examplesHelper: "先用範例了解不同憑證的比例稅率,再選擇你自己的憑證類型、輸入金額,即可得到應繳印花稅額與適用稅率。",
    metric: "收據", imperial: "契約", exampleCards: "範例卡", baselineExample: "範例 · 收據", activeExample: "範例 · 契約", calculator: "計算器",
    modeLabel: "憑證類型", countLabel: "憑證金額（元）", formatLabel: "單位", regenerate: "重新計算", copyAll: "複製分析結果",
    resultCard: "印花稅計算結果", estimatedTdee: "印花稅額", monthlyEquiv: "適用稅率", weeklyEquiv: "金額", dailyEquiv: "稅率", effectiveHours: "類型", fatLossTarget: "稅額",
    outputLabel: "印花稅分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格印花稅率參考矩陣", tdeeMatrixNote: "L7 固定六格,列出不同憑證類型的印花稅率;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把印花稅計算整合進憑證管理", conversionNote: "L9 會連動目前計算結果,顯示稅額、稅率與憑證類型,協助你判斷簽約與開立憑證前的稅負成本。",
    progressInsight: "進度洞察卡", possibleTarget: "目前憑證計算", dailyGap: "印花稅額", weeklyTrend: "憑證金額", motivation: "動力卡", keepMomentum: "從單次計算走向長期稅務管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次計算帶進你的稅務紀錄", journeyHint: "每次更換憑證類型或調整金額時重新計算,並把結果記錄到帳務或稅務管理系統。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用進口關稅計算器估算進口貨物的關稅與營業稅", nextActionItem2: "用法定利息計算器計算遲延給付的利息", nextActionItem3: "用違約金計算器估算契約違約相關費用",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "選類型 → 輸金額 → 套稅率 → 得稅額", bmrStep: "選類型", deficitStep: "輸金額", trendStep: "套稅率", mealStep: "得稅額",
    knowledge: "知識", knowledgeTitle: "印花稅與應稅憑證的意義", definition: "定義", definitionText: "印花稅是對特定憑證（如銀錢收據、承攬契據、產權移轉契據）所課徵的稅,通常依憑證金額按比例計算並貼花繳納。",
    formula: "公式", formulaText: "印花稅額 = 憑證金額 × 適用稅率。銀錢收據稅率為千分之四、承攬契據與產權移轉契據為千分之一,稅額通常取整數。",
    limitations: "限制", limitationsText: "本工具以你輸入的金額與類型計算比例稅率,屬一般試算;定額憑證、免稅範圍與特殊情形另有規定,實際以印花稅法與稅捐機關認定為準。",
    interpretation: "解讀", interpretationText: "稅率越高、金額越大,印花稅額越高;銀錢收據因稅率較高,大額收據的稅負應特別留意,簽約前可先估算。",
    context: "脈絡", contextText: "了解印花稅可協助企業與個人在簽約、開立收據或辦理不動產移轉前估算稅負,避免漏貼或短貼而被補稅與罰鍰。",
    example: "範例", exampleText: "開立一張 100,000 元的銀錢收據,稅率千分之四,印花稅額為 400 元;若為 500,000 元的承攬契據,稅率千分之一,稅額為 500 元。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "稅務憑證工作流程的下一步工具", premiumTitle: "專業版印花稅管理工具包", premiumText: "解鎖多憑證批次計算、定額憑證對照、稅額彙整報表與貼花提醒功能。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做印花稅比例稅率換算,屬一般試算;不構成稅務意見,具體應稅範圍請諮詢稅捐機關或專業人士。", relatedTools: "相關工具", relatedToolsText: "進口關稅計算器 · 法定利息計算器 · 違約金計算器 · 最低工資計算器", references: "參考資料", referencesText: "印花稅法應稅憑證與稅率規定;銀錢收據千分之四;承攬與產權移轉契據千分之一;貼花與計算取整原則。",
    q1: "哪些憑證要繳印花稅？", a1: "常見應稅憑證包括銀錢收據、承攬契據、典賣讓受及分割不動產契據等;不同類型適用不同稅率,實際範圍以印花稅法為準。",
    q2: "印花稅率是多少？", a2: "銀錢收據為金額千分之四,承攬契據與產權移轉契據為千分之一;部分憑證採每件定額貼花,本工具聚焦比例稅率類型。",
    q3: "稅額怎麼計算？", a3: "工具以憑證金額乘以適用稅率得到應繳印花稅額,並通常取整數;你只需選擇類型並輸入金額即可即時看到結果。",
    q4: "為什麼每次結果不同？", a4: "憑證類型與金額不同,適用稅率與稅額自然不同;這很正常,建議依實際憑證內容輸入,才能得到貼近真實的稅負估算。",
    q5: "漏貼印花稅有什麼後果？", a5: "漏貼或短貼印花稅可能被要求補繳並處以罰鍰,建議簽約或開立憑證前先估算稅額並依規定貼花繳納。",
    q6: "這個工具會上傳我的資料嗎？", a6: "不會。所有金額與稅額計算都在你的瀏覽器本機完成,輸入的數據不會上傳到任何伺服器。",
  },
  en: {
    badge: "Legal · Stamp duty · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Stamp Duty Calculator", subtitle: "Compute stamp duty by document type and amount — supports receipts, contracts, and property transfers",
    intro: "Based on the stamp-duty rate schedule (0.4% for cash receipts, 0.1% for contracting and property-transfer deeds), this tool converts the document amount you enter into the stamp duty payable, helping you estimate the cost before signing, issuing receipts, or transferring real estate. All calculations run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "This tool only does a rate-based estimate from the amount and document type you enter and is a general simulation; the actual taxable scope, rates, and stamping follow the Stamp Tax Act and the latest official notices. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample amount and compute", examplePreview: "Stamp duty", examplePerson: "Type", flowDemo: "Rate", fillExample: "Load sample · receipt", previewActivePath: "Load sample · contract",
    examplesCalculator: "Examples → Calculator", enterValues: "Choose document type and amount", examplesHelper: "Start with a sample to understand the rate per document type, then choose your own type, enter the amount, and get the stamp duty payable and the applicable rate.",
    metric: "Receipt", imperial: "Contract", exampleCards: "Example cards", baselineExample: "Sample · receipt", activeExample: "Sample · contract", calculator: "Calculator",
    modeLabel: "Document type", countLabel: "Document amount", formatLabel: "Unit", regenerate: "Recompute", copyAll: "Copy analysis",
    resultCard: "Stamp duty result", estimatedTdee: "Stamp duty", monthlyEquiv: "Applied rate", weeklyEquiv: "Amount", dailyEquiv: "Rate", effectiveHours: "Type", fatLossTarget: "Duty",
    outputLabel: "Stamp duty summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band stamp-duty reference matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists the rates for different document types. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit the stamp-duty calculation into document management", conversionNote: "L9 reflects your current calculation — duty, rate, and document type — to help you assess the tax cost before signing or issuing documents.",
    progressInsight: "Progress insight", possibleTarget: "Your current document calc", dailyGap: "Stamp duty", weeklyTrend: "Document amount", motivation: "Motivation", keepMomentum: "Move from a single calc to long-term tax management",
    saveShareJourney: "Save / share", journeyTitle: "Take this calc into your tax record", journeyHint: "Recompute whenever you change the document type or amount, and log the result into accounting or tax management.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Import Duty Calculator to estimate customs duty and VAT on imports", nextActionItem2: "Use the Legal Interest Calculator to compute interest on late payments", nextActionItem3: "Use the Penalty Calculator to estimate contract-breach costs",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Pick type → Enter amount → Apply rate → Duty", bmrStep: "Type", deficitStep: "Amount", trendStep: "Rate", mealStep: "Duty",
    knowledge: "Knowledge", knowledgeTitle: "What stamp duty and taxable documents mean", definition: "Definition", definitionText: "Stamp duty is a tax on certain documents (such as cash receipts, contracting deeds, and property-transfer deeds), usually computed proportionally on the document amount and paid by affixing a stamp.",
    formula: "Formula", formulaText: "Stamp duty = document amount x applicable rate. Cash receipts are 0.4%; contracting and property-transfer deeds are 0.1%; the duty is usually rounded to a whole number.",
    limitations: "Limitations", limitationsText: "This tool computes a rate-based estimate from the amount and type you enter and is a general simulation; fixed-stamp documents, exemptions, and special cases have separate rules — the Stamp Tax Act and the tax authority govern.",
    interpretation: "Interpretation", interpretationText: "Higher rate and larger amount mean higher stamp duty; because cash receipts carry a higher rate, watch the tax on large receipts and estimate before signing.",
    context: "Context", contextText: "Knowing stamp duty helps businesses and individuals estimate cost before signing, issuing receipts, or transferring real estate, avoiding under-stamping that triggers back-taxes and penalties.",
    example: "Example", exampleText: "Issuing a 100,000 cash receipt at 0.4% gives 400 in stamp duty; a 500,000 contracting deed at 0.1% gives 500.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a tax-document workflow", premiumTitle: "Pro Stamp-Duty Toolkit", premiumText: "Unlock multi-document batch calculation, fixed-stamp reference, duty-summary reports, and stamping reminders.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only converts stamp duty by rate and is a general simulation; it is not tax advice — consult the tax authority or a professional for the specific taxable scope.", relatedTools: "Related tools", relatedToolsText: "Import Duty Calculator · Legal Interest Calculator · Penalty Calculator · Minimum Wage Calculator", references: "References", referencesText: "Stamp Tax Act taxable-document and rate rules; 0.4% on cash receipts; 0.1% on contracting and property-transfer deeds; stamping and rounding principles.",
    q1: "Which documents need stamp duty?", a1: "Common taxable documents include cash receipts, contracting deeds, and sale/transfer/partition deeds for real estate; different types carry different rates, with the Stamp Tax Act governing the scope.",
    q2: "What are the stamp-duty rates?", a2: "Cash receipts are 0.4% of the amount; contracting and property-transfer deeds are 0.1%; some documents use a fixed per-item stamp, and this tool focuses on rate-based types.",
    q3: "How is the duty computed?", a3: "The tool multiplies the document amount by the applicable rate to get the stamp duty, usually rounded; just pick a type and enter an amount to see the result instantly.",
    q4: "Why does each result differ?", a4: "Document type and amount differ, so the rate and duty differ; this is normal — enter the real document details to get a figure close to the actual tax cost.",
    q5: "What if I under-stamp?", a5: "Under-stamping may trigger back-tax demands and penalties; estimate the duty and stamp as required before signing or issuing documents.",
    q6: "Does this tool upload my data?", a6: "No. All amount and duty calculations run locally in your browser — the data you enter is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function StampDutyCalculator() {
  const { lang, setLang } = useLanguage();
  const [mode, setMode] = useState<DocMode>("receipt");
  const [amount, setAmount] = useState("100000");
  const t = ui[lang];

  const result = useMemo(() => {
    const amt = Math.max(0, Number(amount) || 0);
    const rate = mode === "receipt" ? RATE_RECEIPT : mode === "contract" ? RATE_CONTRACT : RATE_PROPERTY;
    const duty = Math.round(amt * rate);
    return { duty, rate, base: amt };
  }, [mode, amount]);

  const typeLabel = useMemo<LocalText>(() => (mode === "receipt" ? { zh: "銀錢收據", en: "Receipt" } : mode === "contract" ? { zh: "承攬契約", en: "Contract" } : { zh: "產權移轉", en: "Property" }), [mode]);
  const ratePct = (result.rate * 100).toFixed(1) + "%";

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "印花稅額", en: "Stamp duty" }, `${fmt(result.duty)}`],
      [{ zh: "適用稅率", en: "Applied rate" }, ratePct],
      [{ zh: "憑證金額", en: "Amount" }, `${fmt(result.base)}`],
      [{ zh: "憑證類型", en: "Type" }, l(typeLabel, lang)],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, ratePct, typeLabel, lang]);

  function fillSolid() { setMode("receipt"); setAmount("100000"); }
  function fillHighSalary() { setMode("contract"); setAmount("500000"); }

  const activeBand = bands.find(b => b.key === mode) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{fmt(result.duty)}</div><div className="text-sm font-bold text-amber-100">{l(typeLabel, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{l(typeLabel, lang)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{ratePct}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{fmt(result.base)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "receipt" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("receipt")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "contract" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("contract")}>{t.imperial}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "property" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("property")}>{lang === "zh" ? "產權" : "Property"}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">0.4%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "收據 · 100,000 元" : "Receipt · 100,000"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">0.1%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "契約 · 500,000 元" : "Contract · 500,000"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.modeLabel}<div className="mt-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700">{l(typeLabel, lang)} · {ratePct}</div></label><label className="block text-sm font-black text-emerald-700">{t.countLabel}<input type="number" min="0" step="1000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={amount} onChange={(e) => setAmount(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{fmt(result.duty)}<span className="text-2xl">{lang === "zh" ? " 元" : ""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(typeLabel, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{ratePct}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "稅率" : "rate"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "金額" : "amount"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.base)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "元" : ""}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "稅率" : "rate"}</div><p className="mt-2 text-3xl font-black text-blue-950">{ratePct}</p><p className="text-sm font-bold text-blue-700">{l(typeLabel, lang)}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "類型" : "type"}</div><p className="mt-2 text-2xl font-black text-slate-950">{l(typeLabel, lang)}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="stamp-duty-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "類型" : "Type"}</div><div className="mt-1 text-2xl font-black">{l(typeLabel, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{fmt(result.base)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.duty)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "選類型" : "Type", note: t.bmrStep }, { label: lang === "zh" ? "輸金額" : "Amount", note: t.deficitStep }, { label: lang === "zh" ? "套稅率" : "Rate", note: t.trendStep }, { label: lang === "zh" ? "得稅額" : "Duty", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="stamp-duty-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次", "對照", "報表", "提醒"] : ["Batch", "Ref", "Report", "Alert"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
