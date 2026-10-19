import { trpc } from "@utils/trpc";

export function useDiscographyGaps() {
  return trpc.analytics.library.gaps.useQuery();
}
