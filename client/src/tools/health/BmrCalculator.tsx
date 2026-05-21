import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'weight', label: '體重（kg）' },
    { key: 'height', label: '身高（cm）' },
    { key: 'age', label: '年齡' },
    { key: 'sex', label: '性別：男=1 女=2' },
    { key: 'activity', label: '活動係數' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function BmrCalculator(){
  const [values,setValues]=useState<Record<string,number>>({weight: 70,
    height: 170,
    age: 35,
    sex: 1,
    activity: 1.4});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const male=v('sex')===1; const bmr=10*v('weight')+6.25*v('height')-5*v('age')+(male?5:-161); const tdee=bmr*v('activity'); return [{label:'BMR',value:cal(bmr)},{label:'TDEE',value:cal(tdee)},{label:'減脂建議熱量',value:cal(tdee-400)}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">基礎代謝率計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">使用 Mifflin-St Jeor 公式估算每日基礎代謝。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
