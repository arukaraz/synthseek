import { trpc } from "@utils/trpc";

export function useDiscoveryConfig() {
  return trpc.discovery.getConfig.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}
