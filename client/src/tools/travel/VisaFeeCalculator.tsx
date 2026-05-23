import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "visa",
  "zhTitle": "簽證費用計算器",
  "enTitle": "Visa Fee Calculator",
  "zhDescription": "估算簽證費用與文件清單。",
  "enDescription": "Estimate visa fees and required documents.",
  "formulaZh": "依國家組合查詢簽證需求",
  "formulaEn": "Lookup visa needs by country pair",
  "fields": [
    {
      "key": "from",
      "zh": "出發國",
      "en": "Origin country",
      "type": "text",
      "defaultValue": "Taiwan"
    },
    {
      "key": "to",
      "zh": "目的地國",
      "en": "Destination country",
      "type": "text",
      "defaultValue": "Japan"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function VisaFeeCalculator() {
  return <ProfessionalToolShell config={config} />;
}
