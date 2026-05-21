import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'withheld', label: '已扣繳稅額' },
    { key: 'taxDue', label: '應納稅額' },
    { key: 'credits', label: '可抵減稅額' }];
function money(v:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}
export default function TaxRefundCalculator(){const [values,setValues]=useState<Record<string,number>>({withheld: 80000,
    taxDue: 65000,
    credits: 5000}); const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const finalTax=Math.max(v('taxDue')-v('credits'),0); const refund=v('withheld')-finalTax; return [{label:'最終應納稅',value:money(finalTax)},{label:'退稅 / 補稅',value:money(refund)},{label:'狀態',value:refund>=0?'可退稅':'需補稅'}];},[values]); return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">退稅估算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依已扣繳稅額與應納稅額估算退補稅。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-indigo-50 p-4 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>}
