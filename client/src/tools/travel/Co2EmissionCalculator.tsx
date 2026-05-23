import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "co2",
  "zhTitle": "旅遊碳排放計算器",
  "enTitle": "CO2 Emission Calculator",
  "zhDescription": "依交通方式估算CO₂排放。",
  "enDescription": "Estimate CO₂ emissions by transportation mode.",
  "formulaZh": "排放量 = 距離 × 排放係數",
  "formulaEn": "Emission = distance × factor",
  "fields": [
    {
      "key": "mode",
      "zh": "交通方式",
      "en": "Mode",
      "type": "select",
      "defaultValue": "car",
      "options": [
        {
          "value": "flight",
          "zh": "飛機",
          "en": "Flight"
        },
        {
          "value": "train",
          "zh": "火車",
          "en": "Train"
        },
        {
          "value": "car",
          "zh": "汽車",
          "en": "Car"
        },
        {
          "value": "scooter",
          "zh": "機車",
          "en": "Scooter"
        },
        {
          "value": "bus",
          "zh": "公車",
          "en": "Bus"
        }
      ]
    },
    {
      "key": "a",
      "zh": "距離",
      "en": "Distance",
      "unitZh": "km",
      "unitEn": "km",
      "defaultValue": "300"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function Co2EmissionCalculator() {
  return <ProfessionalToolShell config={config} />;
}
