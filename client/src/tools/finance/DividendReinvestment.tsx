// ============================================================
// DividendReinvestment.tsx - 股票股息再投資模擬器（DRIP）
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, DollarSign, Info } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function DividendReinvestment() {
  const [initialInvestment, setInitialInvestment] = useState(500000);
  const [stockPrice, setStockPrice] = useState(100);
  const [dividendYield, setDividendYield] = useState(4);
  const [priceGrowthRate, setPriceGrowthRate] = useState(5);
  const [dividendGrowthRate, setDividendGrowthRate] = useState(3);
  const [years, setYears] = useState(20);
  const [reinvest, setReinvest] = useState(true);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    const chartData: { year: number; DRIP再投資: number; 不再投資: number; 累積股息: number }[] = [];

    let shares = initialInvestment / stockPrice;
    let sharesNoReinvest = shares;
    let currentPrice = stockPrice;
    let currentDividendYield = dividendYield / 100;
    let totalDividendCash = 0;

    for (let y = 0; y <= years; y++) {
      const portfolioValue = shares * currentPrice;
      const portfolioNoReinvest = sharesNoReinvest * currentPrice + totalDividendCash;

      chartData.push({
        year: y,
        DRIP再投資: Math.round(portfolioValue / 10000),
        不再投資: Math.round(portfolioNoReinvest / 10000),
        累積股息: Math.round(totalDividendCash / 10000),
      });

      if (y < years) {
        const dividendPerShare = currentPrice * currentDividendYield;
        const totalDividend = shares * dividendPerShare;
        const totalDividendNoReinvest = sharesNoReinvest * dividendPerShare;

        currentPrice *= (1 + priceGrowthRate / 100);
        currentDividendYield *= (1 + dividendGrowthRate / 100);

        if (reinvest) {
          shares += totalDividend / currentPrice;
        } else {
          totalDividendCash += totalDividendNoReinvest;
        }
      }
    }

    const finalDRIP = chartData[years]?.DRIP再投資 ?? 0;
    const finalNoDRIP = chartData[years]?.不再投資 ?? 0;
    const dripAdvantage = finalDRIP - finalNoDRIP;
    const totalReturn = ((finalDRIP * 10000 - initialInvestment) / initialInvestment * 100).toFixed(1);

    return { chartData, finalDRIP, finalNoDRIP, dripAdvantage, totalReturn };
  }, [initialInvestment, stockPrice, dividendYield, priceGrowthRate, dividendGrowthRate, years, reinvest]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "dividend-reinvestment",
      category: "finance",
      inputParams: { initialInvestment, stockPrice, dividendYield, priceGrowthRate, dividendGrowthRate, years, reinvest },
      result: { finalDRIP: result.finalDRIP, totalReturn: result.totalReturn },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          股票股息再投資模擬器（DRIP）
        </h1>
        <p className="text-muted-foreground mt-1">模擬股息再投資（DRIP）的複利效果，對比不再投資的差異</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">投資參數</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>初始投資金額（元）</Label>
            <Input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>目前股價（元）</Label>
            <Input type="number" step="0.1" value={stockPrice} onChange={(e) => setStockPrice(parseFloat(e.target.value) || 1)} />
          </div>
          <div className="space-y-1">
            <Label>股息殖利率（%）</Label>
            <Input type="number" step="0.1" value={dividendYield} onChange={(e) => setDividendYield(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>股價年成長率（%）</Label>
            <Input type="number" step="0.1" value={priceGrowthRate} onChange={(e) => setPriceGrowthRate(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>股息年成長率（%）</Label>
            <Input type="number" step="0.1" value={dividendGrowthRate} onChange={(e) => setDividendGrowthRate(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>模擬年數（年）</Label>
            <Input type="number" min={1} max={50} value={years} onChange={(e) => setYears(parseInt(e.target.value) || 1)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">啟用股息再投資（DRIP）</Label>
              <p className="text-xs text-muted-foreground">開啟後，每年股息自動買回股票</p>
            </div>
            <Switch checked={reinvest} onCheckedChange={setReinvest} />
          </div>
        </CardContent>
      </Card>

      {/* 結果摘要 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/30">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{years} 年後 DRIP 總值</p>
            <p className="text-xl font-bold text-primary">{result.finalDRIP.toLocaleString()} 萬</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{years} 年後不再投資總值</p>
            <p className="text-xl font-bold">{result.finalNoDRIP.toLocaleString()} 萬</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/50">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">DRIP 額外獲益</p>
            <p className="text-xl font-bold text-emerald-600">+{result.dripAdvantage.toLocaleString()} 萬</p>
            <p className="text-xs text-muted-foreground">總報酬率 {result.totalReturn}%</p>
          </CardContent>
        </Card>
      </div>

      {/* 圖表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">DRIP vs 不再投資 成長曲線（萬元）</CardTitle>
          <CardDescription>股息再投資的複利效果隨時間顯著放大</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={result.chartData}>
              <defs>
                <linearGradient id="dripGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" label={{ value: "年", position: "insideRight", offset: 10 }} />
              <YAxis tickFormatter={(v) => `${v}萬`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} 萬`} />
              <Legend />
              <Area type="monotone" dataKey="DRIP再投資" stroke="#10b981" fill="url(#dripGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="不再投資" stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>模擬假設股息每年發放一次並立即再投資，未考慮稅負（台灣股息所得稅 28%）與交易成本。實際報酬可能因市場波動而有所不同。</p>
      </div>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <DollarSign className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">延伸閱讀</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/finance/roi-best-buy-point" className="block text-sm text-primary hover:underline">
            → 存股族必看：用 ROI 計算機找出最佳買點
          </a>
          <a href="/blog/finance/roi-calculator-guide" className="block text-sm text-primary hover:underline">
            → 投資報酬率完整指南：股息再投資的複利魔法
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
