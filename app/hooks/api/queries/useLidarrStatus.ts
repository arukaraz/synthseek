import { trpc } from "@utils/trpc";

export function useLidarrStatus(options?: { enabled?: boolean }) {
  return trpc.settings.lidarrStatus.useQuery(undefined, {
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
}
