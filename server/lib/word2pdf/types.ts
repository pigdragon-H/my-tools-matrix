export interface PageGeom {
  pageW: number;
  marL: number;
  marR: number;
  contentW: number;
  contentCentre: number;
}

export type LayoutPolicy =
  | "faithful-single-page-preferred"
  | "visual-fidelity-first";

export interface LayoutSignals {
  fakeCenterRisk: boolean;
  floatingTableRisk: boolean;
  denseMetaLine: boolean;
  fragileHeaderBlock: boolean;
  singlePageCompressionRisk: boolean;
  compatLegacyQuotationMetaHeaderLine: boolean;
}

export interface LayoutContext {
  signals: LayoutSignals;
  policy: LayoutPolicy;
}
