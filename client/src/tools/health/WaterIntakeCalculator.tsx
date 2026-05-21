import { useMemo, useState } from "react";

export default function WaterIntakeCalculator() {
  const [weight, setWeight] = useState(60);
  const [exerciseMinutes, setExerciseMinutes] = useState(30);
  const [hotWeather, setHotWeather] = useState(false);

  const result = useMemo(() => {
    const base = weight * 35;
    const exercise = exerciseMinutes * 12;
    const weather = hotWeather ? 500 : 0;
    const total = Math.round(base + exercise + weather);
    return { base: Math.round(base), exercise: Math.round(exercise), weather, total };
  }, [weight, exerciseMinutes, hotWeather]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div><h1 className="text-2xl font-bold">每日飲水量計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依體重、運動時間與炎熱環境估算每日建議喝水量。實際需求會受流汗、飲食與健康狀況影響。</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">體重（kg）<input className="mt-1 w-full rounded-lg border p-2" type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">運動時間（分鐘）<input className="mt-1 w-full rounded-lg border p-2" type="number" value={exerciseMinutes} onChange={(e) => setExerciseMinutes(Number(e.target.value))} /></label>
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium md:col-span-2"><input type="checkbox" checked={hotWeather} onChange={(e) => setHotWeather(e.target.checked)} />炎熱天氣或大量流汗，額外增加 500 ml</label>
      </div>
      <div className="rounded-xl bg-cyan-50 p-5 text-cyan-900"><p className="text-sm">每日建議飲水量</p><p className="text-4xl font-bold">{result.total.toLocaleString("zh-TW")} ml</p><p className="mt-2 text-sm">基礎 {result.base} ml + 運動 {result.exercise} ml + 環境 {result.weather} ml</p></div>
    </div>
  );
}
