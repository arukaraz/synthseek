import { trpc } from "@utils/trpc";

export function useQualityMix() {
  return trpc.analytics.library.quality.useQuery();
}
