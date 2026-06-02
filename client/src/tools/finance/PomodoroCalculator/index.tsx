// @profile B
// Profile B · 計算機-YMYL · Pomodoro計算機（GOLD-STANDARD-001 compatible）

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
  { key: "light", range: "<60m", label: { zh: "輕量", en: "輕量" }, desc: { zh: "適合快速整理、郵件或短任務。", en: "適合快速整理、郵件或短任務。" } },
  { key: "normal", range: "60–120m", label: { zh: "標準", en: "標準" }, desc: { zh: "常見深度工作區間，容易維持節奏。", en: "常見深度工作區間，容易維持節奏。" } },
  { key: "deep", range: "120–180m", label: { zh: "深度", en: "深度" }, desc: { zh: "適合寫作、開發、分析等高專注任務。", en: "適合寫作、開發、分析等高專注任務。" } },
  { key: "heavy", range: "180–240m", label: { zh: "高負荷", en: "高負荷" }, desc: { zh: "專注量較高，休息品質要特別注意。", en: "專注量較高，休息品質要特別注意。" } },
  { key: "sprint", range: "240–300m", label: { zh: "衝刺", en: "衝刺" }, desc: { zh: "適合短期衝刺，不宜長期每天使用。", en: "適合短期衝刺，不宜長期每天使用。" } },
  { key: "extreme", range: ">300m", label: { zh: "極限", en: "極限" }, desc: { zh: "容易疲勞，建議拆成多段或降低循環。", en: "容易疲勞，建議拆成多段或降低循環。" } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "會議成本計算機", en: "會議成本計算機" }, href: "/tools/finance/meeting-cost-calculator" },
  { label: { zh: "時薪計算機", en: "時薪計算機" }, href: "/tools/finance/hourly-rate-calculator" },
  { label: { zh: "預算比例計算機", en: "預算比例計算機" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "稅後薪資計算機", en: "稅後薪資計算機" }, href: "/tools/finance/salary-after-tax-calculator" },
];

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

