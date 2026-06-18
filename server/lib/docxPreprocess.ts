/**
 * Compatibility wrapper for the refactored Word→PDF preprocessor.
 *
 * PR-1 keeps external imports stable while moving the implementation into the
 * dedicated word2pdf/ module tree (detectors / passes / qa).
 */
export { preprocessQuotationDocx, disableSnapToGrid } from "./word2pdf";
