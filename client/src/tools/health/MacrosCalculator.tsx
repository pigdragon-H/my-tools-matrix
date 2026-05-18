// ============================================================
// MacrosCalculator.tsx - 巨量營養素 Macros 分配器
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils, DollarSign, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type Goal = "fat_loss" | "maintain" | "muscle_gain";

const GOAL_RATIOS: Record<Goal, { carb: number; protein: number; fat: number; label: string }> = {
  fat_loss: { carb: 0.35, protein: 0.40, fat: 0.25, label: "減脂" },
  maintain: { carb: 0.45, protein: 0.30, fat: 0.25, label: "維持體重" },
  muscle_gain: { carb: 0.50, protein: 0.30, fat: 0.20, label: "增肌" },
};

const COLORS = ["#f59e0b", "#10b981", "#3b82f6"];

export default function MacrosCalculator() {
  const [tdee, setTdee] = useState(2200);
  const [goal, setGoal] = useState<Goal>("fat_loss");
  const [customCarb, setCustomCarb] = useState<number | null>(null);
  const [customProtein, setCustomProtein] = useState<number | null>(null);
  const [customFat, setCustomFat] = useState<number | null>(null);
  const [useCustom, setUseCustom] = useState(false);
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    const ratio = GOAL_RATIOS[goal];
    const carbPct = useCustom && customCarb !== null ? customCarb / 100 : ratio.carb;
    const proteinPct = useCustom && customProtein !== null ? customProtein / 100 : ratio.protein;
    const fatPct = useCustom && customFat !== null ? customFat / 100 : ratio.fat;

    const carbCal = tdee * carbPct;
    const proteinCal = tdee * proteinPct;
    const fatCal = tdee * fatPct;

    const carbG = carbCal / 4;
    const proteinG = proteinCal / 4;
    const fatG = fatCal / 9;

    const pieData = [
      { name: `碳水化合物 ${(carbPct * 100).toFixed(0)}%`, value: Math.round(carbCal) },
      { name: `蛋白質 ${(proteinPct * 100).toFixed(0)}%`, value: Math.round(proteinCal) },
      { name: `脂肪 ${(fatPct * 100).toFixed(0)}%`, value: Math.round(fatCal) },
    ];

    // 每餐分配（3 餐）
    const meals = 3;
    return {
      carbG: Math.round(carbG), proteinG: Math.round(proteinG), fatG: Math.round(fatG),
      carbCal: Math.round(carbCal), proteinCal: Math.round(proteinCal), fatCal: Math.round(fatCal),
      perMealCarb: Math.round(carbG / meals), perMealProtein: Math.round(proteinG / meals), perMealFat: Math.round(fatG / meals),
      pieData,
    };
  }, [tdee, goal, customCarb, customProtein, customFat, useCustom]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate({
      toolId: "macros-calculator",
      category: "health",
      inputParams: { tdee, goal },
      result: { carbG: result.carbG, proteinG: result.proteinG, fatG: result.fatG },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          巨量營養素 Macros 分配器
        </h1>
        <p className="text-muted-foreground mt-1">根據你的 TDEE 與目標，計算每日碳水、蛋白質、脂肪的最佳分配</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">基本設定</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>每日 TDEE（大卡）</Label>
            <Input type="number" value={tdee} onChange={(e) => setTdee(parseInt(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">不知道 TDEE？先使用 <a href="/tools/health/tdee-calculator" className="text-primary hover:underline">TDEE 計算機</a></p>
          </div>
          <div className="space-y-1">
            <Label>目標</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fat_loss">減脂（高蛋白、低碳水）</SelectItem>
                <SelectItem value="maintain">維持體重（均衡分配）</SelectItem>
                <SelectItem value="muscle_gain">增肌（高碳水、高蛋白）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 三大營養素結果 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "碳水化合物", g: result.carbG, cal: result.carbCal, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
          { label: "蛋白質", g: result.proteinG, cal: result.proteinCal, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
          { label: "脂肪", g: result.fatG, cal: result.fatCal, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
        ].map(({ label, g, cal, color, bg }) => (
          <Card key={label} className={bg}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{g} g</p>
              <p className="text-xs text-muted-foreground">{cal} 大卡</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 圓餅圖 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">熱量分配比例</CardTitle>
          <CardDescription>目標：{GOAL_RATIOS[goal].label}｜每日 {tdee} 大卡</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={result.pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}kcal`} labelLine={false}>
                {result.pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v} 大卡`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 每餐分配 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">每餐建議攝取量（以 3 餐計算）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">碳水</p>
              <p className="text-xl font-bold text-amber-600">{result.perMealCarb} g</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">蛋白質</p>
              <p className="text-xl font-bold text-emerald-600">{result.perMealProtein} g</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">脂肪</p>
              <p className="text-xl font-bold text-blue-600">{result.perMealFat} g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>建議每公斤體重攝取 1.6～2.2g 蛋白質以維持肌肉量。碳水化合物 1g = 4 大卡，蛋白質 1g = 4 大卡，脂肪 1g = 9 大卡。</p>
      </div>

      <Button onClick={handleSave} disabled={!isAuthenticated} className="w-full sm:w-auto">
        <DollarSign className="h-4 w-4 mr-2" />
        {isAuthenticated ? "儲存計算結果" : "登入後可儲存結果"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">延伸閱讀</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/health/tdee-fat-loss-guide" className="block text-sm text-primary hover:underline">
            → 減脂期間怎麼吃？TDEE 熱量缺口完整攻略
          </a>
          <a href="/blog/health/tdee-muscle-gain-guide" className="block text-sm text-primary hover:underline">
            → 增肌飲食計畫：用 TDEE 計算每日蛋白質需求
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
