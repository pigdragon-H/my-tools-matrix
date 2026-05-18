import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeftRight } from "lucide-react";

// Reference rates vs TWD (approximate, updated 2025)
const RATES_TO_TWD: Record<string, number> = {
  TWD: 1,
  USD: 32.5,
  EUR: 35.2,
  JPY: 0.215,
  GBP: 41.0,
  CNY: 4.48,
  HKD: 4.17,
  KRW: 0.0237,
  SGD: 24.2,
  AUD: 21.0,
  CAD: 23.8,
  CHF: 36.5,
  THB: 0.93,
  MYR: 7.35,
  VND: 0.00131,
};

const CURRENCY_NAMES: Record<string, string> = {
  TWD: "新台幣 (TWD)",
  USD: "美元 (USD)",
  EUR: "歐元 (EUR)",
  JPY: "日圓 (JPY)",
  GBP: "英鎊 (GBP)",
  CNY: "人民幣 (CNY)",
  HKD: "港幣 (HKD)",
  KRW: "韓元 (KRW)",
  SGD: "新加坡幣 (SGD)",
  AUD: "澳幣 (AUD)",
  CAD: "加拿大幣 (CAD)",
  CHF: "瑞士法郎 (CHF)",
  THB: "泰銖 (THB)",
  MYR: "馬來西亞令吉 (MYR)",
  VND: "越南盾 (VND)",
};

const CURRENCIES = Object.keys(RATES_TO_TWD);

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("TWD");
  const [result, setResult] = useState<number | null>(null);

  const saveResult = trpc.tools.saveResult.useMutation();

  function convert() {
    const amtNum = Number(amount);
    // Convert from → TWD → to
    const inTWD = amtNum * RATES_TO_TWD[from];
    const converted = inTWD / RATES_TO_TWD[to];
    setResult(converted);
    saveResult.mutate({
      toolId: "currency-converter",
      category: "finance",
      inputParams: { amount, from, to },
      result: { converted: Math.round(converted * 100) / 100 },
    });
  }

  function swap() {
    setFrom(to);
    setTo(from);
    setResult(null);
  }

  const rate = useMemo(() => {
    const inTWD = RATES_TO_TWD[from];
    const toRate = RATES_TO_TWD[to];
    return inTWD / toRate;
  }, [from, to]);

  // Cross-rate table: show major currencies vs selected from
  const crossRates = useMemo(() => {
    return CURRENCIES.map(cur => ({
      currency: cur,
      name: CURRENCY_NAMES[cur],
      rate: RATES_TO_TWD[from] / RATES_TO_TWD[cur],
    }));
  }, [from]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">貨幣匯率轉換器</h1>
        <p className="text-muted-foreground mt-1">支援 15 種主要貨幣即時換算，含台幣、美元、日圓、歐元等</p>
      </div>

      <Card>
        <CardHeader><CardTitle>匯率換算</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>金額</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>從</Label>
              <Select value={from} onValueChange={v => { setFrom(v); setResult(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c} value={c}>{CURRENCY_NAMES[c]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>到</Label>
              <Select value={to} onValueChange={v => { setTo(v); setResult(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c} value={c}>{CURRENCY_NAMES[c]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={convert}>換算</Button>
            <Button variant="outline" onClick={swap} className="flex items-center gap-1">
              <ArrowLeftRight className="h-4 w-4" /> 對調
            </Button>
          </div>

          {result !== null && (
            <div className="rounded-lg bg-primary/10 p-4 text-center space-y-1">
              <div className="text-3xl font-bold text-primary">
                {result >= 1 ? result.toLocaleString("zh-TW", { maximumFractionDigits: 2 }) : result.toFixed(6)} {to}
              </div>
              <div className="text-sm text-muted-foreground">
                {Number(amount).toLocaleString()} {from} = {result >= 1 ? result.toLocaleString("zh-TW", { maximumFractionDigits: 2 }) : result.toFixed(6)} {to}
              </div>
              <div className="text-xs text-muted-foreground">
                1 {from} = {rate >= 1 ? rate.toFixed(4) : rate.toFixed(6)} {to}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>1 {from} 兌換各幣別對照表</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">幣別</th>
                <th className="text-right py-2">匯率</th>
              </tr>
            </thead>
            <tbody>
              {crossRates.filter(r => r.currency !== from).map(r => (
                <tr key={r.currency} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2">{r.name}</td>
                  <td className="text-right py-2 font-mono">
                    {r.rate >= 1 ? r.rate.toFixed(4) : r.rate.toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-3">⚠️ 匯率為參考匯率，實際交易匯率依各銀行公告為準。</p>
        </CardContent>
      </Card>
    </div>
  );
}
