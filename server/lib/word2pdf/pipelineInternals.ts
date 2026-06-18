import type JSZip from "jszip";
import { safeDisableSnapToGrid } from "./passes/normalizeSnapGrid";
import { listSnapGridPartPaths } from "./xml/storyParts";

export interface SnapGridNormalizationResult {
  anyPartChanged: boolean;
  documentXml: string;
  documentOriginal: string;
}

export async function normalizeSnapGridParts(zip: JSZip): Promise<SnapGridNormalizationResult> {
  let anyPartChanged = false;
  let xml = "";
  let before = "";

  for (const path of listSnapGridPartPaths(zip)) {
    const part = zip.file(path);
    if (!part) continue;
    const original = await part.async("string");
    const normalized = safeDisableSnapToGrid(original);
    if (normalized !== original) {
      zip.file(path, normalized);
      anyPartChanged = true;
    }
    if (path === "word/document.xml") {
      xml = normalized;
      before = original;
    }
  }

  return {
    anyPartChanged,
    documentXml: xml,
    documentOriginal: before,
  };
}
