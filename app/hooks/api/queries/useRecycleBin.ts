import { trpc } from "@utils/trpc";

export function useRecycleBinStatus() {
  return trpc.settings.recycleBin.status.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}
