import { trpc } from "@utils/trpc";

export function useLibrarySources(enabled = true) {
  return trpc.librarySource.provider.all.useQuery(undefined, {
    enabled,
    staleTime: 30 * 1000,
  });
}
