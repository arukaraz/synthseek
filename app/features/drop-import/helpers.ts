import type { CollisionQuality, DropImportBatch, DropImportFile } from "./types";

function kilohertz(sampleRate: number): string {
  return String(Number((sampleRate / 1000).toFixed(1)));
}

export function collisionQualityLabel(quality: CollisionQuality): string {
  const format = quality.format.toUpperCase();
  if (quality.lossless && quality.bitsPerSample !== null && quality.sampleRate !== null) {
    return `${format} ${quality.bitsPerSample}/${kilohertz(quality.sampleRate)}`;
  }
  if (!quality.lossless && quality.bitrateKbps !== null) return `${format} ${quality.bitrateKbps} kbps`;
  return format;
}

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
  return (
    batch.imported_files +
    batch.already_in_library_files +
    batch.pending_files +
    batch.failed_files +
    batch.discarded_files
  );
}

export function batchProgressPercent(batch: DropImportBatch): number {
  if (batch.total_files === 0) return 0;
  return Math.round((batchProcessedCount(batch) / batch.total_files) * 100);
}
