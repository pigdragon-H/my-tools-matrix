// ============================================================
// RetirementCalculator - /tools/finance/retirement-calculator
// 退休金 4% 法則計算機：退休所需資產 / 提領年數試算
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sunset, Calculator, BookOpen, ArrowRight, Loader2, Info } from "lucide-react";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

const formSchema = z.object({
  monthlyExpense: z
    .string()
    .min(1, "請輸入每月生活費")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "請輸入大於 0 的數字")
    .refine((v) => Number(v) <= 1_000_000, "金額不得超過 100 萬"),
  currentSavings: z
    .string()
    .min(1, "請輸入目前存款")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "請輸入 0 以上的數字"),
  annualReturn: z
    .string()
    .min(1, "請輸入預期年報酬率")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "請輸入 0 以上的數字")
    .refine((v) => Number(v) <= 20, "年報酬率不得超過 20%"),
  withdrawalRate: z
    .string()
    .min(1, "請輸入提領率")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "請輸入大於 0 的數字")
    .refine((v) => Number(v) <= 10, "提領率不得超過 10%"),
});

type FormValues = z.infer<typeof formSchema>;

interface SimYear {
  year: number;
  balance: number;
  withdrawal: number;
}

function simulate(
  targetAsset: number,
  annualReturn: number,
  annualWithdrawal: number,
  years: number = 40
): SimYear[] {
  const data: SimYear[] = [];
  let balance = targetAsset;
  for (let y = 1; y <= years; y++) {
    balance = balance * (1 + annualReturn / 100) - annualWithdrawal;
    data.push({ year: y, balance: Math.round(Math.max(0, balance)), withdrawal: Math.round(annualWithdrawal) });
    if (balance <= 0) break;
  }
  return data;
}

function formatTWD(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(2)} 億`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)} 萬`;
  return n.toLocaleString("zh-TW");
}

export default function RetirementCalculator() {
  const [result, setResult] = useState<{
    targetAsset: number;
    annualWithdrawal: number;
    simData: SimYear[];
    yearsUntilDepleted: number | null;
    gap: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const saveResult = trpc.tools.saveResult.useMutation();
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "finance" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyExpense: "50000",
      currentSavings: "3000000",
      annualReturn: "5",
      withdrawalRate: "4",
    },
  });

  function onSubmit(values: FormValues) {
    setIsCalculating(true);
    setTimeout(() => {
      const monthly = Number(values.monthlyExpense);
      const savings = Number(values.currentSavings);
      const rate = Number(values.withdrawalRate);
      const returnRate = Number(values.annualReturn);

      const annualExpense = monthly * 12;
      const targetAsset = (annualExpense / rate) * 100;
      const gap = Math.max(0, targetAsset - savings);
      const simData = simulate(targetAsset, returnRate, annualExpense, 50);
      const depleted = simData.find((d) => d.balance === 0);

      setResult({
        targetAsset,
        annualWithdrawal: annualExpense,
        simData,
        yearsUntilDepleted: depleted ? depleted.year : null,
        gap,
      });
      setIsCalculating(false);
      saveResult.mutate({
        toolId: "retirement-calculator",
        category: "finance",
        inputParams: { monthlyExpense: monthly, currentSavings: savings, annualReturn: returnRate, withdrawalRate: rate },
        result: { targetAsset, gap },
      });
    }, 300);
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
            <Sunset className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">退休金 4% 法則計算機</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              計算財務自由所需資產，模擬提領 50 年資金變化
            </p>
          </div>
        </div>
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>4% 法則</strong>：每年從退休資產中提領不超過 4%，歷史數據顯示資產可維持 30 年以上不耗盡。
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              輸入退休條件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="monthlyExpense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>退休後每月生活費（元）</FormLabel>
                      <FormControl><Input placeholder="例：50000" {...field} inputMode="numeric" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentSavings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目前已累積存款（元）</FormLabel>
                      <FormControl><Input placeholder="例：3000000" {...field} inputMode="numeric" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>退休後年報酬率（%）</FormLabel>
                      <FormControl><Input placeholder="例：5" {...field} inputMode="decimal" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="withdrawalRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>年提領率（% ，建議 3～4）</FormLabel>
                      <FormControl><Input placeholder="例：4" {...field} inputMode="decimal" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gap-2" disabled={isCalculating}>
                  {isCalculating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />計算中...</>
                  ) : (
                    <><Calculator className="h-4 w-4" />計算退休目標</>
                  )}
                </Button>
              </form>
            </Form>

            {result && (
              <div className="mt-6 space-y-3">
                <Separator />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">計算結果</p>
                {[
                  { label: "退休目標資產", value: formatTWD(result.targetAsset), color: "text-amber-600 dark:text-amber-400" },
                  { label: "目前存款", value: formatTWD(Number(form.getValues("currentSavings"))), color: "" },
                  { label: "距目標缺口", value: result.gap > 0 ? formatTWD(result.gap) : "已達標！", color: result.gap > 0 ? "text-red-500" : "text-emerald-500" },
                  { label: "每年提領金額", value: formatTWD(result.annualWithdrawal), color: "text-blue-600 dark:text-blue-400" },
                  {
                    label: "資金可維持年數",
                    value: result.yearsUntilDepleted ? `約 ${result.yearsUntilDepleted} 年` : "50 年以上",
                    color: result.yearsUntilDepleted && result.yearsUntilDepleted < 30 ? "text-red-500" : "text-emerald-500",
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
              <Sunset className="h-4 w-4" />
              退休資產模擬（50 年）
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Sunset className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">輸入條件後點擊「計算退休目標」</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.simData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tickFormatter={(v) => `${v}年`} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tickFormatter={(v) => formatTWD(v)} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={70} />
                  <Tooltip
                    formatter={(value: number) => [formatTWD(value), "剩餘資產"]}
                    labelFormatter={(label) => `退休後第 ${label} 年`}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <ReferenceLine y={0} stroke="var(--destructive)" strokeDasharray="4 4" />
                  <Bar dataKey="balance" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                  <Badge variant="secondary" className="text-xs mb-2">財經</Badge>
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