const ui = {
  zh: {
    title: "Pomodoro Calculator · 番茄鐘計算機", subtitle: "計算專注循環、休息時間與總排程長度", badge: "財務 · 生產力 · 黃金工具", note: "此工具用於時間規劃與教育用途；實際效率仍受任務難度、睡眠、干擾與工作環境影響。",
    focus: "專注分鐘", short: "短休息分鐘", long: "長休息分鐘", cycles: "循環數", result: "番茄鐘排程結果", focusTotal: "總專注時間", totalTime: "總排程時間", breakTime: "總休息時間", ratio: "專注占比",
    quick: "快速範例", fillStd: "一鍵標準 25/5", fillDeep: "一鍵深度工作", calc: "計算機", examples: "範例 → 計算機", examplesHelp: "先用標準番茄鐘理解節奏，再調整成自己的工作排程。",
    intelligence: "結果解讀", matrix: "六格專注負荷矩陣", matrixNote: "L7 固定六格，依總專注分鐘判斷排程負荷；這是時間管理參考，不是醫療或職涯建議。",
    emotion: "情緒與轉換層", plan: "把專注排程轉成可執行工作計畫", conversion: "L9 連動目前結果，顯示專注時間、總時間與休息比例，協助避免過度排程。",
    save: "儲存 / 分享", journey: "把今天的專注節奏帶走", journeyHint: "每週依實際完成率調整一次循環數與休息長度。", next: "下一步工具", nextTitle: "把時間價值接到財務工具", n1: "用會議成本計算機估算省下會議後的時間價值", n2: "用時薪計算機把專注時間換算成機會成本", n3: "用預算比例計算機安排工作收入配置",
    path: "決策路徑", pathTitle: "番茄鐘 → 會議成本 → 時薪 → 預算比例", knowledge: "知識", knowledgeTitle: "番茄鐘在效率規劃中的意義", definition: "定義", definitionText: "番茄鐘是一種把工作拆成固定專注段與休息段的時間管理方法，用來降低啟動阻力並保護注意力。", formula: "公式", formulaText: "總專注時間 = 專注分鐘 × 循環數。短休息時間 = 短休息分鐘 ×（循環數 − 1）。總休息時間 = 短休息時間 + 長休息時間。總排程時間 = 總專注時間 + 總休息時間。專注占比 = 總專注時間 ÷ 總排程時間。", limits: "限制", limitsText: "不適合所有工作；深度創作、緊急支援或多人協作可能需要更彈性的節奏。", example: "範例", exampleText: "25 分鐘專注、5 分鐘短休息、15 分鐘長休息、4 個循環：總專注 100 分鐘，總排程 130 分鐘，專注占比 76.9%。",
    faq: "常見問題", common: "常見問題", affiliate: "推薦工具", affiliateTitle: "專注時間規劃的下一步工具", premiumTitle: "專業版番茄鐘套件", premiumText: "解鎖週期追蹤、分心紀錄、任務模板與深度工作報告。", trustRef: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與時間規劃用途，不取代專業醫療、心理或職涯建議。", related: "相關工具", refs: "參考資料", refsText: "番茄工作法原始方法說明；深度工作時間管理研究；心理學注意力研究；工作趨勢與生產力報告。",
    q1: "25/5 一定最好嗎？", a1: "不一定。25/5 是常見起點，若任務需要更長進入狀態，可改成 50/10 或 90/15。", q2: "長休息要放在哪裡？", a2: "常見做法是在 4 個循環後安排一次長休息，讓注意力恢復。", q3: "可以用來排會議嗎？", a3: "可以估算專注區塊，但會議通常需要另外考量參與者與決策成本。", q4: "專注占比越高越好嗎？", a4: "不一定。休息太少會降低後段品質，建議保留足夠恢復時間。", q5: "如何處理中斷？", a5: "記錄中斷來源，下一輪前先排除通知、開放問題與不必要會議。", q6: "這是醫療或心理建議嗎？", a6: "不是。若長期注意力困難或壓力過高，請諮詢合格專業人士。",
  },
  en: {
    title: "Pomodoro Calculator · 番茄鐘計算機", subtitle: "計算專注循環、休息時間與總排程長度", badge: "財務 · 生產力 · 黃金工具", note: "此工具用於時間規劃與教育用途；實際效率仍受任務難度、睡眠、干擾與工作環境影響。",
    focus: "專注分鐘", short: "短休息分鐘", long: "長休息分鐘", cycles: "循環數", result: "番茄鐘排程結果", focusTotal: "總專注時間", totalTime: "總排程時間", breakTime: "總休息時間", ratio: "專注占比",
    quick: "快速範例", fillStd: "一鍵標準 25/5", fillDeep: "一鍵深度工作", calc: "計算機", examples: "範例 → 計算機", examplesHelp: "先用標準番茄鐘理解節奏，再調整成自己的工作排程。",
    intelligence: "結果解讀", matrix: "六格專注負荷矩陣", matrixNote: "L7 固定六格，依總專注分鐘判斷排程負荷；這是時間管理參考，不是醫療或職涯建議。",
    emotion: "情緒與轉換層", plan: "把專注排程轉成可執行工作計畫", conversion: "L9 連動目前結果，顯示專注時間、總時間與休息比例，協助避免過度排程。",
    save: "儲存 / 分享", journey: "把今天的專注節奏帶走", journeyHint: "每週依實際完成率調整一次循環數與休息長度。", next: "下一步工具", nextTitle: "把時間價值接到財務工具", n1: "用會議成本計算機估算省下會議後的時間價值", n2: "用時薪計算機把專注時間換算成機會成本", n3: "用預算比例計算機安排工作收入配置",
    path: "決策路徑", pathTitle: "番茄鐘 → 會議成本 → 時薪 → 預算比例", knowledge: "知識", knowledgeTitle: "番茄鐘在效率規劃中的意義", definition: "定義", definitionText: "番茄鐘是一種把工作拆成固定專注段與休息段的時間管理方法，用來降低啟動阻力並保護注意力。", formula: "公式", formulaText: "總專注時間 = 專注分鐘 × 循環數。短休息時間 = 短休息分鐘 ×（循環數 − 1）。總休息時間 = 短休息時間 + 長休息時間。總排程時間 = 總專注時間 + 總休息時間。專注占比 = 總專注時間 ÷ 總排程時間。", limits: "限制", limitsText: "不適合所有工作；深度創作、緊急支援或多人協作可能需要更彈性的節奏。", example: "範例", exampleText: "25 分鐘專注、5 分鐘短休息、15 分鐘長休息、4 個循環：總專注 100 分鐘，總排程 130 分鐘，專注占比 76.9%。",
    faq: "常見問題", common: "常見問題", affiliate: "推薦工具", affiliateTitle: "專注時間規劃的下一步工具", premiumTitle: "專業版番茄鐘套件", premiumText: "解鎖週期追蹤、分心紀錄、任務模板與深度工作報告。", trustRef: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與時間規劃用途，不取代專業醫療、心理或職涯建議。", related: "相關工具", refs: "參考資料", refsText: "番茄工作法原始方法說明；深度工作時間管理研究；心理學注意力研究；工作趨勢與生產力報告。",
    q1: "25/5 一定最好嗎？", a1: "不一定。25/5 是常見起點，若任務需要更長進入狀態，可改成 50/10 或 90/15。", q2: "長休息要放在哪裡？", a2: "常見做法是在 4 個循環後安排一次長休息，讓注意力恢復。", q3: "可以用來排會議嗎？", a3: "可以估算專注區塊，但會議通常需要另外考量參與者與決策成本。", q4: "專注占比越高越好嗎？", a4: "不一定。休息太少會降低後段品質，建議保留足夠恢復時間。", q5: "如何處理中斷？", a5: "記錄中斷來源，下一輪前先排除通知、開放問題與不必要會議。", q6: "這是醫療或心理建議嗎？", a6: "不是。若長期注意力困難或壓力過高，請諮詢合格專業人士。",
  },
} as const;

