import { trpc } from "@utils/trpc";

export function useRecycleBinStatus() {
  return trpc.settings.recycleBin.status.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}

export function useRecycleBinEntries(enabled: boolean) {
  return trpc.settings.recycleBin.list.useQuery(undefined, {
    enabled,
    staleTime: 30 * 1000,
  });
}
