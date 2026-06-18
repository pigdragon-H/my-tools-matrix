import JSZip from "jszip";
import { hasFakeCentredContent } from "./detectors/hasFakeCenterRisk";
import { hasFloatingTableRisk } from "./detectors/hasFloatingTableRisk";
import { hasQuotationMetaHeaderLine } from "./detectors/hasQuotationMetaHeaderLine";
import { mergeFakeCentredTextLines } from "./passes/mergeFakeCenteredLines";
import { normalizeSnapGridParts } from "./pipelineInternals";
import { pinAllCentresUniversal } from "./passes/pinCenteredParagraphs";
import { fixTitleLine } from "./passes/reconstructTitleBand";
import { moveAttnAboveTable } from "./passes/relocateMetaLineNearTable";
import { defloatTable } from "./passes/applyFloatingTablePolicy";
import { looksLikeSafeStoryXml } from "./xml/safety";

/**
 * Preprocess a .docx buffer. Returns a (possibly modified) .docx buffer.
 * Never throws — on any error it returns the original input untouched.
 */
export async function preprocessQuotationDocx(input: Buffer): Promise<Buffer> {
  try {
    const zip = await JSZip.loadAsync(input);
    const docFile = zip.file("word/document.xml");
    if (!docFile) return input;

    const snapResult = await normalizeSnapGridParts(zip);
    let anyPartChanged = snapResult.anyPartChanged;
    let xml = snapResult.documentXml;
    let before = snapResult.documentOriginal;

    if (!xml) {
      xml = await docFile.async("string");
      before = xml;
    }

    const afterGrid = xml;

    if (!hasFakeCentredContent(xml) && !hasFloatingTableRisk(xml)) {
      if (!anyPartChanged && afterGrid === before) return input;
      zip.file("word/document.xml", afterGrid);
      return await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
    }

    xml = pinAllCentresUniversal(xml);
    xml = mergeFakeCentredTextLines(xml);
    xml = fixTitleLine(xml);
    xml = moveAttnAboveTable(xml);
    if (!hasQuotationMetaHeaderLine(xml)) {
      xml = defloatTable(xml);
    }

    if (!looksLikeSafeStoryXml(xml)) {
      xml = afterGrid;
    }

    if (!anyPartChanged && xml === before) return input;

    zip.file("word/document.xml", xml);
    const out = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    return out;
  } catch {
    return input;
  }
}
