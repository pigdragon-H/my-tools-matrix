import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'opens', label: '開信數' },
    { key: 'sent', label: '寄送數' },
    { key: 'bounces', label: '退信數' }];
function money(v:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}
function pct(v:number){return `${(Number.isFinite(v)?v:0).toFixed(2)}%`}
function num(v:number){return (Number.isFinite(v)?v:0).toLocaleString("zh-TW",{maximumFractionDigits:2})}
export default function EmailOpenRateCalculator(){const [values,setValues]=useState<Record<string,number>>({opens: 4500,
    sent: 12000,
    bounces: 200}); const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const delivered=Math.max(v('sent')-v('bounces'),0); const rate=delivered>0?v('opens')/delivered*100:0; return [{label:'開信率',value:pct(rate)},{label:'成功送達',value:num(delivered)},{label:'未開信',value:num(Math.max(delivered-v('opens'),0))}];},[values]); return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">Email 開信率計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算電子報開信率與未開信數。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-fuchsia-50 p-4 text-fuchsia-950 dark:bg-fuchsia-950 dark:text-fuchsia-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>}
