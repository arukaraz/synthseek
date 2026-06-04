import { trpc } from "@utils/trpc";

export function useDownloadSourcesAvailability(options?: { enabled?: boolean }) {
  return trpc.settings.downloadSourcesAvailability.useQuery(undefined, {
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
}
