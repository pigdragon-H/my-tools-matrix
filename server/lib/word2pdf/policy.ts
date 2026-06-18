import type { LayoutPolicy, LayoutSignals } from "./types";

export function chooseLayoutPolicy(signals: LayoutSignals): LayoutPolicy {
  if (
    signals.fragileHeaderBlock ||
    signals.singlePageCompressionRisk ||
    signals.legacyQuotationMetaHeaderLine
  ) {
    return "visual-fidelity-first";
  }
  return "faithful-single-page-preferred";
}

export function shouldRunStructuralPasses(signals: LayoutSignals): boolean {
  return signals.fakeCenterRisk || signals.floatingTableRisk;
}

export function shouldDefloatTable(policy: LayoutPolicy, signals: LayoutSignals): boolean {
  if (!signals.floatingTableRisk) return false;
  return policy === "faithful-single-page-preferred";
}
