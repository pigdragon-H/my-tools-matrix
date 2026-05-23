import { useMemo, useState } from "react";

type Lang = "zh" | "en";

const text = {
  zh: { title: "ISO 8601 日期時間轉換器", subtitle: "在 ISO 8601、Unix 秒、Unix 毫秒、本地時間與 UTC 時間之間快速互轉。", input: "輸入日期時間", now: "使用現在時間", clear: "清除", copy: "複製", copied: "已複製", iso: "ISO 8601", utc: "UTC 字串", local: "本地時間", unixSec: "Unix 秒", unixMs: "Unix 毫秒", date: "日期", time: "時間", invalid: "無法解析日期時間，請輸入 ISO 8601、Unix timestamp 或可被瀏覽器解析的日期格式。" },
  en: { title: "ISO 8601 Date Time Converter", subtitle: "Convert between ISO 8601, Unix seconds, Unix milliseconds, local time, and UTC time.", input: "Input Date Time", now: "Use Current Time", clear: "Clear", copy: "Copy", copied: "Copied", iso: "ISO 8601", utc: "UTC String", local: "Local Time", unixSec: "Unix Seconds", unixMs: "Unix Milliseconds", date: "Date", time: "Time", invalid: "Unable to parse date time. Enter ISO 8601, Unix timestamp, or a browser-parseable date string." },
};

function toLocalDateTimeValue(date: Date): string {
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDateInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{10}$/.test(trimmed)) return new Date(Number(trimmed) * 1000);
  if (/^\d{13}$/.test(trimmed)) return new Date(Number(trimmed));
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function Iso8601Converter() {
  const [lang, setLang] = useState<Lang>("zh");
  const [input, setInput] = useState(new Date().toISOString());
  const [copiedKey, setCopiedKey] = useState("");
  const t = text[lang];

  const parsed = useMemo(() => parseDateInput(input), [input]);

  const rows = useMemo(() => {
    if (!parsed) return [];
    return [
      [t.iso, parsed.toISOString()],
      [t.utc, parsed.toUTCString()],
      [t.local, parsed.toLocaleString()],
      [t.unixSec, Math.floor(parsed.getTime() / 1000).toString()],
      [t.unixMs, parsed.getTime().toString()],
      [t.date, parsed.toISOString().slice(0, 10)],
      [t.time, `${parsed.toISOString().slice(11, 19)}Z`],
    ];
  }, [parsed, t]);

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key); window.setTimeout(() => setCopiedKey(""), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · TIME</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.input}</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="2026-05-24T10:30:00Z / 1779570000 / 1779570000000" className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
          <input type="datetime-local" value={parsed ? toLocalDateTimeValue(parsed) : ""} onChange={(e) => { const v = e.target.value; if (!v) { setInput(""); return; } const d = new Date(v); if (!Number.isNaN(d.getTime())) setInput(d.toISOString()); }} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setInput(new Date().toISOString())} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{t.now}</button>
            <button type="button" onClick={() => { setInput(""); setCopiedKey(""); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {!parsed ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{t.invalid}</div>
          ) : (
            <div className="space-y-3">
              {rows.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                    <button type="button" onClick={() => copyValue(label, value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copiedKey === label ? t.copied : t.copy}</button>
                  </div>
                  <code className="block break-all rounded-lg bg-slate-50 p-3 font-mono text-sm dark:bg-slate-900 dark:text-slate-100">{value}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
