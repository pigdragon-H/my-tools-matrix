import type { RegressionCorpusEntry } from "./types";

/**
 * Regression corpus manifest for visually sensitive quotation/header families.
 * File resolution is handled by the caller/test harness; this manifest defines
 * the cases and the aesthetic assertions they must satisfy.
 */
export const REGRESSION_CORPUS: RegressionCorpusEntry[] = [
  {
    id: "gs-quotation-battery-pack",
    family: "fragile-header-quotation",
    fixtureRef: "gs_source.docx",
    status: "active",
    expectedPolicy: "visual-fidelity-first",
    assertions: [
      "policy-visual-fidelity-first",
      "header-visual-risk-nonincrease",
      "indent-failure-cleared-or-improved",
      "single-page-compression-risk-nonincrease",
    ],
    notes: "GS quotation: preserve one-page elegance only if header risk does not worsen.",
    expectedNotes: [
      "header visual risk lowered",
      "likely visual indent failure improved",
    ],
    referencePdfRefs: ["reference/gs_ref.pdf"],
    riskTags: ["header-indent", "single-page-pressure", "floating-table"],
  },
  {
    id: "qkf-quotation-alm-12v35i",
    family: "fragile-header-quotation",
    fixtureRef: "qkf_source.docx",
    status: "active",
    expectedPolicy: "visual-fidelity-first",
    assertions: [
      "policy-visual-fidelity-first",
      "header-visual-risk-nonincrease",
      "indent-failure-cleared-or-improved",
      "meta-line-after-table-nonincrease",
    ],
    notes: "QKF quotation: pre-table metadata lines must not drift into a visually indented layout.",
    expectedNotes: [
      "header visual risk lowered",
      "likely visual indent failure improved",
    ],
    referencePdfRefs: ["reference/qkf_ref.pdf"],
    riskTags: ["header-indent", "meta-line-order", "floating-table", "tab-stop-drift"],
  },
  {
    id: "generic-fragile-header-quotation",
    family: "fragile-header-quotation",
    fixtureRef: "pending/similar-quotation-sample.docx",
    status: "pending-fixture",
    expectedPolicy: "visual-fidelity-first",
    assertions: [
      "policy-visual-fidelity-first",
      "header-visual-risk-nonincrease",
      "indent-failure-cleared-or-improved",
    ],
    notes: "Attach the next user-supplied similar quotation to keep the family-level corpus growing.",
    expectedNotes: ["header visual risk lowered"],
    riskTags: ["header-indent", "fragile-header"],
  },
];
