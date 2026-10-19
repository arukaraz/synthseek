import { trpc } from "@utils/trpc";

export function useRecentPlays(enabled: boolean) {
  return trpc.analytics.listening.recentPlays.useQuery(undefined, { enabled });
}
