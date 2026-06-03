import { trpc } from "@utils/trpc";

export function useSlskdStatus(options?: { enabled?: boolean }) {
  return trpc.settings.slskdStatus.useQuery(undefined, {
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
}
