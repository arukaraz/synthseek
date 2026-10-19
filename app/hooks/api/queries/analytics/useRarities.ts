import { trpc } from "@utils/trpc";

export function useRarities() {
  return trpc.analytics.discover.rarities.useQuery();
}
