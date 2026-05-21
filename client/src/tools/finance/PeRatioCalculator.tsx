import { useMemo, useState } from "react";

type Result = { label: string; value: string };

const inputFields = [
    { key: 'price', label: '股價' },
    { key: 'eps', label: '每股盈餘 EPS' },
    { key: 'targetPe', label: '目標本益比' }
];

function money(value: number) {
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
}

function pct(value: number) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
}

function num(value: number) {
  return (Number.isFinite(value) ? value : 0).toLocaleString("zh-TW", { maximumFractionDigits: 2 });
}

export default function PeRatioCalculator() {
  const [values, setValues] = useState<Record<string, number>>({
    price: 120,
    eps: 8,
    targetPe: 15
  });

  const results = useMemo<Result[]>(() => {
    const v = (key: string) => Number(values[key] ?? 0);
    const pe = v('eps')!==0?v('price')/v('eps'):0; const fair = v('eps')*v('targetPe');
    return [{label:'目前本益比', value:num(pe)}, {label:'目標合理價', value:money(fair)}, {label:'相對差距', value:pct(fair!==0?(v('price')-fair)/fair*100:0)}];
  }, [values]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold">本益比計算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">用股價與 EPS 評估本益比。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {inputFields.map((field) => (
          <label key={field.key} className="space-y-1 text-sm font-medium">
            {field.label}
            <input className="w-full rounded-lg border p-2 dark:bg-slate-900" type="number" value={values[field.key] ?? 0} onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))} />
          </label>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {results.map((item) => (
          <div key={item.label} className="rounded-xl bg-blue-50 p-4 text-blue-950 dark:bg-blue-950 dark:text-blue-50">
            <p className="text-sm">{item.label}</p>
            <p className="mt-1 text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
