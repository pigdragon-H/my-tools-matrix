// ============================================================
// TdeeCalculator - /tools/health/tdee-calculator
// TDEE 健身熱量計算機，輸出三大營養素分配
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dumbbell, Calculator, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

// ── Zod Schema ────────────────────────────────────────────
const formSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z
    .string()
    .min(1, "請輸入年齡")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 10 && Number(v) <= 100, "年齡需介於 10-100"),
  height: z
    .string()
    .min(1, "請輸入身高")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 100 && Number(v) <= 250, "身高需介於 100-250 cm"),
  weight: z
    .string()
    .min(1, "請輸入體重")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 30 && Number(v) <= 300, "體重需介於 30-300 kg"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose", "maintain", "gain"]),
});

type FormValues = z.infer<typeof formSchema>;

const activityMultipliers = {
  sedentary: { label: "久坐（幾乎不運動）", value: 1.2 },
  light: { label: "輕度活動（每週 1-3 天）", value: 1.375 },
  moderate: { label: "中度活動（每週 3-5 天）", value: 1.55 },
  active: { label: "高度活動（每週 6-7 天）", value: 1.725 },
  very_active: { label: "非常活躍（體力勞動）", value: 1.9 },
};

const goalAdjustments = {
  lose: { label: "減脂", adjustment: -500, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  maintain: { label: "維持體重", adjustment: 0, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  gain: { label: "增肌", adjustment: 300, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

interface MacroResult {
  tdee: number;
  targetCalories: number;
  bmr: number;
  protein: number; // grams
  carbs: number;
  fat: number;
}

function calculateTDEE(
  gender: "male" | "female",
  age: number,
  height: number,
  weight: number,
  activityLevel: keyof typeof activityMultipliers,
  goal: keyof typeof goalAdjustments
): MacroResult {
  // Mifflin-St Jeor 公式
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = Math.round(bmr * activityMultipliers[activityLevel].value);
  const targetCalories = Math.max(1200, tdee + goalAdjustments[goal].adjustment);

  // 三大營養素分配（蛋白質 30%、碳水 40%、脂肪 30%）
  const protein = Math.round((targetCalories * 0.3) / 4); // 4 kcal/g
  const carbs = Math.round((targetCalories * 0.4) / 4);
  const fat = Math.round((targetCalories * 0.3) / 9); // 9 kcal/g

  return { tdee, targetCalories, bmr: Math.round(bmr), protein, carbs, fat };
}

const MACRO_COLORS = ["#10b981", "#6366f1", "#f59e0b"];

export default function TdeeCalculator() {
  const [result, setResult] = useState<MacroResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const saveResult = trpc.tools.saveResult.useMutation();
  // 相關文章：只顯示同一 category（health）的文章，避免跨類別推薦
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "health" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "male",
      age: "25",
      height: "170",
      weight: "70",
      activityLevel: "moderate",
      goal: "maintain",
    },
  });

  function onSubmit(values: FormValues) {
    setIsCalculating(true);
    setTimeout(() => {
      const res = calculateTDEE(
        values.gender,
        Number(values.age),
        Number(values.height),
        Number(values.weight),
        values.activityLevel,
        values.goal
      );
      setResult(res);
      setIsCalculating(false);

      saveResult.mutate({
        toolId: "tdee-calculator",
        category: "health",
        inputParams: {
          gender: values.gender,
          age: Number(values.age),
          height: Number(values.height),
          weight: Number(values.weight),
          activityLevel: values.activityLevel,
          goal: values.goal,
        },
        result: { tdee: res.tdee, targetCalories: res.targetCalories, protein: res.protein, carbs: res.carbs, fat: res.fat },
      });
    }, 300);
  }

  const pieData = result
    ? [
        { name: "蛋白質", value: result.protein * 4, grams: result.protein },
        { name: "碳水化合物", value: result.carbs * 4, grams: result.carbs },
        { name: "脂肪", value: result.fat * 9, grams: result.fat },
      ]
    : [];

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-rose-100 dark:bg-rose-900/30 p-2">
            <Dumbbell className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">TDEE 健身熱量計算機</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              計算每日總消耗熱量與三大營養素最佳分配
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ── Input Form ──────────────────────────────────── */}
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
                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>性別</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <label htmlFor="male" className="text-sm cursor-pointer">男性</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <label htmlFor="female" className="text-sm cursor-pointer">女性</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-3">
                  {(["age", "height", "weight"] as const).map((field) => (
                    <FormField
                      key={field}
                      control={form.control}
                      name={field}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            {field === "age" ? "年齡" : field === "height" ? "身高(cm)" : "體重(kg)"}
                          </FormLabel>
                          <FormControl>
                            <Input {...f} inputMode="decimal" className="text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>活動量</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(activityMultipliers).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目標</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(goalAdjustments).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full gap-2" disabled={isCalculating}>
                  {isCalculating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />計算中...</>
                  ) : (
                    <><Calculator className="h-4 w-4" />計算 TDEE</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ── Results ─────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                計算結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
                  <div className="text-center">
                    <Dumbbell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">輸入資料後點擊「計算 TDEE」</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Key metrics */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      { label: "基礎代謝率 (BMR)", value: `${result.bmr} kcal`, sub: "靜止狀態消耗" },
                      { label: "每日總消耗 (TDEE)", value: `${result.tdee} kcal`, sub: "含活動量" },
                      { label: "目標熱量", value: `${result.targetCalories} kcal`, sub: "依目標調整" },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="rounded-lg bg-muted/40 p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className="text-lg font-bold text-primary">{value}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Macro pie chart */}
                  <div>
                    <p className="text-sm font-medium mb-3">三大營養素分配</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={MACRO_COLORS[i] ?? "#10b981"} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v: number, name: string, props) => [
                              `${props.payload.grams}g (${v} kcal)`,
                              name,
                            ]}
                            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="space-y-2">
                        {[
                          { label: "蛋白質", grams: result.protein, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
                          { label: "碳水化合物", grams: result.carbs, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
                          { label: "脂肪", grams: result.fat, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
                        ].map(({ label, grams, color, bg }) => (
                          <div key={label} className={`flex items-center justify-between rounded-lg p-3 ${bg}`}>
                            <span className="text-sm font-medium">{label}</span>
                            <div className="text-right">
                              <span className={`text-base font-bold ${color}`}>{grams}g</span>
                              <p className="text-xs text-muted-foreground">
                                {label === "脂肪" ? grams * 9 : grams * 4} kcal
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Related Articles ──────────────────────────────── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="mt-10">
          <Separator className="mb-6" />
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            相關知識文章
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((article) => (
              <Link key={article.id} href={`/blog/${article.category}/${article.id}`}>
                <div className="group rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                  <Badge variant="secondary" className="text-xs mb-2">健康</Badge>
                  <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    閱讀文章 <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
