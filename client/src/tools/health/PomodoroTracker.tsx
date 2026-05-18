// ============================================================
// PomodoroTracker.tsx - 番茄鐘專注統計器
// ============================================================
import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, Play, Pause, RotateCcw, Coffee, CheckCircle2, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type Phase = "work" | "short_break" | "long_break";

interface Session {
  date: string;
  pomodoros: number;
  totalMinutes: number;
  label: string;
}

const PHASE_CONFIG: Record<Phase, { label: string; color: string; duration: number }> = {
  work: { label: "專注時間", color: "text-red-500", duration: 25 },
  short_break: { label: "短休息", color: "text-green-500", duration: 5 },
  long_break: { label: "長休息", color: "text-blue-500", duration: 15 },
};

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getWeekDays(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function PomodoroTracker() {
  const [phase, setPhase] = useState<Phase>("work");
  const [timeLeft, setTimeLeft] = useState(PHASE_CONFIG.work.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [sessionLabel, setSessionLabel] = useState("今日工作");
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const stored = localStorage.getItem("pomodoro_sessions");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const totalDuration = PHASE_CONFIG[phase].duration * 60;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, phase]);

  const handlePhaseComplete = () => {
    if (phase === "work") {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);

      // 儲存到 localStorage
      const today = getTodayKey();
      setSessions((prev) => {
        const existing = prev.find((s) => s.date === today);
        let updated: Session[];
        if (existing) {
          updated = prev.map((s) => s.date === today
            ? { ...s, pomodoros: s.pomodoros + 1, totalMinutes: s.totalMinutes + workDuration }
            : s
          );
        } else {
          updated = [...prev, { date: today, pomodoros: 1, totalMinutes: workDuration, label: sessionLabel }];
        }
        localStorage.setItem("pomodoro_sessions", JSON.stringify(updated));
        return updated;
      });

      // 每 4 個番茄鐘後長休息
      if (newCount % 4 === 0) {
        setPhase("long_break");
        setTimeLeft(longBreak * 60);
      } else {
        setPhase("short_break");
        setTimeLeft(shortBreak * 60);
      }
    } else {
      setPhase("work");
      setTimeLeft(workDuration * 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(PHASE_CONFIG[phase].duration * 60);
  };

  const handlePhaseSwitch = (newPhase: Phase) => {
    setIsRunning(false);
    setPhase(newPhase);
    const dur = newPhase === "work" ? workDuration : newPhase === "short_break" ? shortBreak : longBreak;
    setTimeLeft(dur * 60);
  };

  const handleSave = () => {
    if (!isAuthenticated) return;
    const todaySession = sessions.find((s) => s.date === getTodayKey());
    saveMutation.mutate({
      toolId: "pomodoro-tracker",
      category: "health",
      inputParams: { workDuration, shortBreak, longBreak },
      result: {
        todayPomodoros: todaySession?.pomodoros ?? 0,
        todayMinutes: todaySession?.totalMinutes ?? 0,
      },
    });
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  // 週統計圖表
  const weekDays = getWeekDays();
  const chartData = weekDays.map((day) => {
    const s = sessions.find((x) => x.date === day);
    return {
      day: day.slice(5).replace("-", "/"),
      番茄數: s?.pomodoros ?? 0,
      分鐘: s?.totalMinutes ?? 0,
    };
  });

  const todaySession = sessions.find((s) => s.date === getTodayKey());
  const totalPomodoros = sessions.reduce((acc, s) => acc + s.pomodoros, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Timer className="h-6 w-6 text-primary" />
          番茄鐘專注統計器
        </h1>
        <p className="text-muted-foreground mt-1">25 分鐘專注 + 5 分鐘休息，提升工作效率</p>
      </div>

      {/* 計時器主體 */}
      <Card>
        <CardContent className="pt-6">
          {/* 階段切換 */}
          <div className="flex gap-2 mb-6 justify-center flex-wrap">
            {(["work", "short_break", "long_break"] as Phase[]).map((p) => (
              <Button
                key={p}
                variant={phase === p ? "default" : "outline"}
                size="sm"
                onClick={() => handlePhaseSwitch(p)}
              >
                {PHASE_CONFIG[p].label}
              </Button>
            ))}
          </div>

          {/* 計時顯示 */}
          <div className="text-center mb-6">
            <div className={`text-7xl font-mono font-bold ${PHASE_CONFIG[phase].color}`}>
              {mm}:{ss}
            </div>
            <p className="text-muted-foreground mt-2">{PHASE_CONFIG[phase].label}</p>
          </div>

          {/* 進度條 */}
          <Progress value={progress} className="mb-6 h-3" />

          {/* 控制按鈕 */}
          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => setIsRunning(!isRunning)}
              className="w-32"
            >
              {isRunning ? <><Pause className="h-5 w-5 mr-2" />暫停</> : <><Play className="h-5 w-5 mr-2" />開始</>}
            </Button>
            <Button variant="outline" size="lg" onClick={handleReset}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          {/* 番茄計數 */}
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            {Array.from({ length: Math.max(pomodoroCount, 4) }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${i < pomodoroCount ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"}`}
              >
                🍅
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            今日完成 {pomodoroCount} 個番茄鐘（每 4 個後長休息）
          </p>
        </CardContent>
      </Card>

      {/* 時間設定 */}
      <Card>
        <CardHeader><CardTitle className="text-base">時間設定</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">專注時間（分）</Label>
            <Input type="number" min={1} max={60} value={workDuration}
              onChange={(e) => { setWorkDuration(parseInt(e.target.value) || 25); if (phase === "work") setTimeLeft((parseInt(e.target.value) || 25) * 60); }} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">短休息（分）</Label>
            <Input type="number" min={1} max={30} value={shortBreak}
              onChange={(e) => { setShortBreak(parseInt(e.target.value) || 5); if (phase === "short_break") setTimeLeft((parseInt(e.target.value) || 5) * 60); }} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">長休息（分）</Label>
            <Input type="number" min={1} max={60} value={longBreak}
              onChange={(e) => { setLongBreak(parseInt(e.target.value) || 15); if (phase === "long_break") setTimeLeft((parseInt(e.target.value) || 15) * 60); }} />
          </div>
        </CardContent>
      </Card>

      {/* 今日統計 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">今日番茄數</p>
            <p className="text-2xl font-bold text-red-500">{todaySession?.pomodoros ?? 0} 🍅</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">今日專注時間</p>
            <p className="text-2xl font-bold">{todaySession?.totalMinutes ?? 0} 分</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">累計番茄數</p>
            <p className="text-2xl font-bold">{totalPomodoros}</p>
          </CardContent>
        </Card>
      </div>

      {/* 週統計圖表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            近 7 天番茄統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="番茄數" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存今日記錄" : "登入後可儲存記錄"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">延伸閱讀</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/health/tdee-eating-out-guide" className="block text-sm text-primary hover:underline">
            → 外食族如何控制熱量？TDEE 實戰應用指南
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
