import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'area', label: '土地面積（坪）' },
    { key: 'pricePerPing', label: '每坪單價' },
    { key: 'zoningFactor', label: '分區係數' }];
function money(value:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(value)?value:0)}
function pct(value:number){return `${(Number.isFinite(value)?value:0).toFixed(2)}%`}
export default function LandValueCalculator(){
 const [values,setValues]=useState<Record<string,number>>({area: 50,
    pricePerPing: 600000,
    zoningFactor: 1.0});
 const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const base=v('area')*v('pricePerPing'); const value=base*v('zoningFactor'); return [{label:'基礎估值',value:money(base)},{label:'分區調整後',value:money(value)},{label:'每平方公尺',value:money(value/(v('area')*3.3058))}];},[values]);
 return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">土地價值估算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依面積、單價與使用分區係數估算土地價值。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
