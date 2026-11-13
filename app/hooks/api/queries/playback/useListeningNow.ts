import { trpc } from "@utils/trpc";
import { useEffect } from "react";

import { LISTENING_NOW_END_MARGIN_MS } from "./constants";
import { soonestListeningEnd } from "./helpers";

export function useListeningNow() {
  const utils = trpc.useUtils();
  const query = trpc.playback.listeningNow.useQuery();
  const { dataUpdatedAt } = query;
  const remainingMs = soonestListeningEnd(query.data);

  useEffect(() => {
    if (remainingMs === null) return;
    const delay = Math.max(0, dataUpdatedAt + remainingMs - Date.now()) + LISTENING_NOW_END_MARGIN_MS;
    const timer = window.setTimeout(() => void utils.playback.listeningNow.invalidate(), delay);
    return () => window.clearTimeout(timer);
  }, [dataUpdatedAt, remainingMs, utils]);

  return query;
}
