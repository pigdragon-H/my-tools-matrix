// ============================================================
// CarDepreciation - /tools/finance/car-depreciation
// 中古車折舊估算器，輸出 5 年殘值階梯表
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, Calculator, BookOpen, ArrowRight, Loader2, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

// ── Zod Schema ────────────────────────────────────────────
const formSchema = z.object({
  newCarPrice: z
    .string()
    .min(1, "請輸入新車售價")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 100_000, "新車售價至少 10 萬元")
    .refine((v) => Number(v) <= 50_000_000, "金額不得超過 5000 萬"),
  currentAge: z
    .string()
    .min(1, "請輸入目前車齡")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "車齡不得為負數")
    .refine((v) => Number(v) <= 20, "車齡不得超過 20 年"),
  brand: z.string().min(1, "請選擇品牌"),
});

type FormValues = z.infer<typeof formSchema>;

// 品牌保值率（年折舊率）
const brandDepreciation: Record<string, { label: string; rate: number }> = {
  toyota: { label: "Toyota / Lexus", rate: 0.12 },
  honda: { label: "Honda", rate: 0.14 },
  mazda: { label: "Mazda", rate: 0.15 },
  nissan: { label: "Nissan", rate: 0.16 },
  bmw: { label: "BMW", rate: 0.18 },
  mercedes: { label: "Mercedes-Benz", rate: 0.17 },
  volkswagen: { label: "Volkswagen", rate: 0.16 },
  ford: { label: "Ford", rate: 0.18 },
  hyundai: { label: "Hyundai / Kia", rate: 0.17 },
  other: { label: "其他品牌", rate: 0.20 },
};

interface DepreciationRow {
  year: number;
  age: number;
  residualValue: number;
  residualRate: number;
  annualLoss: number;
}

function calculateDepreciation(
  newPrice: number,
  currentAge: number,
  annualRate: number
): DepreciationRow[] {
  const rows: DepreciationRow[] = [];
  // 計算目前殘值
  const currentValue = newPrice * Math.pow(1 - annualRate, currentAge);

  for (let i = 0; i <= 5; i++) {
    const totalAge = currentAge + i;
    const value = newPrice * Math.pow(1 - annualRate, totalAge);
    const prevValue = i === 0 ? newPrice * Math.pow(1 - annualRate, Math.max(0, totalAge - 1)) : rows[i - 1]!.residualValue;
    rows.push({
      year: i,
      age: totalAge,
      residualValue: Math.round(value),
      residualRate: Math.round((value / newPrice) * 100),
      annualLoss: i === 0 ? Math.round(currentValue - value) : Math.round(prevValue - value),
    });
  }
  return rows;
}

function formatTWD(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)} 萬`;
  return n.toLocaleString("zh-TW");
}

const CHART_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5", "#ecfdf5"];

export default function CarDepreciation() {
  const [rows, setRows] = useState<DepreciationRow[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const saveResult = trpc.tools.saveResult.useMutation();
  // 相關文章：只顯示同一 category（finance）的文章，避免跨類別推薦
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "finance" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { newCarPrice: "800000", currentAge: "0", brand: "toyota" },
  });

  function onSubmit(values: FormValues) {
    setIsCalculating(true);
    setTimeout(() => {
      const newPrice = Number(values.newCarPrice);
      const currentAge = Number(values.currentAge);
      const brand = brandDepreciation[values.brand];
      if (!brand) return;
      const data = calculateDepreciation(newPrice, currentAge, brand.rate);
      setRows(data);
      setIsCalculating(false);

      const last = data[data.length - 1];
      if (last) {
        saveResult.mutate({
          toolId: "car-depreciation",
          category: "finance",
          inputParams: { newCarPrice: newPrice, currentAge, brand: values.brand },
          result: { year5Value: last.residualValue, year5Rate: last.residualRate },
        });
      }
    }, 300);
  }

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
            <Car className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">中古車折舊估算器</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              計算未來 5 年殘值，讓你的購車決策有數據支撐
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
              輸入車輛資訊
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newCarPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>新車售價（元）</FormLabel>
                      <FormControl>
                        <Input placeholder="例：800000" {...field} inputMode="numeric" />
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
                        <Input placeholder="例：0（全新車）" {...field} inputMode="numeric" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>品牌</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇品牌" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(brandDepreciation).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
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
                    <><Calculator className="h-4 w-4" />計算折舊</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ── Chart + Table ────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                5 年殘值走勢圖
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!rows ? (
                <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
                  <div className="text-center">
                    <Car className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">輸入車輛資訊後點擊「計算折舊」</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={rows} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tickFormatter={(v) => `+${v}年`} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => formatTWD(v)} tick={{ fontSize: 10 }} width={65} />
                    <Tooltip
                      formatter={(v: number) => [formatTWD(v), "殘值"]}
                      labelFormatter={(l) => `現在 +${l} 年`}
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Bar dataKey="residualValue" radius={[4, 4, 0, 0]}>
                      {rows.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i] ?? "#10b981"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {rows && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">殘值明細表</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">時間點</TableHead>
                      <TableHead className="text-xs">車齡</TableHead>
                      <TableHead className="text-xs text-right">殘值</TableHead>
                      <TableHead className="text-xs text-right">保值率</TableHead>
                      <TableHead className="text-xs text-right">年折損</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell className="text-xs font-medium">
                          {row.year === 0 ? "現在" : `+${row.year} 年`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.age} 年</TableCell>
                        <TableCell className="text-xs text-right font-semibold">{formatTWD(row.residualValue)}</TableCell>
                        <TableCell className="text-xs text-right">
                          <span className={row.residualRate >= 70 ? "text-emerald-600" : row.residualRate >= 50 ? "text-amber-600" : "text-red-500"}>
                            {row.residualRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right text-red-500">
                          {row.year === 0 ? "—" : `-${formatTWD(row.annualLoss)}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
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
