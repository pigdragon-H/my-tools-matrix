import { useMemo, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function CreditScoreCalculator() {
  const [paymentHistory, setPaymentHistory] = useState(95);
  const [utilization, setUtilization] = useState(30);
  const [creditAge, setCreditAge] = useState(5);
  const [accounts, setAccounts] = useState(4);
  const [inquiries, setInquiries] = useState(1);

  const result = useMemo(() => {
    const paymentPoints = clamp(paymentHistory, 0, 100) * 1.65;
    const utilizationPoints = (100 - clamp(utilization, 0, 100)) * 1.35;
    const agePoints = clamp(creditAge / 10, 0, 1) * 85;
    const mixPoints = clamp(accounts / 8, 0, 1) * 55;
    const inquiryPenalty = clamp(inquiries, 0, 10) * 12;
    const score = Math.round(clamp(300 + paymentPoints + utilizationPoints + agePoints + mixPoints - inquiryPenalty, 300, 850));
    const level = score >= 800 ? "極佳" : score >= 740 ? "很好" : score >= 670 ? "良好" : score >= 580 ? "普通" : "需改善";
    return { score, level };
  }, [paymentHistory, utilization, creditAge, accounts, inquiries]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h1 className="text-2xl font-bold">信用評分估算器</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依付款紀錄、信用使用率、信用年資、帳戶數與近期查詢次數，估算信用分數區間。此工具為教育用途，實際分數仍依金融機構模型而定。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">準時付款比例（%）<input className="w-full rounded-lg border p-2" type="number" value={paymentHistory} onChange={(e) => setPaymentHistory(Number(e.target.value))} /></label>
        <label className="space-y-1 text-sm font-medium">信用額度使用率（%）<input className="w-full rounded-lg border p-2" type="number" value={utilization} onChange={(e) => setUtilization(Number(e.target.value))} /></label>
        <label className="space-y-1 text-sm font-medium">信用年資（年）<input className="w-full rounded-lg border p-2" type="number" value={creditAge} onChange={(e) => setCreditAge(Number(e.target.value))} /></label>
        <label className="space-y-1 text-sm font-medium">信用帳戶數<input className="w-full rounded-lg border p-2" type="number" value={accounts} onChange={(e) => setAccounts(Number(e.target.value))} /></label>
        <label className="space-y-1 text-sm font-medium md:col-span-2">近期硬查詢次數<input className="w-full rounded-lg border p-2" type="number" value={inquiries} onChange={(e) => setInquiries(Number(e.target.value))} /></label>
      </div>
      <div className="rounded-xl bg-emerald-50 p-5 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
        <p className="text-sm">估算信用分數</p>
        <p className="text-4xl font-bold">{result.score}</p>
        <p className="mt-1">信用等級：{result.level}</p>
      </div>
    </div>
  );
}
