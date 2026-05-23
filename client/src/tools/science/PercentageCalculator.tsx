import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "percentage",
  "zhTitle": "百分比計算器",
  "enTitle": "Percentage Calculator",
  "zhDescription": "三種常用百分比計算。",
  "enDescription": "Three common percentage calculations.",
  "formulaZh": "百分比 = X ÷ Y × 100%",
  "formulaEn": "Percentage = X / Y × 100%",
  "fields": [
    {
      "key": "a",
      "zh": "數值 X",
      "en": "Value X",
      "defaultValue": "100"
    },
    {
      "key": "b",
      "zh": "數值 Y",
      "en": "Value Y",
      "defaultValue": "25"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function PercentageCalculator() {
  return <ProfessionalToolShell config={config} />;
}
