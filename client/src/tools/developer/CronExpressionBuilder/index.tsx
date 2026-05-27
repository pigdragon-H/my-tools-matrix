import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };

const l = (value: LocalText, lang: Lang) => value[lang];

const ui = {
  zh: {
    badge: "開發者 · Cron 表達式 · Gold Tool",
    title: "Cron 表達式生成器・快速生成定時任務表達式",
    subtitle: "Cron 表達式生成器引導體驗",
    intro: "使用可視化界面生成 Cron 表達式，支持分鐘、小時、日期、月份、星期等字段，快速創建定時任務。",
    trustNoteLabel: "信任提醒：",
    trustNote: "Cron 表達式是 Linux 和 Unix 系統中定時任務的標準格式。正確的表達式確保任務按時執行。",
    quickActionCard: "快速範例卡",
    tryCommonExample: "試用常見 Cron 表達式範例",
    cronPreview: "表達式預覽",
    example: "範例",
    dailyExample: "每日執行",
    hourlyExample: "每小時執行",
    oneClickFillDailyExample: "一鍵填入每日執行範例",
    previewHourlyPath: "預覽每小時執行路徑",
    examplesCron: "範例 → Cron 生成器",
    selectOrBuild: "選擇或構建表達式",
    examplesHelper: "範例緊貼 Cron 生成器，讓開發者能快速開始。",
    exampleCards: "範例卡",
    hourlyPathDemo: "每小時執行示範",
    oneClickFillAllowed: "每天上午 9 點執行 · 可一鍵填入",
    dailyPathDescription: "每日執行 · 展示選擇 → 構建 → 驗證路徑",
    flowDemo: "流程示範",
    builder: "Cron 生成器",
    minute: "分鐘",
    hour: "小時",
    dayOfMonth: "日期",
    month: "月份",
    dayOfWeek: "星期",
    resultCard: "結果卡",
    enterValidCron: "請輸入有效的 Cron 表達式",
    status: "狀態",
    cronExpression: "Cron 表達式",
    nextRun: "下次執行",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretCronBeforeActing: "行動前先理解 Cron 表達式",
    knowledge: "知識",
    cronMeaning: "Cron 表達式在開發宇宙中的意義",
    definition: "定義",
    definitionText: "Cron 表達式是用於定時執行任務的文本字符串。由 5 個字段組成：分鐘、小時、日期、月份、星期。",
    limitations: "限制",
    limitationsText: "不同系統的 Cron 實現略有不同。某些字段組合可能不支持。複雜邏輯需要多個表達式。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "JSON 驗證器、正則表達式測試器、API 回應格式化等工具。",
    formula: "最佳實踐",
    formulaText: "使用簡單清晰的表達式、添加註釋、定期測試、監控執行日誌。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "Cron 表達式是定時任務的標準格式。正確的表達式確保任務按時執行，提高系統可靠性。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "Linux Cron 文檔、Crontab 參考、Quartz Scheduler。",
    recommendedProducts: "配合 Cron 開發使用的工具",
  },
  en: {
    badge: "Developer · Cron Expression · Gold Tool",
    title: "Cron Expression Builder · Quickly Generate Scheduled Task Expressions",
    subtitle: "Cron Expression Builder guided experience",
    intro: "Use visual interface to generate Cron expressions, support minute, hour, date, month, weekday fields, quickly create scheduled tasks.",
    trustNoteLabel: "Trust note:",
    trustNote: "Cron expression is the standard format for scheduled tasks in Linux and Unix systems. Correct expression ensures tasks execute on time.",
    quickActionCard: "Quick Action Card",
    tryCommonExample: "Try a common Cron expression example",
    cronPreview: "Expression preview",
    example: "Example",
    dailyExample: "Daily execution",
    hourlyExample: "Hourly execution",
    oneClickFillDailyExample: "One-click fill daily execution example",
    previewHourlyPath: "Preview hourly execution path",
    examplesCron: "Examples → Cron Builder",
    selectOrBuild: "Select or build expression",
    examplesHelper: "Examples stay close to Cron builder so developers can start fast.",
    exampleCards: "Example cards",
    hourlyPathDemo: "Hourly execution demo",
    oneClickFillAllowed: "Execute at 9 AM daily · one-click fill allowed",
    dailyPathDescription: "Daily execution · shows Select → Build → Verify path",
    flowDemo: "Flow demo",
    builder: "Cron Builder",
    minute: "Minute",
    hour: "Hour",
    dayOfMonth: "Day of Month",
    month: "Month",
    dayOfWeek: "Day of Week",
    resultCard: "Result Card",
    enterValidCron: "Enter valid Cron expression",
    status: "Status",
    cronExpression: "Cron Expression",
    nextRun: "Next Run",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretCronBeforeActing: "Interpret Cron expression before acting",
    knowledge: "Knowledge",
    cronMeaning: "What Cron Expression means in the Developer universe",
    definition: "Definition",
    definitionText: "Cron expression is a text string for scheduling task execution. Consists of 5 fields: minute, hour, date, month, weekday.",
    limitations: "Limitations",
    limitationsText: "Different systems have slightly different Cron implementations. Some field combinations may not be supported. Complex logic requires multiple expressions.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "JSON Validator, Regex Tester, API Response Formatter, and other tools.",
    formula: "Best Practices",
    formulaText: "Use simple clear expressions, add comments, test regularly, monitor execution logs.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "Cron expression is the standard format for scheduled tasks. Correct expression ensures tasks execute on time, improves system reliability.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "Linux Cron Documentation, Crontab Reference, Quartz Scheduler.",
    recommendedProducts: "Tools to use with Cron development",
  },
} as const;

