import { RequestStatus, type SubscriptionEvent } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { useRef } from "react";
import { updateContentCache } from "./updaters/content";

const TERMINAL_STATUSES = new Set<string>([
  RequestStatus.enum.complete,
  RequestStatus.enum.failed,
  RequestStatus.enum.cancelled,
]);

const DEDUP_WINDOW_MS = 1000;
const DEDUP_MAX_ENTRIES = 100;
const MAX_RECONNECT_ATTEMPTS = 3;

export function useRequestSubscription() {
  const utils = trpc.useUtils();
  const reconnectAttemptsRef = useRef(0);
  const lastEventRef = useRef<Map<string, number>>(new Map());

  trpc.requests.onUpdate.useSubscription(undefined, {
    onStarted: () => {
      reconnectAttemptsRef.current = 0;
    },

    onData: (event: SubscriptionEvent) => {
      if (isDuplicate(event, lastEventRef.current)) return;

      updateContentCache(event, utils);

      if (TERMINAL_STATUSES.has(event.status)) {
        utils.requests.getLibrarySummary.invalidate();
      }

      reconnectAttemptsRef.current = 0;
    },

    onError: () => {
      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
        utils.requests.getAll.invalidate();
        reconnectAttemptsRef.current = 0;
      }
    },
  });

  return null;
}

function isDuplicate(event: SubscriptionEvent, cache: Map<string, number>): boolean {
  const key = `${event.requestId}-${event.status}-${event.progress}`;
  const lastTimestamp = cache.get(key);

  if (lastTimestamp && Date.now() - lastTimestamp < DEDUP_WINDOW_MS) {
    return true;
  }

  cache.set(key, Date.now());

  if (cache.size > DEDUP_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  return false;
}
