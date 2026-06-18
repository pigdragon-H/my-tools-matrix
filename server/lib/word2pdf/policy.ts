import type { LayoutPolicy, LayoutSignals } from "./types";

export function chooseLayoutPolicy(signals: LayoutSignals): LayoutPolicy {
  if (
    signals.fragileHeaderBlock ||
    signals.singlePageCompressionRisk ||
    signals.preTableMetaBlockRisk ||
    signals.sharedLeftEdgeMismatch ||
    (signals.denseMetaLine && signals.floatingTableRisk)
  ) {
    return "visual-fidelity-first";
  }
  return "faithful-single-page-preferred";
}

export function shouldRunStructuralPasses(signals: LayoutSignals): boolean {
  return (
    signals.fakeCenterRisk ||
    signals.floatingTableRisk ||
    signals.preTableMetaBlockRisk ||
    signals.sharedLeftEdgeMismatch
  );
}

export function shouldReconstructTitleBand(signals: LayoutSignals): boolean {
  return signals.fakeCenterRisk && signals.denseMetaLine;
}

export function shouldRelocateMetaLineNearTable(signals: LayoutSignals): boolean {
  return (
    signals.preTableMetaBlockRisk &&
    (signals.floatingTableRisk || signals.tabStopFieldClusterRisk || signals.denseMetaLine)
  );
}

export function shouldUseLegacyQuotationCompat(signals: LayoutSignals): boolean {
  return (
    !signals.fragileHeaderBlock &&
    !signals.singlePageCompressionRisk &&
    signals.compatLegacyQuotationMetaHeaderLine
  );
}

export function shouldDefloatTable(policy: LayoutPolicy, signals: LayoutSignals): boolean {
  if (!signals.floatingTableRisk) return false;
  if (policy !== "faithful-single-page-preferred") return false;
  if (shouldUseLegacyQuotationCompat(signals)) return false;
  return true;
}
