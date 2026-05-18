// ============================================================
// IncomeTaxCalculator - /tools/finance/income-tax-calculator
// 薪資所得稅試算器（台灣 2024 年度）
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Receipt, Calculator, BookOpen, ArrowRight, Loader2, Info } from "lucide-react";
import { Link } from "wouter";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

// 2024 年度台灣所得稅率
const TAX_BRACKETS = [
  { min: 0, max: 590_000, rate: 0.05 },
  { min: 590_000, max: 1_330_000, rate: 0.12 },
  { min: 1_330_000, max: 2_660_000, rate: 0.20 },
  { min: 2_660_000, max: 4_980_000, rate: 0.30 },
  { min: 4_980_000, max: Infinity, rate: 0.40 },
];

const STANDARD_DEDUCTION_SINGLE = 131_000;
const STANDARD_DEDUCTION_MARRIED = 262_000;
const SALARY_DEDUCTION = 218_000; // 薪資特別扣除額上限
const PERSONAL_EXEMPTION = 97_000;
const DEPENDENT_EXEMPTION = 97_000;

const formSchema = z.object({
  annualSalary: z
    .string()
    .min(1, "請輸入年薪")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "請輸入大於 0 的數字"),
  maritalStatus: z.enum(["single", "married"]),
  dependents: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "請輸入 0 以上的整數"),
  otherDeductions: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "請輸入 0 以上的數字"),
});

type FormValues = z.infer<typeof formSchema>;

function calcTax(taxableIncome: number): number {
  let tax = 0;
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.min) break;
    const taxable = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }
  return Math.max(0, Math.round(tax));
}

function formatTWD(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)} 萬`;
  return n.toLocaleString("zh-TW");
}

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981"];

export default function IncomeTaxCalculator() {
  const [result, setResult] = useState<{
    grossIncome: number;
    totalDeductions: number;
    taxableIncome: number;
    incomeTax: number;
    effectiveRate: number;
    netIncome: number;
    pieData: { name: string; value: number }[];
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const saveResult = trpc.tools.saveResult.useMutation();
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "finance" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualSalary: "600000",
      maritalStatus: "single",
      dependents: "0",
      otherDeductions: "0",
    },
  });

  function onSubmit(values: FormValues) {
    setIsCalculating(true);
    setTimeout(() => {
      const gross = Number(values.annualSalary);
      const isMarried = values.maritalStatus === "married";
      const deps = Number(values.dependents);
      const otherDed = Number(values.otherDeductions);

      // 扣除額計算
      const standardDed = isMarried ? STANDARD_DEDUCTION_MARRIED : STANDARD_DEDUCTION_SINGLE;
      const salaryDed = Math.min(gross, SALARY_DEDUCTION);
      const personalExemption = isMarried ? PERSONAL_EXEMPTION * 2 : PERSONAL_EXEMPTION;
      const dependentExemption = deps * DEPENDENT_EXEMPTION;
      const totalDeductions = standardDed + salaryDed + personalExemption + dependentExemption + otherDed;

      const taxableIncome = Math.max(0, gross - totalDeductions);
      const incomeTax = calcTax(taxableIncome);
      const effectiveRate = gross > 0 ? (incomeTax / gross) * 100 : 0;
      const netIncome = gross - incomeTax;

      const pieData = [
        { name: "實拿薪資", value: netIncome },
        { name: "所得稅", value: incomeTax },
      ];

      setResult({ grossIncome: gross, totalDeductions, taxableIncome, incomeTax, effectiveRate, netIncome, pieData });
      setIsCalculating(false);
      saveResult.mutate({
        toolId: "income-tax-calculator",
        category: "finance",
        inputParams: { annualSalary: gross, maritalStatus: values.maritalStatus, dependents: deps },
        result: { incomeTax, effectiveRate, netIncome },
      });
    }, 300);
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
            <Receipt className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">薪資所得稅試算器</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              台灣 2024 年度所得稅試算，含標準扣除額與免稅額
            </p>
          </div>
        </div>
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            本試算依 2024 年度稅率表計算，僅供參考，實際應納稅額請以國稅局申報為準。
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              輸入薪資資料
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="annualSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>全年薪資所得（元）</FormLabel>
                      <FormControl><Input placeholder="例：600000" {...field} inputMode="numeric" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>婚姻狀況</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">單身（標準扣除額 13.1 萬）</SelectItem>
                          <SelectItem value="married">已婚合併申報（26.2 萬）</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dependents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>扶養親屬人數（每人免稅額 9.7 萬）</FormLabel>
                      <FormControl><Input placeholder="例：0" {...field} inputMode="numeric" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherDeductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>其他扣除額（保險費、房租等）</FormLabel>
                      <FormControl><Input placeholder="例：0" {...field} inputMode="numeric" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gap-2" disabled={isCalculating}>
                  {isCalculating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />計算中...</>
                  ) : (
                    <><Calculator className="h-4 w-4" />試算所得稅</>
                  )}
                </Button>
              </form>
            </Form>

            {result && (
              <div className="mt-6 space-y-3">
                <Separator />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">試算結果</p>
                {[
                  { label: "全年薪資所得", value: formatTWD(result.grossIncome), color: "" },
                  { label: "各項扣除合計", value: `- ${formatTWD(result.totalDeductions)}`, color: "text-blue-500" },
                  { label: "綜合所得淨額", value: formatTWD(result.taxableIncome), color: "" },
                  { label: "應納所得稅", value: formatTWD(result.incomeTax), color: "text-red-500" },
                  { label: "實際稅率", value: `${result.effectiveRate.toFixed(2)}%`, color: "text-amber-600" },
                  { label: "稅後年收入", value: formatTWD(result.netIncome), color: "text-emerald-500" },
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
              <Receipt className="h-4 w-4" />
              薪資分配圖
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Receipt className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">輸入薪資後點擊「試算所得稅」</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={result.pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`} labelLine={false}>
                      {result.pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatTWD(value) + " 元"]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                  <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">2024 年度稅率級距參考</p>
                  {TAX_BRACKETS.map((b, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {b.max === Infinity ? `${formatTWD(b.min)} 以上` : `${formatTWD(b.min)} ～ ${formatTWD(b.max)}`}
                      </span>
                      <Badge variant="outline" className="text-xs">{(b.rate * 100).toFixed(0)}%</Badge>
                    </div>
                  ))}
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
