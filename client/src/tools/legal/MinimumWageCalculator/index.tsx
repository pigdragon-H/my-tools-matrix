// @profile B — Calculator-YMYL gold tool · MinimumWageCalculator
// 17 層金模板對標 MacroCalculator · category=legal · 最低工資計算機
import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: "zh" | "en") => v[lang];
const fmt = (v: number, d = 0) =>
  isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

type CheckMode = "monthly" | "hourly" | "shortfall";

// 2024 台灣基本工資（勞動部公告）
const MIN_MONTHLY = 27470; // 月薪
const MIN_HOURLY = 183; // 時薪
const STD_MONTH_HOURS = 240; // 月法定工時基準 (40hr/週 × 約6週/月折算常用 240)

type Band = { key: string; range: LocalText; label: LocalText; desc: LocalText };

export default function MinimumWageCalculator() {
  const { lang } = useLanguage();

  const ui = {
    zh: {
      heroTag: "勞動法令 · 合規試算",
      title: "最低工資計算機",
      subtitle: "比對你的月薪、時薪是否達到法定基本工資門檻，並計算補足差額。",
      trustTitle: "依據勞動部公告基本工資",
      trustBody:
        "本工具以勞動部公告之最新基本工資（月薪 27,470 元、時薪 183 元）為基準，協助勞工與雇主快速確認薪資是否合規，並計算需補足的差額。試算結果僅供參考，正式爭議請以主管機關函釋為準。",
      quickTitle: "30 秒上手範例",
      quickBody: "點下方任一範例，立即帶入典型情境，看看薪資是否達標。",
      guideTitle: "填寫指引",
      guideBody: "選擇比對模式後，輸入你的實際薪資數字。月薪模式比對 27,470 元、時薪模式比對 183 元。",
      modeLabel: "比對模式",
      monthly: "月薪比對",
      hourly: "時薪比對",
      shortfall: "差額補足",
      wageLabel: "你的薪資",
      hoursLabel: "月工時（差額模式用）",
      calcTitle: "輸入薪資",
      resultTitle: "合規判定結果",
      statusPass: "已達基本工資 ✅",
      statusFail: "未達基本工資 ⚠️",
      gapLabel: "差額",
      legalLabel: "法定基準",
      yourLabel: "你的數字",
      monthUnit: "元/月",
      hourUnit: "元/時",
      intelTitle: "結果解讀",
      intelBody: "未達標時，雇主應補足至法定基本工資；若以時薪計，需確認加班與例假是否另計。",
      exampleCards: "範例卡",
      baselineExample: "月薪未達標情境",
      baselineExampleValue: "26,000 元/月",
      baselineExampleNote: "比對月基本工資 27,470 元 · 短少 1,470 元待補足",
      activeExample: "時薪未達標情境",
      activeExampleValue: "170 元/時",
      activeExampleNote: "比對時基本工資 183 元 · 每小時短少 13 元",
      emoUpper: "薪資沒給足，可能違反勞基法",
      emoLower: "立即確認，保障你的權益",
      pathTitle: "下一步建議",
      pathBody: "若試算顯示未達標，可向當地勞工局申訴或要求雇主補足差額。",
      knowTitle: "基本工資小知識",
      knowDefT: "定義", knowDefB: "基本工資是法律規定雇主給付勞工的最低報酬下限，分為月薪與時薪兩種基準，全時與部分工時皆適用。",
      knowLawT: "法源", knowLawB: "依《勞動基準法》第21條，工資由勞雇雙方議定，但不得低於基本工資；基本工資由基本工資審議委員會擬訂報行政院核定。",
      knowCalcT: "如何認定", knowCalcB: "月薪制比對月基本工資 27,470 元；時薪制比對時基本工資 183 元。兩者為各自下限，雇主須同時符合適用標準。",
      knowOTT: "加班與例假", knowOTB: "基本工資為「正常工時」報酬，加班費須另依勞基法第24條加成計算，不得併入基本工資稀釋。",
      knowPenaltyT: "未達標罰則", knowPenaltyB: "雇主給付低於基本工資，依勞基法第79條可處 2 萬至 100 萬元罰鍰，並應補足差額。",
      knowTipT: "實務提醒", knowTipB: "伙食津貼、全勤獎金等是否計入工資，需依其性質判斷；經常性給與多應併計，建議保留薪資明細備查。",
      faqTitle: "常見問題",
      premiumTitle: "進階合規報告（PRO）",
      premiumBody: "解鎖多年度基本工資對照、加班費自動換算與申訴信範本。",
      refTitle: "相關法規與資源",

      q1: "基本工資多久調整一次？",
      a1: "通常每年由基本工資審議委員會審議，多在年初生效。",
      q2: "時薪與月薪可以擇低嗎？",
      a2: "不行，兩者皆為下限，雇主須同時符合適用的標準。",
      q3: "未達基本工資怎麼辦？",
      a3: "可向當地勞工局申訴，雇主須補足差額並可能受罰。",
    },
    en: {
      heroTag: "Labor Law · Compliance Check",
      title: "Minimum Wage Calculator",
      subtitle: "Check whether your monthly or hourly pay meets the statutory minimum wage and compute any shortfall.",
      trustTitle: "Based on the Official Minimum Wage",
      trustBody:
        "This tool uses the latest official minimum wage (NT$27,470/month, NT$183/hour) as the baseline to help employees and employers quickly verify pay compliance and compute the shortfall. Results are for reference only; formal disputes should follow the competent authority's interpretation.",
      quickTitle: "30-Second Example",
      quickBody: "Click any example below to load a typical scenario and see if the pay meets the threshold.",
      guideTitle: "How to Fill",
      guideBody: "Pick a comparison mode, then enter your actual pay. Monthly mode compares 27,470; hourly mode compares 183.",
      modeLabel: "Comparison Mode",
      monthly: "Monthly",
      hourly: "Hourly",
      shortfall: "Shortfall",
      wageLabel: "Your Pay",
      hoursLabel: "Monthly Hours (for shortfall)",
      calcTitle: "Enter Pay",
      resultTitle: "Compliance Result",
      statusPass: "Meets minimum wage ✅",
      statusFail: "Below minimum wage ⚠️",
      gapLabel: "Shortfall",
      legalLabel: "Statutory Baseline",
      yourLabel: "Your Figure",
      monthUnit: "/month",
      hourUnit: "/hour",
      intelTitle: "Result Interpretation",
      intelBody: "If below the threshold, the employer must top up to the statutory minimum; for hourly pay, verify overtime and rest-day pay separately.",
      exampleCards: "Example cards",
      baselineExample: "Monthly below threshold",
      baselineExampleValue: "26,000/month",
      baselineExampleNote: "vs monthly minimum 27,470 · short by 1,470 to top up",
      activeExample: "Hourly below threshold",
      activeExampleValue: "170/hour",
      activeExampleNote: "vs hourly minimum 183 · short by 13 per hour",
      emoUpper: "Underpaying may violate labor law",
      emoLower: "Check now and protect your rights",
      pathTitle: "Next Steps",
      pathBody: "If the result shows non-compliance, you may file a complaint with the local labor bureau or request a top-up.",
      knowTitle: "Minimum Wage Facts",
      knowDefT: "Definition", knowDefB: "The minimum wage is the legal floor an employer must pay, split into monthly and hourly baselines, applicable to both full-time and part-time workers.",
      knowLawT: "Legal Basis", knowLawB: "Under Article 21 of the Labor Standards Act, wages are agreed by both parties but may not fall below the minimum wage, which is set by the wage committee and approved by the Executive Yuan.",
      knowCalcT: "How It's Judged", knowCalcB: "Monthly pay is compared to NT$27,470; hourly pay to NT$183. Each is its own floor, and employers must meet the applicable standard.",
      knowOTT: "Overtime & Rest Days", knowOTB: "The minimum wage covers normal working hours; overtime must be calculated separately under Article 24 and cannot be diluted into the base wage.",
      knowPenaltyT: "Penalties", knowPenaltyB: "Paying below the minimum wage carries a fine of NT$20,000–1,000,000 under Article 79, plus the obligation to top up the shortfall.",
      knowTipT: "Practical Tips", knowTipB: "Whether meal or attendance allowances count as wages depends on their nature; recurring payments usually count. Keep payslips for reference.",
      faqTitle: "FAQ",
      premiumTitle: "Advanced Compliance Report (PRO)",
      premiumBody: "Unlock multi-year minimum wage tables, automatic overtime conversion, and complaint letter templates.",
      refTitle: "Related Laws & Resources",

      q1: "How often is the minimum wage adjusted?",
      a1: "Usually reviewed yearly by the wage committee, typically effective at the start of the year.",
      q2: "Can the employer pick the lower of hourly/monthly?",
      a2: "No. Both are floors; the employer must meet the applicable standard.",
      q3: "What if pay is below minimum?",
      a3: "File a complaint with the local labor bureau; the employer must top up and may be fined.",
    },
  } as const;

  const t = ui[lang];

  const bands: Band[] = [
    { key: "monthly", range: { zh: "27,470 元/月", en: "27,470 /mo" }, label: { zh: "月薪基準", en: "Monthly Base" }, desc: { zh: "全時受僱者月薪不得低於此數", en: "Full-time monthly pay floor" } },
    { key: "hourly", range: { zh: "183 元/時", en: "183 /hr" }, label: { zh: "時薪基準", en: "Hourly Base" }, desc: { zh: "部分工時時薪不得低於此數", en: "Part-time hourly pay floor" } },
    { key: "overtime", range: { zh: "1.34×↑", en: "1.34×↑" }, label: { zh: "加班加成", en: "Overtime" }, desc: { zh: "加班時數須另依勞基法加成", en: "Overtime adds onto base pay" } },
  ];

  const faqKeys = [
    ["q1", "a1"],
    ["q2", "a2"],
    ["q3", "a3"],
  ] as const;

  const [mode, setMode] = useState<CheckMode>("monthly");
  const [wage, setWage] = useState<number>(27470);
  const [hours, setHours] = useState<number>(STD_MONTH_HOURS);

  const result = useMemo(() => {
    if (mode === "monthly") {
      const base = MIN_MONTHLY;
      const gap = Math.max(0, base - wage);
      return { base, your: wage, gap, pass: wage >= base, unit: t.monthUnit };
    }
    if (mode === "hourly") {
      const base = MIN_HOURLY;
      const gap = Math.max(0, base - wage);
      return { base, your: wage, gap, pass: wage >= base, unit: t.hourUnit };
    }
    // shortfall: 以月薪換算實際時薪比對
    const effHourly = hours > 0 ? wage / hours : 0;
    const base = MIN_HOURLY;
    const gap = Math.max(0, (base - effHourly) * hours);
    return { base: base * hours, your: wage, gap, pass: effHourly >= base, unit: t.monthUnit };
  }, [mode, wage, hours, t.monthUnit, t.hourUnit]);

  const fillMonthly = () => {
    setMode("monthly");
    setWage(26000);
  };
  const fillHourly = () => {
    setMode("hourly");
    setWage(170);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-slate-800">
      {/* L1-Hero */}
      <header className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_120%_at_0%_0%,#0ea5e9_0%,#1e3a8a_55%,#0f172a_100%)] px-8 py-14 text-white shadow-2xl">
        <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-black tracking-wide">{t.heroTag}</span>
        <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-2xl text-lg font-medium text-sky-100">{t.subtitle}</p>
      </header>

      {/* L2-TrustIntro */}
      <section className="mt-8 rounded-[2rem] border border-sky-100 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-sky-900">{t.trustTitle}</h2>
        <p className="mt-3 leading-relaxed text-slate-600">{t.trustBody}</p>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mt-6 rounded-[2rem] bg-sky-50 p-8">
        <h2 className="text-xl font-black text-sky-900">{t.quickTitle}</h2>
        <p className="mt-2 text-slate-600">{t.quickBody}</p>
      </section>

      {/* L4-InputGuidance */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.guideTitle}</h2>
        <p className="mt-2 text-slate-600">{t.guideBody}</p>
      </section>

      {/* L5-CalculatorInput + L8-ScenarioComparison（雙情境範例卡寄生側欄） */}
      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-[2rem] border border-sky-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-sky-900">{t.calcTitle}</h2>
          <div className="mt-5">
            <label className="text-sm font-black text-slate-700">{t.modeLabel}</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["monthly", "hourly", "shortfall"] as CheckMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                    mode === m ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-700"
                  }`}
                >
                  {m === "monthly" ? t.monthly : m === "hourly" ? t.hourly : t.shortfall}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <label className="text-sm font-black text-slate-700">{t.wageLabel}</label>
            <input
              type="number"
              value={wage}
              onChange={(e) => setWage(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-sky-500 focus:outline-none"
            />
          </div>
          {mode === "shortfall" && (
            <div className="mt-5">
              <label className="text-sm font-black text-slate-700">{t.hoursLabel}</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-sky-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="hidden w-px bg-slate-200 md:block" />

        {/* L8-ScenarioComparison */}
        <div className="rounded-[2rem] border border-sky-100 bg-sky-50/60 p-8">
          <h3 className="text-lg font-black text-sky-900">{t.exampleCards}</h3>
          <div className="mt-4 space-y-3">
            <button
              onClick={fillMonthly}
              className="w-full rounded-2xl border border-sky-200 bg-white p-4 text-left transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-black text-sky-900">{t.baselineExample}</span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">{t.baselineExampleValue}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p>
            </button>
            <button
              onClick={fillHourly}
              className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-black text-amber-900">{t.activeExample}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{t.activeExampleValue}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p>
            </button>
          </div>
        </div>
      </section>

      {/* L6-PrimaryResult */}
      <section className="mt-6 rounded-[2rem] bg-[radial-gradient(120%_120%_at_100%_0%,#0ea5e9_0%,#1e3a8a_60%,#0f172a_100%)] p-8 text-white shadow-xl">
        <h2 className="text-xl font-black text-sky-100">{t.resultTitle}</h2>
        <p className="mt-3 text-4xl font-black">{result.pass ? t.statusPass : t.statusFail}</p>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-sky-200">{t.legalLabel}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.base)}</p>
            <p className="text-xs font-bold text-sky-200">{result.unit}</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-sky-200">{t.yourLabel}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.your)}</p>
            <p className="text-xs font-bold text-sky-200">{result.unit}</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-sky-200">{t.gapLabel}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.gap)}</p>
            <p className="text-xs font-bold text-sky-200">{result.unit}</p>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="minimum-wage-result-intelligence" adFormat="horizontal" className="my-2" />

      {/* L7-ResultIntelligence */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.intelTitle}</h2>
        <p className="mt-2 leading-relaxed text-slate-600">{t.intelBody}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {bands.map((b) => (
            <div key={b.key} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-black text-sky-700">{l(b.range, lang)}</p>
              <p className="mt-1 text-sm font-black text-slate-800">{l(b.label, lang)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{l(b.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-sky-600 to-blue-800 p-8 text-white shadow-xl">
        <h2 className="text-2xl font-black">{t.emoUpper}</h2>
        {/* L10-EmotionConversionLower */}
        <p className="mt-2 text-lg font-medium text-sky-100">{t.emoLower}</p>
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
          {[
            [t.knowDefT, t.knowDefB],
            [t.knowLawT, t.knowLawB],
            [t.knowCalcT, t.knowCalcB],
            [t.knowOTT, t.knowOTB],
            [t.knowPenaltyT, t.knowPenaltyB],
            [t.knowTipT, t.knowTipB],
          ].map(([h, b]) => (
            <div key={h} className="rounded-[2rem] bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-800">{h}</p>
              <p className="mt-1 text-xs leading-5 font-medium text-slate-500">{b}</p>
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
      <AdSlot slot="minimum-wage-faq" position="inline" />

      {/* L15-AffiliateResources */}
      <section className="mt-6 rounded-[2rem] bg-sky-50 p-8">
        <h2 className="text-xl font-black text-sky-900">{t.refTitle}</h2>
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
        {l({ zh: "資料依勞動部公告基本工資 · 僅供參考", en: "Based on official minimum wage · for reference only" }, lang)}
      </footer>
    </div>
  );
}
