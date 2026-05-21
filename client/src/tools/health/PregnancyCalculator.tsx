import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'daysSinceLmp', label: '距最後月經天數' },
    { key: 'cycle', label: '平均週期天數' },
    { key: 'pregnancyDays', label: '預估孕期天數' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function PregnancyCalculator(){
  const [values,setValues]=useState<Record<string,number>>({daysSinceLmp: 84,
    cycle: 28,
    pregnancyDays: 280});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const weeks=Math.floor(v('daysSinceLmp')/7); const days=v('daysSinceLmp')%7; const remain=Math.max(v('pregnancyDays')-v('daysSinceLmp'),0); return [{label:'目前孕週',value:`${weeks} 週 ${days} 天`},{label:'距預產期',value:`${remain} 天`},{label:'週期校正',value:`${v('cycle')} 天週期`}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">懷孕週數計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依最後一次月經日期距今天數估算懷孕週數。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
