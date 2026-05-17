// ============================================================
// Car Depreciation Calculator - 中古車折舊估算器
// 輸出未來 5 年殘值階梯表、Zod 驗證、RWD、深色模式
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, Calculator, Loader2, BookOpen, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { PaywallGuard } from "@/components/PaywallGuard";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { getToolById, type SeoArticle } from "@shared/toolsConfig";

const carSchema = z.object({
  newCarPrice: z
    .number("請輸入有效數字")
    .min(100_000, "新車價至少 10 萬元")
    .max(50_000_000, "新車價不超過 5000 萬元"),
  currentAge: z
    .number("請輸入有效數字")
    .int("車齡須為整數")
    .min(0, "車齡不能為負數")
    .max(30, "車齡不超過 30 年"),
  brand: z.string().min(1, "請選擇品牌"),
});

type CarFormValues = z.infer<typeof carSchema>;

// Brand retention rates (年折舊率)
const brandRetentionRates: Record<string, { label: string; firstYearRate: number; subsequentRate: number }> = {
  toyota: { label: "Toyota / Lexus", firstYearRate: 0.12, subsequentRate: 0.08 },
  honda: { label: "Honda", firstYearRate: 0.14, subsequentRate: 0.09 },
  bmw: { label: "BMW", firstYearRate: 0.18, subsequentRate: 0.12 },
  mercedes: { label: "Mercedes-Benz", firstYearRate: 0.17, subsequentRate: 0.11 },
  ford: { label: "Ford", firstYearRate: 0.16, subsequentRate: 0.10 },
  hyundai: { label: "Hyundai / Kia", firstYearRate: 0.15, subsequentRate: 0.10 },
  mazda: { label: "Mazda", firstYearRate: 0.13, subsequentRate: 0.09 },
  tesla: { label: "Tesla", firstYearRate: 0.20, subsequentRate: 0.13 },
};

interface DepreciationRow {
  year: number;
  age: number;
  residualValue: number;
  annualLoss: number;
  retentionRate: number;
}

function calculateDepreciation(
  newCarPrice: number,
  currentAge: number,
  brand: string
): { currentValue: number; rows: DepreciationRow[] } {
  const rates = brandRetentionRates[brand] ?? brandRetentionRates.toyota!;

  // Calculate current value
  let currentValue = newCarPrice;
  for (let y = 0; y < currentAge; y++) {
    const rate = y === 0 ? rates.firstYearRate : rates.subsequentRate;
    currentValue *= (1 - rate);
  }

  // Project next 5 years
  const rows: DepreciationRow[] = [];
  let prevValue = currentValue;

  for (let i = 1; i <= 5; i++) {
    const age = currentAge + i;
    const rate = age === 1 ? rates.firstYearRate : rates.subsequentRate;
    const residualValue = Math.round(prevValue * (1 - rate));
    const annualLoss = Math.round(prevValue - residualValue);
    const retentionRate = Math.round((residualValue / newCarPrice) * 100);

    rows.push({ year: i, age, residualValue, annualLoss, retentionRate });
    prevValue = residualValue;
  }

  return { currentValue: Math.round(currentValue), rows };
}

const toolConfig = getToolById("car-depreciation");

export default function CarDepreciation() {
  const [result, setResult] = useState<{ currentValue: number; rows: DepreciationRow[] } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const saveResult = trpc.tools.saveResult.useMutation();

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      newCarPrice: 1_200_000,
      currentAge: 3,
      brand: "toyota",
    },
  });

  const onSubmit = async (values: CarFormValues) => {
    setIsCalculating(true);
    await new Promise((r) => setTimeout(r, 300));
    const data = calculateDepreciation(values.newCarPrice, values.currentAge, values.brand);
    setResult(data);
    setIsCalculating(false);

    saveResult.mutate({
      toolId: "car-depreciation",
      inputParams: values as unknown as Record<string, unknown>,
      result: {
        currentValue: data.currentValue,
        projectedRows: data.rows,
      },
    });
  };

  return (
    <PaywallGuard isPremium={toolConfig?.isPremium ?? false} toolName={toolConfig?.name}>
      <div className="container max-w-5xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Car className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">中古車折舊估算器</h1>
              <p className="text-sm text-muted-foreground">計算未來 5 年殘值，做出最明智的購車決策</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">生活工具</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                車輛資訊
              </CardTitle>
              <CardDescription>填入車輛基本資料，系統將計算折舊曲線</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>汽車品牌</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇品牌" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(brandRetentionRates).map(([key, val]) => (
                              <SelectItem key={key} value={key}>{val.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newCarPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>新車售價（元）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1200000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>目前車齡（年）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="3"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isCalculating}>
                    {isCalculating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />計算中...</>
                    ) : (
                      <><Calculator className="mr-2 h-4 w-4" />計算殘值</>
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
                {/* Current Value */}
                <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">目前估計市場價值</p>
                      <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                        NT${result.currentValue.toLocaleString()}
                      </p>
                    </div>
                    <TrendingDown className="h-10 w-10 text-orange-300 dark:text-orange-700" />
                  </CardContent>
                </Card>

                {/* 5-Year Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">未來 5 年殘值預測</CardTitle>
                    <CardDescription>基於品牌歷史折舊率計算</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium text-muted-foreground">年份</th>
                            <th className="text-left py-2 font-medium text-muted-foreground">車齡</th>
                            <th className="text-right py-2 font-medium text-muted-foreground">殘值</th>
                            <th className="text-right py-2 font-medium text-muted-foreground">年折損</th>
                            <th className="text-right py-2 font-medium text-muted-foreground">保值率</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row) => (
                            <tr key={row.year} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="py-3 font-medium">第 {row.year} 年後</td>
                              <td className="py-3 text-muted-foreground">{row.age} 年</td>
                              <td className="py-3 text-right font-semibold">
                                NT${row.residualValue.toLocaleString()}
                              </td>
                              <td className="py-3 text-right text-red-500 dark:text-red-400">
                                -NT${row.annualLoss.toLocaleString()}
                              </td>
                              <td className="py-3 text-right">
                                <Badge
                                  variant={row.retentionRate >= 60 ? "default" : row.retentionRate >= 40 ? "secondary" : "destructive"}
                                  className="text-xs"
                                >
                                  {row.retentionRate}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center min-h-[300px] border-dashed">
                <div className="text-center text-muted-foreground">
                  <Car className="mx-auto h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">填入左側車輛資訊並點擊「計算殘值」</p>
                  <p className="text-xs mt-1">即可看到未來 5 年的殘值預測</p>
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
