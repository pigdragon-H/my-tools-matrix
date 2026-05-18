// ============================================================
// BmiCalculator - /tools/health/bmi-calculator
// BMI 計算機：含 WHO 標準分類與健康建議
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Scale, Calculator, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

const formSchema = z.object({
  height: z
    .string()
    .min(1, "請輸入身高")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 50 && Number(v) <= 250, "身高請輸入 50～250 cm"),
  weight: z
    .string()
    .min(1, "請輸入體重")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 10 && Number(v) <= 300, "體重請輸入 10～300 kg"),
  gender: z.enum(["male", "female"]),
  age: z
    .string()
    .min(1, "請輸入年齡")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 2 && Number(v) <= 120, "年齡請輸入 2～120 歲"),
});

type FormValues = z.infer<typeof formSchema>;

interface BmiCategory {
  label: string;
  color: string;
  bgColor: string;
  advice: string;
  min: number;
  max: number;
}

const BMI_CATEGORIES: BmiCategory[] = [
  { label: "體重過輕", color: "text-blue-500", bgColor: "bg-blue-500", advice: "建議增加熱量攝取與重量訓練，並諮詢營養師", min: 0, max: 18.5 },
  { label: "正常體重", color: "text-emerald-500", bgColor: "bg-emerald-500", advice: "維持現有飲食與運動習慣，定期健康檢查", min: 18.5, max: 24 },
  { label: "過重", color: "text-yellow-500", bgColor: "bg-yellow-500", advice: "建議控制飲食熱量，增加有氧運動頻率", min: 24, max: 27 },
  { label: "輕度肥胖", color: "text-orange-500", bgColor: "bg-orange-500", advice: "建議就醫評估，制定減重計畫，避免慢性病風險", min: 27, max: 30 },
  { label: "中度肥胖", color: "text-red-500", bgColor: "bg-red-500", advice: "強烈建議就醫，可能需要醫療介入協助減重", min: 30, max: 35 },
  { label: "重度肥胖", color: "text-red-700", bgColor: "bg-red-700", advice: "請立即就醫，評估手術或藥物治療方案", min: 35, max: Infinity },
];

function getBmiCategory(bmi: number): BmiCategory {
  return BMI_CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

// 理想體重範圍（BMI 18.5～24）
function getIdealWeightRange(heightCm: number): { min: number; max: number } {
  const h = heightCm / 100;
  return { min: Math.round(18.5 * h * h * 10) / 10, max: Math.round(24 * h * h * 10) / 10 };
}

// BMI 進度條位置（0～40+ 映射到 0～100）
function bmiToProgress(bmi: number): number {
  return Math.min(100, Math.max(0, (bmi / 40) * 100));
}

export default function BmiCalculator() {
  const [result, setResult] = useState<{
    bmi: number;
    category: BmiCategory;
    idealRange: { min: number; max: number };
    weightToIdeal: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const saveResult = trpc.tools.saveResult.useMutation();
  const { data: relatedArticles } = trpc.blog.listByCategory.useQuery({ category: "health" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { height: "170", weight: "65", gender: "male", age: "30" },
  });

  function onSubmit(values: FormValues) {
    setIsCalculating(true);
    setTimeout(() => {
      const h = Number(values.height) / 100;
      const w = Number(values.weight);
      const bmi = w / (h * h);
      const bmiRounded = Math.round(bmi * 10) / 10;
      const category = getBmiCategory(bmiRounded);
      const idealRange = getIdealWeightRange(Number(values.height));
      const weightToIdeal = w < idealRange.min ? idealRange.min - w : w > idealRange.max ? w - idealRange.max : 0;

      setResult({ bmi: bmiRounded, category, idealRange, weightToIdeal });
      setIsCalculating(false);
      saveResult.mutate({
        toolId: "bmi-calculator",
        category: "health",
        inputParams: { height: Number(values.height), weight: w, gender: values.gender, age: Number(values.age) },
        result: { bmi: bmiRounded, category: category.label },
      });
    }, 200);
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-teal-100 dark:bg-teal-900/30 p-2">
            <Scale className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">BMI 計算機</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              依台灣衛福部標準分類，提供個人化健康建議
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              輸入身體數據
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>身高（cm）</FormLabel>
                        <FormControl><Input placeholder="例：170" {...field} inputMode="decimal" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>體重（kg）</FormLabel>
                        <FormControl><Input placeholder="例：65" {...field} inputMode="decimal" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>性別</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="male">男性</SelectItem>
                            <SelectItem value="female">女性</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>年齡（歲）</FormLabel>
                        <FormControl><Input placeholder="例：30" {...field} inputMode="numeric" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={isCalculating}>
                  {isCalculating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />計算中...</>
                  ) : (
                    <><Calculator className="h-4 w-4" />計算 BMI</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4" />
              BMI 結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Scale className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">輸入身體數據後點擊「計算 BMI」</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* BMI 數值 */}
                <div className="text-center py-4">
                  <div className={`text-5xl font-black ${result.category.color}`}>{result.bmi}</div>
                  <Badge className={`mt-2 ${result.category.bgColor} text-white border-0`}>{result.category.label}</Badge>
                </div>

                {/* 進度條 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>過輕 &lt;18.5</span>
                    <span>正常 18.5-24</span>
                    <span>肥胖 &gt;27</span>
                  </div>
                  <Progress value={bmiToProgress(result.bmi)} className="h-3" />
                </div>

                <Separator />

                {/* 詳細資訊 */}
                <div className="space-y-3">
                  {[
                    { label: "您的 BMI 值", value: result.bmi.toString(), color: result.category.color },
                    { label: "理想體重範圍", value: `${result.idealRange.min} ～ ${result.idealRange.max} kg`, color: "text-emerald-500" },
                    {
                      label: result.weightToIdeal > 0 ? (result.bmi < 18.5 ? "需增重" : "需減重") : "體重狀態",
                      value: result.weightToIdeal > 0 ? `約 ${result.weightToIdeal.toFixed(1)} kg` : "在理想範圍內",
                      color: result.weightToIdeal > 0 ? "text-amber-500" : "text-emerald-500",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className={`text-sm font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* 健康建議 */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">健康建議</p>
                  <p className="text-sm">{result.category.advice}</p>
                </div>

                {/* BMI 分類表 */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">台灣衛福部 BMI 分類標準</p>
                  {BMI_CATEGORIES.map((c) => (
                    <div key={c.label} className={`flex justify-between items-center text-xs px-2 py-1 rounded ${result.category.label === c.label ? "bg-muted font-semibold" : ""}`}>
                      <span className={c.color}>{c.label}</span>
                      <span className="text-muted-foreground">
                        {c.max === Infinity ? `≥ ${c.min}` : `${c.min} ～ ${c.max}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
                  <Badge variant="secondary" className="text-xs mb-2">健康</Badge>
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
