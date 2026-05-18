// ============================================================
// WaterIntakeCalculator - /tools/health/water-intake-calculator
// 每日飲水量計算機：依體重、活動量、氣候計算建議飲水量
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Droplets, Calculator, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

const formSchema = z.object({
  weight: z
    .string()
    .min(1, "請輸入體重")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 20 && Number(v) <= 300, "體重請輸入 20～300 kg"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  climate: z.enum(["cool", "normal", "hot", "very_hot"]),
  age: z
    .string()
    .min(1, "請輸入年齡")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 120, "年齡請輸入 1～120 歲"),
});

type FormValues = z.infer<typeof formSchema>;

const ACTIVITY_MULTIPLIER = {
  sedentary: { label: "久坐（辦公室、少走動）", multiplier: 30 },
  light: { label: "輕度活動（每週運動 1-2 次）", multiplier: 33 },
  moderate: { label: "中度活動（每週運動 3-4 次）", multiplier: 35 },
  active: { label: "高度活動（每週運動 5-6 次）", multiplier: 38 },
  very_active: { label: "非常活躍（每天運動或體力勞動）", multiplier: 40 },
};

const CLIMATE_EXTRA = {
  cool: { label: "涼爽（< 20°C）", extra: 0 },
  normal: { label: "適中（20-28°C）", extra: 200 },
  hot: { label: "炎熱（28-35°C）", extra: 400 },
  very_hot: { label: "酷熱（> 35°C）", extra: 700 },
};

const GLASS_ML = 250; // 一杯 250ml

interface HourlySchedule {
  time: string;
  amount: number;
  note: string;
}

function generateSchedule(totalMl: number): HourlySchedule[] {
  const schedule = [
    { time: "07:00", note: "起床後空腹飲水" },
    { time: "09:00", note: "上午工作前" },
    { time: "11:00", note: "上午工作中" },
    { time: "13:00", note: "午餐前 30 分鐘" },
    { time: "15:00", note: "下午工作中" },
    { time: "17:00", note: "傍晚補水" },
    { time: "19:00", note: "晚餐前 30 分鐘" },
    { time: "21:00", note: "睡前 2 小時" },
  ];
  const perSlot = Math.round(totalMl / schedule.length / 50) * 50;
  return schedule.map((s) => ({ ...s, amount: perSlot }));
}

export default function WaterIntakeCalculator() {
  const [result, setResult] = useState<{
    totalMl: number;
    glasses: number;
    schedule: HourlySchedule[];
    breakdown: { label: string; ml: number }[];
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [consumed, setConsumed] = useState(0);
  const saveResult = trpc.tools.saveResult.useMutation();
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "health" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { weight: "65", activityLevel: "light", climate: "normal", age: "30" },
  });

  function onSubmit(values: FormValues) {
    setIsCalculating(true);
    setTimeout(() => {
      const weight = Number(values.weight);
      const age = Number(values.age);
      const actCfg = ACTIVITY_MULTIPLIER[values.activityLevel];
      const climCfg = CLIMATE_EXTRA[values.climate];

      // 基礎飲水量：體重 × 活動係數 ml
      const base = weight * actCfg.multiplier;
      // 氣候加成
      const climateExtra = climCfg.extra;
      // 年齡調整（>65 歲略減）
      const ageAdj = age > 65 ? -200 : 0;

      const totalMl = Math.round((base + climateExtra + ageAdj) / 50) * 50;
      const glasses = Math.round(totalMl / GLASS_ML * 10) / 10;
      const schedule = generateSchedule(totalMl);

      setResult({
        totalMl,
        glasses,
        schedule,
        breakdown: [
          { label: "基礎需水量（體重 × 活動係數）", ml: Math.round(base) },
          { label: `氣候加成（${climCfg.label}）`, ml: climateExtra },
          { label: "年齡調整", ml: ageAdj },
        ],
      });
      setConsumed(0);
      setIsCalculating(false);
      saveResult.mutate({
        toolId: "water-intake-calculator",
        category: "health",
        inputParams: { weight, activityLevel: values.activityLevel, climate: values.climate, age },
        result: { totalMl, glasses },
      });
    }, 200);
  }

  const progressPercent = result ? Math.min(100, Math.round((consumed / result.totalMl) * 100)) : 0;

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/30 p-2">
            <Droplets className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">每日飲水量計算機</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              依體重、活動量與氣候計算個人化飲水目標，附每日喝水時程表
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              輸入個人資料
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>體重（kg）</FormLabel>
                        <FormControl><Input placeholder="例：65" {...field} inputMode="decimal" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>年齡（歲）</FormLabel>
                        <FormControl><Input placeholder="例：30" {...field} inputMode="numeric" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>活動程度</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {Object.entries(ACTIVITY_MULTIPLIER).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="climate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>所在氣候 / 環境溫度</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {Object.entries(CLIMATE_EXTRA).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gap-2" disabled={isCalculating}>
                  {isCalculating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />計算中...</>
                  ) : (
                    <><Droplets className="h-4 w-4" />計算飲水目標</>
                  )}
                </Button>
              </form>
            </Form>

            {result && (
              <div className="mt-6 space-y-3">
                <Separator />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">計算結果</p>
                <div className="text-center py-2">
                  <div className="text-4xl font-black text-cyan-500">{result.totalMl} ml</div>
                  <div className="text-sm text-muted-foreground mt-1">約 {result.glasses} 杯（每杯 250ml）</div>
                </div>
                <Separator />
                {result.breakdown.map(({ label, ml }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium">{ml > 0 ? `+${ml}` : ml} ml</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              今日喝水進度 & 時程表
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Droplets className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">輸入資料後點擊「計算飲水目標」</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 進度追蹤 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">今日進度</span>
                    <span className="text-cyan-500 font-bold">{consumed} / {result.totalMl} ml ({progressPercent}%)</span>
                  </div>
                  <Progress value={progressPercent} className="h-4" />
                  <div className="flex gap-2">
                    {[250, 500, 750].map((ml) => (
                      <Button key={ml} variant="outline" size="sm" className="flex-1 text-xs gap-1"
                        onClick={() => setConsumed((c) => Math.min(result.totalMl, c + ml))}>
                        <Droplets className="h-3 w-3 text-cyan-500" />+{ml}ml
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground"
                      onClick={() => setConsumed(0)}>重置</Button>
                  </div>
                </div>

                <Separator />

                {/* 時程表 */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">建議喝水時程表</p>
                  <div className="space-y-2">
                    {result.schedule.map((s) => (
                      <div key={s.time} className="flex items-center gap-3 text-sm">
                        <span className="font-mono text-xs w-12 text-muted-foreground">{s.time}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="h-1.5 rounded-full bg-cyan-200 dark:bg-cyan-900" style={{ width: `${(s.amount / 500) * 100}%`, minWidth: "20%" }} />
                          <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">{s.amount}ml</span>
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block">{s.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-cyan-50 dark:bg-cyan-950/30 p-3 text-xs text-cyan-700 dark:text-cyan-300">
                  💡 睡前 2 小時後避免大量飲水，以免影響睡眠品質。運動後每流失 1 公斤汗水，需補充約 1000ml 水分。
                </div>
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
