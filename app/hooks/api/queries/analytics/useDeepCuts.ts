import { trpc } from "@utils/trpc";

export function useDeepCuts() {
  return trpc.analytics.listening.deepCuts.useQuery();
}
