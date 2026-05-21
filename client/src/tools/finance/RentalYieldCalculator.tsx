import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'price', label: '房產總價' },
    { key: 'monthlyRent', label: '月租金' },
    { key: 'annualCost', label: '年持有成本' }];
function money(value:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(value)?value:0)}
function pct(value:number){return `${(Number.isFinite(value)?value:0).toFixed(2)}%`}
export default function RentalYieldCalculator(){
 const [values,setValues]=useState<Record<string,number>>({price: 12000000,
    monthlyRent: 35000,
    annualCost: 80000});
 const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const annual=v('monthlyRent')*12; const net=annual-v('annualCost'); return [{label:'毛租金收益率',value:pct(v('price')>0?annual/v('price')*100:0)},{label:'淨租金收益率',value:pct(v('price')>0?net/v('price')*100:0)},{label:'年淨租金',value:money(net)}];},[values]);
 return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">租金收益率計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算年租金收益率與淨收益率。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
