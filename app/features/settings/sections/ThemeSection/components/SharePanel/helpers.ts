import { exportDocument } from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";
import { collectionFilename } from "@utils/filename";

import { EXPORT_EXTENSION, EXPORT_FALLBACK_NAME, IMPORT_MAX_BYTES } from "./constants";

export function exportText(draft: ThemeDraft, includeFreeCss: boolean): string {
  return JSON.stringify(exportDocument(draft, { includeFreeCss }), null, 2);
}

export function exportFilename(name: string): string {
  return collectionFilename(name.trim() === "" ? EXPORT_FALLBACK_NAME : name, EXPORT_EXTENSION);
}

export function isImportTooLarge(bytes: number): boolean {
  return bytes > IMPORT_MAX_BYTES;
}
