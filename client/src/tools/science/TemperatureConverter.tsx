import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "temperature",
  "zhTitle": "溫度轉換器",
  "enTitle": "Temperature Converter",
  "zhDescription": "攝氏、華氏、克耳文三向換算。",
  "enDescription": "Convert Celsius, Fahrenheit and Kelvin.",
  "formulaZh": "°F = °C × 9/5 + 32；K = °C + 273.15",
  "formulaEn": "°F = °C × 9/5 + 32; K = °C + 273.15",
  "fields": [
    {
      "key": "a",
      "zh": "攝氏溫度",
      "en": "Celsius",
      "unitZh": "°C",
      "unitEn": "°C",
      "defaultValue": "25"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function TemperatureConverter() {
  return <ProfessionalToolShell config={config} />;
}
