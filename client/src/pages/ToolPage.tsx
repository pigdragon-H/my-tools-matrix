// ============================================================
// ToolPage - /tools/:category/:toolName 工具容器頁
// 根據路由參數動態渲染對應的計算工具組件
// ============================================================

import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryByKey } from "@shared/categoriesConfig";
import { getToolByPath } from "@shared/toolsConfig";
import { lazy, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { setSeoMeta } from "@/lib/seo";

// 工具組件映射（懶加載）
const toolComponentMap: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/bmr-calculator": lazy(() => import("@/tools/health/BmrCalculator")),
  "health/tdee-calculator": lazy(() => import("@/tools/health/TdeeCalculator")),
  "health/ideal-weight-calculator": lazy(() => import("@/tools/health/IdealWeightCalculator")),
  "health/body-fat-calculator": lazy(() => import("@/tools/health/BodyFatCalculator")),
  "health/calorie-deficit-calculator": lazy(() => import("@/tools/health/CalorieDeficitCalculator")),
  "health/water-intake-calculator": lazy(() => import("@/tools/health/WaterIntakeCalculator")),
  "health/macro-calculator": lazy(() => import("@/tools/health/MacroCalculator")),
  "finance/inflation-adjuster": lazy(() => import("@/tools/finance/InflationAdjuster")),
  "finance/loan-calculator": lazy(() => import("@/tools/finance/LoanCalculator")),
  "finance/mortgage-calculator": lazy(() => import("@/tools/finance/MortgageCalculator")),
  "finance/credit-card-payoff-calculator": lazy(() => import("@/tools/finance/CreditCardPayoffCalculator")),
  "finance/debt-to-income-calculator": lazy(() => import("@/tools/finance/DebtToIncomeCalculator")),
  "finance/compound-interest-calculator": lazy(() => import("@/tools/finance/CompoundInterestCalculator")),
  "finance/retirement-calculator": lazy(() => import("@/tools/finance/RetirementCalculator")),
  "finance/cagr-calculator": lazy(() => import("@/tools/finance/CagrCalculator")),
  "finance/savings-goal-calculator": lazy(() => import("@/tools/finance/SavingsGoalCalculator")),
  "finance/net-worth-calculator": lazy(() => import("@/tools/finance/NetWorthCalculator")),
  "finance/debt-payoff-calculator": lazy(() => import("@/tools/finance/DebtPayoffCalculator")),
  "finance/budget-ratio-calculator": lazy(() => import("@/tools/finance/BudgetRatioCalculator")),
  "finance/emergency-fund-calculator": lazy(() => import("@/tools/finance/EmergencyFundCalculator")),
  "finance/salary-after-tax-calculator": lazy(() => import("@/tools/finance/SalaryAfterTaxCalculator")),
  "finance/hourly-rate-calculator": lazy(() => import("@/tools/finance/HourlyRateCalculator")),
  "finance/meeting-cost-calculator": lazy(() => import("@/tools/finance/MeetingCostCalculator")),
  "finance/pomodoro-calculator": lazy(() => import("@/tools/finance/PomodoroCalculator")),
  "finance/profit-margin-calculator": lazy(() => import("@/tools/finance/ProfitMarginCalculator")),
  "finance/roas-calculator": lazy(() => import("@/tools/finance/RoasCalculator")),
  "productivity/pomodoro-planner": lazy(() => import("@/tools/productivity/PomodoroPlanner")),
  "productivity/time-zone-converter": lazy(() => import("@/tools/productivity/TimeZoneConverter")),
  "productivity/word-counter": lazy(() => import("@/tools/productivity/WordCounter")),
  "productivity/date-duration-calculator": lazy(() => import("@/tools/productivity/DateDurationCalculator")),
  "productivity/age-calculator": lazy(() => import("@/tools/productivity/AgeCalculator")),
  "developer/json-formatter": lazy(() => import("@/tools/developer/JsonFormatter")),
  "developer/base64-encoder": lazy(() => import("@/tools/developer/Base64Encoder")),
  "developer/url-encoder": lazy(() => import("@/tools/developer/UrlEncoder")),
  "developer/regex-tester": lazy(() => import("@/tools/developer/RegexTester")),
  "developer/color-converter": lazy(() => import("@/tools/developer/ColorConverter")),
  "developer/timestamp-converter": lazy(() => import("@/tools/developer/TimestampConverter")),
  "developer/markdown-preview": lazy(() => import("@/tools/developer/MarkdownPreview")),
};

function ToolSkeleton() {
  return (
    <div className="container py-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function ToolPage() {
  const { category, toolName } = useParams<{ category: string; toolName: string }>();
  const toolKey = `${category}/${toolName}`;
  const toolPath = `/tools/${toolKey}`;

  const catInfo = getCategoryByKey(category ?? "");
  const toolConfig = getToolByPath(toolPath);
  const ToolComponent = toolComponentMap[toolKey];

  useEffect(() => {
    if (!toolConfig) return;

    setSeoMeta({
      title: `${toolConfig.name}｜Formula Universe`,
      description: toolConfig.description,
    });
  }, [toolConfig]);

  if (!ToolComponent || !toolConfig) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-medium">找不到此工具</p>
        <p className="text-muted-foreground mt-2 text-sm">
          工具路徑：{toolPath}
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button asChild variant="outline">
            <Link href={`/category/${category}`}>返回分類</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">返回首頁</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/20">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              首頁
            </Link>
            <span>/</span>
            <Link href={`/category/${category}`} className="hover:text-foreground transition-colors">
              {catInfo?.name ?? category}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{toolConfig.name}</span>
          </nav>
        </div>
      </div>

      {/* Tool Component */}
      <Suspense fallback={<ToolSkeleton />}>
        <ToolComponent />
      </Suspense>
    </div>
  );
}
