import { trpc } from "@utils/trpc";

export function useAnniversaries() {
  return trpc.analytics.library.anniversaries.useQuery();
}
