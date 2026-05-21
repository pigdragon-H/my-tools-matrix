import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'sellPrice', label: '賣出金額' },
    { key: 'costBasis', label: '成本基礎' },
    { key: 'taxRate', label: '稅率 (%)' },
    { key: 'deduction', label: '可扣除費用' }];
function money(v:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}
export default function CapitalGainsTaxCalculator(){const [values,setValues]=useState<Record<string,number>>({sellPrice: 150000,
    costBasis: 100000,
    taxRate: 20,
    deduction: 5000}); const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const gain=Math.max(v('sellPrice')-v('costBasis')-v('deduction'),0); const tax=gain*v('taxRate')/100; return [{label:'應稅利得',value:money(gain)},{label:'預估稅額',value:money(tax)},{label:'稅後利得',value:money(gain-tax)}];},[values]); return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">資本利得稅計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依買入、賣出與稅率估算資本利得稅。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-indigo-50 p-4 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>}
