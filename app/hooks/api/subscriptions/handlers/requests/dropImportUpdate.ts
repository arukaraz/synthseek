import { DropImportFileStatus, type DropImportUpdatePayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { invalidateLibraryViews } from "../../shared/libraryInvalidation";

type Utils = ReturnType<typeof trpc.useUtils>;

const TERMINAL_BATCH_STATUSES = new Set(["completed", "partial", "failed"]);

const SETTLED_FILE_STATUSES = new Set<DropImportFileStatus>([
  DropImportFileStatus.enum.imported,
  DropImportFileStatus.enum.already_in_library,
]);

export function handleDropImportUpdate(event: DropImportUpdatePayload, utils: Utils): void {
  void utils.import.getBatch.invalidate({ batchId: event.batchId });
  void utils.import.listBatches.invalidate();

  const fileSettled = event.file !== undefined && SETTLED_FILE_STATUSES.has(event.file.status);
  if (fileSettled || TERMINAL_BATCH_STATUSES.has(event.status)) {
    void utils.requests.getAll.invalidate();
    invalidateLibraryViews(utils);
  }
}
