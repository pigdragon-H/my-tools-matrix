// ============================================================
// DCACalculator - /tools/finance/dca-calculator
// 股票平均成本計算機（攤平計算）
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarChart2, Calculator, BookOpen, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

interface BuyRecord {
  id: number;
  price: string;
  shares: string;
}

interface BarData {
  label: string;
  price: number;
  shares: number;
  cost: number;
}

function formatTWD(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(2)} 萬`;
  return n.toLocaleString("zh-TW");
}

export default function DCACalculator() {
  const [records, setRecords] = useState<BuyRecord[]>([
    { id: 1, price: "100", shares: "1000" },
    { id: 2, price: "80", shares: "2000" },
  ]);
  const [nextId, setNextId] = useState(3);
  const [result, setResult] = useState<{
    avgCost: number;
    totalShares: number;
    totalCost: number;
    barData: BarData[];
  } | null>(null);
  const [currentPrice, setCurrentPrice] = useState("90");
  const [error, setError] = useState("");
  const saveResult = trpc.tools.saveResult.useMutation();
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "finance" });

  function addRecord() {
    setRecords((prev) => [...prev, { id: nextId, price: "", shares: "" }]);
    setNextId((n) => n + 1);
  }

  function removeRecord(id: number) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRecord(id: number, field: "price" | "shares", value: string) {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function calculate() {
    setError("");
    const valid = records.filter((r) => r.price && r.shares && Number(r.price) > 0 && Number(r.shares) > 0);
    if (valid.length < 1) {
      setError("請至少輸入一筆有效的買入記錄");
      return;
    }

    let totalCost = 0;
    let totalShares = 0;
    const barData: BarData[] = [];

    valid.forEach((r, i) => {
      const price = Number(r.price);
      const shares = Number(r.shares);
      const cost = price * shares;
      totalCost += cost;
      totalShares += shares;
      barData.push({ label: `第${i + 1}批`, price, shares, cost });
    });

    const avgCost = totalCost / totalShares;
    setResult({ avgCost, totalShares, totalCost, barData });

    saveResult.mutate({
      toolId: "dca-calculator",
      category: "finance",
      inputParams: { records: valid.map((r) => ({ price: Number(r.price), shares: Number(r.shares) })) },
      result: { avgCost, totalShares, totalCost },
    });
  }

  const curPrice = Number(currentPrice);
  const profitLoss = result ? (curPrice - result.avgCost) * result.totalShares : 0;
  const profitRate = result ? ((curPrice - result.avgCost) / result.avgCost) * 100 : 0;

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
            <BarChart2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">股票平均成本計算機</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              多批次買入攤平計算，即時顯示損益狀況
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              買入記錄
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>買入價格（元/股）</span>
              <span>買入股數（股）</span>
            </div>
            {records.map((r) => (
              <div key={r.id} className="flex gap-2 items-center">
                <Input
                  placeholder="例：100"
                  value={r.price}
                  onChange={(e) => updateRecord(r.id, "price", e.target.value)}
                  inputMode="decimal"
                  className="flex-1"
                />
                <Input
                  placeholder="例：1000"
                  value={r.shares}
                  onChange={(e) => updateRecord(r.id, "shares", e.target.value)}
                  inputMode="numeric"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRecord(r.id)}
                  disabled={records.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={addRecord}>
              <Plus className="h-4 w-4" />
              新增一批買入
            </Button>

            <Separator />
            <div className="space-y-2">
              <Label className="text-sm">目前股價（元，用於損益計算）</Label>
              <Input
                placeholder="例：90"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                inputMode="decimal"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button className="w-full gap-2" onClick={calculate}>
              <Calculator className="h-4 w-4" />
              計算平均成本
            </Button>

            {result && (
              <div className="space-y-3">
                <Separator />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">計算結果</p>
                {[
                  { label: "平均成本", value: `${result.avgCost.toFixed(2)} 元`, color: "text-violet-600 dark:text-violet-400" },
                  { label: "總持股數", value: `${result.totalShares.toLocaleString()} 股`, color: "" },
                  { label: "總投入成本", value: formatTWD(result.totalCost), color: "" },
                  {
                    label: "目前損益",
                    value: `${profitLoss >= 0 ? "+" : ""}${formatTWD(profitLoss)} (${profitRate >= 0 ? "+" : ""}${profitRate.toFixed(2)}%)`,
                    color: profitLoss >= 0 ? "text-emerald-500" : "text-red-500",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              各批次買入成本分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <BarChart2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">輸入買入記錄後點擊「計算平均成本」</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tickFormatter={(v) => `${v}`} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "price" ? `${value} 元` : `${value.toLocaleString()} 股`,
                      name === "price" ? "買入價格" : "買入股數",
                    ]}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <ReferenceLine y={result.avgCost} stroke="#8b5cf6" strokeDasharray="6 3" label={{ value: `均價 ${result.avgCost.toFixed(1)}`, fill: "#8b5cf6", fontSize: 11 }} />
                  {curPrice > 0 && (
                    <ReferenceLine y={curPrice} stroke={curPrice >= result.avgCost ? "#10b981" : "#ef4444"} strokeDasharray="4 4"
                      label={{ value: `現價 ${curPrice}`, fill: curPrice >= result.avgCost ? "#10b981" : "#ef4444", fontSize: 11 }} />
                  )}
                  <Bar dataKey="price" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {relatedArticles && relatedArticles.length > 0 && (
        <div className="mt-10">
          <Separator className="mb-6" />
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            相關知識文章
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/blog/${article.category}/${article.id}`}>
                <div className="group rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                  <Badge variant="secondary" className="text-xs mb-2">財經</Badge>
                  <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">閱讀文章 <ArrowRight className="h-3 w-3" /></p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
