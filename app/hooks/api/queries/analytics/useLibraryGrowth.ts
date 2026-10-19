import { trpc } from "@utils/trpc";

export function useLibraryGrowth() {
  return trpc.analytics.library.growth.useQuery();
}
