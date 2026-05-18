// ============================================================
// InflationCalculator.tsx - 通膨調整購買力計算器
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingDown, DollarSign, Info } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function InflationCalculator() {
  const [amount, setAmount] = useState(1000000);
  const [inflationRate, setInflationRate] = useState(2.5);
  const [years, setYears] = useState(30);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    const data: { year: number; realValue: number; nominalValue: number }[] = [];
    for (let y = 0; y <= years; y++) {
      const realValue = amount / Math.pow(1 + inflationRate / 100, y);
      data.push({
        year: y,
        realValue: Math.round(realValue),
        nominalValue: amount,
      });
    }
    const finalReal = data[years]?.realValue ?? 0;
    const purchasingPowerLost = amount - finalReal;
    const purchasingPowerLostPct = (purchasingPowerLost / amount) * 100;
    return { data, finalReal, purchasingPowerLost, purchasingPowerLostPct };
  }, [amount, inflationRate, years]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "inflation-calculator",
      category: "finance",
      inputParams: { amount, inflationRate, years },
      result: {
        finalReal: result.finalReal,
        purchasingPowerLostPct: result.purchasingPowerLostPct.toFixed(1),
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingDown className="h-6 w-6 text-primary" />
          通膨調整購買力計算器
        </h1>
        <p className="text-muted-foreground mt-1">計算通貨膨脹對你的儲蓄實際購買力的侵蝕效果</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">輸入參數</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>現在的金額（元）</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>年通膨率（%）</Label>
            <Input type="number" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>計算年數（年）</Label>
            <Input type="number" min={1} max={50} value={years} onChange={(e) => setYears(parseInt(e.target.value) || 1)} />
          </div>
        </CardContent>
      </Card>

      {/* 結果摘要 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">現在購買力</p>
            <p className="text-xl font-bold text-primary">{amount.toLocaleString()} 元</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{years} 年後實際購買力</p>
            <p className="text-xl font-bold text-destructive">{result.finalReal.toLocaleString()} 元</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">購買力損失</p>
            <p className="text-xl font-bold">{result.purchasingPowerLostPct.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">（{result.purchasingPowerLost.toLocaleString()} 元）</p>
          </CardContent>
        </Card>
      </div>

      {/* 圖表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">購買力侵蝕曲線</CardTitle>
          <CardDescription>同樣的金額，{years} 年後只剩 {result.purchasingPowerLostPct.toFixed(0)}% 的購買力</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={result.data}>
              <defs>
                <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" label={{ value: "年", position: "insideRight", offset: 10 }} />
              <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}萬`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} 元`} />
              <Legend />
              <Area type="monotone" dataKey="nominalValue" name="名目金額" stroke="#94a3b8" strokeDasharray="5 5" fill="none" />
              <Area type="monotone" dataKey="realValue" name="實際購買力" stroke="#ef4444" fill="url(#realGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 通膨參考表 */}
      <Card>
        <CardHeader><CardTitle className="text-sm">台灣歷年通膨率參考</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {[
              { period: "2020年", rate: "−0.23%" },
              { period: "2021年", rate: "1.97%" },
              { period: "2022年", rate: "2.95%" },
              { period: "2023年", rate: "2.49%" },
            ].map(({ period, rate }) => (
              <div key={period} className="bg-muted rounded p-2 text-center">
                <p className="text-muted-foreground text-xs">{period}</p>
                <p className="font-medium">{rate}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>通膨率以複利計算。台灣近 10 年平均通膨率約 1.5～2%，建議以此作為保守估算基準。</p>
      </div>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <DollarSign className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">延伸閱讀</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/finance/roi-calculator-guide" className="block text-sm text-primary hover:underline">
            → 投資報酬率完整指南：如何對抗通膨侵蝕
          </a>
          <a href="/blog/finance/roi-vs-lump-sum" className="block text-sm text-primary hover:underline">
            → 定期定額 vs 單筆投資：哪種方式更能對抗通膨？
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
