import { useMemo, useState } from "react";

type Result = { label: string; value: string };
const fields = [{ key: 'marketValue', label: '目前市值' },
    { key: 'loanBalance', label: '貸款餘額' },
    { key: 'sellCostRate', label: '出售成本 (%)' }];
function money(value:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number.isFinite(value)?value:0)}
function pct(value:number){return `${(Number.isFinite(value)?value:0).toFixed(2)}%`}
export default function HomeEquityCalculator(){
 const [values,setValues]=useState<Record<string,number>>({marketValue: 12000000,
    loanBalance: 7000000,
    sellCostRate: 3});
 const results=useMemo<Result[]>(()=>{const v=(key:string)=>Number(values[key]??0); const cost=v('marketValue')*v('sellCostRate')/100; const equity=v('marketValue')-v('loanBalance'); const net=equity-cost; return [{label:'房屋淨值',value:money(equity)},{label:'出售成本',value:money(cost)},{label:'出售後淨額',value:money(net)}];},[values]);
 return <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950"><div><h1 className="text-2xl font-bold">房屋淨值計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">估算房屋市值扣除貸款後的淨值。</p></div><div className="grid gap-4 md:grid-cols-2">{fields.map(f=><label key={f.key} className="space-y-1 text-sm font-medium">{f.label}<input type="number" value={values[f.key]??0} onChange={e=>setValues(prev=>({...prev,[f.key]:Number(e.target.value)}))} className="w-full rounded-lg border p-2 dark:bg-slate-900"/></label>)}</div><div className="grid gap-4 md:grid-cols-3">{results.map(r=><div key={r.label} className="rounded-xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><p className="text-sm">{r.label}</p><p className="mt-1 text-xl font-bold">{r.value}</p></div>)}</div></div>
}
