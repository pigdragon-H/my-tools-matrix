import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
  "design/color-contrast-ratio-calculator": lazy(() => import("@/tools/design/ColorContrastRatioCalculator")),
  "design/golden-ratio-calculator": lazy(() => import("@/tools/design/GoldenRatioCalculator")),
  "design/aspect-ratio-calculator": lazy(() => import("@/tools/design/AspectRatioCalculator")),
  "design/type-scale-calculator": lazy(() => import("@/tools/design/TypeScaleCalculator")),
  "design/px-rem-converter": lazy(() => import("@/tools/design/PxRemConverter")),
  "design/grid-layout-calculator": lazy(() => import("@/tools/design/GridLayoutCalculator")),
  "design/line-height-calculator": lazy(() => import("@/tools/design/LineHeightCalculator")),
};

export default function DesignToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
