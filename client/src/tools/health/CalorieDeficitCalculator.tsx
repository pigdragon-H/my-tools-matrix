// ============================================================
// CalorieDeficitCalculator - /tools/health/calorie-deficit-calculator
// 熱量赤字/盈餘計算機：依 TDEE 計算減脂/增肌熱量目標
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flame, Calculator, BookOpen, ArrowRight, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const formSchema = z.object({
  tdee: z
    .string()
    .min(1, "請輸入 TDEE")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 800 && Number(v) <= 10000, "TDEE 請輸入 800～10000 大卡"),
  goal: z.enum(["fat_loss_slow", "fat_loss_medium", "fat_loss_fast", "maintain", "muscle_gain_slow", "muscle_gain_medium"]),
  currentWeight: z
    .string()
    .min(1, "請輸入體重")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 20 && Number(v) <= 300, "體重請輸入 20～300 kg"),
});

type FormValues = z.infer<typeof formSchema>;

const GOAL_CONFIG = {
  fat_loss_slow: { label: "緩慢減脂（-10%）", deficit: -0.1, weeklyChange: -0.07, color: "#3b82f6", type: "loss" },
  fat_loss_medium: { label: "標準減脂（-20%）", deficit: -0.2, weeklyChange: -0.14, color: "#f59e0b", type: "loss" },
  fat_loss_fast: { label: "積極減脂（-25%）", deficit: -0.25, weeklyChange: -0.18, color: "#ef4444", type: "loss" },
  maintain: { label: "維持體重（0%）", deficit: 0, weeklyChange: 0, color: "#10b981", type: "maintain" },
  muscle_gain_slow: { label: "精實增肌（+10%）", deficit: 0.1, weeklyChange: 0.07, color: "#8b5cf6", type: "gain" },
  muscle_gain_medium: { label: "積極增肌（+15%）", deficit: 0.15, weeklyChange: 0.11, color: "#ec4899", type: "gain" },
};

const MACRO_RATIOS = {
  fat_loss: { protein: 0.35, carb: 0.40, fat: 0.25 },
  maintain: { protein: 0.25, carb: 0.50, fat: 0.25 },
  muscle_gain: { protein: 0.30, carb: 0.45, fat: 0.25 },
};

