import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'monthlySalary', label: '月薪' },
    { key: 'incomeTaxRate', label: '所得稅率 (%)' },
    { key: 'insurance', label: '勞健保/月' },
    { key: 'pensionRate', label: '退休金自提 (%)' }];
function money(v:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}
export default function SalaryAfterTaxCalculator(){const [values,setValues]=useState<Record<string,number>>({monthlySalary: 80000,
    incomeTaxRate: 8,
    insurance: 2500,
    pensionRate: 6}); const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const tax=v('monthlySalary')*v('incomeTaxRate')/100; const pension=v('monthlySalary')*v('pensionRate')/100; const net=v('monthlySalary')-tax-v('insurance')-pension; return [{label:'預估所得稅',value:money(tax)},{label:'退休金自提',value:money(pension)},{label:'稅後實領',value:money(net)}];},[values]); return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">稅後薪資計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">估算月薪扣除所得稅與保費後的實領薪資。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-indigo-50 p-4 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>}
