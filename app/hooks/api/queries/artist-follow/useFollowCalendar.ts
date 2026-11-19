import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import type { FollowCalendarInput } from "./types";

export function useFollowCalendar(input: FollowCalendarInput, enabled = true) {
  return trpc.artistFollow.calendar.useQuery(input, { enabled, placeholderData: keepPreviousData });
}
