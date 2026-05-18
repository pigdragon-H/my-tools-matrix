// ============================================================
// OvulationTracker.tsx - 排卵期與經期預測追蹤器
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type DayType = "period" | "fertile" | "ovulation" | "safe" | "next_period" | "normal";

interface CalendarDay {
  date: Date;
  type: DayType;
  label?: string;
}

const DAY_COLORS: Record<DayType, string> = {
  period: "bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200",
  fertile: "bg-pink-200 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200",
  ovulation: "bg-purple-300 dark:bg-purple-900/70 text-purple-900 dark:text-purple-100 font-bold ring-2 ring-purple-500",
  safe: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
  next_period: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-dashed border-red-400",
  normal: "bg-muted text-muted-foreground",
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function OvulationTracker() {
  const [lastPeriodDate, setLastPeriodDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 5);
    return d.toISOString().split("T")[0];
  });
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lutealPhase, setLutealPhase] = useState(14);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    const lastPeriod = new Date(lastPeriodDate);
    const ovulationDay = addDays(lastPeriod, cycleLength - lutealPhase);
    const fertileStart = addDays(ovulationDay, -5);
    const fertileEnd = addDays(ovulationDay, 1);
    const nextPeriodStart = addDays(lastPeriod, cycleLength);
    const nextPeriodEnd = addDays(nextPeriodStart, periodLength - 1);

    // 產生未來 60 天的日曆
    const today = new Date();
    const calendarDays: CalendarDay[] = [];
    for (let i = 0; i < 60; i++) {
      const date = addDays(today, i - 10);
      let type: DayType = "normal";
      let label: string | undefined;

      // 本次經期
      for (let d = 0; d < periodLength; d++) {
        if (isSameDay(date, addDays(lastPeriod, d))) {
          type = "period";
          label = "經期";
        }
      }
      // 排卵日
      if (isSameDay(date, ovulationDay)) {
        type = "ovulation";
        label = "排卵日";
      } else if (date >= fertileStart && date <= fertileEnd) {
        type = "fertile";
        label = "易孕期";
      }
      // 下次經期
      if (date >= nextPeriodStart && date <= nextPeriodEnd) {
        type = "next_period";
        label = "預測經期";
      }

      calendarDays.push({ date, type, label });
    }

    const daysToOvulation = Math.round((ovulationDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysToNextPeriod = Math.round((nextPeriodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ovulationDay, fertileStart, fertileEnd, nextPeriodStart,
      daysToOvulation, daysToNextPeriod, calendarDays,
    };
  }, [lastPeriodDate, cycleLength, periodLength, lutealPhase]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "ovulation-tracker",
      category: "health",
      inputParams: { lastPeriodDate, cycleLength, periodLength },
      result: {
        ovulationDay: result.ovulationDay.toISOString().split("T")[0],
        nextPeriodStart: result.nextPeriodStart.toISOString().split("T")[0],
      },
    });
  };

  const fmt = (d: Date) => d.toLocaleDateString("zh-TW", { month: "long", day: "numeric" });
  const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

  // 取本月+下月的日曆格子
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const calStart = addDays(monthStart, -monthStart.getDay());
  const calGrid: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(calStart, i);
    const found = result.calendarDays.find((d) => isSameDay(d.date, date));
    calGrid.push(found ?? { date, type: "normal" });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          排卵期與經期預測追蹤器
        </h1>
        <p className="text-muted-foreground mt-1">根據月經週期預測排卵日、易孕期與下次經期</p>
      </div>

      <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-lg p-3 text-xs text-pink-700 dark:text-pink-400 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>本工具僅供參考，不可作為避孕或備孕的唯一依據。每個人的週期可能因壓力、健康狀況等因素而有所不同。</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">週期設定</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>最後一次月經開始日</Label>
            <Input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>月經週期天數（天）</Label>
            <Input type="number" min={21} max={45} value={cycleLength} onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)} />
            <p className="text-xs text-muted-foreground">一般為 21～45 天，平均 28 天</p>
          </div>
          <div className="space-y-1">
            <Label>月經持續天數（天）</Label>
            <Input type="number" min={2} max={10} value={periodLength} onChange={(e) => setPeriodLength(parseInt(e.target.value) || 5)} />
          </div>
          <div className="space-y-1">
            <Label>黃體期長度（天）</Label>
            <Input type="number" min={10} max={16} value={lutealPhase} onChange={(e) => setLutealPhase(parseInt(e.target.value) || 14)} />
            <p className="text-xs text-muted-foreground">通常固定為 12～16 天，預設 14 天</p>
          </div>
        </CardContent>
      </Card>

      {/* 重要日期 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-purple-400">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">排卵日</p>
            <p className="font-bold text-purple-600">{fmt(result.ovulationDay)}</p>
            <p className="text-xs text-muted-foreground">
              {result.daysToOvulation > 0 ? `${result.daysToOvulation} 天後` : result.daysToOvulation === 0 ? "今天" : `${-result.daysToOvulation} 天前`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-pink-400">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">易孕期</p>
            <p className="font-bold text-pink-600 text-sm">{fmt(result.fertileStart)} ～ {fmt(result.fertileEnd)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-400">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">下次經期預測</p>
            <p className="font-bold text-red-600">{fmt(result.nextPeriodStart)}</p>
            <p className="text-xs text-muted-foreground">
              {result.daysToNextPeriod > 0 ? `${result.daysToNextPeriod} 天後` : "已到"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">週期長度</p>
            <p className="font-bold">{cycleLength} 天</p>
          </CardContent>
        </Card>
      </div>

      {/* 日曆 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {today.getFullYear()} 年 {today.getMonth() + 1} 月
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calGrid.map((day, idx) => {
              const isCurrentMonth = day.date.getMonth() === today.getMonth();
              const isToday = isSameDay(day.date, today);
              return (
                <div
                  key={idx}
                  className={`
                    relative rounded p-1 text-center text-xs min-h-[36px] flex flex-col items-center justify-center
                    ${isCurrentMonth ? DAY_COLORS[day.type] : "opacity-30 bg-muted text-muted-foreground"}
                    ${isToday ? "ring-2 ring-primary" : ""}
                  `}
                  title={day.label}
                >
                  <span>{day.date.getDate()}</span>
                  {day.label && <span className="text-[9px] leading-tight hidden sm:block">{day.label}</span>}
                </div>
              );
            })}
          </div>
          {/* 圖例 */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            {[
              { type: "period" as DayType, label: "經期" },
              { type: "ovulation" as DayType, label: "排卵日" },
              { type: "fertile" as DayType, label: "易孕期" },
              { type: "next_period" as DayType, label: "預測經期" },
            ].map(({ type, label }) => (
              <div key={type} className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded ${DAY_COLORS[type]}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        {isAuthenticated ? "儲存追蹤記錄" : "登入後可儲存記錄"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">延伸閱讀</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/health/tdee-fat-loss-guide" className="block text-sm text-primary hover:underline">
            → 減脂期間怎麼吃？TDEE 熱量缺口完整攻略
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
