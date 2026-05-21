import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'age', label: '年齡' },
    { key: 'sunMinutes', label: '每日日曬分鐘' },
    { key: 'weight', label: '體重（kg）' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function VitaminCalculator(){
  const [values,setValues]=useState<Record<string,number>>({age: 35,
    sunMinutes: 10,
    weight: 70});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const base=v('age')>=65?800:600; const sunAdj=v('sunMinutes')<15?200:0; const weightAdj=v('weight')>90?200:0; const total=base+sunAdj+weightAdj; return [{label:'維生素D建議',value:`${total} IU/日`},{label:'日曬調整',value:`+${sunAdj} IU`},{label:'體重調整',value:`+${weightAdj} IU`}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">維生素攝取建議計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依年齡與生活型態估算每日維生素 D 建議。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
