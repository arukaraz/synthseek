import { isDropImportBatchInFlight } from "@utils/status-helpers";
import { trpc } from "@utils/trpc";

import { DROP_IMPORT_POLL_INTERVAL } from "./constants";

export function useDropImportBatches(options?: { enabled?: boolean }) {
  return trpc.import.listBatches.useQuery(undefined, {
    enabled: options?.enabled ?? true,
    staleTime: 15 * 1000,
    refetchInterval: (query) => {
      const hasInFlight = query.state.data?.some((batch) => isDropImportBatchInFlight(batch.status)) ?? false;
      return hasInFlight ? DROP_IMPORT_POLL_INTERVAL : false;
    },
  });
}
