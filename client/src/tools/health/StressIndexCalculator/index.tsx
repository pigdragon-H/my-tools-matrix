// @profile B
// Profile B · Calculator-Wellness · StressIndexCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type SleepLevel = "good" | "fair" | "poor";
type LoadLevel = "low" | "mid" | "high";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "calm", range: "0-5 pts", label: { zh: "平穩", en: "Calm" }, desc: { zh: "壓力負荷低，身心多在可恢復範圍內。", en: "Low load; mind and body mostly within recovery range." } },
  { key: "mild", range: "6-10 pts", label: { zh: "輕度", en: "Mild" }, desc: { zh: "出現一些壓力訊號，留意休息與放鬆即可。", en: "Some stress signals; mind rest and relaxation." } },
  { key: "moderate", range: "11-16 pts", label: { zh: "中度", en: "Moderate" }, desc: { zh: "壓力累積較明顯，建議主動安排調節與支持。", en: "Noticeable build-up; arrange active recovery and support." } },
  { key: "high", range: "17-22 pts", label: { zh: "偏高", en: "High" }, desc: { zh: "多項訊號同時偏高，建議減負並尋求協助。", en: "Multiple high signals; reduce load and seek help." } },
  { key: "severe", range: "23+ pts", label: { zh: "嚴重", en: "Severe" }, desc: { zh: "壓力訊號強烈，請優先與專業人員談談。", en: "Strong signals; please talk to a professional first." } },
  { key: "lifestyle", range: "education", label: { zh: "生活提醒", en: "Lifestyle" }, desc: { zh: "睡眠、運動與社交連結是長期壓力韌性的基礎。", en: "Sleep, exercise and social ties build long-term resilience." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "睡眠週期計算器", en: "Sleep Cycle Calculator" }, href: "/tools/health/sleep-cycle-calculator" },
  { label: { zh: "生理年齡計算器", en: "Biological Age Calculator" }, href: "/tools/health/biological-age-calculator" },
  { label: { zh: "血壓分析器", en: "Blood Pressure Analyzer" }, href: "/tools/health/blood-pressure-analyzer" },
  { label: { zh: "心臟病風險計算器", en: "Heart Disease Risk Calculator" }, href: "/tools/health/heart-disease-risk-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 身心覺察 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "壓力指數評估器 · Stress Index", subtitle: "用睡眠、工作負荷、放鬆頻率、身體症狀與情緒狀態估算概念性壓力指數",
    intro: "Stress Index Calculator 依據睡眠品質、工作負荷、放鬆頻率、身體症狀數與情緒低落天數，累加成一個概念性的壓力指數分數與等級，協助你進行自我覺察。這是教育性自評，不是臨床診斷工具。",
    trustNoteLabel: "重要聲明：", trustNote: "本工具僅為教育性自我覺察參考，無法診斷焦慮、憂鬱或任何身心狀況。若你長期感到難以承受、情緒低落或有自我傷害念頭，請立即聯繫專業心理師、醫師或當地危機支援專線。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立壓力評估範例", examplePreview: "壓力指數預覽", examplePerson: "高壓範例", fillExample: "一鍵填入低壓範例", previewActivePath: "填入高壓範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入你的狀況", examplesHelper: "先用範例理解分數怎麼算，再改成你自己的睡眠、負荷與情緒狀態。",
    metric: "標準模式", imperial: "簡易模式", exampleCards: "範例卡", baselineExample: "低壓範例", activeExample: "高壓範例", flowDemo: "Index demo", calculator: "計算機",
    sleep: "睡眠品質", sleepGood: "良好", sleepFair: "普通", sleepPoor: "差",
    load: "工作 / 生活負荷", loadLow: "低", loadMid: "中", loadHigh: "高",
    relax: "每週放鬆次數", symptoms: "身體症狀數 (0-6)", lowDays: "情緒低落天數 (0-7)",
    resultCard: "壓力指數評估結果", unit: "pts", primaryValue: "壓力指數", maintenanceTarget: "等級", actionTarget: "情緒低落", estimatedTdee: "壓力指數分數", maintenance: "壓力等級", fatLossTarget: "情緒低落天數",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格壓力等級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將分數對應到常見壓力區間；這是自我覺察參考，不是醫療或心理診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把壓力指數轉成可執行的調節計畫", conversionNote: "L9 會連動目前分數，顯示放鬆步驟、睡眠提醒與每日覺察建議。",
    progressInsight: "進度洞察卡", possibleTarget: "目前壓力狀態", dailyGap: "每日覺察", weeklyTrend: "每週放鬆", motivation: "動力卡", keepMomentum: "從覺察走向穩定的身心節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的覺察結果記下來", journeyHint: "用 1-2 週的趨勢看壓力變化，避免被單日情緒誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用睡眠週期計算器檢查休息是否足夠", nextActionItem2: "用生理年齡了解生活習慣的整體影響", nextActionItem3: "用血壓或心臟風險工具關注生理層面",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "睡眠 → 壓力指數 → 生理年齡 / 心臟風險", bmrStep: "睡眠週期", deficitStep: "壓力指數", trendStep: "生理年齡", mealStep: "心臟風險",
    knowledgeLayer: "知識層", knowledgeTitle: "關於壓力與身心韌性，你該知道的事",
    faqLayer: "常見問題", trustLayer: "信任 · 相關工具 · 參考來源",
    trustTitle: "為什麼可以參考這個工具", relatedToolsTitle: "相關工具", referencesTitle: "參考來源",
    trustPoint1: "分數模型參考常見壓力自評量表的概念結構（如知覺壓力量表）。",
    trustPoint2: "全部運算在你的瀏覽器本機完成，不會上傳任何個人資料。",
    trustPoint3: "結果僅供教育性自我覺察，不取代心理師或醫師的專業評估。",
    premiumTitle: "Pro 進階壓力洞察", premiumDesc: "解鎖多日壓力趨勢圖、放鬆習慣追蹤與個人化覺察報告。",
    knowledge: {
      k1: { q: "壓力指數是怎麼算的？", a: "把睡眠品質、工作負荷、放鬆頻率、身體症狀數與情緒低落天數各自轉成分數後相加，得到一個概念性總分與等級。" },
      k2: { q: "分數越高一定代表生病嗎？", a: "不是。高分代表近期壓力訊號較多，是提醒而非診斷；真正的評估需要專業人員進行。" },
      k3: { q: "放鬆次數為什麼會降低分數？", a: "規律的放鬆與恢復活動有助於調節壓力反應，因此在模型中視為保護性因子。" },
      k4: { q: "身體症狀指的是什麼？", a: "例如頭痛、肩頸緊繃、腸胃不適、心悸、易疲倦或睡不好等與壓力相關的身體訊號。" },
      k5: { q: "我可以多久評估一次？", a: "可每週或每兩週評估一次，觀察趨勢比單次分數更有意義。" },
      k6: { q: "如果分數很高我該怎麼辦？", a: "先試著減少負荷、安排休息與睡眠，並主動尋求親友或專業協助；若有強烈不適請優先就醫。" },
    },
    faq: {
      q1: "這個工具能診斷焦慮或憂鬱嗎？", a1: "不能。它只是教育性自評，無法診斷任何身心疾病，請以專業評估為準。",
      q2: "資料會被儲存嗎？", a2: "不會。所有計算都在你的瀏覽器本機完成，不會上傳或保存個人資料。",
      q3: "分數有絕對標準嗎？", a3: "沒有。不同量表計分方式不同，本工具的區間僅作概念性參考。",
      q4: "壓力一定是壞事嗎？", a4: "適度壓力可提升專注與表現，長期過高且無法恢復的壓力才需要特別注意。",
      q5: "我覺得很痛苦但分數不高怎麼辦？", a5: "請相信自己的感受並尋求協助，工具分數不能取代你的主觀經驗與專業判斷。",
      q6: "可以給家人朋友用嗎？", a6: "可以，但同樣僅供自我覺察；任何持續或嚴重的困擾都應交由專業人員評估。",
    },
    references: [
      "Cohen S, et al. Perceived Stress Scale (PSS). J Health Soc Behav. 1983.",
      "World Health Organization (WHO) — Stress and mental health resources.",
      "American Psychological Association (APA) — Stress effects on the body.",
      "National Institute of Mental Health (NIMH) — Coping with stress.",
    ],
  },
  en: {
    badge: "Health · Mind-Body · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Stress Index Calculator", subtitle: "Estimate a conceptual stress index from sleep, workload, relaxation, symptoms and mood",
    intro: "The Stress Index Calculator adds sleep quality, workload, relaxation frequency, physical symptom count and low-mood days into a conceptual stress score and band to support self-awareness. It is an educational self-check, not a clinical diagnostic tool.",
    trustNoteLabel: "Important: ", trustNote: "This tool is an educational self-awareness aid only and cannot diagnose anxiety, depression or any condition. If you feel persistently overwhelmed, low, or have thoughts of self-harm, please contact a licensed therapist, physician or local crisis line immediately.",
    quickActionCard: "Quick Example", tryExample: "Build a stress example in one click", examplePreview: "Stress index preview", examplePerson: "High-stress example", fillExample: "Fill low-stress example", previewActivePath: "Fill high-stress example",
    examplesCalculator: "Example → Calculator", enterValues: "Enter your situation", examplesHelper: "Use the example to see how the score works, then enter your own sleep, load and mood.",
    metric: "Standard", imperial: "Simple", exampleCards: "Example cards", baselineExample: "Low-stress example", activeExample: "High-stress example", flowDemo: "Index demo", calculator: "Calculator",
    sleep: "Sleep quality", sleepGood: "Good", sleepFair: "Fair", sleepPoor: "Poor",
    load: "Work / life load", loadLow: "Low", loadMid: "Medium", loadHigh: "High",
    relax: "Relaxation times / week", symptoms: "Physical symptoms (0-6)", lowDays: "Low-mood days (0-7)",
    resultCard: "Stress Index Result", unit: "pts", primaryValue: "Stress index", maintenanceTarget: "Band", actionTarget: "Low mood", estimatedTdee: "Stress index score", maintenance: "Stress band", fatLossTarget: "Low-mood days",
    resultIntelligence: "Result reading", tdeeMatrix: "Six-cell stress band matrix", tdeeMatrixNote: "L7 fixed six cells mapping the score to common stress ranges; a self-awareness reference, not a medical or psychological diagnosis.",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn the stress index into an actionable plan", conversionNote: "L9 reacts to the current score, showing relaxation steps, sleep reminders and daily awareness tips.",
    progressInsight: "Progress insight", possibleTarget: "Current stress state", dailyGap: "Daily awareness", weeklyTrend: "Weekly relaxation", motivation: "Motivation", keepMomentum: "Move from awareness to a steady mind-body rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Record today's awareness result", journeyHint: "Track 1-2 weeks of trend so a single day's mood doesn't mislead you.",
    nextActionLabel: "Next action", nextActionTitle: "Send the result to the next tool", nextActionItem1: "Check rest with the Sleep Cycle Calculator first", nextActionItem2: "See lifestyle impact via Biological Age", nextActionItem3: "Watch the physical side with blood pressure / heart risk",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Sleep → Stress index → Biological age / Heart risk", bmrStep: "Sleep cycle", deficitStep: "Stress index", trendStep: "Bio age", mealStep: "Heart risk",
    knowledgeLayer: "Knowledge", knowledgeTitle: "What to know about stress and resilience",
    faqLayer: "FAQ", trustLayer: "Trust · Related tools · References",
    trustTitle: "Why you can reference this tool", relatedToolsTitle: "Related tools", referencesTitle: "References",
    trustPoint1: "The scoring model mirrors the conceptual structure of common stress self-reports (e.g. Perceived Stress Scale).",
    trustPoint2: "All computation runs locally in your browser; no personal data is uploaded.",
    trustPoint3: "Results are for educational self-awareness only and do not replace a therapist or physician.",
    premiumTitle: "Pro Stress Insights", premiumDesc: "Unlock multi-day stress trend charts, relaxation-habit tracking and a personalized awareness report.",
    knowledge: {
      k1: { q: "How is the stress index calculated?", a: "Sleep quality, workload, relaxation frequency, symptom count and low-mood days are each scored and summed into a conceptual total and band." },
      k2: { q: "Does a high score mean I'm ill?", a: "No. A high score means more recent stress signals — a prompt, not a diagnosis; real assessment needs a professional." },
      k3: { q: "Why does relaxation lower the score?", a: "Regular relaxation and recovery help regulate the stress response, so they act as a protective factor in the model." },
      k4: { q: "What counts as a physical symptom?", a: "Things like headaches, neck/shoulder tension, stomach upset, palpitations, fatigue or poor sleep tied to stress." },
      k5: { q: "How often should I assess?", a: "Weekly or biweekly is fine; the trend over time matters more than a single score." },
      k6: { q: "What if my score is very high?", a: "Try reducing load, prioritizing rest and sleep, and reach out to friends, family or a professional; seek care promptly if you feel strong distress." },
    },
    faq: {
      q1: "Can this diagnose anxiety or depression?", a1: "No. It is an educational self-check and cannot diagnose any condition; rely on professional assessment.",
      q2: "Is my data stored?", a2: "No. All calculations run locally in your browser; nothing is uploaded or saved.",
      q3: "Is there an absolute standard score?", a3: "No. Different scales score differently; these bands are conceptual references only.",
      q4: "Is stress always bad?", a4: "Moderate stress can sharpen focus and performance; chronic, unrecoverable stress is what needs attention.",
      q5: "I feel awful but my score is low?", a5: "Trust your own experience and seek help; the score cannot replace your subjective experience or professional judgment.",
      q6: "Can family and friends use it?", a6: "Yes, but only for self-awareness; any persistent or severe distress should be assessed by a professional.",
    },
    references: [
      "Cohen S, et al. Perceived Stress Scale (PSS). J Health Soc Behav. 1983.",
      "World Health Organization (WHO) — Stress and mental health resources.",
      "American Psychological Association (APA) — Stress effects on the body.",
      "National Institute of Mental Health (NIMH) — Coping with stress.",
    ],
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;
const knowledgeKeys = ["k1", "k2", "k3", "k4", "k5", "k6"] as const;

const sleepScore: Record<SleepLevel, number> = { good: 0, fair: 3, poor: 6 };
const loadScore: Record<LoadLevel, number> = { low: 0, mid: 3, high: 6 };

export default function StressIndexCalculator() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];

  const [sleep, setSleep] = useState<SleepLevel>("poor");
  const [load, setLoad] = useState<LoadLevel>("high");
  const [relax, setRelax] = useState("0");
  const [symptoms, setSymptoms] = useState("4");
  const [lowDays, setLowDays] = useState("4");
  const [toast, setToast] = useState(false);

  const result = useMemo(() => {
    const relaxN = Math.max(0, Math.min(14, Number(relax) || 0));
    const sympN = Math.max(0, Math.min(6, Number(symptoms) || 0));
    const lowN = Math.max(0, Math.min(7, Number(lowDays) || 0));
    const relaxAdj = Math.max(0, 4 - relaxN);
    const score = sleepScore[sleep] + loadScore[load] + relaxAdj + sympN + lowN;
    const band =
      score <= 5 ? "calm" :
      score <= 10 ? "mild" :
      score <= 16 ? "moderate" :
      score <= 22 ? "high" : "severe";
    return { score, band, lowN };
  }, [sleep, load, relax, symptoms, lowDays]);

  const bandLabel = useMemo(() => {
    const b = bands.find((x) => x.key === result.band);
    return b ? l(b.label, lang) : "—";
  }, [result.band, lang]);

  const fillStandard = () => { setSleep("good"); setLoad("low"); setRelax("5"); setSymptoms("0"); setLowDays("0"); };
  const fillCut = () => { setSleep("poor"); setLoad("high"); setRelax("0"); setSymptoms("5"); setLowDays("6"); };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setToast(true); setTimeout(() => setToast(false), 1600); } catch { /* noop */ }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* L1 Hero */}
      <section style={{ background: "radial-gradient(120% 120% at 50% 0%, #eef2ff 0%, #ffffff 60%)" }} className="border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="mb-6 flex justify-end">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-sm shadow-sm">
              <button onClick={() => setLang("zh")} className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-slate-900 text-white" : "text-slate-500"}`} aria-label={t.switchToChinese}>{t.chineseShort}</button>
              <button onClick={() => setLang("en")} className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-slate-900 text-white" : "text-slate-500"}`} aria-label={t.switchToEnglish}>{t.englishShort}</button>
            </div>
          </div>
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">{t.badge}</span>
              <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">{t.title}</h1>
              <p className="mt-3 text-lg font-black text-slate-600">{t.subtitle}</p>
              <p className="mt-4 text-sm font-black leading-relaxed text-slate-500">{t.intro}</p>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-black text-amber-800">
                <span className="font-black">{t.trustNoteLabel}</span>{t.trustNote}
              </div>
            </div>
            <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
              <div className="text-sm font-black text-slate-500">{t.quickActionCard}</div>
              <div className="mt-2 text-lg font-black">{t.tryExample}</div>
              <div className="mt-4 rounded-[2rem] bg-emerald-600 p-6 text-center text-white">
                <div className="text-xs font-black uppercase tracking-wide opacity-80">{t.examplePreview}</div>
                <div className="text-5xl font-black">{fmt(result.score)}</div>
                <div className="mt-1 text-sm font-black opacity-90">{bandLabel} · {t.examplePerson}</div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-white/15 p-2"><div className="font-black opacity-80">{t.maintenanceTarget}</div><div className="font-black">{bandLabel}</div></div>
                  <div className="rounded-lg bg-white/15 p-2"><div className="font-black opacity-80">{t.primaryValue}</div><div className="font-black">{fmt(result.score)}</div></div>
                  <div className="rounded-lg bg-white/15 p-2"><div className="font-black opacity-80">{t.actionTarget}</div><div className="font-black">{fmt(result.lowN)}</div></div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={fillStandard} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white">{t.fillExample}</button>
                <button onClick={fillCut} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white">{t.previewActivePath}</button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        {/* L5 Calculator */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">{t.examplesCalculator}</h2>
            <span className="text-sm font-black text-slate-400">{t.calculator}</span>
          </div>
          <p className="mt-1 text-sm font-black text-slate-500">{t.examplesHelper}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button onClick={fillStandard} className="rounded-xl border border-slate-200 p-4 text-left hover:border-slate-400">
              <div className="text-sm font-black text-slate-500">{t.exampleCards}</div>
              <div className="text-lg font-black">{t.baselineExample}</div>
            </button>
            <button onClick={fillCut} className="rounded-xl border border-slate-200 p-4 text-left hover:border-slate-400">
              <div className="text-sm font-black text-slate-500">{t.flowDemo}</div>
              <div className="text-lg font-black">{t.activeExample}</div>
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="text-sm font-black text-slate-600">{t.sleep}</span>
              <select value={sleep} onChange={(e) => setSleep(e.target.value as SleepLevel)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="good">{t.sleepGood}</option>
                <option value="fair">{t.sleepFair}</option>
                <option value="poor">{t.sleepPoor}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-600">{t.load}</span>
              <select value={load} onChange={(e) => setLoad(e.target.value as LoadLevel)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="low">{t.loadLow}</option>
                <option value="mid">{t.loadMid}</option>
                <option value="high">{t.loadHigh}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-600">{t.relax}</span>
              <input type="number" min={0} max={14} value={relax} onChange={(e) => setRelax(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-600">{t.symptoms}</span>
              <input type="number" min={0} max={6} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-600">{t.lowDays}</span>
              <input type="number" min={0} max={7} value={lowDays} onChange={(e) => setLowDays(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
          </div>
        </section>

        {/* L6 Result */}
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
          <h2 className="text-xl font-black">{t.resultCard}</h2>
          <div className="mt-3 text-center">
            <div className="text-7xl font-black text-indigo-700">{fmt(result.score)}</div>
            <div className="text-sm font-black text-slate-500">{t.unit}</div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white p-4 shadow-sm"><div className="text-sm font-black text-slate-500">{t.estimatedTdee}</div><div className="text-2xl font-black">{fmt(result.score)}</div></div>
            <div className="rounded-xl bg-white p-4 shadow-sm"><div className="text-sm font-black text-slate-500">{t.maintenance}</div><div className="text-2xl font-black">{bandLabel}</div></div>
            <div className="rounded-xl bg-white p-4 shadow-sm"><div className="text-sm font-black text-slate-500">{t.fatLossTarget}</div><div className="text-2xl font-black">{fmt(result.lowN)}</div></div>
          </div>
        </section>

        {/* L7 Result Intelligence */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">{t.resultIntelligence}</h2>
          <div className="mt-1 text-lg font-black text-slate-700">{t.tdeeMatrix}</div>
          <p className="mt-1 text-sm font-black text-slate-500">{t.tdeeMatrixNote}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bands.map((b) => (
              <div key={b.key} className={`rounded-xl border p-4 ${b.key === result.band ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-black">{l(b.label, lang)}</span>
                  <span className="text-xs font-black text-slate-400">{b.range}</span>
                </div>
                <p className="mt-1 text-sm font-black text-slate-600">{l(b.desc, lang)}</p>
              </div>
            ))}
          </div>
        </section>

        <AdSenseWrapper showAds={true} adSlot="stress-result-intelligence" adFormat="horizontal" className="my-2" />

        {/* L9 Emotion & Conversion */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-black text-slate-500">{t.emotionConversionLayer}</div>
          <h2 className="mt-1 text-xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{t.conversionNote}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4"><div className="text-sm font-black text-slate-500">{t.possibleTarget}</div><div className="text-lg font-black">{bandLabel}</div></div>
            <div className="rounded-xl bg-slate-50 p-4"><div className="text-sm font-black text-slate-500">{t.dailyGap}</div><div className="text-lg font-black">{fmt(result.score)} {t.unit}</div></div>
            <div className="rounded-xl bg-slate-50 p-4"><div className="text-sm font-black text-slate-500">{t.weeklyTrend}</div><div className="text-lg font-black">{relax}×</div></div>
          </div>
        </section>

        {/* L10 Save / Share */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-black text-slate-500">{t.saveShareJourney}</div>
          <h2 className="mt-1 text-xl font-black">{t.journeyTitle}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{t.journeyHint}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={copyLink} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white">{t.shareLinkBtn}</button>
            <button onClick={copyLink} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black">{t.shareNativeBtn}</button>
            {toast && <span className="self-center text-sm font-black text-emerald-600">{t.shareCopiedToast}</span>}
          </div>
        </section>

        {/* L11 Decision Path */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-black text-slate-500">{t.decisionPath}</div>
          <h2 className="mt-1 text-xl font-black">{t.decisionTitle}</h2>
          <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
            <div className="rounded-xl bg-indigo-50 p-4 text-center font-black">{t.bmrStep}</div>
            <div className="text-center text-slate-400">→</div>
            <div className="rounded-xl bg-indigo-100 p-4 text-center font-black">{t.deficitStep}</div>
            <div className="text-center text-slate-400">→</div>
            <div className="rounded-xl bg-indigo-50 p-4 text-center font-black">{t.trendStep}</div>
            <div className="text-center text-slate-400">→</div>
            <div className="rounded-xl bg-indigo-50 p-4 text-center font-black">{t.mealStep}</div>
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="text-sm font-black text-slate-600">{t.nextActionTitle}</div>
            <ul className="mt-2 list-disc pl-5 text-sm font-black text-slate-600">
              <li>{t.nextActionItem1}</li>
              <li>{t.nextActionItem2}</li>
              <li>{t.nextActionItem3}</li>
            </ul>
          </div>
        </section>

        {/* L12 Knowledge */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-black text-slate-500">{t.knowledgeLayer}</div>
          <h2 className="mt-1 text-xl font-black">{t.knowledgeTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeKeys.map((k) => (
              <div key={k} className="rounded-xl border border-slate-200 p-4">
                <div className="font-black">{t.knowledge[k].q}</div>
                <p className="mt-1 text-sm font-black text-slate-600">{t.knowledge[k].a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* L13 FAQ */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">{t.faqLayer}</h2>
          <div className="mt-4 space-y-2">
            {faqKeys.map(([q, a]) => (
              <details key={q} className="rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer font-black">{t.faq[q]}</summary>
                <p className="mt-2 text-sm font-black font-black text-slate-600">{t.faq[a]}</p>
              </details>
            ))}
          </div>
        </section>

        {/* L14 Ad Slot */}
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="stress-faq" position="inline" /></section>

        {/* L15 Affiliate */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">{t.relatedToolsTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {affiliateItems.map((a) => (
              <a key={a.href} href={a.href} className="rounded-xl border border-slate-200 p-4 text-center font-black hover:border-indigo-400">{l(a.label, lang)}</a>
            ))}
          </div>
        </section>

        {/* L16 Premium Gate */}
        <PremiumGate plan="PRO">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-xl font-black text-amber-900">{t.premiumTitle}</h2>
            <p className="mt-1 text-sm font-black text-amber-800">{t.premiumDesc}</p>
          </section>
        </PremiumGate>

        {/* L17 Trust */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">{t.trustLayer}</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div>
              <div className="font-black">{t.trustTitle}</div>
              <ul className="mt-2 list-disc pl-5 text-sm font-black text-slate-600">
                <li>{t.trustPoint1}</li>
                <li>{t.trustPoint2}</li>
                <li>{t.trustPoint3}</li>
              </ul>
            </div>
            <div>
              <div className="font-black">{t.relatedToolsTitle}</div>
              <ul className="mt-2 space-y-1 text-sm">
                {affiliateItems.map((a) => (
                  <li key={a.href}><a href={a.href} className="font-black text-indigo-600 hover:underline">{l(a.label, lang)}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-black">{t.referencesTitle}</div>
              <ul className="mt-2 list-disc pl-5 text-sm font-black text-slate-600">
                {t.references.map((r, i) => (<li key={i} className="font-black">{r}</li>))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
