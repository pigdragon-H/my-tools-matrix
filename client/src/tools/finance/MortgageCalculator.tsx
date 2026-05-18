// ============================================================
// MortgageCalculator - /tools/finance/mortgage-calculator
// 房貸試算工具：本息攤還 / 本金攤還，含月付金額與利息圖表
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Home, Calculator, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const formSchema = z.object({
  loanAmount: z
    .string()
    .min(1, "請輸入貸款金額")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "請輸入大於 0 的數字")
    .refine((v) => Number(v) <= 100_000_000, "金額不得超過 1 億"),
  annualRate: z
    .string()
    .min(1, "請輸入年利率")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "請輸入大於 0 的數字")
    .refine((v) => Number(v) <= 30, "年利率不得超過 30%"),
  years: z
    .string()
    .min(1, "請輸入貸款年限")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1, "至少 1 年")
    .refine((v) => Number(v) <= 40, "年限不得超過 40 年"),
  repaymentType: z.enum(["equal_payment", "equal_principal"]),
});

type FormValues = z.infer<typeof formSchema>;

interface YearlyData {
  year: number;
  principal: number;
  interest: number;
  balance: number;
}

function calculateMortgage(
  loanAmount: number,
  annualRate: number,
  years: number,
  type: "equal_payment" | "equal_principal"
): { monthly: number; totalInterest: number; yearlyData: YearlyData[] } {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;
  const yearlyData: YearlyData[] = [];

  if (type === "equal_payment") {
    // 本息攤還
    const monthly =
      monthlyRate === 0
        ? loanAmount / totalMonths
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);

    let balance = loanAmount;
    let totalInterest = 0;

    for (let y = 1; y <= years; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interest = balance * monthlyRate;
        const principal = monthly - interest;
        yearInterest += interest;
        yearPrincipal += principal;
        balance -= principal;
        totalInterest += interest;
      }
      yearlyData.push({
        year: y,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
        balance: Math.max(0, Math.round(balance)),
      });
    }
    return { monthly: Math.round(monthly), totalInterest: Math.round(totalInterest), yearlyData };
  } else {
    // 本金攤還
    const principalPerMonth = loanAmount / totalMonths;
    let balance = loanAmount;
    let totalInterest = 0;
    const firstMonthly = principalPerMonth + balance * monthlyRate;

    for (let y = 1; y <= years; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interest = balance * monthlyRate;
        yearInterest += interest;
        yearPrincipal += principalPerMonth;
        balance -= principalPerMonth;
        totalInterest += interest;
      }
      yearlyData.push({
        year: y,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
        balance: Math.max(0, Math.round(balance)),
      });
    }
    return { monthly: Math.round(firstMonthly), totalInterest: Math.round(totalInterest), yearlyData };
  }
}

function formatTWD(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(2)} 億`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)} 萬`;
  return n.toLocaleString("zh-TW");
}

export default function MortgageCalculator() {
  const [result, setResult] = useState<{
    monthly: number;
    totalInterest: number;
    yearlyData: YearlyData[];
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const saveResult = trpc.tools.saveResult.useMutation();
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "finance" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: "8000000",
      annualRate: "2.06",
      years: "30",
      repaymentType: "equal_payment",
    },
  });

  function onSubmit(values: FormValues) {
    setIsCalculating(true);
    setTimeout(() => {
      const loan = Number(values.loanAmount);
      const rate = Number(values.annualRate);
      const yrs = Number(values.years);
      const res = calculateMortgage(loan, rate, yrs, values.repaymentType);
      setResult(res);
      setIsCalculating(false);
      saveResult.mutate({
        toolId: "mortgage-calculator",
        category: "finance",
        inputParams: { loanAmount: loan, annualRate: rate, years: yrs, repaymentType: values.repaymentType },
        result: { firstMonthly: res.monthly, totalInterest: res.totalInterest },
      });
    }, 300);
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">房貸試算工具</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              本息攤還 / 本金攤還，精算每月還款金額與總利息
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              輸入貸款條件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>貸款金額（元）</FormLabel>
                      <FormControl>
                        <Input placeholder="例：8000000" {...field} inputMode="numeric" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>年利率（%）</FormLabel>
                      <FormControl>
                        <Input placeholder="例：2.06" {...field} inputMode="decimal" />
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
                      <FormLabel>貸款年限（年）</FormLabel>
                      <FormControl>
                        <Input placeholder="例：30" {...field} inputMode="numeric" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repaymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>還款方式</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="equal_payment">本息攤還（每月固定）</SelectItem>
                          <SelectItem value="equal_principal">本金攤還（前高後低）</SelectItem>
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
                    <><Calculator className="h-4 w-4" />開始試算</>
                  )}
                </Button>
              </form>
            </Form>

            {result && (
              <div className="mt-6 space-y-3">
                <Separator />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">
                  試算結果摘要
                </p>
                {[
                  { label: "首月還款金額", value: formatTWD(result.monthly) + " 元", color: "text-blue-600 dark:text-blue-400" },
                  { label: "貸款總金額", value: formatTWD(Number(form.getValues("loanAmount"))), color: "" },
                  { label: "總利息支出", value: formatTWD(result.totalInterest), color: "text-red-500 dark:text-red-400" },
                  {
                    label: "總還款金額",
                    value: formatTWD(Number(form.getValues("loanAmount")) + result.totalInterest),
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

        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-4 w-4" />
              每年本金 vs 利息分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Home className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">輸入條件後點擊「開始試算」</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={result.yearlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tickFormatter={(v) => `${v}年`} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tickFormatter={(v) => formatTWD(v)} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={70} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatTWD(value),
                      name === "principal" ? "還本金" : name === "interest" ? "付利息" : "剩餘本金",
                    ]}
                    labelFormatter={(label) => `第 ${label} 年`}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend formatter={(v) => (v === "principal" ? "還本金" : v === "interest" ? "付利息" : "剩餘本金")} wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="principal" stroke="#3b82f6" fill="url(#colorPrincipal)" strokeWidth={2} />
                  <Area type="monotone" dataKey="interest" stroke="#ef4444" fill="url(#colorInterest)" strokeWidth={2} />
                </AreaChart>
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
