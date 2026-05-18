// ============================================================
// FreelancerRateCalculator.tsx - Freelancer 報價時薪轉換器
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, Info, Calculator } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function FreelancerRateCalculator() {
  const [monthlyTarget, setMonthlyTarget] = useState(80000);
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState(20);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [billablePercent, setBillablePercent] = useState(70);
  const [taxRate, setTaxRate] = useState(6);
  const [expensePercent, setExpensePercent] = useState(10);
  const [vacationDays, setVacationDays] = useState(14);
  const [bufferPercent, setBufferPercent] = useState(20);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    // 實際工作天數（扣除假期）
    const workDaysPerYear = workDaysPerMonth * 12 - vacationDays;
    const actualWorkDaysPerMonth = workDaysPerYear / 12;

    // 可計費時數
    const billableHoursPerMonth = actualWorkDaysPerMonth * hoursPerDay * (billablePercent / 100);

    // 月目標（含稅、費用、緩衝）
    const grossMonthlyNeeded = monthlyTarget / (1 - taxRate / 100) / (1 - expensePercent / 100) * (1 + bufferPercent / 100);

    // 最低時薪
    const minHourlyRate = billableHoursPerMonth > 0 ? grossMonthlyNeeded / billableHoursPerMonth : 0;

    // 建議時薪（加 20% 議價空間）
    const suggestedRate = minHourlyRate * 1.2;

    // 各種報價方式
    const dailyRate = minHourlyRate * hoursPerDay;
    const weeklyRate = dailyRate * (workDaysPerMonth / 4.3);
    const projectRate = minHourlyRate * 40; // 假設一個專案 40 小時

    // 年收入試算
    const annualIncome = monthlyTarget * 12;

    return {
      minHourlyRate, suggestedRate, dailyRate, weeklyRate, projectRate,
      billableHoursPerMonth, grossMonthlyNeeded, annualIncome, actualWorkDaysPerMonth,
    };
  }, [monthlyTarget, workDaysPerMonth, hoursPerDay, billablePercent, taxRate, expensePercent, vacationDays, bufferPercent]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "freelancer-rate-calculator",
      category: "productivity",
      inputParams: { monthlyTarget, workDaysPerMonth, hoursPerDay, billablePercent, taxRate },
      result: {
        minHourlyRate: Math.round(result.minHourlyRate),
        suggestedRate: Math.round(result.suggestedRate),
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Freelancer 報價時薪轉換器
        </h1>
        <p className="text-muted-foreground mt-1">輸入期望月收入，反推最低時薪與各種報價方式</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">收入目標</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>期望月淨收入（元）</Label>
            <Input type="number" value={monthlyTarget} onChange={(e) => setMonthlyTarget(parseFloat(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">這是你希望稅後實際入袋的金額</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">工作時間設定</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>每月工作天數（天）</Label>
            <Input type="number" min={1} max={31} value={workDaysPerMonth} onChange={(e) => setWorkDaysPerMonth(parseInt(e.target.value) || 20)} />
          </div>
          <div className="space-y-1">
            <Label>每天工作時數（小時）</Label>
            <Input type="number" min={1} max={16} value={hoursPerDay} onChange={(e) => setHoursPerDay(parseInt(e.target.value) || 8)} />
          </div>
          <div className="space-y-2">
            <Label>可計費時間比例：{billablePercent}%</Label>
            <Slider min={30} max={100} step={5} value={[billablePercent]} onValueChange={(v) => setBillablePercent(v[0])} />
            <p className="text-xs text-muted-foreground">扣除行政、找案源、學習等非計費時間</p>
          </div>
          <div className="space-y-1">
            <Label>每年休假天數（天）</Label>
            <Input type="number" min={0} max={60} value={vacationDays} onChange={(e) => setVacationDays(parseInt(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">成本與稅務</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>所得稅率（%）</Label>
            <Input type="number" step="0.5" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">台灣自雇者約 6%～20%</p>
          </div>
          <div className="space-y-1">
            <Label>營業費用佔比（%）</Label>
            <Input type="number" step="1" value={expensePercent} onChange={(e) => setExpensePercent(parseFloat(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">軟體、設備、行銷等費用</p>
          </div>
          <div className="space-y-1">
            <Label>緩衝係數（%）</Label>
            <Input type="number" step="5" value={bufferPercent} onChange={(e) => setBufferPercent(parseFloat(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">應對空窗期、議價空間</p>
          </div>
        </CardContent>
      </Card>

      {/* 結果 */}
      <div className="space-y-3">
        <h2 className="font-semibold">計算結果</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-primary/50">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">最低時薪</p>
              <p className="text-3xl font-bold text-primary">{result.minHourlyRate.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</p>
              <p className="text-xs text-muted-foreground mt-1">低於此價格將無法達成目標</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/50">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">建議報價時薪（含議價空間）</p>
              <p className="text-3xl font-bold text-emerald-600">{result.suggestedRate.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</p>
              <p className="text-xs text-muted-foreground mt-1">比最低時薪高 20%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "日費（Day Rate）", value: result.dailyRate },
            { label: "週費（Week Rate）", value: result.weeklyRate },
            { label: "專案估價（40h）", value: result.projectRate },
            { label: "年收入目標", value: result.annualIncome },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-bold">{value.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">計算依據</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>實際工作天數：{result.actualWorkDaysPerMonth.toFixed(1)} 天/月</span>
              <span>可計費時數：{result.billableHoursPerMonth.toFixed(1)} 小時/月</span>
              <span>稅前需賺：{result.grossMonthlyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元/月</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>台灣自由工作者需自行繳納健保費（約 1,000～3,000 元/月）與勞退自提（可選）。建議將這些費用納入「營業費用」計算。</p>
      </div>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <Calculator className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>
    </div>
  );
}