export default function CronExpressionBuilder() {
  const { lang, setLang } = useLanguage();
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("9");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  const t = ui[lang];
  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  function fillDailyExample() {
    setMinute("0");
    setHour("9");
    setDayOfMonth("*");
    setMonth("*");
    setDayOfWeek("*");
  }

  function fillHourlyExample() {
    setMinute("0");
    setHour("*");
    setDayOfMonth("*");
    setMonth("*");
    setDayOfWeek("*");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50">
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 中</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 EN</span>
            </button>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-blue-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <strong>{t.trustNoteLabel}</strong> {t.trustNote}
              </div>
            </section>
            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p>
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.cronPreview}</div>
                  <div className="text-2xl font-black">0 9 * * *</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.dailyExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "時間" : "Time"}</div><div className="mt-1 text-lg font-black">09:00</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "頻率" : "Frequency"}</div><div className="mt-1 text-lg font-black">{lang === "zh" ? "每日" : "Daily"}</div></div>
              </div>
              <button onClick={fillDailyExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">{t.oneClickFillDailyExample}</button>
              <button onClick={fillHourlyExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewHourlyPath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCron}</p>
              <h2 className="mt-2 text-3xl font-black">{t.selectOrBuild}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillDailyExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.dailyExample}</span><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">0 9 * * *</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillHourlyExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.hourlyExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.dailyPathDescription}</p>
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.builder}</h3>
                <div className="mt-4 grid gap-4">
                  <label className="block text-sm font-black text-slate-700">{t.minute}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="0-59 or *" /></label>
                  <label className="block text-sm font-black text-slate-700">{t.hour}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={hour} onChange={(e) => setHour(e.target.value)} placeholder="0-23 or *" /></label>
                  <label className="block text-sm font-black text-slate-700">{t.dayOfMonth}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} placeholder="1-31 or *" /></label>
                  <label className="block text-sm font-black text-slate-700">{t.month}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="1-12 or *" /></label>
                  <label className="block text-sm font-black text-slate-700">{t.dayOfWeek}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} placeholder="0-6 or *" /></label>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="h-5 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400" />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4">
                  <div className="text-2xl font-black tracking-tight text-slate-950">{t.cronExpression}</div>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-sm text-green-400 font-mono">{cronExpression}</pre>
                  </div>
                </div>
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretCronBeforeActing}</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black">{lang === "zh" ? "* 表示任意值" : "* means any value"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "例如 * 在小時字段表示每小時。" : "E.g., * in hour field means every hour."}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black">{lang === "zh" ? "數字表示具體值" : "Numbers mean specific values"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "例如 9 在小時字段表示上午 9 點。" : "E.g., 9 in hour field means 9 AM."}</p>
                </div>
              </div>
            </article>
          </section>

          <AdSenseWrapper showAds={true} adFormat="horizontal" />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.cronMeaning}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-black">{t.definition}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.definitionText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.formula}</h3>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700">{t.formulaText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.limitations}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.limitationsText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.semanticNeighbors}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.semanticNeighborsText}</p>
              </div>
            </div>
            <div className="mt-6">
              <AdSlot slot="cron-expression-builder-knowledge" position="middle" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "Cron 表達式的 5 個字段分別是什麼？" : "What are the 5 Cron fields?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "分鐘 (0-59)、小時 (0-23)、日期 (1-31)、月份 (1-12)、星期 (0-6)。" : "Minute (0-59), Hour (0-23), Day (1-31), Month (1-12), Weekday (0-6)."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "* 和 ? 有什麼區別？" : "What's the difference between * and ?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "* 表示任意值，? 表示不指定值（只用於日期和星期）。" : "* means any value, ? means no specific value (only for day/weekday)."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "如何表示每 5 分鐘執行一次？" : "How to run every 5 minutes?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "使用 */5 在分鐘字段，表示 0, 5, 10, 15... 分鐘。" : "Use */5 in minute field, means 0, 5, 10, 15... minutes."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "如何測試 Cron 表達式？" : "How to test Cron expression?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "使用在線工具、查看系統日誌、運行測試任務。" : "Use online tools, check system logs, run test tasks."}</p>
              </div>
            </div>
          </section>

          <AdSlot slot="cron-expression-builder-faq" position="inline" />

          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦工具" : "Recommended"}</p>
            <h2 className="mt-2 text-2xl font-black">{t.recommendedProducts}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "Cron 編輯器", en: "Cron Editor", href: "#affiliate-editor"}, {zh: "任務調度", en: "Task Scheduler", href: "#affiliate-scheduler"}, {zh: "監控工具", en: "Monitoring", href: "#affiliate-monitor"}, {zh: "開發工具", en: "Dev Tools", href: "#affiliate-devtools"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
            </div>
            <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </section>

          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium Features"}</p>
              <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "解鎖 Cron 高級功能" : "Unlock Advanced Cron Features"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "Premium 功能即將推出" : "Premium features coming soon"}</p>
            </div>
          </PremiumGate>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "JSON 驗證器 · 正則表達式測試器 · API 回應格式化" : "JSON Validator · Regex Tester · API Formatter"}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><ul className="mt-2 space-y-1 text-sm text-slate-700"><li><a href="https://en.wikipedia.org/wiki/Cron" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cron (Wikipedia)</a></li><li><a href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Crontab.guru</a></li><li><a href="https://www.quartz-scheduler.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Quartz Scheduler</a></li></ul></div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="cron-expression-builder-sidebar" position="top" />
        <PremiumGate plan="PRO" />
        <AdSlot slot="cron-expression-builder-sidebar" position="bottom" />
      </div>

      <AdSlot slot="cron-expression-builder-footer" position="footer" />
    </main>
  );
}
