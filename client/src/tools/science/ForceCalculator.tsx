import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "force",
  "zhTitle": "力計算器",
  "enTitle": "Force Calculator",
  "zhDescription": "使用牛頓第二定律計算力。",
  "enDescription": "Calculate force using Newton's second law.",
  "formulaZh": "F = m × a",
  "formulaEn": "F = m × a",
  "fields": [
    {
      "key": "a",
      "zh": "質量",
      "en": "Mass",
      "unitZh": "kg",
      "unitEn": "kg",
      "defaultValue": "10"
    },
    {
      "key": "b",
      "zh": "加速度",
      "en": "Acceleration",
      "unitZh": "m/s²",
      "unitEn": "m/s²",
      "defaultValue": "9.8"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function ForceCalculator() {
  return <ProfessionalToolShell config={config} />;
}
