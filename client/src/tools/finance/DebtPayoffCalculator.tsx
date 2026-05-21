import { useMemo, useState } from "react";

type Result = { label: string; value: string };

const inputFields = [
    { key: 'debt', label: '債務餘額' },
    { key: 'annualRate', label: '年利率 (%)' },
    { key: 'monthlyPayment', label: '每月還款' }
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

export default function DebtPayoffCalculator() {
  const [values, setValues] = useState<Record<string, number>>({
    debt: 200000,
    annualRate: 8,
    monthlyPayment: 10000
  });

  const results = useMemo<Result[]>(() => {
    const v = (key: string) => Number(values[key] ?? 0);
    let balance = v('debt'); let months = 0; let interest = 0; const r = v('annualRate')/100/12;
    while(balance > 0 && months < 600){ const i = balance*r; interest += i; balance = balance + i - v('monthlyPayment'); months += 1; if(v('monthlyPayment') <= i) break; }
    return [{label:'預估還清月數', value: months>=600?'無法還清':`${months} 個月`}, {label:'總利息', value:money(interest)}, {label:'總支付', value:money(v('debt')+interest)}];
  }, [values]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold">債務還清計算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">估算固定月付下的還款時間與利息。</p>
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
