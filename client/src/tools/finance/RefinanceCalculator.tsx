import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'balance', label: '剩餘本金' },
    { key: 'oldRate', label: '原年利率 (%)' },
    { key: 'newRate', label: '新年利率 (%)' },
    { key: 'years', label: '剩餘年限' },
    { key: 'fee', label: '轉貸費用' }];
function money(value:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(value)?value:0)}
function pct(value:number){return `${(Number.isFinite(value)?value:0).toFixed(2)}%`}
export default function RefinanceCalculator(){
 const [values,setValues]=useState<Record<string,number>>({balance: 8000000,
    oldRate: 2.6,
    newRate: 2.1,
    years: 25,
    fee: 80000});
 const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const pay=(rate:number)=>{const r=rate/100/12,n=v('years')*12;return r>0?v('balance')*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):v('balance')/n}; const oldP=pay(v('oldRate')), newP=pay(v('newRate')); const save=(oldP-newP)*v('years')*12-v('fee'); return [{label:'原月付',value:money(oldP)},{label:'新月付',value:money(newP)},{label:'總節省估算',value:money(save)}];},[values]);
 return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">房貸轉貸計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">比較原貸款與新利率下的月付差異。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
