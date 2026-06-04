// @profile B
// Profile B · 計算機-YMYL · CapmCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0", label: { zh: "報酬偏低 (< 0)", en: "Low return (< 0)" }, desc: { zh: "落在「報酬偏低」級距< 0。依 CAPM 推算的必要報酬偏低,代表系統性風險低,但潛在報酬亦有限。", en: "Falls in the \"Low return\" band (< 0). CAPM required return is low; systematic risk is low but upside is limited too." } },
  { key: "normal", range: "0–5", label: { zh: "略低於市場 (0–5)", en: "Below market (0–5)" }, desc: { zh: "落在「略低於市場」級距0–5。必要報酬略低於市場平均,屬偏防禦性的風險報酬組合。", en: "Falls in the \"Below market\" band (0–5). Required return is below the market average, a defensive risk-return profile." } },
  { key: "notable", range: "5–8", label: { zh: "與市場相當 (5–8)", en: "Market-level (5–8)" }, desc: { zh: "落在「與市場相當」級距5–8。必要報酬與市場相當,風險與報酬大致符合市場平均水準。", en: "Falls in the \"Market-level\" band (5–8). Required return matches the market; risk and reward are around market average." } },
  { key: "high", range: "8–11", label: { zh: "略高於市場 (8–11)", en: "Above market (8–11)" }, desc: { zh: "落在「略高於市場」級距8–11。必要報酬略高於市場,反映 Beta 略高,需承擔較高系統性風險。", en: "Falls in the \"Above market\" band (8–11). Required return is above the market, reflecting a higher beta and more systematic risk." } },
  { key: "major", range: "11–15", label: { zh: "報酬良好 (11–15)", en: "Good return (11–15)" }, desc: { zh: "落在「報酬良好」級距11–15。必要報酬良好,Beta 偏高帶來較高的風險溢酬與報酬潛力。", en: "Falls in the \"Good return\" band (11–15). Good required return; a higher beta brings a larger risk premium and upside." } },
  { key: "executive", range: "≥ 15", label: { zh: "報酬優異 (≥ 15)", en: "Excellent return (≥ 15)" }, desc: { zh: "落在「報酬優異」級距≥ 15。必要報酬優異,但對應的系統性風險也相當高,須審慎評估。", en: "Falls in the \"Excellent return\" band (≥ 15). Excellent required return, but the matching systematic risk is also high — evaluate carefully." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Beta 係數計算機", en: "Beta Calculator" }, href: "/tools/finance/beta-calculator" },
  { label: { zh: "夏普比率計算機", en: "Sharpe Ratio Calculator" }, href: "/tools/finance/sharpe-ratio-calculator" },
  { label: { zh: "投資組合再平衡計算機", en: "Portfolio Rebalance Calculator" }, href: "/tools/finance/portfolio-rebalance-calculator" },
  { label: { zh: "ROI 投資報酬率計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · CAPM 資本資產定價計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "CAPM Calculator · CAPM 資本資產定價計算機",
    subtitle: "由無風險利率、Beta 與市場報酬計算資產的預期必要報酬率。",
    intro: "本工具為 CAPM 資本資產定價計算機，依公開公式於瀏覽器端試算，輸入無風險利率、股票 Beta 係數、預期市場報酬率、目標必要報酬率後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算CAPM 資本資產定價計算機",
    examplePreview: "預期(必要)報酬率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入無風險利率、股票 Beta 係數、預期市場報酬率、目標必要報酬率",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "一般股票情境",
    baselineExampleNote: "無風險利率 4 · 股票 Beta 係數 1.2",
    activeExample: "進階範例",
    activeExampleValue: "高 Beta 股票情境",
    activeExampleNote: "無風險利率 加倍 · 觀察 預期(必要)報酬率 變化",
    flowDemo: "數字流向示範",
    calculator: "CAPM 資本資產定價計算機",
    riskFreeRate: "無風險利率",
    stockBeta: "股票 Beta 係數",
    expectedMarketReturn: "預期市場報酬率",
    targetRequiredReturn: "目標必要報酬率",
    resultCard: "結果卡片",
    primaryValue: "預期(必要)報酬率",
    primaryUnitTail: "%",
    secondaryLabel: "股票風險溢酬",
    secondaryTail: "%",
    metricALabel: "預期(必要)報酬率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "股票風險溢酬",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "市場風險溢酬",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "CAPM 資本資產定價計算機 · 即時試算",
    fatLossTarget: "與目標報酬差距",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "CAPM 資本資產定價計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "市場風險溢酬",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 無風險利率 與 預期市場報酬率 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "CAPM 資本資產定價計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 無風險利率、股票 Beta 係數、預期市場報酬率、目標必要報酬率 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Capital asset pricing and required return analysis。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫",
    knowledgeTitle: "CAPM 資本資產定價計算機 · 觀念整理",
    definition: "定義",
    definitionText: "CAPM 資本資產定價計算機以無風險利率、股票 Beta 與預期市場報酬計算資產的預期(必要)報酬率、股票風險溢酬與市場風險溢酬,並比較與目標報酬的差距。",
    formula: "公式",
    formulaText: "預期報酬 = 無風險利率 + Beta ×(預期市場報酬 − 無風險利率);市場風險溢酬 = 預期市場報酬 − 無風險利率。",
    limitations: "限制",
    limitationsText: "本工具採 CAPM 單因子簡化模型,假設市場有效率、Beta 穩定且報酬呈線性關係,未計入多因子、流動性與市場異常,僅供概念性估算。",
    interpretation: "解讀",
    interpretationText: "依 CAPM 推算的必要報酬越高,代表系統性風險越高;若預期報酬高於目標報酬,代表該資產在風險調整後可能具吸引力。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配Beta 係數計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "CAPM Pro 進階",
    premiumText: "進階版加入多因子模型(Fama-French)、加權平均資金成本(WACC)、證券市場線繪製與情境敏感度分析。",
    premiumChips_zh: "多因子模型|WACC|證券市場線|敏感度分析",
    premiumChips_en: "Multi-factor|WACC|Security market line|Sensitivity",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "CAPM 是什麼?",
    a1: "CAPM(資本資產定價模型)說明資產的預期報酬與其系統性風險(Beta)之間的線性關係,用於估算投資人應要求的合理報酬率。",
    q2: "CAPM 公式怎麼算?",
    a2: "CAPM:預期報酬 = 無風險利率 + Beta ×(預期市場報酬 − 無風險利率);括號內即市場風險溢酬。",
    q3: "什麼是市場風險溢酬?",
    a3: "市場風險溢酬是投資整體市場相對無風險資產所要求的額外報酬,即預期市場報酬減去無風險利率。",
    q4: "Beta 在 CAPM 扮演什麼角色?",
    a4: "Beta 衡量資產相對市場的系統性風險;Beta 越高,投資人要求的風險溢酬與必要報酬越高。",
    q5: "必要報酬率有什麼用?",
    a5: "必要報酬率代表承擔該資產風險所應獲得的最低合理報酬,常用於折現率設定與投資是否值得的判斷。",
    q6: "這個結果準確嗎?",
    a6: "本工具以 CAPM 的單因子簡化模型估算,假設市場有效率且 Beta 穩定,未計入多因子與市場異常,僅供概念性參考。"
  },
  en: {
    badge: "Finance · CAPM Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "CAPM Calculator",
    subtitle: "Calculate an asset's expected required return from the risk-free rate, beta and market return.",
    intro: "CAPM Calculator runs the standard formula in your browser. Enter risk-free rate, stock beta, expected market return, target required return to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try CAPM Calculator",
    examplePreview: "Expected required return",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter risk-free rate, stock beta, expected market return, target required return",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Typical stock case",
    baselineExampleNote: "Risk-free rate 4 · Stock beta 1.2",
    activeExample: "Advanced example",
    activeExampleValue: "High-beta stock case",
    activeExampleNote: "Risk-free rate doubled · watch Expected required return react",
    flowDemo: "Data flow demo",
    calculator: "CAPM Calculator",
    riskFreeRate: "Risk-free rate",
    stockBeta: "Stock beta",
    expectedMarketReturn: "Expected market return",
    targetRequiredReturn: "Target required return",
    resultCard: "Result card",
    primaryValue: "Expected required return",
    primaryUnitTail: "%",
    secondaryLabel: "Equity risk premium",
    secondaryTail: "%",
    metricALabel: "Expected required return",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Equity risk premium",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Market risk premium",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "CAPM Calculator · live calc",
    fatLossTarget: "Gap vs target return",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "CAPM Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Market risk premium",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Risk-free rate and Expected market return by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "CAPM Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill risk-free rate, stock beta, expected market return, target required return.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "CAPM Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge",
    knowledgeTitle: "CAPM Calculator · concept primer",
    definition: "Definition",
    definitionText: "CAPM Calculator converts inputs (risk-free rate, stock beta, expected market return, target required return) into Expected required return. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(risk-free rate, stock beta, expected market return, target required return)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Beta Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "CAPM Pro",
    premiumText: "Pro adds multi-factor models (Fama-French), WACC, security market line charting and scenario sensitivity analysis.",
    premiumChips_zh: "多因子模型|WACC|證券市場線|敏感度分析",
    premiumChips_en: "Multi-factor|WACC|Security market line|Sensitivity",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does CAPM Calculator calculate?",
    a1: "CAPM Calculator applies the standard formula to your inputs and returns Expected required return plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for CAPM Calculator?",
    a2: "Enter risk-free rate, stock beta, expected market return, target required return. CAPM Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds multi-factor models (Fama-French), WACC, security market line charting and scenario sensitivity analysis."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CapmCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [riskFreeRate, setRiskFreeRate] = useState("4");
  const [stockBeta, setStockBeta] = useState("1.2");
  const [expectedMarketReturn, setExpectedMarketReturn] = useState("10");
  const [targetRequiredReturn, setTargetRequiredReturn] = useState("12");
  const t = ui[lang];

  const result = useMemo(() => {
const rf = Number(riskFreeRate) || 0; const beta = Number(stockBeta) || 0; const mret = Number(expectedMarketReturn) || 0; const target = Number(targetRequiredReturn) || 0; const marketPremium = mret - rf; const expectedReturn = rf + beta * marketPremium; const equityRiskPremium = beta * marketPremium; const returnGap = expectedReturn - target; return { primaryKey: expectedReturn, secondaryKey: equityRiskPremium, tertiaryKey: marketPremium, quaternaryKey: returnGap };
  }, [riskFreeRate, stockBeta, expectedMarketReturn, targetRequiredReturn]);

  const primaryDisplay = fmt(result.primaryKey, 2);
  const secondaryDisplay = fmt(result.secondaryKey, 2);
  const tertiaryDisplay = fmt(result.tertiaryKey, 2);
  const quaternaryDisplay = fmt(result.quaternaryKey, 2);

  function fillSolid() { setUnit("metric"); setRiskFreeRate("4"); setStockBeta("1.2"); setExpectedMarketReturn("10"); setTargetRequiredReturn("12"); }
  function fillHighSalary() { setUnit("imperial"); setRiskFreeRate("4"); setStockBeta("1.6"); setExpectedMarketReturn("11"); setTargetRequiredReturn("12"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0) return 'tiny';
    if (r < 5) return 'normal';
    if (r < 8) return 'notable';
    if (r < 11) return 'high';
    if (r < 15) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ffe4e6,_#fff7ed_45%,_#fce7f3)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-rose-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-rose-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-rose-100 bg-white/90 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-rose-600 p-5 text-white"><div className="text-xs font-bold uppercase text-rose-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-rose-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{riskFreeRate} × {stockBeta}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-black text-rose-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-emerald-700">{t.riskFreeRate}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={riskFreeRate} onChange={(e) => setRiskFreeRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.stockBeta}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={stockBeta} onChange={(e) => setStockBeta(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.expectedMarketReturn}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={expectedMarketReturn} onChange={(e) => setExpectedMarketReturn(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.targetRequiredReturn}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={targetRequiredReturn} onChange={(e) => setTargetRequiredReturn(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-rose-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-rose-400 bg-rose-50 ring-2 ring-rose-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="capm-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-rose-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-rose-50 p-4"><div className="text-xs font-black uppercase text-rose-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-rose-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-rose-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-rose-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-rose-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-rose-300 bg-rose-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="capm-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center font-black text-rose-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-rose-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
