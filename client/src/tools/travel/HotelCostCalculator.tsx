import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "hotel",
  "zhTitle": "飯店費用計算器",
  "enTitle": "Hotel Cost Calculator",
  "zhDescription": "計算住宿總費用與每人費用。",
  "enDescription": "Calculate hotel total and per-person cost.",
  "formulaZh": "總費用 = 每晚費用 × 天數 × 稅費",
  "formulaEn": "Total = nightly rate × nights × taxes",
  "fields": [
    {
      "key": "a",
      "zh": "每晚費用",
      "en": "Nightly rate",
      "defaultValue": "120"
    },
    {
      "key": "b",
      "zh": "住宿天數",
      "en": "Nights",
      "defaultValue": "3"
    },
    {
      "key": "c",
      "zh": "人數",
      "en": "People",
      "defaultValue": "2"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function HotelCostCalculator() {
  return <ProfessionalToolShell config={config} />;
}
