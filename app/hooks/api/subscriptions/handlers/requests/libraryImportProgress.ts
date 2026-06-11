import type { LibraryImportProgressPayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { finalizeDockJob, markDockItem } from "../../shared/progressDock";

type Utils = ReturnType<typeof trpc.useUtils>;

export function handleLibraryImportProgress(event: LibraryImportProgressPayload, utils: Utils): void {
  if (event.phase === "progress" && event.item) {
    markDockItem(event.jobId, event.item.key, event.item.state, event.item.reason);
    if (event.item.state === "done") void utils.requests.getAll.invalidate();
    return;
  }

  if (event.phase === "complete") {
    finalizeDockJob(event.jobId);
    void utils.requests.getLibrarySummary.invalidate();
    void utils.requests.getAll.invalidate();
  }
}
