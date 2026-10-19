import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import type { ClockPeriod } from "./types";

export function useListeningClock(period: ClockPeriod, timeZone: string) {
  return trpc.analytics.listening.clock.useQuery({ period, timeZone }, { placeholderData: keepPreviousData });
}
