import { useMemo, useState } from "react";

type ResultItem = { label: string; value: string; note?: string };
type Field = { key: string; label: string; type: "number" | "text" | "textarea"; placeholder: string };

const fields: Field[] = [
  { key: "daily", label: "平時成績", type: "number", placeholder: "85" },
  { key: "mid", label: "期中成績", type: "number", placeholder: "80" },
  { key: "final", label: "期末成績", type: "number", placeholder: "90" },
  { key: "dailyW", label: "平時權重 %", type: "number", placeholder: "30" },
  { key: "midW", label: "期中權重 %", type: "number", placeholder: "30" },
  { key: "finalW", label: "期末權重 %", type: "number", placeholder: "40" }
];

function num(value: number) {
  return (Number.isFinite(value) ? value : 0).toLocaleString("zh-TW", { maximumFractionDigits: 2 });
}

function money(value: number) {
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
}

function pct(value: number) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
}

export default function GradeCalculator() {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.key, f.placeholder])));
  const v = (key: string) => Number(values[key] || 0);

  const results = useMemo<ResultItem[]>(() => {
    const total = v("daily") * v("dailyW") / 100 + v("mid") * v("midW") / 100 + v("final") * v("finalW") / 100;
    return [{ label: "學期總成績", value: num(total), note: total >= 60 ? "目前推估及格。" : "目前推估未達及格線。" }];
  }, [values]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">成績計算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">輸入平時、期中、期末分數與權重，計算總成績。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={values[field.key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              />
            ) : (
              <input
                type={field.type}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={values[field.key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              />
            )}
          </label>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((item) => (
          <div key={item.label} className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
            <p className="text-sm text-blue-700 dark:text-blue-200">{item.label}</p>
            <p className="mt-1 whitespace-pre-wrap text-xl font-bold text-blue-950 dark:text-white">{item.value}</p>
            {item.note && <p className="mt-2 text-xs text-blue-700 dark:text-blue-200">{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
