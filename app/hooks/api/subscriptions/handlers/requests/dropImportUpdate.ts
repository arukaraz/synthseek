import { DropImportFileStatus, type DropImportUpdatePayload } from "@api/__generated__/types";
import { isDropImportBatchInFlight } from "@utils/status-helpers";
import type { trpc } from "@utils/trpc";

import { invalidateLibraryViews, invalidateLibraryViewsNow } from "../../shared/libraryInvalidation";
import { invalidateRequestList, invalidateRequestListNow } from "../../shared/requestListInvalidation";

type Utils = ReturnType<typeof trpc.useUtils>;

const SETTLED_FILE_STATUSES = new Set<DropImportFileStatus>([
  DropImportFileStatus.enum.imported,
  DropImportFileStatus.enum.already_in_library,
]);

function withRow<T extends { id: string }>(rows: T[], row: T, whenNew: "first" | "last"): T[] {
  if (!rows.some((existing) => existing.id === row.id)) return whenNew === "first" ? [row, ...rows] : [...rows, row];
  return rows.map((existing) => (existing.id === row.id ? row : existing));
}

function writeBatch(event: DropImportUpdatePayload, utils: Utils): void {
  const { batch, file } = event;
  utils.import.listBatches.setData(undefined, (old) => (old === undefined ? old : withRow(old, batch, "first")));
  utils.import.getBatch.setData({ batchId: batch.id }, (old) => {
    if (old === undefined) return old;
    return { ...batch, files: file === undefined ? old.files : withRow(old.files, file, "last") };
  });
}

export function handleDropImportUpdate(event: DropImportUpdatePayload, utils: Utils): void {
  writeBatch(event, utils);

  const batchSettled = !isDropImportBatchInFlight(event.batch.status);
  const fileSettled = event.file !== undefined && SETTLED_FILE_STATUSES.has(event.file.status);

  if (batchSettled) {
    invalidateRequestListNow(utils);
    invalidateLibraryViewsNow(utils);
    return;
  }

  if (fileSettled) {
    invalidateRequestList(utils);
    invalidateLibraryViews(utils);
  }
}
