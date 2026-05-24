import { useMemo, useState } from "react";

type Lang = "zh" | "en";
type CronPart = { ok: boolean; text: string };

const i18n = {
  zh: { title: "Cron Expression 解釋器", subtitle: "輸入 5 欄 Cron expression，用中文解釋排程執行時間。", input: "Cron Expression", result: "執行時間說明", copy: "複製說明", copied: "已複製", clear: "清除", invalid: "Cron expression 需包含 5 欄：分鐘 小時 日期 月份 星期", minute: "分鐘", hour: "小時", day: "日期", month: "月份", weekday: "星期", examples: "常用範例" },
  en: { title: "Cron Explainer", subtitle: "Enter a 5-field cron expression and explain when it runs.", input: "Cron Expression", result: "Schedule Explanation", copy: "Copy Explanation", copied: "Copied", clear: "Clear", invalid: "Cron expression must contain 5 fields: minute hour day month weekday", minute: "Minute", hour: "Hour", day: "Day of month", month: "Month", weekday: "Weekday", examples: "Examples" },
};

const examples = ["*/15 * * * *", "0 9 * * 1-5", "30 22 * * *", "0 0 1 * *", "0 8 * * 0"];
const weekdaysZh = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const weekdaysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsZh = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function explainField(value: string, min: number, max: number, unit: string, lang: Lang, names?: string[]): CronPart {
  const every = lang === "zh" ? "每" : "every";
  const at = lang === "zh" ? "在" : "at";
  const from = lang === "zh" ? "從" : "from";
  const to = lang === "zh" ? "到" : "to";
  const everyStep = lang === "zh" ? "每隔" : "every";
  if (value === "*") return { ok: true, text: `${every}${unit}` };
  if (/^\*\/\d+$/.test(value)) { const step = Number(value.slice(2)); if (step <= 0) return { ok: false, text: value }; return { ok: true, text: `${everyStep} ${step} ${unit}` }; }
  if (/^\d+$/.test(value)) { const n = Number(value); if (n < min || n > max) return { ok: false, text: value }; const label = names ? names[n - min] ?? String(n) : String(n); return { ok: true, text: `${at} ${label} ${unit}` }; }
  if (/^\d+-\d+$/.test(value)) { const [a, b] = value.split("-").map(Number); if (a < min || b > max || a > b) return { ok: false, text: value }; const left = names ? names[a - min] ?? String(a) : String(a); const right = names ? names[b - min] ?? String(b) : String(b); return { ok: true, text: `${from} ${left} ${to} ${right} ${unit}` }; }
  if (/^\d+(,\d+)+$/.test(value)) { const nums = value.split(",").map(Number); if (nums.some((n) => n < min || n > max)) return { ok: false, text: value }; const labels = nums.map((n) => (names ? names[n - min] ?? String(n) : String(n))).join(lang === "zh" ? "、" : ", "); return { ok: true, text: `${at} ${labels} ${unit}` }; }
  return { ok: false, text: value };
}

function explainCron(expression: string, lang: Lang): { ok: boolean; lines: string[] } {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return { ok: false, lines: [] };
  const [minute, hour, day, month, weekday] = parts;
  const labels = i18n[lang];
  const weekdayNames = lang === "zh" ? weekdaysZh : weekdaysEn;
  const monthNames = lang === "zh" ? monthsZh : monthsEn;
  const explanations = [
    [labels.minute, explainField(minute, 0, 59, lang === "zh" ? "分鐘" : "minute", lang)],
    [labels.hour, explainField(hour, 0, 23, lang === "zh" ? "點" : "hour", lang)],
    [labels.day, explainField(day, 1, 31, lang === "zh" ? "日" : "day", lang)],
    [labels.month, explainField(month, 1, 12, "", lang, monthNames)],
    [labels.weekday, explainField(weekday, 0, 7, "", lang, weekdayNames.concat(weekdayNames[0]))],
  ] as const;
  const ok = explanations.every(([, item]) => item.ok);
  return { ok, lines: explanations.map(([label, item]) => `${label}: ${item.text}`) };
}

export default function CronExplainer() {
  const [lang, setLang] = useState<Lang>("zh");
  const [cron, setCron] = useState("0 9 * * 1-5");
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];
  const result = useMemo(() => explainCron(cron, lang), [cron, lang]);
  const summary = result.ok ? result.lines.join("\n") : t.invalid;

  async function copyResult() {
    await navigator.clipboard.writeText(summary);
    setCopied(true); window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · CRON</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.input}</label>
        <input value={cron} onChange={(e) => setCron(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((item) => <button key={item} type="button" onClick={() => setCron(item)} className="rounded-lg border px-3 py-1 text-xs font-mono hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">{item}</button>)}
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={copyResult} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={() => { setCron(""); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{t.clear}</button>
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.result}</h2>
        {result.ok ? (
          <div className="space-y-2">
            {result.lines.map((line) => <div key={line} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{line}</div>)}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{t.invalid}</div>
        )}
      </section>
    </div>
  );
}
