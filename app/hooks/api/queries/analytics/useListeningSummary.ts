import { trpc } from "@utils/trpc";

export function useListeningSummary() {
  return trpc.analytics.listening.summary.useQuery();
}
