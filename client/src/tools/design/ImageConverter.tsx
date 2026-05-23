import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "default",
  "zhTitle": "圖片轉換說明器",
  "enTitle": "Image Converter",
  "zhDescription": "設計與前端工作流程工具。",
  "enDescription": "Design and frontend workflow tool.",
  "formulaZh": "依設計參數產生建議",
  "formulaEn": "Generate guidance from design parameters",
  "fields": [
    {
      "key": "a",
      "zh": "數值 A",
      "en": "Value A",
      "defaultValue": "100"
    },
    {
      "key": "b",
      "zh": "數值 B",
      "en": "Value B",
      "defaultValue": "25"
    },
    {
      "key": "c",
      "zh": "數值 C",
      "en": "Value C",
      "defaultValue": "10"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function ImageConverter() {
  return <ProfessionalToolShell config={config} />;
}
