import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'daysSinceLmp', label: '距最後月經天數' },
    { key: 'pregnancyDays', label: '標準孕期天數' },
    { key: 'checkupInterval', label: '產檢間隔天數' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function DueDateCalculator(){
  const [values,setValues]=useState<Record<string,number>>({daysSinceLmp: 60,
    pregnancyDays: 280,
    checkupInterval: 28});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const remain=Math.max(v('pregnancyDays')-v('daysSinceLmp'),0); const weeks=Math.floor(remain/7); const next=Math.min(v('checkupInterval'),remain); return [{label:'距預產期',value:`${remain} 天`},{label:'約剩週數',value:`${weeks} 週`},{label:'下次產檢建議',value:`${next} 天內`}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">預產期計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">用最後月經日期距今天數推估預產期剩餘天數。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
