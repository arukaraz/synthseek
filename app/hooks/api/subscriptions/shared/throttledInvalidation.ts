import type { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

const MIN_INTERVAL_MS = 1000;

interface ThrottleState {
  lastRunAt: number;
  timer: ReturnType<typeof setTimeout> | null;
}

export interface ThrottledInvalidation {
  run: (utils: Utils) => void;
  runNow: (utils: Utils) => void;
}

const states = new Set<ThrottleState>();

export function throttledInvalidation(refetch: (utils: Utils) => void): ThrottledInvalidation {
  const state: ThrottleState = { lastRunAt: 0, timer: null };
  states.add(state);

  return {
    run: (utils) => {
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
    },
    runNow: (utils) => {
      if (state.timer !== null) {
        clearTimeout(state.timer);
        state.timer = null;
      }
      state.lastRunAt = Date.now();
      refetch(utils);
    },
  };
}

export function resetThrottledInvalidations(): void {
  for (const state of states) {
    if (state.timer !== null) clearTimeout(state.timer);
    state.timer = null;
    state.lastRunAt = 0;
  }
}
