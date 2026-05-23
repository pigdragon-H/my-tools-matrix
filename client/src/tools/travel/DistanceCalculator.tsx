import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "distance",
  "zhTitle": "距離計算器",
  "enTitle": "Distance Calculator",
  "zhDescription": "估算兩地直線距離與飛行時間。",
  "enDescription": "Estimate straight-line distance and flight time.",
  "formulaZh": "飛行時間 ≈ 距離 ÷ 800",
  "formulaEn": "Flight time ≈ distance / 800",
  "fields": [
    {
      "key": "a",
      "zh": "距離",
      "en": "Distance",
      "unitZh": "km",
      "unitEn": "km",
      "defaultValue": "900"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function DistanceCalculator() {
  return <ProfessionalToolShell config={config} />;
}
