// ============================================================
// ToolPage - /tools/:category/:toolName 工具容器頁
// 根據路由參數動態渲染對應的計算工具組件
// 
// 憲法 V3 遵循：
// - 只保留已完成重造的工具（BMI、BMR）
// - 為新工具預留空位
// - 避免舊檔案衝突
// ============================================================

import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryByKey } from "@shared/categoriesConfig";
import { getToolByPath } from "@shared/toolsConfig";
import { lazy, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { setSeoMeta } from "@/lib/seo";

// ============================================================
// 工具組件映射（懶加載）
// 只包含已完成重造的工具
// ============================================================
const toolComponentMap: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  // ── 健康工具（已完成重造）
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/bmr-calculator": lazy(() => import("@/tools/health/BmrCalculator")),
  "health/ideal-weight-calculator": lazy(() => import("@/tools/health/IdealWeightCalculator")),
  "health/tdee-calculator": lazy(() => import("@/tools/health/TdeeCalculator")),
  "health/calorie-deficit-calculator": lazy(() => import("@/tools/health/CalorieDeficitCalculator")),
  
  // ── 財經工具（已完成重造）
  "finance/roi-calculator": lazy(() => import("@/tools/finance/RoiCalculator")),
  "finance/compound-interest-calculator": lazy(() => import("@/tools/finance/CompoundInterestCalculator")),
  "finance/loan-calculator": lazy(() => import("@/tools/finance/LoanCalculator")),
  "finance/mortgage-calculator": lazy(() => import("@/tools/finance/MortgageCalculator")),
  "finance/salary-after-tax-calculator": lazy(() => import("@/tools/finance/SalaryAfterTaxCalculator")),
  "finance/retirement-calculator": lazy(() => import("@/tools/finance/RetirementCalculator")),
  "finance/emergency-fund-calculator": lazy(() => import("@/tools/finance/EmergencyFundCalculator")),
  "finance/debt-payoff-calculator": lazy(() => import("@/tools/finance/DebtPayoffCalculator")),
  "finance/cagr-calculator": lazy(() => import("@/tools/finance/CagrCalculator")),
  "finance/net-worth-calculator": lazy(() => import("@/tools/finance/NetWorthCalculator")),
  "finance/inflation-calculator": lazy(() => import("@/tools/finance/InflationCalculator")),
  "finance/credit-card-payoff": lazy(() => import("@/tools/finance/CreditCardPayoff")),
  "finance/tip-calculator": lazy(() => import("@/tools/finance/TipCalculator")),
  
  // ── 健康工具（已完成重造）
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/bmr-calculator": lazy(() => import("@/tools/health/BmrCalculator")),
  "health/ideal-weight-calculator": lazy(() => import("@/tools/health/IdealWeightCalculator")),
  "health/tdee-calculator": lazy(() => import("@/tools/health/TdeeCalculator")),
  "health/calorie-deficit-calculator": lazy(() => import("@/tools/health/CalorieDeficitCalculator")),
  "health/body-fat-calculator": lazy(() => import("@/tools/health/BodyFatCalculator")),
  "health/water-intake-calculator": lazy(() => import("@/tools/health/WaterIntakeCalculator")),
  "health/macros-calculator": lazy(() => import("@/tools/health/MacrosCalculator")),
  "health/pregnancy-calculator": lazy(() => import("@/tools/health/PregnancyCalculator")),
  "health/blood-pressure-calculator": lazy(() => import("@/tools/health/BloodPressureCalculator")),
  "health/heart-rate-calculator": lazy(() => import("@/tools/health/HeartRateCalculator")),
  "health/sleep-cycle-calculator": lazy(() => import("@/tools/health/SleepCycleCalculator")),
  "health/ovulation-tracker": lazy(() => import("@/tools/health/OvulationTracker")),
  "health/age-calculator": lazy(() => import("@/tools/health/AgeCalculator")),
  "health/calorie-calculator": lazy(() => import("@/tools/health/CalorieCalculator")),
  
  // ── 開發工具（已完成重造）
  "developer/api-response-formatter": lazy(() => import("@/tools/developer/ApiResponseFormatter")),
  "developer/json-validator": lazy(() => import("@/tools/developer/JsonValidator")),
  "developer/regex-tester": lazy(() => import("@/tools/developer/RegexTester")),
  "developer/cron-expression-builder": lazy(() => import("@/tools/developer/CronExpressionBuilder")),
  "developer/base64-encoder-decoder": lazy(() => import("@/tools/developer/Base64EncoderDecoder")),
  "developer/url-encoder": lazy(() => import("@/tools/developer/UrlEncoder")),
  "developer/uuid-generator": lazy(() => import("@/tools/developer/UuidGenerator")),
  "developer/password-pro-generator": lazy(() => import("@/tools/developer/PasswordProGenerator")),
  "developer/html-formatter": lazy(() => import("@/tools/developer/HtmlFormatter")),
  "developer/css-beautifier": lazy(() => import("@/tools/developer/CssBeautifier")),
  "developer/color-picker": lazy(() => import("@/tools/developer/ColorPicker")),
  "developer/diff-checker": lazy(() => import("@/tools/developer/DiffChecker")),
  "developer/jwt-decoder": lazy(() => import("@/tools/developer/JwtDecoder")),
  "developer/lorem-ipsum-generator": lazy(() => import("@/tools/developer/LoremIpsumGenerator")),
  
  // ── 其他類別（待重造）
  // 預留空位：其他類別工具將在後續階段重造
};

// ============================================================
// ToolPage 組件
// ============================================================
export function ToolPage() {
  const { category, toolName } = useParams<{ category: string; toolName: string }>();
  
  if (!category || !toolName) {
    return <div>Invalid tool path</div>;
  }

  const toolKey = `${category}/${toolName}`;
  const Component = toolComponentMap[toolKey];
  const tool = getToolByPath(`/tools/${toolKey}`);
  const categoryInfo = getCategoryByKey(category);

  useEffect(() => {
    if (tool) {
      setSeoMeta({
        title: `${tool.name} - Formula Universe`,
        description: tool.description,
        keywords: tool.tags?.join(", "),
      });
    }
  }, [tool]);

  if (!Component) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/tools">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
          </Link>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              工具正在重造中
            </h1>
            <p className="text-slate-600 mb-6">
              此工具正在根據黃金模版進行完整重造。
              <br />
              敬請期待新版本的推出！
            </p>
            <Link href="/tools">
              <Button>返回工具列表</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto p-4">
        <Link href={`/tools?category=${category}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {categoryInfo?.displayNameZh || category}
          </Button>
        </Link>

        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          }
        >
          <Component />
        </Suspense>
      </div>
    </div>
  );
}

export default ToolPage;
