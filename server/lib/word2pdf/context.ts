import { hasDenseMetaLine } from "./detectors/hasDenseMetaLine";
import { hasFakeCentredContent } from "./detectors/hasFakeCenterRisk";
import { hasFloatingTableRisk } from "./detectors/hasFloatingTableRisk";
import { hasFragileHeaderBlock } from "./detectors/hasFragileHeaderBlock";
import { hasSinglePageCompressionRisk } from "./detectors/hasSinglePageCompressionRisk";
import { chooseLayoutPolicy } from "./policy";
import type { LayoutContext, LayoutSignals } from "./types";
import { hasLegacyQuotationMetaHeaderLine } from "./compat/legacyQuotationHeuristics";

export function buildLayoutSignals(xml: string): LayoutSignals {
  const fakeCenterRisk = hasFakeCentredContent(xml);
  const floatingTableRisk = hasFloatingTableRisk(xml);
  const denseMetaLine = hasDenseMetaLine(xml);
  const fragileHeaderBlock = hasFragileHeaderBlock(xml);
  const singlePageCompressionRisk = hasSinglePageCompressionRisk(xml);
  const compatLegacyQuotationMetaHeaderLine = hasLegacyQuotationMetaHeaderLine(xml);

  return {
    fakeCenterRisk,
    floatingTableRisk,
    denseMetaLine,
    fragileHeaderBlock,
    singlePageCompressionRisk,
    compatLegacyQuotationMetaHeaderLine,
  };
}

export function buildLayoutContext(xml: string): LayoutContext {
  const signals = buildLayoutSignals(xml);
  return {
    signals,
    policy: chooseLayoutPolicy(signals),
  };
}
