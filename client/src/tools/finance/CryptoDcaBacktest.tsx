// ============================================================
// CryptoDcaBacktest.tsx - 加密貨幣 DCA 歷史回測工具
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, DollarSign, Info, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// 模擬歷史價格資料（簡化版，實際應從 API 取得）
const CRYPTO_MOCK_PRICES: Record<string, { year: number; price: number }[]> = {
  BTC: [
    { year: 2015, price: 300 }, { year: 2016, price: 900 }, { year: 2017, price: 14000 },
    { year: 2018, price: 3700 }, { year: 2019, price: 7200 }, { year: 2020, price: 29000 },
    { year: 2021, price: 47000 }, { year: 2022, price: 16500 }, { year: 2023, price: 42000 },
    { year: 2024, price: 65000 },
  ],
  ETH: [
    { year: 2016, price: 8 }, { year: 2017, price: 750 }, { year: 2018, price: 140 },
    { year: 2019, price: 130 }, { year: 2020, price: 730 }, { year: 2021, price: 3700 },
    { year: 2022, price: 1200 }, { year: 2023, price: 2200 }, { year: 2024, price: 3500 },
  ],
  BNB: [
    { year: 2017, price: 10 }, { year: 2018, price: 6 }, { year: 2019, price: 14 },
    { year: 2020, price: 37 }, { year: 2021, price: 520 }, { year: 2022, price: 240 },
    { year: 2023, price: 230 }, { year: 2024, price: 580 },
  ],
};

const CRYPTO_OPTIONS = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "BNB", label: "BNB (BNB)" },
];

export default function CryptoDcaBacktest() {
  const [coin, setCoin] = useState("BTC");
  const [monthlyAmount, setMonthlyAmount] = useState(3000);
  const [startYear, setStartYear] = useState(2019);
  const [endYear, setEndYear] = useState(2024);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    const prices = CRYPTO_MOCK_PRICES[coin] ?? [];
    const filteredPrices = prices.filter((p) => p.year >= startYear && p.year <= endYear);
    if (filteredPrices.length < 2) return null;

    let totalInvested = 0;
    let totalCoins = 0;
    const chartData: { year: number; 投入金額: number; 市值: number; 持幣數量: number }[] = [];

    for (const { year, price } of filteredPrices) {
      const yearlyInvestment = monthlyAmount * 12;
      const coinsBought = yearlyInvestment / price;
      totalInvested += yearlyInvestment;
      totalCoins += coinsBought;
      const currentValue = totalCoins * price;

      chartData.push({
        year,
        投入金額: Math.round(totalInvested / 10000),
        市值: Math.round(currentValue / 10000),
        持幣數量: parseFloat(totalCoins.toFixed(4)),
      });
    }

    const finalPrice = filteredPrices[filteredPrices.length - 1]?.price ?? 1;
    const finalValue = totalCoins * finalPrice;
    const totalReturn = ((finalValue - totalInvested) / totalInvested * 100).toFixed(1);
    const avgCost = totalInvested / totalCoins;
    const isProfit = finalValue > totalInvested;

    return { chartData, totalInvested, finalValue, totalReturn, avgCost, totalCoins, isProfit };
  }, [coin, monthlyAmount, startYear, endYear]);

  const handleSave = () => {
    if (!isAuthenticated || !result) return;
    saveMutation.mutate({
      toolId: "crypto-dca-backtest",
      category: "finance",
      inputParams: { coin, monthlyAmount, startYear, endYear },
      result: {
        totalReturn: result.totalReturn,
        finalValue: Math.round(result.finalValue),
        isProfit: result.isProfit,
      },
    });
  };

  const availableYears = (CRYPTO_MOCK_PRICES[coin] ?? []).map((p) => p.year);
  const minYear = availableYears[0] ?? 2015;
  const maxYear = availableYears[availableYears.length - 1] ?? 2024;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bitcoin className="h-6 w-6 text-primary" />
          加密貨幣 DCA 歷史回測工具
        </h1>
        <p className="text-muted-foreground mt-1">模擬定期定額投資加密貨幣的歷史報酬，了解 DCA 策略的效果</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>本工具使用簡化的年度歷史價格模擬，僅供教育用途。加密貨幣投資風險極高，過去報酬不代表未來表現。</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">回測參數</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>幣種選擇</Label>
            <Select value={coin} onValueChange={setCoin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRYPTO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>每月定投金額（元）</Label>
            <Input type="number" value={monthlyAmount} onChange={(e) => setMonthlyAmount(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>開始年份</Label>
            <Input type="number" min={minYear} max={maxYear - 1} value={startYear}
              onChange={(e) => setStartYear(Math.max(minYear, Math.min(maxYear - 1, parseInt(e.target.value) || minYear)))} />
            <p className="text-xs text-muted-foreground">可選範圍：{minYear} ～ {maxYear}</p>
          </div>
          <div className="space-y-1">
            <Label>結束年份</Label>
            <Input type="number" min={startYear + 1} max={maxYear} value={endYear}
              onChange={(e) => setEndYear(Math.max(startYear + 1, Math.min(maxYear, parseInt(e.target.value) || maxYear)))} />
          </div>
        </CardContent>
      </Card>

      {result ? (
        <>
          {/* 結果摘要 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">總投入</p>
                <p className="font-bold">{(result.totalInvested / 10000).toFixed(0)} 萬</p>
              </CardContent>
            </Card>
            <Card className={result.isProfit ? "border-emerald-500" : "border-destructive/50"}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">最終市值</p>
                  <Badge className={`text-xs ${result.isProfit ? "bg-emerald-500" : "bg-destructive"}`}>
                    {result.isProfit ? "獲利" : "虧損"}
                  </Badge>
                </div>
                <p className={`font-bold ${result.isProfit ? "text-emerald-600" : "text-destructive"}`}>
                  {(result.finalValue / 10000).toFixed(0)} 萬
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">總報酬率</p>
                <p className={`font-bold ${result.isProfit ? "text-emerald-600" : "text-destructive"}`}>
                  {result.isProfit ? "+" : ""}{result.totalReturn}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">平均成本</p>
                <p className="font-bold">${result.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </CardContent>
            </Card>
          </div>

          {/* 圖表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                投入金額 vs 市值成長（萬元）
              </CardTitle>
              <CardDescription>
                {startYear}～{endYear} 年定期定額 {coin} 回測結果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={result.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(v) => `${v}萬`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} 萬`} />
                  <Legend />
                  <Line type="monotone" dataKey="投入金額" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="市值" stroke="#f59e0b" strokeWidth={2} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            請調整年份範圍，確保開始與結束年份之間有足夠的歷史資料
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} disabled={!isAuthenticated || !result} className="w-full sm:w-auto">
        <DollarSign className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">延伸閱讀</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/finance/roi-vs-lump-sum" className="block text-sm text-primary hover:underline">
            → 定期定額 vs 單筆投資：哪種策略在台股更賺錢？
          </a>
          <a href="/blog/finance/roi-calculator-guide" className="block text-sm text-primary hover:underline">
            → 投資報酬率完整指南：DCA 策略的優缺點
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
