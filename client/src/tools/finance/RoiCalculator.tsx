// ============================================================
// ROI Calculator - /tools/finance/roi-calculator
// 定期定額 ROI 計算機，含 Recharts 複利成長曲線圖
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TrendingUp, Calculator, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getToolById } from "@shared/toolsConfig";

// ── Zod Schema ────────────────────────────────────────────
const formSchema = z.object({
  monthlyAmount: z
    .string()
    .min(1, "請輸入每月投入金額")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "請輸入大於 0 的數字")
    .refine((v) => Number(v) <= 10_000_000, "金額不得超過 1000 萬"),
  annualReturn: z
    .string()
    .min(1, "請輸入年化報酬率")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "請輸入大於 0 的數字")
    .refine((v) => Number(v) <= 100, "報酬率不得超過 100%"),
  years: z
    .string()
    .min(1, "請輸入投資年限")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1, "至少 1 年")
    .refine((v) => Number(v) <= 50, "年限不得超過 50 年"),
});

type FormValues = z.infer<typeof formSchema>;

// ── Calculation Logic ─────────────────────────────────────
interface ChartDataPoint {
  year: number;
  totalInvested: number;
  totalValue: number;
  profit: number;
}

function calculateROI(monthly: number, annualRate: number, years: number): ChartDataPoint[] {
  const monthlyRate = annualRate / 100 / 12;
  const data: ChartDataPoint[] = [];

  for (let y = 1; y <= years; y++) {
    const months = y * 12;
    const totalInvested = monthly * months;
    // 定期定額複利公式
    const totalValue =
      monthlyRate === 0
        ? totalInvested
        : monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const profit = totalValue - totalInvested;
    data.push({
      year: y,
      totalInvested: Math.round(totalInvested),
      totalValue: Math.round(totalValue),
      profit: Math.round(profit),
    });
  }
  return data;
}

function formatTWD(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(2)} 億`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)} 萬`;
  return n.toLocaleString("zh-TW");
}

// ── Component ─────────────────────────────────────────────
export default function RoiCalculator() {
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const toolConfig = getToolById("roi-calculator");
  const saveResult = trpc.tools.saveResult.useMutation();
  // 相關文章：只顯示同一 category（finance）的文章，避免跨類別推薦
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "finance" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { monthlyAmount: "5000", annualReturn: "7", years: "20" },
  });

  function onSubmit(values: FormValues) {
    setIsCalculating(true);
    setTimeout(() => {
      const monthly = Number(values.monthlyAmount);
      const rate = Number(values.annualReturn);
      const years = Number(values.years);
      const data = calculateROI(monthly, rate, years);
      setChartData(data);
      setIsCalculating(false);

      // 非同步儲存計算結果
      const last = data[data.length - 1];
      if (last) {
        saveResult.mutate({
          toolId: "roi-calculator",
          category: "finance",
          inputParams: { monthlyAmount: monthly, annualReturn: rate, years },
          result: { finalValue: last.totalValue, totalInvested: last.totalInvested, profit: last.profit },
        });
      }
    }, 300);
  }

  const lastPoint = chartData?.[chartData.length - 1];

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2">
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">定期定額 ROI 計算機</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              輸入參數，即時生成複利成長曲線圖
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
              輸入計算參數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="monthlyAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>每月投入金額（元）</FormLabel>
                      <FormControl>
                        <Input placeholder="例：5000" {...field} inputMode="numeric" />
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
                      <FormLabel>年化報酬率（%）</FormLabel>
                      <FormControl>
                        <Input placeholder="例：7" {...field} inputMode="decimal" />
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
                        <Input placeholder="例：20" {...field} inputMode="numeric" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gap-2" disabled={isCalculating}>
                  {isCalculating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />計算中...</>
                  ) : (
                    <><Calculator className="h-4 w-4" />開始計算</>
                  )}
                </Button>
              </form>
            </Form>

            {/* Summary Cards */}
            {lastPoint && (
              <div className="mt-6 space-y-3">
                <Separator />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">
                  計算結果摘要
                </p>
                {[
                  { label: "最終資產總值", value: formatTWD(lastPoint.totalValue), color: "text-emerald-600 dark:text-emerald-400" },
                  { label: "累計投入本金", value: formatTWD(lastPoint.totalInvested), color: "" },
                  { label: "投資獲利", value: formatTWD(lastPoint.profit), color: "text-blue-600 dark:text-blue-400" },
                  {
                    label: "報酬倍數",
                    value: `${(lastPoint.totalValue / lastPoint.totalInvested).toFixed(2)}x`,
                    color: "text-purple-600 dark:text-purple-400",
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

        {/* ── Chart ───────────────────────────────────────── */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              資產成長曲線圖
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!chartData ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <TrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">輸入參數後點擊「開始計算」</p>
                  <p className="text-xs text-muted-foreground mt-1">圖表將在此顯示</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(v) => `${v}年`}
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    tickFormatter={(v) => formatTWD(v)}
                    tick={{ fontSize: 10 }}
                    stroke="var(--muted-foreground)"
                    width={70}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatTWD(value),
                      name === "totalValue" ? "資產總值" : name === "totalInvested" ? "累計本金" : "投資獲利",
                    ]}
                    labelFormatter={(label) => `第 ${label} 年`}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "totalValue" ? "資產總值" : value === "totalInvested" ? "累計本金" : "投資獲利"
                    }
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="totalValue" stroke="#10b981" fill="url(#colorValue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="totalInvested" stroke="#6366f1" fill="url(#colorInvested)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
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
                  <Badge variant="secondary" className="text-xs mb-2">財經</Badge>
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
