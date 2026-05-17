// ============================================================
// TDEE Calculator - 健身熱量計算機
// 輸出每日建議熱量與三大營養素分配、Zod 驗證、RWD、深色模式
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dumbbell, Calculator, Loader2, BookOpen, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { PaywallGuard } from "@/components/PaywallGuard";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { getToolById, type SeoArticle } from "@shared/toolsConfig";

const tdeeSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z
    .number("請輸入有效數字")
    .int("年齡須為整數")
    .min(10, "年齡至少 10 歲")
    .max(100, "年齡不超過 100 歲"),
  height: z
    .number("請輸入有效數字")
    .min(100, "身高至少 100 公分")
    .max(250, "身高不超過 250 公分"),
  weight: z
    .number("請輸入有效數字")
    .min(20, "體重至少 20 公斤")
    .max(300, "體重不超過 300 公斤"),
  activityLevel: z.string().min(1, "請選擇活動量"),
  goal: z.enum(["lose", "maintain", "gain"]),
});

type TdeeFormValues = z.infer<typeof tdeeSchema>;

const activityLevels = [
  { value: "sedentary", label: "久坐不動（辦公室工作，幾乎不運動）", multiplier: 1.2 },
  { value: "light", label: "輕度活動（每週運動 1-3 天）", multiplier: 1.375 },
  { value: "moderate", label: "中度活動（每週運動 3-5 天）", multiplier: 1.55 },
  { value: "active", label: "高度活動（每週運動 6-7 天）", multiplier: 1.725 },
  { value: "veryActive", label: "極高活動（體力勞動或每天訓練）", multiplier: 1.9 },
];

interface TdeeResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  proteinCal: number;
  carbsCal: number;
  fatCal: number;
}

function calculateTDEE(values: TdeeFormValues): TdeeResult {
  // Mifflin-St Jeor Equation
  const bmr =
    values.gender === "male"
      ? 10 * values.weight + 6.25 * values.height - 5 * values.age + 5
      : 10 * values.weight + 6.25 * values.height - 5 * values.age - 161;

  const activityMultiplier =
    activityLevels.find((l) => l.value === values.activityLevel)?.multiplier ?? 1.55;

  const tdee = Math.round(bmr * activityMultiplier);

  // Adjust for goal
  const goalAdjustment = values.goal === "lose" ? -500 : values.goal === "gain" ? 300 : 0;
  const targetCalories = tdee + goalAdjustment;

  // Macros distribution
  // Protein: 30%, Carbs: 45%, Fat: 25%
  const proteinCal = Math.round(targetCalories * 0.30);
  const carbsCal = Math.round(targetCalories * 0.45);
  const fatCal = Math.round(targetCalories * 0.25);

  const protein = Math.round(proteinCal / 4);
  const carbs = Math.round(carbsCal / 4);
  const fat = Math.round(fatCal / 9);

  return { bmr: Math.round(bmr), tdee, targetCalories, protein, carbs, fat, proteinCal, carbsCal, fatCal };
}

const toolConfig = getToolById("tdee-calculator");

