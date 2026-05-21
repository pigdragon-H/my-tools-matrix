import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'height', label: '身高（cm）' },
    { key: 'waist', label: '腰圍（cm）' },
    { key: 'neck', label: '頸圍（cm）' },
    { key: 'hip', label: '臀圍（cm，女性用）' },
    { key: 'sex', label: '性別：男=1 女=2' }];
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function kg(v:number){return `${num(v)} kg`}
function cal(v:number){return `${Math.round(Number.isFinite(v)?v:0).toLocaleString("zh-TW")} kcal`}
export default function BodyFatCalculator(){
  const [values,setValues]=useState<Record<string,number>>({height: 170,
    waist: 82,
    neck: 38,
    hip: 95,
    sex: 1});
  const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const sex=v('sex'); const h=v('height'), waist=v('waist'), neck=v('neck'), hip=v('hip'); const fat=sex===2?495/(1.29579-0.35004*Math.log10(Math.max(waist+hip-neck,1))+0.221*Math.log10(Math.max(h,1)))-450:495/(1.0324-0.19077*Math.log10(Math.max(waist-neck,1))+0.15456*Math.log10(Math.max(h,1)))-450; return [{label:'估算體脂率',value:pct(fat)},{label:'脂肪重量估算',value:'請搭配體重使用'},{label:'健康提醒',value:fat>30?'建議調整飲食與運動':'維持規律生活'}];},[values]);
  return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">體脂率計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依性別、腰圍、頸圍、臀圍與身高估算體脂率。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
