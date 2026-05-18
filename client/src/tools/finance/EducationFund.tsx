// ============================================================
// EducationFund.tsx - 子女教育基金計算器
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, DollarSign, Info } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function EducationFund() {
  const [targetAmount, setTargetAmount] = useState(3000000);
  const [yearsToGoal, setYearsToGoal] = useState(18);
  const [currentSavings, setCurrentSavings] = useState(200000);
  const [annualReturn, setAnnualReturn] = useState(6);
  const [inflationRate, setInflationRate] = useState(2);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    const realReturn = (1 + annualReturn / 100) / (1 + inflationRate / 100) - 1;
    const monthlyRate = Math.pow(1 + realReturn, 1 / 12) - 1;
    const n = yearsToGoal * 12;

    // 目標金額（通膨調整後）
    const inflationAdjustedTarget = targetAmount * Math.pow(1 + inflationRate / 100, yearsToGoal);

    // 現有儲蓄在目標年的終值
    const currentFV = currentSavings * Math.pow(1 + annualReturn / 100, yearsToGoal);

    // 需要的每月存款
    const remaining = inflationAdjustedTarget - currentFV;
    const monthlyNeeded = monthlyRate === 0
      ? remaining / n
      : remaining * monthlyRate / (Math.pow(1 + monthlyRate, n) - 1);

    // 圖表資料
    const chartData: { year: number; 累積金額: number; 目標金額: number }[] = [];
    let accumulated = currentSavings;
    for (let y = 0; y <= yearsToGoal; y++) {
      chartData.push({
        year: y,
        累積金額: Math.round(accumulated),
        目標金額: Math.round(inflationAdjustedTarget),
      });
      accumulated = accumulated * (1 + annualReturn / 100) + Math.max(0, monthlyNeeded) * 12;
    }

    return { monthlyNeeded, inflationAdjustedTarget, currentFV, chartData };
  }, [targetAmount, yearsToGoal, currentSavings, annualReturn, inflationRate]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "education-fund",
      category: "finance",
      inputParams: { targetAmount, yearsToGoal, currentSavings, annualReturn, inflationRate },
      result: {
        monthlyNeeded: Math.round(result.monthlyNeeded),
        inflationAdjustedTarget: Math.round(result.inflationAdjustedTarget),
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          子女教育基金計算器
        </h1>
        <p className="text-muted-foreground mt-1">規劃孩子的教育費用，計算每月需要存多少錢</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">教育基金目標</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>目標教育費用（元）</Label>
            <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">台灣大學 4 年約 60～100 萬，出國留學約 300～600 萬</p>
          </div>
          <div className="space-y-1">
            <Label>距離目標年數（年）</Label>
            <Input type="number" min={1} max={30} value={yearsToGoal} onChange={(e) => setYearsToGoal(parseInt(e.target.value) || 1)} />
          </div>
          <div className="space-y-1">
            <Label>目前已有儲蓄（元）</Label>
            <Input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>預期年化報酬率（%）</Label>
            <Input type="number" step="0.1" value={annualReturn} onChange={(e) => setAnnualReturn(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label>年通膨率（%）</Label>
            <Input type="number" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      {/* 結果 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/30">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">每月需存入</p>
            <p className="text-2xl font-bold text-primary">
              {result.monthlyNeeded > 0 ? result.monthlyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"} 元
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">通膨調整後目標</p>
            <p className="text-xl font-bold">{result.inflationAdjustedTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">現有儲蓄終值</p>
            <p className="text-xl font-bold">{result.currentFV.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</p>
          </CardContent>
        </Card>
      </div>

      {/* 圖表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">教育基金累積曲線</CardTitle>
          <CardDescription>每月存 {result.monthlyNeeded > 0 ? result.monthlyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0} 元，{yearsToGoal} 年後達成目標</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={result.chartData}>
              <defs>
                <linearGradient id="eduGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" label={{ value: "年", position: "insideRight", offset: 10 }} />
              <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}萬`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} 元`} />
              <ReferenceLine y={result.inflationAdjustedTarget} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "目標", position: "right", fontSize: 11 }} />
              <Area type="monotone" dataKey="累積金額" stroke="#3b82f6" fill="url(#eduGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>計算已考慮通膨影響，目標金額以今日幣值表示。實際報酬率受市場波動影響，建議保守估算。</p>
      </div>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <DollarSign className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">延伸閱讀</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/finance/roi-calculator-guide" className="block text-sm text-primary hover:underline">
            → 投資報酬率完整指南：長期複利的力量
          </a>
          <a href="/blog/finance/roi-vs-lump-sum" className="block text-sm text-primary hover:underline">
            → 定期定額 vs 單筆投資：教育基金該怎麼存？
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
