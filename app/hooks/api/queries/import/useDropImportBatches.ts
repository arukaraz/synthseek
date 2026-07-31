import { trpc } from "@utils/trpc";

export function useDropImportBatches(options?: { enabled?: boolean }) {
  return trpc.import.listBatches.useQuery(undefined, {
    enabled: options?.enabled ?? true,
    staleTime: 15 * 1000,
  });
}
