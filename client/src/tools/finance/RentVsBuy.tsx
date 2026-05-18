// ============================================================
// RentVsBuy.tsx - 買房 vs 租房財務效益對比
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, TrendingUp, DollarSign, Info } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

function saveCalculationResult(toolId: string, category: string, inputParams: object, result: object) {
  // Supabase write handled by parent via tRPC; local no-op for pure-frontend tools
  void toolId; void category; void inputParams; void result;
}

interface FormState {
  homePrice: number;
  downPaymentPct: number;
  mortgageRate: number;
  mortgageYears: number;
  propertyTaxRate: number;
  maintenanceRate: number;
  homeAppreciationRate: number;
  monthlyRent: number;
  rentIncreaseRate: number;
  investmentReturnRate: number;
  years: number;
}

const DEFAULT: FormState = {
  homePrice: 15000000,
  downPaymentPct: 20,
  mortgageRate: 2.2,
  mortgageYears: 30,
  propertyTaxRate: 0.1,
  maintenanceRate: 1,
  homeAppreciationRate: 3,
  monthlyRent: 25000,
  rentIncreaseRate: 2,
  investmentReturnRate: 7,
  years: 30,
};

function formatNTD(n: number) {
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(1)} 億`;
  if (Math.abs(n) >= 1e4) return `${(n / 1e4).toFixed(0)} 萬`;
  return n.toFixed(0);
}

export default function RentVsBuy() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: parseFloat(e.target.value) || 0 }));

  const result = useMemo(() => {
    const {
      homePrice, downPaymentPct, mortgageRate, mortgageYears,
      propertyTaxRate, maintenanceRate, homeAppreciationRate,
      monthlyRent, rentIncreaseRate, investmentReturnRate, years,
    } = form;

    const downPayment = homePrice * (downPaymentPct / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyRate = mortgageRate / 100 / 12;
    const numPayments = mortgageYears * 12;
    const monthlyMortgage = monthlyRate === 0
      ? loanAmount / numPayments
      : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

    const chartData: { year: number; buyNetWorth: number; rentNetWorth: number }[] = [];
    let buyNetWorth = -downPayment;
    let rentNetWorth = -downPayment; // opportunity cost: invest down payment
    let currentRent = monthlyRent;
    let currentHomeValue = homePrice;
    let remainingLoan = loanAmount;

    for (let y = 1; y <= years; y++) {
      // Buy: equity builds as loan paid down + appreciation
      for (let m = 0; m < 12; m++) {
        const interest = remainingLoan * monthlyRate;
        const principal = monthlyMortgage - interest;
        remainingLoan = Math.max(0, remainingLoan - principal);
      }
      currentHomeValue *= (1 + homeAppreciationRate / 100);
      const equity = currentHomeValue - remainingLoan;
      const yearlyPropertyTax = currentHomeValue * (propertyTaxRate / 100);
      const yearlyMaintenance = currentHomeValue * (maintenanceRate / 100);
      buyNetWorth = equity - yearlyPropertyTax * y - yearlyMaintenance * y;

      // Rent: invest down payment + difference vs mortgage
      const yearlyRent = currentRent * 12;
      const yearlySavings = (monthlyMortgage - currentRent) * 12;
      rentNetWorth = rentNetWorth * (1 + investmentReturnRate / 100) + Math.max(0, yearlySavings);
      currentRent *= (1 + rentIncreaseRate / 100);
      void yearlyRent;

      chartData.push({
        year: y,
        buyNetWorth: Math.round(buyNetWorth / 10000),
        rentNetWorth: Math.round(rentNetWorth / 10000),
      });
    }

    const finalBuy = chartData[years - 1]?.buyNetWorth ?? 0;
    const finalRent = chartData[years - 1]?.rentNetWorth ?? 0;
    const winner = finalBuy > finalRent ? "buy" : "rent";

    return { chartData, finalBuy, finalRent, winner, monthlyMortgage, downPayment };
  }, [form]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "rent-vs-buy",
      category: "finance",
      inputParams: form as unknown as Record<string, unknown>,
      result: { finalBuy: result.finalBuy, finalRent: result.finalRent, winner: result.winner },
    });
    saveCalculationResult("rent-vs-buy", "finance", form, result);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          買房 vs 租房財務效益對比
        </h1>
        <p className="text-muted-foreground mt-1">
          輸入你的財務條件，比較 {form.years} 年後買房與租房的淨資產差異
        </p>
      </div>

      <Tabs defaultValue="buy">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="buy">買房條件</TabsTrigger>
          <TabsTrigger value="rent">租房條件</TabsTrigger>
          <TabsTrigger value="general">比較設定</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">房屋購買條件</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "房屋總價（元）", key: "homePrice" as const },
                { label: "頭期款比例（%）", key: "downPaymentPct" as const },
                { label: "房貸利率（%）", key: "mortgageRate" as const },
                { label: "貸款年限（年）", key: "mortgageYears" as const },
                { label: "房屋稅率（%）", key: "propertyTaxRate" as const },
                { label: "維護費率（%/年）", key: "maintenanceRate" as const },
                { label: "房價年漲幅（%）", key: "homeAppreciationRate" as const },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Input type="number" value={form[key]} onChange={set(key)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rent" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">租房條件</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "月租金（元）", key: "monthlyRent" as const },
                { label: "年租金漲幅（%）", key: "rentIncreaseRate" as const },
                { label: "投資年報酬率（%）", key: "investmentReturnRate" as const },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Input type="number" value={form[key]} onChange={set(key)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">比較年限</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Label>比較年數（年）</Label>
                <Input type="number" min={5} max={40} value={form.years} onChange={set("years")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 結果摘要 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/30">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">每月房貸</p>
            <p className="text-xl font-bold text-primary">{formatNTD(result.monthlyMortgage)} 元</p>
          </CardContent>
        </Card>
        <Card className={result.winner === "buy" ? "border-emerald-500" : "border-border"}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{form.years} 年後買房淨資產</p>
              {result.winner === "buy" && <Badge className="bg-emerald-500 text-xs">較優</Badge>}
            </div>
            <p className="text-xl font-bold">{result.finalBuy.toLocaleString()} 萬</p>
          </CardContent>
        </Card>
        <Card className={result.winner === "rent" ? "border-emerald-500" : "border-border"}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{form.years} 年後租房淨資產</p>
              {result.winner === "rent" && <Badge className="bg-emerald-500 text-xs">較優</Badge>}
            </div>
            <p className="text-xl font-bold">{result.finalRent.toLocaleString()} 萬</p>
          </CardContent>
        </Card>
      </div>

      {/* 折線圖 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            淨資產成長曲線（萬元）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={result.chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" label={{ value: "年", position: "insideRight", offset: 10 }} />
              <YAxis tickFormatter={(v) => `${v}萬`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} 萬`} />
              <Legend />
              <Line type="monotone" dataKey="buyNetWorth" name="買房淨資產" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rentNetWorth" name="租房淨資產" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>本工具僅供財務規劃參考，不構成投資建議。租房淨資產假設頭期款差額全數投入股市，實際情況因個人消費習慣而異。</p>
      </div>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <DollarSign className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>

      {/* SEO 文章連結 */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">延伸閱讀</CardTitle>
          <CardDescription>深入了解買房 vs 租房的財務決策</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/finance/roi-calculator-guide" className="block text-sm text-primary hover:underline">
            → 投資報酬率完整指南：如何評估每一筆投資
          </a>
          <a href="/blog/finance/roi-vs-lump-sum" className="block text-sm text-primary hover:underline">
            → 定期定額 vs 單筆投資：哪種策略在台股更賺錢？
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