export default function CalorieDeficitCalculator() {
  const [result, setResult] = useState<{
    tdee: number;
    targetCalories: number;
    deficit: number;
    weeklyChange: number;
    monthlyChange: number;
    protein: number;
    carb: number;
    fat: number;
    goal: keyof typeof GOAL_CONFIG;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const saveResult = trpc.tools.saveResult.useMutation();
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "health" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { tdee: "2000", goal: "fat_loss_medium", currentWeight: "70" },
  });

  function onSubmit(values: FormValues) {
    setIsCalculating(true);
    setTimeout(() => {
      const tdee = Number(values.tdee);
      const weight = Number(values.currentWeight);
      const cfg = GOAL_CONFIG[values.goal];
      const targetCalories = Math.round(tdee * (1 + cfg.deficit));
      const deficit = Math.round(tdee * cfg.deficit);
      const weeklyChange = Math.round(cfg.weeklyChange * 100) / 100;
      const monthlyChange = Math.round(weeklyChange * 4.3 * 100) / 100;

      const macroType = values.goal.startsWith("fat_loss") ? "fat_loss" : values.goal === "maintain" ? "maintain" : "muscle_gain";
      const ratios = MACRO_RATIOS[macroType];
      const protein = Math.round((targetCalories * ratios.protein) / 4);
      const carb = Math.round((targetCalories * ratios.carb) / 4);
      const fat = Math.round((targetCalories * ratios.fat) / 9);

      setResult({ tdee, targetCalories, deficit, weeklyChange, monthlyChange, protein, carb, fat, goal: values.goal });
      setIsCalculating(false);
      saveResult.mutate({
        toolId: "calorie-deficit-calculator",
        category: "health",
        inputParams: { tdee, goal: values.goal, currentWeight: weight },
        result: { targetCalories, deficit, protein, carb, fat },
      });
    }, 300);
  }

  const goalCfg = result ? GOAL_CONFIG[result.goal] : null;

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
            <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">熱量赤字／盈餘計算機</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              依 TDEE 設定減脂或增肌熱量目標，自動分配三大營養素
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              輸入基礎數據
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="tdee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>每日總消耗熱量 TDEE（大卡）</FormLabel>
                      <FormControl><Input placeholder="例：2000" {...field} inputMode="numeric" /></FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">不知道 TDEE？可先使用 TDEE 計算機</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目前體重（kg）</FormLabel>
                      <FormControl><Input placeholder="例：70" {...field} inputMode="decimal" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目標設定</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="fat_loss_slow">緩慢減脂（-10%，保肌效果佳）</SelectItem>
                          <SelectItem value="fat_loss_medium">標準減脂（-20%，推薦）</SelectItem>
                          <SelectItem value="fat_loss_fast">積極減脂（-25%，需監控）</SelectItem>
                          <SelectItem value="maintain">維持體重（0%）</SelectItem>
                          <SelectItem value="muscle_gain_slow">精實增肌（+10%，少脂肪）</SelectItem>
                          <SelectItem value="muscle_gain_medium">積極增肌（+15%，增肌快）</SelectItem>
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
                    <><Flame className="h-4 w-4" />計算熱量目標</>
                  )}
                </Button>
              </form>
            </Form>

            {result && goalCfg && (
              <div className="mt-6 space-y-3">
                <Separator />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">計算結果</p>
                {[
                  { label: "您的 TDEE", value: `${result.tdee} 大卡`, color: "" },
                  {
                    label: "每日目標熱量",
                    value: `${result.targetCalories} 大卡`,
                    color: goalCfg.type === "loss" ? "text-blue-500" : goalCfg.type === "gain" ? "text-purple-500" : "text-emerald-500",
                  },
                  {
                    label: goalCfg.type === "loss" ? "熱量缺口" : goalCfg.type === "gain" ? "熱量盈餘" : "熱量差",
                    value: `${Math.abs(result.deficit)} 大卡/天`,
                    color: goalCfg.type === "loss" ? "text-orange-500" : "text-pink-500",
                  },
                  {
                    label: "預估每週體重變化",
                    value: `${result.weeklyChange > 0 ? "+" : ""}${result.weeklyChange} kg`,
                    color: goalCfg.type === "loss" ? "text-blue-500" : "text-purple-500",
                  },
                  {
                    label: "預估每月體重變化",
                    value: `${result.monthlyChange > 0 ? "+" : ""}${result.monthlyChange} kg`,
                    color: goalCfg.type === "loss" ? "text-blue-500" : "text-purple-500",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4" />
              每日營養素分配
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Flame className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">輸入數據後點擊「計算熱量目標」</p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="macros">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="macros" className="flex-1">三大營養素</TabsTrigger>
                  <TabsTrigger value="meals" className="flex-1">每餐分配</TabsTrigger>
                </TabsList>

                <TabsContent value="macros" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "蛋白質", value: result.protein, unit: "g", cal: result.protein * 4, color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-950/30" },
                      { label: "碳水化合物", value: result.carb, unit: "g", cal: result.carb * 4, color: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950/30" },
                      { label: "脂肪", value: result.fat, unit: "g", cal: result.fat * 9, color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                    ].map((m) => (
                      <div key={m.label} className={`rounded-lg p-3 text-center ${m.bg}`}>
                        <div className="text-2xl font-black" style={{ color: m.color }}>{m.value}g</div>
                        <div className="text-xs font-medium mt-1">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.cal} 大卡</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>每日目標總熱量</span>
                      <span style={{ color: goalCfg?.color }}>{result.targetCalories} 大卡</span>
                    </div>
                    <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500" style={{ width: `${(result.protein * 4 / result.targetCalories) * 100}%` }} />
                      <div className="bg-amber-500" style={{ width: `${(result.carb * 4 / result.targetCalories) * 100}%` }} />
                      <div className="bg-emerald-500" style={{ width: `${(result.fat * 9 / result.targetCalories) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="text-blue-500">蛋白質 {Math.round((result.protein * 4 / result.targetCalories) * 100)}%</span>
                      <span className="text-amber-500">碳水 {Math.round((result.carb * 4 / result.targetCalories) * 100)}%</span>
                      <span className="text-emerald-500">脂肪 {Math.round((result.fat * 9 / result.targetCalories) * 100)}%</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="meals" className="space-y-3">
                  {[
                    { meal: "早餐", ratio: 0.25 },
                    { meal: "午餐", ratio: 0.35 },
                    { meal: "晚餐", ratio: 0.30 },
                    { meal: "點心", ratio: 0.10 },
                  ].map(({ meal, ratio }) => (
                    <div key={meal} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="font-medium text-sm">{meal}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">{Math.round(result.targetCalories * ratio)} 大卡</div>
                        <div className="text-xs text-muted-foreground">
                          蛋白質 {Math.round(result.protein * ratio)}g ／ 碳水 {Math.round(result.carb * ratio)}g ／ 脂肪 {Math.round(result.fat * ratio)}g
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
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
