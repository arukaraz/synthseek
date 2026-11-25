import type { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

const DEFAULT_INTERVAL_MS = 1000;

interface ThrottleState {
  lastRunAt: number;
  timer: ReturnType<typeof setTimeout> | null;
  holds: number;
  pending: (() => void) | null;
}

export interface ThrottledInvalidation<Needs = Utils> {
  run: (utils: Needs) => void;
  runNow: (utils: Needs) => void;
  hold: () => () => void;
}

const states = new Set<ThrottleState>();

export function throttledInvalidation<Needs = Utils>(
  refetch: (utils: Needs) => void,
  intervalMs: number = DEFAULT_INTERVAL_MS
): ThrottledInvalidation<Needs> {
  const state: ThrottleState = { lastRunAt: 0, timer: null, holds: 0, pending: null };
  states.add(state);

  const fire = (utils: Needs) => {
    if (state.holds > 0) {
      state.pending = () => fire(utils);
      return;
    }
    state.lastRunAt = Date.now();
    refetch(utils);
  };

  const run = (utils: Needs) => {
    const sinceLastRun = Date.now() - state.lastRunAt;

    if (sinceLastRun >= intervalMs) {
      fire(utils);
      return;
    }

    if (state.timer !== null) return;

    state.timer = setTimeout(() => {
      state.timer = null;
      fire(utils);
    }, intervalMs - sinceLastRun);
  };

  return {
    run,
    runNow: (utils) => {
      if (state.timer !== null) {
        clearTimeout(state.timer);
        state.timer = null;
      }
      fire(utils);
    },
    hold: () => {
      state.holds += 1;
      let released = false;
      return () => {
        if (released) return;
        released = true;
        state.holds -= 1;
        if (state.holds > 0 || state.pending === null) return;
        const pending = state.pending;
        state.pending = null;
        pending();
      };
    },
  };
}

export function resetThrottledInvalidations(): void {
  for (const state of states) {
    if (state.timer !== null) clearTimeout(state.timer);
    state.timer = null;
    state.lastRunAt = 0;
    state.holds = 0;
    state.pending = null;
  }
}
