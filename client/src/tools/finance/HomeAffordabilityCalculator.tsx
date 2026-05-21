import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'monthlyIncome', label: '月收入' },
    { key: 'monthlyDebt', label: '每月既有負債' },
    { key: 'downPayment', label: '頭期款' },
    { key: 'annualRate', label: '房貸年利率 (%)' },
    { key: 'years', label: '貸款年限' }];
function money(value:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(value)?value:0)}
function pct(value:number){return `${(Number.isFinite(value)?value:0).toFixed(2)}%`}
export default function HomeAffordabilityCalculator(){
 const [values,setValues]=useState<Record<string,number>>({monthlyIncome: 120000,
    monthlyDebt: 15000,
    downPayment: 800000,
    annualRate: 2.2,
    years: 30});
 const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const maxPay=v('monthlyIncome')*0.35-v('monthlyDebt'); const r=v('annualRate')/100/12; const n=v('years')*12; const loan=r>0?maxPay*(Math.pow(1+r,n)-1)/(r*Math.pow(1+r,n)):maxPay*n; return [{label:'可負擔月付',value:money(maxPay)},{label:'可貸金額',value:money(loan)},{label:'估算可買房價',value:money(loan+v('downPayment'))}];},[values]);
 return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">房屋可負擔能力計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依收入、負債與利率估算可負擔房價。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
