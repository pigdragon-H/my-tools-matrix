import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'amount', label: '金額' },
    { key: 'vatRate', label: 'VAT 稅率 (%)' },
    { key: 'mode', label: '模式：1=未稅轉含稅 2=含稅拆稅' }];
function money(v:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}
export default function VatCalculator(){const [values,setValues]=useState<Record<string,number>>({amount: 1000,
    vatRate: 5,
    mode: 1}); const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const rate=v('vatRate')/100; const tax=v('mode')===2?v('amount')-v('amount')/(1+rate):v('amount')*rate; const net=v('mode')===2?v('amount')-tax:v('amount'); const gross=net+tax; return [{label:'未稅金額',value:money(net)},{label:'稅額',value:money(tax)},{label:'含稅金額',value:money(gross)}];},[values]); return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">營業稅 / VAT 計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">計算含稅價、未稅價與 VAT 稅額。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-indigo-50 p-4 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>}
