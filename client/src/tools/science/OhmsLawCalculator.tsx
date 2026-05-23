import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "ohms",
  "zhTitle": "歐姆定律計算器",
  "enTitle": "Ohms Law Calculator",
  "zhDescription": "輸入任兩個值計算第三個。",
  "enDescription": "Enter any two values to calculate the third.",
  "formulaZh": "V = I × R",
  "formulaEn": "V = I × R",
  "fields": [
    {
      "key": "voltage",
      "zh": "電壓",
      "en": "Voltage",
      "unitZh": "V",
      "unitEn": "V",
      "defaultValue": "12"
    },
    {
      "key": "current",
      "zh": "電流",
      "en": "Current",
      "unitZh": "A",
      "unitEn": "A",
      "defaultValue": "2"
    },
    {
      "key": "resistance",
      "zh": "電阻",
      "en": "Resistance",
      "unitZh": "Ω",
      "unitEn": "Ω",
      "defaultValue": "0"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function OhmsLawCalculator() {
  return <ProfessionalToolShell config={config} />;
}
