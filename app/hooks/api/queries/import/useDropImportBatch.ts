import { isDropImportBatchInFlight } from "@utils/status-helpers";
import { trpc } from "@utils/trpc";

import { DROP_IMPORT_POLL_INTERVAL } from "./constants";

export function useDropImportBatch(batchId: string | null) {
  return trpc.import.getBatch.useQuery(
    { batchId: batchId ?? "" },
    {
      enabled: batchId !== null,
      staleTime: 5 * 1000,
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === undefined || !isDropImportBatchInFlight(status)) return false;
        return DROP_IMPORT_POLL_INTERVAL;
      },
    }
  );
}
