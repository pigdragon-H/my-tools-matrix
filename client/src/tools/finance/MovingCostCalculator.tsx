import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'distance', label: '搬家距離（km）' },
    { key: 'truckTrips', label: '車趟數' },
    { key: 'costPerKm', label: '每公里成本' },
    { key: 'packingCost', label: '打包材料與人力' }];
function money(value:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(value)?value:0)}
function pct(value:number){return `${(Number.isFinite(value)?value:0).toFixed(2)}%`}
export default function MovingCostCalculator(){
 const [values,setValues]=useState<Record<string,number>>({distance: 20,
    truckTrips: 2,
    costPerKm: 80,
    packingCost: 12000});
 const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const transport=v('distance')*v('truckTrips')*v('costPerKm'); const total=transport+v('packingCost'); return [{label:'交通搬運費',value:money(transport)},{label:'打包成本',value:money(v('packingCost'))},{label:'總搬家成本',value:money(total)}];},[values]);
 return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">搬家成本計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">估算搬家車趟、距離與打包成本。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
