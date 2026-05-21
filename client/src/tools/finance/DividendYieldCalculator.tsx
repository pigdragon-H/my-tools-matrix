import { useMemo, useState } from "react";

type Result = { label: string; value: string };

const inputFields = [
    { key: 'price', label: '股價' },
    { key: 'dividend', label: '每股年股息' },
    { key: 'shares', label: '持有股數' }
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

export default function DividendYieldCalculator() {
  const [values, setValues] = useState<Record<string, number>>({
    price: 80,
    dividend: 4,
    shares: 1000
  });

  const results = useMemo<Result[]>(() => {
    const v = (key: string) => Number(values[key] ?? 0);
    const annual = v('dividend')*v('shares'); const value = v('price')*v('shares');
    return [{label:'殖利率', value:pct(v('price')>0?v('dividend')/v('price')*100:0)}, {label:'年股息收入', value:money(annual)}, {label:'持股市值', value:money(value)}];
  }, [values]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold">股息殖利率計算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算現金股息殖利率與年收入。</p>
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
