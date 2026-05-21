import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'estateValue', label: '遺產總額' },
    { key: 'deduction', label: '扣除額' },
    { key: 'taxRate', label: '稅率 (%)' }];
function money(v:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}
export default function EstateTaxCalculator(){const [values,setValues]=useState<Record<string,number>>({estateValue: 20000000,
    deduction: 13330000,
    taxRate: 10}); const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const taxable=Math.max(v('estateValue')-v('deduction'),0); const tax=taxable*v('taxRate')/100; return [{label:'課稅遺產淨額',value:money(taxable)},{label:'遺產稅',value:money(tax)},{label:'稅後遺產',value:money(v('estateValue')-tax)}];},[values]); return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">遺產稅計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">估算遺產淨額與應納遺產稅。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-indigo-50 p-4 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>}
