import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'height', label: '身高（cm）' },
    { key: 'targetBmi', label: '目標 BMI' },
    { key: 'currentWeight', label: '目前體重（kg）' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function IdealWeightCalculator(){
  const [values,setValues]=useState<Record<string,number>>({height: 170,
    targetBmi: 22,
    currentWeight: 70});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const m=v('height')/100; const ideal=v('targetBmi')*m*m; const min=18.5*m*m, max=24*m*m; return [{label:'理想體重',value:kg(ideal)},{label:'健康範圍',value:`${kg(min)} - ${kg(max)}`},{label:'與目前差距',value:kg(v('currentWeight')-ideal)}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">理想體重計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">用 BMI 目標區間估算理想體重範圍。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
