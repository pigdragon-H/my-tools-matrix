import { useMemo, useState } from "react";

export default function ProductivityScore() {
  const [focusHours, setFocusHours] = useState(4);
  const [tasksDone, setTasksDone] = useState(6);
  const [plannedTasks, setPlannedTasks] = useState(8);
  const [interruptions, setInterruptions] = useState(5);
  const [energy, setEnergy] = useState(7);

  const result = useMemo(() => {
    const focusScore = Math.min(100, (focusHours / 6) * 100);
    const completionScore = plannedTasks > 0 ? Math.min(100, (tasksDone / plannedTasks) * 100) : 0;
    const interruptionScore = Math.max(0, 100 - interruptions * 8);
    const energyScore = Math.min(100, energy * 10);
    const score = Math.round(focusScore * 0.3 + completionScore * 0.35 + interruptionScore * 0.2 + energyScore * 0.15);
    const level = score >= 85 ? "高效" : score >= 70 ? "穩定" : score >= 50 ? "普通" : "需改善";
    return { score, level };
  }, [focusHours, tasksDone, plannedTasks, interruptions, energy]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div><h1 className="text-2xl font-bold">生產力分數計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依深度工作時數、任務完成率、干擾次數與精神能量估算今日生產力分數。</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">深度工作時數<input className="mt-1 w-full rounded-lg border p-2" type="number" value={focusHours} onChange={(e) => setFocusHours(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">已完成任務數<input className="mt-1 w-full rounded-lg border p-2" type="number" value={tasksDone} onChange={(e) => setTasksDone(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">計畫任務數<input className="mt-1 w-full rounded-lg border p-2" type="number" value={plannedTasks} onChange={(e) => setPlannedTasks(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">被打斷次數<input className="mt-1 w-full rounded-lg border p-2" type="number" value={interruptions} onChange={(e) => setInterruptions(Number(e.target.value))} /></label>
        <label className="text-sm font-medium md:col-span-2">精神能量（1-10）<input className="mt-1 w-full rounded-lg border p-2" type="number" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} /></label>
      </div>
      <div className="rounded-xl bg-violet-50 p-5 text-violet-900"><p className="text-sm">今日生產力分數</p><p className="text-4xl font-bold">{result.score} / 100</p><p className="mt-1">狀態：{result.level}</p></div>
    </div>
  );
}
