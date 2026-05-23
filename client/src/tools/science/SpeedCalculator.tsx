import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "speed",
  "zhTitle": "速度計算器",
  "enTitle": "Speed Calculator",
  "zhDescription": "距離除以時間並換算單位。",
  "enDescription": "Divide distance by time and convert units.",
  "formulaZh": "速度 = 距離 ÷ 時間",
  "formulaEn": "Speed = distance / time",
  "fields": [
    {
      "key": "a",
      "zh": "距離",
      "en": "Distance",
      "unitZh": "km",
      "unitEn": "km",
      "defaultValue": "100"
    },
    {
      "key": "b",
      "zh": "時間",
      "en": "Time",
      "unitZh": "小時",
      "unitEn": "hours",
      "defaultValue": "2"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function SpeedCalculator() {
  return <ProfessionalToolShell config={config} />;
}
