// ============================================================
// SleepCycleCalculator - /tools/health/sleep-cycle-calculator
// 睡眠週期計算器：依入睡時間推算最佳起床時間（90分鐘週期）
// ============================================================

import { useState } from "react";
import { Moon, Sun, Clock, BookOpen, ArrowRight, Info } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

const SLEEP_ONSET_MINUTES = 14; // 平均入睡時間
const CYCLE_MINUTES = 90; // 一個睡眠週期

interface WakeOption {
  cycles: number;
  totalMinutes: number;
  wakeTime: string;
  quality: "excellent" | "good" | "ok";
  label: string;
}

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function calcWakeOptions(bedtime: string): WakeOption[] {
  const options: WakeOption[] = [];
  const qualities: WakeOption["quality"][] = ["ok", "ok", "good", "excellent", "excellent", "good"];
  const labels = ["3 個週期（4.5 小時）", "4 個週期（6 小時）", "5 個週期（7.5 小時）", "6 個週期（9 小時）", "7 個週期（10.5 小時）", "8 個週期（12 小時）"];

  for (let i = 3; i <= 8; i++) {
    const totalMinutes = SLEEP_ONSET_MINUTES + i * CYCLE_MINUTES;
    options.push({
      cycles: i,
      totalMinutes,
      wakeTime: addMinutes(bedtime, totalMinutes),
      quality: qualities[i - 3],
      label: labels[i - 3],
    });
  }
  return options;
}

// 反向：想在某時間起床，推算應幾點上床
function calcBedtimeOptions(wakeTime: string): { bedtime: string; cycles: number; label: string }[] {
  const options = [];
  const labels = ["3 個週期（4.5 小時）", "4 個週期（6 小時）", "5 個週期（7.5 小時）", "6 個週期（9 小時）"];

  for (let i = 3; i <= 6; i++) {
    const totalMinutes = SLEEP_ONSET_MINUTES + i * CYCLE_MINUTES;
    const [h, m] = wakeTime.split(":").map(Number);
    const wakeTotal = h * 60 + m;
    const bedTotal = ((wakeTotal - totalMinutes) % 1440 + 1440) % 1440;
    const bedH = Math.floor(bedTotal / 60);
    const bedM = bedTotal % 60;
    options.push({
      bedtime: `${String(bedH).padStart(2, "0")}:${String(bedM).padStart(2, "0")}`,
      cycles: i,
      label: labels[i - 3],
    });
  }
  return options;
}

const qualityConfig = {
  excellent: { label: "最佳", color: "text-emerald-500", bg: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30" },
  good: { label: "良好", color: "text-blue-500", bg: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30" },
  ok: { label: "尚可", color: "text-amber-500", bg: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30" },
};

export default function SleepCycleCalculator() {
  const [mode, setMode] = useState<"bedtime" | "wakeup">("bedtime");
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeup, setWakeup] = useState("07:00");
  const [wakeOptions, setWakeOptions] = useState<WakeOption[] | null>(null);
  const [bedOptions, setBedOptions] = useState<{ bedtime: string; cycles: number; label: string }[] | null>(null);
  const saveResult = trpc.tools.saveResult.useMutation();
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "health" });

  function calculate() {
    if (mode === "bedtime") {
      const opts = calcWakeOptions(bedtime);
      setWakeOptions(opts);
      setBedOptions(null);
      saveResult.mutate({
        toolId: "sleep-cycle-calculator",
        category: "health",
        inputParams: { mode, bedtime },
        result: { recommendedWake: opts.find((o) => o.quality === "excellent")?.wakeTime ?? opts[2].wakeTime },
      });
    } else {
      const opts = calcBedtimeOptions(wakeup);
      setBedOptions(opts);
      setWakeOptions(null);
      saveResult.mutate({
        toolId: "sleep-cycle-calculator",
        category: "health",
        inputParams: { mode, wakeup },
        result: { recommendedBedtime: opts[2]?.bedtime ?? opts[1].bedtime },
      });
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-2">
            <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">睡眠週期計算器</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              依 90 分鐘睡眠週期，推算最佳起床時間或入睡時間
            </p>
          </div>
        </div>
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            人體睡眠以 <strong>90 分鐘</strong>為一個週期，在週期結束時自然醒來，精神最好。本計算器已加入平均 <strong>14 分鐘</strong>入睡時間。
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              計算模式
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 模式切換 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={mode === "bedtime" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("bedtime")}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                我幾點睡
              </Button>
              <Button
                variant={mode === "wakeup" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("wakeup")}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                我幾點起
              </Button>
            </div>

            {mode === "bedtime" ? (
              <div className="space-y-2">
                <Label>預計入睡時間</Label>
                <Input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="text-lg font-mono"
                />
                <p className="text-xs text-muted-foreground">系統會推算 3～8 個週期的最佳起床時間</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>需要幾點起床</Label>
                <Input
                  type="time"
                  value={wakeup}
                  onChange={(e) => setWakeup(e.target.value)}
                  className="text-lg font-mono"
                />
                <p className="text-xs text-muted-foreground">系統會推算應在幾點上床睡覺</p>
              </div>
            )}

            <Button className="w-full gap-2" onClick={calculate}>
              <Moon className="h-4 w-4" />
              計算睡眠時間
            </Button>

            {/* 睡眠週期說明 */}
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">睡眠週期說明</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>入睡期</span><span className="text-muted-foreground">約 14 分鐘</span></div>
                <div className="flex justify-between"><span>淺眠期（N1/N2）</span><span className="text-muted-foreground">45 分鐘</span></div>
                <div className="flex justify-between"><span>深眠期（N3）</span><span className="text-muted-foreground">25 分鐘</span></div>
                <div className="flex justify-between"><span>REM 快速動眼期</span><span className="text-muted-foreground">20 分鐘</span></div>
                <Separator className="my-1" />
                <div className="flex justify-between font-medium"><span>一個完整週期</span><span>約 90 分鐘</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              {mode === "bedtime" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {mode === "bedtime" ? "推薦起床時間" : "推薦入睡時間"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!wakeOptions && !bedOptions ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Moon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">設定時間後點擊「計算睡眠時間」</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {wakeOptions?.map((opt) => {
                  const qc = qualityConfig[opt.quality];
                  return (
                    <div key={opt.cycles} className={`rounded-lg border p-3 ${qc.bg}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold font-mono">{opt.wakeTime}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{opt.label}</div>
                        </div>
                        <Badge className={`${qc.color} border-current bg-transparent`}>{qc.label}</Badge>
                      </div>
                    </div>
                  );
                })}

                {bedOptions?.map((opt) => (
                  <div key={opt.cycles} className="rounded-lg border p-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold font-mono">{opt.bedtime}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{opt.label}</div>
                      </div>
                      <Badge variant="outline">{opt.cycles} 個週期</Badge>
                    </div>
                  </div>
                ))}

                <p className="text-xs text-muted-foreground pt-1">
                  ✦ 建議選擇「最佳」或「良好」的時間起床，精神狀態最佳
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {relatedArticles && relatedArticles.length > 0 && (
        <div className="mt-10">
          <Separator className="mb-6" />
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            相關知識文章
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/blog/${article.category}/${article.id}`}>
                <div className="group rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                  <Badge variant="secondary" className="text-xs mb-2">健康</Badge>
                  <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">閱讀文章 <ArrowRight className="h-3 w-3" /></p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
