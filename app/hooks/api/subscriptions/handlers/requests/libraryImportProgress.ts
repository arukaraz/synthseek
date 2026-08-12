import type { LibraryImportProgressPayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { isForeignJobEvent } from "../../shared/eventOwnership";
import { invalidateLibraryViews } from "../../shared/libraryInvalidation";
import { finalizeDockJob, markDockItem } from "../../shared/progressDock";

type Utils = ReturnType<typeof trpc.useUtils>;

export function handleLibraryImportProgress(
  event: LibraryImportProgressPayload,
  utils: Utils,
  viewerId: string | null
): void {
  const isForeignImport = isForeignJobEvent(event.userId, viewerId);

  if (event.phase === "progress" && event.item) {
    if (!isForeignImport) markDockItem(event.jobId, event.item.key, event.item.state, event.item.reason);
    if (event.item.state === "done") {
      void utils.requests.getAll.invalidate();
      invalidateLibraryViews(utils);
    }
    return;
  }

  if (event.phase === "complete") {
    if (!isForeignImport) finalizeDockJob(event.jobId);
    void utils.requests.getLibrarySummary.invalidate();
    void utils.requests.getAll.invalidate();
    invalidateLibraryViews(utils);
  }
}
