import { useMemo, useState } from "react";

type Result = { label: string; value: string };

const inputFields = [
    { key: 'revenue', label: '營收' },
    { key: 'cost', label: '成本' },
    { key: 'expense', label: '費用' }
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

export default function ProfitMarginCalculator() {
  const [values, setValues] = useState<Record<string, number>>({
    revenue: 300000,
    cost: 180000,
    expense: 50000
  });

  const results = useMemo<Result[]>(() => {
    const v = (key: string) => Number(values[key] ?? 0);
    const gross = v('revenue')-v('cost'); const net = gross-v('expense');
    return [{label:'毛利', value:money(gross)}, {label:'淨利', value:money(net)}, {label:'淨利率', value:pct(v('revenue')>0?net/v('revenue')*100:0)}];
  }, [values]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold">利潤率計算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算毛利、淨利與利潤率。</p>
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
