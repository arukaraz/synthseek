import type { DropImportBatch, DropImportFile } from "./types";

export function stripExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function defaultMatchQuery(file: DropImportFile): string {
  if (file.tag_artist && file.tag_title) return `${file.tag_artist} ${file.tag_title}`;
  if (file.tag_title) return file.tag_title;
  return stripExtension(file.original_name);
}

export function fileDisplayTags(file: DropImportFile): string | null {
  if (file.tag_artist && file.tag_title) return `${file.tag_artist} - ${file.tag_title}`;
  if (file.tag_title) return file.tag_title;
  return null;
}

export function batchProcessedCount(batch: DropImportBatch): number {
  return batch.imported_files + batch.pending_files + batch.failed_files + batch.discarded_files;
}

export function batchProgressPercent(batch: DropImportBatch): number {
  if (batch.total_files === 0) return 0;
  return Math.round((batchProcessedCount(batch) / batch.total_files) * 100);
}
