import { useMemo, useState } from "react";

type Result = { label: string; value: string };

const inputFields = [
    { key: 'amount', label: '原始金額' },
    { key: 'rate', label: '匯率' },
    { key: 'feeRate', label: '手續費 (%)' }
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

export default function ExchangeRateCalculator() {
  const [values, setValues] = useState<Record<string, number>>({
    amount: 1000,
    rate: 31.5,
    feeRate: 0.5
  });

  const results = useMemo<Result[]>(() => {
    const v = (key: string) => Number(values[key] ?? 0);
    const converted = v('amount')*v('rate'); const fee = converted*v('feeRate')/100;
    return [{label:'換算金額', value:money(converted)}, {label:'手續費', value:money(fee)}, {label:'實收/實付估算', value:money(converted-fee)}];
  }, [values]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold">匯率換算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">用匯率換算外幣金額。</p>
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
