import JSZip from "jszip";
import { buildLayoutContext } from "./context";
import { mergeFakeCentredTextLines } from "./passes/mergeFakeCenteredLines";
import { normalizeSnapGridParts } from "./pipelineInternals";
import { pinAllCentresUniversal } from "./passes/pinCenteredParagraphs";
import { fixTitleLine } from "./passes/reconstructTitleBand";
import { relocatePreTableMetadataBlock } from "./passes/relocatePreTableMetadataBlock";
import { normalizePreTableMetaBlock } from "./passes/normalizePreTableMetaBlock";
import { defloatTable } from "./passes/applyFloatingTablePolicy";
import {
  shouldDefloatTable,
  shouldReconstructTitleBand,
  shouldRelocateMetaLineNearTable,
  shouldRunStructuralPasses,
  shouldUseLegacyQuotationCompat,
} from "./policy";
import { createPreprocessChangeReport } from "./qa/report";
import type { PreprocessChangeReport, PreprocessPassDecisions } from "./qa/types";
import { looksLikeSafeStoryXml } from "./xml/safety";

export interface PreprocessWithReportResult {
  output: Buffer;
  report: PreprocessChangeReport | null;
}

async function generateDocx(zip: JSZip): Promise<Buffer> {
  return await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

/**
 * Preprocess a .docx buffer and emit a structured QA report describing whether
 * the header visual-risk signals improved, stayed flat, or worsened.
 */
export async function preprocessQuotationDocxWithReport(
  input: Buffer,
): Promise<PreprocessWithReportResult> {
  try {
    const zip = await JSZip.loadAsync(input);
    const docFile = zip.file("word/document.xml");
    if (!docFile) return { output: input, report: null };

    const originalXml = await docFile.async("string");
    const snapResult = await normalizeSnapGridParts(zip);
    let anyPartChanged = snapResult.anyPartChanged;
    let xml = snapResult.documentXml || originalXml;
    const before = snapResult.documentOriginal || originalXml;
    const afterGrid = xml;
    const initialContext = buildLayoutContext(xml);
    const usedLegacyCompat = shouldUseLegacyQuotationCompat(initialContext.signals);

    const passDecisions: PreprocessPassDecisions = {
      initialPolicy: initialContext.policy,
      finalPolicy: initialContext.policy,
      ranStructuralPasses: false,
      ranTitleBandReconstruction: false,
      ranMetaLineRelocation: false,
      ranPreTableMetaBlockNormalization: false,
      ranDefloatTable: false,
      usedLegacyCompat,
      revertedToGridNormalized: false,
    };

    const finalize = async (finalXml: string, useOriginalOutput = false): Promise<PreprocessWithReportResult> => {
      let output = input;
      if (!useOriginalOutput) {
        zip.file("word/document.xml", finalXml);
        output = await generateDocx(zip);
      }
      const report = createPreprocessChangeReport({
        beforeXml: before,
        afterXml: finalXml,
        outputChanged: anyPartChanged || finalXml !== before,
        passDecisions,
      });
      return { output, report };
    };

    if (!shouldRunStructuralPasses(initialContext.signals)) {
      if (!anyPartChanged && afterGrid === before) {
        return await finalize(before, true);
      }
      return await finalize(afterGrid);
    }

    passDecisions.ranStructuralPasses = true;

    xml = pinAllCentresUniversal(xml);
    xml = mergeFakeCentredTextLines(xml);

    passDecisions.ranTitleBandReconstruction =
      shouldReconstructTitleBand(initialContext.signals) || usedLegacyCompat;
    if (passDecisions.ranTitleBandReconstruction) {
      xml = fixTitleLine(xml);
    }

    passDecisions.ranMetaLineRelocation =
      shouldRelocateMetaLineNearTable(initialContext.signals) || usedLegacyCompat;
    if (passDecisions.ranMetaLineRelocation) {
      xml = relocatePreTableMetadataBlock(xml);
    }

    passDecisions.ranPreTableMetaBlockNormalization =
      initialContext.signals.preTableMetaBlockRisk || initialContext.signals.sharedLeftEdgeMismatch;
    if (passDecisions.ranPreTableMetaBlockNormalization) {
      xml = normalizePreTableMetaBlock(xml);
    }

    const postStructureContext = buildLayoutContext(xml);
    passDecisions.ranDefloatTable = shouldDefloatTable(postStructureContext.policy, postStructureContext.signals);
    if (passDecisions.ranDefloatTable) {
      xml = defloatTable(xml);
    }

    if (!looksLikeSafeStoryXml(xml)) {
      xml = afterGrid;
      passDecisions.revertedToGridNormalized = true;
    }

    passDecisions.finalPolicy = buildLayoutContext(xml).policy;

    if (!anyPartChanged && xml === before) {
      return await finalize(before, true);
    }

    return await finalize(xml);
  } catch {
    return { output: input, report: null };
  }
}

/**
 * Backward-compatible entry point used by the conversion pipeline.
 */
export async function preprocessQuotationDocx(input: Buffer): Promise<Buffer> {
  const { output } = await preprocessQuotationDocxWithReport(input);
  return output;
}