export default function PomodoroCalculator() {
  const { lang, setLang } = useLanguage();
  const displayLang: Lang = "zh";
  const [focus, setFocus] = useState("25");
  const [shortBreak, setShortBreak] = useState("5");
  const [longBreak, setLongBreak] = useState("15");
  const [cycles, setCycles] = useState("4");
  const t = ui.zh;
  const result = useMemo(() => {
    const f = Number(focus) || 0, s = Number(shortBreak) || 0, lbr = Number(longBreak) || 0, c = Number(cycles) || 0;
    const totalFocus = f * c;
    const shortBreaks = Math.max(c - 1, 0) * s;
    const breakTime = shortBreaks + (c > 0 ? lbr : 0);
    const totalSchedule = totalFocus + breakTime;
    const focusRatio = totalSchedule > 0 ? (totalFocus / totalSchedule) * 100 : 0;
    return { totalFocus, shortBreaks, breakTime, totalSchedule, focusRatio };
  }, [focus, shortBreak, longBreak, cycles]);
  function fillStd() { setFocus("25"); setShortBreak("5"); setLongBreak("15"); setCycles("4"); }
  function fillDeep() { setFocus("50"); setShortBreak("10"); setLongBreak("25"); setCycles("3"); }
  const activeBand = bands.find(b => { const m = result.totalFocus; if (m < 60) return b.key === "light"; if (m < 120) return b.key === "normal"; if (m < 180) return b.key === "deep"; if (m < 240) return b.key === "heavy"; if (m < 300) return b.key === "sprint"; return b.key === "extreme"; });
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    {/* L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences */}
    <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]"><div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14"><div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-black">中文模式</button></div><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="text-4xl font-black md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="text-lg leading-8 text-slate-700">{t.note}</p></section><aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quick}</p><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.focusTotal}</div><div className="mt-1 text-5xl font-black">{fmt(result.totalFocus)} 分鐘</div></div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={fillStd} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillStd}</button><button onClick={fillDeep} className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.fillDeep}</button></div></aside></div></div></section>
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examples}</p><h2 className="mt-2 text-3xl font-black">{t.calc}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.examplesHelp}</p><div className="mt-6 grid gap-4 md:grid-cols-4"><label className="text-sm font-black">{t.focus}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={focus} onChange={e=>setFocus(e.target.value)} /></label><label className="text-sm font-black">{t.short}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={shortBreak} onChange={e=>setShortBreak(e.target.value)} /></label><label className="text-sm font-black">{t.long}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={longBreak} onChange={e=>setLongBreak(e.target.value)} /></label><label className="text-sm font-black">{t.cycles}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={cycles} onChange={e=>setCycles(e.target.value)} /></label></div></section>
      <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]"><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.result}</p><div className="mt-4 text-7xl font-black">{fmt(result.totalFocus)}<span className="text-3xl"> 分鐘</span></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-amber-50 p-4"><b>{t.totalTime}</b><p className="text-3xl font-black">{fmt(result.totalSchedule)} 分鐘</p></div><div className="rounded-2xl bg-blue-50 p-4"><b>{t.breakTime}</b><p className="text-3xl font-black">{fmt(result.breakTime)} 分鐘</p></div><div className="rounded-2xl bg-emerald-50 p-4"><b>{t.ratio}</b><p className="text-3xl font-black">{fmt(result.focusRatio,1)}%</p></div></div></article><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.intelligence}</p><h2 className="mt-2 text-3xl font-black">{t.matrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.matrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map(item => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex justify-between gap-3"><h3 className="font-black">{l(item.label, displayLang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, displayLang)}</p></div>)}</div></article></section>
      <AdSenseWrapper showAds={true} adSlot="pomodoro-result-intelligence" adFormat="horizontal" className="my-2" />
      <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotion}</p><h2 className="mt-2 text-3xl font-black">{t.plan}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.conversion}</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">{t.focusTotal}: {fmt(result.totalFocus)} 分鐘</h3></article><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">{t.ratio}: {fmt(result.focusRatio,1)}%</h3></article></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]"><article className="rounded-3xl bg-white p-5"><p className="font-black">{t.save}</p><p className="mt-2 text-sm text-slate-600">{t.journeyHint}</p></article><article className="rounded-3xl bg-white p-5"><p className="font-black">{t.nextTitle}</p><ul className="mt-2 text-sm leading-6"><li>{t.n1}</li><li>{t.n2}</li><li>{t.n3}</li></ul></article></div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.path}</p><h2 className="mt-2 text-3xl font-black">{t.pathTitle}</h2></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{[[t.definition,t.definitionText],[t.formula,t.formulaText],[t.limits,t.limitsText],[t.example,t.exampleText]].map(([h,p])=><div key={h} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{h}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{p}</p></div>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.common}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q,a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div></section>
      <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"><AdSlot slot="pomodoro-faq" position="inline" /></section>
      <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map(item => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, displayLang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">推薦連結揭露：部分連結可能帶來佣金收入。</p></section><PremiumGate plan="PRO"><article className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6"><h2 className="text-3xl font-black">{t.premiumTitle}</h2><p className="mt-3 text-sm leading-6 text-slate-700">{t.premiumText}</p></article></PremiumGate></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustRef}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.related}</h2><p className="mt-2 text-sm leading-6 text-slate-700">會議成本 · 時薪 · 預算比例 · 稅後薪資</p></div><div><h2 className="text-xl font-black">{t.refs}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.refsText}</p></div></div></section>
    </div>
  </main>;
}
