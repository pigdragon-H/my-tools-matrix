import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'revenue', label: '社群帶來營收' },
    { key: 'adCost', label: '廣告成本' },
    { key: 'contentCost', label: '內容成本' }];
function money(v:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
export default function SocialMediaRoiCalculator(){const [values,setValues]=useState<Record<string,number>>({revenue: 300000,
    adCost: 80000,
    contentCost: 40000}); const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const cost=v('adCost')+v('contentCost'); const profit=v('revenue')-cost; const roi=cost>0?profit/cost*100:0; return [{label:'淨收益',value:money(profit)},{label:'ROI',value:pct(roi)},{label:'總成本',value:money(cost)}];},[values]); return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">社群媒體 ROI 計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算社群活動營收、成本與 ROI。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-fuchsia-50 p-4 text-fuchsia-950 dark:bg-fuchsia-950 dark:text-fuchsia-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>}
