// ============================================================
// CreditCardPayoff.tsx - 信用卡債務還款計劃
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Info, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CreditCardPayoff() {
  const [balance, setBalance] = useState(150000);
  const [annualRate, setAnnualRate] = useState(19.71);
  const [minPaymentPct, setMinPaymentPct] = useState(2);
  const [extraPayment, setExtraPayment] = useState(5000);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    const monthlyRate = annualRate / 100 / 12;

    // 最低還款方案
    let bal = balance;
    let minMonths = 0;
    let minTotalInterest = 0;
    while (bal > 0 && minMonths < 600) {
      const interest = bal * monthlyRate;
      const payment = Math.max(bal * (minPaymentPct / 100), 100);
      minTotalInterest += interest;
      bal -= (payment - interest);
      minMonths++;
    }

    // 加速還款方案
    bal = balance;
    let accMonths = 0;
    let accTotalInterest = 0;
    const monthlyPayment = Math.max(balance * (minPaymentPct / 100), 100) + extraPayment;
    while (bal > 0 && accMonths < 600) {
      const interest = bal * monthlyRate;
      accTotalInterest += interest;
      bal -= (monthlyPayment - interest);
      accMonths++;
    }

    const interestSaved = minTotalInterest - accTotalInterest;
    const monthsSaved = minMonths - accMonths;

    // 圖表資料
    const chartData = [
      { name: "最低還款", 本金: Math.round(balance / 10000), 利息: Math.round(minTotalInterest / 10000) },
      { name: "加速還款", 本金: Math.round(balance / 10000), 利息: Math.round(accTotalInterest / 10000) },
    ];

    return { minMonths, minTotalInterest, accMonths, accTotalInterest, interestSaved, monthsSaved, chartData, monthlyPayment };
  }, [balance, annualRate, minPaymentPct, extraPayment]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "credit-card-payoff",
      category: "finance",
      inputParams: { balance, annualRate, minPaymentPct, extraPayment },
      result: {
        minMonths: result.minMonths,
        accMonths: result.accMonths,
        interestSaved: Math.round(result.interestSaved),
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          信用卡債務還款計劃
        </h1>
        <p className="text-muted-foreground mt-1">比較最低還款與加速還款的利息差異，找出最省錢的還款策略</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">債務資訊</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>目前欠款金額（元）</Label>
            <Input type="number" value={balance} onChange={(e) => setBalance(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>年利率（%）</Label>
            <Input type="number" step="0.01" value={annualRate} onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">台灣信用卡循環利率上限 15%，一般為 19.71%</p>
          </div>
          <div className="space-y-1">
            <Label>最低還款比例（%）</Label>
            <Input type="number" step="0.1" value={minPaymentPct} onChange={(e) => setMinPaymentPct(parseFloat(e.target.value) || 1)} />
          </div>
          <div className="space-y-1">
            <Label>每月額外還款（元）</Label>
            <Input type="number" value={extraPayment} onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      {/* 比較結果 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">最低還款方案</CardTitle>
              <Badge variant="destructive">高成本</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">還清月數</span>
              <span className="font-medium">{result.minMonths >= 600 ? "超過 50 年" : `${result.minMonths} 個月（${(result.minMonths / 12).toFixed(1)} 年）`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">總利息支出</span>
              <span className="font-medium text-destructive">{result.minTotalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">加速還款方案</CardTitle>
              <Badge className="bg-emerald-500">省錢</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">每月還款</span>
              <span className="font-medium">{result.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">還清月數</span>
              <span className="font-medium text-emerald-600">{result.accMonths} 個月（{(result.accMonths / 12).toFixed(1)} 年）</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">總利息支出</span>
              <span className="font-medium">{result.accTotalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 節省摘要 */}
      <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                加速還款可節省 {result.interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元利息
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500">
                提早 {result.monthsSaved} 個月還清（{(result.monthsSaved / 12).toFixed(1)} 年）
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 圖表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">本金 vs 利息比較（萬元）</CardTitle>
          <CardDescription>加速還款大幅減少利息支出</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={result.chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${v}萬`} />
              <Tooltip formatter={(v: number) => `${v} 萬元`} />
              <Legend />
              <Bar dataKey="本金" fill="#94a3b8" />
              <Bar dataKey="利息" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>計算假設每月最低還款為餘額的固定比例。實際銀行計算方式可能略有不同，建議以銀行對帳單為準。</p>
      </div>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <DollarSign className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">延伸閱讀</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/finance/roi-calculator-guide" className="block text-sm text-primary hover:underline">
            → 投資報酬率完整指南：還清債務 vs 投資哪個划算？
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
