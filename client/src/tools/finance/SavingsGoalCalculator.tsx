import { useMemo, useState } from "react";

type Result = { label: string; value: string };

const inputFields = [
    { key: 'goal', label: '目標金額' },
    { key: 'current', label: '目前存款' },
    { key: 'months', label: '達成月數' },
    { key: 'annualRate', label: '年利率 (%)' }
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

export default function SavingsGoalCalculator() {
  const [values, setValues] = useState<Record<string, number>>({
    goal: 500000,
    current: 80000,
    months: 24,
    annualRate: 1.5
  });

  const results = useMemo<Result[]>(() => {
    const v = (key: string) => Number(values[key] ?? 0);
    const monthlyRate = v('annualRate') / 100 / 12;
    const need = Math.max(v('goal') - v('current'), 0);
    const monthly = monthlyRate > 0 ? need * monthlyRate / (Math.pow(1 + monthlyRate, v('months')) - 1) : need / Math.max(v('months'),1);
    return [{label:'尚需儲蓄', value:money(need)}, {label:'每月需存', value:money(monthly)}, {label:'目標金額', value:money(v('goal'))}];
  }, [values]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold">儲蓄目標計算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算達成目標所需每月儲蓄金額。</p>
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
