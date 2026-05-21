import { useMemo, useState } from "react";

type ResultItem = { label: string; value: string; note?: string };
type Field = { key: string; label: string; type: "number" | "text" | "textarea"; placeholder: string };

const fields: Field[] = [
  { key: "essay", label: "作文內容", type: "textarea", placeholder: "這是一段範例文章，用來計算字數與閱讀時間。" }
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

export default function EssayWordCount() {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.key, f.placeholder])));
  const v = (key: string) => Number(values[key] || 0);

  const results = useMemo<ResultItem[]>(() => {
    const text = values.essay || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.replace(/\s/g, "").length;
    const sentences = Math.max((text.match(/[。！？.!?]/g) || []).length, text.trim() ? 1 : 0);
    return [{ label: "中文字元", value: `${chars} 字` }, { label: "英文詞數", value: `${words} words` }, { label: "句數", value: `${sentences} 句` }, { label: "閱讀時間", value: `${num(Math.max(chars / 450, words / 220))} 分鐘` }];
  }, [values]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">作文字數計算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算文章字數、句數與預估閱讀時間。</p>
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
