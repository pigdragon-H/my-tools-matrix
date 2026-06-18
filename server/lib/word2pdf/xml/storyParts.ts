import type JSZip from "jszip";
import { SNAP_GRID_PART_RE } from "../constants";

/** Return the OOXML story parts that can safely receive snapToGrid normalisation. */
export function listSnapGridPartPaths(zip: JSZip): string[] {
  return Object.keys(zip.files)
    .filter((path) => SNAP_GRID_PART_RE.test(path))
    .sort();
}
