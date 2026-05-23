import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "roi",
  "zhTitle": "社群媒體ROI計算器",
  "enTitle": "Social Media ROI Calculator",
  "zhDescription": "計算社群活動ROI。",
  "enDescription": "Calculate campaign ROI.",
  "formulaZh": "ROI = (收益 - 成本) ÷ 成本 × 100%",
  "formulaEn": "ROI = (gain - cost) / cost × 100%",
  "fields": [
    {
      "key": "a",
      "zh": "成本",
      "en": "Cost",
      "defaultValue": "1000"
    },
    {
      "key": "b",
      "zh": "收益",
      "en": "Revenue",
      "defaultValue": "1800"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function SocialMediaRoiCalculator() {
  return <ProfessionalToolShell config={config} />;
}
