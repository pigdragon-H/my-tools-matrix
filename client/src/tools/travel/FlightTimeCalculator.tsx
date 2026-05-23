import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "flight",
  "zhTitle": "飛行時間計算器",
  "enTitle": "Flight Time Calculator",
  "zhDescription": "依距離估算飛行與抵達時間。",
  "enDescription": "Estimate flight and arrival time from distance.",
  "formulaZh": "飛行時間 ≈ 距離 ÷ 800",
  "formulaEn": "Flight time ≈ distance / 800",
  "fields": [
    {
      "key": "a",
      "zh": "航程距離",
      "en": "Flight distance",
      "unitZh": "km",
      "unitEn": "km",
      "defaultValue": "2500"
    },
    {
      "key": "time",
      "zh": "出發時間",
      "en": "Departure time",
      "type": "time",
      "defaultValue": "09:00"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function FlightTimeCalculator() {
  return <ProfessionalToolShell config={config} />;
}
