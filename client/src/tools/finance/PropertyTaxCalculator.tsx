import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'assessedValue', label: '課稅現值' },
    { key: 'taxRate', label: '稅率 (%)' },
    { key: 'discount', label: '減免金額' }];
function money(value:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(value)?value:0)}
function pct(value:number){return `${(Number.isFinite(value)?value:0).toFixed(2)}%`}
export default function PropertyTaxCalculator(){
 const [values,setValues]=useState<Record<string,number>>({assessedValue: 1200000,
    taxRate: 1.2,
    discount: 0});
 const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const tax=Math.max(v('assessedValue')*v('taxRate')/100-v('discount'),0); return [{label:'預估房屋稅',value:money(tax)},{label:'月平均成本',value:money(tax/12)},{label:'適用稅率',value:pct(v('taxRate'))}];},[values]);
 return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">房屋稅估算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依房屋課稅現值與稅率估算房屋稅。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
