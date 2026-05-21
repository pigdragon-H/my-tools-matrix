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
  // 財經投資
  "finance/roi-calculator": lazy(() => import("@/tools/finance/RoiCalculator")),
  "finance/car-depreciation": lazy(() => import("@/tools/finance/CarDepreciation")),
  "finance/mortgage-calculator": lazy(() => import("@/tools/finance/MortgageCalculator")),
  "finance/retirement-calculator": lazy(() => import("@/tools/finance/RetirementCalculator")),
  "finance/dca-calculator": lazy(() => import("@/tools/finance/DCACalculator")),
  "finance/income-tax-calculator": lazy(() => import("@/tools/finance/IncomeTaxCalculator")),
  // 財經投資（Phase 11）
  "finance/rent-vs-buy": lazy(() => import("@/tools/finance/RentVsBuy")),
  "finance/inflation-calculator": lazy(() => import("@/tools/finance/InflationCalculator")),
  "finance/credit-card-payoff": lazy(() => import("@/tools/finance/CreditCardPayoff")),
  "finance/irr-npv-calculator": lazy(() => import("@/tools/finance/IrrNpvCalculator")),
  "finance/education-fund": lazy(() => import("@/tools/finance/EducationFund")),
  "finance/dividend-reinvestment": lazy(() => import("@/tools/finance/DividendReinvestment")),
  "finance/crypto-dca-backtest": lazy(() => import("@/tools/finance/CryptoDcaBacktest")),
  // 健康生活
  "health/tdee-calculator": lazy(() => import("@/tools/health/TdeeCalculator")),
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/sleep-cycle-calculator": lazy(() => import("@/tools/health/SleepCycleCalculator")),
  "health/calorie-deficit-calculator": lazy(() => import("@/tools/health/CalorieDeficitCalculator")),
  "health/water-intake-calculator": lazy(() => import("@/tools/health/WaterIntakeCalculator")),
  // 健康生活（Phase 11）
  "health/macros-calculator": lazy(() => import("@/tools/health/MacrosCalculator")),
  "health/ovulation-tracker": lazy(() => import("@/tools/health/OvulationTracker")),
  "health/astrology-calculator": lazy(() => import("@/tools/health/AstrologyCalculator")),
  "health/pomodoro-tracker": lazy(() => import("@/tools/health/PomodoroTracker")),
  // 財經投資（Phase 12）
  "finance/insurance-calculator": lazy(() => import("@/tools/finance/InsuranceCalculator")),
  "finance/utility-cost-calculator": lazy(() => import("@/tools/finance/UtilityCostCalculator")),
  "finance/asset-depreciation": lazy(() => import("@/tools/finance/AssetDepreciation")),
  "travel/currency-converter": lazy(() => import("@/tools/finance/CurrencyConverter")),
  // 職場效率（Phase 12）
  "productivity/url-shortener": lazy(() => import("@/tools/productivity/UrlShortener")),
  "design/markdown-to-html": lazy(() => import("@/tools/productivity/MarkdownToHtml")),
  // 職場效率（productivity）
  "productivity/social-media-checker": lazy(() => import("@/tools/productivity/SocialMediaChecker")),
  "productivity/roas-cpc-calculator": lazy(() => import("@/tools/productivity/RoasCpcCalculator")),
  "productivity/freelancer-rate-calculator": lazy(() => import("@/tools/productivity/FreelancerRateCalculator")),
  "productivity/invoice-generator": lazy(() => import("@/tools/productivity/InvoiceGenerator")),
  "ecommerce/utm-builder": lazy(() => import("@/tools/productivity/UtmBuilder")),
  // 開發工具（dev）
  "dev/cron-generator": lazy(() => import("@/tools/dev/CronGenerator")),
  "dev/base64-json-formatter": lazy(() => import("@/tools/dev/Base64JsonFormatter")),
  "dev/jwt-decoder": lazy(() => import("@/tools/dev/JwtDecoder")),
  "dev/regex-tester": lazy(() => import("@/tools/dev/RegexTester")),
  "dev/uuid-password-generator": lazy(() => import("@/tools/dev/UuidPasswordGenerator")),
  "dev/responsive-breakpoint-tester": lazy(() => import("@/tools/dev/ResponsiveBreakpointTester")),
  "dev/css-grid-flexbox-generator": lazy(() => import("@/tools/dev/CssGridFlexboxGenerator")),
  "dev/image-converter": lazy(() => import("@/tools/dev/ImageConverter")),
  "dev/timezone-converter": lazy(() => import("@/tools/dev/TimezoneConverter")),
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
      title: `${toolConfig.name}｜工具矩陣`,
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
            <Link href={`/tools/${category}`}>返回分類</Link>
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
            <Link href={`/tools/${category}`} className="hover:text-foreground transition-colors">
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
