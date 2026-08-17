import type { trpc } from "@utils/trpc";

import { invalidateLibraryViews } from "./libraryInvalidation";
import { invalidateRequestListNow } from "./requestListInvalidation";

type Utils = ReturnType<typeof trpc.useUtils>;

export function resyncPushFedQueries(utils: Utils): void {
  invalidateRequestListNow(utils);
  void utils.requests.getLibrarySummary.invalidate();
  void utils.requests.getPlexSyncAllItems.invalidate();
  void utils.requests.getPlexSyncAllState.invalidate();
  void utils.settings.get.invalidate();
  void utils.import.listBatches.invalidate();
  void utils.import.getBatch.invalidate();
  invalidateLibraryViews(utils);
}
