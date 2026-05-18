// ============================================================
// RoasCpcCalculator.tsx - ROAS / CPC 廣告計算機
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart2, DollarSign, Target, TrendingUp, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function RoasCpcCalculator() {
  // ROAS 計算
  const [adSpend, setAdSpend] = useState(10000);
  const [revenue, setRevenue] = useState(40000);

  // CPC 計算
  const [totalClicks, setTotalClicks] = useState(500);
  const [totalCost, setTotalCost] = useState(5000);

  // 進階：目標 ROAS 反推
  const [targetRoas, setTargetRoas] = useState(4);
  const [targetRevenue, setTargetRevenue] = useState(50000);

  // 完整廣告活動分析
  const [impressions, setImpressions] = useState(50000);
  const [clicks, setClicks] = useState(1000);
  const [conversions, setConversions] = useState(50);
  const [campaignSpend, setCampaignSpend] = useState(15000);
  const [campaignRevenue, setCampaignRevenue] = useState(60000);

  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const roasResult = useMemo(() => {
    const roas = adSpend > 0 ? revenue / adSpend : 0;
    const profit = revenue - adSpend;
    const roi = adSpend > 0 ? ((revenue - adSpend) / adSpend) * 100 : 0;
    const isGood = roas >= 4;
    return { roas, profit, roi, isGood };
  }, [adSpend, revenue]);

  const cpcResult = useMemo(() => {
    const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;
    return { cpc };
  }, [totalClicks, totalCost]);

  const targetResult = useMemo(() => {
    const maxSpend = targetRevenue / targetRoas;
    const currentRoas = adSpend > 0 ? revenue / adSpend : 0;
    const spendToReachTarget = targetRevenue / targetRoas;
    return { maxSpend, spendToReachTarget };
  }, [targetRoas, targetRevenue, adSpend, revenue]);

  const campaignResult = useMemo(() => {
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? campaignSpend / clicks : 0;
    const cpa = conversions > 0 ? campaignSpend / conversions : 0;
    const roas = campaignSpend > 0 ? campaignRevenue / campaignSpend : 0;
    const profit = campaignRevenue - campaignSpend;

    const chartData = [
      { name: "廣告支出", value: campaignSpend },
      { name: "廣告營收", value: campaignRevenue },
      { name: "利潤", value: profit },
    ];

    return { ctr, cvr, cpc, cpa, roas, profit, chartData };
  }, [impressions, clicks, conversions, campaignSpend, campaignRevenue]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "roas-cpc-calculator",
      category: "productivity",
      inputParams: { adSpend, revenue, totalClicks, totalCost },
      result: { roas: roasResult.roas.toFixed(2), cpc: cpcResult.cpc.toFixed(2) },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" />
          ROAS ／ CPC 廣告計算機
        </h1>
        <p className="text-muted-foreground mt-1">計算廣告投資報酬率（ROAS）、每次點擊成本（CPC）與完整廣告活動效益</p>
      </div>

      <Tabs defaultValue="roas">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="roas">ROAS 計算</TabsTrigger>
          <TabsTrigger value="cpc">CPC 計算</TabsTrigger>
          <TabsTrigger value="campaign">完整分析</TabsTrigger>
        </TabsList>

        {/* ROAS 計算 */}
        <TabsContent value="roas" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">ROAS 計算</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>廣告支出（元）</Label>
                <Input type="number" value={adSpend} onChange={(e) => setAdSpend(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-1">
                <Label>廣告帶來的營收（元）</Label>
                <Input type="number" value={revenue} onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className={roasResult.isGood ? "border-emerald-500" : "border-amber-500"}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">ROAS</p>
                <p className={`text-3xl font-bold ${roasResult.isGood ? "text-emerald-600" : "text-amber-600"}`}>
                  {roasResult.roas.toFixed(2)}x
                </p>
                <Badge className={`mt-1 text-xs ${roasResult.isGood ? "bg-emerald-500" : "bg-amber-500"}`}>
                  {roasResult.isGood ? "良好（≥4x）" : "待改善（<4x）"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">利潤</p>
                <p className={`text-2xl font-bold ${roasResult.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {roasResult.profit >= 0 ? "+" : ""}{roasResult.profit.toLocaleString()} 元
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className={`text-2xl font-bold ${roasResult.roi >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {roasResult.roi.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 目標 ROAS 反推 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                目標 ROAS 反推最大廣告預算
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>目標 ROAS</Label>
                <Input type="number" step="0.1" value={targetRoas} onChange={(e) => setTargetRoas(parseFloat(e.target.value) || 1)} />
              </div>
              <div className="space-y-1">
                <Label>目標營收（元）</Label>
                <Input type="number" value={targetRevenue} onChange={(e) => setTargetRevenue(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-span-2 bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">要達到 {targetRevenue.toLocaleString()} 元營收，且 ROAS = {targetRoas}x</p>
                <p className="text-xl font-bold mt-1">最多可花 <span className="text-primary">{targetResult.maxSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })} 元</span> 廣告費</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CPC 計算 */}
        <TabsContent value="cpc" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">CPC 計算</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>總廣告費用（元）</Label>
                <Input type="number" value={totalCost} onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-1">
                <Label>總點擊次數</Label>
                <Input type="number" value={totalClicks} onChange={(e) => setTotalClicks(parseInt(e.target.value) || 0)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground text-sm">每次點擊成本（CPC）</p>
              <p className="text-5xl font-bold text-primary mt-2">{cpcResult.cpc.toFixed(2)}</p>
              <p className="text-muted-foreground">元 / 次點擊</p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>台灣 Google Ads 平均 CPC：$5～$50 元（視產業而定）</p>
                <p>Facebook Ads 平均 CPC：$3～$30 元</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 完整活動分析 */}
        <TabsContent value="campaign" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">廣告活動數據輸入</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[
                { label: "曝光次數", value: impressions, setter: setImpressions },
                { label: "點擊次數", value: clicks, setter: setClicks },
                { label: "轉換次數", value: conversions, setter: setConversions },
                { label: "廣告支出（元）", value: campaignSpend, setter: setCampaignSpend },
                { label: "廣告帶來營收（元）", value: campaignRevenue, setter: setCampaignRevenue },
              ].map(({ label, value, setter }) => (
                <div key={label} className="space-y-1">
                  <Label>{label}</Label>
                  <Input type="number" value={value} onChange={(e) => setter(parseFloat(e.target.value) || 0)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "CTR 點擊率", value: `${campaignResult.ctr.toFixed(2)}%`, good: campaignResult.ctr > 2 },
              { label: "CVR 轉換率", value: `${campaignResult.cvr.toFixed(2)}%`, good: campaignResult.cvr > 3 },
              { label: "CPC 每次點擊", value: `${campaignResult.cpc.toFixed(2)} 元`, good: true },
              { label: "CPA 每次轉換", value: `${campaignResult.cpa.toFixed(2)} 元`, good: true },
              { label: "ROAS", value: `${campaignResult.roas.toFixed(2)}x`, good: campaignResult.roas >= 4 },
              { label: "利潤", value: `${campaignResult.profit.toLocaleString()} 元`, good: campaignResult.profit > 0 },
            ].map(({ label, value, good }) => (
              <Card key={label} className={good ? "border-emerald-500/50" : "border-amber-500/50"}>
                <CardContent className="pt-3 pb-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`font-bold ${good ? "text-emerald-600" : "text-amber-600"}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">支出 vs 營收 vs 利潤</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={campaignResult.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} 元`} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <DollarSign className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>
    </div>
  );
}
