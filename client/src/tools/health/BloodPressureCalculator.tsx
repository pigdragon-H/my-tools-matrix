import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'systolic', label: '收縮壓' },
    { key: 'diastolic', label: '舒張壓' },
    { key: 'pulse', label: '脈搏' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function BloodPressureCalculator(){
  const [values,setValues]=useState<Record<string,number>>({systolic: 125,
    diastolic: 80,
    pulse: 72});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const s=v('systolic'), d=v('diastolic'); const level=s>=140||d>=90?'高血壓':s>=130||d>=80?'偏高':s<90||d<60?'偏低':'正常'; return [{label:'血壓分級',value:level},{label:'脈搏',value:`${v('pulse')} bpm`},{label:'脈壓差',value:`${s-d} mmHg`}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">血壓分級計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依收縮壓與舒張壓判斷血壓區間。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
