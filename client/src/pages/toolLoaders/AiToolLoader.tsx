import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
  "ai/ai-token-cost-calculator": lazy(() => import("@/tools/ai/AiTokenCostCalculator")),
  "ai/ai-api-cost-estimator": lazy(() => import("@/tools/ai/AiApiCostEstimator")),
  "ai/ai-project-cost-calculator": lazy(() => import("@/tools/ai/AiProjectCostCalculator")),
  "ai/prompt-token-calculator": lazy(() => import("@/tools/ai/PromptTokenCalculator")),
  "ai/fine-tuning-cost-calculator": lazy(() => import("@/tools/ai/FineTuningCostCalculator")),
  "ai/chatbot-cost-calculator": lazy(() => import("@/tools/ai/ChatbotCostCalculator")),
  "ai/ai-model-comparison": lazy(() => import("@/tools/ai/AiModelComparison")),
  "ai/ai-accuracy-calculator": lazy(() => import("@/tools/ai/AiAccuracyCalculator")),
  "ai/model-latency-calculator": lazy(() => import("@/tools/ai/ModelLatencyCalculator")),
  "ai/ai-error-rate-calculator": lazy(() => import("@/tools/ai/AiErrorRateCalculator")),
  "ai/prompt-roi-calculator": lazy(() => import("@/tools/ai/PromptRoiCalculator")),
  "ai/ai-roi-calculator": lazy(() => import("@/tools/ai/AiRoiCalculator")),
  "ai/automation-savings-calculator": lazy(() => import("@/tools/ai/AutomationSavingsCalculator")),
  "ai/ai-labor-calculator": lazy(() => import("@/tools/ai/AiLaborCalculator")),
  "ai/ai-implementation-roi": lazy(() => import("@/tools/ai/AiImplementationRoi")),
};

export default function AiToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
