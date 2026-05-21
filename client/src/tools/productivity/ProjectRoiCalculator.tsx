import { useMemo, useState } from "react";

export default function ProjectRoiCalculator() {
  const [revenue, setRevenue] = useState(500000);
  const [cost, setCost] = useState(300000);
  const [hours, setHours] = useState(200);
  const [hourlyValue, setHourlyValue] = useState(800);

  const result = useMemo(() => {
    const timeCost = hours * hourlyValue;
    const totalCost = cost + timeCost;
    const profit = revenue - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    return { timeCost, totalCost, profit, roi };
  }, [revenue, cost, hours, hourlyValue]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div><h1 className="text-2xl font-bold">專案 ROI 計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">估算專案收入、直接成本與人力時間成本後的投資報酬率，協助判斷專案是否值得投入。</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">預估收入<input className="mt-1 w-full rounded-lg border p-2" type="number" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">直接成本<input className="mt-1 w-full rounded-lg border p-2" type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">投入工時<input className="mt-1 w-full rounded-lg border p-2" type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">每小時人力價值<input className="mt-1 w-full rounded-lg border p-2" type="number" value={hourlyValue} onChange={(e) => setHourlyValue(Number(e.target.value))} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm">總成本</p><p className="text-2xl font-bold">{Math.round(result.totalCost).toLocaleString()}</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-sm">淨利</p><p className="text-2xl font-bold">{Math.round(result.profit).toLocaleString()}</p></div><div className="rounded-xl bg-blue-50 p-4"><p className="text-sm">ROI</p><p className="text-2xl font-bold">{result.roi.toFixed(1)}%</p></div></div>
    </div>
  );
}
