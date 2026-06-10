import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
  "productivity/pomodoro-planner": lazy(() => import("@/tools/productivity/PomodoroPlanner")),
  "productivity/time-zone-converter": lazy(() => import("@/tools/productivity/TimeZoneConverter")),
  "productivity/word-counter": lazy(() => import("@/tools/productivity/WordCounter")),
  "productivity/date-duration-calculator": lazy(() => import("@/tools/productivity/DateDurationCalculator")),
  "productivity/age-calculator": lazy(() => import("@/tools/productivity/AgeCalculator")),
  "productivity/deadline-countdown-calculator": lazy(() => import("@/tools/productivity/DeadlineCountdownCalculator")),
  "productivity/hours-calculator": lazy(() => import("@/tools/productivity/HoursCalculator")),
  "productivity/task-priority-matrix": lazy(() => import("@/tools/productivity/TaskPriorityMatrix")),
};

export default function ProductivityToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
