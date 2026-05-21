import { useMemo, useState } from "react";

type Goal = "lose" | "maintain" | "gain";

export default function CalorieCalculator() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState<Goal>("maintain");

  const result = useMemo(() => {
    const bmr = sex === "male" ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = bmr * activity;
    const target = goal === "lose" ? tdee - 400 : goal === "gain" ? tdee + 300 : tdee;
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target) };
  }, [sex, age, height, weight, activity, goal]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div><h1 className="text-2xl font-bold">卡路里計算器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">依 Mifflin-St Jeor 公式估算 BMR、TDEE，並依減脂、維持或增肌目標給出每日熱量建議。</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">性別<select className="mt-1 w-full rounded-lg border p-2" value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")}><option value="male">男性</option><option value="female">女性</option></select></label>
        <label className="text-sm font-medium">年齡<input className="mt-1 w-full rounded-lg border p-2" type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">身高（cm）<input className="mt-1 w-full rounded-lg border p-2" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">體重（kg）<input className="mt-1 w-full rounded-lg border p-2" type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">活動係數<select className="mt-1 w-full rounded-lg border p-2" value={activity} onChange={(e) => setActivity(Number(e.target.value))}><option value={1.2}>久坐少動</option><option value={1.375}>輕量活動</option><option value={1.55}>中度活動</option><option value={1.725}>高度活動</option></select></label>
        <label className="text-sm font-medium">目標<select className="mt-1 w-full rounded-lg border p-2" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}><option value="lose">減脂</option><option value="maintain">維持</option><option value="gain">增肌</option></select></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm">BMR</p><p className="text-2xl font-bold">{result.bmr} kcal</p></div><div className="rounded-xl bg-blue-50 p-4"><p className="text-sm">TDEE</p><p className="text-2xl font-bold">{result.tdee} kcal</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-sm">目標熱量</p><p className="text-2xl font-bold">{result.target} kcal</p></div></div>
    </div>
  );
}
