// ============================================================
// IrrNpvCalculator.tsx - IRR / NPV 投資評估計算器
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Trash2, DollarSign, Info } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

function calcNPV(rate: number, cashflows: number[]): number {
  return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0);
}

function calcIRR(cashflows: number[]): number | null {
  // Newton-Raphson method
  let rate = 0.1;
  for (let iter = 0; iter < 1000; iter++) {
    const npv = calcNPV(rate, cashflows);
    const dnpv = cashflows.reduce((acc, cf, i) => acc - i * cf / Math.pow(1 + rate, i + 1), 0);
    if (Math.abs(dnpv) < 1e-10) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-8) return newRate;
    rate = newRate;
  }
  return Math.abs(calcNPV(rate, cashflows)) < 1 ? rate : null;
}

export default function IrrNpvCalculator() {
  const [discountRate, setDiscountRate] = useState(8);
  const [cashflows, setCashflows] = useState<number[]>([-1000000, 200000, 300000, 400000, 350000, 300000]);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    const npv = calcNPV(discountRate / 100, cashflows);
    const irr = calcIRR(cashflows);
    const chartData = cashflows.map((cf, i) => ({
      period: i === 0 ? "初始投資" : `第 ${i} 期`,
      現金流: cf,
    }));
    return { npv, irr, chartData };
  }, [cashflows, discountRate]);

  const updateCashflow = (idx: number, val: string) => {
    setCashflows((prev) => {
      const next = [...prev];
      next[idx] = parseFloat(val) || 0;
      return next;
    });
  };

  const addPeriod = () => setCashflows((prev) => [...prev, 0]);
  const removePeriod = (idx: number) => {
    if (cashflows.length <= 2) return;
    setCashflows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "irr-npv-calculator",
      category: "finance",
      inputParams: { discountRate, cashflows },
      result: {
        npv: Math.round(result.npv),
        irr: result.irr !== null ? (result.irr * 100).toFixed(2) : "N/A",
      },
    });
  };

  const npvPositive = result.npv >= 0;
  const irrPct = result.irr !== null ? (result.irr * 100).toFixed(2) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          IRR / NPV 投資評估計算器
        </h1>
        <p className="text-muted-foreground mt-1">輸入各期現金流，計算淨現值（NPV）與內部報酬率（IRR）</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">折現率設定</CardTitle>
          <CardDescription>通常使用資金成本（WACC）或期望報酬率</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-w-xs">
            <Label>折現率（%）</Label>
            <Input type="number" step="0.1" value={discountRate} onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">各期現金流（元）</CardTitle>
              <CardDescription>第 0 期通常為負值（初始投資）</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addPeriod}>
              <Plus className="h-4 w-4 mr-1" /> 新增期數
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cashflows.map((cf, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">{idx === 0 ? "第 0 期（初始投資）" : `第 ${idx} 期`}</Label>
                  <Input
                    type="number"
                    value={cf}
                    onChange={(e) => updateCashflow(idx, e.target.value)}
                    className={cf < 0 ? "border-destructive/50" : "border-emerald-500/50"}
                  />
                </div>
                {idx > 1 && (
                  <Button size="icon" variant="ghost" className="mt-5 shrink-0" onClick={() => removePeriod(idx)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 結果 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className={npvPositive ? "border-emerald-500" : "border-destructive/50"}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">淨現值（NPV）</p>
              <Badge className={npvPositive ? "bg-emerald-500" : "bg-destructive"}>
                {npvPositive ? "值得投資" : "不建議投資"}
              </Badge>
            </div>
            <p className={`text-2xl font-bold ${npvPositive ? "text-emerald-600" : "text-destructive"}`}>
              {result.npv.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元
            </p>
            <p className="text-xs text-muted-foreground mt-1">NPV &gt; 0 表示投資可創造正報酬</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-1">內部報酬率（IRR）</p>
            {irrPct !== null ? (
              <>
                <p className="text-2xl font-bold">{irrPct}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {parseFloat(irrPct) > discountRate
                    ? `IRR（${irrPct}%）> 折現率（${discountRate}%），投資可行`
                    : `IRR（${irrPct}%）< 折現率（${discountRate}%），投資不划算`}
                </p>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">無法計算（現金流符號未改變）</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 圖表 */}
      <Card>
        <CardHeader><CardTitle className="text-base">各期現金流圖</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={result.chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}萬`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} 元`} />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="現金流" fill="#3b82f6"
                label={false}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                shape={(props: any) => {
                  const { x, y, width, height, value } = props;
                  return <rect x={x} y={value >= 0 ? y : y + height} width={width} height={Math.abs(height)} fill={value >= 0 ? "#10b981" : "#ef4444"} rx={2} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>IRR 使用牛頓-拉弗森迭代法計算。若現金流符號未改變（全正或全負），IRR 無法計算。NPV 為正且 IRR 大於折現率時，投資通常被視為可行。</p>
      </div>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <DollarSign className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">延伸閱讀</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/finance/roi-calculator-guide" className="block text-sm text-primary hover:underline">
            → 投資報酬率完整指南：ROI vs IRR 的差異
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
