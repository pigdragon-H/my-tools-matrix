import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'revenue', label: '營收' },
    { key: 'cost', label: '成本' },
    { key: 'expense', label: '費用' },
    { key: 'taxRate', label: '營所稅率 (%)' }];
function money(v:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}
export default function CorporateTaxCalculator(){const [values,setValues]=useState<Record<string,number>>({revenue: 3000000,
    cost: 1600000,
    expense: 700000,
    taxRate: 20}); const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const income=Math.max(v('revenue')-v('cost')-v('expense'),0); const tax=income*v('taxRate')/100; return [{label:'課稅所得',value:money(income)},{label:'營所稅',value:money(tax)},{label:'稅後盈餘',value:money(income-tax)}];},[values]); return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">營所稅計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依營收、成本、費用與稅率估算公司所得稅。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-indigo-50 p-4 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>}
