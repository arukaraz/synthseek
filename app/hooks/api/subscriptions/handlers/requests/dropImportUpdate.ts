import { DropImportFileStatus, type DropImportUpdatePayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { invalidateLibraryViews } from "../../shared/libraryInvalidation";

type Utils = ReturnType<typeof trpc.useUtils>;

const TERMINAL_BATCH_STATUSES = new Set(["completed", "partial", "failed"]);

export function handleDropImportUpdate(event: DropImportUpdatePayload, utils: Utils): void {
  void utils.import.getBatch.invalidate({ batchId: event.batchId });
  void utils.import.listBatches.invalidate();

  const fileImported = event.file?.status === DropImportFileStatus.enum.imported;
  if (fileImported || TERMINAL_BATCH_STATUSES.has(event.status)) {
    void utils.requests.getAll.invalidate();
    invalidateLibraryViews(utils);
  }
}
