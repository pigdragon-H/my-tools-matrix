import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'volume', label: '飲酒量（ml）' },
    { key: 'abv', label: '酒精濃度 (%)' },
    { key: 'weight', label: '體重（kg）' },
    { key: 'hours', label: '飲用後小時' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function AlcoholCalculator(){
  const [values,setValues]=useState<Record<string,number>>({volume: 500,
    abv: 5,
    weight: 70,
    hours: 1});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const grams=v('volume')*v('abv')/100*0.789; const bac=Math.max(grams/(v('weight')*0.68)*0.1-0.015*v('hours'),0); const metabolize=grams/7; return [{label:'酒精克數',value:`${num(grams)} g`},{label:'BAC 估算',value:`${bac.toFixed(3)}%`},{label:'代謝時間',value:`${num(metabolize)} 小時`}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">酒精代謝估算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">估算酒精單位、血中酒精濃度與代謝時間。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
