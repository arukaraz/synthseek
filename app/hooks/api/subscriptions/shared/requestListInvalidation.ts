import type { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

const MIN_INTERVAL_MS = 1000;

interface ThrottleState {
  lastRunAt: number;
  timer: ReturnType<typeof setTimeout> | null;
}

const state: ThrottleState = { lastRunAt: 0, timer: null };

function refetch(utils: Utils): void {
  void utils.requests.getAll.invalidate();
  void utils.requests.getRecentTracks.invalidate();
  void utils.requests.getDetail.invalidate();
}

export function invalidateRequestList(utils: Utils): void {
  const now = Date.now();
  const sinceLastRun = now - state.lastRunAt;

  if (sinceLastRun >= MIN_INTERVAL_MS) {
    state.lastRunAt = now;
    refetch(utils);
    return;
  }

  if (state.timer !== null) return;

  state.timer = setTimeout(() => {
    state.lastRunAt = Date.now();
    state.timer = null;
    refetch(utils);
  }, MIN_INTERVAL_MS - sinceLastRun);
}

export function invalidateRequestListNow(utils: Utils): void {
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  state.lastRunAt = Date.now();
  refetch(utils);
}

export function resetRequestListInvalidation(): void {
  if (state.timer !== null) clearTimeout(state.timer);
  state.timer = null;
  state.lastRunAt = 0;
}
