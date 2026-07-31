import { trpc } from "@utils/trpc";

export function useDropImportBatch(batchId: string | null) {
  return trpc.import.getBatch.useQuery(
    { batchId: batchId ?? "" },
    {
      enabled: batchId !== null,
      staleTime: 5 * 1000,
    }
  );
}
