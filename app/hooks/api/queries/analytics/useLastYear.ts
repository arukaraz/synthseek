import { trpc } from "@utils/trpc";

export function useLastYear() {
  return trpc.analytics.listening.lastYear.useQuery();
}
