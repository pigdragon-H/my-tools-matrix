import { useMemo, useState } from "react";

export default function CompoundInterestAdvanced() {
  const [principal, setPrincipal] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [annualRate, setAnnualRate] = useState(6);
  const [years, setYears] = useState(20);
  const [compoundPerYear, setCompoundPerYear] = useState(12);

  const result = useMemo(() => {
    const periods = Math.max(1, Math.round(years * compoundPerYear));
    const rate = annualRate / 100 / compoundPerYear;
    const contributionPerPeriod = monthlyContribution * (12 / compoundPerYear);
    let balance = principal;
    for (let i = 0; i < periods; i += 1) {
      balance = balance * (1 + rate) + contributionPerPeriod;
    }
    const totalContribution = principal + monthlyContribution * 12 * years;
    const interest = balance - totalContribution;
    return { balance, totalContribution, interest };
  }, [principal, monthlyContribution, annualRate, years, compoundPerYear]);

  const money = (value: number) => Math.round(value).toLocaleString("zh-TW");

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold">進階複利計算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">輸入本金、每月投入、年化報酬率、投資年限與複利頻率，估算長期投資的期末金額與利息成長。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">初始本金<input className="mt-1 w-full rounded-lg border p-2" type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">每月投入<input className="mt-1 w-full rounded-lg border p-2" type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">年化報酬率（%）<input className="mt-1 w-full rounded-lg border p-2" type="number" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">投資年限<input className="mt-1 w-full rounded-lg border p-2" type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} /></label>
        <label className="text-sm font-medium md:col-span-2">每年複利次數<input className="mt-1 w-full rounded-lg border p-2" type="number" value={compoundPerYear} onChange={(e) => setCompoundPerYear(Number(e.target.value))} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-blue-50 p-4"><p className="text-sm text-blue-700">期末金額</p><p className="text-2xl font-bold">NT$ {money(result.balance)}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-700">投入本金</p><p className="text-2xl font-bold">NT$ {money(result.totalContribution)}</p></div>
        <div className="rounded-xl bg-emerald-50 p-4"><p className="text-sm text-emerald-700">複利收益</p><p className="text-2xl font-bold">NT$ {money(result.interest)}</p></div>
      </div>
    </div>
  );
}
