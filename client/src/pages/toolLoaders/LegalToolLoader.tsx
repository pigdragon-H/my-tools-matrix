import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
  "legal/penalty-calculator": lazy(() => import("@/tools/legal/PenaltyCalculator")),
  "legal/legal-interest-calculator": lazy(() => import("@/tools/legal/LegalInterestCalculator")),
  "legal/overtime-calculator": lazy(() => import("@/tools/legal/OvertimeCalculator")),
  "legal/severance-pay-calculator": lazy(() => import("@/tools/legal/SeverancePayCalculator")),
  "legal/annual-leave-calculator": lazy(() => import("@/tools/legal/AnnualLeaveCalculator")),
  "legal/minimum-wage-calculator": lazy(() => import("@/tools/legal/MinimumWageCalculator")),
  "legal/working-hours-calculator": lazy(() => import("@/tools/legal/WorkingHoursCalculator")),
  "legal/stamp-duty-calculator": lazy(() => import("@/tools/legal/StampDutyCalculator")),
  "legal/import-duty-calculator": lazy(() => import("@/tools/legal/ImportDutyCalculator")),
};

export default function LegalToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