export default function TdeeCalculator() {
  const [result, setResult] = useState<TdeeResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const saveResult = trpc.tools.saveResult.useMutation();

  const form = useForm<TdeeFormValues>({
    resolver: zodResolver(tdeeSchema),
    defaultValues: {
      gender: "male",
      age: 30,
      height: 170,
      weight: 70,
      activityLevel: "moderate",
      goal: "maintain",
    },
  });

  const onSubmit = async (values: TdeeFormValues) => {
    setIsCalculating(true);
    await new Promise((r) => setTimeout(r, 300));
    const data = calculateTDEE(values);
    setResult(data);
    setIsCalculating(false);

    saveResult.mutate({
      toolId: "tdee-calculator",
      inputParams: values as unknown as Record<string, unknown>,
      result: data as unknown as Record<string, unknown>,
    });
  };

  const goalLabels = { lose: "減脂", maintain: "維持", gain: "增肌" };

  return (
    <PaywallGuard isPremium={toolConfig?.isPremium ?? false} toolName={toolConfig?.name}>
      <div className="container max-w-5xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
              <Dumbbell className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">TDEE 健身熱量計算機</h1>
              <p className="text-sm text-muted-foreground">精確計算每日總消耗熱量與三大營養素建議</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">健康工具</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                個人資料
              </CardTitle>
              <CardDescription>填入您的基本資料，計算個人化熱量需求</CardDescription>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem>
                        <FormLabel>年齡</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="30" {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="height" render={({ field }) => (
                      <FormItem>
                        <FormLabel>身高(cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="170" {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="weight" render={({ field }) => (
                      <FormItem>
                        <FormLabel>體重(kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="70" {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>活動量</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇活動量" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Goal */}
                  <FormField control={form.control} name="goal" render={({ field }) => (
                    <FormItem>
                      <FormLabel>健身目標</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-3">
                          {(["lose", "maintain", "gain"] as const).map((g) => (
                            <div key={g} className="flex items-center space-x-2">
                              <RadioGroupItem value={g} id={g} />
                              <label htmlFor={g} className="text-sm cursor-pointer">{goalLabels[g]}</label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full" disabled={isCalculating}>
                    {isCalculating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />計算中...</>
                    ) : (
                      <><Calculator className="mr-2 h-4 w-4" />計算 TDEE</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Calorie Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-slate-50 dark:bg-slate-900/50">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">基礎代謝率 BMR</p>
                      <p className="text-2xl font-bold">{result.bmr}</p>
                      <p className="text-xs text-muted-foreground">大卡/天</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">每日總消耗 TDEE</p>
                      <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{result.tdee}</p>
                      <p className="text-xs text-muted-foreground">大卡/天</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">建議攝取熱量</p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{result.targetCalories}</p>
                      <p className="text-xs text-muted-foreground">大卡/天</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Macros */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flame className="h-4 w-4 text-rose-500" />
                      三大營養素分配
                    </CardTitle>
                    <CardDescription>基於建議攝取熱量 {result.targetCalories} 大卡計算</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Protein */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Beef className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">蛋白質</span>
                          <Badge variant="outline" className="text-xs">30%</Badge>
                        </div>
                        <span className="text-sm font-semibold">{result.protein}g <span className="text-muted-foreground font-normal">({result.proteinCal} kcal)</span></span>
                      </div>
                      <Progress value={30} className="h-2 [&>div]:bg-red-500" />
                    </div>
                    {/* Carbs */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wheat className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium">碳水化合物</span>
                          <Badge variant="outline" className="text-xs">45%</Badge>
                        </div>
                        <span className="text-sm font-semibold">{result.carbs}g <span className="text-muted-foreground font-normal">({result.carbsCal} kcal)</span></span>
                      </div>
                      <Progress value={45} className="h-2 [&>div]:bg-amber-500" />
                    </div>
                    {/* Fat */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">脂肪</span>
                          <Badge variant="outline" className="text-xs">25%</Badge>
                        </div>
                        <span className="text-sm font-semibold">{result.fat}g <span className="text-muted-foreground font-normal">({result.fatCal} kcal)</span></span>
                      </div>
                      <Progress value={25} className="h-2 [&>div]:bg-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center min-h-[300px] border-dashed">
                <div className="text-center text-muted-foreground">
                  <Dumbbell className="mx-auto h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">填入左側個人資料並點擊「計算 TDEE」</p>
                  <p className="text-xs mt-1">即可看到您的個人化熱量建議</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        <AdSenseWrapper showAds={toolConfig?.showAds ?? true} adFormat="horizontal" />

        {/* SEO Articles */}
        {toolConfig?.seoArticles && toolConfig.seoArticles.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground">相關閱讀</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {toolConfig.seoArticles.map((article: SeoArticle) => (
                <Link key={article.id} href={`/blog/${article.id}`}>
                  <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium line-clamp-2 leading-snug">{article.title}</p>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{article.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PaywallGuard>
  );
}
