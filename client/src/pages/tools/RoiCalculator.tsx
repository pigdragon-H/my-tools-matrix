// ============================================================
// ROI Calculator - 定期定額 ROI 計算機
// 含 Recharts 資產成長曲線圖、Zod 驗證、RWD、深色模式
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Calculator, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { PaywallGuard } from "@/components/PaywallGuard";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { getToolById, type SeoArticle } from "@shared/toolsConfig";

// Zod schema - input validation & XSS prevention
const roiSchema = z.object({
  monthlyAmount: z
    .number("請輸入有效數字")
    .min(100, "每月投入金額至少 100 元")
    .max(1_000_000, "每月投入金額不超過 100 萬元"),
  annualReturn: z
    .number("請輸入有效數字")
    .min(0.1, "年化報酬率至少 0.1%")
    .max(50, "年化報酬率不超過 50%"),
  years: z
    .number("請輸入有效數字")
    .int("投資年限須為整數")
    .min(1, "投資年限至少 1 年")
    .max(50, "投資年限不超過 50 年"),
});

type RoiFormValues = z.infer<typeof roiSchema>;

interface ChartDataPoint {
  year: number;
  totalValue: number;
  totalInvested: number;
  profit: number;
}

function calculateROI(monthlyAmount: number, annualReturn: number, years: number): ChartDataPoint[] {
  const monthlyRate = annualReturn / 100 / 12;
  const data: ChartDataPoint[] = [];

  for (let y = 1; y <= years; y++) {
    const months = y * 12;
    const totalInvested = monthlyAmount * months;
    // Future value of annuity formula
    const totalValue = monthlyRate === 0
      ? totalInvested
      : monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const profit = totalValue - totalInvested;

    data.push({
      year: y,
      totalValue: Math.round(totalValue),
      totalInvested: Math.round(totalInvested),
      profit: Math.round(profit),
    });
  }

  return data;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

const toolConfig = getToolById("roi-calculator");

export default function RoiCalculator() {
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const saveResult = trpc.tools.saveResult.useMutation();

  const form = useForm<RoiFormValues>({
    resolver: zodResolver(roiSchema),
    defaultValues: {
      monthlyAmount: 10000,
      annualReturn: 7,
      years: 20,
    },
  });

  const onSubmit = async (values: RoiFormValues) => {
    setIsCalculating(true);
    // Simulate async calculation for UX
    await new Promise((r) => setTimeout(r, 300));

    const data = calculateROI(values.monthlyAmount, values.annualReturn, values.years);
    setChartData(data);
    setIsCalculating(false);

    // Fire-and-forget: save to DB
    const finalResult = data[data.length - 1];
    saveResult.mutate({
      toolId: "roi-calculator",
      inputParams: values as unknown as Record<string, unknown>,
      result: {
        finalValue: finalResult?.totalValue,
        totalInvested: finalResult?.totalInvested,
        totalProfit: finalResult?.profit,
        roi: finalResult ? ((finalResult.profit / finalResult.totalInvested) * 100).toFixed(2) : 0,
      },
    });
  };

  const finalData = chartData?.[chartData.length - 1];

  return (
    <PaywallGuard isPremium={toolConfig?.isPremium ?? false} toolName={toolConfig?.name}>
      <div className="container max-w-5xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">定期定額 ROI 計算機</h1>
              <p className="text-sm text-muted-foreground">輸入投資參數，即時計算複利成長曲線</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">財經工具</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                投資參數設定
              </CardTitle>
              <CardDescription>填入您的投資計畫，系統將自動計算複利成長</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="monthlyAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>每月投入金額（元）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10000"
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
                    name="annualReturn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>預期年化報酬率（%）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="7"
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
                    name="years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>投資年限（年）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="20"
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
                      <><Calculator className="mr-2 h-4 w-4" />開始計算</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {chartData && finalData ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">最終資產總值</p>
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                        NT${finalData.totalValue.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">累計投入本金</p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                        NT${finalData.totalInvested.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">投資獲利</p>
                      <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                        NT${finalData.profit.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">資產成長曲線</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="totalValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="totalInvested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="year"
                          tickFormatter={(v) => `${v}年`}
                          className="text-xs"
                        />
                        <YAxis
                          tickFormatter={formatCurrency}
                          className="text-xs"
                          width={60}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `NT$${value.toLocaleString()}`,
                            name === "totalValue" ? "資產總值" : name === "totalInvested" ? "累計本金" : "獲利",
                          ]}
                          labelFormatter={(label) => `第 ${label} 年`}
                        />
                        <Legend
                          formatter={(value) =>
                            value === "totalValue" ? "資產總值" : value === "totalInvested" ? "累計本金" : "獲利"
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="totalValue"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#totalValue)"
                        />
                        <Area
                          type="monotone"
                          dataKey="totalInvested"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#totalInvested)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center min-h-[300px] border-dashed">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="mx-auto h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">填入左側參數並點擊「開始計算」</p>
                  <p className="text-xs mt-1">即可看到您的財富成長曲線</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Ad */}
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
