import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "molecular",
  "zhTitle": "分子量計算器",
  "enTitle": "Molecular Weight Calculator",
  "zhDescription": "輸入化學式估算分子量。",
  "enDescription": "Estimate molecular weight from a chemical formula.",
  "formulaZh": "分子量 = Σ 原子量 × 個數",
  "formulaEn": "Molecular weight = Σ atomic weight × count",
  "fields": [
    {
      "key": "formula",
      "zh": "化學式",
      "en": "Formula",
      "type": "text",
      "defaultValue": "H2O"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function MolecularWeightCalculator() {
  return <ProfessionalToolShell config={config} />;
}
