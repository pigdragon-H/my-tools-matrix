import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'daysLived', label: '已出生天數' },
    { key: 'targetDays', label: '目標天數' },
    { key: 'lifeExpectancy', label: '預估壽命年' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function AgeCalculator(){
  const [values,setValues]=useState<Record<string,number>>({daysLived: 12000,
    targetDays: 15000,
    lifeExpectancy: 80});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const years=v('daysLived')/365.2425; const months=years*12; const remain=Math.max(v('targetDays')-v('daysLived'),0); return [{label:'目前年齡',value:`${num(years)} 歲`},{label:'約等於月數',value:`${num(months)} 個月`},{label:'距目標天數',value:`${remain} 天`}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">年齡計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">用出生後天數估算年齡、月數與天數。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
