import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'gross', label: '給付總額' },
    { key: 'withholdingRate', label: '扣繳率 (%)' },
    { key: 'supplementRate', label: '補充費率 (%)' }];
function money(v:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}
export default function WithholdingTaxCalculator(){const [values,setValues]=useState<Record<string,number>>({gross: 50000,
    withholdingRate: 10,
    supplementRate: 0}); const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const tax=v('gross')*v('withholdingRate')/100; const supp=v('gross')*v('supplementRate')/100; return [{label:'扣繳稅額',value:money(tax)},{label:'補充費',value:money(supp)},{label:'實領金額',value:money(v('gross')-tax-supp)}];},[values]); return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">扣繳稅計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算給付總額、扣繳稅額與實領金額。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-indigo-50 p-4 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>}
