import { trpc } from "@utils/trpc";

export function usePublicConfig() {
  return trpc.settings.getPublicConfig.useQuery(undefined, {
    staleTime: 60 * 1000,
  });
}
