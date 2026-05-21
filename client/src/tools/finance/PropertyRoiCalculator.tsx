import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'purchasePrice', label: '購入價格' },
    { key: 'currentValue', label: '目前價值' },
    { key: 'annualRent', label: '年租金收入' },
    { key: 'annualCost', label: '年持有成本' },
    { key: 'years', label: '持有年數' }];
function money(value:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(value)?value:0)}
function pct(value:number){return `${(Number.isFinite(value)?value:0).toFixed(2)}%`}
export default function PropertyRoiCalculator(){
 const [values,setValues]=useState<Record<string,number>>({purchasePrice: 10000000,
    currentValue: 11500000,
    annualRent: 420000,
    annualCost: 90000,
    years: 3});
 const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const gain=v('currentValue')-v('purchasePrice'); const netRent=(v('annualRent')-v('annualCost'))*v('years'); const profit=gain+netRent; return [{label:'總獲利',value:money(profit)},{label:'總 ROI',value:pct(v('purchasePrice')>0?profit/v('purchasePrice')*100:0)},{label:'年化簡估',value:pct(v('purchasePrice')>0?profit/v('purchasePrice')/Math.max(v('years'),1)*100:0)}];},[values]);
 return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">房產投資報酬率計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算房產租金與增值後的投資 ROI。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
