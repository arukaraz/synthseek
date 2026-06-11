import type { LibraryImportProgressPayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { markDockItem, setDockJobStatus, terminalStatusFromCounts } from "../../shared/progressDock";

type Utils = ReturnType<typeof trpc.useUtils>;

export function handleLibraryImportProgress(event: LibraryImportProgressPayload, utils: Utils): void {
  if (event.phase === "progress" && event.item) {
    markDockItem(event.jobId, event.item.key, event.item.state);
    return;
  }

  if (event.phase === "complete") {
    setDockJobStatus(event.jobId, terminalStatusFromCounts(event.imported, event.failed));
    void utils.requests.getLibrarySummary.invalidate();
    void utils.requests.getAll.invalidate();
  }
}
