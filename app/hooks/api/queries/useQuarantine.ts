import { trpc } from "@utils/trpc";

export function useQuarantineList(options?: { enabled?: boolean }) {
  return trpc.settings.quarantine.list.useQuery(undefined, {
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
}
