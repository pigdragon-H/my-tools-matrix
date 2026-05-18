import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 台電 2024 年住宅用電階梯費率（元/度）
const ELECTRICITY_TIERS = [
  { limit: 120, rate: 1.63 },
  { limit: 330, rate: 2.38 },
  { limit: 500, rate: 3.52 },
  { limit: 700, rate: 4.80 },
  { limit: 1000, rate: 5.66 },
  { limit: Infinity, rate: 6.41 },
];

function calcElectricity(kwh: number): number {
  let cost = 0;
  let remaining = kwh;
  let prev = 0;
  for (const tier of ELECTRICITY_TIERS) {
    const tierKwh = Math.min(remaining, tier.limit - prev);
    if (tierKwh <= 0) break;
    cost += tierKwh * tier.rate;
    remaining -= tierKwh;
    prev = tier.limit;
    if (remaining <= 0) break;
  }
  return Math.round(cost);
}

interface Result {
  electricity: number;
  water: number;
  gas: number;
  internet: number;
  rent: number;
  food: number;
  transport: number;
  total: number;
  pieData: { name: string; value: number }[];
}

const COLORS = ["#3b82f6", "#06b6d4", "#f59e0b", "#8b5cf6", "#ec4899", "#22c55e", "#f97316"];

export default function UtilityCostCalculator() {
  const [kwh, setKwh] = useState("300");
  const [waterBill, setWaterBill] = useState("300");
  const [gasBill, setGasBill] = useState("500");
  const [internet, setInternet] = useState("699");
  const [rent, setRent] = useState("15000");
  const [food, setFood] = useState("8000");
  const [transport, setTransport] = useState("2000");
  const [result, setResult] = useState<Result | null>(null);

  const saveResult = trpc.tools.saveResult.useMutation();

  function calculate() {
    const electricity = calcElectricity(Number(kwh));
    const water = Number(waterBill);
    const gas = Number(gasBill);
    const inet = Number(internet);
    const r = Number(rent);
    const f = Number(food);
    const t = Number(transport);
    const total = electricity + water + gas + inet + r + f + t;

    const pieData = [
      { name: "房租", value: r },
      { name: "電費", value: electricity },
      { name: "飲食", value: f },
      { name: "交通", value: t },
      { name: "瓦斯", value: gas },
      { name: "網路", value: inet },
      { name: "水費", value: water },
    ].filter(d => d.value > 0);

    const res: Result = { electricity, water, gas, internet: inet, rent: r, food: f, transport: t, total, pieData };
    setResult(res);
    saveResult.mutate({
      toolId: "utility-cost-calculator",
      category: "finance",
      inputParams: { kwh, waterBill, gasBill, internet, rent, food, transport },
      result: { electricity, total },
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">電費／生活成本計算器</h1>
        <p className="text-muted-foreground mt-1">依台電 2024 年階梯費率計算電費，統計每月生活總支出</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>水電瓦斯網路</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>每月用電度數（度）</Label>
              <Input type="number" value={kwh} onChange={e => setKwh(e.target.value)} />
              <p className="text-xs text-muted-foreground">台電住宅用電階梯費率：120度以下 $1.63/度，超過部分依階梯計費</p>
            </div>
            <div className="space-y-2">
              <Label>每月水費（元）</Label>
              <Input type="number" value={waterBill} onChange={e => setWaterBill(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>每月瓦斯費（元）</Label>
              <Input type="number" value={gasBill} onChange={e => setGasBill(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>每月網路費（元）</Label>
              <Input type="number" value={internet} onChange={e => setInternet(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>其他生活支出</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>每月房租（元）</Label>
              <Input type="number" value={rent} onChange={e => setRent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>每月飲食費（元）</Label>
              <Input type="number" value={food} onChange={e => setFood(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>每月交通費（元）</Label>
              <Input type="number" value={transport} onChange={e => setTransport(e.target.value)} />
            </div>
            <Button className="w-full mt-2" onClick={calculate}>計算月支出</Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "電費（台電試算）", value: `NT$${result.electricity.toLocaleString()}` },
              { label: "每月總支出", value: `NT$${result.total.toLocaleString()}` },
              { label: "每日平均支出", value: `NT$${Math.round(result.total / 30).toLocaleString()}` },
              { label: "每年總支出", value: `NT$${(result.total * 12).toLocaleString()}` },
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
            <CardHeader><CardTitle>支出分佈</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={result.pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {result.pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `NT$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>台電階梯費率說明</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-1">用電區間（度）</th><th className="text-right py-1">費率（元/度）</th></tr></thead>
                <tbody>
                  {ELECTRICITY_TIERS.map((tier, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1">{i === 0 ? `1 ~ ${tier.limit}` : `${ELECTRICITY_TIERS[i-1].limit + 1} ~ ${tier.limit === Infinity ? "以上" : tier.limit}`}</td>
                      <td className="text-right py-1">{tier.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
