import { useMemo, useState } from "react";

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));

  const fromTimestamp = useMemo(() => {
    const ms = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [timestamp]);

  const fromDate = useMemo(() => {
    const date = new Date(dateInput);
    return Number.isNaN(date.getTime()) ? null : { seconds: Math.floor(date.getTime() / 1000), milliseconds: date.getTime() };
  }, [dateInput]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div><h1 className="text-2xl font-bold">Timestamp 時間戳轉換器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">在 Unix timestamp、毫秒時間戳與本地日期時間之間互相轉換，方便 API 除錯與資料檢查。</p></div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3"><label className="text-sm font-medium">Timestamp（秒或毫秒）<input className="mt-1 w-full rounded-lg border p-2" type="number" value={timestamp} onChange={(e) => setTimestamp(Number(e.target.value))} /></label>{fromTimestamp && <div className="rounded-xl bg-slate-50 p-4 text-sm"><p>本地時間：{fromTimestamp.toLocaleString()}</p><p>ISO：{fromTimestamp.toISOString()}</p></div>}</div>
        <div className="space-y-3"><label className="text-sm font-medium">日期時間<input className="mt-1 w-full rounded-lg border p-2" type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} /></label>{fromDate && <div className="rounded-xl bg-blue-50 p-4 text-sm"><p>秒：{fromDate.seconds}</p><p>毫秒：{fromDate.milliseconds}</p></div>}</div>
      </div>
    </div>
  );
}
