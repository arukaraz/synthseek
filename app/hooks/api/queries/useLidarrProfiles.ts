import { trpc } from "@utils/trpc";

export function useLidarrProfiles(options?: { enabled?: boolean }) {
  return trpc.lidarr.getProfiles.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
