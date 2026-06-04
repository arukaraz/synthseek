import { trpc } from "@utils/trpc";

export function useLidarrTags(options?: { enabled?: boolean }) {
  return trpc.lidarr.listTags.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
