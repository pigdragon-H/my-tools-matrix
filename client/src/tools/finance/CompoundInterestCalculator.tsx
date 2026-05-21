import { useMemo, useState } from "react";

type Result = { label: string; value: string };

const inputFields = [
    { key: 'principal', label: '初始本金' },
    { key: 'monthly', label: '每月投入' },
    { key: 'annualRate', label: '年化報酬率 (%)' },
    { key: 'years', label: '投資年數' }
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

export default function CompoundInterestCalculator() {
  const [values, setValues] = useState<Record<string, number>>({
    principal: 100000,
    monthly: 5000,
    annualRate: 6,
    years: 10
  });

  const results = useMemo<Result[]>(() => {
    const v = (key: string) => Number(values[key] ?? 0);
    let balance = v('principal'); const months = Math.round(v('years')*12); const r = v('annualRate')/100/12; for(let i=0;i<months;i+=1){ balance = balance*(1+r)+v('monthly'); } const contributed = v('principal')+v('monthly')*months;
    return [{label:'期末資產', value:money(balance)}, {label:'投入本金', value:money(contributed)}, {label:'複利收益', value:money(balance-contributed)}];
  }, [values]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold">複利計算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算本金、定期投入與複利終值。</p>
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
