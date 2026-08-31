import { trpc } from "@utils/trpc";

const ACTIVE_REFETCH_MS = 8000;
const IDLE_REFETCH_MS = 60000;
const UNLINKED_PREVIEW_LIMIT = 5;

export function useLibraryScanStatus() {
  return trpc.library.scan.status.useQuery(undefined, {
    staleTime: 0,
    refetchInterval: (query) => (query.state.data?.activeRun ? ACTIVE_REFETCH_MS : IDLE_REFETCH_MS),
  });
}

export function useUnlinkedLibraryFiles(enabled: boolean) {
  return trpc.library.scan.unlinkedFiles.useQuery({ limit: UNLINKED_PREVIEW_LIMIT }, { enabled, staleTime: 30 * 1000 });
}
