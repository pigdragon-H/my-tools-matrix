import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AnnuityResult {
  presentValue: number;
  futureValue: number;
  totalPremium: number;
  totalBenefit: number;
  roi: number;
  breakEvenYear: number;
  yearlyData: { year: number; cumPremium: number; cumBenefit: number }[];
}

interface TermInsuranceResult {
  annualPremium: number;
  totalPremium: number;
  coverageAmount: number;
  roi: number;
}

function calcAnnuity(
  premium: number,
  years: number,
  annuityAmount: number,
  annuityYears: number,
  discountRate: number
): AnnuityResult {
  const totalPremium = premium * years;
  const totalBenefit = annuityAmount * 12 * annuityYears;
  const roi = ((totalBenefit - totalPremium) / totalPremium) * 100;

  // Present value of annuity payments
  const monthlyRate = discountRate / 100 / 12;
  const n = annuityYears * 12;
  const pv = monthlyRate === 0
    ? annuityAmount * n
    : annuityAmount * (1 - Math.pow(1 + monthlyRate, -n)) / monthlyRate;

  // Future value of premiums
  const fv = totalPremium * Math.pow(1 + discountRate / 100, years);

  // Break-even year
  let breakEvenYear = 0;
  let cumBenefit = 0;
  for (let y = 1; y <= annuityYears; y++) {
    cumBenefit += annuityAmount * 12;
    if (cumBenefit >= totalPremium && breakEvenYear === 0) {
      breakEvenYear = years + y;
    }
  }

  const yearlyData = [];
  for (let y = 1; y <= years + annuityYears; y++) {
    const cumPremium = y <= years ? premium * y : totalPremium;
    const cumBen = y > years ? annuityAmount * 12 * (y - years) : 0;
    yearlyData.push({ year: y, cumPremium, cumBenefit: cumBen });
  }

  return { presentValue: pv, futureValue: fv, totalPremium, totalBenefit, roi, breakEvenYear, yearlyData };
}

export default function InsuranceCalculator() {
  const [tab, setTab] = useState("annuity");

  // Annuity inputs
  const [annPremium, setAnnPremium] = useState("30000");
  const [annYears, setAnnYears] = useState("20");
  const [annuityAmt, setAnnuityAmt] = useState("15000");
  const [annuityYears, setAnnuityYears] = useState("20");
  const [discountRate, setDiscountRate] = useState("2");
  const [annResult, setAnnResult] = useState<AnnuityResult | null>(null);

  // Term insurance inputs
  const [coverage, setCoverage] = useState("5000000");
  const [termYears, setTermYears] = useState("20");
  const [age, setAge] = useState("30");
  const [gender, setGender] = useState("male");
  const [termResult, setTermResult] = useState<TermInsuranceResult | null>(null);

  const saveResult = trpc.tools.saveResult.useMutation();

  function calcAnnuityResult() {
    const result = calcAnnuity(
      Number(annPremium),
      Number(annYears),
      Number(annuityAmt),
      Number(annuityYears),
      Number(discountRate)
    );
    setAnnResult(result);
    saveResult.mutate({
      toolId: "insurance-calculator",
      category: "finance",
      inputParams: { type: "annuity", annPremium, annYears, annuityAmt, annuityYears, discountRate },
      result: { totalPremium: result.totalPremium, totalBenefit: result.totalBenefit, roi: result.roi },
    });
  }

  function calcTermResult() {
    // Simplified premium estimation based on age, gender, coverage
    const baseRate = gender === "male" ? 0.0008 : 0.0005;
    const ageFactor = 1 + (Number(age) - 25) * 0.04;
    const annualPremium = Math.round(Number(coverage) * baseRate * ageFactor);
    const totalPremium = annualPremium * Number(termYears);
    const roi = ((Number(coverage) - totalPremium) / totalPremium) * 100;
    const result = { annualPremium, totalPremium, coverageAmount: Number(coverage), roi };
    setTermResult(result);
    saveResult.mutate({
      toolId: "insurance-calculator",
      category: "finance",
      inputParams: { type: "term", coverage, termYears, age, gender },
      result,
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">保險／年金給付計算器</h1>
        <p className="text-muted-foreground mt-1">試算年金現值、保費回收期與定期壽險保費估算</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="annuity">年金計算</TabsTrigger>
          <TabsTrigger value="term">定期壽險估算</TabsTrigger>
        </TabsList>

        <TabsContent value="annuity" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>年金保險試算</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>每年繳費（元）</Label>
                <Input type="number" value={annPremium} onChange={e => setAnnPremium(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>繳費年期（年）</Label>
                <Input type="number" value={annYears} onChange={e => setAnnYears(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>每月年金給付（元）</Label>
                <Input type="number" value={annuityAmt} onChange={e => setAnnuityAmt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>年金給付年期（年）</Label>
                <Input type="number" value={annuityYears} onChange={e => setAnnuityYears(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>折現率 / 通膨率（%）</Label>
                <Input type="number" value={discountRate} onChange={e => setDiscountRate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={calcAnnuityResult}>計算年金</Button>
              </div>
            </CardContent>
          </Card>

          {annResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "總繳保費", value: `NT$${annResult.totalPremium.toLocaleString()}` },
                  { label: "總領年金", value: `NT$${annResult.totalBenefit.toLocaleString()}` },
                  { label: "年金現值", value: `NT$${Math.round(annResult.presentValue).toLocaleString()}` },
                  { label: "回收年份", value: annResult.breakEvenYear > 0 ? `第 ${annResult.breakEvenYear} 年` : "未回收" },
                ].map(item => (
                  <Card key={item.label}>
                    <CardContent className="pt-4 text-center">
                      <div className="text-lg font-bold text-primary">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader><CardTitle>累積保費 vs 累積年金</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={annResult.yearlyData.filter((_, i) => i % 2 === 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: "年", position: "insideRight" }} />
                      <YAxis tickFormatter={v => `${(v / 10000).toFixed(0)}萬`} />
                      <Tooltip formatter={(v: number) => `NT$${v.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="cumPremium" name="累積保費" fill="#ef4444" />
                      <Bar dataKey="cumBenefit" name="累積年金" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="term" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>定期壽險保費估算</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>保障金額（元）</Label>
                <Input type="number" value={coverage} onChange={e => setCoverage(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>保障年期（年）</Label>
                <Input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>投保年齡</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>性別</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男性</SelectItem>
                    <SelectItem value="female">女性</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button className="w-full" onClick={calcTermResult}>估算保費</Button>
              </div>
            </CardContent>
          </Card>

          {termResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "估算年保費", value: `NT$${termResult.annualPremium.toLocaleString()}` },
                { label: "估算月保費", value: `NT$${Math.round(termResult.annualPremium / 12).toLocaleString()}` },
                { label: "總繳保費", value: `NT$${termResult.totalPremium.toLocaleString()}` },
                { label: "保障倍數", value: `${(termResult.coverageAmount / termResult.totalPremium).toFixed(1)}x` },
              ].map(item => (
                <Card key={item.label}>
                  <CardContent className="pt-4 text-center">
                    <div className="text-lg font-bold text-primary">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">⚠️ 保費估算僅供參考，實際保費依保險公司核保結果為準。</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
