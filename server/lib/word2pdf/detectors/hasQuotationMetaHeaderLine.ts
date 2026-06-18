/**
 * Deprecated compatibility wrapper.
 *
 * PR-3 moves quotation-specific keyword heuristics out of the structural
 * detector path and into compat/. Keep this file only to avoid breaking any
 * older imports during the transition.
 */
export { hasLegacyQuotationMetaHeaderLine as hasQuotationMetaHeaderLine } from "../compat/legacyQuotationHeuristics";
