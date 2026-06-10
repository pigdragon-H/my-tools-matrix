import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
  "education/gpa-calculator": lazy(() => import("@/tools/education/GpaCalculator")),
  "education/grade-calculator": lazy(() => import("@/tools/education/GradeCalculator")),
  "education/study-time-calculator": lazy(() => import("@/tools/education/StudyTimeCalculator")),
  "education/math-percentage-calculator": lazy(() => import("@/tools/education/MathPercentageCalculator")),
  "education/reading-speed-calculator": lazy(() => import("@/tools/education/ReadingSpeedCalculator")),
  "education/exam-score-converter": lazy(() => import("@/tools/education/ExamScoreConverter")),
  "education/typing-speed-calculator": lazy(() => import("@/tools/education/TypingSpeedCalculator")),
  "education/spaced-repetition-calculator": lazy(() => import("@/tools/education/SpacedRepetitionCalculator")),
  "education/iq-test-calculator": lazy(() => import("@/tools/education/IqTestCalculator")),
  "education/astrology-calculator-edu": lazy(() => import("@/tools/education/AstrologyCalculatorEdu")),
};

export default function EducationToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
