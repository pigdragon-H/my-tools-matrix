// @profile B — Calculator-YMYL gold tool · WorkingHoursCalculator
// 17 層金模板對標 MacroCalculator · category=legal · 工時計算機
import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: "zh" | "en") => v[lang];
const fmt = (v: number, d = 0) =>
  isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

type HourMode = "weekly" | "monthly" | "overtime";

// 勞基法基準
const NORMAL_WEEK = 40; // 正常工時/週
const OT_MONTH_CAP = 46; // 每月加班上限
const NORMAL_DAY = 8; // 正常工時/日

type Band = { key: string; range: LocalText; label: LocalText; desc: LocalText };

export default function WorkingHoursCalculator() {
  const { lang } = useLanguage();

  const ui = {
    zh: {
      heroTag: "勞動法令 · 工時試算",
      title: "工時計算機",
      subtitle: "計算你的週工時、月工時與加班時數，確認是否超過勞基法上限。",
      trustTitle: "依勞動基準法工時規定",
      trustBody:
        "本工具依勞動基準法之正常工時（每週 40 小時、每日 8 小時）與每月加班上限 46 小時為基準，協助勞工檢視工時是否合規。試算僅供參考，實際適用請依主管機關函釋。",
      quickTitle: "30 秒上手範例",
      quickBody: "點下方任一範例，立即帶入典型工時情境，看看是否超時。",
      guideTitle: "填寫指引",
      guideBody: "選擇計算模式，輸入每日工時與天數，系統自動換算週／月工時與加班時數。",
      modeLabel: "計算模式",
      weekly: "週工時",
      monthly: "月工時",
      overtime: "加班檢核",
      dailyLabel: "每日工時（小時）",
      daysLabel: "每週工作天數",
      weeksLabel: "本月週數",
      calcTitle: "輸入工時",
      resultTitle: "工時檢核結果",
      statusPass: "工時合規 ✅",
      statusFail: "超過上限 ⚠️",
      totalLabel: "總工時",
      otLabel: "加班時數",
      capLabel: "法定上限",
      hourUnit: "小時",
      intelTitle: "結果解讀",
      intelBody: "超過正常工時部分即為加班，須依勞基法加成計酬；每月加班不得超過 46 小時（經協商最多 54 小時）。",
      cmpTitle: "情境比較",
      cmpA: "範例：每日 10 小時 ×5 天",
      cmpB: "範例：每日 12 小時 ×6 天",
      emoUpper: "工時超標，健康與權益同受影響",
      emoLower: "立即檢核，守住合理工時",
      pathTitle: "下一步建議",
      pathBody: "若工時超標，可與雇主協商調整或向勞工局反映，要求依法給付加班費。",
      knowTitle: "工時小知識",
      faqTitle: "常見問題",
      premiumTitle: "進階工時報告（PRO）",
      premiumBody: "解鎖變形工時、輪班間隔檢核與加班費自動換算。",
      refTitle: "相關法規與資源",
      fillA: "範例：每日 10 小時 ×5 天",
      fillB: "範例：每日 12 小時 ×6 天",
      q1: "每週工時上限是多少？",
      a1: "正常工時每週不得超過 40 小時，每日不得超過 8 小時。",
      q2: "加班有上限嗎？",
      a2: "一般每月加班不得超過 46 小時，經工會或勞資協商可放寬至 54 小時。",
      q3: "加班費怎麼算？",
      a3: "前 2 小時加給 1/3 以上，超過 2 小時加給 2/3 以上，例假日另計。",
      footer: "資料依勞動基準法 · 僅供參考",
    },
    en: {
      heroTag: "Labor Law · Hours Check",
      title: "Working Hours Calculator",
      subtitle: "Compute your weekly, monthly, and overtime hours to check against the legal limits.",
      trustTitle: "Based on the Labor Standards Act",
      trustBody:
        "This tool uses the statutory normal hours (40/week, 8/day) and the monthly overtime cap of 46 hours as the baseline to help employees review hour compliance. Results are for reference; actual application follows the competent authority's interpretation.",
      quickTitle: "30-Second Example",
      quickBody: "Click any example below to load a typical scenario and see if you exceed the limit.",
      guideTitle: "How to Fill",
      guideBody: "Pick a mode and enter daily hours and days; the system converts weekly/monthly hours and overtime automatically.",
      modeLabel: "Mode",
      weekly: "Weekly",
      monthly: "Monthly",
      overtime: "Overtime",
      dailyLabel: "Daily Hours",
      daysLabel: "Work Days / Week",
      weeksLabel: "Weeks This Month",
      calcTitle: "Enter Hours",
      resultTitle: "Hours Check Result",
      statusPass: "Compliant ✅",
      statusFail: "Over the limit ⚠️",
      totalLabel: "Total Hours",
      otLabel: "Overtime",
      capLabel: "Legal Cap",
      hourUnit: "hrs",
      intelTitle: "Result Interpretation",
      intelBody: "Hours above normal count as overtime and must be paid at a premium; monthly overtime cannot exceed 46 hours (54 with agreement).",
      cmpTitle: "Scenario Comparison",
      cmpA: "Example: 10h × 5 days",
      cmpB: "Example: 12h × 6 days",
      emoUpper: "Excess hours harm both health and rights",
      emoLower: "Check now and keep hours reasonable",
      pathTitle: "Next Steps",
      pathBody: "If hours exceed the cap, negotiate with the employer or report to the labor bureau to claim lawful overtime pay.",
      knowTitle: "Working Hours Facts",
      faqTitle: "FAQ",
      premiumTitle: "Advanced Hours Report (PRO)",
      premiumBody: "Unlock flexible-hours schemes, shift-interval checks, and automatic overtime conversion.",
      refTitle: "Related Laws & Resources",
      fillA: "Example: 10h × 5 days",
      fillB: "Example: 12h × 6 days",
      q1: "What is the weekly hours cap?",
      a1: "Normal hours cannot exceed 40 per week and 8 per day.",
      q2: "Is there an overtime cap?",
      a2: "Monthly overtime generally cannot exceed 46 hours, extendable to 54 with union or labor-management agreement.",
      q3: "How is overtime pay calculated?",
      a3: "First 2 hours at +1/3 or more, beyond 2 hours at +2/3 or more; rest days are calculated separately.",
      footer: "Based on the Labor Standards Act · for reference only",
    },
  } as const;

  const t = ui[lang];

  const bands: Band[] = [
    { key: "normal", range: { zh: "≤40 小時/週", en: "≤40 hrs/wk" }, label: { zh: "正常工時", en: "Normal" }, desc: { zh: "每週上限 40 小時、每日 8 小時", en: "40/week, 8/day cap" } },
    { key: "ot", range: { zh: "≤46 小時/月", en: "≤46 hrs/mo" }, label: { zh: "加班上限", en: "Overtime Cap" }, desc: { zh: "每月加班一般不得逾 46 小時", en: "Monthly overtime ≤46 hrs" } },
    { key: "ext", range: { zh: "≤54 小時/月", en: "≤54 hrs/mo" }, label: { zh: "協商上限", en: "Agreed Cap" }, desc: { zh: "經協商最高 54 小時", en: "Up to 54 with agreement" } },
  ];

  const faqKeys = [
    ["q1", "a1"],
    ["q2", "a2"],
    ["q3", "a3"],
  ] as const;

  const [mode, setMode] = useState<HourMode>("weekly");
  const [daily, setDaily] = useState<number>(8);
  const [days, setDays] = useState<number>(5);
  const [weeks, setWeeks] = useState<number>(4);

  const result = useMemo(() => {
    const weekHours = daily * days;
    if (mode === "weekly") {
      const ot = Math.max(0, weekHours - NORMAL_WEEK);
      return { total: weekHours, ot, cap: NORMAL_WEEK, pass: weekHours <= NORMAL_WEEK };
    }
    const monthHours = weekHours * weeks;
    const normalMonth = NORMAL_WEEK * weeks;
    const ot = Math.max(0, monthHours - normalMonth);
    if (mode === "monthly") {
      return { total: monthHours, ot, cap: normalMonth + OT_MONTH_CAP, pass: monthHours <= normalMonth + OT_MONTH_CAP };
    }
    // overtime mode
    return { total: ot, ot, cap: OT_MONTH_CAP, pass: ot <= OT_MONTH_CAP };
  }, [mode, daily, days, weeks]);

  const fillA = () => {
    setMode("weekly");
    setDaily(10);
    setDays(5);
  };
  const fillB = () => {
    setMode("monthly");
    setDaily(12);
    setDays(6);
    setWeeks(4);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-slate-800">
      {/* L1-Hero */}
      <header className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_120%_at_0%_0%,#f97316_0%,#b45309_55%,#0f172a_100%)] px-8 py-14 text-white shadow-2xl">
        <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-black tracking-wide">{t.heroTag}</span>
        <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-2xl text-lg font-medium text-amber-100">{t.subtitle}</p>
      </header>

      {/* L2-TrustIntro */}
      <section className="mt-8 rounded-[2rem] border border-amber-100 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-amber-900">{t.trustTitle}</h2>
        <p className="mt-3 leading-relaxed text-slate-600">{t.trustBody}</p>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mt-6 rounded-[2rem] bg-amber-50 p-8">
        <h2 className="text-xl font-black text-amber-900">{t.quickTitle}</h2>
        <p className="mt-2 text-slate-600">{t.quickBody}</p>
      </section>

      {/* L4-InputGuidance */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.guideTitle}</h2>
        <p className="mt-2 text-slate-600">{t.guideBody}</p>
      </section>

      {/* L5-CalculatorInput + L8-ScenarioComparison（雙情境範例卡寄生側欄） */}
      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-[2rem] border border-amber-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-amber-900">{t.calcTitle}</h2>
          <div className="mt-5">
            <label className="text-sm font-black text-slate-700">{t.modeLabel}</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["weekly", "monthly", "overtime"] as HourMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                    mode === m ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {m === "weekly" ? t.weekly : m === "monthly" ? t.monthly : t.overtime}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <label className="text-sm font-black text-slate-700">{t.dailyLabel}</label>
            <input
              type="number"
              value={daily}
              onChange={(e) => setDaily(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div className="mt-5">
            <label className="text-sm font-black text-slate-700">{t.daysLabel}</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>
          {mode !== "weekly" && (
            <div className="mt-5">
              <label className="text-sm font-black text-slate-700">{t.weeksLabel}</label>
              <input
                type="number"
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="hidden w-px bg-slate-200 md:block" />

        {/* L8-ScenarioComparison */}
        <div className="rounded-[2rem] border border-amber-100 bg-amber-50/60 p-8">
          <h3 className="text-lg font-black text-amber-900">{t.cmpTitle}</h3>
          <button
            onClick={fillA}
            className="mt-4 w-full rounded-[2rem] border border-amber-200 bg-white p-4 text-left transition hover:shadow-md"
          >
            <p className="text-sm font-black text-amber-700">{t.cmpA}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{t.fillA}</p>
          </button>
          <button
            onClick={fillB}
            className="mt-3 w-full rounded-[2rem] border border-amber-200 bg-white p-4 text-left transition hover:shadow-md"
          >
            <p className="text-sm font-black text-amber-700">{t.cmpB}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{t.fillB}</p>
          </button>
        </div>
      </section>

      {/* L6-PrimaryResult */}
      <section className="mt-6 rounded-[2rem] bg-[radial-gradient(120%_120%_at_100%_0%,#f97316_0%,#b45309_60%,#0f172a_100%)] p-8 text-white shadow-xl">
        <h2 className="text-xl font-black text-amber-100">{t.resultTitle}</h2>
        <p className="mt-3 text-4xl font-black">{result.pass ? t.statusPass : t.statusFail}</p>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-amber-200">{t.totalLabel}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.total)}</p>
            <p className="text-xs font-bold text-amber-200">{t.hourUnit}</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-amber-200">{t.otLabel}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.ot)}</p>
            <p className="text-xs font-bold text-amber-200">{t.hourUnit}</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-amber-200">{t.capLabel}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.cap)}</p>
            <p className="text-xs font-bold text-amber-200">{t.hourUnit}</p>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="working-hours-result-intelligence" adFormat="horizontal" className="my-2" />

      {/* L7-ResultIntelligence */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.intelTitle}</h2>
        <p className="mt-2 leading-relaxed text-slate-600">{t.intelBody}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {bands.map((b) => (
            <div key={b.key} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-black text-amber-700">{l(b.range, lang)}</p>
              <p className="mt-1 text-sm font-black text-slate-800">{l(b.label, lang)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{l(b.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-amber-600 to-orange-800 p-8 text-white shadow-xl">
        <h2 className="text-2xl font-black">{t.emoUpper}</h2>
        {/* L10-EmotionConversionLower */}
        <p className="mt-2 text-lg font-medium text-amber-100">{t.emoLower}</p>
      </section>

      {/* L11-DecisionPath */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.pathTitle}</h2>
        <p className="mt-2 leading-relaxed text-slate-600">{t.pathBody}</p>
      </section>

      {/* L12-Knowledge */}
      <section className="mt-6 rounded-[2rem] bg-slate-50 p-8">
        <h2 className="text-xl font-black text-slate-900">{t.knowTitle}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {bands.map((b) => (
            <div key={b.key} className="rounded-[2rem] bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-800">{l(b.label, lang)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{l(b.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L13-FAQ */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.faqTitle}</h2>
        <div className="mt-4 space-y-4">
          {faqKeys.map(([q, a]) => (
            <div key={q} className="rounded-[2rem] bg-slate-50 p-5">
              <p className="font-black text-slate-800">{t[q]}</p>
              <p className="mt-1 text-sm text-slate-600">{t[a]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L14-FAQAfterAdSlot */}
      <AdSlot slot="working-hours-faq" position="inline" />

      {/* L15-AffiliateResources */}
      <section className="mt-6 rounded-[2rem] bg-amber-50 p-8">
        <h2 className="text-xl font-black text-amber-900">{t.refTitle}</h2>
      </section>

      {/* L16-PremiumGate */}
      <PremiumGate plan="PRO">
        <section className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-8">
          <h2 className="text-xl font-black text-amber-900">{t.premiumTitle}</h2>
          <p className="mt-2 text-amber-800">{t.premiumBody}</p>
        </section>
      </PremiumGate>

      {/* L17-TrustRelatedReferences */}
      <footer className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-6 text-center text-xs text-slate-400">
        {t.footer}
      </footer>
    </div>
  );
}
