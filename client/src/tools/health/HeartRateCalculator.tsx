import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'age', label: '年齡' },
    { key: 'resting', label: '靜止心率' },
    { key: 'intensity', label: '運動強度 (%)' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function HeartRateCalculator(){
  const [values,setValues]=useState<Record<string,number>>({age: 35,
    resting: 65,
    intensity: 70});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const max=220-v('age'); const reserve=max-v('resting'); const target=v('resting')+reserve*v('intensity')/100; return [{label:'最大心率',value:`${max} bpm`},{label:'目標心率',value:`${Math.round(target)} bpm`},{label:'心率儲備',value:`${reserve} bpm`}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">目標心率計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依年齡與強度估算運動目標心率。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
