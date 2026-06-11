// @profile B
// Profile B · Calculator-YMYL · RunningPaceCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type RaceMode = "free" | "5k" | "10k" | "half" | "full";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

function distanceFor(mode: RaceMode, free: number): number {
  if (mode === "5k") return 5;
  if (mode === "10k") return 10;
  if (mode === "half") return 21.0975;
  if (mode === "full") return 42.195;
  return free;
}

// pace = minutes per km; format as mm:ss
function paceLabel(paceMin: number): string {
  if (!Number.isFinite(paceMin) || paceMin <= 0) return "—";
  const m = Math.floor(paceMin);
  const s = Math.round((paceMin - m) * 60);
  const ss = s === 60 ? 0 : s;
  const mm = s === 60 ? m + 1 : m;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function timeLabel(totalMin: number): string {
  if (!Number.isFinite(totalMin) || totalMin <= 0) return "—";
  const h = Math.floor(totalMin / 60);
  const m = Math.floor(totalMin % 60);
  const s = Math.round((totalMin - Math.floor(totalMin)) * 60);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

// Standard race distances for prediction cards
const bands = [
  { key: "1k", dist: 1, label: { zh: "1 公里", en: "1 km" }, desc: { zh: "用於間歇與配速測試的短距離。", en: "Short distance for intervals and pace tests." } },
  { key: "5k", dist: 5, label: { zh: "5 公里", en: "5 km" }, desc: { zh: "入門路跑常見距離。", en: "Common entry-level road race." } },
  { key: "10k", dist: 10, label: { zh: "10 公里", en: "10 km" }, desc: { zh: "進階耐力與配速基準。", en: "Intermediate endurance and pace benchmark." } },
  { key: "half", dist: 21.0975, label: { zh: "半程馬拉松", en: "Half marathon" }, desc: { zh: "21.1 公里，耐力門檻賽事。", en: "21.1 km, an endurance threshold race." } },
  { key: "30k", dist: 30, label: { zh: "30 公里", en: "30 km" }, desc: { zh: "全馬訓練的長距離節點。", en: "Long-run milestone in marathon training." } },
  { key: "full", dist: 42.195, label: { zh: "全程馬拉松", en: "Full marathon" }, desc: { zh: "42.195 公里，配速預估僅供參考。", en: "42.195 km; predicted time is a reference only." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "最大心率計算機", en: "Max Heart Rate Calculator" }, href: "/tools/health/max-heart-rate-calculator" },
  { label: { zh: "運動消耗計算機", en: "Exercise Calories Calculator" }, href: "/tools/health/exercise-calories-calculator" },
  { label: { zh: "卡路里燃燒計算機", en: "Calorie Burn Calculator" }, href: "/tools/health/calorie-burn-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 運動規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "跑步配速計算機 · Running Pace", subtitle: "用距離與完成時間算出配速、速度與各賽事預估完賽時間",
    intro: "Running Pace Calculator 依據您跑的距離(km)與完成時間(分鐘)，計算每公里配速(min/km)與速度(km/h)，並用相同配速預估 1K、5K、10K、半馬與全馬的完賽時間，協助設定目標與訓練配速。",
    trustNoteLabel: "注意事項：", trustNote: "賽事預估假設配速維持不變，實際比賽會因疲勞、地形與天候而變慢；距離越長，預估誤差越大。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立配速範例", examplePreview: "配速預覽", examplePerson: "距離", fillExample: "一鍵填入標準範例", previewActivePath: "填入 10K 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入距離與時間", examplesHelper: "先用範例理解配速與賽事預估，再改成自己的距離與完成時間。",
    metric: "公制 (km/min)", imperial: "英制 (mi/min)", exampleCards: "範例卡", baselineExample: "5 公里 · 30 分鐘", activeExample: "10 公里 · 55 分鐘", baselineExampleNote: "5 km / 30 分鐘 = 6:00 min/km", activeExampleNote: "10 km / 55 分鐘 = 5:30 min/km", flowDemo: "5 km", calculator: "計算機",
    weight: "距離 (公里)", minutes: "完成時間 (分鐘)", mode: "賽事預設", modeFox: "自訂距離", modeTanaka: "5K (5 km)", modeGulati: "10K (10 km)", modeHalf: "半馬 (21.1 km)", modeFull: "全馬 (42.2 km)",
    resultCard: "配速結果", unit: "min/km", primaryValue: "本次配速", maintenanceTarget: "速度", actionTarget: "5K 預估", estimatedTdee: "賽事", maintenance: "km/h", fatLossTarget: "5K 完賽",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格賽事完賽時間矩陣", tdeeMatrixNote: "L7 固定六格，以目前配速預估各標準距離的完賽時間；這是訓練規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把配速轉成可執行訓練計畫", conversionNote: "L9 會連動目前配速，顯示速度、各賽事預估與恢復提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前配速規劃", dailyGap: "速度 (km/h)", weeklyTrend: "10K 預估", motivation: "動力卡", keepMomentum: "從單次配速走向穩定進步",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的配速帶回家", journeyHint: "用不同訓練日的配速比較進步，搭配心率區間安排輕鬆跑與節奏跑。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 Max Heart Rate 對應配速心率區間", nextActionItem2: "用 Exercise Calories 估算跑步消耗", nextActionItem3: "用 TDEE 安排訓練後的熱量補充",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "配速 → 賽事預估 → 心率區間 → 消耗", bmrStep: "配速", deficitStep: "賽事預估", trendStep: "心率區間", mealStep: "消耗補充",
    knowledge: "知識", knowledgeTitle: "配速在健康宇宙中的意義", definition: "定義", definitionText: "配速(pace)是跑完每公里所需的時間，常以 min/km 表示，是設定訓練與比賽目標的核心指標。", formula: "公式", formulaText: "配速(min/km) = 完成時間(分鐘) ÷ 距離(km)。速度(km/h) = 距離 ÷ 時間(小時) = 60 ÷ 配速。賽事預估 = 配速 × 賽事距離。", limitations: "限制", limitationsText: "預估假設配速恆定，但長距離後段常因疲勞下降；坡度、風阻與補給策略都會影響實際完賽時間。", interpretation: "解讀", interpretationText: "輕鬆跑配速通常比比賽配速慢 60–90 秒/km；節奏跑接近半馬配速；間歇則快於 5K 配速。", context: "脈絡", contextText: "配速應與心率區間、運動消耗一起看，用配速安排不同強度的訓練日。", example: "範例", exampleText: "5 公里、30 分鐘 → 配速 6:00 min/km、速度 10 km/h；以此配速全馬約 4:13:10。" ,
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "跑步訓練的下一步工具", premiumTitle: "PRO 跑步訓練包", premiumText: "解鎖訓練配速分區、賽事配速策略、間歇課表生成與配速趨勢追蹤報告。", feat1: "心率區間", feat2: "配速策略", feat3: "間歇", feat4: "趨勢",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代運動處方、運動醫學或專業教練建議。", relatedTools: "相關工具", relatedToolsText: "Max Heart Rate Calculator · Exercise Calories Calculator · Calorie Burn Calculator · TDEE Calculator", references: "參考資料", referencesText: "Riegel (1981) endurance prediction model; Daniels' Running Formula; IAAF/World Athletics standard race distances。",
    q1: "配速和速度有什麼不同？", a1: "配速是每公里花的時間（越小越快），速度是每小時跑的距離（越大越快），兩者互為倒數關係。",
    q2: "賽事預估準嗎？", a2: "短距離（5K/10K）較準；半馬與全馬因疲勞累積，實際常比等配速預估慢 5–15%。",
    q3: "輕鬆跑要多慢？", a3: "一般建議比目標比賽配速慢 60–90 秒/km，能輕鬆對話，用於建立有氧基礎。",
    q4: "怎麼提升配速？", a4: "結合長距離有氧、節奏跑與間歇訓練，並搭配恢復與營養，循序漸進避免受傷。",
    q5: "跑步機配速一樣嗎？", a5: "跑步機少了風阻，相同配速通常較省力；建議設 1% 坡度模擬戶外阻力。",
    q6: "這個工具能評估體能或傷病嗎？", a6: "不能。它只是教育用計算；若有心肺疾病或運動傷害，請先諮詢專業人員。",
  },
  en: {
    badge: "Health · Exercise Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Running Pace Calculator", subtitle: "Compute pace, speed, and predicted race times from distance and time",
    intro: "This calculator uses the distance you ran (km) and finish time (minutes) to compute per-kilometer pace (min/km) and speed (km/h), then predicts 1K, 5K, 10K, half, and full marathon times at the same pace to help set goals and training paces.",
    trustNoteLabel: "Note:", trustNote: "Race predictions assume constant pace; real races slow due to fatigue, terrain, and weather. The longer the distance, the larger the prediction error.",
    quickActionCard: "Quick Action Card", tryExample: "Create a pace example instantly", examplePreview: "Pace preview", examplePerson: "Distance", fillExample: "One-click standard example", previewActivePath: "Fill 10K example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter distance and time", examplesHelper: "Start with an example to understand pace and race predictions, then replace it with your own distance and finish time.",
    metric: "Metric (km/min)", imperial: "Imperial (mi/min)", exampleCards: "Example cards", baselineExample: "5 km · 30 min", activeExample: "10 km · 55 min", baselineExampleNote: "5 km / 30 min = 6:00 min/km", activeExampleNote: "10 km / 55 min = 5:30 min/km", flowDemo: "5 km", calculator: "Calculator",
    weight: "Distance (km)", minutes: "Finish time (minutes)", mode: "Race preset", modeFox: "Custom distance", modeTanaka: "5K (5 km)", modeGulati: "10K (10 km)", modeHalf: "Half (21.1 km)", modeFull: "Full (42.2 km)",
    resultCard: "Pace Result", unit: "min/km", primaryValue: "This pace", maintenanceTarget: "Speed", actionTarget: "5K predicted", estimatedTdee: "Race", maintenance: "km/h", fatLossTarget: "5K finish",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card race finish-time matrix", tdeeMatrixNote: "L7 uses six fixed cards to predict finish times for standard distances at the current pace. This is training guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn pace into an actionable training plan", conversionNote: "L9 values update from the pace: speed, race predictions, and a recovery hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current pace plan", dailyGap: "Speed (km/h)", weeklyTrend: "10K predicted", motivation: "Motivation Card", keepMomentum: "Move from a single pace to steady progress",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's pace home", journeyHint: "Compare paces across training days to see progress; pair with heart-rate zones to plan easy runs and tempo runs.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use Max Heart Rate to match pace to heart-rate zones", nextActionItem2: "Use Exercise Calories to estimate running burn", nextActionItem3: "Use TDEE to plan post-training calorie intake",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Pace → Race prediction → Heart-rate zones → Burn", bmrStep: "Pace", deficitStep: "Race prediction", trendStep: "HR zones", mealStep: "Burn / fuel",
    knowledge: "Knowledge", knowledgeTitle: "What pace means in the Health universe", definition: "Definition", definitionText: "Pace is the time it takes to run each kilometer, usually expressed in min/km; it is the core metric for setting training and race goals.", formula: "Formula", formulaText: "Pace(min/km) = time(minutes) ÷ distance(km). Speed(km/h) = distance ÷ time(hours) = 60 ÷ pace. Race prediction = pace × race distance.", limitations: "Limitations", limitationsText: "Predictions assume constant pace, but the back half of long races usually slows from fatigue; gradient, wind, and fueling all affect real finish times.", interpretation: "Interpretation", interpretationText: "Easy-run pace is usually 60–90 sec/km slower than race pace; tempo runs approach half-marathon pace; intervals are faster than 5K pace.", context: "Context", contextText: "Pace should be viewed with heart-rate zones and exercise burn, using it to plan training days of different intensities.", example: "Example", exampleText: "5 km, 30 min → pace 6:00 min/km, speed 10 km/h; at this pace a marathon is about 4:13:10." ,
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for running training", premiumTitle: "PRO Running Training Pack", premiumText: "Unlock training pace zones, race pacing strategy, interval workout generation, and pace trend tracking reports.", feat1: "Zones", feat2: "Strategy", feat3: "Intervals", feat4: "Trends",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace exercise prescription, sports medicine, or professional coaching advice.", relatedTools: "Related Tools", relatedToolsText: "Max Heart Rate Calculator · Exercise Calories Calculator · Calorie Burn Calculator · TDEE Calculator", references: "References", referencesText: "Riegel (1981) endurance prediction model; Daniels' Running Formula; IAAF/World Athletics standard race distances.",
    q1: "What's the difference between pace and speed?", a1: "Pace is the time per kilometer (smaller is faster); speed is distance per hour (larger is faster). They are reciprocals of each other.",
    q2: "Are race predictions accurate?", a2: "Short distances (5K/10K) are fairly accurate; half and full marathons usually run 5–15% slower than an equal-pace prediction due to accumulated fatigue.",
    q3: "How slow should easy runs be?", a3: "Usually 60–90 sec/km slower than goal race pace, easy enough to talk, to build an aerobic base.",
    q4: "How do I improve pace?", a4: "Combine long aerobic runs, tempo runs, and intervals with recovery and nutrition, progressing gradually to avoid injury.",
    q5: "Is treadmill pace the same?", a5: "A treadmill removes wind resistance, so the same pace usually feels easier; set a 1% incline to simulate outdoor resistance.",
    q6: "Can this tool assess fitness or injury?", a6: "No. It is an educational calculation; consult professionals for cardiopulmonary disease or running injuries.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function RunningPaceCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [distance, setDistance] = useState("5");
  const [minutes, setMinutes] = useState("30");
  const [mode, setMode] = useState<RaceMode>("free");
  const t = ui[lang];

  const result = useMemo(() => {
    const freeDist = Number(distance);
    const time = Number(minutes);
    const dist = distanceFor(mode, freeDist);
    if (dist <= 0 || time <= 0) return null;
    const pace = time / dist; // min/km
    const speed = 60 / pace; // km/h
    const fiveK = pace * 5;
    const tenK = pace * 10;
    return { pace, speed, fiveK, tenK, dist };
  }, [distance, minutes, mode]);

  const paceDisplay = result ? paceLabel(result.pace) : "—";
  const speedDisplay = result ? fmt(result.speed, 1) : "—";
  const fiveKDisplay = result ? timeLabel(result.fiveK) : "—";
  const tenKDisplay = result ? timeLabel(result.tenK) : "—";

  function fillStandard() { setUnit("metric"); setDistance("5"); setMinutes("30"); setMode("free"); }
  function fillTenK() { setUnit("metric"); setDistance("10"); setMinutes("55"); setMode("10k"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{paceDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result ? fmt(result.dist, 1) : "—"} km</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.minutes}</div><div className="font-black">{minutes}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.maintenance}</div><div className="font-black">{speedDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillTenK} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">6:00</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillTenK} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">5:30</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold disabled:bg-slate-100" value={mode === "free" ? distance : fmt(distanceFor(mode, Number(distance)), 2)} disabled={mode !== "free"} onChange={(e) => setDistance(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.minutes}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.mode}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as RaceMode)}><option value="free">{t.modeFox}</option><option value="5k">{t.modeTanaka}</option><option value="10k">{t.modeGulati}</option><option value="half">{t.modeHalf}</option><option value="full">{t.modeFull}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{paceDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{result ? fmt(result.dist, 1) : "—"} km</div><div className="mt-1 text-xs text-slate-300">{minutes} min</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{speedDisplay}</p><p className="text-sm font-bold text-blue-700">km/h</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fiveKDisplay}</p><p className="text-sm font-bold text-emerald-700">5K</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">10K</div><div className="mt-1 text-xs font-black uppercase text-orange-700">10K finish</div><p className="mt-2 text-3xl font-black text-orange-950">{tenKDisplay}</p><p className="text-sm font-bold text-orange-700">10K</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.dist} km</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{result ? timeLabel(result.pace * item.dist) : "—"}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="pace-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.unit}</div><div className="mt-1 text-3xl font-black">{paceDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{speedDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tenKDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Pace", note: t.bmrStep }, { label: "Predict", note: t.deficitStep }, { label: "HR Zones", note: t.trendStep }, { label: "Burn", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="pace-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
