import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Method = "straight" | "declining" | "ddb" | "soyd";

interface YearRow {
  year: number;
  depreciation: number;
  bookValue: number;
  accDepreciation: number;
}

function calcDepreciation(cost: number, salvage: number, life: number, method: Method): YearRow[] {
  const rows: YearRow[] = [];
  let bookValue = cost;
  let accDep = 0;

  for (let y = 1; y <= life; y++) {
    let dep = 0;
    if (method === "straight") {
      dep = (cost - salvage) / life;
    } else if (method === "declining") {
      const rate = 1 / life;
      dep = bookValue * rate;
      if (y === life) dep = bookValue - salvage;
    } else if (method === "ddb") {
      const rate = 2 / life;
      dep = bookValue * rate;
      if (bookValue - dep < salvage) dep = bookValue - salvage;
    } else if (method === "soyd") {
      const soyd = (life * (life + 1)) / 2;
      dep = ((life - y + 1) / soyd) * (cost - salvage);
    }
    dep = Math.max(0, dep);
    accDep += dep;
    bookValue -= dep;
    rows.push({ year: y, depreciation: Math.round(dep), bookValue: Math.round(bookValue), accDepreciation: Math.round(accDep) });
  }
  return rows;
}

const METHOD_LABELS: Record<Method, string> = {
  straight: "直線法（Straight-Line）",
  declining: "定率遞減法（Declining Balance）",
  ddb: "雙倍餘額遞減法（Double Declining Balance）",
  soyd: "年數合計法（Sum-of-Years-Digits）",
};

export default function AssetDepreciationCalculator() {
  const [cost, setCost] = useState("1000000");
  const [salvage, setSalvage] = useState("100000");
  const [life, setLife] = useState("5");
  const [method, setMethod] = useState<Method>("straight");
  const [rows, setRows] = useState<YearRow[]>([]);

  const saveResult = trpc.tools.saveResult.useMutation();

  function calculate() {
    const result = calcDepreciation(Number(cost), Number(salvage), Number(life), method);
    setRows(result);
    saveResult.mutate({
      toolId: "asset-depreciation",
      category: "finance",
      inputParams: { cost, salvage, life, method },
      result: { totalDepreciation: Number(cost) - Number(salvage), firstYearDep: result[0]?.depreciation },
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">固定資產折舊計算器</h1>
        <p className="text-muted-foreground mt-1">支援直線法、定率遞減法、雙倍餘額遞減法、年數合計法</p>
      </div>

      <Card>
        <CardHeader><CardTitle>資產設定</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>資產取得成本（元）</Label>
            <Input type="number" value={cost} onChange={e => setCost(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>殘值（元）</Label>
            <Input type="number" value={salvage} onChange={e => setSalvage(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>耐用年數（年）</Label>
            <Input type="number" value={life} onChange={e => setLife(e.target.value)} min="1" max="50" />
          </div>
          <div className="space-y-2">
            <Label>折舊方法</Label>
            <Select value={method} onValueChange={v => setMethod(v as Method)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(METHOD_LABELS) as Method[]).map(m => (
                  <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button className="w-full" onClick={calculate}>計算折舊</Button>
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "資產成本", value: `NT$${Number(cost).toLocaleString()}` },
              { label: "總折舊額", value: `NT$${(Number(cost) - Number(salvage)).toLocaleString()}` },
              { label: "第一年折舊", value: `NT$${rows[0].depreciation.toLocaleString()}` },
              { label: "最終帳面價值", value: `NT$${rows[rows.length - 1].bookValue.toLocaleString()}` },
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
            <CardHeader><CardTitle>帳面價值走勢</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" label={{ value: "年", position: "insideRight" }} />
                  <YAxis tickFormatter={v => `${(v / 10000).toFixed(0)}萬`} />
                  <Tooltip formatter={(v: number) => `NT$${v.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="bookValue" name="帳面價值" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="accDepreciation" name="累積折舊" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>折舊時程表</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">年度</th>
                    <th className="text-right py-2">本年折舊</th>
                    <th className="text-right py-2">累積折舊</th>
                    <th className="text-right py-2">帳面價值</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.year} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2">第 {row.year} 年</td>
                      <td className="text-right py-2">NT${row.depreciation.toLocaleString()}</td>
                      <td className="text-right py-2">NT${row.accDepreciation.toLocaleString()}</td>
                      <td className="text-right py-2 font-medium">NT${row.bookValue.toLocaleString()}</td>
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
