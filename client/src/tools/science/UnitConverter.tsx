import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "unit",
  "zhTitle": "單位換算器",
  "enTitle": "Unit Converter",
  "zhDescription": "常用長度單位即時換算。",
  "enDescription": "Instant conversion for common length units.",
  "formulaZh": "依標準單位比例換算",
  "formulaEn": "Convert by standard unit ratios",
  "fields": [
    {
      "key": "a",
      "zh": "長度",
      "en": "Length",
      "unitZh": "公尺",
      "unitEn": "meters",
      "defaultValue": "100"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function UnitConverter() {
  return <ProfessionalToolShell config={config} />;
}
