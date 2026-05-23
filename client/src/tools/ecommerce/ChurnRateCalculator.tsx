import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "churn",
  "zhTitle": "客戶流失率計算器",
  "enTitle": "Churn Rate Calculator",
  "zhDescription": "流失率與留存率分析。",
  "enDescription": "Analyze churn and retention.",
  "formulaZh": "流失率 = 流失客戶數 ÷ 期初客戶數 × 100%",
  "formulaEn": "Churn = lost customers / starting customers × 100%",
  "fields": [
    {
      "key": "a",
      "zh": "期初客戶數",
      "en": "Starting customers",
      "defaultValue": "1000"
    },
    {
      "key": "b",
      "zh": "流失客戶數",
      "en": "Lost customers",
      "defaultValue": "80"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function ChurnRateCalculator() {
  return <ProfessionalToolShell config={config} />;
}
