import { useEffect, useRef } from "react";

import { trpc } from "@utils/trpc";

const RUNNING_REFETCH_MS = 8000;
const IDLE_REFETCH_MS = 30000;

export function useLibraryOrganiseStatus() {
  const utils = trpc.useUtils();
  const wasRunning = useRef(false);
  const query = trpc.library.organise.status.useQuery(undefined, {
    staleTime: 0,
    refetchInterval: (query) => (query.state.data?.running ? RUNNING_REFETCH_MS : IDLE_REFETCH_MS),
  });

  const running = query.data?.running === true;

  useEffect(() => {
    if (wasRunning.current && !running) {
      utils.library.naming.preview.invalidate();
      utils.library.naming.moves.invalidate();
      utils.library.organise.preview.invalidate();
    }
    wasRunning.current = running;
  }, [running, utils]);

  return query;
}
