import { trpc } from "@utils/trpc";

export function useLidarrAvailable(options?: { enabled?: boolean }) {
  return trpc.lidarr.available.useQuery(undefined, {
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
